const URL = "https://www.backend.wavezgoa.com"; 
// const URL = "http://localhost:8000"; //local server
const userBaseURL = URL + "/user";
const customer = URL + "/customer";
const owner = URL + "/owner";
const signUp = URL + "/auth";
const booking = URL + "/booking";

export const paths = {
  // Auth endpoints
  login: `${signUp}/signin`,
  signup: `${signUp}/signup`,
  generateOtp: `${signUp}/generate-otp`,
  verifyOtp: `${signUp}/verify-otp`,
  logout: `${userBaseURL}/logout`,
  googleAuth: `${userBaseURL}/google`,
  
  // User endpoints
  getUserProfile: `${userBaseURL}/profile`,
  updateUserProfile: `${userBaseURL}/profile/update`,
  
  // yacht
  getYachtList: `${customer}/listAll`,
  getTopYachts: `${customer}/topYatch`,

  // query
  userQuery: `${URL}/query`,

  // filter
  locationFilter: `${booking}/idealYatchs`,
  bookYacht: `${booking}/create`,

  // owner
  createYacht: `${owner}/create`,
  ownerProfile: `${owner}/me`,
  ownerYachts: `${owner}/me/yatchs`,
  ownerYachtDetail:`${owner}/me/yatch`,
  ownerCurrentRides: `${owner}/current/rides`,
  ownerPreviousRides: `${owner}/prev/rides`,
  ownerPreviousRideDetail: `${owner}/prev/ride`,
  updateYacht: `${owner}/update`,
  deleteYacht: `${owner}/delete`,
  ownerEarnings: `${owner}/me/earnings`,
};

export default paths;
