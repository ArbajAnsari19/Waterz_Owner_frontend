import React, { useState, useEffect } from "react";
import styles from "../../styles/Booking/Booking.module.css"
import Y1 from "../../assets/Yatch/Y1.svg"
import BookedCard from "../Layouts/BookedCard";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import { GoMultiSelect } from "react-icons/go";
import { ownerAPI } from "../../api/owner";
import { ownerBookingAPI } from "../../api/booking";
import { EarningsAnalytics } from "../../api/booking";
import { BiSad } from 'react-icons/bi';
import { Yacht } from "../../types/yachts";
import EarningCard from "../Layouts/EarningCard";
import MyYacht from "../Layouts/MyYacht";
import { setLoading } from "../../redux/slices/loadingSlice";
import { useAppDispatch } from "../../redux/store/hook";

interface YachtResponse {
  yachts: Yacht[];
}

interface BookingType {
    _id: string;
    name: string;
    capacity: number;
    startDate: string;
    images: string[];
  }

const Booking: React.FC = () => {
    const dispatch = useAppDispatch();
    const [currentBookings, setCurrentBookings] = useState<BookingType[]>([]);
    const [previousBookings, setPreviousBookings] = useState<BookingType[]>([]);
    const [myYachts, setMyYachts] = useState<Yacht[]>([]);
    const [, setError] = useState<string | null>(null);
    const [isTotalEarning, setIsTotalEarning] = useState(true);
    const [earnings, setEarnings] = useState<EarningsAnalytics>({
        sevenDaysEarnings: 0,
        thirtyDaysEarnings: 0,
        totalEarnings: 0,
        sevenDaysBookings: [],
        thirtyDaysBookings: [],
        allBookings: []
    });

    // Function to fetch and set yacht data
    const fetchYachtData = async () => {
        try {
          // @ts-ignore
            const data: YachtResponse = await ownerAPI.getOwnerYachts();
            console.log('Yachts:', Array.isArray(data.yachts)); 
            if (Array.isArray(data.yachts)) {
                setMyYachts(
                    data.yachts.map(yacht => ({
                        ...yacht,
                        images: yacht.images || [],
                        name: yacht.name || '',
                        capacity: yacht.capacity || 0,
                    }))
                );
            }
        } catch (error) {
            console.error("Error fetching yacht data:", error);
            setError('Failed to fetch yacht data');
        }
    };

    // Function to fetch and set earnings data
    const fetchEarningsData = async () => {
        try {
            const earningsData = await ownerBookingAPI.getEarnings();
            setEarnings(earningsData);
        } catch (error) {
            console.error("Error fetching earnings data:", error);
            setError('Failed to fetch earnings data');
        }
    };

    // Function to fetch and set current bookings
    const fetchCurrentBookings = async () => {
        try {
            const response = await ownerBookingAPI.getCurrentBookings();
            console.log("response", response)
            // @ts-ignore
            const currents =  response.ownerCurrentRides
            console.log("current", currents)
            console.log("isArray", Array.isArray(currents))
            if (!Array.isArray(currents)) return;

            const currentWithDetails = await Promise.all(
                currents.map(async (booking) => {
                    if (!booking.yachtId) return booking;
                    try {
                        const yachtDetails = await ownerBookingAPI.getYachtDetails(booking.yachtId);
                        return {
                            ...booking,
                            yacht: {
                                ...yachtDetails,
                                name: yachtDetails.name || '',
                                capacity: yachtDetails.capacity || 0,
                                startingPrice: yachtDetails.startingPrice || '',
                                images: yachtDetails.images || []
                            }
                        };
                    } catch (error) {
                        console.error(`Error fetching details for yacht ${booking.yachtId}:`, error);
                        return booking;
                    }
                })
            );
            setCurrentBookings(currentWithDetails);
        } catch (error) {
            console.error("Error fetching current bookings:", error);
            setError('Failed to fetch current bookings');
        }
    };

    // Function to fetch and set previous bookings
    const fetchPreviousBookings = async () => {
        try {
            const response = await ownerBookingAPI.getPreviousBookings();
            // @ts-ignore
            const previous = response.ownerPrevRides
            if (!Array.isArray(previous)) return;

            const previousWithDetails = await Promise.all(
                previous.map(async (booking) => {
                    if (!booking.yachtId) return booking;
                    try {
                        const yachtDetails = await ownerBookingAPI.getYachtDetails(booking.yachtId);
                        return {
                            ...booking,
                            yacht: {
                                ...yachtDetails,
                                name: yachtDetails.name || '',
                                capacity: yachtDetails.capacity || 0,
                                startingPrice: yachtDetails.startingPrice || '',
                                images: yachtDetails.images || []
                            }
                        };
                    } catch (error) {
                        console.error(`Error fetching details for yacht ${booking.yachtId}:`, error);
                        return booking;
                    }
                })
            );
            setPreviousBookings(previousWithDetails);
        } catch (error) {
            console.error("Error fetching previous bookings:", error);
            setError('Failed to fetch previous bookings');
        }
    };

    useEffect(() => {
        const fetchAllData = async () => {
            dispatch(setLoading(true));
            try {
                // Execute all fetch functions
                await Promise.all([
                    fetchYachtData(),
                    fetchEarningsData(),
                    fetchCurrentBookings(),
                    fetchPreviousBookings()
                ]);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError('Failed to fetch data');
            } finally {
              dispatch(setLoading(false));
            }
        };

        fetchAllData();
    }, []);

    const NoBookingsMessage = ({ type }: { type: string }) => (
        <div className={styles.noBookings}>
            <p>No {type} bookings available</p>
        </div>
    );

    const NoEarningsMessage = () => (
        <div className={styles.noEarnings}>
            <BiSad size={50} color="#666" />
            <p>No earnings yet</p>
        </div>
    );

    const handleTotalEarning = () => {
        setIsTotalEarning(!isTotalEarning);
    }

    return (
        <div className={styles.comp_body}>
            <div className={styles.yatchBox}>
                <div className={styles.section_head}>My Yacht</div>
                <div className={styles.yatch_slider}>
                    <Swiper
                        spaceBetween={50}
                        slidesPerView="auto"
                        pagination={{ clickable: true }}
                        style={{ 
                          padding: "20px 0", 
                          width: "100%",
                        }}
                        breakpoints={{
                          320: {
                            slidesPerView: "auto",
                            spaceBetween: 10
                          },
                          480: {
                            slidesPerView: "auto",
                            spaceBetween: 15
                          },
                          768: {
                            slidesPerView: "auto",
                            spaceBetween: 20
                          },
                          1024: {
                            slidesPerView: "auto",
                            spaceBetween: 40
                          }
                        }}
                      >
                      {myYachts.map((yacht) => (
                          <SwiperSlide key={yacht._id} className={styles.swiper_slide}>
                              <MyYacht
                                  name={yacht.name}
                                  imageUrl={yacht.images?.[0]}
                                  yachtId={yacht._id}
                              />
                          </SwiperSlide>
                      ))}
                    </Swiper>
                </div>
            </div>
            <div className={styles.yatchBox}>
                <div className={styles.section_head2}>My bookings</div>
                <div className={styles.section_head}>Current Bookings</div>
                <div className={styles.yatch_slider}>
                  {currentBookings.length === 0 ? (
                    <NoBookingsMessage type="current" />
                  ) : (
                  <Swiper
                    spaceBetween={50}
                    slidesPerView="auto"
                    pagination={{ clickable: true }}
                    style={{ 
                      padding: "20px 0", 
                      width: "100%",
                    }}
                    breakpoints={{
                      320: {
                        slidesPerView: "auto",
                        spaceBetween: 10
                      },
                      480: {
                        slidesPerView: "auto",
                        spaceBetween: 15
                      },
                      768: {
                        slidesPerView: "auto",
                        spaceBetween: 20
                      },
                      1024: {
                        slidesPerView: "auto",
                        spaceBetween: 40
                      }
                    }}
                  >
                      {currentBookings.map((booking) => (
                        <SwiperSlide key={booking._id}  className={styles.swiper_slide}>
                          <BookedCard
                            name={booking.name}
                            capacity={booking.capacity}
                            startDate={booking.startDate}
                            images={booking.images[0]}
                            bookingId={booking._id}
                            booking={booking}
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  )}
                </div>
            </div>
            <div className={styles.yatchBox}>
              <div className={styles.section_head}>Previous Bookings</div>
              <div className={styles.yatch_slider}>
                {previousBookings.length === 0 ? (
                  <NoBookingsMessage type="previous" />
                ) : (
                  <Swiper
                  spaceBetween={50}
                  slidesPerView="auto"
                  pagination={{ clickable: true }}
                  style={{ 
                    padding: "20px 0", 
                    width: "100%",
                  }}
                  breakpoints={{
                    320: {
                      slidesPerView: "auto",
                      spaceBetween: 10
                    },
                    480: {
                      slidesPerView: "auto",
                      spaceBetween: 15
                    },
                    768: {
                      slidesPerView: "auto",
                      spaceBetween: 20
                    },
                    1024: {
                      slidesPerView: "auto",
                      spaceBetween: 40
                    }
                  }}
                >
                    {previousBookings.map((booking) => (
                      <SwiperSlide key={booking._id} className={styles.swiper_slide}>
                        <BookedCard
                          name={booking.name}
                          capacity={booking.capacity}
                          startDate={booking.startDate}
                          images={booking.images[0]}
                          bookingId={booking._id}
                          booking={booking}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </div>
            </div>
            {/* Earnings Section */}
            <div className={styles.yatchBox}>
                <div className={styles.section_head2}>
                    My Earnings
                </div>
                <div className={styles.section_head_container}>
                    <div className={styles.section_head}>
                        {isTotalEarning ? 'Total' : 'This Week'}
                    </div>
                    <GoMultiSelect onClick={handleTotalEarning} className={styles.section_head_icon} />
                </div>

                <div className={styles.section_head_container}>
                    <div className={styles.section_head2}>
                        Earnings {isTotalEarning ? 'Total' : 'This Week'}:
                        ₹{isTotalEarning ? earnings.totalEarnings : earnings.sevenDaysEarnings}
                    </div>
                </div>

                <div className={styles.yatch_slider}>
                    {(isTotalEarning ? earnings.allBookings : earnings.sevenDaysBookings).length === 0 ? (
                        <NoEarningsMessage />
                    ) : (
                    <Swiper
                    spaceBetween={60}
                    slidesPerView="auto"
                    pagination={{ clickable: true }}
                    style={{ 
                      padding: "20px 0", 
                      width: "100%",
                    }}
                    breakpoints={{
                      320: {
                        slidesPerView: "auto",
                        spaceBetween: 20
                      },
                      480: {
                        slidesPerView: "auto",
                        spaceBetween: 25
                      },
                      768: {
                        slidesPerView: "auto",
                        spaceBetween: 30
                      },
                      1024: {
                        slidesPerView: "auto",
                        spaceBetween: 50
                      }
                    }}
                    >
                      {(isTotalEarning ? earnings.allBookings : earnings.sevenDaysBookings).map((booking) => (
                          <SwiperSlide key={booking.id}  className={styles.swiper_slide}>
                              <EarningCard
                                  name={booking.yacht?.name || ''}
                                  capacity={booking.totalAmount}
                                  startingPrice={new Date(booking.createdAt).toLocaleDateString()}
                                  imageUrl={booking.yacht?.images?.[0] || Y1}
                                  yachtId={booking.yachtId}
                                  isPrev={true}
                                  isEarning={true}
                              />
                          </SwiperSlide>
                      ))}
                    </Swiper>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Booking;
