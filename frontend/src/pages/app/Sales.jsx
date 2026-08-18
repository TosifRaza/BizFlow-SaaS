// import { useState, useEffect, useCallback } from 'react';
// import {
//   HiOutlineEye,
//   HiOutlinePrinter,
//   HiOutlineArrowUturnLeft,
//   HiOutlineXMark,
//   HiOutlineCurrencyRupee,
//   HiOutlineCreditCard,
//   HiOutlineMagnifyingGlass,
//   HiOutlineArrowDownTray,
// } from 'react-icons/hi2';
// import toast from 'react-hot-toast';

// import PageHeader from '../../components/PageHeader';
// import DataTable from '../../components/DataTable';
// import Modal from '../../components/Modal';
// import FormInput from '../../components/FormInput';
// import FormSelect from '../../components/FormSelect';
// import Button from '../../components/Button';
// import Badge from '../../components/Badge';
// import EmptyState from '../../components/EmptyState';
// import LoadingSpinner from '../../components/LoadingSpinner';
// import ConfirmDialog from '../../components/ConfirmDialog';
// import { saleApi } from '../../api/saleApi';
// import { formatCurrency, formatDate, PAYMENT_METHODS } from '../../utils/helpers';
// import { useAuth } from '../../context/AuthContext';

// const STATUS_OPTIONS = [
//   { value: '', label: 'All Statuses' },
//   { value: 'completed', label: 'Completed' },
//   { value: 'partial', label: 'Partial' },
//   { value: 'credit', label: 'Credit' },
//   { value: 'voided', label: 'Voided' },
// ];

// const PAYMENT_FILTER_OPTIONS = [
//   { value: '', label: 'All Methods' },
//   ...PAYMENT_METHODS,
// ];

// const STATUS_BADGE_MAP = {
//   completed: 'success',
//   partial: 'warning',
//   credit: 'warning',
//   voided: 'danger',
// };

// function Sales() {
//   const { user } = useAuth();

//   // Data state
//   const [sales, setSales] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

//   // Filter state
//   const [filters, setFilters] = useState({
//     dateFrom: '',
//     dateTo: '',
//     status: '',
//     paymentMethod: '',
//     search: '',
//   });

//   // Modal states
//   const [selectedSale, setSelectedSale] = useState(null);
//   const [showDetailModal, setShowDetailModal] = useState(false);
//   const [showReturnModal, setShowReturnModal] = useState(false);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [showVoidConfirm, setShowVoidConfirm] = useState(false);

//   // Return modal state
//   const [returnItems, setReturnItems] = useState([]);
//   const [returnReason, setReturnReason] = useState('');
//   const [returning, setReturning] = useState(false);

//   // Payment modal state
//   const [paymentForm, setPaymentForm] = useState({ amount: '', paymentMethod: 'cash' });
//   const [recordingPayment, setRecordingPayment] = useState(false);

//   // Voiding state
//   const [voiding, setVoiding] = useState(false);

//   // Detail loading
//   const [detailLoading, setDetailLoading] = useState(false);
//   const [saleDetail, setSaleDetail] = useState(null);

//   // Load sales
//   const loadSales = useCallback(async () => {
//     setLoading(true);
//     try {
//       const params = {
//         page: pagination.page,
//         limit: pagination.limit,
//       };
//       if (filters.dateFrom) params.dateFrom = filters.dateFrom;
//       if (filters.dateTo) params.dateTo = filters.dateTo;
//       if (filters.status) params.status = filters.status;
//       if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
//       if (filters.search) params.search = filters.search;

//       const res = await saleApi.getAll(params);
//       const data = res.data?.data || res.data || {};
//       const items = Array.isArray(data) ? data : data.items || data.data || [];
//       setSales(items);
//       setPagination((prev) => ({
//         ...prev,
//         total: data.total || items.length || 0,
//       }));
//     } catch (err) {
//       console.error('Failed to load sales:', err);
//       toast.error('Failed to load sales');
//     } finally {
//       setLoading(false);
//     }
//   }, [pagination.page, pagination.limit, filters]);

//   useEffect(() => {
//     loadSales();
//   }, [loadSales]);

//   // Filter handlers
//   const handleFilterChange = (key, value) => {
//     setFilters((prev) => ({ ...prev, [key]: value }));
//     setPagination((prev) => ({ ...prev, page: 1 }));
//   };

//   // View sale detail
//   const handleViewSale = async (sale) => {
//     setSelectedSale(sale);
//     setShowDetailModal(true);
//     setDetailLoading(true);
//     try {
//       const res = await saleApi.getById(sale.id);
//       setSaleDetail(res.data?.data || res.data);
//     } catch (err) {
//       console.error('Failed to load sale detail:', err);
//       setSaleDetail(sale);
//     } finally {
//       setDetailLoading(false);
//     }
//   };

//   // Record Payment
//   const handleOpenPayment = (sale) => {
//     setSelectedSale(sale);
//     setPaymentForm({
//       amount: String(sale.amountDue || (sale.total - sale.amountPaid) || 0),
//       paymentMethod: 'cash',
//     });
//     setShowPaymentModal(true);
//   };

//   const handleRecordPayment = async () => {
//     const amount = Number(paymentForm.amount);
//     if (!amount || amount <= 0) {
//       toast.error('Please enter a valid amount');
//       return;
//     }
//     setRecordingPayment(true);
//     try {
//       await saleApi.recordPayment(selectedSale.id, {
//         amount,
//         paymentMethod: paymentForm.paymentMethod,
//       });
//       toast.success('Payment recorded successfully');
//       setShowPaymentModal(false);
//       loadSales();
//       // Refresh detail if modal is open
//       if (showDetailModal && selectedSale) {
//         const res = await saleApi.getById(selectedSale.id);
//         setSaleDetail(res.data?.data || res.data);
//       }
//     } catch (err) {
//       console.error('Failed to record payment:', err);
//       toast.error(err.response?.data?.message || 'Failed to record payment');
//     } finally {
//       setRecordingPayment(false);
//     }
//   };

//   // Return Sale
//   const handleOpenReturn = (sale) => {
//     setSelectedSale(sale);
//     const items = (sale.items || []).map((item) => ({
//       ...item,
//       selected: false,
//       returnQty: 0,
//     }));
//     setReturnItems(items);
//     setReturnReason('');
//     setShowReturnModal(true);
//   };

//   const handleReturnItemToggle = (index) => {
//     setReturnItems((prev) =>
//       prev.map((item, i) =>
//         i === index
//           ? {
//               ...item,
//               selected: !item.selected,
//               returnQty: !item.selected ? 1 : 0,
//             }
//           : item
//       )
//     );
//   };

//   const handleReturnQtyChange = (index, qty) => {
//     setReturnItems((prev) =>
//       prev.map((item, i) =>
//         i === index
//           ? {
//               ...item,
//               returnQty: Math.min(Math.max(0, Number(qty) || 0), item.quantity),
//             }
//           : item
//       )
//     );
//   };

//   const handleSubmitReturn = async () => {
//     const selectedReturnItems = returnItems.filter(
//       (item) => item.selected && item.returnQty > 0
//     );
//     if (selectedReturnItems.length === 0) {
//       toast.error('Please select at least one item to return');
//       return;
//     }
//     if (!returnReason.trim()) {
//       toast.error('Please provide a reason for the return');
//       return;
//     }
//     setReturning(true);
//     try {
//       await saleApi.returnSale(selectedSale.id, {
//         items: selectedReturnItems.map((item) => ({
//           productId: item.productId,
//           quantity: item.returnQty,
//         })),
//         reason: returnReason.trim(),
//       });
//       toast.success('Sale returned successfully');
//       setShowReturnModal(false);
//       setShowDetailModal(false);
//       loadSales();
//     } catch (err) {
//       console.error('Failed to return sale:', err);
//       toast.error(err.response?.data?.message || 'Failed to return sale');
//     } finally {
//       setReturning(false);
//     }
//   };

//   // Void Sale
//   const handleOpenVoid = (sale) => {
//     setSelectedSale(sale);
//     setShowVoidConfirm(true);
//   };

//   const handleVoidSale = async () => {
//     setVoiding(true);
//     try {
//       await saleApi.voidSale(selectedSale.id, { reason: 'Voided by user' });
//       toast.success('Sale voided successfully');
//       setShowVoidConfirm(false);
//       setShowDetailModal(false);
//       loadSales();
//     } catch (err) {
//       console.error('Failed to void sale:', err);
//       toast.error(err.response?.data?.message || 'Failed to void sale');
//     } finally {
//       setVoiding(false);
//     }
//   };

//   // Download Invoice PDF
//   const handleDownloadPDF = async (sale) => {
//     const s = saleDetail || sale;
//     try {
//       const response = await saleApi.downloadPdf(s.id);
//       const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `invoice-${s.invoiceNo || s.invoiceNumber || s.id}.pdf`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);
//       toast.success('PDF downloaded');
//     } catch {
//       toast.error('Failed to download PDF');
//     }
//   };

//   // Print Invoice
//   const handlePrintInvoice = (sale) => {
//     const s = saleDetail || sale;
//     const printWindow = window.open('', '_blank');
//     if (!printWindow) {
//       toast.error('Please allow popups to print invoices');
//       return;
//     }
//     const customerName = s.customer?.name || 'Walk-in Customer';
//     const customerPhone = s.customer?.phone || '';
//     const items = s.items || [];
//     const subtotal = s.subtotal || items.reduce((sum, i) => sum + (i.total || i.unitPrice * i.quantity), 0);
//     const tax = s.tax || items.reduce((sum, i) => sum + (i.tax || 0), 0);
//     const discount = s.discount || 0;
//     const total = s.total || subtotal + tax - discount;
//     const paid = s.amountPaid || 0;
//     const due = total - paid;

//     printWindow.document.write(`
//       <html><head><title>Invoice ${s.invoiceNo || s.id}</title>
//       <style>
//         body { font-family: system-ui, -apple-system, sans-serif; max-width: 420px; margin: 0 auto; padding: 24px; font-size: 13px; color: #1f2937; }
//         .header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 16px; margin-bottom: 20px; }
//         .header h1 { margin: 0 0 4px; font-size: 22px; } .header p { margin: 2px 0; color: #6b7280; font-size: 12px; }
//         .info { margin-bottom: 16px; } .info p { margin: 3px 0; }
//         table { width: 100%; border-collapse: collapse; margin: 12px 0; }
//         th { font-weight: 600; font-size: 11px; text-transform: uppercase; color: #6b7280; text-align: left; padding: 8px 4px; border-bottom: 2px solid #e5e7eb; }
//         td { padding: 8px 4px; border-bottom: 1px solid #f3f4f6; } .text-right { text-align: right; }
//         .totals { margin-top: 12px; } .totals .row { display: flex; justify-content: space-between; padding: 4px 0; }
//         .totals .grand { font-size: 18px; font-weight: 700; border-top: 2px solid #111; padding-top: 10px; margin-top: 6px; }
//         .footer { text-align: center; margin-top: 28px; color: #9ca3af; font-size: 11px; }
//         @media print { body { padding: 0; } }
//       </style></head><body>
//       <div class="header">
//         <h1>INVOICE</h1>
//         <p>${s.invoiceNo || '#' + s.id}</p>
//         <p>${formatDate(s.createdAt || s.date)}</p>
//       </div>
//       <div class="info">
//         <p><strong>Customer:</strong> ${customerName}${customerPhone ? ' | ' + customerPhone : ''}</p>
//         <p><strong>Status:</strong> ${(s.status || 'completed').toUpperCase()}</p>
//         <p><strong>Payment:</strong> ${(s.paymentMethod || 'cash').toUpperCase()}</p>
//       </div>
//       <table>
//         <thead><tr><th>Item</th><th class="text-right">Qty</th><th class="text-right">Price</th><th class="text-right">Total</th></tr></thead>
//         <tbody>
//           ${items.map(i => `<tr><td>${i.productName || i.name || 'Item'}</td><td class="text-right">${i.quantity}</td><td class="text-right">${formatCurrency(i.unitPrice)}</td><td class="text-right">${formatCurrency(i.total || i.unitPrice * i.quantity)}</td></tr>`).join('')}
//         </tbody>
//       </table>
//       <div class="totals">
//         <div class="row"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
//         ${discount > 0 ? `<div class="row"><span>Discount</span><span>-${formatCurrency(discount)}</span></div>` : ''}
//         ${tax > 0 ? `<div class="row"><span>Tax</span><span>${formatCurrency(tax)}</span></div>` : ''}
//         <div class="row grand"><span>Grand Total</span><span>${formatCurrency(total)}</span></div>
//         <div class="row"><span>Paid</span><span>${formatCurrency(paid)}</span></div>
//         ${due > 0 ? `<div class="row" style="color:#dc2626"><span>Due</span><span>${formatCurrency(due)}</span></div>` : ''}
//       </div>
//       <div class="footer"><p>Thank you for your purchase!</p></div>
//       </body></html>
//     `);
//     printWindow.document.close();
//     setTimeout(() => printWindow.print(), 500);
//   };

//   // Table columns
//   const columns = [
//     {
//       key: 'invoiceNo',
//       label: 'Invoice #',
//       sortable: true,
//       render: (val, row) => (
//         <button
//           onClick={() => handleViewSale(row)}
//           className="font-semibold text-gray-900 hover:text-emerald-600 hover:underline cursor-pointer"
//         >
//           {val || `#${row.id}`}
//         </button>
//       ),
//     },
//     {
//       key: 'customer',
//       label: 'Customer',
//       sortable: true,
//       render: (val, row) => (
//         <span>
//           {val?.name || row.customerName || 'Walk-in'}
//         </span>
//       ),
//     },
//     {
//       key: 'createdAt',
//       label: 'Date',
//       sortable: true,
//       render: (val) => formatDate(val),
//     },
//     {
//       key: 'total',
//       label: 'Amount',
//       sortable: true,
//       render: (val) => <span className="font-bold text-gray-900">{formatCurrency(val)}</span>,
//     },
//     {
//       key: 'status',
//       label: 'Status',
//       sortable: true,
//       render: (val) => (
//         <Badge variant={STATUS_BADGE_MAP[val] || 'gray'}>
//           {val ? val.charAt(0).toUpperCase() + val.slice(1) : 'Unknown'}
//         </Badge>
//       ),
//     },
//     {
//       key: 'paymentMethod',
//       label: 'Payment',
//       render: (val) => (
//         <span className="capitalize text-gray-600">
//           {val ? val.charAt(0).toUpperCase() + val.slice(1) : '—'}
//         </span>
//       ),
//     },
//     {
//       key: 'createdBy',
//       label: 'Created By',
//       render: (val) => (
//         <span className="text-gray-500">{val?.name || val || '—'}</span>
//       ),
//     },
//   ];

//   // Actions renderer
//   const renderActions = (row) => (
//     <div className="flex items-center gap-1">
//       <button
//         onClick={() => handleViewSale(row)}
//         title="View Details"
//         className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
//       >
//         <HiOutlineEye className="w-4 h-4" />
//       </button>
//       {(row.status === 'partial' || row.status === 'credit') && (
//         <button
//           onClick={() => handleOpenPayment(row)}
//           title="Record Payment"
//           className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
//         >
//           <HiOutlineCurrencyRupee className="w-4 h-4" />
//         </button>
//       )}
//       {row.status === 'completed' && (
//         <button
//           onClick={() => handleOpenReturn(row)}
//           title="Return Sale"
//           className="p-1.5 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
//         >
//           <HiOutlineArrowUturnLeft className="w-4 h-4" />
//         </button>
//       )}
//       {row.status === 'completed' && (
//         <button
//           onClick={() => handleOpenVoid(row)}
//           title="Void Sale"
//           className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
//         >
//           <HiOutlineXMark className="w-4 h-4" />
//         </button>
//       )}
//     </div>
//   );

//   return (
//     <div>
//       <PageHeader
//         title="Sales"
//         subtitle="View and manage all sales"
//       />

//       {/* Filter Bar */}
//       <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
//           <FormInput
//             name="dateFrom"
//             type="date"
//             label="From Date"
//             value={filters.dateFrom}
//             onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
//           />
//           <FormInput
//             name="dateTo"
//             type="date"
//             label="To Date"
//             value={filters.dateTo}
//             onChange={(e) => handleFilterChange('dateTo', e.target.value)}
//           />
//           <FormSelect
//             name="status"
//             label="Status"
//             value={filters.status}
//             onChange={(e) => handleFilterChange('status', e.target.value)}
//             options={STATUS_OPTIONS}
//           />
//           <FormSelect
//             name="paymentMethod"
//             label="Payment Method"
//             value={filters.paymentMethod}
//             onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
//             options={PAYMENT_FILTER_OPTIONS}
//           />
//           <FormInput
//             name="search"
//             label="Search"
//             placeholder="Invoice #, customer..."
//             value={filters.search}
//             onChange={(e) => handleFilterChange('search', e.target.value)}
//           />
//         </div>
//       </div>

//       {/* Data Table */}
//       {loading ? (
//         <LoadingSpinner type="table" />
//       ) : sales.length === 0 ? (
//         <EmptyState
//           icon={<HiOutlineCreditCard className="w-16 h-16" />}
//           title="No sales found"
//           description="Sales records will appear here once transactions are made."
//         />
//       ) : (
//         <DataTable
//           columns={columns}
//           data={sales}
//           pagination={pagination}
//           onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
//           actions={renderActions}
//         />
//       )}

//       {/* Sale Detail Modal */}
//       <Modal
//         isOpen={showDetailModal}
//         onClose={() => setShowDetailModal(false)}
//         size="xl"
//         title="Sale Details"
//       >
//         {detailLoading ? (
//           <div className="flex items-center justify-center py-12">
//             <LoadingSpinner type="page" />
//           </div>
//         ) : saleDetail ? (
//           <div className="space-y-5">
//             {/* Header */}
//             <div className="flex flex-wrap items-start justify-between gap-3">
//               <div>
//                 <h3 className="text-lg font-bold text-gray-900">
//                   {saleDetail.invoiceNo || `#${saleDetail.id}`}
//                 </h3>
//                 <p className="text-sm text-gray-500 mt-0.5">
//                   {formatDate(saleDetail.createdAt || saleDetail.date)}
//                 </p>
//               </div>
//               <Badge variant={STATUS_BADGE_MAP[saleDetail.status] || 'gray'}>
//                 {saleDetail.status ? saleDetail.status.charAt(0).toUpperCase() + saleDetail.status.slice(1) : 'Unknown'}
//               </Badge>
//             </div>

//             {/* Customer Info */}
//             <div className="bg-gray-50 rounded-lg p-4">
//               <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Customer</h4>
//               <p className="text-sm font-medium text-gray-900">
//                 {saleDetail.customer?.name || saleDetail.customerName || 'Walk-in Customer'}
//               </p>
//               {saleDetail.customer?.phone && (
//                 <p className="text-sm text-gray-500">{saleDetail.customer.phone}</p>
//               )}
//               {saleDetail.customer?.email && (
//                 <p className="text-sm text-gray-500">{saleDetail.customer.email}</p>
//               )}
//             </div>

//             {/* Items Table */}
//             <div>
//               <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Items</h4>
//               <div className="border border-gray-200 rounded-lg overflow-hidden">
//                 <table className="w-full text-sm">
//                   <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
//                     <tr>
//                       <th className="px-4 py-2.5 text-left">Product</th>
//                       <th className="px-4 py-2.5 text-right">Qty</th>
//                       <th className="px-4 py-2.5 text-right">Unit Price</th>
//                       <th className="px-4 py-2.5 text-right">Discount</th>
//                       <th className="px-4 py-2.5 text-right">Tax</th>
//                       <th className="px-4 py-2.5 text-right">Total</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-100">
//                     {(saleDetail.items || []).map((item, idx) => (
//                       <tr key={item.id || idx}>
//                         <td className="px-4 py-2.5 font-medium text-gray-900">
//                           {item.productName || item.name || 'Item'}
//                         </td>
//                         <td className="px-4 py-2.5 text-right text-gray-600">
//                           {item.quantity}
//                         </td>
//                         <td className="px-4 py-2.5 text-right text-gray-600">
//                           {formatCurrency(item.unitPrice)}
//                         </td>
//                         <td className="px-4 py-2.5 text-right text-gray-600">
//                           {item.discount ? formatCurrency(item.discount) : '—'}
//                         </td>
//                         <td className="px-4 py-2.5 text-right text-gray-600">
//                           {item.tax ? formatCurrency(item.tax) : '—'}
//                         </td>
//                         <td className="px-4 py-2.5 text-right font-medium text-gray-900">
//                           {formatCurrency(item.total || item.unitPrice * item.quantity)}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* Summary */}
//             <div className="bg-gray-50 rounded-lg p-4">
//               <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Summary</h4>
//               <div className="space-y-2 max-w-xs ml-auto">
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-500">Subtotal</span>
//                   <span className="font-medium text-gray-700">
//                     {formatCurrency(saleDetail.subtotal)}
//                   </span>
//                 </div>
//                 {(saleDetail.discount || 0) > 0 && (
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-500">Discount</span>
//                     <span className="font-medium text-red-500">
//                       -{formatCurrency(saleDetail.discount)}
//                     </span>
//                   </div>
//                 )}
//                 {(saleDetail.tax || 0) > 0 && (
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-500">Tax</span>
//                     <span className="font-medium text-gray-700">
//                       {formatCurrency(saleDetail.tax)}
//                     </span>
//                   </div>
//                 )}
//                 <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
//                   <span className="text-gray-900">Grand Total</span>
//                   <span className="text-gray-900">
//                     {formatCurrency(saleDetail.total)}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Payment Info */}
//             <div className="bg-gray-50 rounded-lg p-4">
//               <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Payment</h4>
//               <div className="grid grid-cols-3 gap-4">
//                 <div>
//                   <p className="text-xs text-gray-500">Method</p>
//                   <p className="text-sm font-medium text-gray-900 capitalize mt-0.5">
//                     {saleDetail.paymentMethod || '—'}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500">Amount Paid</p>
//                   <p className="text-sm font-medium text-emerald-600 mt-0.5">
//                     {formatCurrency(saleDetail.amountPaid || 0)}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500">Amount Due</p>
//                   <p className={`text-sm font-medium mt-0.5 ${(saleDetail.total - (saleDetail.amountPaid || 0)) > 0 ? 'text-red-500' : 'text-gray-900'}`}>
//                     {formatCurrency((saleDetail.total || 0) - (saleDetail.amountPaid || 0))}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Notes */}
//             {saleDetail.notes && (
//               <div>
//                 <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</h4>
//                 <p className="text-sm text-gray-600">{saleDetail.notes}</p>
//               </div>
//             )}

//             {/* Actions */}
//             <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
//               <Button
//                 variant="secondary"
//                 icon={HiOutlineArrowDownTray}
//                 onClick={() => handleDownloadPDF(saleDetail)}
//               >
//                 Download PDF
//               </Button>
//               <Button
//                 variant="secondary"
//                 icon={HiOutlinePrinter}
//                 onClick={() => handlePrintInvoice(saleDetail)}
//               >
//                 Print
//               </Button>
//               {(saleDetail.status === 'partial' || saleDetail.status === 'credit') && (
//                 <Button
//                   variant="primary"
//                   icon={HiOutlineCurrencyRupee}
//                   onClick={() => {
//                     setShowDetailModal(false);
//                     handleOpenPayment(saleDetail);
//                   }}
//                 >
//                   Record Payment
//                 </Button>
//               )}
//               {saleDetail.status === 'completed' && (
//                 <Button
//                   variant="secondary"
//                   icon={HiOutlineArrowUturnLeft}
//                   onClick={() => {
//                     setShowDetailModal(false);
//                     handleOpenReturn(saleDetail);
//                   }}
//                 >
//                   Return
//                 </Button>
//               )}
//               {saleDetail.status === 'completed' && (
//                 <Button
//                   variant="danger"
//                   icon={HiOutlineXMark}
//                   onClick={() => {
//                     setShowDetailModal(false);
//                     handleOpenVoid(saleDetail);
//                   }}
//                 >
//                   Void
//                 </Button>
//               )}
//             </div>
//           </div>
//         ) : null}
//       </Modal>

//       {/* Record Payment Modal */}
//       <Modal
//         isOpen={showPaymentModal}
//         onClose={() => setShowPaymentModal(false)}
//         size="sm"
//         title="Record Payment"
//       >
//         <div className="space-y-4">
//           <div className="bg-gray-50 rounded-lg p-3">
//             <p className="text-sm text-gray-500">Invoice</p>
//             <p className="font-semibold text-gray-900">
//               {selectedSale?.invoiceNo || `#${selectedSale?.id}`}
//             </p>
//             <p className="text-sm text-gray-500 mt-1">Amount Due</p>
//             <p className="text-lg font-bold text-red-500">
//               {formatCurrency(
//                 (selectedSale?.total || 0) - (selectedSale?.amountPaid || 0)
//               )}
//             </p>
//           </div>

//           <FormInput
//             label="Payment Amount"
//             name="amount"
//             type="number"
//             value={paymentForm.amount}
//             onChange={(e) =>
//               setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))
//             }
//             placeholder="Enter amount"
//             min="0"
//           />

//           <FormSelect
//             label="Payment Method"
//             name="paymentMethod"
//             value={paymentForm.paymentMethod}
//             onChange={(e) =>
//               setPaymentForm((prev) => ({ ...prev, paymentMethod: e.target.value }))
//             }
//             options={PAYMENT_METHODS}
//           />

//           <div className="flex gap-3 pt-2">
//             <Button
//               variant="secondary"
//               onClick={() => setShowPaymentModal(false)}
//               className="flex-1"
//               disabled={recordingPayment}
//             >
//               Cancel
//             </Button>
//             <Button
//               variant="success"
//               onClick={handleRecordPayment}
//               loading={recordingPayment}
//               className="flex-1"
//             >
//               Record Payment
//             </Button>
//           </div>
//         </div>
//       </Modal>

//       {/* Return Sale Modal */}
//       <Modal
//         isOpen={showReturnModal}
//         onClose={() => setShowReturnModal(false)}
//         size="lg"
//         title="Return Sale Items"
//       >
//         <div className="space-y-4">
//           <p className="text-sm text-gray-500">
//             Select items and quantities to return for invoice{' '}
//             <strong>{selectedSale?.invoiceNo || `#${selectedSale?.id}`}</strong>
//           </p>

//           {/* Return items table */}
//           <div className="border border-gray-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
//             <table className="w-full text-sm">
//               <thead className="bg-gray-50 text-xs text-gray-500 uppercase sticky top-0">
//                 <tr>
//                   <th className="px-3 py-2.5 text-left w-10"></th>
//                   <th className="px-3 py-2.5 text-left">Product</th>
//                   <th className="px-3 py-2.5 text-right">Sold</th>
//                   <th className="px-3 py-2.5 text-right">Return Qty</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {returnItems.map((item, idx) => (
//                   <tr key={item.id || idx} className={item.selected ? 'bg-amber-50' : ''}>
//                     <td className="px-3 py-2.5">
//                       <input
//                         type="checkbox"
//                         checked={item.selected}
//                         onChange={() => handleReturnItemToggle(idx)}
//                         className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
//                       />
//                     </td>
//                     <td className="px-3 py-2.5 font-medium text-gray-900">
//                       {item.productName || item.name || 'Item'}
//                     </td>
//                     <td className="px-3 py-2.5 text-right text-gray-500">
//                       {item.quantity}
//                     </td>
//                     <td className="px-3 py-2.5">
//                       <input
//                         type="number"
//                         min="0"
//                         max={item.quantity}
//                         value={item.returnQty}
//                         onChange={(e) => handleReturnQtyChange(idx, e.target.value)}
//                         disabled={!item.selected}
//                         className="w-20 px-2 py-1.5 text-sm text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-400"
//                       />
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Reason */}
//           <div>
//             <label className="text-sm font-medium text-gray-700 mb-1 block">
//               Reason for Return <span className="text-red-500">*</span>
//             </label>
//             <textarea
//               value={returnReason}
//               onChange={(e) => setReturnReason(e.target.value)}
//               rows={3}
//               placeholder="Enter reason for returning items..."
//               className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400 resize-none"
//             />
//           </div>

//           <div className="flex gap-3 pt-2">
//             <Button
//               variant="secondary"
//               onClick={() => setShowReturnModal(false)}
//               className="flex-1"
//               disabled={returning}
//             >
//               Cancel
//             </Button>
//             <Button
//               variant="primary"
//               onClick={handleSubmitReturn}
//               loading={returning}
//               className="flex-1"
//             >
//               Submit Return
//             </Button>
//           </div>
//         </div>
//       </Modal>

//       {/* Void Sale Confirm Dialog */}
//       <ConfirmDialog
//         isOpen={showVoidConfirm}
//         onConfirm={handleVoidSale}
//         onCancel={() => setShowVoidConfirm(false)}
//         title="Void Sale"
//         message="Are you sure you want to void this sale? This will restore the inventory and cannot be undone."
//         confirmText="Void Sale"
//         variant="danger"
//         loading={voiding}
//       />
//     </div>
//   );
// }

// export default Sales;
import { useState, useEffect, useCallback } from 'react';
import {
  HiOutlineEye,
  HiOutlinePrinter,
  HiOutlineArrowUturnLeft,
  HiOutlineXMark,
  HiOutlineCurrencyRupee,
  HiOutlineCreditCard,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowDownTray,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import FormSelect from '../../components/FormSelect';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import { saleApi } from '../../api/saleApi';
import { formatCurrency, formatDate, PAYMENT_METHODS } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'partial', label: 'Partial' },
  { value: 'credit', label: 'Credit' },
  { value: 'voided', label: 'Voided' },
];

const PAYMENT_FILTER_OPTIONS = [
  { value: '', label: 'All Methods' },
  ...PAYMENT_METHODS,
];

const STATUS_BADGE_MAP = {
  completed: 'success',
  partial: 'warning',
  credit: 'warning',
  voided: 'danger',
};

function Sales() {
  const { user, hasPermission } = useAuth();

  // Data state
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  // Filter state
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: '',
    paymentMethod: '',
    search: '',
  });

  // Modal states
  const [selectedSale, setSelectedSale] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showVoidConfirm, setShowVoidConfirm] = useState(false);

  // Return modal state
  const [returnItems, setReturnItems] = useState([]);
  const [returnReason, setReturnReason] = useState('');
  const [returning, setReturning] = useState(false);

  // Payment modal state
  const [paymentForm, setPaymentForm] = useState({ amount: '', paymentMethod: 'cash' });
  const [recordingPayment, setRecordingPayment] = useState(false);

  // Voiding state
  const [voiding, setVoiding] = useState(false);

  // Detail loading
  const [detailLoading, setDetailLoading] = useState(false);
  const [saleDetail, setSaleDetail] = useState(null);

  // Load sales
  const loadSales = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      if (filters.status) params.status = filters.status;
      if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
      if (filters.search) params.search = filters.search;

      const res = await saleApi.getAll(params);
      const data = res.data?.data || res.data || {};
      const items = Array.isArray(data) ? data : data.items || data.data || [];
      setSales(items);
      setPagination((prev) => ({
        ...prev,
        total: data.total || items.length || 0,
      }));
    } catch (err) {
      console.error('Failed to load sales:', err);
      toast.error('Failed to load sales');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // View sale detail
  const handleViewSale = async (sale) => {
    setSelectedSale(sale);
    setShowDetailModal(true);
    setDetailLoading(true);
    try {
      const res = await saleApi.getById(sale.id);
      setSaleDetail(res.data?.data || res.data);
    } catch (err) {
      console.error('Failed to load sale detail:', err);
      setSaleDetail(sale);
    } finally {
      setDetailLoading(false);
    }
  };

  // Record Payment
  const handleOpenPayment = (sale) => {
    setSelectedSale(sale);
    setPaymentForm({
      amount: String(sale.amountDue || (sale.total - sale.amountPaid) || 0),
      paymentMethod: 'cash',
    });
    setShowPaymentModal(true);
  };

  const handleRecordPayment = async () => {
    const amount = Number(paymentForm.amount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setRecordingPayment(true);
    try {
      await saleApi.recordPayment(selectedSale.id, {
        amount,
        paymentMethod: paymentForm.paymentMethod,
      });
      toast.success('Payment recorded successfully');
      setShowPaymentModal(false);
      loadSales();
      // Refresh detail if modal is open
      if (showDetailModal && selectedSale) {
        const res = await saleApi.getById(selectedSale.id);
        setSaleDetail(res.data?.data || res.data);
      }
    } catch (err) {
      console.error('Failed to record payment:', err);
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setRecordingPayment(false);
    }
  };

  // Return Sale
  const handleOpenReturn = (sale) => {
    setSelectedSale(sale);
    const items = (sale.items || []).map((item) => ({
      ...item,
      selected: false,
      returnQty: 0,
    }));
    setReturnItems(items);
    setReturnReason('');
    setShowReturnModal(true);
  };

  const handleReturnItemToggle = (index) => {
    setReturnItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              selected: !item.selected,
              returnQty: !item.selected ? 1 : 0,
            }
          : item
      )
    );
  };

  const handleReturnQtyChange = (index, qty) => {
    setReturnItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              returnQty: Math.min(Math.max(0, Number(qty) || 0), item.quantity),
            }
          : item
      )
    );
  };

  const handleSubmitReturn = async () => {
    const selectedReturnItems = returnItems.filter(
      (item) => item.selected && item.returnQty > 0
    );
    if (selectedReturnItems.length === 0) {
      toast.error('Please select at least one item to return');
      return;
    }
    if (!returnReason.trim()) {
      toast.error('Please provide a reason for the return');
      return;
    }
    setReturning(true);
    try {
      await saleApi.returnSale(selectedSale.id, {
        items: selectedReturnItems.map((item) => ({
          productId: item.productId,
          quantity: item.returnQty,
        })),
        reason: returnReason.trim(),
      });
      toast.success('Sale returned successfully');
      setShowReturnModal(false);
      setShowDetailModal(false);
      loadSales();
    } catch (err) {
      console.error('Failed to return sale:', err);
      toast.error(err.response?.data?.message || 'Failed to return sale');
    } finally {
      setReturning(false);
    }
  };

  // Void Sale
  const handleOpenVoid = (sale) => {
    setSelectedSale(sale);
    setShowVoidConfirm(true);
  };

  const handleVoidSale = async () => {
    setVoiding(true);
    try {
      await saleApi.voidSale(selectedSale.id, { reason: 'Voided by user' });
      toast.success('Sale voided successfully');
      setShowVoidConfirm(false);
      setShowDetailModal(false);
      loadSales();
    } catch (err) {
      console.error('Failed to void sale:', err);
      toast.error(err.response?.data?.message || 'Failed to void sale');
    } finally {
      setVoiding(false);
    }
  };

  // Download Invoice PDF
  const handleDownloadPDF = async (sale) => {
    const s = saleDetail || sale;
    try {
      const response = await saleApi.downloadPdf(s.id);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${s.invoiceNo || s.invoiceNumber || s.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded');
    } catch {
      toast.error('Failed to download PDF');
    }
  };

  // Print Invoice
  const handlePrintInvoice = (sale) => {
    const s = saleDetail || sale;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print invoices');
      return;
    }
    const customerName = s.customer?.name || 'Walk-in Customer';
    const customerPhone = s.customer?.phone || '';
    const items = s.items || [];
    const subtotal = s.subtotal || items.reduce((sum, i) => sum + (i.total || i.unitPrice * i.quantity), 0);
    const tax = s.tax || items.reduce((sum, i) => sum + (i.tax || 0), 0);
    const discount = s.discount || 0;
    const total = s.total || subtotal + tax - discount;
    const paid = s.amountPaid || 0;
    const due = total - paid;

    printWindow.document.write(`
      <html><head><title>Invoice ${s.invoiceNo || s.id}</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; max-width: 420px; margin: 0 auto; padding: 24px; font-size: 13px; color: #1f2937; }
        .header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 16px; margin-bottom: 20px; }
        .header h1 { margin: 0 0 4px; font-size: 22px; } .header p { margin: 2px 0; color: #6b7280; font-size: 12px; }
        .info { margin-bottom: 16px; } .info p { margin: 3px 0; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        th { font-weight: 600; font-size: 11px; text-transform: uppercase; color: #6b7280; text-align: left; padding: 8px 4px; border-bottom: 2px solid #e5e7eb; }
        td { padding: 8px 4px; border-bottom: 1px solid #f3f4f6; } .text-right { text-align: right; }
        .totals { margin-top: 12px; } .totals .row { display: flex; justify-content: space-between; padding: 4px 0; }
        .totals .grand { font-size: 18px; font-weight: 700; border-top: 2px solid #111; padding-top: 10px; margin-top: 6px; }
        .footer { text-align: center; margin-top: 28px; color: #9ca3af; font-size: 11px; }
        @media print { body { padding: 0; } }
      </style></head><body>
      <div class="header">
        <h1>INVOICE</h1>
        <p>${s.invoiceNo || '#' + s.id}</p>
        <p>${formatDate(s.createdAt || s.date)}</p>
      </div>
      <div class="info">
        <p><strong>Customer:</strong> ${customerName}${customerPhone ? ' | ' + customerPhone : ''}</p>
        <p><strong>Status:</strong> ${(s.status || 'completed').toUpperCase()}</p>
        <p><strong>Payment:</strong> ${(s.paymentMethod || 'cash').toUpperCase()}</p>
      </div>
      <table>
        <thead><tr><th>Item</th><th class="text-right">Qty</th><th class="text-right">Price</th><th class="text-right">Total</th></tr></thead>
        <tbody>
          ${items.map(i => `<tr><td>${i.productName || i.name || 'Item'}</td><td class="text-right">${i.quantity}</td><td class="text-right">${formatCurrency(i.unitPrice)}</td><td class="text-right">${formatCurrency(i.total || i.unitPrice * i.quantity)}</td></tr>`).join('')}
        </tbody>
      </table>
      <div class="totals">
        <div class="row"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
        ${discount > 0 ? `<div class="row"><span>Discount</span><span>-${formatCurrency(discount)}</span></div>` : ''}
        ${tax > 0 ? `<div class="row"><span>Tax</span><span>${formatCurrency(tax)}</span></div>` : ''}
        <div class="row grand"><span>Grand Total</span><span>${formatCurrency(total)}</span></div>
        <div class="row"><span>Paid</span><span>${formatCurrency(paid)}</span></div>
        ${due > 0 ? `<div class="row" style="color:#dc2626"><span>Due</span><span>${formatCurrency(due)}</span></div>` : ''}
      </div>
      <div class="footer"><p>Thank you for your purchase!</p></div>
      </body></html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  // Table columns
  const columns = [
    {
      key: 'invoiceNo',
      label: 'Invoice #',
      sortable: true,
      render: (val, row) => (
        <button
          onClick={() => handleViewSale(row)}
          className="font-semibold text-gray-900 hover:text-emerald-600 hover:underline cursor-pointer"
        >
          {val || `#${row.id}`}
        </button>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      sortable: true,
      render: (val, row) => (
        <span>
          {val?.name || row.customerName || 'Walk-in'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (val) => formatDate(val),
    },
    {
      key: 'total',
      label: 'Amount',
      sortable: true,
      render: (val) => <span className="font-bold text-gray-900">{formatCurrency(val)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => (
        <Badge variant={STATUS_BADGE_MAP[val] || 'gray'}>
          {val ? val.charAt(0).toUpperCase() + val.slice(1) : 'Unknown'}
        </Badge>
      ),
    },
    {
      key: 'paymentMethod',
      label: 'Payment',
      render: (val) => (
        <span className="capitalize text-gray-600">
          {val ? val.charAt(0).toUpperCase() + val.slice(1) : '—'}
        </span>
      ),
    },
    {
      key: 'createdBy',
      label: 'Created By',
      render: (val) => (
        <span className="text-gray-500">{val?.name || val || '—'}</span>
      ),
    },
  ];

  // Actions renderer
  const renderActions = (row) => (
    <div className="flex items-center gap-1">
      <button
        onClick={() => handleViewSale(row)}
        title="View Details"
        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
      >
        <HiOutlineEye className="w-4 h-4" />
      </button>
      {(row.status === 'partial' || row.status === 'credit') && hasPermission('sales.create') && (
        <button
          onClick={() => handleOpenPayment(row)}
          title="Record Payment"
          className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
        >
          <HiOutlineCurrencyRupee className="w-4 h-4" />
        </button>
      )}
      {row.status === 'completed' && hasPermission('sales.return') && (
        <button
          onClick={() => handleOpenReturn(row)}
          title="Return Sale"
          className="p-1.5 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
        >
          <HiOutlineArrowUturnLeft className="w-4 h-4" />
        </button>
      )}
      {row.status === 'completed' && hasPermission('sales.void') && (
        <button
          onClick={() => handleOpenVoid(row)}
          title="Void Sale"
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <HiOutlineXMark className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Sales"
        subtitle="View and manage all sales"
      />

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <FormInput
            name="dateFrom"
            type="date"
            label="From Date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
          />
          <FormInput
            name="dateTo"
            type="date"
            label="To Date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
          />
          <FormSelect
            name="status"
            label="Status"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            options={STATUS_OPTIONS}
          />
          <FormSelect
            name="paymentMethod"
            label="Payment Method"
            value={filters.paymentMethod}
            onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
            options={PAYMENT_FILTER_OPTIONS}
          />
          <FormInput
            name="search"
            label="Search"
            placeholder="Invoice #, customer..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <LoadingSpinner type="table" />
      ) : sales.length === 0 ? (
        <EmptyState
          icon={<HiOutlineCreditCard className="w-16 h-16" />}
          title="No sales found"
          description="Sales records will appear here once transactions are made."
        />
      ) : (
        <DataTable
          columns={columns}
          data={sales}
          pagination={pagination}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          actions={renderActions}
        />
      )}

      {/* Sale Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        size="xl"
        title="Sale Details"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner type="page" />
          </div>
        ) : saleDetail ? (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {saleDetail.invoiceNo || `#${saleDetail.id}`}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {formatDate(saleDetail.createdAt || saleDetail.date)}
                </p>
              </div>
              <Badge variant={STATUS_BADGE_MAP[saleDetail.status] || 'gray'}>
                {saleDetail.status ? saleDetail.status.charAt(0).toUpperCase() + saleDetail.status.slice(1) : 'Unknown'}
              </Badge>
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Customer</h4>
              <p className="text-sm font-medium text-gray-900">
                {saleDetail.customer?.name || saleDetail.customerName || 'Walk-in Customer'}
              </p>
              {saleDetail.customer?.phone && (
                <p className="text-sm text-gray-500">{saleDetail.customer.phone}</p>
              )}
              {saleDetail.customer?.email && (
                <p className="text-sm text-gray-500">{saleDetail.customer.email}</p>
              )}
            </div>

            {/* Items Table */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Items</h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-2.5 text-left">Product</th>
                      <th className="px-4 py-2.5 text-right">Qty</th>
                      <th className="px-4 py-2.5 text-right">Unit Price</th>
                      <th className="px-4 py-2.5 text-right">Discount</th>
                      <th className="px-4 py-2.5 text-right">Tax</th>
                      <th className="px-4 py-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(saleDetail.items || []).map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="px-4 py-2.5 font-medium text-gray-900">
                          {item.productName || item.name || 'Item'}
                        </td>
                        <td className="px-4 py-2.5 text-right text-gray-600">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-2.5 text-right text-gray-600">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-gray-600">
                          {item.discount ? formatCurrency(item.discount) : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-right text-gray-600">
                          {item.tax ? formatCurrency(item.tax) : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium text-gray-900">
                          {formatCurrency(item.total || item.unitPrice * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Summary</h4>
              <div className="space-y-2 max-w-xs ml-auto">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-700">
                    {formatCurrency(saleDetail.subtotal)}
                  </span>
                </div>
                {(saleDetail.discount || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount</span>
                    <span className="font-medium text-red-500">
                      -{formatCurrency(saleDetail.discount)}
                    </span>
                  </div>
                )}
                {(saleDetail.tax || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax</span>
                    <span className="font-medium text-gray-700">
                      {formatCurrency(saleDetail.tax)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                  <span className="text-gray-900">Grand Total</span>
                  <span className="text-gray-900">
                    {formatCurrency(saleDetail.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Payment</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Method</p>
                  <p className="text-sm font-medium text-gray-900 capitalize mt-0.5">
                    {saleDetail.paymentMethod || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Amount Paid</p>
                  <p className="text-sm font-medium text-emerald-600 mt-0.5">
                    {formatCurrency(saleDetail.amountPaid || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Amount Due</p>
                  <p className={`text-sm font-medium mt-0.5 ${(saleDetail.total - (saleDetail.amountPaid || 0)) > 0 ? 'text-red-500' : 'text-gray-900'}`}>
                    {formatCurrency((saleDetail.total || 0) - (saleDetail.amountPaid || 0))}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {saleDetail.notes && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</h4>
                <p className="text-sm text-gray-600">{saleDetail.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
              <Button
                variant="secondary"
                icon={HiOutlineArrowDownTray}
                onClick={() => handleDownloadPDF(saleDetail)}
              >
                Download PDF
              </Button>
              <Button
                variant="secondary"
                icon={HiOutlinePrinter}
                onClick={() => handlePrintInvoice(saleDetail)}
              >
                Print
              </Button>
              {(saleDetail.status === 'partial' || saleDetail.status === 'credit') && hasPermission('sales.create') && (
                <Button
                  variant="primary"
                  icon={HiOutlineCurrencyRupee}
                  onClick={() => {
                    setShowDetailModal(false);
                    handleOpenPayment(saleDetail);
                  }}
                >
                  Record Payment
                </Button>
              )}
              {saleDetail.status === 'completed' && hasPermission('sales.return') && (
                <Button
                  variant="secondary"
                  icon={HiOutlineArrowUturnLeft}
                  onClick={() => {
                    setShowDetailModal(false);
                    handleOpenReturn(saleDetail);
                  }}
                >
                  Return
                </Button>
              )}
              {saleDetail.status === 'completed' && hasPermission('sales.void') && (
                <Button
                  variant="danger"
                  icon={HiOutlineXMark}
                  onClick={() => {
                    setShowDetailModal(false);
                    handleOpenVoid(saleDetail);
                  }}
                >
                  Void
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        size="sm"
        title="Record Payment"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-500">Invoice</p>
            <p className="font-semibold text-gray-900">
              {selectedSale?.invoiceNo || `#${selectedSale?.id}`}
            </p>
            <p className="text-sm text-gray-500 mt-1">Amount Due</p>
            <p className="text-lg font-bold text-red-500">
              {formatCurrency(
                (selectedSale?.total || 0) - (selectedSale?.amountPaid || 0)
              )}
            </p>
          </div>

          <FormInput
            label="Payment Amount"
            name="amount"
            type="number"
            value={paymentForm.amount}
            onChange={(e) =>
              setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))
            }
            placeholder="Enter amount"
            min="0"
          />

          <FormSelect
            label="Payment Method"
            name="paymentMethod"
            value={paymentForm.paymentMethod}
            onChange={(e) =>
              setPaymentForm((prev) => ({ ...prev, paymentMethod: e.target.value }))
            }
            options={PAYMENT_METHODS}
          />

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setShowPaymentModal(false)}
              className="flex-1"
              disabled={recordingPayment}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleRecordPayment}
              loading={recordingPayment}
              className="flex-1"
            >
              Record Payment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Return Sale Modal */}
      <Modal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        size="lg"
        title="Return Sale Items"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Select items and quantities to return for invoice{' '}
            <strong>{selectedSale?.invoiceNo || `#${selectedSale?.id}`}</strong>
          </p>

          {/* Return items table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase sticky top-0">
                <tr>
                  <th className="px-3 py-2.5 text-left w-10"></th>
                  <th className="px-3 py-2.5 text-left">Product</th>
                  <th className="px-3 py-2.5 text-right">Sold</th>
                  <th className="px-3 py-2.5 text-right">Return Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {returnItems.map((item, idx) => (
                  <tr key={item.id || idx} className={item.selected ? 'bg-amber-50' : ''}>
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => handleReturnItemToggle(idx)}
                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-2.5 font-medium text-gray-900">
                      {item.productName || item.name || 'Item'}
                    </td>
                    <td className="px-3 py-2.5 text-right text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        min="0"
                        max={item.quantity}
                        value={item.returnQty}
                        onChange={(e) => handleReturnQtyChange(idx, e.target.value)}
                        disabled={!item.selected}
                        className="w-20 px-2 py-1.5 text-sm text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-400"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Reason */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Reason for Return <span className="text-red-500">*</span>
            </label>
            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              rows={3}
              placeholder="Enter reason for returning items..."
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setShowReturnModal(false)}
              className="flex-1"
              disabled={returning}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitReturn}
              loading={returning}
              className="flex-1"
            >
              Submit Return
            </Button>
          </div>
        </div>
      </Modal>

      {/* Void Sale Confirm Dialog */}
      <ConfirmDialog
        isOpen={showVoidConfirm}
        onConfirm={handleVoidSale}
        onCancel={() => setShowVoidConfirm(false)}
        title="Void Sale"
        message="Are you sure you want to void this sale? This will restore the inventory and cannot be undone."
        confirmText="Void Sale"
        variant="danger"
        loading={voiding}
      />
    </div>
  );
}

export default Sales;
