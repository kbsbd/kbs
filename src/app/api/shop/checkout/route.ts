import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { createAuthClient } from "@/lib/supabase/auth";
import { sendMail } from "@/lib/mail";
import { seed } from "@/content/seed";
import { shippingFor } from "@/components/shop/checkout-math";

/**
 * Turns a cart into either an order or a quote request. Prices, names and stock
 * are read fresh from the database here — the client only sends product ids and
 * quantities. The online gateways (bKash / Nagad / SSLCommerz) are not wired to
 * charge yet: the order is placed unpaid/pending and the team follows up with
 * payment details, so every order still collects a delivery address.
 */

export const runtime = "nodejs";

type InItem = { id: string; qty: number };

const MAX = { name: 120, email: 160, phone: 32, address: 600, notes: 1000 };

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const mode = String(body.mode ?? "quote");
  const customer = (body.customer ?? {}) as Record<string, unknown>;
  const name = String(customer.name ?? "").trim().slice(0, MAX.name);
  const email = String(customer.email ?? "").trim().slice(0, MAX.email);
  const phone = String(customer.phone ?? "").trim().slice(0, MAX.phone);
  const address = String(customer.address ?? "").trim().slice(0, MAX.address);
  const company = String(customer.company ?? "").trim().slice(0, 160);
  const notes = String(body.notes ?? "").trim().slice(0, MAX.notes);
  const rawItems = Array.isArray(body.items) ? (body.items as InItem[]) : [];

  if (name.length < 2) return NextResponse.json({ error: "name required" }, { status: 422 });
  if (!/^[+\d][\d\s\-()]{6,}$/.test(phone))
    return NextResponse.json({ error: "phone required" }, { status: 422 });
  // every order gets physically delivered, so all of them need an address;
  // a quote is only an enquiry, so there it is optional
  if (mode !== "quote" && address.length < 8)
    return NextResponse.json({ error: "A delivery address is required." }, { status: 422 });

  const wanted = new Map<string, number>();
  for (const it of rawItems) {
    const id = String(it?.id ?? "");
    const qty = Math.max(1, Math.min(999, Math.round(Number(it?.qty) || 0)));
    if (id) wanted.set(id, (wanted.get(id) ?? 0) + qty);
  }
  if (wanted.size === 0)
    return NextResponse.json({ error: "cart is empty" }, { status: 422 });

  if (!["quote", "cod", "bkash", "nagad", "sslcommerz"].includes(mode))
    return NextResponse.json({ error: "unknown checkout mode" }, { status: 422 });

  const supabase = createAdminClient();
  if (!supabase)
    return NextResponse.json({ error: "store is not available" }, { status: 503 });

  // the method must be one the admin has switched on
  const { data: gw } = await supabase
    .from("payment_gateways")
    .select("id")
    .eq("id", mode)
    .eq("enabled", true)
    .maybeSingle();
  if (!gw) {
    return NextResponse.json(
      { error: "That payment method is not available. Please choose another." },
      { status: 409 }
    );
  }

  // link to the signed-in customer, if there is one
  const authed = await createAuthClient();
  const userId = authed ? (await authed.auth.getUser()).data.user?.id ?? null : null;

  // fresh product data — never trust the client's prices
  const { data: rows, error: fetchErr } = await supabase
    .from("products")
    .select("id, name, price, stock, track_stock, status")
    .in("id", [...wanted.keys()]);

  if (fetchErr) {
    console.error("[checkout] product fetch:", fetchErr.message);
    return NextResponse.json({ error: "could not read the cart" }, { status: 500 });
  }

  const lines: Array<{ product_id: string; name: string; price: number; qty: number; line_total: number }> = [];
  for (const [id, qty] of wanted) {
    const p = (rows ?? []).find((r) => r.id === id);
    if (!p || p.status !== "active")
      return NextResponse.json({ error: "a product in your cart is no longer available" }, { status: 409 });
    if (p.track_stock && p.stock < qty)
      return NextResponse.json(
        { error: `Not enough stock for ${p.name}.`, product: id, available: p.stock },
        { status: 409 }
      );
    const price = Number(p.price);
    lines.push({ product_id: id, name: p.name, price, qty, line_total: price * qty });
  }

  const subtotal = lines.reduce((n, l) => n + l.line_total, 0);
  const shipping =
    mode === "cod"
      ? shippingFor(subtotal, seed.shop.flatShipping, seed.shop.freeShippingOver)
      : 0;
  const total = subtotal + shipping;

  const itemLines = lines.map((l) => `  ${l.qty} × ${l.name} — ${l.line_total}`).join("\n");

  // ---- quote request ---------------------------------------------------
  if (mode === "quote") {
    const { data, error } = await supabase
      .from("quote_requests")
      .insert({
        user_id: userId,
        name,
        email,
        phone,
        company,
        address,
        message: notes,
        items: lines.map((l) => ({ product_id: l.product_id, name: l.name, qty: l.qty, price: l.price })),
      })
      .select("id")
      .single();
    if (error) {
      console.error("[checkout] quote insert:", error.message);
      return NextResponse.json({ error: "could not send the request" }, { status: 500 });
    }
    await sendMail({
      subject: `[KBS quote request] ${name}`,
      replyTo: email || undefined,
      text: [
        `Name:    ${name}`,
        `Company: ${company || "—"}`,
        `Email:   ${email || "—"}`,
        `Phone:   ${phone}`,
        `Address: ${address || "—"}`,
        "",
        "Items:",
        itemLines,
        "",
        `Approx subtotal: ${subtotal}`,
        notes ? `\nNote: ${notes}` : "",
      ].join("\n"),
    });
    return NextResponse.json({ ok: true, mode, ref: data.id, kind: "quote" });
  }

  // ---- an order (cash on delivery, or an online method) --------------
  // The online gateways are not wired to charge yet: the order is placed
  // unpaid and pending, and the team follows up with payment details. Once a
  // gateway is implemented this branch hands off to its redirect flow instead.
  const online = mode === "bkash" || mode === "nagad" || mode === "sslcommerz";

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      status: "pending",
      payment_status: "unpaid",
      payment_method: mode,
      currency: "BDT",
      subtotal,
      shipping,
      total,
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      shipping_address: address,
      notes,
    })
    .select("id, order_number")
    .single();

  if (orderErr || !order) {
    console.error("[checkout] order insert:", orderErr?.message);
    return NextResponse.json({ error: "could not place the order" }, { status: 500 });
  }

  const { error: itemsErr } = await supabase
    .from("order_items")
    .insert(lines.map((l) => ({ ...l, order_id: order.id })));
  if (itemsErr) {
    console.error("[checkout] order items:", itemsErr.message);
  }

  // best-effort stock decrement
  for (const l of lines) {
    const p = (rows ?? []).find((r) => r.id === l.product_id);
    if (p?.track_stock) {
      await supabase
        .from("products")
        .update({ stock: Math.max(0, p.stock - l.qty) })
        .eq("id", l.product_id);
    }
  }

  await sendMail({
    subject: `[KBS order ${order.order_number}] ${name}`,
    replyTo: email || undefined,
    text: [
      `Order:   ${order.order_number}  (${mode.toUpperCase()}${online ? " — follow up for payment" : ""})`,
      `Name:    ${name}`,
      `Phone:   ${phone}`,
      `Email:   ${email || "—"}`,
      `Address: ${address}`,
      "",
      "Items:",
      itemLines,
      "",
      `Subtotal: ${subtotal}`,
      `Delivery: ${shipping}`,
      `Total:    ${total}`,
      notes ? `\nNote: ${notes}` : "",
    ].join("\n"),
  });

  return NextResponse.json({
    ok: true,
    mode,
    kind: "order",
    followUp: online,
    orderNumber: order.order_number,
    ref: order.id,
  });
}
