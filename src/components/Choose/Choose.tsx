import React from "react";
import styles from "../../styles/Choose/Choose.module.css";
import YachtCard from "../Layouts/YatchCard";
import { useYachts } from "../../hooks/useYachts";
import { useLocation } from "react-router-dom";
import { Yacht } from "../../types/yachts";

interface LocationState {
    yatches: Yacht[];
}
const Choose: React.FC = () => {
    const location = useLocation();
    const state = location.state as LocationState;
    const { yachts: hookYachts } = useYachts();
    
    console.log("state",state.yatches);
    // Use passed yachts if available, otherwise use hook data
    const yachtes = state?.yatches ?? hookYachts;
    // const yachtes = state?.yatches;


    return (
        <div className={styles.comp_body}>
            <div className={styles.yatchBox}>
                <div className={styles.section_head}>Choose Your Perfect Getaway</div>
                <div className={styles.section_head2}>
                    Explore options to craft a unique yachting experience.
                </div>
            </div>
            <div className={styles.yachtGrid}>
                {yachtes?.map((yacht) => (
                    <YachtCard
                        key={yacht._id}
                        // @ts-ignore
                        yacht={yacht}
                    />
                ))}
            </div>
        </div>
    );
};

export default Choose;
