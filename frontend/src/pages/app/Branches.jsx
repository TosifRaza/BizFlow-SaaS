// import { useState, useEffect, useCallback } from 'react';
// import toast from 'react-hot-toast';
// import {
//   HiOutlinePlus,
//   HiOutlinePencil,
//   HiOutlineTrash,
// } from 'react-icons/hi2';

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
// import { businessApi } from '../../api/businessApi';
// import { formatDate, INDIAN_STATES } from '../../utils/helpers';

// const emptyForm = {
//   name: '', address: '', city: '', state: '', pincode: '',
//   phone: '', email: '', isMain: false,
// };

// function Branches() {
//   const [branches, setBranches] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [isEdit, setIsEdit] = useState(false);
//   const [selectedBranch, setSelectedBranch] = useState(null);
//   const [form, setForm] = useState({ ...emptyForm });
//   const [submitting, setSubmitting] = useState(false);

//   const fetchBranches = useCallback(async () => {
//     setLoading(true);
//     try {
//       const { data } = await businessApi.getBusiness();
//       const biz = data?.data ?? data ?? {};
//       setBranches(biz.branches || []);
//     } catch {
//       // If no branches endpoint, try alternative
//       try {
//         const { data } = await businessApi.getStats();
//         setBranches(data?.data?.branches ?? data?.branches ?? []);
//       } catch {
//         setBranches([]);
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchBranches();
//   }, [fetchBranches]);

//   const openAddModal = () => {
//     setIsEdit(false);
//     setSelectedBranch(null);
//     setForm({ ...emptyForm });
//     setShowModal(true);
//   };

//   const openEditModal = (branch) => {
//     setSelectedBranch(branch);
//     setIsEdit(true);
//     setForm({
//       name: branch.name || '',
//       address: branch.address || '',
//       city: branch.city || '',
//       state: branch.state || '',
//       pincode: branch.pincode || '',
//       phone: branch.phone || '',
//       email: branch.email || '',
//       isMain: branch.isMain || false,
//     });
//     setShowModal(true);
//   };

//   const openDeleteConfirm = (branch) => {
//     setSelectedBranch(branch);
//     setShowConfirm(true);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.name.trim() || !form.city.trim()) {
//       toast.error('Name and city are required');
//       return;
//     }
//     setSubmitting(true);
//     try {
//       const payload = {
//         ...form,
//         state: form.state || undefined,
//         pincode: form.pincode || undefined,
//         phone: form.phone || undefined,
//         email: form.email || undefined,
//       };

//       if (isEdit && selectedBranch) {
//         // Update branch - update business with updated branches array
//         const updated = branches.map((b) =>
//           b.id === selectedBranch.id ? { ...b, ...payload } : b
//         );
//         await businessApi.updateBusiness({ branches: updated });
//         toast.success('Branch updated successfully');
//       } else {
//         // Add new branch
//         const newBranch = { ...payload, id: Date.now() };
//         await businessApi.updateBusiness({ branches: [...branches, newBranch] });
//         toast.success('Branch added successfully');
//       }
//       setShowModal(false);
//       fetchBranches();
//     } catch (err) {
//       toast.error(err?.response?.data?.message || 'Failed to save branch');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!selectedBranch) return;
//     try {
//       const remaining = branches.filter((b) => b.id !== selectedBranch.id);
//       await businessApi.updateBusiness({ branches: remaining });
//       toast.success('Branch deleted successfully');
//       setShowConfirm(false);
//       fetchBranches();
//     } catch (err) {
//       toast.error(err?.response?.data?.message || 'Failed to delete branch');
//     }
//   };

//   const columns = [
//     { key: 'name', label: 'Name', render: (val) => <span className="font-medium text-gray-900">{val}</span> },
//     { key: 'address', label: 'Address', render: (val) => val || '-' },
//     { key: 'city', label: 'City', render: (val) => val || '-' },
//     {
//       key: 'isMain',
//       label: 'Is Main',
//       render: (val) => val
//         ? <Badge variant="info">Main</Badge>
//         : <Badge variant="gray">Branch</Badge>,
//     },
//     {
//       key: 'status',
//       label: 'Status',
//       render: (val) => {
//         const status = val || 'active';
//         return <Badge variant={status === 'active' ? 'success' : 'gray'}>{status}</Badge>;
//       },
//     },
//   ];

//   const actions = (row) => (
//     <div className="flex items-center gap-1">
//       <Button variant="ghost" size="sm" onClick={() => openEditModal(row)} title="Edit">
//         <HiOutlinePencil className="w-4 h-4" />
//       </Button>
//       {!row.isMain && (
//         <Button variant="ghost" size="sm" onClick={() => openDeleteConfirm(row)} title="Delete">
//           <HiOutlineTrash className="w-4 h-4 text-red-500" />
//         </Button>
//       )}
//     </div>
//   );

//   return (
//     <div>
//       <PageHeader
//         title="Branches"
//         subtitle="Manage your business locations"
//         actions={[
//           { label: 'Add Branch', icon: HiOutlinePlus, onClick: openAddModal },
//         ]}
//       />

//       {loading ? (
//         <LoadingSpinner type="table" />
//       ) : branches.length === 0 ? (
//         <EmptyState
//           title="No branches yet"
//           description="Add branches to manage multiple locations."
//           actionLabel="Add Branch"
//           onAction={openAddModal}
//         />
//       ) : (
//         <DataTable
//           columns={columns}
//           data={loading ? [] : branches}
//           loading={loading}
//           actions={actions}
//         />
//       )}

//       {/* Add/Edit Modal */}
//       <Modal
//         isOpen={showModal}
//         onClose={() => setShowModal(false)}
//         title={isEdit ? 'Edit Branch' : 'Add Branch'}
//         size="lg"
//       >
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <FormInput
//               name="name"
//               label="Branch Name"
//               value={form.name}
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//               required
//               placeholder="e.g. Downtown Store"
//             />
//             <FormInput
//               name="city"
//               label="City"
//               value={form.city}
//               onChange={(e) => setForm({ ...form, city: e.target.value })}
//               required
//               placeholder="City name"
//             />
//             <FormInput
//               name="address"
//               label="Address"
//               value={form.address}
//               onChange={(e) => setForm({ ...form, address: e.target.value })}
//               placeholder="Street address"
//               className="sm:col-span-2"
//             />
//             <FormSelect
//               name="state"
//               label="State"
//               value={form.state}
//               onChange={(e) => setForm({ ...form, state: e.target.value })}
//               options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
//               placeholder="Select state"
//             />
//             <FormInput
//               name="pincode"
//               label="Pincode"
//               value={form.pincode}
//               onChange={(e) => setForm({ ...form, pincode: e.target.value })}
//               placeholder="123456"
//             />
//             <FormInput
//               name="phone"
//               label="Phone"
//               value={form.phone}
//               onChange={(e) => setForm({ ...form, phone: e.target.value })}
//               placeholder="9876543210"
//             />
//             <FormInput
//               name="email"
//               label="Email"
//               type="email"
//               value={form.email}
//               onChange={(e) => setForm({ ...form, email: e.target.value })}
//               placeholder="branch@email.com"
//             />
//           </div>

//           {/* Is Main checkbox */}
//           <div className="flex items-center gap-3 pt-2">
//             <label className="relative inline-flex items-center cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={form.isMain}
//                 onChange={(e) => setForm({ ...form, isMain: e.target.checked })}
//                 className="sr-only peer"
//               />
//               <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
//             </label>
//             <span className="text-sm font-medium text-gray-700">Set as main branch</span>
//           </div>

//           <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
//             <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
//             <Button type="submit" loading={submitting}>
//               {isEdit ? 'Save Changes' : 'Add Branch'}
//             </Button>
//           </div>
//         </form>
//       </Modal>

//       {/* Delete Confirm */}
//       <ConfirmDialog
//         isOpen={showConfirm}
//         onCancel={() => setShowConfirm(false)}
//         onConfirm={handleDelete}
//         title="Delete Branch?"
//         message={`Are you sure you want to delete "${selectedBranch?.name}"? This cannot be undone.`}
//         confirmText="Delete"
//         variant="danger"
//       />
//     </div>
//   );
// }

// export default Branches;
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
} from 'react-icons/hi2';

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
import { businessApi } from '../../api/businessApi';
import { formatDate, INDIAN_STATES } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

const emptyForm = {
  name: '', address: '', city: '', state: '', pincode: '',
  phone: '', email: '', isMain: false,
};

function Branches() {
  const { hasPermission } = useAuth();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await businessApi.getBusiness();
      const biz = data?.data ?? data ?? {};
      setBranches(biz.branches || []);
    } catch {
      // If no branches endpoint, try alternative
      try {
        const { data } = await businessApi.getStats();
        setBranches(data?.data?.branches ?? data?.branches ?? []);
      } catch {
        setBranches([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const openAddModal = () => {
    setIsEdit(false);
    setSelectedBranch(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEditModal = (branch) => {
    setSelectedBranch(branch);
    setIsEdit(true);
    setForm({
      name: branch.name || '',
      address: branch.address || '',
      city: branch.city || '',
      state: branch.state || '',
      pincode: branch.pincode || '',
      phone: branch.phone || '',
      email: branch.email || '',
      isMain: branch.isMain || false,
    });
    setShowModal(true);
  };

  const openDeleteConfirm = (branch) => {
    setSelectedBranch(branch);
    setShowConfirm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.city.trim()) {
      toast.error('Name and city are required');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        state: form.state || undefined,
        pincode: form.pincode || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
      };

      if (isEdit && selectedBranch) {
        // Update branch - update business with updated branches array
        const updated = branches.map((b) =>
          b.id === selectedBranch.id ? { ...b, ...payload } : b
        );
        await businessApi.updateBusiness({ branches: updated });
        toast.success('Branch updated successfully');
      } else {
        // Add new branch
        const newBranch = { ...payload, id: Date.now() };
        await businessApi.updateBusiness({ branches: [...branches, newBranch] });
        toast.success('Branch added successfully');
      }
      setShowModal(false);
      fetchBranches();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save branch');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBranch) return;
    try {
      const remaining = branches.filter((b) => b.id !== selectedBranch.id);
      await businessApi.updateBusiness({ branches: remaining });
      toast.success('Branch deleted successfully');
      setShowConfirm(false);
      fetchBranches();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete branch');
    }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (val) => <span className="font-medium text-gray-900">{val}</span> },
    { key: 'address', label: 'Address', render: (val) => val || '-' },
    { key: 'city', label: 'City', render: (val) => val || '-' },
    {
      key: 'isMain',
      label: 'Is Main',
      render: (val) => val
        ? <Badge variant="info">Main</Badge>
        : <Badge variant="gray">Branch</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => {
        const status = val || 'active';
        return <Badge variant={status === 'active' ? 'success' : 'gray'}>{status}</Badge>;
      },
    },
  ];

  const actions = (row) => (
    <div className="flex items-center gap-1">
      {hasPermission('branches.update') && (
      <Button variant="ghost" size="sm" onClick={() => openEditModal(row)} title="Edit">
        <HiOutlinePencil className="w-4 h-4" />
      </Button>
      )}
      {!row.isMain && hasPermission('branches.delete') && (
        <Button variant="ghost" size="sm" onClick={() => openDeleteConfirm(row)} title="Delete">
          <HiOutlineTrash className="w-4 h-4 text-red-500" />
        </Button>
      )}
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Branches"
        subtitle="Manage your business locations"
        actions={hasPermission('branches.create') ? [
          { label: 'Add Branch', icon: HiOutlinePlus, onClick: openAddModal },
        ] : []}
      />

      {loading ? (
        <LoadingSpinner type="table" />
      ) : branches.length === 0 ? (
        <EmptyState
          title="No branches yet"
          description="Add branches to manage multiple locations."
          actionLabel={hasPermission('branches.create') ? 'Add Branch' : undefined}
          onAction={hasPermission('branches.create') ? openAddModal : undefined}
        />
      ) : (
        <DataTable
          columns={columns}
          data={loading ? [] : branches}
          loading={loading}
          actions={actions}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEdit ? 'Edit Branch' : 'Add Branch'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              name="name"
              label="Branch Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="e.g. Downtown Store"
            />
            <FormInput
              name="city"
              label="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              required
              placeholder="City name"
            />
            <FormInput
              name="address"
              label="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Street address"
              className="sm:col-span-2"
            />
            <FormSelect
              name="state"
              label="State"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
              placeholder="Select state"
            />
            <FormInput
              name="pincode"
              label="Pincode"
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              placeholder="123456"
            />
            <FormInput
              name="phone"
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="9876543210"
            />
            <FormInput
              name="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="branch@email.com"
            />
          </div>

          {/* Is Main checkbox */}
          <div className="flex items-center gap-3 pt-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.isMain}
                onChange={(e) => setForm({ ...form, isMain: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span className="text-sm font-medium text-gray-700">Set as main branch</span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>
              {isEdit ? 'Save Changes' : 'Add Branch'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={showConfirm}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Branch?"
        message={`Are you sure you want to delete "${selectedBranch?.name}"? This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

export default Branches;
