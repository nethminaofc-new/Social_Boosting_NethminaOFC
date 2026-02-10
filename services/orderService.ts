import { CartItem, StoredOrder, PaymentDetails } from '../types';
import { saveOrderToDb } from './dbService';

export interface OrderSubmissionResult {
  success: boolean;
  message: string;
}

export const submitOrderToSheet = async (
  orderId: string,
  cart: CartItem[],
  totalAmount: number,
  paymentDetails: PaymentDetails,
  customerId: string = 'GUEST'
): Promise<OrderSubmissionResult> => {
  try {
    // Get primary contact (using the first item's whatsapp as the main contact for the order)
    const customerContact = cart.length > 0 ? cart[0].whatsapp : 'N/A';

    // 1. Save to Local DB (for Admin Panel)
    const localOrder: StoredOrder = {
      orderId,
      customerId,
      customerContact,
      orderDate: new Date().toLocaleString(),
      items: cart,
      totalAmount,
      status: 'Pending',
      payment: paymentDetails
    };
    saveOrderToDb(localOrder);

    return { success: true, message: 'Your order has been placed successfully!' };
  } catch (error) {
    console.error('Order Submission Error:', error);
    return { 
      success: false, 
      message: 'Failed to submit order. Please check your connection and try again.' 
    };
  }
};
