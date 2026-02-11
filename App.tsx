import React, { useState, useEffect, useRef } from 'react';
import { PLATFORMS, QUANTITY_OPTIONS, calculatePrice } from './constants';
import { OrderState, PlatformId, BoostType, CartItem, User, PaymentDetails } from './types';
import { Hero } from './components/Hero';
import { StepWizard } from './components/StepWizard';
import { WhyChooseUs } from './components/WhyChooseUs';
import { AIAssistant } from './components/AIAssistant';
import { CartDrawer } from './components/CartDrawer';
import { AuthForms } from './components/AuthForms';
import { AdminDashboard } from './components/AdminDashboard';
import { CustomerOrders } from './components/CustomerOrders';
import { Footer } from './components/Footer';
import { useCart } from './hooks/useCart';
import { generateOrderId, validateWhatsAppNumber } from './utils';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getCurrentUser, logoutUser } from './services/authService';
import { ShoppingCart, ArrowLeft, CheckCircle, Smartphone, Plus, Phone, AlertCircle, LogIn, User as UserIcon, LogOut, Shield, Bell, Copy, Upload, Info, Check } from 'lucide-react';
import { getOrdersByCustomer } from './services/dbService';

type ViewState = 'HOME' | 'WIZARD' | 'CHECKOUT' | 'SUCCESS' | 'LOGIN' | 'ADMIN' | 'NOTIFICATIONS';

export default function App() {
  const [view, setView] = useState<ViewState>('HOME');
  const [step, setStep] = useState<number>(1); 
  
  // User Session
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    if (loggedInUser.role === 'admin') {
      setView('ADMIN');
    } else {
      setView('HOME');
    }
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setView('HOME');
  };

  // Cart Logic
  const { 
    cart, 
    isOpen: isCartOpen, 
    setIsOpen: setIsCartOpen, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    cartTotal, 
    cartCount
  } = useCart();

  // Order Creation State (Wizard)
  const [order, setOrder] = useState<OrderState>({
    platform: null,
    boostType: null,
    quantity: null,
    link: '',
    whatsapp: '',
    note: '',
    price: 0
  });

  // Checkout Payment State
  const [paymentSenderPhone, setPaymentSenderPhone] = useState('');
  const [paymentRefNo, setPaymentRefNo] = useState('');
  const [paymentReceipt, setPaymentReceipt] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  // Active Order Count for Badge
  const [activeOrderCount, setActiveOrderCount] = useState(0);

  useEffect(() => {
    if (user && user.role === 'customer') {
      const orders = getOrdersByCustomer(user.id);
      const active = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
      setActiveOrderCount(active);
      
      // Poll active orders count
      const interval = setInterval(() => {
        const currentOrders = getOrdersByCustomer(user.id);
        const currentActive = currentOrders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
        setActiveOrderCount(currentActive);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);


  // Prefill whatsapp if logged in (for order contact, not payment)
  useEffect(() => {
    if (user && view === 'WIZARD' && user.role === 'customer') {
      setOrder(prev => ({ ...prev, whatsapp: user.phone }));
    }
  }, [user, view]);

  // Scroll to top on step change in wizard
  useEffect(() => {
    if (view === 'WIZARD') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step, view]);

  const updateOrder = (key: keyof OrderState, value: any) => {
    setOrder(prev => {
      const newState = { ...prev, [key]: value };
      if (key === 'boostType' || key === 'quantity' || key === 'platform') {
        newState.price = calculatePrice(newState.platform, newState.boostType, newState.quantity);
      }
      return newState;
    });
  };

  const startWizard = () => {
    setOrder({
      platform: null,
      boostType: null,
      quantity: null,
      link: '',
      whatsapp: user?.role === 'customer' ? user.phone : '',
      note: '',
      price: 0
    });
    setStep(1);
    setView('WIZARD');
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else setView('HOME');
  };

  const handleAddToCart = () => {
    if (!order.platform || !order.boostType || !order.quantity || !order.link || !validateWhatsAppNumber(order.whatsapp)) return;

    const newItem: CartItem = {
      id: crypto.randomUUID(),
      platform: order.platform,
      boostType: order.boostType,
      quantityLabel: order.quantity,
      link: order.link,
      whatsapp: order.whatsapp,
      note: order.note || undefined,
      price: order.price,
      count: 1
    };

    addToCart(newItem);
    startWizard(); 
    setView('HOME'); 
  };

  const handleCheckoutStart = () => {
    setIsCartOpen(false);
    setError(null);
    // CRITICAL: Reset payment phone number to empty so user must type it manually
    setPaymentSenderPhone(''); 
    setPaymentRefNo('');
    setPaymentReceipt(null);
    setReceiptFileName('');
    setIsCopied(false);
    setView('CHECKOUT');
    window.scrollTo(0, 0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB Limit
        alert("File size too large. Please upload an image under 2MB.");
        return;
      }
      setReceiptFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentReceipt(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleFinalPurchase = async () => {
    if (cart.length === 0) return;
    
    // Require login for purchase
    if (!user) {
      setView('LOGIN');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    const newOrderId = generateOrderId();
    
    const paymentDetails: PaymentDetails = {
      method: 'Ez Cash',
      senderPhone: paymentSenderPhone,
      referenceNumber: paymentRefNo || undefined,
      receiptImage: paymentReceipt || undefined
    };

    const result = await submitOrderToSheet(newOrderId, cart, cartTotal, paymentDetails, user.id);

    if (result.success) {
      setLastOrderId(newOrderId);
      clearCart();
      setView('SUCCESS');
      window.scrollTo(0, 0);
    } else {
      setError(result.message);
    }
    
    setIsProcessing(false);
  };

  // --- Render Steps (Wizard) ---
  const renderWizardStep = () => {
    switch (step) {
      case 1: 
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  updateOrder('platform', p.id);
                  updateOrder('boostType', null);
                  updateOrder('quantity', null);
                  handleNext();
                }}
                className={`flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl border-2 transition-all duration-300 group
                  ${order.platform === p.id 
                    ? `border-transparent bg-gradient-to-br ${p.gradient} text-white shadow-xl scale-105` 
                    : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:bg-slate-800'}
                `}
              >
                <div className={`p-4 rounded-full bg-white/10 mb-4 backdrop-blur-sm group-hover:scale-110 transition-transform`}>
                  <p.icon size={32} />
                </div>
                <span className="font-bold text-lg">{p.name}</span>
              </button>
            ))}
          </div>
        );

      case 2: 
        const selectedPlatform = PLATFORMS.find(p => p.id === order.platform);
        return (
          <div className="space-y-6">
            <h3 className="text-xl text-center text-slate-300">
              What do you need for <span className="font-bold text-white">{selectedPlatform?.name}</span>?
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {selectedPlatform?.allowedBoosts.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    updateOrder('boostType', type);
                    updateOrder('quantity', null);
                    handleNext();
                  }}
                  className={`p-6 rounded-xl border-2 text-center font-semibold transition-all
                    ${order.boostType === type 
                      ? 'border-violet-500 bg-violet-500/20 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]' 
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-violet-500/50 hover:text-white'}
                  `}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        );

      case 3: 
        const options = (order.platform && order.boostType) ? QUANTITY_OPTIONS[order.platform]?.[order.boostType] : [];
        const isTiktokLikes = order.platform === PlatformId.TIKTOK && order.boostType === BoostType.LIKES;
        const isTiktokViews = order.platform === PlatformId.TIKTOK && order.boostType === BoostType.VIEWS;
        
        return (
          <div className="space-y-8">
            <h3 className="text-xl text-center text-slate-300">
              How many <span className="text-white font-bold">{order.boostType}</span>?
            </h3>
            
            <div className="max-w-xl mx-auto mb-6">
              {isTiktokLikes && (
                <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-2xl p-6 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                  <div className="flex items-center gap-2 mb-3 text-emerald-400 font-bold">
                    <CheckCircle size={18} />
                    <span>Premium Service</span>
                  </div>
                  <ul className="space-y-2 text-sm text-emerald-100/80">
                    <li>• Life time refill likes</li>
                    <li>• 100% Guaranteed</li>
                    <li>• No like drop or removing</li>
                    <li>• No any issues comes to account</li>
                    <li>• Using Real & bot accounts</li>
                  </ul>
                </div>
              )}

              {isTiktokViews && (
                <div className="bg-red-500/10 border border-red-500/40 rounded-2xl p-6 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                  <div className="flex items-center gap-2 mb-3 text-red-400 font-bold">
                    <AlertCircle size={18} />
                    <span>Economy Service</span>
                  </div>
                  <ul className="space-y-2 text-sm text-red-100/80">
                    <li>• Non refill</li>
                    <li>• 30/60 Days available</li>
                    <li>• Not guaranteed</li>
                    <li>• Not comes issues foe account</li>
                    <li>• Instant delivery</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {options?.map((qty) => (
                <button
                  key={qty}
                  onClick={() => {
                    updateOrder('quantity', qty);
                    handleNext();
                  }}
                  className={`py-4 px-2 rounded-lg border font-mono font-bold transition-all
                    ${order.quantity === qty 
                      ? 'border-fuchsia-500 bg-fuchsia-500/20 text-white' 
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  {qty}
                </button>
              ))}
            </div>
          </div>
        );

      case 4: 
        const isWhatsappValid = validateWhatsAppNumber(order.whatsapp);
        return (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                 Link to {order.platform === PlatformId.TIKTOK || order.platform === PlatformId.INSTAGRAM ? 'Profile or Post' : 'Channel or Video'}
              </label>
              <div className="relative">
                <input 
                  type="url" 
                  placeholder="https://..."
                  value={order.link}
                  onChange={(e) => updateOrder('link', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 px-4 pl-10 focus:ring-2 focus:ring-violet-500 outline-none text-white transition-all"
                />
                <Smartphone className="absolute left-3 top-3.5 text-slate-500" size={18} />
              </div>
              <p className="text-xs text-slate-500 mt-2">Make sure your account is public.</p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                 WhatsApp Number
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  inputMode="numeric"
                  placeholder="947XXXXXXXX"
                  value={order.whatsapp}
                  maxLength={11}
                  disabled={user?.role === 'customer'} 
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    updateOrder('whatsapp', val);
                  }}
                  className={`w-full bg-slate-950 border rounded-lg py-3 px-4 pl-10 focus:ring-2 outline-none text-white transition-all
                    ${order.whatsapp && !isWhatsappValid ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-violet-500'}
                    ${user?.role === 'customer' ? 'opacity-80' : ''}
                  `}
                />
                <Phone className="absolute left-3 top-3.5 text-slate-500" size={18} />
              </div>
              {order.whatsapp && !isWhatsappValid ? (
                <p className="text-xs text-red-400 mt-2">Must be 11 digits</p>
              ) : null}
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                 Optional Note
              </label>
              <textarea 
                rows={3}
                placeholder="Any specific instructions?"
                value={order.note}
                onChange={(e) => updateOrder('note', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 px-4 focus:ring-2 focus:ring-violet-500 outline-none text-white transition-all"
              />
            </div>

            <button
              onClick={handleNext}
              disabled={!order.link.length || !isWhatsappValid}
              className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Review Configuration
            </button>
          </div>
        );

      case 5: 
        return (
          <div className="max-w-md mx-auto">
             <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="bg-slate-800/50 p-4 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-white">Review Service</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between py-2 border-b border-slate-800/50">
                    <span className="text-slate-400">Platform</span>
                    <span className="text-white capitalize font-medium flex items-center gap-2">
                      {order.platform}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800/50">
                    <span className="text-slate-400">Service</span>
                    <span className="text-white font-medium">{order.boostType}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800/50">
                    <span className="text-slate-400">Quantity</span>
                    <span className="text-white font-medium">{order.quantity}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800/50">
                    <span className="text-slate-400">WhatsApp</span>
                    <span className="text-white font-mono text-sm">{order.whatsapp}</span>
                  </div>
                  <div className="mt-6 p-4 bg-slate-950 rounded-lg flex justify-between items-center border border-slate-800">
                    <span className="text-slate-400">Price</span>
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                      LKR {order.price.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all flex justify-center items-center gap-2"
                  >
                    <Plus size={20} /> Add to Cart
                  </button>
                </div>
             </div>
          </div>
        );
      default: return null;
    }
  };

  // --- Payment Validation Logic ---
  const isSenderPhoneValid = /^\d{10}$/.test(paymentSenderPhone);
  const isRefNoValid = /^\d{14}$/.test(paymentRefNo);
  const isPaymentValid = isSenderPhoneValid && (isRefNoValid || paymentReceipt !== null);

  // --- Main Render ---

  // Admin View
  if (view === 'ADMIN' && user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <nav className="bg-slate-900 border-b border-slate-800">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 text-violet-400 font-bold text-xl">
               <Shield /> Admin Panel
            </div>
            <button onClick={handleLogout} className="text-sm text-slate-400 hover:text-white flex items-center gap-2">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </nav>
        <AdminDashboard />
      </div>
    );
  }

  // Auth View
  if (view === 'LOGIN') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative">
        <div className="absolute top-4 left-4">
           <button 
             onClick={() => setView('HOME')}
             className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
           >
             <ArrowLeft size={20} /> Back to Home
           </button>
        </div>
        <div className="w-full">
           <AuthForms onSuccess={handleLoginSuccess} />
        </div>
      </div>
    );
  }

  // Success View
  if (view === 'SUCCESS') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-violet-600/10 blur-3xl rounded-full -z-10"></div>
          <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Purchase Successful!</h2>
          <p className="text-slate-400 mb-6">
            Your payment is being verified. Status: <span className="text-yellow-400 font-bold">Pending Verification</span>
          </p>
          <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 mb-8">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Order ID</p>
            <div className="text-xl font-mono font-bold text-violet-400 tracking-wider select-all break-all">
              {lastOrderId}
            </div>
            <p className="text-[10px] text-slate-600 mt-2">
              Saved to your account: {user?.id || 'GUEST'}
            </p>
          </div>
          <div className="space-y-3">
            <button 
              onClick={() => setView('NOTIFICATIONS')}
              className="px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-colors font-medium w-full flex items-center justify-center gap-2"
            >
              <Bell size={18} /> Track Order Status
            </button>
            <button 
              onClick={() => setView('HOME')}
              className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-medium w-full"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Regular App View
  return (
    <div className="min-h-screen font-sans bg-slate-950 text-slate-50 selection:bg-fuchsia-500/30 flex flex-col">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="cursor-pointer flex items-center gap-2 overflow-hidden" 
            onClick={() => { setView('HOME'); window.scrollTo(0, 0); }}
          >
            <img src="https://image2url.com/r2/default/images/1770547339720-83e35c96-8e65-4d5b-aea2-3f112760363b.png" alt="NethminaOFC" className="h-10 md:h-12 w-auto object-contain shrink-0" />
            <div className="flex flex-col items-start leading-none truncate">
              {user && (
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-0.5">
                  Customer ID
                </span>
              )}
              <span className={`text-lg md:text-xl font-bold tracking-tighter text-white truncate ${user ? 'font-mono text-violet-400' : ''}`}>
                {user ? user.id : 'NethminaOFC'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            
            {/* User Status / Login */}
            {user ? (
              <div className="flex items-center gap-3">
                 {user.role === 'customer' && (
                   <button 
                     onClick={() => setView('NOTIFICATIONS')}
                     className={`p-2 rounded-full transition-colors relative ${view === 'NOTIFICATIONS' ? 'bg-violet-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                     title="Notifications & Orders"
                   >
                     <Bell size={20} />
                     {activeOrderCount > 0 && (
                       <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border border-slate-900 text-[10px] flex items-center justify-center font-bold text-white">
                         {activeOrderCount}
                       </span>
                     )}
                   </button>
                 )}

                 {user.role === 'admin' && (
                    <button onClick={() => setView('ADMIN')} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-violet-400">
                      <Shield size={20} />
                    </button>
                 )}
                 <button onClick={handleLogout} className="p-2 bg-slate-800 hover:bg-red-900/50 hover:text-red-400 rounded-full transition-colors text-slate-400" title="Logout">
                   <LogOut size={20} />
                 </button>
              </div>
            ) : (
              <button 
                onClick={() => setView('LOGIN')}
                className="text-sm font-bold text-white hover:text-violet-400 transition-colors flex items-center gap-2"
              >
                <LogIn size={18} /> <span className="hidden sm:inline">Login</span>
              </button>
            )}

            <button 
              onClick={() => setIsCartOpen(true)}
              className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors relative"
            >
               <ShoppingCart size={20} className="text-white" />
               {cartCount > 0 && (
                 <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-slate-900 text-[10px] flex items-center justify-center font-bold">
                   {cartCount}
                 </span>
               )}
            </button>
          </div>
        </div>
      </nav>

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemove={removeFromCart}
        onUpdateQuantity={updateQuantity}
        total={cartTotal}
        onCheckout={handleCheckoutStart}
      />

      {/* Main Content */}
      <main className="pt-16 flex-1">
        
        {view === 'HOME' && (
          <>
            <Hero onStart={startWizard} />
            <WhyChooseUs />
            <AIAssistant />
          </>
        )}

        {view === 'NOTIFICATIONS' && user && (
          <div className="min-h-[calc(100vh-64px)]">
            <div className="container mx-auto px-4 py-8">
              <button 
                  onClick={() => setView('HOME')} 
                  className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={20} /> Back to Home
              </button>
              <CustomerOrders customerId={user.id} />
            </div>
          </div>
        )}

        {view === 'WIZARD' && (
          <div className="min-h-[calc(100vh-64px)] flex flex-col items-center py-10 px-4 relative">
            <div className="w-full max-w-4xl mx-auto mb-10">
              <div className="flex items-center gap-2 mb-6">
                <button 
                  onClick={handleBack} 
                  className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-bold">Configure Boost</h2>
              </div>
              <StepWizard currentStep={step} totalSteps={5} />
            </div>
            <div className="w-full max-w-4xl mx-auto animate-fade-in">
              {renderWizardStep()}
            </div>
          </div>
        )}

        {view === 'CHECKOUT' && (
           <div className="min-h-[calc(100vh-64px)] py-10 px-4 container mx-auto max-w-4xl">
             <div className="flex items-center gap-2 mb-6">
               <button 
                 onClick={() => setView('HOME')} 
                 className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
               >
                 <ArrowLeft size={20} />
               </button>
               <h2 className="text-2xl font-bold">Checkout & Payment</h2>
             </div>

             <div className="grid md:grid-cols-2 gap-8">
               
               {/* Column 1: Payment Method */}
               <div className="space-y-6">
                 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-4 text-white">Payment Method</h3>
                    
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-violet-500/30 mb-6">
                       <div className="flex items-center gap-3 mb-2">
                         <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-bold text-white text-xs">Ez</div>
                         <span className="font-bold text-white">Ez Cash Deposit</span>
                       </div>
                       <p className="text-sm text-slate-400 mb-4">
                         Send Ez Cash payment to the number below before completing your order.
                       </p>
                       <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-lg border border-slate-700 relative">
                         <span className="text-xl font-mono font-bold text-violet-400 tracking-wider">0760127262</span>
                         <button 
                           onClick={() => copyToClipboard('0760127262')}
                           className={`ml-auto p-2 rounded-md transition-all flex items-center gap-2
                             ${isCopied ? 'bg-green-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}
                           `}
                           title="Copy Number"
                         >
                           {isCopied ? (
                             <>
                               <Check size={16} />
                               <span className="text-[10px] font-bold uppercase">Number Copied</span>
                             </>
                           ) : (
                             <Copy size={16} />
                           )}
                         </button>
                       </div>
                    </div>

                    <h4 className="font-bold text-white text-sm mb-3">Verification Details</h4>
                    
                    <div className="space-y-4">
                      {/* Sender Phone */}
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                          Sender Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                           <input 
                             type="text" 
                             inputMode="numeric"
                             placeholder="07xxxxxxxx"
                             maxLength={10}
                             value={paymentSenderPhone}
                             onChange={(e) => setPaymentSenderPhone(e.target.value.replace(/\D/g, ''))}
                             className={`w-full bg-slate-950 border rounded-lg py-3 px-4 pl-10 focus:ring-2 outline-none text-white transition-all
                               ${paymentSenderPhone && !isSenderPhoneValid ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-violet-500'}
                             `}
                           />
                           <Phone className="absolute left-3 top-3.5 text-slate-500" size={18} />
                        </div>
                        {paymentSenderPhone && !isSenderPhoneValid && (
                          <p className="text-[10px] text-red-400 mt-1">Must be exactly 10 digits.</p>
                        )}
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                          <div className="w-full border-t border-slate-800"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-slate-900 px-2 text-xs text-slate-500 font-bold uppercase">Provide Reference OR Receipt</span>
                        </div>
                      </div>

                      {/* Reference Number */}
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                          Ez Cash Reference Number (14 digits)
                        </label>
                        <div className="relative">
                           <input 
                             type="text" 
                             inputMode="numeric"
                             placeholder="xxxxxxxxxxxxxx"
                             maxLength={14}
                             value={paymentRefNo}
                             onChange={(e) => setPaymentRefNo(e.target.value.replace(/\D/g, ''))}
                             className={`w-full bg-slate-950 border rounded-lg py-3 px-4 pl-10 focus:ring-2 outline-none text-white transition-all
                               ${paymentRefNo && !isRefNoValid ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-violet-500'}
                             `}
                           />
                           <Shield className="absolute left-3 top-3.5 text-slate-500" size={18} />
                        </div>
                        {paymentRefNo && !isRefNoValid && (
                          <p className="text-[10px] text-red-400 mt-1">Must be exactly 14 digits.</p>
                        )}
                      </div>

                      {/* Receipt Upload */}
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                          Or Upload Receipt Image (JPG, PNG)
                        </label>
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className={`w-full border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors
                            ${paymentReceipt ? 'border-green-500 bg-green-500/10' : 'border-slate-700 bg-slate-950 hover:bg-slate-900'}
                          `}
                        >
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleFileChange}
                          />
                          {paymentReceipt ? (
                            <>
                               <CheckCircle className="text-green-500 mb-2" size={24} />
                               <span className="text-xs text-green-400 font-bold truncate max-w-full px-2">{receiptFileName}</span>
                               <span className="text-[10px] text-slate-500 mt-1">Click to change</span>
                            </>
                          ) : (
                            <>
                               <Upload className="text-slate-500 mb-2" size={24} />
                               <span className="text-xs text-slate-400 font-bold">Upload Receipt</span>
                            </>
                          )}
                        </div>
                      </div>

                    </div>
                 </div>
               </div>

               {/* Column 2: Order Summary & Action */}
               <div className="space-y-4">
                 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-24">
                   <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                     <ShoppingCart size={20} className="text-violet-500"/> Order Summary
                   </h3>
                   
                   {error && (
                     <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
                       <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                       <p className="text-sm text-red-200">{error}</p>
                     </div>
                   )}

                   {!user && (
                     <div className="mb-6 p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg flex items-start gap-3">
                       <UserIcon className="text-violet-400 shrink-0 mt-0.5" size={18} />
                       <p className="text-sm text-violet-200">
                         You must <span className="font-bold cursor-pointer underline" onClick={() => setView('LOGIN')}>Login</span> to complete this purchase.
                       </p>
                     </div>
                   )}
                   
                    <div className="mb-6 space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {cart.map(item => (
                        <div key={item.id} className="flex justify-between text-xs text-slate-400">
                          <span>{item.quantityLabel} {item.boostType} ({item.platform}) x {item.count}</span>
                          <span className="text-white">LKR {(item.price * item.count).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                   <div className="space-y-3 mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
                     <div className="flex justify-between text-slate-400">
                       <span>Subtotal</span>
                       <span>LKR {cartTotal.toLocaleString()}</span>
                     </div>
                     <div className="h-px bg-slate-800 my-2"></div>
                     <div className="flex justify-between text-white font-bold text-lg">
                       <span>Total</span>
                       <span>LKR {cartTotal.toLocaleString()}</span>
                     </div>
                   </div>

                   <button
                     onClick={handleFinalPurchase}
                     disabled={isProcessing || cart.length === 0 || !user || !isPaymentValid}
                     className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                   >
                     {isProcessing ? 'Processing...' : user ? 'Confirm & Purchase' : 'Login to Purchase'}
                   </button>
                   
                   {!isPaymentValid && user && (
                     <p className="text-[10px] text-red-400 text-center mt-3">
                       Please enter a valid 10-digit Sender Phone AND (14-digit Ref No OR Upload Receipt) to continue.
                     </p>
                   )}
                   
                   <p className="text-xs text-slate-600 text-center mt-4">
                     By clicking purchase, you agree to our Terms of Service.
                   </p>
                 </div>
               </div>
             </div>
           </div>
        )}
      </main>

      {/* Footer */}
      {(view !== 'CHECKOUT' && view !== 'ADMIN') && (
        <Footer />
      )}
    </div>
  );
}
