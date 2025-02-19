// Location coordinate type
export interface Coordinates {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  }
  
  // Crew member type
  export interface CrewMember {
    name: string;
    role: string;
  }
  
  // Dimensions type
  export interface Dimensions {
    length: string;
    width: string;
    height: string;
  }
  
  // Pricing structure
  export interface YachtPricing {
    sailing: number;  // Price per hour for sailing
    still: number;   // Price per hour when stationary
  }


  interface AddonService {
    service: string;
    pricePerHour: number;
  }
  
  // Main yacht creation interface
  export interface CreateYachtRequest {
    name: string;
    pickupat: string;
    location: string;
    description: string;
    // Updated pricing structure:
    price: {
      sailing: {
        peakTime: number;
        nonPeakTime: number;
      };
      anchoring: {
        peakTime: number;
        nonPeakTime: number;
      };
    };
    availability: boolean;
    amenities: string[];
    capacity: number;
    mnfyear?: number;
    dimension?: string;
    crews?: { name: string; role: string }[];
    images: string[];
    YachtType: string;
    dimensions: string;
    uniqueFeatures: string;
    availabilityFrom: string;
    availabilityTo: string;
    crewCount: string;
    // New fields:
    addonServices: AddonService[];
    packageTypes: string[];           // Array of image URLs
  }
  
  // API response interface
  export interface CreateYachtResponse {
    success: boolean;
    message: string;
    data?: {
      yacht: CreateYachtRequest & { _id: string };
      createdAt: string;
      updatedAt: string;
    };
  }
  
  // Error response interface
  export interface CreateYachtError {
    success: false;
    message: string;
    errors?: {
      [key: string]: string[];
    };
  }
  
  // Combined response type
  export type CreateYachtResult = CreateYachtResponse | CreateYachtError;