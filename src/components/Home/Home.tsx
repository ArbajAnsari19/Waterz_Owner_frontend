import React from "react";
import styles from "../../styles/Home/Home.module.css"
import hh3 from "../../assets/Home/hh3.svg";
import 'swiper/swiper-bundle.css';
import SolutionCard from "../Layouts/SolutionCard";
import { Link } from "react-router-dom";

const solutionData = [
  {
    id: "solution-1",
    heading: "Access a Wide Audience",
    subheading: "Reach a large network of verified renters actively looking for quality yachts.",
  },
  {
    id: "solution-2",
    heading: "Simple Listing Process",
    subheading: "Our user-friendly platform makes it easy to showcase your yacht with photos, descriptions, and availability details.",
  },
  {
    id: "solution-3",
    heading: "Secure Transactions",
    subheading: " We ensure safe and reliable payment handling, so you get paid on time without worries.",
  },
  {
    id: "solution-4",
    heading: "Complete Control",
    subheading: "Decide your own rental prices, set availability, and define terms that suit you best.",
  },
  {
    id: "solution-5",
    heading: "Effortless Management",
    subheading: "Track bookings, communicate with renters, and manage your yacht rentals all in one place.",
  },
  {
    id: "solution-6",
    heading: "Dedicated Customer Support",
    subheading: "Access 24/7 customer support for any inquiries or assistance during your trip.",
  },
];
  

const Home: React.FC = () => {
    // const { yachts, loading } = useTopYachts();

    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    return(
        <div className={styles.comp_body}>
            <div className={styles.hero_body}>
              <div className={styles.hero_left}>
                <div className={styles.hero_head}>
                  Turn Your Yacht into an Income Stream
                </div>
                <div className={styles.hero_subhead}>
                  List your yacht effortlessly and connect with renters seeking exclusive experiences. Maximize your yacht's potential while sharing the joy of sailing.
                </div>
                <Link to="/yatch-form">
                  <div className={styles.hero_btn}>
                    Charter Now
                  </div>
                </Link>
              </div>
              <div className={styles.hero_right}>
              {/* <div className={styles.hero_box1}>
                <div className={styles.hero_imgbox}>
                    <img src={hh1} className={styles.hh} />
                </div>
                <div className={styles.hero_imgbox}>
                  <img src={hh2} className={styles.hh} />
                </div>
              </div> */}
              <div className={styles.hero_box2}>
                <img src={hh3} className={styles.hh2} />
              </div>
              </div>
            </div>
            <div className={styles.yatchBox}>
              <div className={styles.section_head2}>
                Effortless Distribution
              </div>
              <div className={styles.section_head}>
                Seamless Yacht Distribution Solutions
              </div>
              <div className={styles.gridBox}>
                {solutionData.map((solution) => (
                  <SolutionCard
                    key={solution.id}
                    heading={solution.heading}
                    subheading={solution.subheading}
                  />
                ))}
              </div>
            </div>  
            {/* <div className={styles.yatchBox}>
                <div className={styles.section_head}>
                   Yacht Near You
                </div>
                <div className={styles.yatch_slider}>
                <Swiper
                  spaceBetween={10}
                  slidesPerView={3.2}
                  pagination={{ clickable: true }}
                  style={{ padding: "20px 0", width:"100%" }}
                >
                  {yachts.map((yacht) => (
                    <SwiperSlide key={yacht._id}>
                      <YachtCard
                        key={yacht._id}
                        yacht={yacht}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
                </div>
            </div>           */}
        </div>
    )
}

export default Home;