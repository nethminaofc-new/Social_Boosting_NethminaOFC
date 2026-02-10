import React, { useEffect, useState } from 'react';
import { getOrdersByCustomer } from '../services/dbService';
import { StoredOrder } from '../types';
import { Clock, CheckCircle, XCircle, Loader2, ExternalLink, RefreshCw, Bell, MessageCircle } from 'lucide-react';

interface CustomerOrdersProps {
  customerId: string;
}

export const CustomerOrders: React.FC<CustomerOrdersProps> = ({ customerId }) => {
  const [orders, setOrders] = useState<StoredOrder[]>([]);

  const fetchOrders = () => {
    const data = getOrdersByCustomer(customerId);
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
    // Poll for updates every 5 seconds to simulate real-time updates from admin
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [customerId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'Processing': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Completed': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'Cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock size={16} />;
      case 'Processing': return <Loader2 size={16} className="animate-spin" />;
      case 'Completed': return <CheckCircle size={16} />;
      case 'Cancelled': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
             <Bell className="text-violet-500" /> Notifications & Orders
           </h1>
           <p className="text-slate-400">Track the status of your boosts in real-time.</p>
        </div>
        <button 
          onClick={fetchOrders}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors flex items-center gap-2 text-sm font-medium px-4"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
          <Bell size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-slate-300 mb-2">No notifications yet</h3>
          <p className="text-slate-500">You haven't placed any orders yet. Start a boost to see updates here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.orderId} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-violet-500/30 transition-all shadow-lg">
              {/* Header */}
              <div className="bg-slate-800/50 p-4 flex flex-wrap gap-4 justify-between items-center border-b border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-700 font-mono text-sm text-violet-400 font-bold">
                    #{order.orderId}
                  </div>
                  <div className="text-slate-400 text-sm flex items-center gap-2">
                    <Clock size={14} /> {order.orderDate}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                {/* Admin Message Panel - VISIBLE TO CUSTOMER */}
                {order.adminNote && (
                  <div className="mb-6 p-4 bg-violet-600/10 border border-violet-500/30 rounded-2xl flex gap-4 animate-pulse-slow">
                     <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
                        <MessageCircle size={20} className="text-white" />
                     </div>
                     <div>
                        <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest block mb-1">Update from NethminaOFC Support</span>
                        <p className="text-sm text-slate-200 leading-relaxed">{order.adminNote}</p>
                     </div>
                  </div>
                )}

                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold uppercase shrink-0
                          ${item.platform === 'tiktok' ? 'bg-black text-white' : ''}
                          ${item.platform === 'youtube' ? 'bg-red-600 text-white' : ''}
                          ${item.platform === 'instagram' ? 'bg-pink-600 text-white' : ''}
                          ${item.platform === 'facebook' ? 'bg-blue-600 text-white' : ''}
                        `}>
                          {item.platform.substring(0,2)}
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-bold text-white flex items-center gap-2">
                            {item.quantityLabel} {item.boostType}
                            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-normal">x{item.count}</span>
                          </div>
                          <a 
                            href={item.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs text-blue-400 hover:underline flex items-center gap-1 mt-1 truncate"
                          >
                            <ExternalLink size={10} /> {item.link}
                          </a>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs text-slate-500">Item Price</div>
                        <div className="font-bold text-slate-200">LKR {(item.price * item.count).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
                  <div className="text-sm text-slate-500">
                    Total Amount
                  </div>
                  <div className="text-xl font-bold text-white">
                    LKR {order.totalAmount.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};