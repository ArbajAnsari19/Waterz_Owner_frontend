import React, {useState, useEffect } from "react";
import styles from "../../styles/Booking/Booking.module.css"
import Y1 from "../../assets/Yatch/Y1.svg"
import BookedCard from "../Layouts/BookedCard";
import MyYacht from "../Layouts/MyYacht";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import { GoMultiSelect } from "react-icons/go";
import { ownerAPI } from "../../api/owner";
import { ownerBookingAPI, OwnerBookingType } from "../../api/booking";
import { EarningsAnalytics } from "../../api/booking";
import { BiSad } from 'react-icons/bi';


const Booking: React.FC = () => {
    const [currentBookings, setCurrentBookings] = useState<OwnerBookingType[]>([]);
    const [previousBookings, setPreviousBookings] = useState<OwnerBookingType[]>([]);
    const [, setIsLoading] = useState(true);
    const [myYachts, setMyYachts] = useState<any[]>([]);
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
    useEffect(() => {
        const fetchBookings = async () => {
          try {
            setIsLoading(true);
            const [currents, previous,yachts,earningsData] = await Promise.all([
              ownerBookingAPI.getCurrentBookings(),
              ownerBookingAPI.getPreviousBookings(),
              ownerAPI.getOwnerYachts(),
              ownerBookingAPI.getEarnings()
            ]);

            const currentWithDetails = Array.isArray(currents) ? await Promise.all(
            currents.map(async (booking) => {
                if (booking.yachtId) {
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
                }
                return booking;
            })
            ) : [];

            const previousWithDetails = Array.isArray(previous) ? await Promise.all(
                previous.map(async (booking) => {
                  if (booking.yachtId) {
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
                  }
                  return booking;
                })
            ) : [];
    
            setCurrentBookings(currentWithDetails);
            setPreviousBookings(previousWithDetails);
            setEarnings(earningsData);
            if (Array.isArray(yachts)) {
              setMyYachts(yachts.map(yacht => ({
                ...yacht,
                images: yacht.images || [],
                name: yacht.name || '',
                capacity: yacht.capacity || 0,
              })));
            }
        
          } catch (err: any) {
            setError(err?.message || 'Failed to fetch bookings');
            console.error("Error fetching bookings:", err);
          } finally {
            setIsLoading(false);
          }
        }
        fetchBookings();
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
    return(
        <div className={styles.comp_body}>
            <div className={styles.yatchBox}>
                <div className={styles.section_head}>My Yacht</div>
                <div className={styles.yatch_slider}>
                <Swiper
                    spaceBetween={10}
                    slidesPerView={3.2}
                    pagination={{ clickable: true }}
                    style={{ padding: "20px 0", width: "100%" }}
                >
                    {myYachts.map((yacht) => (
                    <SwiperSlide key={yacht._id}>
                        <MyYacht
                        name={yacht.name}
                        
                        capacity={yacht.capacity}
                        startingPrice={yacht.startingPrice}
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
                    spaceBetween={10}
                    slidesPerView={3.2}
                    pagination={{ clickable: true }}
                    style={{ padding: "20px 0", width: "100%" }}
                    >
                    {currentBookings.map((booking) => (
                        <SwiperSlide key={booking.id}>
                        <BookedCard
                            name={booking.yacht?.name || ''}
                            capacity={booking.yacht?.capacity || 0}
                            startingPrice={booking.yacht?.startingPrice || ''}
                            imageUrl={booking.yacht?.images[0] || Y1}
                            yachtId={booking.yachtId}
                            isPrev={false}
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
                        spaceBetween={10}
                        slidesPerView={3.2}
                        pagination={{ clickable: true }}
                        style={{ padding: "20px 0", width: "100%" }}
                        >
                        {previousBookings.map((booking) => (
                            <SwiperSlide key={booking.id}>
                            <BookedCard
                                name={booking.yacht?.name || ''}
                                capacity={booking.yacht?.capacity || 0}
                                startingPrice={booking.yacht?.startingPrice || ''}
                                imageUrl={booking.yacht?.images[0] || Y1}
                                yachtId={booking.yachtId}
                                isPrev={true}
                            />
                            </SwiperSlide>
                        ))}
                        </Swiper>
                    )}
                </div>
            </div>
            <div className={styles.yatchBox}>
              <div className={styles.section_head2}>
                My Earnings
              </div>
              <div className={styles.section_head_container}>
                <div className={styles.section_head}>
                  {isTotalEarning ? 'Total' : 'This Week'}
                </div>
                <GoMultiSelect onClick={handleTotalEarning} className={styles.section_head_icon}/>
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
                    spaceBetween={10}
                    slidesPerView={3.2}
                    pagination={{ clickable: true }}
                    style={{ padding: "20px 0", width:"100%" }}
                  >
                    {(isTotalEarning ? earnings.allBookings : earnings.sevenDaysBookings).map((booking) => (
                      <SwiperSlide key={booking.id}>
                        <BookedCard
                          name={booking.yacht?.name || ''}
                          //@ts-ignore
                          capacity={booking.totalAmount}
                          //@ts-ignore
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
    )
}

export default Booking;
