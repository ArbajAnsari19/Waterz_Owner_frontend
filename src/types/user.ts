export interface UserDetails {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    type?: string;
  }
  
export interface UserState {
  userDetails: UserDetails;
  isAuthenticated: boolean;
}