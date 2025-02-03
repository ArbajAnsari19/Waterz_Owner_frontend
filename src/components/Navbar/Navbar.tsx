import React, { useEffect } from "react";
import styles from "../../styles/Navbar/Navbar.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/store/hook";
import { setUserDetails, clearUserDetails } from "../../redux/slices/userSlice";

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { isAuthenticated, userDetails } = useAppSelector((state) => state.user);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('userData');

        if (token && userData) {
            try {
                const parsedUserData = JSON.parse(userData);
                if (parsedUserData.role !== 'owner') {
                    // If not an owner, clear auth and redirect to owner login
                    handleLogout();
                    return;
                }
                dispatch(setUserDetails({
                    id: parsedUserData.id,
                    email: parsedUserData.email,
                    name: parsedUserData.name,
                    role: parsedUserData.role
                }));
            } catch (error) {
                console.error('Error parsing user data:', error);
                handleLogout();
            }
        } else if (window.location.pathname !== '/login') {
            // If no auth data and not on login page, redirect to login
            navigate('/login');
        }
    }, [dispatch, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        dispatch(clearUserDetails());
        navigate('/login');
    };

    return (
        <div className={styles.comp_body}>
            <div className={styles.content}>
                <Link to="/">
                    <div className={styles.item}>Home</div>
                </Link>
                
                {isAuthenticated && userDetails.role === 'owner' ? (
                    <>
                        <Link to="/my-bookings">
                            <div className={styles.item}>Bookings & Earnings</div>
                        </Link>
                        <Link to="/yatch-form">
                            <div className={styles.item}>Charter</div>
                        </Link>
                        <Link to="/account">
                            <div className={styles.item}>Account</div>
                        </Link>
                    </>
                ) : (
                    <Link to="/login">
                        <div className={styles.item}>Login</div>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Navbar;