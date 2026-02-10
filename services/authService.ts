import { User } from '../types';
import { generateCustomerId } from '../utils';

const USERS_KEY = 'nethmina_users';
const SESSION_KEY = 'nethmina_session';

export const registerUser = (email: string, phone: string, password: string): { success: boolean; message: string; user?: User } => {
  const usersStr = localStorage.getItem(USERS_KEY);
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];

  // Check if exists
  if (users.find(u => u.email === email)) return { success: false, message: 'Email already registered.' };
  if (users.find(u => u.phone === phone)) return { success: false, message: 'Phone number already registered.' };

  // Generate Unique ID
  let newId = generateCustomerId();
  // Ensure uniqueness by regenerating if collision occurs (rare but possible)
  while (users.some(u => u.id === newId)) {
    newId = generateCustomerId();
  }

  const newUser: User = {
    id: newId,
    email,
    phone,
    password, // In a real app, hash this!
    role: 'customer'
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Auto login
  localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
  
  return { success: true, message: 'Registration successful!', user: newUser };
};

export const loginUser = (identifier: string, password: string): { success: boolean; message: string; user?: User } => {
  // Admin Check (Secret Code)
  if (identifier === 'nethmina123admin' && password === 'nethmina123admin') {
    const adminUser: User = {
      id: 'ADMIN001',
      email: 'admin@nethmina.com',
      phone: '00000000000',
      role: 'admin',
      name: 'Administrator'
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(adminUser));
    return { success: true, message: 'Welcome Admin', user: adminUser };
  }

  const usersStr = localStorage.getItem(USERS_KEY);
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];

  const user = users.find(u => (u.email === identifier || u.phone === identifier) && u.password === password);

  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return { success: true, message: 'Login successful!', user };
  }

  return { success: false, message: 'Invalid credentials.' };
};

export const logoutUser = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  const str = localStorage.getItem(SESSION_KEY);
  return str ? JSON.parse(str) : null;
};
