import React, { useEffect, useState } from "react";
import styles from "../../styles/YachtDetails/YachtDetails.module.css";
import Y2 from "../../assets/Yatch/Y2.svg";
import { useLocation, useNavigate } from "react-router-dom";
import { ownerAPI } from "../../api/owner";
import { Yacht } from "../../types/yachts";

const Details: React.FC = () => {
  const [yachtData, setYachtData] = useState<Yacht | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const yachtId = location.pathname.split("/")[2];
  const isPrev = location.state ? location.state.isPrev : false;

  useEffect(() => {
    const fetchYachtDetails = async () => {
      try {
        const response = await ownerAPI.getOwnerYachtDetail(yachtId);
        // @ts-ignore
        setYachtData(response.yatch);
      } catch (error) {
        console.error("Error fetching yacht details:", error);
        setError("Failed to load yacht details");
      }
    };

    if (yachtId) {
      fetchYachtDetails();
    }
  }, [yachtId]);

  const handleDeleteYacht = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this yacht? This action cannot be undone."
      )
    ) {
      setIsDeleting(true);
      setError(null);

      try {
        await ownerAPI.deleteYacht(yachtId);
        navigate("/my-bookings");
      } catch (error) {
        console.error("Error deleting yacht:", error);
        setError("Failed to delete yacht. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEditYacht = () => {
    navigate("/yatch-form", {
      state: {
        isEdit: true,
        yachtId: yachtId,
      },
    });
  };

  if (!yachtData) {
    return <div>Loading...</div>;
  }

  // Prepare detailed pricing values
  const peakSailing = yachtData.price.sailing.peakTime;
  const nonPeakSailing = yachtData.price.sailing.nonPeakTime;
  const peakAnchoring = yachtData.price.anchoring.peakTime;
  const nonPeakAnchoring = yachtData.price.anchoring.nonPeakTime;

  return (
    <div className={styles.comp_body}>
      {error && <div>{error}</div>}
      <div className={styles.yatchBox}>
        <div className={styles.section_head}>{yachtData.name}</div>
        <div className={styles.section_head2}>
          Explore options to craft a unique yachting experience.
        </div>
      </div>
      <div className={styles.image_box}>
        <img
          src={yachtData.images[0] || Y2}
          alt="Yacht"
          className={styles.Y2}
        />
      </div>
      <div className={styles.yacht_details_box}>
        <div className={styles.details}>
          {/* Existing Prices Section */}
          <div className={styles.prices}>
            <div className={styles.left}>
              <div className={styles.price_head}>Prices</div>
              <div className={styles.price_box}>
                <div className={styles.pricess}>
                  <div className={styles.price_type}>Sailing Price</div>
                  <div className={styles.price_value}>
                    ₹{peakSailing} per hour
                  </div>
                </div>
                <div className={styles.pricess2}>
                  <div className={styles.price_type}>Still/Anchorage Price</div>
                  <div className={styles.price_value}>
                    ₹{peakAnchoring} per hour
                  </div>
                </div>
              </div>
            </div>
            {!isPrev && (
              <div className={styles.Right2}>
                <button className={styles.bookButton} onClick={handleEditYacht}>
                  Edit Details
                </button>
                <button
                  className={styles.bookButton2}
                  onClick={handleDeleteYacht}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Removing..." : "Remove Yacht"}
                </button>
              </div>
            )}
          </div>

          {/* Detailed Pricing Section */}
          <div className={styles.detailedPricing}>
            <h3>Peak / Non-Peak Pricing</h3>
            <div className={styles.price_block}>
              <p>
                <b>Peak Hours Sailing:</b> ₹{peakSailing} per hour
              </p>
              <p>
                <b>Peak Hours Anchorage:</b> ₹{peakAnchoring} per hour
              </p>
            </div>
            <div className={styles.price_block}>
              <p>
                <b>Non-Peak Hours Sailing:</b> ₹{nonPeakSailing} per hour
              </p>
              <p>
                <b>Non-Peak Hours Anchorage:</b> ₹{nonPeakAnchoring} per hour
              </p>
            </div>
          </div>

          {/* Add-On Services Section */}
          {yachtData.addonServices && yachtData.addonServices.length > 0 && (
            <div className={styles.addonSection}>
              <h3>Add-On Services</h3>
              <ul>
                {yachtData.addonServices.map((service, idx) => (
                  <li key={idx}>
                    <b>{service.service}:</b> ₹
                    {Number(service.pricePerHour).toLocaleString()} per hour
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Packages Section */}
          {yachtData.packageTypes && yachtData.packageTypes.length > 0 && (
            <div className={styles.packageSection}>
              <h3>Packages</h3>
              <ul>
                {yachtData.packageTypes.map((pkg, idx) => (
                  <li key={idx}>{pkg}</li>
                ))}
              </ul>
            </div>
          )}

          {/* About */}
          <div className={styles.about}>
            <h3>About {yachtData.name}</h3>
            <p>{yachtData.description}</p>
          </div>

          {/* Summary */}
          <div className={styles.summary}>
            <h3>Summary</h3>
            <p>
              <b>Ideal for:</b> Friends, Family, Couples, Groups, Tourists
            </p>
            <p>
              <b>For:</b> {yachtData.capacity} people
            </p>
            <p>
              <b>Where:</b> {yachtData.pickupat}
            </p>
            <p>
              <b>Duration:</b> According to preference
            </p>
            <p>
              <b>Note:</b> This is an exclusive private sailing experience where
              the entire yacht is reserved just for you.
            </p>
          </div>

          {/* Schedule */}
          <div className={styles.schedule}>
            <h3>Sailing Schedule</h3>
            <ul>
              <li>
                <b>15 Minutes:</b> Arrive at the designated starting point as per
                instructions. Safety instructions prior to departure.
              </li>
              <li>
                <b>15 Minutes:</b> The yacht journey is anchored away from the
                shore. You'll be taken to a serene natural spot.
              </li>
              <li>
                <b>15 Minutes:</b> Conclude your journey with a scenic return
                yacht ride back to the shore.
              </li>
            </ul>
          </div>

          {/* Specifications */}
          <div className={styles.specifications}>
            <h3>Specifications</h3>
            <p>
              <b>Length:</b> {yachtData.dimension}
            </p>
            <p>
              <b>Passenger Capacity:</b> {yachtData.capacity} people
            </p>
            <p>
              <b>Crew:</b> {yachtData.crewCount}
            </p>
          </div>

          {/* Meeting Point */}
          <div className={styles.meetingPoint}>
            <h3>Meeting Point Address</h3>
            <p>{yachtData.pickupat}</p>
          </div>

          {/* Guidelines */}
          <div className={styles.guidelines}>
            <h3>Important Guidelines</h3>
            <ul>
              <li>
                <b>Swimming Not Required:</b> Life jackets are provided, so
                swimming skills are not mandatory.
              </li>
              <li>
                <b>Weather Preparedness:</b> Sailing depends on wind, tides, and
                clear conditions, which may cause slight schedule and route
                changes.
              </li>
              <li>
                <b>Advisory Cancellations:</b> Trips from Gateway of India can be
                canceled by authorities; pre-payment is refundable or
                re-scheduled.
              </li>
              <li>
                <b>Stop Policy:</b> Wind-up time is included in your tour time.
              </li>
              <li>
                <b>Respect Policy:</b> Weather changes during the trip may need
                your cooperation.
              </li>
            </ul>
          </div>

          {/* FAQs */}
          <div className={styles.faqs}>
            <h3>FAQs</h3>
            <p>
              <b>Do you provide catering or food on the boat?</b>
              <br />
              No, we provide snacks and soft drinks without other personal
              requests. You are allowed to carry your own food and beverages.
            </p>
            <p>
              <b>Can I add decorations like balloons, or cake on board?</b>
              <br />
              Yes. All private yacht decorations can be directly availed.
            </p>
            <p>
              <b>Can you make special arrangements for birthdays/anniversaries?</b>
              <br />
              Yes. We have an optional arrangement service. Please contact our
              staff for details.
            </p>
            <p>
              <b>Is it a fixed location tour and will I describe the tour on my own?</b>
              <br />
              Yes. It is included and based on your preferences.
            </p>
          </div>

          {/* Cancellation */}
          <div className={styles.cancellation}>
            <h3>Cancellation & Refund Policy</h3>
            <p>
              <b>Private Cancellations:</b> A refund is allowed if the booking is
              canceled due to unforeseeable weather, technical issues, or security
              protocols.
            </p>
            <p>
              <b>Customer Cancellations:</b> No refunds will be provided for
              cancellations made by the customer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
