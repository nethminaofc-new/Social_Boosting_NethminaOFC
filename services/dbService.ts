import { StoredOrder, OrderStatus } from '../types';

const ORDERS_KEY = 'nethmina_orders';

// -- Mock Database Service using LocalStorage --

export const saveOrderToDb = (order: StoredOrder): void => {
  const existingOrdersStr = localStorage.getItem(ORDERS_KEY);
  const orders: StoredOrder[] = existingOrdersStr ? JSON.parse(existingOrdersStr) : [];
  orders.unshift(order); // Add new order to top
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

export const getAllOrders = (): StoredOrder[] => {
  const str = localStorage.getItem(ORDERS_KEY);
  return str ? JSON.parse(str) : [];
};

export const updateOrderStatus = (orderId: string, status: OrderStatus): void => {
  const orders = getAllOrders();
  const index = orders.findIndex(o => o.orderId === orderId);
  if (index !== -1) {
    orders[index].status = status;
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }
};

export const updateOrderAdminNote = (orderId: string, note: string): void => {
  const orders = getAllOrders();
  const index = orders.findIndex(o => o.orderId === orderId);
  if (index !== -1) {
    orders[index].adminNote = note;
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }
};

export const deleteOrder = (orderId: string): void => {
  const orders = getAllOrders();
  const newOrders = orders.filter(o => o.orderId !== orderId);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(newOrders));
};

export const getOrdersByCustomer = (customerId: string): StoredOrder[] => {
  const orders = getAllOrders();
  return orders.filter(o => o.customerId === customerId);
};