import { apiClient } from './apiClient';
import { paths } from './paths';

export interface OwnerBookingType {
    id: string;
    yachtId: string;
    bookingDate: string;
    status: string;
    yacht?: {
      name: string;
      capacity: number;
      startingPrice: string;
      images: string[];
    }
  }
  export interface EarningsAnalytics {
    sevenDaysEarnings: number;
    thirtyDaysEarnings: number;
    totalEarnings: number;
    sevenDaysBookings: OwnerBookingType[];
    thirtyDaysBookings: OwnerBookingType[];
    allBookings: OwnerBookingType[];
  }

export const ownerBookingAPI = {
    getCurrentBookings: async (): Promise<OwnerBookingType[]> => {
        try {
          const response = await apiClient.get(paths.ownerCurrentRides);
          // Ensure response.data is an array
          const bookings = Array.isArray(response.data) ? response.data : [];
          console.log('Current bookings response:', bookings); // Debug log
          return bookings;
        } catch (error) {
          console.error('Error fetching current bookings:', error);
          return [];
        }
      },
  
      getPreviousBookings: async (): Promise<OwnerBookingType[]> => {
        try {
          const response = await apiClient.get(paths.ownerPreviousRides);
          // Ensure response.data is an array
          const bookings = Array.isArray(response.data) ? response.data : [];
          console.log('Previous bookings response:', bookings); // Debug log
          return bookings;
        } catch (error) {
          console.error('Error fetching previous bookings:', error);
          return [];
        }
      },

      getYachtDetails: async (yachtId: string) => {
        try {
          const response = await apiClient.get(`/owner/yacht/${yachtId}`);
          console.log('Yacht details response:', response.data); // Debug log
          return response.data;
        } catch (error) {
          console.error('Error fetching yacht details:', error);
          throw error;
        }
      },
      getEarnings:async (): Promise<EarningsAnalytics> => {
        const response = await apiClient.get(paths.ownerEarnings);;
        return response.data;
      }
};