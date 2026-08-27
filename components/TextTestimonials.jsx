import Carousel from "./Carousel";
import styles from "./TextTestimonials.module.css";

export default function TextTestimonials({ heading, reviews }) {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.heading}>{heading}</h2>

        <Carousel ariaLabel="Customer reviews">
          {reviews.map((review) => (
            <div key={review.name} className={styles.card}>
              <div className={styles.stars} aria-label="5 out of 5 stars">
                {"★★★★★"}
              </div>
              <p className={styles.text}>&ldquo;{review.text}&rdquo;</p>
              <div className={styles.profile}>
                <div className={styles.avatar} aria-hidden="true">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <p className={styles.name}>{review.name}</p>
                  <p className={styles.role}>{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
