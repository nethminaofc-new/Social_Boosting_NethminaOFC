import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  total: number;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onRemove,
  onUpdateQuantity,
  total,
  onCheckout,
}) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 z-[70] shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShoppingBag className="text-violet-500" />
              Your Cart
            </h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                <ShoppingBag size={48} className="opacity-20" />
                <p>Your cart is empty.</p>
                <button 
                  onClick={onClose}
                  className="text-violet-400 hover:text-violet-300 font-medium"
                >
                  Browse Services
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 flex gap-4">
                  {/* Icon/Image Placeholder */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0
                    ${item.platform === 'tiktok' ? 'bg-black text-white' : ''}
                    ${item.platform === 'youtube' ? 'bg-red-600 text-white' : ''}
                    ${item.platform === 'instagram' ? 'bg-pink-600 text-white' : ''}
                    ${item.platform === 'facebook' ? 'bg-blue-600 text-white' : ''}
                  `}>
                    <span className="font-bold text-xs uppercase">{item.platform.substring(0,2)}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium text-white truncate pr-2">
                        {item.quantityLabel} {item.boostType}
                      </h3>
                      <button 
                        onClick={() => onRemove(item.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 truncate mb-3">{item.link}</p>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3 bg-slate-900 rounded-lg p-1 border border-slate-700">
                        <button 
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="p-1 hover:text-white text-slate-400 disabled:opacity-30"
                          disabled={item.count <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-mono font-medium w-4 text-center">{item.count}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="p-1 hover:text-white text-slate-400"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="font-bold text-violet-400">
                        LKR {(item.price * item.count).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-slate-800 bg-slate-900">
              <div className="flex justify-between items-center mb-6">
                <span className="text-slate-400">Total</span>
                <span className="text-2xl font-bold text-white">LKR {total.toLocaleString()}</span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all flex justify-center items-center gap-2"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};