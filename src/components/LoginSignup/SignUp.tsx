// import React, { useState } from "react";
// import styles from "../../styles/LoginSignup/Signup.module.css";
// import signPic from "../../assets/LoginSignUp/signup.webp";
// import googleIcon from "../../assets/LoginSignUp/google.svg";
// import Welcome from "./Welcome";

// const SignupForm = ({ type }: { type: string }) => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     otp: '',
//     agreeToTerms: false
//   });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     // Handle form submission
//   };

//   return (
//     <div className={styles.container_body}>
//       <div className={styles.container}>
//         <div className={styles.contentSection}>
//           <div className={styles.formHeader}>
//             <span className={styles.userType}>{type}</span>
//             <h1 className={styles.formTitle}>Get Started Now</h1>
//             <p className={styles.formSubtitle}>Enter your Credentials to get access to your account</p>
//           </div>
  
//           <form onSubmit={handleSubmit} className={styles.form}>
//             <div className={styles.formGroup}>
//               <label>Name</label>
//               <input
//                 type="text"
//                 placeholder="Enter your name"
//                 value={formData.name}
//                 onChange={(e) => setFormData({...formData, name: e.target.value})}
//               />
//             </div>
  
//             <div className={styles.formGroup}>
//               <label>Email Address</label>
//               <input
//                 type="email"
//                 placeholder="Enter your email address"
//                 value={formData.email}
//                 onChange={(e) => setFormData({...formData, email: e.target.value})}
//               />
//             </div>
  
//             <div className={styles.formGroup}>
//               <label>Phone Number</label>
//               <input
//                 type="tel"
//                 placeholder="Enter your phone number"
//                 value={formData.phone}
//                 onChange={(e) => setFormData({...formData, phone: e.target.value})}
//               />
//             </div>
  
//             <div className={styles.formGroup}>
//               <div className={styles.otpContainer}>
//                 <input
//                   type="text"
//                   placeholder="Enter OTP"
//                   value={formData.otp}
//                   onChange={(e) => setFormData({...formData, otp: e.target.value})}
//                 />
//                 <button type="button" className={styles.otpButton}>
//                   Send OTP
//                 </button>
//               </div>
//             </div>
  
//             <div className={styles.checkboxGroup}>
//               <input
//                 type="checkbox"
//                 id="terms"
//                 checked={formData.agreeToTerms}
//                 onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
//               />
//               <label htmlFor="terms">
//                 I agree to the <a href="#" className={styles.link}>terms & conditions</a>
//               </label>
//             </div>
  
//             <button type="submit" className={styles.submitButton}>
//               Sign Up
//             </button>
  
//             <div className={styles.divider}>
//               <span>or</span>
//             </div>
  
//             <button type="button" className={styles.googleButton}>
//               <img src={googleIcon} alt="Google" />
//               Sign Up with Google
//             </button>
  
//             <p className={styles.loginPrompt}>
//               Already have an account? <a href="/login" className={styles.link}>Log in</a>
//             </p>
//           </form>
//         </div>
  
//         <div className={styles.imageSection}>
//           <img 
//             src={signPic}
//             alt="People enjoying on yacht"
//             className={styles.SyachtImage}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// const SignUp: React.FC = () => {
//   const [type, setType] = useState<string | null>(null);
  
//   return (
//     <>
//       {type === null ? (
//         <Welcome setType={setType} />
//       ) : (
//         <SignupForm type={type} />
//       )}
//     </>
//   );
// };

// export default SignUp;


import React, { useState, useEffect } from "react";
import styles from "../../styles/LoginSignup/Signup.module.css";
import signPic from "../../assets/LoginSignUp/signup.webp";
import googleIcon from "../../assets/LoginSignUp/google.svg";
import Welcome from "./Welcome";
import OTPVerification from "./OTP";
import { authAPI } from "../../api/auth";
import SuccessScreen from "./OTPVerified";
import { useNavigate } from "react-router-dom";

type ViewState = 'welcome' | 'signup' | 'otp'| 'success';

interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;  
  agreeToTerms: boolean;
}

interface SignupResponse {
  token: string;
}

const SignupForm = ({ 
  type, 
  onSubmit 
}: { 
  type: string;
  onSubmit: (formData: SignupData) => Promise<void>;
}) => {
  const [formData, setFormData] = useState<SignupData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: type,  // Using the selected type as the role value
    agreeToTerms: false
  });

  console.log("type", type);

  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.agreeToTerms) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to sign up. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container_body}>
      <div className={styles.container}>
        <div className={styles.contentSection}>

        {error && (
            // <Alert variant="destructive">
              <p>{error}</p>
            // </Alert>
          )}
          <div className={styles.formHeader}>
            <span className={styles.userType}>{type}</span>
            <h1 className={styles.formTitle}>Get Started Now</h1>
            <p className={styles.formSubtitle}>Enter your Credentials to get access to your account</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="terms"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
              />
              <label htmlFor="terms">
                I agree to the <a href="#" className={styles.link}>terms & conditions</a>
              </label>
            </div>

            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? 'Signing up...' : 'Sign Up'}
            </button>

            <div className={styles.divider}>
              <span>or</span>
            </div>

            <button type="button" className={styles.googleButton}>
              <img src={googleIcon} alt="Google" />
              Sign Up with Google
            </button>

            <p className={styles.loginPrompt}>
              Already have an account? <a href="/login" className={styles.link}>Log in</a>
            </p>
          </form>
        </div>

        <div className={styles.imageSection}>
          <img 
            src={signPic}
            alt="People enjoying on yacht"
            className={styles.SyachtImage}
          />
        </div>
      </div>
    </div>
  );
};

const SignUp: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('welcome');
  const [type, setType] = useState<string>('');
  const [formData, setFormData] = useState<SignupData | null>(null);
  const [error, setError] = useState<string>('');
  const [signupToken, setSignupToken] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    if (currentView === 'success') {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentView, navigate]);

  const handleWelcomeComplete = (selectedType: string) => {
    setType(selectedType);
    setCurrentView('signup');
  };

  const handleSignupComplete = async (data: SignupData) => {
    try {
      const response: SignupResponse = await authAPI.signup(data);
      setFormData(data);
      setSignupToken(response.token);
      setCurrentView('otp');
    } catch (err: any) {
      throw err;
    }
  };

  const handleOTPVerify = async (otp: string) => {
    try {
      if (!formData || !signupToken) {
        throw new Error('Missing required data for verification');
      }

      await authAPI.verifyOTP({ 
        otp: `${otp}`,
        token: `${signupToken}`,
        role: formData.role
      });
      
      setCurrentView('success');
      
    } catch (err: any) {
      throw err;
    }
  };

  const handleBackToSignup = () => {
    setCurrentView('signup');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'welcome':
        return <Welcome setType={handleWelcomeComplete} />;
      case 'signup':
        return <SignupForm type={type} onSubmit={handleSignupComplete} />;
      case 'otp':
        return (
          <OTPVerification 
            email={formData?.email || ''} 
            onVerify={handleOTPVerify}
            onBack={handleBackToSignup}
          />
        );
      case 'success':
        return <SuccessScreen />;
    }
  };

  return <>{renderCurrentView()}</>;
};

export default SignUp;