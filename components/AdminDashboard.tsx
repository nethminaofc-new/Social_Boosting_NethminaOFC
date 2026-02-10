
import React, { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus, deleteOrder, updateOrderAdminNote } from '../services/dbService';
import { StoredOrder, OrderStatus } from '../types';
// Added missing Bell icon import
import { Search, RefreshCw, Trash2, Download, Filter, ExternalLink, ChevronLeft, ChevronRight, Phone, ImageIcon, X, MessageSquareText, Send, Bell } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<StoredOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Receipt Modal State
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Admin Note Input State
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const data = getAllOrders();
    setOrders(data);
    setFilteredOrders(data);
  }, [refreshKey]);

  useEffect(() => {
    let result = orders;

    // Filter by Status
    if (statusFilter !== 'All') {
      result = result.filter(o => o.status === statusFilter);
    }

    // Filter by Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(o => 
        o.orderId.toLowerCase().includes(lower) || 
        o.customerContact.includes(lower) ||
        o.customerId.toLowerCase().includes(lower) ||
        (o.payment?.senderPhone && o.payment.senderPhone.includes(lower)) ||
        (o.payment?.referenceNumber && o.payment.referenceNumber.includes(lower))
      );
    }

    setFilteredOrders(result);
    setCurrentPage(1); // Reset to first page on filter change
  }, [orders, searchTerm, statusFilter]);

  const handleStatusChange = (id: string, newStatus: OrderStatus) => {
    updateOrderStatus(id, newStatus);
    setRefreshKey(prev => prev + 1); // Trigger reload
  };

  const handleSendNote = (id: string) => {
    updateOrderAdminNote(id, noteValue);
    setActiveNoteId(null);
    setNoteValue('');
    setRefreshKey(prev => prev + 1);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      deleteOrder(id);
      setRefreshKey(prev => prev + 1);
    }
  };

  const exportCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer ID', 'Contact', 'Platform', 'Service', 'Quantity', 'Link', 'Note', 'Unit Price', 'Total', 'Status', 'PayMethod', 'SenderPhone', 'RefNo'];
    
    // Flatten items for CSV
    const rows: string[][] = [];
    filteredOrders.forEach(o => {
      o.items.forEach(item => {
        rows.push([
          o.orderId,
          o.orderDate,
          o.customerId,
          o.customerContact,
          item.platform,
          item.boostType,
          item.quantityLabel,
          item.link,
          item.note || '',
          item.price.toFixed(2),
          o.totalAmount.toFixed(2),
          o.status,
          o.payment?.method || 'N/A',
          o.payment?.senderPhone || 'N/A',
          o.payment?.referenceNumber || 'N/A'
        ]);
      });
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nethmina_orders_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">Manage orders, check statuses, and review details</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setRefreshKey(k => k+1)} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-300">
            <RefreshCw size={20} />
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors">
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Search Order ID, Customer, Phone, Ref No..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-4 pl-10 text-white outline-none focus:ring-2 focus:ring-violet-500"
          />
          <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-slate-500" size={18} />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 rounded-lg py-2 px-4 text-white outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden overflow-x-auto shadow-xl">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-800 text-slate-200 uppercase font-bold text-xs">
            <tr>
              <th className="p-4 w-32">Order Info</th>
              <th className="p-4 w-40">Payment Info</th>
              <th className="p-4 min-w-[300px]">Order Details</th>
              <th className="p-4 w-24 text-right">Total</th>
              <th className="p-4 w-32 text-center">Status</th>
              <th className="p-4 w-16 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {currentOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              currentOrders.map(order => (
                <tr key={order.orderId} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 align-top">
                    <div className="font-mono font-bold text-violet-400 mb-1">{order.orderId}</div>
                    <div className="text-[10px] text-slate-500">{order.orderDate}</div>
                    <div className="text-white font-mono text-[10px] bg-slate-800 px-2 py-1 rounded w-fit mt-2 border border-slate-700">
                      {order.customerId}
                    </div>
                  </td>
                  
                  <td className="p-4 align-top">
                    <div className="flex flex-col gap-1">
                      <span className="text-white font-bold text-xs">Ez Cash</span>
                      <div className="text-xs text-slate-300">
                        <span className="text-slate-500 block text-[10px] uppercase">Sender:</span>
                        {order.payment?.senderPhone || 'N/A'}
                      </div>
                      <div className="text-xs text-slate-300">
                        <span className="text-slate-500 block text-[10px] uppercase">Ref:</span>
                        {order.payment?.referenceNumber || 'N/A'}
                      </div>
                      {order.payment?.receiptImage && (
                        <button 
                          onClick={() => setPreviewImage(order.payment?.receiptImage || null)}
                          className="mt-2 flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-blue-400 px-2 py-1 rounded border border-slate-700 transition-colors w-fit"
                        >
                          <ImageIcon size={10} /> View Receipt
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`w-2 h-2 rounded-full 
                              ${item.platform === 'tiktok' ? 'bg-cyan-400' : ''}
                              ${item.platform === 'youtube' ? 'bg-red-500' : ''}
                              ${item.platform === 'instagram' ? 'bg-pink-500' : ''}
                              ${item.platform === 'facebook' ? 'bg-blue-500' : ''}
                            `}></span>
                            <span className="font-bold text-white uppercase text-xs">{item.platform}</span>
                            <span className="text-slate-500">|</span>
                            <span className="text-slate-200 font-medium">{item.boostType}</span>
                            <span className="text-slate-500">|</span>
                            <span className="text-fuchsia-400 font-bold">{item.quantityLabel}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-blue-400 mb-2 overflow-hidden">
                             <ExternalLink size={10} className="shrink-0"/>
                             <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline truncate block text-[10px]">
                               {item.link}
                             </a>
                          </div>

                          {item.note && (
                            <div className="mb-2 p-2 bg-violet-500/10 border border-violet-500/20 rounded text-[11px] text-violet-200 flex gap-2 items-start">
                              <MessageSquareText size={14} className="shrink-0 text-violet-400" />
                              <div className="italic">
                                <span className="font-bold text-violet-400 not-italic block mb-0.5">Customer Note:</span>
                                {item.note}
                              </div>
                            </div>
                          )}

                          <div className="text-[10px] text-slate-500 flex justify-between">
                            <span>Unit Price: LKR {item.price.toLocaleString()}</span>
                            <span>x{item.count}</span>
                          </div>
                        </div>
                      ))}

                      {/* Admin Messaging Section */}
                      <div className="mt-4 border-t border-slate-800 pt-3">
                        {order.adminNote ? (
                           <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-3 mb-2 flex gap-3 items-start">
                              <Bell size={14} className="shrink-0 text-emerald-400 mt-0.5" />
                              <div className="flex-1">
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">Sent to Customer</span>
                                <p className="text-xs text-slate-200">{order.adminNote}</p>
                                <button 
                                  onClick={() => {
                                    setNoteValue(order.adminNote || '');
                                    setActiveNoteId(order.orderId);
                                  }}
                                  className="mt-2 text-[10px] text-slate-500 hover:text-white underline"
                                >
                                  Edit Message
                                </button>
                              </div>
                           </div>
                        ) : (
                          <button 
                            onClick={() => setActiveNoteId(order.orderId)}
                            className="flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
                          >
                            <MessageSquareText size={14} /> Send message to customer
                          </button>
                        )}

                        {activeNoteId === order.orderId && (
                          <div className="mt-2 space-y-2 animate-fade-in">
                            <textarea 
                              value={noteValue}
                              onChange={(e) => setNoteValue(e.target.value)}
                              placeholder="Type a message or update for the customer..."
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:ring-1 focus:ring-violet-500 outline-none h-20"
                            />
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleSendNote(order.orderId)}
                                className="flex-1 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold py-2 rounded flex items-center justify-center gap-2 transition-colors"
                              >
                                <Send size={12} /> Send Message
                              </button>
                              <button 
                                onClick={() => setActiveNoteId(null)}
                                className="px-3 border border-slate-700 text-slate-500 text-[10px] py-2 rounded hover:bg-slate-800 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="p-4 align-top text-right">
                    <div className="font-bold text-white text-lg">
                      LKR {Number(order.totalAmount).toLocaleString()}
                    </div>
                  </td>

                  <td className="p-4 align-top text-center">
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.orderId, e.target.value as OrderStatus)}
                      className={`py-1 px-3 rounded-full text-xs font-bold outline-none border-2 cursor-pointer w-full
                        ${order.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50' : ''}
                        ${order.status === 'Processing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/50' : ''}
                        ${order.status === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/50' : ''}
                        ${order.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/50' : ''}
                      `}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>

                  <td className="p-4 align-top text-right">
                    <button 
                      onClick={() => handleDelete(order.orderId)}
                      className="p-2 bg-slate-800 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-all"
                      title="Delete Order"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          
          <span className="text-slate-400 text-sm">
            Page <span className="text-white font-bold">{currentPage}</span> of {totalPages}
          </span>

          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl w-full max-h-[90vh] bg-slate-900 rounded-2xl p-2 border border-slate-700 overflow-hidden flex flex-col">
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={() => setPreviewImage(null)}
                className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-md"
              >
                <X size={24} />
              </button>
            </div>
            <img src={previewImage} alt="Receipt" className="w-full h-auto object-contain max-h-[85vh] rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
};
