export type Language = 'en' | 'es' | 'pt';

export interface TicketPurchase {
  ticketNumber: string;
  buyerName: string;
  buyerEmail: string;
  timestamp: string;
  paymentMethod: string;
  status: 'Successful' | 'Processing' | 'Failed';
  amount: number;
  currency: string;
  raffle: string;
}

export interface Raffle {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  totalTickets: number;
  ticketPrice: number;
  currency: string; // 'USD' | 'Pi' | 'BRL'
  soldTickets: number[]; // ticket numbers
  reservedTickets: number[]; // ticket numbers in cart/checkout
  purchases: TicketPurchase[];
  status: 'draft' | 'active' | 'closed' | 'drawing' | 'drawn';
  drawMethod: 'Automatic' | 'National Lottery' | 'Live Stream';
  subdomain: string;
  startDate: string;
  drawDate: string;
  winnerTicket?: string;
  winnerName?: string;
  winnerEmail?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'alert' | 'draw';
  read: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  tier: 'Free' | 'Pro' | 'Enterprise';
  rafflesJoinedCount: number;
  ticketsPurchasedCount: number;
}
