// import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
// import { useDropzone } from 'react-dropzone';
// import toast from 'react-hot-toast';
// import {
//   HiOutlineCamera,
//   HiOutlineDocumentText,
//   HiOutlineCloudArrowUp,
//   HiOutlineCheckCircle,
//   HiOutlineExclamationTriangle,
//   HiOutlineXCircle,
//   HiOutlinePlus,
//   HiOutlinePencilSquare,
//   HiOutlineArrowPath,
//   HiOutlineArrowUpTray,
//   HiOutlineTrash,
//   HiOutlineEye,
//   HiOutlineCube,
//   HiOutlineTruck,
//   HiOutlineArchiveBox,
//   HiOutlineBanknotes,
//   HiOutlineComputerDesktop,
//   HiOutlineInformationCircle,
// } from 'react-icons/hi2';
// import PageHeader from '../../components/PageHeader';
// import Button from '../../components/Button';
// import Modal from '../../components/Modal';
// import FormInput from '../../components/FormInput';
// import FormSelect from '../../components/FormSelect';
// import LoadingSpinner from '../../components/LoadingSpinner';
// import EmptyState from '../../components/EmptyState';
// import Badge from '../../components/Badge';
// import { invoiceImportApi } from '../../api/invoiceImportApi';
// import { supplierApi } from '../../api/supplierApi';
// import { categoryApi } from '../../api/categoryApi';
// import { productApi } from '../../api/productApi';
// import { formatCurrency, PAYMENT_METHODS, UNITS } from '../../utils/helpers';
// import { useNavigate } from 'react-router-dom';

// const MAX_FILE_SIZE = 10 * 1024 * 1024;
// const ACCEPTED_TYPES = { 'application/pdf': ['.pdf'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] };

// // ─── Confidence helpers ────────────────────────────────────────
// const getConfidenceClass = (val) => {
//   if (val == null) return 'text-gray-400';
//   if (val >= 0.9) return 'text-green-600';
//   if (val >= 0.7) return 'text-yellow-600';
//   return 'text-red-600';
// };
// const getConfidenceLabel = (val) => {
//   if (val == null) return '';
//   if (val >= 0.9) return '';
//   if (val >= 0.7) return 'Please verify';
//   return 'Low confidence';
// };

// // ─── Main Component ───────────────────────────────────────────
// function InvoiceImport() {
//   const navigate = useNavigate();
//   const cameraRef = useRef(null);

//   // Screen state: 'upload' | 'review' | 'summary'
//   const [screen, setScreen] = useState('upload');

//   // Upload state
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [extracting, setExtracting] = useState(false);

//   // Data state
//   const [importId, setImportId] = useState(null);
//   const [extraction, setExtraction] = useState(null);
//   const [matches, setMatches] = useState(null);
//   const [summary, setSummary] = useState(null);

//   // Review state
//   const [reviewItems, setReviewItems] = useState([]);
//   const [selectedSupplierId, setSelectedSupplierId] = useState('');
//   const [newSupplierMode, setNewSupplierMode] = useState(false);
//   const [newSupplier, setNewSupplier] = useState({ name: '', phone: '', email: '', address: '', gstNumber: '' });
//   const [invoiceNumber, setInvoiceNumber] = useState('');
//   const [invoiceDate, setInvoiceDate] = useState('');
//   const [notes, setNotes] = useState('');
//   const [paymentMethod, setPaymentMethod] = useState('credit');
//   const [confirming, setConfirming] = useState(false);

//   // Reference data
//   const [suppliers, setSuppliers] = useState([]);
//   const [categories, setCategories] = useState([]);

//   // Errors
//   const [error, setError] = useState(null);

//   // AI Provider info
//   const [providerInfo, setProviderInfo] = useState(null);
//   const [showManualForm, setShowManualForm] = useState(false);
//   const [manualSubmitting, setManualSubmitting] = useState(false);
//   const [manualItems, setManualItems] = useState([
//     { productName: '', sku: '', hsnCode: '', quantity: 1, unit: 'pcs', purchasePrice: 0, taxRate: 0 },
//   ]);
//   const [manualInvoice, setManualInvoice] = useState({ invoiceNumber: '', invoiceDate: '', supplierName: '' });

//   // ─── Load reference data + provider info ───────────────
//   useEffect(() => {
//     const load = async () => {
//       try {
//         const [supRes, catRes] = await Promise.all([
//           supplierApi.getAll({ limit: 200 }),
//           categoryApi.getAll({ limit: 200 }),
//         ]);
//         setSuppliers((supRes.data?.data ?? []).filter(s => s.status === 'active'));
//         setCategories(catRes.data?.data ?? catRes.data ?? []);
//       } catch {
//         /* silent */
//       }
//       // Fetch AI provider info
//       try {
//         const pRes = await invoiceImportApi.getProviderInfo();
//         setProviderInfo(pRes.data?.data || pRes.data);
//       } catch {
//         /* silent - provider info is non-critical */
//       }
//     };
//     load();
//   }, []);

//   // ─── Reset everything ──────────────────────────────────────
//   const resetAll = useCallback(() => {
//     setScreen('upload');
//     setImportId(null);
//     setExtraction(null);
//     setMatches(null);
//     setSummary(null);
//     setReviewItems([]);
//     setSelectedSupplierId('');
//     setNewSupplierMode(false);
//     setNewSupplier({ name: '', phone: '', email: '', address: '', gstNumber: '' });
//     setInvoiceNumber('');
//     setInvoiceDate('');
//     setNotes('');
//     setPaymentMethod('credit');
//     setConfirming(false);
//     setError(null);
//     setUploadProgress(0);
//     setShowManualForm(false);
//     setManualItems([{ productName: '', sku: '', hsnCode: '', quantity: 1, unit: 'pcs', purchasePrice: 0, taxRate: 0 }]);
//     setManualInvoice({ invoiceNumber: '', invoiceDate: '', supplierName: '' });
//   }, []);

//   // ─── Dropzone setup ────────────────────────────────────────
//   const onDrop = useCallback(async (acceptedFiles) => {
//     if (acceptedFiles.length === 0) return;
//     await processFile(acceptedFiles[0]);
//   }, []);

//   const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
//     onDrop,
//     accept: ACCEPTED_TYPES,
//     maxSize: MAX_FILE_SIZE,
//     multiple: false,
//     disabled: uploading || extracting,
//   });

//   // ─── Process file (upload + extract) ────────────────────────
//   const processFile = async (file) => {
//     setError(null);
//     setUploading(true);
//     setUploadProgress(0);

//     const formData = new FormData();
//     formData.append('file', file);

//     try {
//       setUploading(false);
//       setExtracting(true);
//       const res = await invoiceImportApi.uploadAndExtract(formData, (pct) => {
//         setUploadProgress(pct);
//       });
//       const data = res.data?.data || res.data;
//       setImportId(data.importId);
//       setExtraction(data.extraction);
//       setMatches(data.matches);

//       // Initialize review state from extraction + matches
//       initReviewState(data.extraction, data.matches);
//       setScreen('review');
//       toast.success('Invoice extracted successfully');
//     } catch (err) {
//       const msg = err.response?.data?.message || err.message || 'Failed to process invoice';
//       setError(msg);
//       toast.error(msg);
//     } finally {
//       setUploading(false);
//       setExtracting(false);
//       setUploadProgress(0);
//     }
//   };

//   // ─── Manual entry handlers ────────────────────────────────
//   const addManualItem = () => {
//     setManualItems(prev => [...prev, { productName: '', sku: '', hsnCode: '', quantity: 1, unit: 'pcs', purchasePrice: 0, taxRate: 0 }]);
//   };

//   const removeManualItem = (idx) => {
//     setManualItems(prev => prev.filter((_, i) => i !== idx));
//   };

//   const updateManualItem = (idx, field, val) => {
//     setManualItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
//   };

//   const submitManualEntry = async () => {
//     const validItems = manualItems.filter(it => it.productName.trim());
//     if (validItems.length === 0) {
//       toast.error('Add at least one product');
//       return;
//     }
//     setManualSubmitting(true);
//     setError(null);
//     try {
//       const res = await invoiceImportApi.createManual({
//         invoice: manualInvoice,
//         items: validItems,
//       });
//       const data = res.data?.data || res.data;
//       setImportId(data.importId);
//       setExtraction(data.extraction);
//       setMatches(data.matches);
//       initReviewState(data.extraction, data.matches);
//       setScreen('review');
//       toast.success('Manual entry created - review before importing');
//     } catch (err) {
//       const msg = err.response?.data?.message || err.message || 'Failed to create manual entry';
//       setError(msg);
//       toast.error(msg);
//     } finally {
//       setManualSubmitting(false);
//     }
//   };

//   // ─── Initialize review state from extraction + matches ─────
//   const initReviewState = (ext, matchData) => {
//     const inv = ext.invoice || {};
//     setInvoiceNumber(inv.invoiceNumber || '');
//     setInvoiceDate(inv.invoiceDate || '');

//     // Supplier
//     if (matchData?.matchedSupplier) {
//       setSelectedSupplierId(String(matchData.matchedSupplier._id));
//       setNewSupplierMode(false);
//     } else if (matchData?.newSupplierSuggestion) {
//       setNewSupplierMode(true);
//       setNewSupplier(prev => ({
//         ...prev,
//         name: matchData.newSupplierSuggestion,
//         phone: inv.supplierPhone || '',
//         email: inv.supplierEmail || '',
//         gstNumber: inv.supplierGSTIN || '',
//         address: inv.billingAddress || '',
//       }));
//     }

//     // Items
//     const items = (ext.items || []).map((item, idx) => {
//       const pm = matchData?.productMatches?.[idx];
//       const matched = pm?.matchedProduct;
//       return {
//         _idx: idx,
//         productId: matched ? String(matched._id) : '',
//         matchAction: matched ? 'existing' : 'new',
//         matchScore: pm?.matchScore || 0,
//         matchMethod: pm?.matchMethod || null,
//         productName: item.productName || '',
//         sku: item.sku || '',
//         barcode: item.barcode || '',
//         hsnCode: item.hsnCode || '',
//         categoryId: matched?.categoryId ? String(matched.categoryId) : '',
//         brand: matched?.brand || '',
//         quantity: item.quantity || 0,
//         unit: item.unit || 'pcs',
//         purchasePrice: item.purchasePrice || 0,
//         sellingPrice: 0,
//         usePurchaseAsSelling: false,
//         discount: item.discount || 0,
//         taxRate: item.taxRate || 0,
//         taxAmount: item.taxAmount || 0,
//         lineTotal: item.lineTotal || 0,
//         supplierId: '',
//         minimumStock: 10,
//         confidence: item.confidence || {},
//       };
//     });
//     setReviewItems(items);
//   };

//   // ─── Update a review item field ────────────────────────────
//   const updateItem = useCallback((idx, field, value) => {
//     setReviewItems(prev => prev.map((it, i) => {
//       if (i !== idx) return it;
//       const updated = { ...it, [field]: value };
//       // Recalculate line total if price/qty/tax changed
//       if (['quantity', 'purchasePrice', 'taxRate', 'discount'].includes(field)) {
//         const qty = field === 'quantity' ? value : it.quantity;
//         const price = field === 'purchasePrice' ? value : it.purchasePrice;
//         const tax = field === 'taxRate' ? value : it.taxRate;
//         const disc = field === 'discount' ? value : it.discount;
//         const beforeDisc = price * qty;
//         const afterDisc = beforeDisc - (beforeDisc * disc / 100);
//         const taxAmt = afterDisc * (tax / 100);
//         updated.lineTotal = afterDisc + taxAmt;
//         updated.taxAmount = taxAmt;
//       }
//       return updated;
//     }));
//   }, []);

//   // ─── Switch item to existing product ───────────────────────
//   const switchToExisting = useCallback((idx, productId) => {
//     const prod = reviewItems.find(it => String(it.productId) === productId);
//     setReviewItems(prev => prev.map((it, i) => {
//       if (i !== idx) return it;
//       return {
//         ...it,
//         productId,
//         matchAction: 'existing',
//         matchScore: 100,
//         matchMethod: 'manual',
//         categoryId: prod?.categoryId || it.categoryId,
//         unit: prod?.unit || it.unit,
//         sellingPrice: 0,
//         usePurchaseAsSelling: false,
//       };
//     }));
//   }, [reviewItems]);

//   // ─── Create new supplier ───────────────────────────────────
//   const handleCreateSupplier = async () => {
//     if (!newSupplier.name || !newSupplier.phone) {
//       toast.error('Supplier name and phone are required');
//       return;
//     }
//     try {
//       const res = await supplierApi.create(newSupplier);
//       const created = res.data?.data || res.data;
//       setSuppliers(prev => [...prev, created]);
//       setSelectedSupplierId(String(created._id));
//       setNewSupplierMode(false);
//       toast.success('Supplier created');
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to create supplier');
//     }
//   };

//   // ─── Camera capture ────────────────────────────────────────
//   const handleCameraCapture = useCallback((e) => {
//     const file = e.target.files?.[0];
//     if (file) processFile(file);
//     e.target.value = '';
//   }, []);

//   // ─── Calculated totals ─────────────────────────────────────
//   const totals = useMemo(() => {
//     let subtotal = 0;
//     let totalTax = 0;
//     let grandTotal = 0;
//     for (const item of reviewItems) {
//       const qty = Number(item.quantity) || 0;
//       const price = Number(item.purchasePrice) || 0;
//       const disc = Number(item.discount) || 0;
//       const tax = Number(item.taxRate) || 0;
//       const beforeDisc = price * qty;
//       const afterDisc = beforeDisc - (beforeDisc * disc / 100);
//       const taxAmt = afterDisc * (tax / 100);
//       const line = afterDisc + taxAmt;
//       subtotal += afterDisc;
//       totalTax += taxAmt;
//       grandTotal += line;
//     }
//     return { subtotal, totalTax, grandTotal };
//   }, [reviewItems]);

//   // ─── Validate before confirm ───────────────────────────────
//   const validate = () => {
//     if (!selectedSupplierId && !newSupplierMode) {
//       toast.error('Please select or create a supplier');
//       return false;
//     }
//     for (let i = 0; i < reviewItems.length; i++) {
//       const item = reviewItems[i];
//       if (!item.productName.trim()) { toast.error(`Row ${i + 1}: Product name is required`); return false; }
//       if (!item.quantity || item.quantity <= 0) { toast.error(`Row ${i + 1}: Valid quantity is required`); return false; }
//       if (item.matchAction === 'new' && !item.categoryId) { toast.error(`Row ${i + 1}: Category is required for new product "${item.productName}"`); return false; }
//       if (item.matchAction === 'new' && !item.sellingPrice && !item.usePurchaseAsSelling) { toast.error(`Row ${i + 1}: Selling price is required for new product "${item.productName}"`); return false; }
//     }
//     return true;
//   };

//   // ─── Confirm import ────────────────────────────────────────
//   const handleConfirm = async () => {
//     if (!validate()) return;
//     setConfirming(true);
//     try {
//       const payload = {
//         supplierId: selectedSupplierId,
//         invoiceNumber,
//         invoiceDate,
//         notes,
//         paymentMethod,
//         items: reviewItems.map(item => ({
//           productId: item.matchAction === 'existing' ? item.productId : null,
//           matchAction: item.matchAction,
//           productName: item.productName,
//           sku: item.sku,
//           barcode: item.barcode,
//           hsnCode: item.hsnCode,
//           categoryId: item.categoryId,
//           brand: item.brand,
//           quantity: item.quantity,
//           unit: item.unit,
//           purchasePrice: item.purchasePrice,
//           sellingPrice: item.sellingPrice,
//           usePurchaseAsSelling: item.usePurchaseAsSelling,
//           discount: item.discount,
//           taxRate: item.taxRate,
//           taxAmount: item.taxAmount,
//           lineTotal: item.lineTotal,
//           supplierId: item.supplierId || selectedSupplierId,
//           minimumStock: item.minimumStock,
//         })),
//       };
//       const res = await invoiceImportApi.confirmImport(importId, payload);
//       const data = res.data?.data || res.data;
//       setSummary({ ...data.summary, purchaseId: data.purchase?._id || data.purchase?.id });
//       setScreen('summary');
//       toast.success('Invoice imported successfully!');
//     } catch (err) {
//       const msg = err.response?.data?.message || err.message || 'Import failed';
//       toast.error(msg);
//     } finally {
//       setConfirming(false);
//     }
//   };

//   // ─── Supplier options for dropdown ─────────────────────────
//   const supplierOptions = useMemo(() => {
//     return suppliers.map(s => ({
//       value: String(s._id),
//       label: s.company ? `${s.name} (${s.company})` : s.name,
//     }));
//   }, [suppliers]);

//   const categoryOptions = useMemo(() => {
//     return categories.map(c => ({ value: String(c._id), label: c.name }));
//   }, [categories]);

//   // ═══════════════════════════════════════════════════════════
//   // RENDER: Upload Screen
//   // ═══════════════════════════════════════════════════════════
//   if (screen === 'upload') {
//     return (
//       <div>
//         <PageHeader
//           title="Scan & Stock"
//           subtitle="Upload a dealer invoice and turn it into products, purchases and inventory in seconds."
//         />

//         <div className="max-w-2xl mx-auto mt-8">
//           {/* Dropzone */}
//           <div
//             {...getRootProps()}
//             className={[
//               'relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all',
//               isDragActive
//                 ? 'border-blue-500 bg-blue-50'
//                 : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50',
//               (uploading || extracting) ? 'pointer-events-none opacity-60' : '',
//             ].join(' ')}
//           >
//             <input {...getInputProps()} />

//             {uploading ? (
//               <div className="space-y-4">
//                 <HiOutlineCloudArrowUp className="mx-auto h-16 w-16 text-blue-500 animate-pulse" />
//                 <p className="text-lg font-medium text-gray-700">Uploading...</p>
//                 <div className="w-full bg-gray-200 rounded-full h-2.5">
//                   <div
//                     className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
//                     style={{ width: `${uploadProgress}%` }}
//                   />
//                 </div>
//                 <p className="text-sm text-gray-500">{uploadProgress}% uploaded</p>
//               </div>
//             ) : extracting ? (
//               <div className="space-y-4">
//                 <LoadingSpinner type="form" />
//                 <p className="text-lg font-medium text-gray-700">Extracting invoice data...</p>
//                 <p className="text-sm text-gray-500">This may take a few seconds</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 <div className="mx-auto h-16 w-16 rounded-2xl bg-blue-100 flex items-center justify-center">
//                   <HiOutlineDocumentText className="h-8 w-8 text-blue-600" />
//                 </div>
//                 <div>
//                   <p className="text-lg font-medium text-gray-700">
//                     {isDragActive ? 'Drop your invoice here' : 'Upload a supplier/dealer invoice'}
//                   </p>
//                   <p className="mt-1 text-sm text-gray-500">
//                     BizFlow will extract the products and purchase details for you. Review everything before importing.
//                   </p>
//                 </div>
//                 <div className="flex items-center justify-center gap-3">
//                   <Button
//                     variant="primary"
//                     size="md"
//                     onClick={(e) => { e.stopPropagation(); open(); }}
//                     icon={HiOutlineArrowUpTray}
//                   >
//                     Upload Invoice
//                   </Button>
//                   {typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia && (
//                     <Button
//                       variant="secondary"
//                       size="md"
//                       onClick={(e) => { e.stopPropagation(); cameraRef.current?.click(); }}
//                       icon={HiOutlineCamera}
//                     >
//                       Use Camera
//                     </Button>
//                   )}
//                 </div>
//                 <p className="text-xs text-gray-400">Supports PDF, JPG, PNG — Max 10 MB</p>
//               </div>
//             )}
//           </div>

//           <input
//             ref={cameraRef}
//             type="file"
//             accept="image/*"
//             capture="environment"
//             className="hidden"
//             onChange={handleCameraCapture}
//           />

//           {/* Error display with AI setup guide */}
//           {error && (
//             <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
//               <div className="flex items-start gap-3">
//                 <HiOutlineXCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
//                 <div className="flex-1">
//                   <p className="text-sm font-medium text-red-800">Failed to process invoice</p>
//                   <p className="mt-1 text-sm text-red-600">{error}</p>
//                 </div>
//               </div>
//               {/* AI setup guide when not configured or provider error */}
//               {(error.includes('not configured') || error.includes('API key') || error.includes('Rate limit') || error.includes('not supported')) && (
//                 <div className="mt-4 p-4 bg-white border border-blue-200 rounded-lg">
//                   <div className="flex items-center gap-2 mb-3">
//                     <HiOutlineInformationCircle className="h-5 w-5 text-blue-500" />
//                     <p className="text-sm font-semibold text-blue-800">Setup AI for automatic extraction (free)</p>
//                   </div>
//                   <div className="text-sm text-gray-700 space-y-2">
//                     <p><strong>Recommended: Groq (100% Free)</strong></p>
//                     <ol className="list-decimal list-inside space-y-1 text-xs text-gray-600">
//                       <li>Go to <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">console.groq.com/keys</a> and sign up</li>
//                       <li>Click "Create API Key" and copy it</li>
//                       <li>Add to your backend <code className="bg-gray-100 px-1 rounded">.env</code> file:</li>
//                     </ol>
//                     <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto mt-2">{`INVOICE_AI_PROVIDER=groq
// INVOICE_AI_API_KEY=your_groq_api_key_here`}</pre>
//                     <p className="text-xs text-gray-500 mt-2">Then restart your backend server. No credit card needed.</p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* AI not configured banner */}
//           {!error && providerInfo && !providerInfo.configured && !extracting && !showManualForm && (
//             <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
//               <div className="flex items-start gap-3">
//                 <HiOutlineExclamationTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
//                 <div className="flex-1">
//                   <p className="text-sm font-medium text-amber-800">AI not configured — upload will not work</p>
//                   <p className="mt-1 text-xs text-amber-700">
//                     Set up a free Groq API key to enable automatic invoice scanning, or use Manual Entry below.
//                   </p>
//                   <div className="mt-2">
//                     <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-medium">
//                       Get free Groq API key →
//                     </a>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Toggle: Manual Entry */}
//           {!extracting && (
//             <div className="mt-6 flex items-center justify-between">
//               <button
//                 type="button"
//                 onClick={() => { setShowManualForm(!showManualForm); setError(null); }}
//                 className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
//               >
//                 <HiOutlineComputerDesktop className="h-4 w-4" />
//                 {showManualForm ? '← Back to Upload' : 'Manual Entry (no AI needed)'}
//               </button>
//             </div>
//           )}

//           {/* Manual Entry Form */}
//           {showManualForm && !extracting && (
//             <div className="mt-4 bg-white rounded-xl border border-gray-200 p-6 space-y-6">
//               <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
//                 <HiOutlinePencilSquare className="h-5 w-5 text-purple-500" />
//                 Manual Invoice Entry
//               </h3>

//               {/* Invoice basics */}
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                 <FormInput label="Invoice Number" value={manualInvoice.invoiceNumber} onChange={e => setManualInvoice(p => ({ ...p, invoiceNumber: e.target.value }))} placeholder="e.g. INV-1045" />
//                 <FormInput label="Invoice Date" type="date" value={manualInvoice.invoiceDate} onChange={e => setManualInvoice(p => ({ ...p, invoiceDate: e.target.value }))} />
//                 <FormInput label="Supplier Name" value={manualInvoice.supplierName} onChange={e => setManualInvoice(p => ({ ...p, supplierName: e.target.value }))} placeholder="e.g. ABC Distributors" />
//               </div>

//               {/* Items table */}
//               <div>
//                 <div className="flex items-center justify-between mb-3">
//                   <h4 className="text-sm font-medium text-gray-700">Products</h4>
//                   <Button variant="ghost" size="sm" onClick={addManualItem} icon={HiOutlinePlus}>Add Product</Button>
//                 </div>

//                 <div className="overflow-x-auto -mx-6 px-6">
//                   <table className="w-full text-sm">
//                     <thead>
//                       <tr className="border-b border-gray-200">
//                         <th className="text-left py-2 px-2 font-medium text-gray-600">Product Name *</th>
//                         <th className="text-left py-2 px-2 font-medium text-gray-600">SKU</th>
//                         <th className="text-left py-2 px-2 font-medium text-gray-600">HSN</th>
//                         <th className="text-right py-2 px-2 font-medium text-gray-600">Qty</th>
//                         <th className="text-left py-2 px-2 font-medium text-gray-600">Unit</th>
//                         <th className="text-right py-2 px-2 font-medium text-gray-600">Price</th>
//                         <th className="text-right py-2 px-2 font-medium text-gray-600">GST %</th>
//                         <th className="w-10"></th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {manualItems.map((item, idx) => (
//                         <tr key={idx} className="border-b border-gray-100">
//                           <td className="py-2 px-2">
//                             <input type="text" value={item.productName} onChange={e => updateManualItem(idx, 'productName', e.target.value)} placeholder="Product name" className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
//                           </td>
//                           <td className="py-2 px-2">
//                             <input type="text" value={item.sku} onChange={e => updateManualItem(idx, 'sku', e.target.value)} placeholder="SKU" className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
//                           </td>
//                           <td className="py-2 px-2">
//                             <input type="text" value={item.hsnCode} onChange={e => updateManualItem(idx, 'hsnCode', e.target.value)} placeholder="HSN" className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
//                           </td>
//                           <td className="py-2 px-2">
//                             <input type="number" min="1" value={item.quantity} onChange={e => updateManualItem(idx, 'quantity', Number(e.target.value))} className="w-16 text-right border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
//                           </td>
//                           <td className="py-2 px-2">
//                             <select value={item.unit} onChange={e => updateManualItem(idx, 'unit', e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
//                               {UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
//                             </select>
//                           </td>
//                           <td className="py-2 px-2">
//                             <input type="number" min="0" step="0.01" value={item.purchasePrice} onChange={e => updateManualItem(idx, 'purchasePrice', Number(e.target.value))} className="w-24 text-right border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
//                           </td>
//                           <td className="py-2 px-2">
//                             <input type="number" min="0" max="28" step="0.25" value={item.taxRate} onChange={e => updateManualItem(idx, 'taxRate', Number(e.target.value))} className="w-16 text-right border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
//                           </td>
//                           <td className="py-2 px-1">
//                             {manualItems.length > 1 && (
//                               <button type="button" onClick={() => removeManualItem(idx)} className="p-1 text-red-400 hover:text-red-600">
//                                 <HiOutlineTrash className="h-4 w-4" />
//                               </button>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Manual totals */}
//                 <div className="mt-4 flex justify-end">
//                   <div className="text-sm text-gray-600 space-y-1 text-right">
//                     <p>Items: {manualItems.filter(i => i.productName.trim()).length}</p>
//                     <p className="font-semibold text-gray-800">
//                       Total: {formatCurrency(manualItems.reduce((sum, it) => sum + (it.purchasePrice || 0) * (it.quantity || 0) * (1 + (it.taxRate || 0) / 100), 0))}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex justify-end">
//                 <Button variant="primary" onClick={submitManualEntry} loading={manualSubmitting} icon={HiOutlineCheckCircle}>
//                   Create & Review
//                 </Button>
//               </div>
//             </div>
//           )}

//           {/* Info cards - hide when manual form is shown */}
//           {!showManualForm && (
//           <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
//             <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
//               <HiOutlineDocumentText className="mx-auto h-8 w-8 text-blue-500" />
//               <p className="mt-2 text-sm font-medium text-gray-700">Upload PDF/Image</p>
//               <p className="mt-1 text-xs text-gray-500">Drag & drop or browse</p>
//             </div>
//             <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
//               <HiOutlinePencilSquare className="mx-auto h-8 w-8 text-purple-500" />
//               <p className="mt-2 text-sm font-medium text-gray-700">Review & Edit</p>
//               <p className="mt-1 text-xs text-gray-500">Verify before importing</p>
//             </div>
//             <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
//               <HiOutlineCheckCircle className="mx-auto h-8 w-8 text-green-500" />
//               <p className="mt-2 text-sm font-medium text-gray-700">Confirm & Import</p>
//               <p className="mt-1 text-xs text-gray-500">Auto-creates purchase + stock</p>
//             </div>
//           </div>
//           )}
//         </div>
//       </div>
//     );
//   }

//   // ═══════════════════════════════════════════════════════════
//   // RENDER: Review Screen
//   // ═══════════════════════════════════════════════════════════
//   if (screen === 'review') {
//     return (
//       <div>
//         <PageHeader
//           title="Review Invoice"
//           subtitle="Verify extracted data before importing. Edit any incorrect values."
//           actions={[
//             { label: 'Cancel', variant: 'secondary', onClick: resetAll },
//           ]}
//         />

//         <div className="mt-6 space-y-6 max-w-7xl">
//           {/* ─── A. Supplier Section ──────────────────────── */}
//           <div className="bg-white rounded-xl border border-gray-200 p-6">
//             <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
//               <HiOutlineTruck className="h-5 w-5 text-blue-500" />
//               Supplier Information
//             </h3>

//             {matches?.matchedSupplier && !newSupplierMode ? (
//               <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
//                 <HiOutlineCheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
//                 <div className="flex-1">
//                   <p className="text-sm font-medium text-green-800">
//                     Existing supplier found: {matches.matchedSupplier.name}
//                   </p>
//                   {matches.matchedSupplier.gstNumber && (
//                     <p className="text-xs text-green-600">GSTIN: {matches.matchedSupplier.gstNumber}</p>
//                   )}
//                 </div>
//                 <Button variant="ghost" size="sm" onClick={() => { setNewSupplierMode(true); setSelectedSupplierId(''); }}>Change</Button>
//               </div>
//             ) : newSupplierMode ? (
//               <div className="space-y-4">
//                 <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
//                   <HiOutlinePlus className="h-4 w-4 text-blue-600" />
//                   <p className="text-sm font-medium text-blue-800">New supplier detected</p>
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <FormInput label="Supplier Name" name="name" value={newSupplier.name} onChange={(e) => setNewSupplier(p => ({ ...p, name: e.target.value }))} required />
//                   <FormInput label="Phone" name="phone" value={newSupplier.phone} onChange={(e) => setNewSupplier(p => ({ ...p, phone: e.target.value }))} required />
//                   <FormInput label="Email" name="email" type="email" value={newSupplier.email} onChange={(e) => setNewSupplier(p => ({ ...p, email: e.target.value }))} />
//                   <FormInput label="GST Number" name="gstNumber" value={newSupplier.gstNumber} onChange={(e) => setNewSupplier(p => ({ ...p, gstNumber: e.target.value }))} />
//                   <FormInput label="Address" name="address" value={newSupplier.address} onChange={(e) => setNewSupplier(p => ({ ...p, address: e.target.value }))} className="sm:col-span-2" />
//                 </div>
//                 <div className="flex gap-3">
//                   <Button variant="success" size="sm" onClick={handleCreateSupplier}>Create Supplier</Button>
//                   <Button variant="ghost" size="sm" onClick={() => { setNewSupplierMode(false); }}>Select Existing</Button>
//                 </div>
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 <FormSelect
//                   label="Select Supplier"
//                   name="supplierId"
//                   value={selectedSupplierId}
//                   onChange={(e) => setSelectedSupplierId(e.target.value)}
//                   options={[{ value: '', label: 'Choose a supplier...' }, ...supplierOptions]}
//                   required
//                 />
//                 <Button variant="ghost" size="sm" onClick={() => setNewSupplierMode(true)}>+ Create New Supplier</Button>
//               </div>
//             )}
//           </div>

//           {/* ─── B. Invoice Information ───────────────────── */}
//           <div className="bg-white rounded-xl border border-gray-200 p-6">
//             <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
//               <HiOutlineDocumentText className="h-5 w-5 text-blue-500" />
//               Invoice Information
//             </h3>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//               <FormInput label="Invoice Number" name="invoiceNumber" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="e.g. INV-1045" />
//               <FormInput label="Invoice Date" name="invoiceDate" type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
//               <FormSelect
//                 label="Payment Method"
//                 name="paymentMethod"
//                 value={paymentMethod}
//                 onChange={(e) => setPaymentMethod(e.target.value)}
//                 options={PAYMENT_METHODS}
//               />
//             </div>
//           </div>

//           {/* ─── C. Products Table ────────────────────────── */}
//           <div className="bg-white rounded-xl border border-gray-200 p-6">
//             <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
//               <HiOutlineCube className="h-5 w-5 text-blue-500" />
//               Products ({reviewItems.length})
//             </h3>

//             <div className="overflow-x-auto -mx-6 px-6">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="border-b border-gray-200">
//                     <th className="text-left py-3 px-2 font-medium text-gray-600">#</th>
//                     <th className="text-left py-3 px-2 font-medium text-gray-600">Product Name</th>
//                     <th className="text-left py-3 px-2 font-medium text-gray-600">Match</th>
//                     <th className="text-left py-3 px-2 font-medium text-gray-600">Category</th>
//                     <th className="text-right py-3 px-2 font-medium text-gray-600">Qty</th>
//                     <th className="text-left py-3 px-2 font-medium text-gray-600">Unit</th>
//                     <th className="text-right py-3 px-2 font-medium text-gray-600">Purchase Price</th>
//                     <th className="text-right py-3 px-2 font-medium text-gray-600">GST %</th>
//                     <th className="text-right py-3 px-2 font-medium text-gray-600">Tax Amt</th>
//                     <th className="text-right py-3 px-2 font-medium text-gray-600">Total</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {reviewItems.map((item, idx) => (
//                     <ProductRow
//                       key={idx}
//                       item={item}
//                       idx={idx}
//                       categories={categoryOptions}
//                       onUpdate={(field, val) => updateItem(idx, field, val)}
//                       onSwitchExisting={(pid) => switchToExisting(idx, pid)}
//                     />
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Item-level new product selling price modals handled inline */}
//           </div>

//           {/* ─── D. Purchase Summary ──────────────────────── */}
//           <div className="bg-white rounded-xl border border-gray-200 p-6">
//             <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
//               <HiOutlineBanknotes className="h-5 w-5 text-blue-500" />
//               Purchase Summary
//             </h3>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
//               <FormInput label="Notes" name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />
//             </div>
//             <div className="border-t border-gray-200 pt-4 space-y-2 max-w-xs ml-auto">
//               <div className="flex justify-between text-sm text-gray-600">
//                 <span>Subtotal</span>
//                 <span>{formatCurrency(totals.subtotal)}</span>
//               </div>
//               <div className="flex justify-between text-sm text-gray-600">
//                 <span>Tax</span>
//                 <span>{formatCurrency(totals.totalTax)}</span>
//               </div>
//               <div className="flex justify-between text-base font-semibold text-gray-900 border-t border-gray-200 pt-2">
//                 <span>Grand Total</span>
//                 <span>{formatCurrency(totals.grandTotal)}</span>
//               </div>
//             </div>
//           </div>

//           {/* ─── Confirm Button ──────────────────────────── */}
//           <div className="flex justify-end gap-3 pb-6">
//             <Button variant="secondary" onClick={resetAll}>Cancel</Button>
//             <Button variant="primary" onClick={handleConfirm} loading={confirming} icon={HiOutlineCheckCircle}>
//               Confirm & Import
//             </Button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ═══════════════════════════════════════════════════════════
//   // RENDER: Summary Screen
//   // ═══════════════════════════════════════════════════════════
//   if (screen === 'summary' && summary) {
//     return (
//       <div>
//         <PageHeader
//           title="Import Complete"
//           subtitle="Your invoice has been imported successfully."
//         />

//         <div className="mt-8 max-w-2xl mx-auto">
//           <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
//             <div className="mx-auto h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
//               <HiOutlineCheckCircle className="h-10 w-10 text-green-600" />
//             </div>
//             <h2 className="mt-4 text-xl font-bold text-gray-900">Invoice Imported Successfully</h2>

//             <div className="mt-6 grid grid-cols-2 gap-4 text-left">
//               <div className="bg-blue-50 rounded-lg p-4">
//                 <p className="text-2xl font-bold text-blue-700">{summary.productsCreated || 0}</p>
//                 <p className="text-sm text-blue-600">Products Created</p>
//               </div>
//               <div className="bg-purple-50 rounded-lg p-4">
//                 <p className="text-2xl font-bold text-purple-700">{summary.productsMatched || 0}</p>
//                 <p className="text-sm text-purple-600">Existing Updated</p>
//               </div>
//               <div className="bg-green-50 rounded-lg p-4">
//                 <p className="text-2xl font-bold text-green-700">{summary.inventoryUpdated || 0}</p>
//                 <p className="text-sm text-green-600">Inventory Items Updated</p>
//               </div>
//               <div className="bg-yellow-50 rounded-lg p-4">
//                 <p className="text-2xl font-bold text-yellow-700">{formatCurrency(summary.purchaseTotal || 0)}</p>
//                 <p className="text-sm text-yellow-600">Purchase Total</p>
//               </div>
//             </div>

//             <div className="mt-8 flex flex-wrap justify-center gap-3">
//               {summary.purchaseId && (
//                 <Button variant="primary" onClick={() => navigate(`/app/purchases`)} icon={HiOutlineEye}>
//                   View Purchases
//                 </Button>
//               )}
//               <Button variant="secondary" onClick={() => navigate('/app/products')} icon={HiOutlineCube}>
//                 View Products
//               </Button>
//               <Button variant="secondary" onClick={() => navigate('/app/inventory')} icon={HiOutlineArchiveBox}>
//                 View Inventory
//               </Button>
//               <Button variant="ghost" onClick={resetAll} icon={HiOutlineArrowPath}>
//                 Import Another Invoice
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return null;
// }

// // ═══════════════════════════════════════════════════════════════
// // Product Row Sub-component
// // ═══════════════════════════════════════════════════════════════
// function ProductRow({ item, idx, categories, onUpdate, onSwitchExisting }) {
//   const [showNewProductFields, setShowNewProductFields] = useState(item.matchAction === 'new');

//   const matchBadge = item.matchAction === 'existing' ? (
//     <Badge variant="success">Matched ({item.matchMethod})</Badge>
//   ) : (
//     <Badge variant="warning">New Product</Badge>
//   );

//   return (
//     <>
//       <tr className="border-b border-gray-100 hover:bg-gray-50">
//         <td className="py-2 px-2 text-gray-500">{idx + 1}</td>
//         <td className="py-2 px-2">
//           <input
//             type="text"
//             value={item.productName}
//             onChange={(e) => onUpdate('productName', e.target.value)}
//             className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           />
//           {item.confidence?.productName != null && item.confidence.productName < 0.9 && (
//             <p className={`text-xs mt-0.5 ${getConfidenceClass(item.confidence.productName)}`}>
//               {getConfidenceLabel(item.confidence.productName)}
//             </p>
//           )}
//         </td>
//         <td className="py-2 px-2">
//           <div className="flex items-center gap-2">
//             {matchBadge}
//             {item.matchAction === 'existing' && (
//               <button
//                 type="button"
//                 onClick={() => { onUpdate('matchAction', 'new'); onUpdate('productId', ''); setShowNewProductFields(true); }}
//                 className="text-xs text-blue-600 hover:underline"
//               >Create New</button>
//             )}
//             {item.matchAction === 'new' && (
//               <button
//                 type="button"
//                 onClick={() => { setShowNewProductFields(false); }}
//                 className="text-xs text-blue-600 hover:underline"
//               >Match Existing</button>
//             )}
//           </div>
//         </td>
//         <td className="py-2 px-2">
//           {item.matchAction === 'new' ? (
//             <select
//               value={item.categoryId}
//               onChange={(e) => onUpdate('categoryId', e.target.value)}
//               className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="">Select category</option>
//               {categories.map(c => (
//                 <option key={c.value} value={c.value}>{c.label}</option>
//               ))}
//             </select>
//           ) : (
//             <span className="text-sm text-gray-500">—</span>
//           )}
//         </td>
//         <td className="py-2 px-2">
//           <input
//             type="number"
//             min="0.01"
//             step="1"
//             value={item.quantity}
//             onChange={(e) => onUpdate('quantity', parseFloat(e.target.value) || 0)}
//             className="w-20 text-right border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           />
//         </td>
//         <td className="py-2 px-2">
//           <select
//             value={item.unit}
//             onChange={(e) => onUpdate('unit', e.target.value)}
//             className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           >
//             {UNITS.map(u => (
//               <option key={u.value} value={u.value}>{u.label}</option>
//             ))}
//           </select>
//         </td>
//         <td className="py-2 px-2">
//           <input
//             type="number"
//             min="0"
//             step="0.01"
//             value={item.purchasePrice}
//             onChange={(e) => onUpdate('purchasePrice', parseFloat(e.target.value) || 0)}
//             className={`w-24 text-right border rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${item.confidence?.purchasePrice != null && item.confidence.purchasePrice < 0.7 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
//           />
//         </td>
//         <td className="py-2 px-2">
//           <input
//             type="number"
//             min="0"
//             max="100"
//             step="0.5"
//             value={item.taxRate}
//             onChange={(e) => onUpdate('taxRate', parseFloat(e.target.value) || 0)}
//             className="w-16 text-right border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           />
//         </td>
//         <td className="py-2 px-2 text-right text-sm text-gray-600">{formatCurrency(item.taxAmount)}</td>
//         <td className="py-2 px-2 text-right text-sm font-medium text-gray-900">{formatCurrency(item.lineTotal)}</td>
//       </tr>

//       {/* Expanded new-product fields */}
//       {item.matchAction === 'new' && showNewProductFields && (
//         <tr className="bg-blue-50/50">
//           <td colSpan={10} className="py-3 px-4">
//             <p className="text-xs font-semibold text-blue-700 mb-2">New Product Details</p>
//             <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
//               <div>
//                 <label className="block text-xs text-gray-500 mb-1">SKU</label>
//                 <input type="text" value={item.sku} onChange={(e) => onUpdate('sku', e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="SKU" />
//               </div>
//               <div>
//                 <label className="block text-xs text-gray-500 mb-1">Barcode</label>
//                 <input type="text" value={item.barcode} onChange={(e) => onUpdate('barcode', e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Barcode" />
//               </div>
//               <div>
//                 <label className="block text-xs text-gray-500 mb-1">HSN/SAC</label>
//                 <input type="text" value={item.hsnCode} onChange={(e) => onUpdate('hsnCode', e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="HSN" />
//               </div>
//               <div>
//                 <label className="block text-xs text-gray-500 mb-1">Brand</label>
//                 <input type="text" value={item.brand} onChange={(e) => onUpdate('brand', e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Brand" />
//               </div>
//               <div>
//                 <label className="block text-xs text-gray-500 mb-1">Min Stock</label>
//                 <input type="number" min="0" value={item.minimumStock} onChange={(e) => onUpdate('minimumStock', parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
//               </div>
//               <div>
//                 <label className="block text-xs text-gray-500 mb-1">Selling Price *</label>
//                 <div className="flex items-center gap-2">
//                   <input type="number" min="0" step="0.01" value={item.usePurchaseAsSelling ? item.purchasePrice : item.sellingPrice} disabled={item.usePurchaseAsSelling} onChange={(e) => onUpdate('sellingPrice', parseFloat(e.target.value) || 0)} className={`w-full border rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${item.usePurchaseAsSelling ? 'bg-gray-100 text-gray-500' : 'border-gray-300'}`} />
//                 </div>
//                 <label className="flex items-center gap-1 mt-1">
//                   <input type="checkbox" checked={item.usePurchaseAsSelling} onChange={(e) => onUpdate('usePurchaseAsSelling', e.target.checked)} className="rounded border-gray-300" />
//                   <span className="text-xs text-gray-500">Use purchase price</span>
//                 </label>
//               </div>
//             </div>
//           </td>
//         </tr>
//       )}

//       {/* Switch to existing product row */}
//       {item.matchAction === 'new' && !showNewProductFields && (
//         <tr className="bg-gray-50">
//           <td colSpan={10} className="py-3 px-4">
//             <div className="flex items-center gap-3">
//               <span className="text-sm text-gray-600">Search existing product:</span>
//               <ExistingProductSearch
//                 businessProducts={[]}
//                 onSelect={(prod) => {
//                   onSwitchExisting(String(prod._id));
//                   onUpdate('categoryId', prod.categoryId ? String(prod.categoryId) : '');
//                   onUpdate('matchAction', 'existing');
//                   setShowNewProductFields(false);
//                 }}
//               />
//               <button type="button" onClick={() => setShowNewProductFields(true)} className="text-xs text-blue-600 hover:underline">Back to new product</button>
//             </div>
//           </td>
//         </tr>
//       )}
//     </>
//   );
// }

// // ═══════════════════════════════════════════════════════════════
// // Existing Product Search (for switching from new to existing)
// // ═══════════════════════════════════════════════════════════════
// function ExistingProductSearch({ onSelect }) {
//   const [query, setQuery] = useState('');
//   const [results, setResults] = useState([]);
//   const [searching, setSearching] = useState(false);
//   const debounceRef = useRef(null);

//   useEffect(() => {
//     if (debounceRef.current) clearTimeout(debounceRef.current);
//     if (!query.trim()) { setResults([]); return; }
//     debounceRef.current = setTimeout(async () => {
//       setSearching(true);
//       try {
//         const res = await productApi.getAll({ search: query, limit: 10, status: 'active' });
//         setResults(res.data?.data ?? []);
//       } catch {
//         /* silent */
//       } finally {
//         setSearching(false);
//       }
//     }, 300);
//     return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
//   }, [query]);

//   return (
//     <div className="relative flex-1 max-w-xs">
//       <input
//         type="text"
//         value={query}
//         onChange={(e) => setQuery(e.target.value)}
//         placeholder="Search by name or SKU..."
//         className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//         autoFocus
//       />
//       {results.length > 0 && (
//         <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
//           {results.map(p => (
//             <button
//               key={p._id || p.id}
//               type="button"
//               onClick={() => { onSelect(p); setQuery(''); setResults([]); }}
//               className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 border-b border-gray-100 last:border-0"
//             >
//               <span className="font-medium text-gray-800">{p.name}</span>
//               {p.sku && <span className="ml-2 text-gray-400">SKU: {p.sku}</span>}
//               {p.currentStock != null && <span className="ml-2 text-xs text-gray-500">Stock: {p.currentStock}</span>}
//             </button>
//           ))}
//         </div>
//       )}
//       {searching && <p className="absolute top-full left-0 mt-1 text-xs text-gray-400">Searching...</p>}
//     </div>
//   );
// }

// export default InvoiceImport;
import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import {
  HiOutlineCamera,
  HiOutlineDocumentText,
  HiOutlineCloudArrowUp,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineXCircle,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineArrowPath,
  HiOutlineArrowUpTray,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineCube,
  HiOutlineTruck,
  HiOutlineArchiveBox,
  HiOutlineBanknotes,
  HiOutlineComputerDesktop,
  HiOutlineInformationCircle,
} from 'react-icons/hi2';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import FormSelect from '../../components/FormSelect';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';
import { invoiceImportApi } from '../../api/invoiceImportApi';
import { supplierApi } from '../../api/supplierApi';
import { categoryApi } from '../../api/categoryApi';
import { productApi } from '../../api/productApi';
import { formatCurrency, PAYMENT_METHODS, UNITS } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = { 'application/pdf': ['.pdf'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] };

// ─── Confidence helpers ────────────────────────────────────────
const getConfidenceClass = (val) => {
  if (val == null) return 'text-gray-400';
  if (val >= 0.9) return 'text-green-600';
  if (val >= 0.7) return 'text-yellow-600';
  return 'text-red-600';
};
const getConfidenceLabel = (val) => {
  if (val == null) return '';
  if (val >= 0.9) return '';
  if (val >= 0.7) return 'Please verify';
  return 'Low confidence';
};

// ─── Main Component ───────────────────────────────────────────
function InvoiceImport() {
  const navigate = useNavigate();
  const cameraRef = useRef(null);

  // Screen state: 'upload' | 'review' | 'summary'
  const [screen, setScreen] = useState('upload');

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extracting, setExtracting] = useState(false);

  // Data state
  const [importId, setImportId] = useState(null);
  const [extraction, setExtraction] = useState(null);
  const [matches, setMatches] = useState(null);
  const [summary, setSummary] = useState(null);

  // Review state
  const [reviewItems, setReviewItems] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [newSupplierMode, setNewSupplierMode] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', phone: '', email: '', address: '', gstNumber: '' });
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [confirming, setConfirming] = useState(false);

  // Reference data
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);

  // Errors
  const [error, setError] = useState(null);

  // AI Provider info
  const [providerInfo, setProviderInfo] = useState(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualItems, setManualItems] = useState([
    { productName: '', sku: '', hsnCode: '', quantity: 1, unit: 'pcs', purchasePrice: 0, taxRate: 0 },
  ]);
  const [manualInvoice, setManualInvoice] = useState({ invoiceNumber: '', invoiceDate: '', supplierName: '' });

  // ─── Load reference data + provider info ───────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [supRes, catRes] = await Promise.all([
          supplierApi.getAll({ limit: 200 }),
          categoryApi.getAll({ limit: 200 }),
        ]);
        setSuppliers((supRes.data?.data ?? []).filter(s => s.status === 'active'));
        setCategories(catRes.data?.data ?? catRes.data ?? []);
      } catch {
        /* silent */
      }
      // Fetch AI provider info
      try {
        const pRes = await invoiceImportApi.getProviderInfo();
        setProviderInfo(pRes.data?.data || pRes.data);
      } catch {
        /* silent - provider info is non-critical */
      }
    };
    load();
  }, []);

  // ─── Reset everything ──────────────────────────────────────
  const resetAll = useCallback(() => {
    setScreen('upload');
    setImportId(null);
    setExtraction(null);
    setMatches(null);
    setSummary(null);
    setReviewItems([]);
    setSelectedSupplierId('');
    setNewSupplierMode(false);
    setNewSupplier({ name: '', phone: '', email: '', address: '', gstNumber: '' });
    setInvoiceNumber('');
    setInvoiceDate('');
    setNotes('');
    setPaymentMethod('credit');
    setConfirming(false);
    setError(null);
    setUploadProgress(0);
    setShowManualForm(false);
    setManualItems([{ productName: '', sku: '', hsnCode: '', quantity: 1, unit: 'pcs', purchasePrice: 0, taxRate: 0 }]);
    setManualInvoice({ invoiceNumber: '', invoiceDate: '', supplierName: '' });
  }, []);

  // ─── Dropzone setup ────────────────────────────────────────
  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    await processFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    disabled: uploading || extracting,
  });

  // ─── Process file (upload + extract) ────────────────────────
  const processFile = async (file) => {
    setError(null);
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(false);
      setExtracting(true);
      const res = await invoiceImportApi.uploadAndExtract(formData, (pct) => {
        setUploadProgress(pct);
      });
      const data = res.data?.data || res.data;
      setImportId(data.importId);
      setExtraction(data.extraction);
      setMatches(data.matches);

      // Initialize review state from extraction + matches
      initReviewState(data.extraction, data.matches);
      setScreen('review');
      toast.success('Invoice extracted successfully');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to process invoice';
      setError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
      setExtracting(false);
      setUploadProgress(0);
    }
  };

  // ─── Manual entry handlers ────────────────────────────────
  const addManualItem = () => {
    setManualItems(prev => [...prev, { productName: '', sku: '', hsnCode: '', quantity: 1, unit: 'pcs', purchasePrice: 0, taxRate: 0 }]);
  };

  const removeManualItem = (idx) => {
    setManualItems(prev => prev.filter((_, i) => i !== idx));
  };

  const updateManualItem = (idx, field, val) => {
    setManualItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
  };

  const submitManualEntry = async () => {
    const validItems = manualItems.filter(it => it.productName.trim());
    if (validItems.length === 0) {
      toast.error('Add at least one product');
      return;
    }
    setManualSubmitting(true);
    setError(null);
    try {
      const res = await invoiceImportApi.createManual({
        invoice: manualInvoice,
        items: validItems,
      });
      const data = res.data?.data || res.data;
      setImportId(data.importId);
      setExtraction(data.extraction);
      setMatches(data.matches);
      initReviewState(data.extraction, data.matches);
      setScreen('review');
      toast.success('Manual entry created - review before importing');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create manual entry';
      setError(msg);
      toast.error(msg);
    } finally {
      setManualSubmitting(false);
    }
  };

  // ─── Initialize review state from extraction + matches ─────
  const initReviewState = (ext, matchData) => {
    const inv = ext.invoice || {};
    setInvoiceNumber(inv.invoiceNumber || '');
    setInvoiceDate(inv.invoiceDate || '');

    // Supplier
    if (matchData?.matchedSupplier) {
      setSelectedSupplierId(String(matchData.matchedSupplier._id));
      setNewSupplierMode(false);
    } else if (matchData?.newSupplierSuggestion) {
      setNewSupplierMode(true);
      setNewSupplier(prev => ({
        ...prev,
        name: matchData.newSupplierSuggestion,
        phone: inv.supplierPhone || '',
        email: inv.supplierEmail || '',
        gstNumber: inv.supplierGSTIN || '',
        address: inv.billingAddress || '',
      }));
    }

    // Items
    const items = (ext.items || []).map((item, idx) => {
      const pm = matchData?.productMatches?.[idx];
      const matched = pm?.matchedProduct;
      return {
        _idx: idx,
        productId: matched ? String(matched._id) : '',
        matchAction: matched ? 'existing' : 'new',
        matchScore: pm?.matchScore || 0,
        matchMethod: pm?.matchMethod || null,
        productName: item.productName || '',
        sku: item.sku || '',
        barcode: item.barcode || '',
        hsnCode: item.hsnCode || '',
        categoryId: matched?.categoryId ? String(matched.categoryId) : '',
        brand: matched?.brand || '',
        quantity: item.quantity || 0,
        unit: item.unit || 'pcs',
        purchasePrice: item.purchasePrice || 0,
        sellingPrice: 0,
        usePurchaseAsSelling: false,
        discount: item.discount || 0,
        taxRate: item.taxRate || 0,
        taxAmount: item.taxAmount || 0,
        lineTotal: item.lineTotal || 0,
        supplierId: '',
        minimumStock: 10,
        confidence: item.confidence || {},
      };
    });
    setReviewItems(items);
  };

  // ─── Update a review item field ────────────────────────────
  const updateItem = useCallback((idx, field, value) => {
    setReviewItems(prev => prev.map((it, i) => {
      if (i !== idx) return it;
      const updated = { ...it, [field]: value };
      // Recalculate line total if price/qty/tax changed
      if (['quantity', 'purchasePrice', 'taxRate', 'discount'].includes(field)) {
        const qty = field === 'quantity' ? value : it.quantity;
        const price = field === 'purchasePrice' ? value : it.purchasePrice;
        const tax = field === 'taxRate' ? value : it.taxRate;
        const disc = field === 'discount' ? value : it.discount;
        const beforeDisc = price * qty;
        const afterDisc = beforeDisc - (beforeDisc * disc / 100);
        const taxAmt = afterDisc * (tax / 100);
        updated.lineTotal = afterDisc + taxAmt;
        updated.taxAmount = taxAmt;
      }
      return updated;
    }));
  }, []);

  // ─── Switch item to existing product ───────────────────────
  const switchToExisting = useCallback((idx, productId) => {
    const prod = reviewItems.find(it => String(it.productId) === productId);
    setReviewItems(prev => prev.map((it, i) => {
      if (i !== idx) return it;
      return {
        ...it,
        productId,
        matchAction: 'existing',
        matchScore: 100,
        matchMethod: 'manual',
        categoryId: prod?.categoryId || it.categoryId,
        unit: prod?.unit || it.unit,
        sellingPrice: 0,
        usePurchaseAsSelling: false,
      };
    }));
  }, [reviewItems]);

  // ─── Create new supplier ───────────────────────────────────
  const handleCreateSupplier = async () => {
    if (!newSupplier.name || !newSupplier.phone) {
      toast.error('Supplier name and phone are required');
      return;
    }
    try {
      const res = await supplierApi.create(newSupplier);
      const created = res.data?.data || res.data;
      setSuppliers(prev => [...prev, created]);
      setSelectedSupplierId(String(created._id));
      setNewSupplierMode(false);
      toast.success('Supplier created');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create supplier');
    }
  };

  // ─── Camera capture ────────────────────────────────────────
  const handleCameraCapture = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  }, []);

  // ─── Calculated totals ─────────────────────────────────────
  const totals = useMemo(() => {
    let subtotal = 0;
    let totalTax = 0;
    let grandTotal = 0;
    for (const item of reviewItems) {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.purchasePrice) || 0;
      const disc = Number(item.discount) || 0;
      const tax = Number(item.taxRate) || 0;
      const beforeDisc = price * qty;
      const afterDisc = beforeDisc - (beforeDisc * disc / 100);
      const taxAmt = afterDisc * (tax / 100);
      const line = afterDisc + taxAmt;
      subtotal += afterDisc;
      totalTax += taxAmt;
      grandTotal += line;
    }
    return { subtotal, totalTax, grandTotal };
  }, [reviewItems]);

  // ─── Validate before confirm ───────────────────────────────
  const validate = () => {
    if (!selectedSupplierId) {
      toast.error(newSupplierMode ? 'Please create the new supplier first' : 'Please select or create a supplier');
      return false;
    }
    for (let i = 0; i < reviewItems.length; i++) {
      const item = reviewItems[i];
      if (!item.productName.trim()) { toast.error(`Row ${i + 1}: Product name is required`); return false; }
      if (!item.quantity || item.quantity <= 0) { toast.error(`Row ${i + 1}: Valid quantity is required`); return false; }
      if (item.matchAction === 'new' && !item.categoryId) { toast.error(`Row ${i + 1}: Category is required for new product "${item.productName}"`); return false; }
      if (item.matchAction === 'new' && !item.sellingPrice && !item.usePurchaseAsSelling) { toast.error(`Row ${i + 1}: Selling price is required for new product "${item.productName}"`); return false; }
    }
    return true;
  };

  // ─── Confirm import ────────────────────────────────────────
  const handleConfirm = async () => {
    if (!validate()) return;
    setConfirming(true);
    try {
      const payload = {
        supplierId: selectedSupplierId,
        invoiceNumber,
        invoiceDate,
        notes,
        paymentMethod,
        items: reviewItems.map(item => ({
          productId: item.matchAction === 'existing' ? item.productId : null,
          matchAction: item.matchAction,
          productName: item.productName,
          sku: item.sku,
          barcode: item.barcode,
          hsnCode: item.hsnCode,
          categoryId: item.categoryId,
          brand: item.brand,
          quantity: item.quantity,
          unit: item.unit,
          purchasePrice: item.purchasePrice,
          sellingPrice: item.sellingPrice,
          usePurchaseAsSelling: item.usePurchaseAsSelling,
          discount: item.discount,
          taxRate: item.taxRate,
          taxAmount: item.taxAmount,
          lineTotal: item.lineTotal,
          supplierId: item.supplierId || selectedSupplierId,
          minimumStock: item.minimumStock,
        })),
      };
      const res = await invoiceImportApi.confirmImport(importId, payload);
      const data = res.data?.data || res.data;
      setSummary({ ...data.summary, purchaseId: data.purchase?._id || data.purchase?.id });
      setScreen('summary');
      toast.success('Invoice imported successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Import failed';
      toast.error(msg);
    } finally {
      setConfirming(false);
    }
  };

  // ─── Supplier options for dropdown ─────────────────────────
  const supplierOptions = useMemo(() => {
    return suppliers.map(s => ({
      value: String(s._id),
      label: s.company ? `${s.name} (${s.company})` : s.name,
    }));
  }, [suppliers]);

  const categoryOptions = useMemo(() => {
    return categories.map(c => ({ value: String(c._id), label: c.name }));
  }, [categories]);

  // ═══════════════════════════════════════════════════════════
  // RENDER: Upload Screen
  // ═══════════════════════════════════════════════════════════
  if (screen === 'upload') {
    return (
      <div>
        <PageHeader
          title="Scan & Stock"
          subtitle="Upload a dealer invoice and turn it into products, purchases and inventory in seconds."
        />

        <div className="max-w-2xl mx-auto mt-8">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={[
              'relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all',
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50',
              (uploading || extracting) ? 'pointer-events-none opacity-60' : '',
            ].join(' ')}
          >
            <input {...getInputProps()} />

            {uploading ? (
              <div className="space-y-4">
                <HiOutlineCloudArrowUp className="mx-auto h-16 w-16 text-blue-500 animate-pulse" />
                <p className="text-lg font-medium text-gray-700">Uploading...</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500">{uploadProgress}% uploaded</p>
              </div>
            ) : extracting ? (
              <div className="space-y-4">
                <LoadingSpinner type="form" />
                <p className="text-lg font-medium text-gray-700">Extracting invoice data...</p>
                <p className="text-sm text-gray-500">This may take a few seconds</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <HiOutlineDocumentText className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    {isDragActive ? 'Drop your invoice here' : 'Upload a supplier/dealer invoice'}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    BizFlow will extract the products and purchase details for you. Review everything before importing.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={(e) => { e.stopPropagation(); open(); }}
                    icon={HiOutlineArrowUpTray}
                  >
                    Upload Invoice
                  </Button>
                  {typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia && (
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={(e) => { e.stopPropagation(); cameraRef.current?.click(); }}
                      icon={HiOutlineCamera}
                    >
                      Use Camera
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-400">Supports PDF, JPG, PNG — Max 10 MB</p>
              </div>
            )}
          </div>

          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleCameraCapture}
          />

          {/* Error display with AI setup guide */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <HiOutlineXCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Failed to process invoice</p>
                  <p className="mt-1 text-sm text-red-600">{error}</p>
                </div>
              </div>
              {/* AI setup guide when not configured or provider error */}
              {(error.includes('not configured') || error.includes('API key') || error.includes('Rate limit') || error.includes('not supported')) && (
                <div className="mt-4 p-4 bg-white border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <HiOutlineInformationCircle className="h-5 w-5 text-blue-500" />
                    <p className="text-sm font-semibold text-blue-800">Setup AI for automatic extraction (free)</p>
                  </div>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p><strong>Recommended: Groq (100% Free)</strong></p>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-gray-600">
                      <li>Go to <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">console.groq.com/keys</a> and sign up</li>
                      <li>Click "Create API Key" and copy it</li>
                      <li>Add to your backend <code className="bg-gray-100 px-1 rounded">.env</code> file:</li>
                    </ol>
                    <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto mt-2">{`INVOICE_AI_PROVIDER=groq
INVOICE_AI_API_KEY=your_groq_api_key_here`}</pre>
                    <p className="text-xs text-gray-500 mt-2">Then restart your backend server. No credit card needed.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI not configured banner */}
          {!error && providerInfo && !providerInfo.configured && !extracting && !showManualForm && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <HiOutlineExclamationTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">AI not configured — upload will not work</p>
                  <p className="mt-1 text-xs text-amber-700">
                    Set up a free Groq API key to enable automatic invoice scanning, or use Manual Entry below.
                  </p>
                  <div className="mt-2">
                    <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-medium">
                      Get free Groq API key →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Toggle: Manual Entry */}
          {!extracting && (
            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setShowManualForm(!showManualForm); setError(null); }}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                <HiOutlineComputerDesktop className="h-4 w-4" />
                {showManualForm ? '← Back to Upload' : 'Manual Entry (no AI needed)'}
              </button>
            </div>
          )}

          {/* Manual Entry Form */}
          {showManualForm && !extracting && (
            <div className="mt-4 bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <HiOutlinePencilSquare className="h-5 w-5 text-purple-500" />
                Manual Invoice Entry
              </h3>

              {/* Invoice basics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormInput label="Invoice Number" value={manualInvoice.invoiceNumber} onChange={e => setManualInvoice(p => ({ ...p, invoiceNumber: e.target.value }))} placeholder="e.g. INV-1045" />
                <FormInput label="Invoice Date" type="date" value={manualInvoice.invoiceDate} onChange={e => setManualInvoice(p => ({ ...p, invoiceDate: e.target.value }))} />
                <FormInput label="Supplier Name" value={manualInvoice.supplierName} onChange={e => setManualInvoice(p => ({ ...p, supplierName: e.target.value }))} placeholder="e.g. ABC Distributors" />
              </div>

              {/* Items table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Products</h4>
                  <Button variant="ghost" size="sm" onClick={addManualItem} icon={HiOutlinePlus}>Add Product</Button>
                </div>

                <div className="overflow-x-auto -mx-6 px-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-2 font-medium text-gray-600">Product Name *</th>
                        <th className="text-left py-2 px-2 font-medium text-gray-600">SKU</th>
                        <th className="text-left py-2 px-2 font-medium text-gray-600">HSN</th>
                        <th className="text-right py-2 px-2 font-medium text-gray-600">Qty</th>
                        <th className="text-left py-2 px-2 font-medium text-gray-600">Unit</th>
                        <th className="text-right py-2 px-2 font-medium text-gray-600">Price</th>
                        <th className="text-right py-2 px-2 font-medium text-gray-600">GST %</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {manualItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-2 px-2">
                            <input type="text" value={item.productName} onChange={e => updateManualItem(idx, 'productName', e.target.value)} placeholder="Product name" className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                          </td>
                          <td className="py-2 px-2">
                            <input type="text" value={item.sku} onChange={e => updateManualItem(idx, 'sku', e.target.value)} placeholder="SKU" className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                          </td>
                          <td className="py-2 px-2">
                            <input type="text" value={item.hsnCode} onChange={e => updateManualItem(idx, 'hsnCode', e.target.value)} placeholder="HSN" className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                          </td>
                          <td className="py-2 px-2">
                            <input type="number" min="1" value={item.quantity} onChange={e => updateManualItem(idx, 'quantity', Number(e.target.value))} className="w-16 text-right border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                          </td>
                          <td className="py-2 px-2">
                            <select value={item.unit} onChange={e => updateManualItem(idx, 'unit', e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                              {UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                            </select>
                          </td>
                          <td className="py-2 px-2">
                            <input type="number" min="0" step="0.01" value={item.purchasePrice} onChange={e => updateManualItem(idx, 'purchasePrice', Number(e.target.value))} className="w-24 text-right border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                          </td>
                          <td className="py-2 px-2">
                            <input type="number" min="0" max="28" step="0.25" value={item.taxRate} onChange={e => updateManualItem(idx, 'taxRate', Number(e.target.value))} className="w-16 text-right border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                          </td>
                          <td className="py-2 px-1">
                            {manualItems.length > 1 && (
                              <button type="button" onClick={() => removeManualItem(idx)} className="p-1 text-red-400 hover:text-red-600">
                                <HiOutlineTrash className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Manual totals */}
                <div className="mt-4 flex justify-end">
                  <div className="text-sm text-gray-600 space-y-1 text-right">
                    <p>Items: {manualItems.filter(i => i.productName.trim()).length}</p>
                    <p className="font-semibold text-gray-800">
                      Total: {formatCurrency(manualItems.reduce((sum, it) => sum + (it.purchasePrice || 0) * (it.quantity || 0) * (1 + (it.taxRate || 0) / 100), 0))}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="primary" onClick={submitManualEntry} loading={manualSubmitting} icon={HiOutlineCheckCircle}>
                  Create & Review
                </Button>
              </div>
            </div>
          )}

          {/* Info cards - hide when manual form is shown */}
          {!showManualForm && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <HiOutlineDocumentText className="mx-auto h-8 w-8 text-blue-500" />
              <p className="mt-2 text-sm font-medium text-gray-700">Upload PDF/Image</p>
              <p className="mt-1 text-xs text-gray-500">Drag & drop or browse</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <HiOutlinePencilSquare className="mx-auto h-8 w-8 text-purple-500" />
              <p className="mt-2 text-sm font-medium text-gray-700">Review & Edit</p>
              <p className="mt-1 text-xs text-gray-500">Verify before importing</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <HiOutlineCheckCircle className="mx-auto h-8 w-8 text-green-500" />
              <p className="mt-2 text-sm font-medium text-gray-700">Confirm & Import</p>
              <p className="mt-1 text-xs text-gray-500">Auto-creates purchase + stock</p>
            </div>
          </div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: Review Screen
  // ═══════════════════════════════════════════════════════════
  if (screen === 'review') {
    return (
      <div>
        <PageHeader
          title="Review Invoice"
          subtitle="Verify extracted data before importing. Edit any incorrect values."
          actions={[
            { label: 'Cancel', variant: 'secondary', onClick: resetAll },
          ]}
        />

        <div className="mt-6 space-y-6 max-w-7xl">
          {/* ─── A. Supplier Section ──────────────────────── */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <HiOutlineTruck className="h-5 w-5 text-blue-500" />
              Supplier Information
            </h3>

            {matches?.matchedSupplier && !newSupplierMode ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <HiOutlineCheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">
                    Existing supplier found: {matches.matchedSupplier.name}
                  </p>
                  {matches.matchedSupplier.gstNumber && (
                    <p className="text-xs text-green-600">GSTIN: {matches.matchedSupplier.gstNumber}</p>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setNewSupplierMode(true); setSelectedSupplierId(''); }}>Change</Button>
              </div>
            ) : newSupplierMode ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <HiOutlinePlus className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-medium text-blue-800">New supplier detected</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput label="Supplier Name" name="name" value={newSupplier.name} onChange={(e) => setNewSupplier(p => ({ ...p, name: e.target.value }))} required />
                  <FormInput label="Phone" name="phone" value={newSupplier.phone} onChange={(e) => setNewSupplier(p => ({ ...p, phone: e.target.value }))} required />
                  <FormInput label="Email" name="email" type="email" value={newSupplier.email} onChange={(e) => setNewSupplier(p => ({ ...p, email: e.target.value }))} />
                  <FormInput label="GST Number" name="gstNumber" value={newSupplier.gstNumber} onChange={(e) => setNewSupplier(p => ({ ...p, gstNumber: e.target.value }))} />
                  <FormInput label="Address" name="address" value={newSupplier.address} onChange={(e) => setNewSupplier(p => ({ ...p, address: e.target.value }))} className="sm:col-span-2" />
                </div>
                <div className="flex gap-3">
                  <Button variant="success" size="sm" onClick={handleCreateSupplier}>Create Supplier</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setNewSupplierMode(false); }}>Select Existing</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <FormSelect
                  label="Select Supplier"
                  name="supplierId"
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  options={[{ value: '', label: 'Choose a supplier...' }, ...supplierOptions]}
                  required
                />
                <Button variant="ghost" size="sm" onClick={() => setNewSupplierMode(true)}>+ Create New Supplier</Button>
              </div>
            )}
          </div>

          {/* ─── B. Invoice Information ───────────────────── */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <HiOutlineDocumentText className="h-5 w-5 text-blue-500" />
              Invoice Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput label="Invoice Number" name="invoiceNumber" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="e.g. INV-1045" />
              <FormInput label="Invoice Date" name="invoiceDate" type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
              <FormSelect
                label="Payment Method"
                name="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                options={PAYMENT_METHODS}
              />
            </div>
          </div>

          {/* ─── C. Products Table ────────────────────────── */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <HiOutlineCube className="h-5 w-5 text-blue-500" />
              Products ({reviewItems.length})
            </h3>

            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-gray-600">#</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Product Name</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Match</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Category</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600">Qty</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Unit</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600">Purchase Price</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600">GST %</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600">Tax Amt</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewItems.map((item, idx) => (
                    <ProductRow
                      key={idx}
                      item={item}
                      idx={idx}
                      categories={categoryOptions}
                      onUpdate={(field, val) => updateItem(idx, field, val)}
                      onSwitchExisting={(pid) => switchToExisting(idx, pid)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Item-level new product selling price modals handled inline */}
          </div>

          {/* ─── D. Purchase Summary ──────────────────────── */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <HiOutlineBanknotes className="h-5 w-5 text-blue-500" />
              Purchase Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <FormInput label="Notes" name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />
            </div>
            <div className="border-t border-gray-200 pt-4 space-y-2 max-w-xs ml-auto">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax</span>
                <span>{formatCurrency(totals.totalTax)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-gray-900 border-t border-gray-200 pt-2">
                <span>Grand Total</span>
                <span>{formatCurrency(totals.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* ─── Confirm Button ──────────────────────────── */}
          <div className="flex justify-end gap-3 pb-6">
            <Button variant="secondary" onClick={resetAll}>Cancel</Button>
            <Button variant="primary" onClick={handleConfirm} loading={confirming} icon={HiOutlineCheckCircle}>
              Confirm & Import
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: Summary Screen
  // ═══════════════════════════════════════════════════════════
  if (screen === 'summary' && summary) {
    return (
      <div>
        <PageHeader
          title="Import Complete"
          subtitle="Your invoice has been imported successfully."
        />

        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <HiOutlineCheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">Invoice Imported Successfully</h2>

            <div className="mt-6 grid grid-cols-2 gap-4 text-left">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-blue-700">{summary.productsCreated || 0}</p>
                <p className="text-sm text-blue-600">Products Created</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-purple-700">{summary.productsMatched || 0}</p>
                <p className="text-sm text-purple-600">Existing Updated</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-green-700">{summary.inventoryUpdated || 0}</p>
                <p className="text-sm text-green-600">Inventory Items Updated</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-yellow-700">{formatCurrency(summary.purchaseTotal || 0)}</p>
                <p className="text-sm text-yellow-600">Purchase Total</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {summary.purchaseId && (
                <Button variant="primary" onClick={() => navigate(`/app/purchases`)} icon={HiOutlineEye}>
                  View Purchases
                </Button>
              )}
              <Button variant="secondary" onClick={() => navigate('/app/products')} icon={HiOutlineCube}>
                View Products
              </Button>
              <Button variant="secondary" onClick={() => navigate('/app/inventory')} icon={HiOutlineArchiveBox}>
                View Inventory
              </Button>
              <Button variant="ghost" onClick={resetAll} icon={HiOutlineArrowPath}>
                Import Another Invoice
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════
// Product Row Sub-component
// ═══════════════════════════════════════════════════════════════
function ProductRow({ item, idx, categories, onUpdate, onSwitchExisting }) {
  const [showNewProductFields, setShowNewProductFields] = useState(item.matchAction === 'new');

  const matchBadge = item.matchAction === 'existing' ? (
    <Badge variant="success">Matched ({item.matchMethod})</Badge>
  ) : (
    <Badge variant="warning">New Product</Badge>
  );

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50">
        <td className="py-2 px-2 text-gray-500">{idx + 1}</td>
        <td className="py-2 px-2">
          <input
            type="text"
            value={item.productName}
            onChange={(e) => onUpdate('productName', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {item.confidence?.productName != null && item.confidence.productName < 0.9 && (
            <p className={`text-xs mt-0.5 ${getConfidenceClass(item.confidence.productName)}`}>
              {getConfidenceLabel(item.confidence.productName)}
            </p>
          )}
        </td>
        <td className="py-2 px-2">
          <div className="flex items-center gap-2">
            {matchBadge}
            {item.matchAction === 'existing' && (
              <button
                type="button"
                onClick={() => { onUpdate('matchAction', 'new'); onUpdate('productId', ''); setShowNewProductFields(true); }}
                className="text-xs text-blue-600 hover:underline"
              >Create New</button>
            )}
            {item.matchAction === 'new' && (
              <button
                type="button"
                onClick={() => { setShowNewProductFields(false); }}
                className="text-xs text-blue-600 hover:underline"
              >Match Existing</button>
            )}
          </div>
        </td>
        <td className="py-2 px-2">
          {item.matchAction === 'new' ? (
            <select
              value={item.categoryId}
              onChange={(e) => onUpdate('categoryId', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select category</option>
              {categories.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          ) : (
            <span className="text-sm text-gray-500">—</span>
          )}
        </td>
        <td className="py-2 px-2">
          <input
            type="number"
            min="0.01"
            step="1"
            value={item.quantity}
            onChange={(e) => onUpdate('quantity', parseFloat(e.target.value) || 0)}
            className="w-20 text-right border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </td>
        <td className="py-2 px-2">
          <select
            value={item.unit}
            onChange={(e) => onUpdate('unit', e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {UNITS.map(u => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>
        </td>
        <td className="py-2 px-2">
          <input
            type="number"
            min="0"
            step="0.01"
            value={item.purchasePrice}
            onChange={(e) => onUpdate('purchasePrice', parseFloat(e.target.value) || 0)}
            className={`w-24 text-right border rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${item.confidence?.purchasePrice != null && item.confidence.purchasePrice < 0.7 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}
          />
        </td>
        <td className="py-2 px-2">
          <input
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={item.taxRate}
            onChange={(e) => onUpdate('taxRate', parseFloat(e.target.value) || 0)}
            className="w-16 text-right border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </td>
        <td className="py-2 px-2 text-right text-sm text-gray-600">{formatCurrency(item.taxAmount)}</td>
        <td className="py-2 px-2 text-right text-sm font-medium text-gray-900">{formatCurrency(item.lineTotal)}</td>
      </tr>

      {/* Expanded new-product fields */}
      {item.matchAction === 'new' && showNewProductFields && (
        <tr className="bg-blue-50/50">
          <td colSpan={10} className="py-3 px-4">
            <p className="text-xs font-semibold text-blue-700 mb-2">New Product Details</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">SKU</label>
                <input type="text" value={item.sku} onChange={(e) => onUpdate('sku', e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="SKU" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Barcode</label>
                <input type="text" value={item.barcode} onChange={(e) => onUpdate('barcode', e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Barcode" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">HSN/SAC</label>
                <input type="text" value={item.hsnCode} onChange={(e) => onUpdate('hsnCode', e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="HSN" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Brand</label>
                <input type="text" value={item.brand} onChange={(e) => onUpdate('brand', e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Brand" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min Stock</label>
                <input type="number" min="0" value={item.minimumStock} onChange={(e) => onUpdate('minimumStock', parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Selling Price *</label>
                <div className="flex items-center gap-2">
                  <input type="number" min="0" step="0.01" value={item.usePurchaseAsSelling ? item.purchasePrice : item.sellingPrice} disabled={item.usePurchaseAsSelling} onChange={(e) => onUpdate('sellingPrice', parseFloat(e.target.value) || 0)} className={`w-full border rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${item.usePurchaseAsSelling ? 'bg-gray-100 text-gray-500' : 'border-gray-300'}`} />
                </div>
                <label className="flex items-center gap-1 mt-1">
                  <input type="checkbox" checked={item.usePurchaseAsSelling} onChange={(e) => onUpdate('usePurchaseAsSelling', e.target.checked)} className="rounded border-gray-300" />
                  <span className="text-xs text-gray-500">Use purchase price</span>
                </label>
              </div>
            </div>
          </td>
        </tr>
      )}

      {/* Switch to existing product row */}
      {item.matchAction === 'new' && !showNewProductFields && (
        <tr className="bg-gray-50">
          <td colSpan={10} className="py-3 px-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Search existing product:</span>
              <ExistingProductSearch
                businessProducts={[]}
                onSelect={(prod) => {
                  onSwitchExisting(String(prod._id));
                  onUpdate('categoryId', prod.categoryId ? String(prod.categoryId) : '');
                  onUpdate('matchAction', 'existing');
                  setShowNewProductFields(false);
                }}
              />
              <button type="button" onClick={() => setShowNewProductFields(true)} className="text-xs text-blue-600 hover:underline">Back to new product</button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// Existing Product Search (for switching from new to existing)
// ═══════════════════════════════════════════════════════════════
function ExistingProductSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await productApi.getAll({ search: query, limit: 10, status: 'active' });
        setResults(res.data?.data ?? []);
      } catch {
        /* silent */
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  return (
    <div className="relative flex-1 max-w-xs">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or SKU..."
        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        autoFocus
      />
      {results.length > 0 && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {results.map(p => (
            <button
              key={p._id || p.id}
              type="button"
              onClick={() => { onSelect(p); setQuery(''); setResults([]); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 border-b border-gray-100 last:border-0"
            >
              <span className="font-medium text-gray-800">{p.name}</span>
              {p.sku && <span className="ml-2 text-gray-400">SKU: {p.sku}</span>}
              {p.currentStock != null && <span className="ml-2 text-xs text-gray-500">Stock: {p.currentStock}</span>}
            </button>
          ))}
        </div>
      )}
      {searching && <p className="absolute top-full left-0 mt-1 text-xs text-gray-400">Searching...</p>}
    </div>
  );
}

export default InvoiceImport;
