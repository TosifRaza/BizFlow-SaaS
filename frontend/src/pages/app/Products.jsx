// import { useState, useEffect, useCallback, useRef } from 'react';
// import {
//   HiOutlinePlus,
//   HiOutlinePencil,
//   HiOutlineTrash,
//   HiOutlineEye,
//   HiOutlineMagnifyingGlass,
//   HiOutlineCube,
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
// import { productApi } from '../../api/productApi';
// import { categoryApi } from '../../api/categoryApi';
// import { uploadApi } from '../../api/uploadApi';
// import { formatCurrency, UNITS } from '../../utils/helpers';
// import { useAuth } from '../../context/AuthContext';

// const emptyForm = {
//   name: '',
//   sku: '',
//   barcode: '',
//   categoryId: '',
//   brand: '',
//   description: '',
//   image: '',
//   purchasePrice: '',
//   sellingPrice: '',
//   discount: '',
//   taxRate: '',
//   unit: 'pcs',
//   minimumStock: '',
//   maximumStock: '',
//   supplier: '',
//   status: 'active',
// };

// function Products() {
//   const { hasPermission } = useAuth();
//   const canCreate = hasPermission('products.create');
//   const canUpdate = hasPermission('products.update');
//   const canDelete = hasPermission('products.delete');

//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
//   const [search, setSearch] = useState('');
//   const [filters, setFilters] = useState({ category: '', status: '' });
//   const [categories, setCategories] = useState([]);

//   // Modal states
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [editingProduct, setEditingProduct] = useState(null);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [deletingProduct, setDeletingProduct] = useState(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [deleting, setDeleting] = useState(false);

//   // Form state
//   const [form, setForm] = useState(emptyForm);
//   const [formErrors, setFormErrors] = useState({});
//   const [imagePreview, setImagePreview] = useState('');
//   const [imageFile, setImageFile] = useState(null);
//   const fileInputRef = useRef(null);

//   // Load categories
//   useEffect(() => {
//     const loadCategories = async () => {
//       try {
//         const res = await categoryApi.getAll();
//         const cats = res.data?.data || res.data || [];
//         setCategories(Array.isArray(cats) ? cats : []);
//       } catch {
//         // non-critical
//       }
//     };
//     loadCategories();
//   }, []);

//   // Fetch products
//   const fetchProducts = useCallback(async () => {
//     setLoading(true);
//     try {
//       const params = { page: pagination.page, limit: pagination.limit, search };
//       if (filters.category) params.categoryId = filters.category;
//       if (filters.status) params.status = filters.status;
//       const { data } = await productApi.getAll(params);
//       const list = data?.data || data?.products || data || [];
//       setProducts(Array.isArray(list) ? list : []);
//       setPagination((prev) => ({
//         ...prev,
//         total: data?.total ?? data?.pagination?.total ?? prev.total,
//       }));
//     } catch {
//       toast.error('Failed to load products');
//     } finally {
//       setLoading(false);
//     }
//   }, [pagination.page, pagination.limit, search, filters.category, filters.status]);

//   useEffect(() => {
//     fetchProducts();
//   }, [fetchProducts]);

//   const handleSearch = useCallback((val) => {
//     setSearch(val);
//     setPagination((prev) => ({ ...prev, page: 1 }));
//   }, []);

//   const handlePageChange = useCallback((newPage) => {
//     setPagination((prev) => ({ ...prev, page: newPage }));
//   }, []);

//   // Form handlers
//   const handleFormChange = (e) => {
//     const { name, value, files } = e.target;
//     setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
//     if (name === 'image' && files?.[0]) {
//       setImageFile(files[0]);
//       setImagePreview(URL.createObjectURL(files[0]));
//     }
//     if (formErrors[name]) {
//       setFormErrors((prev) => ({ ...prev, [name]: '' }));
//     }
//   };

//   const validateForm = () => {
//     const errors = {};
//     if (!form.name?.trim()) errors.name = 'Product name is required';
//     if (!form.sellingPrice || Number(form.sellingPrice) <= 0) errors.sellingPrice = 'Valid selling price is required';
//     if (!form.purchasePrice || Number(form.purchasePrice) <= 0) errors.purchasePrice = 'Valid purchase price is required';
//     return errors;
//   };

//   const resetForm = () => {
//     setForm(emptyForm);
//     setFormErrors({});
//     setImagePreview('');
//     setImageFile(null);
//     setEditingProduct(null);
//   };

//   const openAddModal = () => {
//     resetForm();
//     setShowAddModal(true);
//   };

//   const openEditModal = (product) => {
//     setEditingProduct(product);
//     setForm({
//       name: product.name || '',
//       sku: product.sku || '',
//       barcode: product.barcode || '',
//       categoryId: product.categoryId || product.category?.id || '',
//       brand: product.brand || '',
//       description: product.description || '',
//       image: product.image || '',
//       purchasePrice: String(product.purchasePrice ?? ''),
//       sellingPrice: String(product.sellingPrice ?? ''),
//       discount: String(product.discount ?? ''),
//       taxRate: String(product.taxRate ?? ''),
//       unit: product.unit || 'pcs',
//       minimumStock: String(product.minimumStock ?? ''),
//       maximumStock: String(product.maximumStock ?? ''),
//       supplier: product.supplier || '',
//       status: product.status || 'active',
//     });
//     setImagePreview(product.image || '');
//     setImageFile(null);
//     setFormErrors({});
//     setShowAddModal(true);
//   };

//   const handleImageUpload = async () => {
//     if (!imageFile) return form.image;
//     try {
//       const formData = new FormData();
//       formData.append('image', imageFile);
//       const { data } = await uploadApi.uploadImage(formData);
//       return data?.data?.url ?? data?.url ?? '';
//     } catch {
//       toast.error('Failed to upload image');
//       return form.image;
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const errors = validateForm();
//     if (Object.keys(errors).length > 0) {
//       setFormErrors(errors);
//       return;
//     }
//     setSubmitting(true);
//     try {
//       const imageUrl = await handleImageUpload();
//       const payload = {
//         ...form,
//         image: imageUrl,
//         purchasePrice: Number(form.purchasePrice),
//         sellingPrice: Number(form.sellingPrice),
//         discount: form.discount ? Number(form.discount) : 0,
//         taxRate: form.taxRate ? Number(form.taxRate) : 0,
//         minimumStock: form.minimumStock ? Number(form.minimumStock) : undefined,
//         maximumStock: form.maximumStock ? Number(form.maximumStock) : undefined,
//         categoryId: form.categoryId || undefined,
//       };
//       delete payload.imageFile;

//       if (editingProduct) {
//         await productApi.update(editingProduct.id, payload);
//         toast.success('Product updated successfully');
//       } else {
//         await productApi.create(payload);
//         toast.success('Product added successfully');
//       }
//       setShowAddModal(false);
//       resetForm();
//       fetchProducts();
//     } catch (err) {
//       toast.error(err?.response?.data?.message || 'Failed to save product');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!deletingProduct) return;
//     setDeleting(true);
//     try {
//       await productApi.delete(deletingProduct.id);
//       toast.success('Product deleted successfully');
//       setShowDeleteConfirm(false);
//       setDeletingProduct(null);
//       fetchProducts();
//     } catch (err) {
//       toast.error(err?.response?.data?.message || 'Failed to delete product');
//     } finally {
//       setDeleting(false);
//     }
//   };

//   const columns = [
//     {
//       key: 'image',
//       label: '',
//       render: (val, row) => (
//         <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
//           {val ? (
//             <img src={val} alt="" className="w-full h-full object-cover" />
//           ) : (
//             <HiOutlineCube className="w-5 h-5 text-gray-400" />
//           )}
//         </div>
//       ),
//     },
//     { key: 'name', label: 'Name', sortable: true, render: (val) => <span className="font-medium text-gray-900">{val}</span> },
//     { key: 'sku', label: 'SKU', render: (val) => val || '—' },
//     {
//       key: 'categoryName',
//       label: 'Category',
//       render: (val, row) => row.categoryName || row.category?.name || '—',
//     },
//     {
//       key: 'sellingPrice',
//       label: 'Price',
//       sortable: true,
//       render: (val) => <span className="font-medium">{formatCurrency(val)}</span>,
//     },
//     {
//       key: 'currentStock',
//       label: 'Stock',
//       sortable: true,
//       render: (val) => {
//         const stock = val ?? 0;
//         return (
//           <span className={stock <= 0 ? 'text-red-600 font-medium' : stock < 10 ? 'text-yellow-600' : 'text-gray-700'}>
//             {stock}
//           </span>
//         );
//       },
//     },
//     {
//       key: 'status',
//       label: 'Status',
//       render: (val) => <Badge variant={val === 'active' ? 'success' : 'gray'}>{val || 'active'}</Badge>,
//     },
//   ];

//   if (loading) return <LoadingSpinner type="page" />;

//   return (
//     <div>
//       <PageHeader
//         title="Products"
//         subtitle={`${products.length} product${products.length !== 1 ? 's' : ''}`}
//         actions={canCreate ? [
//           { label: 'Add Product', icon: HiOutlinePlus, onClick: openAddModal },
//         ] : []}
//       />

//       {/* Filters */}
//       <div className="flex flex-wrap items-center gap-3 mb-4">
//         <div className="w-48">
//           <select
//             value={filters.category}
//             onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
//             className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           >
//             <option value="">All Categories</option>
//             {categories.map((c) => (
//               <option key={c.id} value={c.id}>{c.name}</option>
//             ))}
//           </select>
//         </div>
//         <div className="w-40">
//           <select
//             value={filters.status}
//             onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
//             className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           >
//             <option value="">All Status</option>
//             <option value="active">Active</option>
//             <option value="inactive">Inactive</option>
//           </select>
//         </div>
//       </div>

//       {products.length === 0 && !loading ? (
//         <EmptyState
//           icon={<HiOutlineCube className="w-16 h-16" />}
//           title="No products yet"
//           description="Add your first product to get started with your inventory."
//           actionLabel={canCreate ? 'Add Product' : undefined}
//           onAction={canCreate ? openAddModal : undefined}
//         />
//       ) : (
//         <DataTable
//           columns={columns}
//           data={products}
//           loading={loading}
//           onSearch={handleSearch}
//           searchPlaceholder="Search products..."
//           actions={(row) => {
//             if (!canUpdate && !canDelete) return null;
//             return (
//               <div className="flex items-center gap-1">
//                 {canUpdate && (
//                   <Button variant="ghost" size="sm" onClick={() => openEditModal(row)} title="Edit">
//                     <HiOutlinePencil className="w-4 h-4" />
//                   </Button>
//                 )}
//                 {canDelete && (
//                   <Button variant="ghost" size="sm" onClick={() => { setDeletingProduct(row); setShowDeleteConfirm(true); }} title="Delete">
//                     <HiOutlineTrash className="w-4 h-4 text-red-600" />
//                   </Button>
//                 )}
//               </div>
//             );
//           }}
//           pagination={{
//             page: pagination.page,
//             limit: pagination.limit,
//             total: pagination.total,
//             onPageChange: handlePageChange,
//           }}
//         />
//       )}

//       {/* Add/Edit Modal */}
//       <Modal
//         isOpen={showAddModal}
//         onClose={() => { setShowAddModal(false); resetForm(); }}
//         title={editingProduct ? 'Edit Product' : 'Add Product'}
//         size="lg"
//       >
//         <form onSubmit={handleSubmit}>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <FormInput
//               name="name"
//               label="Product Name"
//               value={form.name}
//               onChange={handleFormChange}
//               error={formErrors.name}
//               required
//               placeholder="Enter product name"
//             />
//             <FormInput
//               name="sku"
//               label="SKU"
//               value={form.sku}
//               onChange={handleFormChange}
//               placeholder="e.g. PRD-001"
//             />
//             <FormInput
//               name="barcode"
//               label="Barcode"
//               value={form.barcode}
//               onChange={handleFormChange}
//               placeholder="Scan or enter barcode"
//             />
//             <FormSelect
//               name="categoryId"
//               label="Category"
//               value={form.categoryId}
//               onChange={handleFormChange}
//               options={categories.map((c) => ({ value: c.id, label: c.name }))}
//               placeholder="Select category"
//             />
//             <FormInput
//               name="brand"
//               label="Brand"
//               value={form.brand}
//               onChange={handleFormChange}
//               placeholder="Brand name"
//             />
//             <FormSelect
//               name="unit"
//               label="Unit"
//               value={form.unit}
//               onChange={handleFormChange}
//               // options={UNITS.map((u) => ({ value: u, label: u }))}
//               options={UNITS}
//             />

//             {/* Image upload */}
//             <div className="sm:col-span-2">
//               <label className="text-sm font-medium text-gray-700 mb-1.5 block">Product Image</label>
//               <div className="flex items-center gap-4">
//                 {imagePreview ? (
//                   <div className="relative">
//                     <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-lg object-cover border border-gray-200" />
//                     <button
//                       type="button"
//                       onClick={() => { setImagePreview(''); setImageFile(null); setForm((f) => ({ ...f, image: '' })); }}
//                       className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 cursor-pointer"
//                     >
//                       x
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
//                     <HiOutlineCube className="w-8 h-8 text-gray-400" />
//                   </div>
//                 )}
//                 <div>
//                   <input
//                     ref={fileInputRef}
//                     type="file"
//                     accept="image/*"
//                     name="image"
//                     onChange={handleFormChange}
//                     className="hidden"
//                   />
//                   <Button
//                     type="button"
//                     variant="secondary"
//                     size="sm"
//                     onClick={() => fileInputRef.current?.click()}
//                   >
//                     Upload Image
//                   </Button>
//                   <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</p>
//                 </div>
//               </div>
//             </div>

//             <div className="sm:col-span-2">
//               <div className="flex flex-col gap-1.5">
//                 <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
//                 <textarea
//                   id="description"
//                   name="description"
//                   value={form.description}
//                   onChange={handleFormChange}
//                   rows={3}
//                   className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
//                   placeholder="Product description"
//                 />
//               </div>
//             </div>

//             <FormInput
//               name="purchasePrice"
//               label="Purchase Price"
//               type="number"
//               value={form.purchasePrice}
//               onChange={handleFormChange}
//               error={formErrors.purchasePrice}
//               required
//               placeholder="0"
//               min="0"
//             />
//             <FormInput
//               name="sellingPrice"
//               label="Selling Price"
//               type="number"
//               value={form.sellingPrice}
//               onChange={handleFormChange}
//               error={formErrors.sellingPrice}
//               required
//               placeholder="0"
//               min="0"
//             />
//             <FormInput
//               name="discount"
//               label="Discount (%)"
//               type="number"
//               value={form.discount}
//               onChange={handleFormChange}
//               placeholder="0"
//               min="0"
//               max="100"
//             />
//             <FormInput
//               name="taxRate"
//               label="Tax Rate (%)"
//               type="number"
//               value={form.taxRate}
//               onChange={handleFormChange}
//               placeholder="0"
//               min="0"
//               max="100"
//             />
//             <FormInput
//               name="minimumStock"
//               label="Min Stock Alert"
//               type="number"
//               value={form.minimumStock}
//               onChange={handleFormChange}
//               placeholder="0"
//               min="0"
//             />
//             <FormInput
//               name="maximumStock"
//               label="Max Stock"
//               type="number"
//               value={form.maximumStock}
//               onChange={handleFormChange}
//               placeholder="0"
//               min="0"
//             />
//             <FormInput
//               name="supplier"
//               label="Supplier"
//               value={form.supplier}
//               onChange={handleFormChange}
//               placeholder="Supplier name"
//             />
//             <FormSelect
//               name="status"
//               label="Status"
//               value={form.status}
//               onChange={handleFormChange}
//               options={[
//                 { value: 'active', label: 'Active' },
//                 { value: 'inactive', label: 'Inactive' },
//               ]}
//             />
//           </div>
//           <div className="flex justify-end gap-3 mt-6">
//             <Button variant="secondary" type="button" onClick={() => { setShowAddModal(false); resetForm(); }}>
//               Cancel
//             </Button>
//             <Button type="submit" loading={submitting}>
//               {editingProduct ? 'Update' : 'Add'} Product
//             </Button>
//           </div>
//         </form>
//       </Modal>

//       {/* Delete Confirmation */}
//       <ConfirmDialog
//         isOpen={showDeleteConfirm}
//         onConfirm={handleDelete}
//         onCancel={() => { setShowDeleteConfirm(false); setDeletingProduct(null); }}
//         title="Delete Product?"
//         message={`Are you sure you want to delete "${deletingProduct?.name}"? This action cannot be undone.`}
//         confirmText="Delete"
//         variant="danger"
//         loading={deleting}
//       />
//     </div>
//   );
// }

// export default Products;
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineMagnifyingGlass,
  HiOutlineCube,
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
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import { uploadApi } from '../../api/uploadApi';
import { formatCurrency, UNITS } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

const getEntityId = (entity) => {
  if (!entity) return '';
  return entity.id || entity._id || entity.value || '';
};

const normalizeCategory = (category) => ({
  ...category,
  id: getEntityId(category),
});

const emptyForm = {
  name: '',
  sku: '',
  barcode: '',
  categoryId: '',
  brand: '',
  description: '',
  image: '',
  purchasePrice: '',
  sellingPrice: '',
  discount: '',
  taxRate: '',
  unit: 'pcs',
  minimumStock: '',
  maximumStock: '',
  currentStock: '',
  supplier: '',
  status: 'active',
};

function Products() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('products.create');
  const canUpdate = hasPermission('products.update');
  const canDelete = hasPermission('products.delete');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', status: '' });
  const [categories, setCategories] = useState([]);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  // Load categories
  // useEffect(() => {
  //   const loadCategories = async () => {
  //     try {
  //       const res = await categoryApi.getAll();
  //       const rawCategories =
  //         res.data?.data?.categories ||
  //         res.data?.categories ||
  //         res.data?.data ||
  //         res.data ||
  //         [];

  //       const cats = Array.isArray(rawCategories)
  //         ? rawCategories.map(normalizeCategory).filter((c) => c.id)
  //         : [];

  //       setCategories(cats);
  //     } catch {
  //       // non-critical
  //     }
  //   };
  //   loadCategories();
  // }, []);
  useEffect(() => {
  const loadCategories = async () => {
    try {
      const res = await categoryApi.getAll();

      console.log('CATEGORY API RESPONSE:', res.data);

      const response = res.data;

      let rawCategories = [];

      if (Array.isArray(response)) {
        rawCategories = response;
      } else if (Array.isArray(response?.data)) {
        rawCategories = response.data;
      } else if (Array.isArray(response?.data?.categories)) {
        rawCategories = response.data.categories;
      } else if (Array.isArray(response?.categories)) {
        rawCategories = response.categories;
      }

      const normalizedCategories = rawCategories
        .map((category) => ({
          ...category,
          id: String(
            category.id ??
            category._id ??
            category.categoryId ??
            ''
          ),
          name: category.name ?? category.title ?? '',
        }))
        .filter((category) => category.id && category.name);

      console.log(
        'NORMALIZED CATEGORIES:',
        normalizedCategories
      );

      setCategories(normalizedCategories);

      if (normalizedCategories.length === 0) {
        console.warn(
          'No categories were found in the API response.'
        );
      }
    } catch (error) {
      console.error(
        'Failed to load categories:',
        error
      );

      toast.error(
        error?.response?.data?.message ||
        'Failed to load categories'
      );

      setCategories([]);
    }
  };

  loadCategories();
}, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: pagination.limit, search };
      if (filters.category) params.categoryId = filters.category;
      if (filters.status) params.status = filters.status;
      const { data } = await productApi.getAll(params);
      const list = data?.data || data?.products || data || [];
      setProducts(Array.isArray(list) ? list : []);
      setPagination((prev) => ({
        ...prev,
        total: data?.total ?? data?.pagination?.total ?? prev.total,
      }));
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, filters.category, filters.status]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = useCallback((val) => {
    setSearch(val);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  // Form handlers
  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
    if (name === 'image' && files?.[0]) {
      setImageFile(files[0]);
      setImagePreview(URL.createObjectURL(files[0]));
    }
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.name?.trim()) errors.name = 'Product name is required';
    if (!form.sellingPrice || Number(form.sellingPrice) <= 0) errors.sellingPrice = 'Valid selling price is required';
    if (!form.purchasePrice || Number(form.purchasePrice) <= 0) errors.purchasePrice = 'Valid purchase price is required';
    if (form.categoryId && !categories.some((c) => String(c.id) === String(form.categoryId))) {
      errors.categoryId = 'Please select a valid category';
    }
    return errors;
  };

  const resetForm = () => {
    setForm(emptyForm);
    setFormErrors({});
    setImagePreview('');
    setImageFile(null);
    setEditingProduct(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      sku: product.sku || '',
      barcode: product.barcode || '',
      categoryId: getEntityId(product.categoryId) || getEntityId(product.category) || '',
      brand: product.brand || '',
      description: product.description || '',
      image: product.image || '',
      purchasePrice: String(product.purchasePrice ?? ''),
      sellingPrice: String(product.sellingPrice ?? ''),
      discount: String(product.discount ?? ''),
      taxRate: String(product.taxRate ?? ''),
      unit: product.unit || 'pcs',
      minimumStock: String(product.minimumStock ?? ''),
      maximumStock: String(product.maximumStock ?? ''),
      currentStock: String(product.currentStock ?? ''), 
      supplier: product.supplier || '',
      status: product.status || 'active',
    });
    setImagePreview(product.image || '');
    setImageFile(null);
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleImageUpload = async () => {
    if (!imageFile) return form.image;
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      const { data } = await uploadApi.uploadImage(formData);
      return data?.data?.url ?? data?.url ?? '';
    } catch {
      toast.error('Failed to upload image');
      return form.image;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setSubmitting(true);
    try {
      const imageUrl = await handleImageUpload();
      const payload = {
        ...form,
        image: imageUrl,
        purchasePrice: Number(form.purchasePrice),
        sellingPrice: Number(form.sellingPrice),
        discount: form.discount ? Number(form.discount) : 0,
        taxRate: form.taxRate ? Number(form.taxRate) : 0,
        minimumStock: form.minimumStock ? Number(form.minimumStock) : undefined,
        maximumStock: form.maximumStock ? Number(form.maximumStock) : undefined,
        currentStock: form.currentStock ? Number(form.currentStock) : 0,
        categoryId: form.categoryId ? String(form.categoryId) : undefined,
      };
      delete payload.imageFile;

      if (editingProduct) {
        await productApi.update(editingProduct.id, payload);
        toast.success('Product updated successfully');
      } else {
        await productApi.create(payload);
        toast.success('Product added successfully');
      }
      setShowAddModal(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    setDeleting(true);
    try {
      await productApi.delete(deletingProduct.id);
      toast.success('Product deleted successfully');
      setShowDeleteConfirm(false);
      setDeletingProduct(null);
      fetchProducts();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'image',
      label: '',
      render: (val, row) => (
        <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
          {val ? (
            <img src={val} alt="" className="w-full h-full object-cover" />
          ) : (
            <HiOutlineCube className="w-5 h-5 text-gray-400" />
          )}
        </div>
      ),
    },
    { key: 'name', label: 'Name', sortable: true, render: (val) => <span className="font-medium text-gray-900">{val}</span> },
    { key: 'sku', label: 'SKU', render: (val) => val || '—' },
    {
  key: 'categoryName',
  label: 'Category',
  render: (val, row) => row.categoryName || row.category?.name || row.categoryId?.name || '—',
},
    {
      key: 'sellingPrice',
      label: 'Price',
      sortable: true,
      render: (val) => <span className="font-medium">{formatCurrency(val)}</span>,
    },
    {
      key: 'currentStock',
      label: 'Stock',
      sortable: true,
      render: (val) => {
        const stock = val ?? 0;
        return (
          <span className={stock <= 0 ? 'text-red-600 font-medium' : stock < 10 ? 'text-yellow-600' : 'text-gray-700'}>
            {stock}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <Badge variant={val === 'active' ? 'success' : 'gray'}>{val || 'active'}</Badge>,
    },
  ];

  if (loading) return <LoadingSpinner type="page" />;

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${products.length} product${products.length !== 1 ? 's' : ''}`}
        actions={canCreate ? [
          { label: 'Add Product', icon: HiOutlinePlus, onClick: openAddModal },
        ] : []}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="w-48">
          <select
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="w-40">
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {products.length === 0 && !loading ? (
        <EmptyState
          icon={<HiOutlineCube className="w-16 h-16" />}
          title="No products yet"
          description="Add your first product to get started with your inventory."
          actionLabel={canCreate ? 'Add Product' : undefined}
          onAction={canCreate ? openAddModal : undefined}
        />
      ) : (
        <DataTable
          columns={columns}
          data={products}
          loading={loading}
          onSearch={handleSearch}
          searchPlaceholder="Search products..."
          actions={(row) => {
            if (!canUpdate && !canDelete) return null;
            return (
              <div className="flex items-center gap-1">
                {canUpdate && (
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(row)} title="Edit">
                    <HiOutlinePencil className="w-4 h-4" />
                  </Button>
                )}
                {canDelete && (
                  <Button variant="ghost" size="sm" onClick={() => { setDeletingProduct(row); setShowDeleteConfirm(true); }} title="Delete">
                    <HiOutlineTrash className="w-4 h-4 text-red-600" />
                  </Button>
                )}
              </div>
            );
          }}
          pagination={{
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            onPageChange: handlePageChange,
          }}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); resetForm(); }}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              name="name"
              label="Product Name"
              value={form.name}
              onChange={handleFormChange}
              error={formErrors.name}
              required
              placeholder="Enter product name"
            />
            <FormInput
              name="sku"
              label="SKU"
              value={form.sku}
              onChange={handleFormChange}
              placeholder="e.g. PRD-001"
            />
            <FormInput
              name="barcode"
              label="Barcode"
              value={form.barcode}
              onChange={handleFormChange}
              placeholder="Scan or enter barcode"
            />
            <FormSelect
              name="categoryId"
              label="Category"
              value={form.categoryId}
              onChange={handleFormChange}
              error={formErrors.categoryId}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Select category"
            />
            <FormInput
              name="brand"
              label="Brand"
              value={form.brand}
              onChange={handleFormChange}
              placeholder="Brand name"
            />
            <FormSelect
              name="unit"
              label="Unit"
              value={form.unit}
              onChange={handleFormChange}
              // options={UNITS.map((u) => ({ value: u, label: u }))}
              options={UNITS}
            />

            {/* Image upload */}
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Product Image</label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-lg object-cover border border-gray-200" />
                    <button
                      type="button"
                      onClick={() => { setImagePreview(''); setImageFile(null); setForm((f) => ({ ...f, image: '' })); }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 cursor-pointer"
                    >
                      x
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                    <HiOutlineCube className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    name="image"
                    onChange={handleFormChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload Image
                  </Button>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</p>
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Product description"
                />
              </div>
            </div>

            <FormInput
              name="purchasePrice"
              label="Purchase Price"
              type="number"
              value={form.purchasePrice}
              onChange={handleFormChange}
              error={formErrors.purchasePrice}
              required
              placeholder="0"
              min="0"
            />
            <FormInput
              name="sellingPrice"
              label="Selling Price"
              type="number"
              value={form.sellingPrice}
              onChange={handleFormChange}
              error={formErrors.sellingPrice}
              required
              placeholder="0"
              min="0"
            />
            <FormInput
              name="discount"
              label="Discount (%)"
              type="number"
              value={form.discount}
              onChange={handleFormChange}
              placeholder="0"
              min="0"
              max="100"
            />
            <FormInput
              name="taxRate"
              label="Tax Rate (%)"
              type="number"
              value={form.taxRate}
              onChange={handleFormChange}
              placeholder="0"
              min="0"
              max="100"
            />
            <FormInput
              name="minimumStock"
              label="Min Stock Alert"
              type="number"
              value={form.minimumStock}
              onChange={handleFormChange}
              placeholder="0"
              min="0"
            />
            <FormInput
              name="maximumStock"
              label="Max Stock"
              type="number"
              value={form.maximumStock}
              onChange={handleFormChange}
              placeholder="0"
              min="0"
            />
            <FormInput
              name="currentStock"
              label="Initial Stock"
              type="number"
              value={form.currentStock}
              onChange={handleFormChange}
              placeholder="0"
              min="0"
            />
            <FormInput
              name="supplier"
              label="Supplier"
              value={form.supplier}
              onChange={handleFormChange}
              placeholder="Supplier name"
            />
            <FormSelect
              name="status"
              label="Status"
              value={form.status}
              onChange={handleFormChange}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" type="button" onClick={() => { setShowAddModal(false); resetForm(); }}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingProduct ? 'Update' : 'Add'} Product
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onConfirm={handleDelete}
        onCancel={() => { setShowDeleteConfirm(false); setDeletingProduct(null); }}
        title="Delete Product?"
        message={`Are you sure you want to delete "${deletingProduct?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}

export default Products;