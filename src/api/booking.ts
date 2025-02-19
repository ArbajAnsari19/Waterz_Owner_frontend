import { apiClient } from './apiClient';
import { paths } from './paths';

export interface OwnerBookingType {
    id: string;
    yachtId: string;
    bookingDate: string;
    status: string;
    totalAmount: number;
    createdAt: string;
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
          const response = await apiClient.get(paths.ownerCurrentRides);
          return response.data;
      },
  
      getPreviousBookings: async (): Promise<OwnerBookingType[]> => {
          const response = await apiClient.get(paths.ownerPreviousRides);
          return response.data;
      },

      getYachtDetails: async (yachtId: string) => {
          const response = await apiClient.get(`/owner/yacht/${yachtId}`);
          return response.data;
      },
      getEarnings:async (): Promise<EarningsAnalytics> => {
        const response = await apiClient.get(paths.ownerEarnings);;
        return response.data;
      }
};