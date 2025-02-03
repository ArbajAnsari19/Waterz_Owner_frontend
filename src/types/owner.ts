export interface Ride {
    user: string;           // MongoDB ObjectId
    yacht: string;          // MongoDB ObjectId
    agent: string | null;   // MongoDB ObjectId
    location: string;
    duration: number;
    startDate: Date;
    startTime: Date;
    endDate: Date;
    sailingTime: number;
    stillTime: number;
    capacity: number;
    PeopleNo: number;
    specialEvent?: string;
    specialRequest?: string;
    totalAmount: number;
    services: string[];
    paymentStatus: string;  // Comes from API as string
    status: string;         // Comes from API as string
    calendarSync: boolean;
    razorpayOrderId: string;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}