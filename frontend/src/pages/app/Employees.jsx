// // // export default Employees;
// // import { useState, useEffect, useCallback } from 'react';
// // import toast from 'react-hot-toast';
// // import {
// //   HiOutlinePlus,
// //   HiOutlinePencil,
// //   HiOutlineUserGroup,
// //   HiOutlineCheckCircle,
// //   HiOutlineXCircle,
// // } from 'react-icons/hi2';

// // import PageHeader from '../../components/PageHeader';
// // import StatCard from '../../components/StatCard';
// // import DataTable from '../../components/DataTable';
// // import Modal from '../../components/Modal';
// // import FormInput from '../../components/FormInput';
// // import FormSelect from '../../components/FormSelect';
// // import Button from '../../components/Button';
// // import Badge from '../../components/Badge';
// // import EmptyState from '../../components/EmptyState';
// // import LoadingSpinner from '../../components/LoadingSpinner';
// // import ConfirmDialog from '../../components/ConfirmDialog';
// // import { employeeApi } from '../../api/employeeApi';
// // import { formatCurrency, formatDate } from '../../utils/helpers';

// // const ROLE_OPTIONS = [
// //   { value: 'manager', label: 'Manager' },
// //   { value: 'staff', label: 'Staff' },
// // ];

// // const emptyForm = {
// //   name: '',
// //   email: '',
// //   phone: '',
// //   role: 'staff',
// //   salary: '',
// //   joiningDate: '',
// // };

// // function Employees() {
// //   const [employees, setEmployees] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
// //   const [search, setSearch] = useState('');

// //   // Stats
// //   const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

// //   // Modals
// //   const [showAddModal, setShowAddModal] = useState(false);
// //   const [showEditModal, setShowEditModal] = useState(false);
// //   const [showConfirmModal, setShowConfirmModal] = useState(false);
// //   const [selectedEmployee, setSelectedEmployee] = useState(null);
// //   const [form, setForm] = useState({ ...emptyForm });
// //   const [submitting, setSubmitting] = useState(false);
// //   const [confirmAction, setConfirmAction] = useState(null);

// //   const fetchEmployees = useCallback(async () => {
// //     setLoading(true);
// //     try {
// //       const { data } = await employeeApi.getAll({ page: pagination.page, limit: pagination.limit, search });
// //       const list = data?.data ?? data?.employees ?? [];
// //       setEmployees(list);
// //       setPagination((prev) => ({
// //         ...prev,
// //         total: data?.total ?? data?.pagination?.total ?? 0,
// //       }));

// //       // Calculate stats from the list or use provided stats
// //       const total = list.length || 0;
// //       const active = list.filter((e) => e.status === 'active').length;
// //       const inactive = list.filter((e) => e.status !== 'active').length;
// //       if (data?.stats) {
// //         setStats(data.stats);
// //       } else {
// //         setStats((prev) => ({
// //           ...prev,
// //           total: data?.total ?? prev.total,
// //           active: prev.total > 0 ? prev.active : active,
// //           inactive: prev.total > 0 ? prev.inactive : inactive,
// //         }));
// //       }
// //     } catch {
// //       toast.error('Failed to load employees');
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, [pagination.page, pagination.limit, search]);

// //   useEffect(() => {
// //     fetchEmployees();
// //   }, [fetchEmployees]);

// //   // Also fetch all to get accurate stats
// //   useEffect(() => {
// //     const fetchStats = async () => {
// //       try {
// //         const { data } = await employeeApi.getAll({ limit: 9999 });
// //         const list = data?.data ?? data?.employees ?? [];
// //         setStats({
// //           total: list.length,
// //           active: list.filter((e) => e.status === 'active').length,
// //           inactive: list.filter((e) => e.status !== 'active').length,
// //         });
// //       } catch {
// //         // Use table stats
// //       }
// //     };
// //     fetchStats();
// //   }, []);

// //   const handleSearch = useCallback((val) => {
// //     setSearch(val);
// //     setPagination((prev) => ({ ...prev, page: 1 }));
// //   }, []);

// //   const handlePageChange = useCallback((newPage) => {
// //     setPagination((prev) => ({ ...prev, page: newPage }));
// //   }, []);

// //   const openAddModal = () => {
// //     setForm({ ...emptyForm });
// //     setShowAddModal(true);
// //   };

// //   const openEditModal = (employee) => {
// //     setSelectedEmployee(employee);
// //     setForm({
// //       name: employee.name || '',
// //       email: employee.email || '',
// //       phone: employee.phone || '',
// //       role: employee.role || 'staff',
// //       salary: employee.salary ?? '',
// //       joiningDate: employee.joiningDate ? employee.joiningDate.split('T')[0] : '',
// //     });
// //     setShowEditModal(true);
// //   };

// //   const handleAdd = async (e) => {
// //     e.preventDefault();
// //     if (!form.name || !form.email) {
// //       toast.error('Name and email are required');
// //       return;
// //     }
// //     setSubmitting(true);
// //     try {
// //       const payload = {
// //         ...form,
// //         salary: form.salary ? Number(form.salary) : undefined,
// //       };
// //       await employeeApi.create(payload);
// //       toast.success('Employee added successfully');
// //       setShowAddModal(false);
// //       fetchEmployees();
// //     } catch (err) {
// //       toast.error(err?.response?.data?.message || 'Failed to add employee');
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   };

// //   const handleEdit = async (e) => {
// //     e.preventDefault();
// //     if (!form.name || !form.email) {
// //       toast.error('Name and email are required');
// //       return;
// //     }
// //     setSubmitting(true);
// //     try {
// //       const payload = {
// //         ...form,
// //         salary: form.salary ? Number(form.salary) : undefined,
// //       };
// //       await employeeApi.update(selectedEmployee.id, payload);
// //       toast.success('Employee updated successfully');
// //       setShowEditModal(false);
// //       fetchEmployees();
// //     } catch (err) {
// //       toast.error(err?.response?.data?.message || 'Failed to update employee');
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   };

// //   const openConfirmAction = (employee, action) => {
// //     setSelectedEmployee(employee);
// //     setConfirmAction(action);
// //     setShowConfirmModal(true);
// //   };

// //   const handleConfirmAction = async () => {
// //     if (!selectedEmployee) return;
// //     try {
// //       if (confirmAction === 'deactivate') {
// //         await employeeApi.deactivate(selectedEmployee.id);
// //         toast.success('Employee deactivated');
// //       } else if (confirmAction === 'activate') {
// //         await employeeApi.update(selectedEmployee.id, { status: 'active' });
// //         toast.success('Employee activated');
// //       }
// //       setShowConfirmModal(false);
// //       fetchEmployees();
// //     } catch (err) {
// //       toast.error(err?.response?.data?.message || 'Failed to update employee status');
// //     }
// //   };

// //   const columns = [
// //     { key: 'name', label: 'Name', render: (val, row) => (
// //       <div className="flex items-center gap-3">
// //         <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
// //           {val?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
// //         </div>
// //         <span className="font-medium text-gray-900">{val}</span>
// //       </div>
// //     )},
// //     { key: 'email', label: 'Email' },
// //     { key: 'phone', label: 'Phone' },
// //     { key: 'role', label: 'Role', render: (val) => <Badge variant={val === 'manager' ? 'info' : 'gray'}>{val ? val.charAt(0).toUpperCase() + val.slice(1) : 'Staff'}</Badge> },
// //     { key: 'salary', label: 'Salary', render: (val) => val != null ? formatCurrency(val) : '-' },
// //     { key: 'joiningDate', label: 'Joining Date', render: (val) => formatDate(val) },
// //     { key: 'status', label: 'Status', render: (val) => (
// //       <Badge variant={val === 'active' ? 'success' : 'gray'}>
// //         {val === 'active' ? 'Active' : 'Inactive'}
// //       </Badge>
// //     )},
// //   ];

// //   const actions = (row) => (
// //     <div className="flex items-center gap-1">
// //       <Button variant="ghost" size="sm" onClick={() => openEditModal(row)} title="Edit">
// //         <HiOutlinePencil className="w-4 h-4" />
// //       </Button>
// //       {row.status === 'active' ? (
// //         <Button variant="ghost" size="sm" onClick={() => openConfirmAction(row, 'deactivate')} title="Deactivate">
// //           <HiOutlineXCircle className="w-4 h-4 text-red-500" />
// //         </Button>
// //       ) : (
// //         <Button variant="ghost" size="sm" onClick={() => openConfirmAction(row, 'activate')} title="Activate">
// //           <HiOutlineCheckCircle className="w-4 h-4 text-green-500" />
// //         </Button>
// //       )}
// //     </div>
// //   );

// //   const formFields = (
// //     <div className="space-y-4">
// //       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
// //         <FormInput
// //           name="name"
// //           label="Full Name"
// //           value={form.name}
// //           onChange={(e) => setForm({ ...form, name: e.target.value })}
// //           required
// //           placeholder="Enter employee name"
// //         />
// //         <FormInput
// //           name="email"
// //           label="Email"
// //           type="email"
// //           value={form.email}
// //           onChange={(e) => setForm({ ...form, email: e.target.value })}
// //           required
// //           placeholder="employee@company.com"
// //         />
// //         <FormInput
// //           name="phone"
// //           label="Phone"
// //           value={form.phone}
// //           onChange={(e) => setForm({ ...form, phone: e.target.value })}
// //           placeholder="9876543210"
// //         />
// //         <FormSelect
// //           name="role"
// //           label="Role"
// //           value={form.role}
// //           onChange={(e) => setForm({ ...form, role: e.target.value })}
// //           options={ROLE_OPTIONS}
// //         />
// //         <FormInput
// //           name="salary"
// //           label="Salary"
// //           type="number"
// //           value={form.salary}
// //           onChange={(e) => setForm({ ...form, salary: e.target.value })}
// //           min="0"
// //           placeholder="Monthly salary"
// //         />
// //         <FormInput
// //           name="joiningDate"
// //           label="Joining Date"
// //           type="date"
// //           value={form.joiningDate}
// //           onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
// //         />
// //       </div>
// //     </div>
// //   );

// //   return (
// //     <div>
// //       <PageHeader
// //         title="Employees"
// //         subtitle="Manage your team members"
// //         actions={[
// //           { label: 'Add Employee', icon: HiOutlinePlus, onClick: openAddModal },
// //         ]}
// //       />

// //       {/* Stats */}
// //       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
// //         <StatCard title="Total Employees" value={stats.total} icon={HiOutlineUserGroup} color="blue" />
// //         <StatCard title="Active" value={stats.active} icon={HiOutlineCheckCircle} color="green" />
// //         <StatCard title="Inactive" value={stats.inactive} icon={HiOutlineXCircle} color="red" />
// //       </div>

// //       {/* Data Table */}
// //       {loading ? (
// //         <LoadingSpinner type="table" />
// //       ) : employees.length === 0 ? (
// //         <EmptyState
// //           title="No employees yet"
// //           description="Add team members to manage roles and access."
// //           actionLabel="Add Employee"
// //           onAction={openAddModal}
// //         />
// //       ) : (
// //         <DataTable
// //           columns={columns}
// //           data={loading ? [] : employees}
// //           loading={loading}
// //           onSearch={handleSearch}
// //           searchPlaceholder="Search employees..."
// //           actions={actions}
// //           pagination={{
// //             page: pagination.page,
// //             limit: pagination.limit,
// //             total: pagination.total,
// //             onPageChange: handlePageChange,
// //           }}
// //         />
// //       )}

// //       {/* Add Employee Modal */}
// //       <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Employee" size="lg">
// //         <form onSubmit={handleAdd}>
// //           {formFields}
// //           <div className="flex justify-end gap-3 pt-6">
// //             <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
// //             <Button type="submit" loading={submitting}>Add Employee</Button>
// //           </div>
// //         </form>
// //       </Modal>

// //       {/* Edit Employee Modal */}
// //       <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Employee" size="lg">
// //         <form onSubmit={handleEdit}>
// //           {formFields}
// //           <div className="flex justify-end gap-3 pt-6">
// //             <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
// //             <Button type="submit" loading={submitting}>Save Changes</Button>
// //           </div>
// //         </form>
// //       </Modal>

// //       {/* Confirm Dialog */}
// //       <ConfirmDialog
// //         isOpen={showConfirmModal}
// //         onCancel={() => setShowConfirmModal(false)}
// //         onConfirm={handleConfirmAction}
// //         title={confirmAction === 'deactivate' ? 'Deactivate Employee?' : 'Activate Employee?'}
// //         message={
// //           confirmAction === 'deactivate'
// //             ? `${selectedEmployee?.name} will be deactivated and lose access to the system.`
// //             : `${selectedEmployee?.name} will be re-activated with full access.`
// //         }
// //         confirmText={confirmAction === 'deactivate' ? 'Deactivate' : 'Activate'}
// //         variant={confirmAction === 'deactivate' ? 'warning' : 'info'}
// //       />
// //     </div>
// //   );
// // }

// // export default Employees;
// import { useState, useEffect, useCallback } from 'react';
// import toast from 'react-hot-toast';
// import {
//   HiOutlinePlus,
//   HiOutlinePencil,
//   HiOutlineUserGroup,
//   HiOutlineCheckCircle,
//   HiOutlineXCircle,
//   HiOutlineKey,
// } from 'react-icons/hi2';

// import PageHeader from '../../components/PageHeader';
// import StatCard from '../../components/StatCard';
// import DataTable from '../../components/DataTable';
// import Modal from '../../components/Modal';
// import FormInput from '../../components/FormInput';
// import FormSelect from '../../components/FormSelect';
// import Button from '../../components/Button';
// import Badge from '../../components/Badge';
// import EmptyState from '../../components/EmptyState';
// import LoadingSpinner from '../../components/LoadingSpinner';
// import ConfirmDialog from '../../components/ConfirmDialog';
// import { employeeApi } from '../../api/employeeApi';
// import { formatCurrency, formatDate } from '../../utils/helpers';

// const ROLE_OPTIONS = [
//   { value: 'manager', label: 'Manager' },
//   { value: 'staff', label: 'Staff' },
// ];

// const emptyForm = {
//   name: '',
//   email: '',
//   phone: '',
//   role: 'staff',
//   password: '',
//   salary: '',
//   joiningDate: '',
// };

// function Employees() {
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
//   const [search, setSearch] = useState('');

//   // Stats
//   const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

//   // Modals
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showConfirmModal, setShowConfirmModal] = useState(false);
//   const [showResetModal, setShowResetModal] = useState(false);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [form, setForm] = useState({ ...emptyForm });
//   const [submitting, setSubmitting] = useState(false);
//   const [confirmAction, setConfirmAction] = useState(null);
//   const [resetPassword, setResetPassword] = useState('');
//   const [resetting, setResetting] = useState(false);

//   const fetchEmployees = useCallback(async () => {
//     setLoading(true);
//     try {
//       const { data } = await employeeApi.getAll({ page: pagination.page, limit: pagination.limit, search });
//       const list = data?.data ?? data?.employees ?? [];
//       setEmployees(list);
//       setPagination((prev) => ({
//         ...prev,
//         total: data?.total ?? data?.pagination?.total ?? 0,
//       }));

//       const total = list.length || 0;
//       const active = list.filter((e) => e.status === 'active').length;
//       const inactive = list.filter((e) => e.status !== 'active').length;
//       if (data?.stats) {
//         setStats(data.stats);
//       } else {
//         setStats((prev) => ({
//           ...prev,
//           total: data?.total ?? prev.total,
//           active: prev.total > 0 ? prev.active : active,
//           inactive: prev.total > 0 ? prev.inactive : inactive,
//         }));
//       }
//     } catch {
//       toast.error('Failed to load employees');
//     } finally {
//       setLoading(false);
//     }
//   }, [pagination.page, pagination.limit, search]);

//   useEffect(() => {
//     fetchEmployees();
//   }, [fetchEmployees]);

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const { data } = await employeeApi.getAll({ limit: 9999 });
//         const list = data?.data ?? data?.employees ?? [];
//         setStats({
//           total: list.length,
//           active: list.filter((e) => e.status === 'active').length,
//           inactive: list.filter((e) => e.status !== 'active').length,
//         });
//       } catch {
//         // Use table stats
//       }
//     };
//     fetchStats();
//   }, []);

//   const handleSearch = useCallback((val) => {
//     setSearch(val);
//     setPagination((prev) => ({ ...prev, page: 1 }));
//   }, []);

//   const handlePageChange = useCallback((newPage) => {
//     setPagination((prev) => ({ ...prev, page: newPage }));
//   }, []);

//   const openAddModal = () => {
//     setForm({ ...emptyForm });
//     setShowAddModal(true);
//   };

//   const openEditModal = (employee) => {
//     setSelectedEmployee(employee);
//     setForm({
//       name: employee.name || '',
//       email: employee.email || '',
//       phone: employee.phone || '',
//       role: employee.role || 'staff',
//       password: '',
//       salary: employee.salary ?? '',
//       joiningDate: employee.joiningDate ? employee.joiningDate.split('T')[0] : '',
//     });
//     setShowEditModal(true);
//   };

//   const openResetModal = (employee) => {
//     setSelectedEmployee(employee);
//     setResetPassword('');
//     setShowResetModal(true);
//   };

//   const handleAdd = async (e) => {
//     e.preventDefault();
//     if (!form.name || !form.email) {
//       toast.error('Name and email are required');
//       return;
//     }
//     if (!form.password || form.password.length < 6) {
//       toast.error('Password is required (min 6 characters)');
//       return;
//     }
//     setSubmitting(true);
//     try {
//       const payload = {
//         ...form,
//         salary: form.salary ? Number(form.salary) : undefined,
//       };
//       await employeeApi.create(payload);
//       toast.success('Employee added successfully');
//       setShowAddModal(false);
//       fetchEmployees();
//     } catch (err) {
//       toast.error(err?.response?.data?.message || 'Failed to add employee');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleEdit = async (e) => {
//     e.preventDefault();
//     if (!form.name || !form.email) {
//       toast.error('Name and email are required');
//       return;
//     }
//     setSubmitting(true);
//     try {
//       const payload = {
//         name: form.name,
//         email: form.email,
//         phone: form.phone,
//         role: form.role,
//         salary: form.salary ? Number(form.salary) : undefined,
//         joiningDate: form.joiningDate || undefined,
//       };
//       await employeeApi.update(selectedEmployee.id, payload);
//       toast.success('Employee updated successfully');
//       setShowEditModal(false);
//       fetchEmployees();
//     } catch (err) {
//       toast.error(err?.response?.data?.message || 'Failed to update employee');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleResetPassword = async (e) => {
//     e.preventDefault();
//     if (!resetPassword || resetPassword.length < 6) {
//       toast.error('Password must be at least 6 characters');
//       return;
//     }
//     setResetting(true);
//     try {
//       await employeeApi.resetPassword(selectedEmployee.id, resetPassword);
//       toast.success('Password reset successfully');
//       setShowResetModal(false);
//     } catch (err) {
//       toast.error(err?.response?.data?.message || 'Failed to reset password');
//     } finally {
//       setResetting(false);
//     }
//   };

//   const openConfirmAction = (employee, action) => {
//     setSelectedEmployee(employee);
//     setConfirmAction(action);
//     setShowConfirmModal(true);
//   };

//   const handleConfirmAction = async () => {
//     if (!selectedEmployee) return;
//     try {
//       if (confirmAction === 'deactivate') {
//         await employeeApi.deactivate(selectedEmployee.id);
//         toast.success('Employee deactivated');
//       } else if (confirmAction === 'activate') {
//         await employeeApi.update(selectedEmployee.id, { status: 'active' });
//         toast.success('Employee activated');
//       }
//       setShowConfirmModal(false);
//       fetchEmployees();
//     } catch (err) {
//       toast.error(err?.response?.data?.message || 'Failed to update employee status');
//     }
//   };

//   const columns = [
//     { key: 'name', label: 'Name', render: (val) => (
//       <div className="flex items-center gap-3">
//         <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
//           {val?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
//         </div>
//         <span className="font-medium text-gray-900">{val}</span>
//       </div>
//     )},
//     { key: 'email', label: 'Email' },
//     { key: 'phone', label: 'Phone' },
//     { key: 'role', label: 'Role', render: (val) => <Badge variant={val === 'manager' ? 'info' : 'gray'}>{val ? val.charAt(0).toUpperCase() + val.slice(1) : 'Staff'}</Badge> },
//     { key: 'salary', label: 'Salary', render: (val) => val != null ? formatCurrency(val) : '-' },
//     { key: 'joiningDate', label: 'Joining Date', render: (val) => formatDate(val) },
//     { key: 'status', label: 'Status', render: (val) => (
//       <Badge variant={val === 'active' ? 'success' : 'gray'}>
//         {val === 'active' ? 'Active' : 'Inactive'}
//       </Badge>
//     )},
//   ];

//   const actions = (row) => (
//     <div className="flex items-center gap-1">
//       <Button variant="ghost" size="sm" onClick={() => openEditModal(row)} title="Edit">
//         <HiOutlinePencil className="w-4 h-4" />
//       </Button>
//       <Button variant="ghost" size="sm" onClick={() => openResetModal(row)} title="Reset Password">
//         <HiOutlineKey className="w-4 h-4 text-amber-500" />
//       </Button>
//       {row.status === 'active' ? (
//         <Button variant="ghost" size="sm" onClick={() => openConfirmAction(row, 'deactivate')} title="Deactivate">
//           <HiOutlineXCircle className="w-4 h-4 text-red-500" />
//         </Button>
//       ) : (
//         <Button variant="ghost" size="sm" onClick={() => openConfirmAction(row, 'activate')} title="Activate">
//           <HiOutlineCheckCircle className="w-4 h-4 text-green-500" />
//         </Button>
//       )}
//     </div>
//   );

//   return (
//     <div>
//       <PageHeader
//         title="Employees"
//         subtitle="Manage your team members"
//         actions={[
//           { label: 'Add Employee', icon: HiOutlinePlus, onClick: openAddModal },
//         ]}
//       />

//       {/* Stats */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
//         <StatCard title="Total Employees" value={stats.total} icon={HiOutlineUserGroup} color="blue" />
//         <StatCard title="Active" value={stats.active} icon={HiOutlineCheckCircle} color="green" />
//         <StatCard title="Inactive" value={stats.inactive} icon={HiOutlineXCircle} color="red" />
//       </div>

//       {/* Data Table */}
//       {loading ? (
//         <LoadingSpinner type="table" />
//       ) : employees.length === 0 ? (
//         <EmptyState
//           title="No employees yet"
//           description="Add team members to manage roles and access."
//           actionLabel="Add Employee"
//           onAction={openAddModal}
//         />
//       ) : (
//         <DataTable
//           columns={columns}
//           data={loading ? [] : employees}
//           loading={loading}
//           onSearch={handleSearch}
//           searchPlaceholder="Search employees..."
//           actions={actions}
//           pagination={{
//             page: pagination.page,
//             limit: pagination.limit,
//             total: pagination.total,
//             onPageChange: handlePageChange,
//           }}
//         />
//       )}

//       {/* Add Employee Modal */}
//       <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Employee" size="lg">
//         <form onSubmit={handleAdd}>
//           <div className="space-y-4">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <FormInput
//                 name="name"
//                 label="Full Name"
//                 value={form.name}
//                 onChange={(e) => setForm({ ...form, name: e.target.value })}
//                 required
//                 placeholder="Enter employee name"
//               />
//               <FormInput
//                 name="email"
//                 label="Email"
//                 type="email"
//                 value={form.email}
//                 onChange={(e) => setForm({ ...form, email: e.target.value })}
//                 required
//                 placeholder="employee@company.com"
//               />
//               <FormInput
//                 name="phone"
//                 label="Phone"
//                 value={form.phone}
//                 onChange={(e) => setForm({ ...form, phone: e.target.value })}
//                 placeholder="9876543210"
//               />
//               <FormSelect
//                 name="role"
//                 label="Role"
//                 value={form.role}
//                 onChange={(e) => setForm({ ...form, role: e.target.value })}
//                 options={ROLE_OPTIONS}
//               />
//               <FormInput
//                 name="password"
//                 label="Password"
//                 type="password"
//                 value={form.password}
//                 onChange={(e) => setForm({ ...form, password: e.target.value })}
//                 required
//                 placeholder="Min 6 characters"
//               />
//               <FormInput
//                 name="salary"
//                 label="Salary"
//                 type="number"
//                 value={form.salary}
//                 onChange={(e) => setForm({ ...form, salary: e.target.value })}
//                 min="0"
//                 placeholder="Monthly salary"
//               />
//               <FormInput
//                 name="joiningDate"
//                 label="Joining Date"
//                 type="date"
//                 value={form.joiningDate}
//                 onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
//               />
//             </div>
//           </div>
//           <div className="flex justify-end gap-3 pt-6">
//             <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
//             <Button type="submit" loading={submitting}>Add Employee</Button>
//           </div>
//         </form>
//       </Modal>

//       {/* Edit Employee Modal (no password field) */}
//       <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Employee" size="lg">
//         <form onSubmit={handleEdit}>
//           <div className="space-y-4">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <FormInput
//                 name="name"
//                 label="Full Name"
//                 value={form.name}
//                 onChange={(e) => setForm({ ...form, name: e.target.value })}
//                 required
//                 placeholder="Enter employee name"
//               />
//               <FormInput
//                 name="email"
//                 label="Email"
//                 type="email"
//                 value={form.email}
//                 onChange={(e) => setForm({ ...form, email: e.target.value })}
//                 required
//                 placeholder="employee@company.com"
//               />
//               <FormInput
//                 name="phone"
//                 label="Phone"
//                 value={form.phone}
//                 onChange={(e) => setForm({ ...form, phone: e.target.value })}
//                 placeholder="9876543210"
//               />
//               <FormSelect
//                 name="role"
//                 label="Role"
//                 value={form.role}
//                 onChange={(e) => setForm({ ...form, role: e.target.value })}
//                 options={ROLE_OPTIONS}
//               />
//               <FormInput
//                 name="salary"
//                 label="Salary"
//                 type="number"
//                 value={form.salary}
//                 onChange={(e) => setForm({ ...form, salary: e.target.value })}
//                 min="0"
//                 placeholder="Monthly salary"
//               />
//               <FormInput
//                 name="joiningDate"
//                 label="Joining Date"
//                 type="date"
//                 value={form.joiningDate}
//                 onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
//               />
//             </div>
//           </div>
//           <div className="flex justify-end gap-3 pt-6">
//             <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
//             <Button type="submit" loading={submitting}>Save Changes</Button>
//           </div>
//         </form>
//       </Modal>

//       {/* Reset Password Modal */}
//       <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)} title="Reset Password" size="md">
//         <form onSubmit={handleResetPassword}>
//           <div className="space-y-4">
//             <p className="text-sm text-gray-600">
//               Set a new password for <span className="font-semibold text-gray-900">{selectedEmployee?.name}</span>
//             </p>
//             <FormInput
//               name="newPassword"
//               label="New Password"
//               type="password"
//               value={resetPassword}
//               onChange={(e) => setResetPassword(e.target.value)}
//               required
//               placeholder="Enter new password (min 6 characters)"
//             />
//           </div>
//           <div className="flex justify-end gap-3 pt-6">
//             <Button type="button" variant="secondary" onClick={() => setShowResetModal(false)}>Cancel</Button>
//             <Button type="submit" loading={resetting}>Reset Password</Button>
//           </div>
//         </form>
//       </Modal>

//       {/* Confirm Dialog */}
//       <ConfirmDialog
//         isOpen={showConfirmModal}
//         onCancel={() => setShowConfirmModal(false)}
//         onConfirm={handleConfirmAction}
//         title={confirmAction === 'deactivate' ? 'Deactivate Employee?' : 'Activate Employee?'}
//         message={
//           confirmAction === 'deactivate'
//             ? `${selectedEmployee?.name} will be deactivated and lose access to the system.`
//             : `${selectedEmployee?.name} will be re-activated with full access.`
//         }
//         confirmText={confirmAction === 'deactivate' ? 'Deactivate' : 'Activate'}
//         variant={confirmAction === 'deactivate' ? 'warning' : 'info'}
//       />
//     </div>
//   );
// }

// export default Employees;
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineKey,
} from 'react-icons/hi2';

import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import FormSelect from '../../components/FormSelect';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import { employeeApi } from '../../api/employeeApi';
import { formatCurrency, formatDate } from '../../utils/helpers';

const ROLE_OPTIONS = [
  { value: 'manager', label: 'Manager' },
  { value: 'staff', label: 'Staff' },
];

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  role: 'staff',
  password: '',
  salary: '',
  joiningDate: '',
};

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [search, setSearch] = useState('');

  // Stats
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await employeeApi.getAll({ page: pagination.page, limit: pagination.limit, search });
      const list = data?.data ?? data?.employees ?? [];
      setEmployees(list);
      setPagination((prev) => ({
        ...prev,
        total: data?.total ?? data?.pagination?.total ?? 0,
      }));

      const total = list.length || 0;
      const active = list.filter((e) => e.status === 'active').length;
      const inactive = list.filter((e) => e.status !== 'active').length;
      if (data?.stats) {
        setStats(data.stats);
      } else {
        setStats((prev) => ({
          ...prev,
          total: data?.total ?? prev.total,
          active: prev.total > 0 ? prev.active : active,
          inactive: prev.total > 0 ? prev.inactive : inactive,
        }));
      }
    } catch {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await employeeApi.getAll({ limit: 9999 });
        const list = data?.data ?? data?.employees ?? [];
        setStats({
          total: list.length,
          active: list.filter((e) => e.status === 'active').length,
          inactive: list.filter((e) => e.status !== 'active').length,
        });
      } catch {
        // Use table stats
      }
    };
    fetchStats();
  }, []);

  const handleSearch = useCallback((val) => {
    setSearch(val);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  const openAddModal = () => {
    setForm({ ...emptyForm });
    setShowAddModal(true);
  };

  const openEditModal = (employee) => {
    setSelectedEmployee(employee);
    setForm({
      name: employee.name || '',
      email: employee.email || '',
      phone: employee.phone || '',
      role: employee.role || 'staff',
      password: '',
      salary: employee.salary ?? '',
      joiningDate: employee.joiningDate ? employee.joiningDate.split('T')[0] : '',
    });
    setShowEditModal(true);
  };

  const openResetModal = (employee) => {
    setSelectedEmployee(employee);
    setResetPassword('');
    setShowResetModal(true);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error('Name and email are required');
      return;
    }
    if (!form.password || form.password.length < 6) {
      toast.error('Password is required (min 6 characters)');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        salary: form.salary ? Number(form.salary) : undefined,
      };
      await employeeApi.create(payload);
      toast.success('Employee added successfully');
      setShowAddModal(false);
      fetchEmployees();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error('Name and email are required');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: form.role,
        salary: form.salary ? Number(form.salary) : undefined,
        joiningDate: form.joiningDate || undefined,
      };
      await employeeApi.update(selectedEmployee.id, payload);
      toast.success('Employee updated successfully');
      setShowEditModal(false);
      fetchEmployees();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetPassword || resetPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setResetting(true);
    try {
      await employeeApi.resetPassword(selectedEmployee.id, resetPassword);
      toast.success('Password reset successfully');
      setShowResetModal(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  const openConfirmAction = (employee, action) => {
    setSelectedEmployee(employee);
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedEmployee) return;
    try {
      if (confirmAction === 'deactivate') {
        await employeeApi.deactivate(selectedEmployee.id);
        toast.success('Employee deactivated');
      } else if (confirmAction === 'activate') {
        await employeeApi.update(selectedEmployee.id, { status: 'active' });
        toast.success('Employee activated');
      }
      setShowConfirmModal(false);
      fetchEmployees();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update employee status');
    }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (val) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
          {val?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <span className="font-medium text-gray-900">{val}</span>
      </div>
    )},
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'role', label: 'Role', render: (val) => <Badge variant={val === 'manager' ? 'info' : 'gray'}>{val ? val.charAt(0).toUpperCase() + val.slice(1) : 'Staff'}</Badge> },
    { key: 'salary', label: 'Salary', render: (val) => val != null ? formatCurrency(val) : '-' },
    { key: 'joiningDate', label: 'Joining Date', render: (val) => formatDate(val) },
    { key: 'status', label: 'Status', render: (val) => (
      <Badge variant={val === 'active' ? 'success' : 'gray'}>
        {val === 'active' ? 'Active' : 'Inactive'}
      </Badge>
    )},
  ];

  const actions = (row) => (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" onClick={() => openEditModal(row)} title="Edit">
        <HiOutlinePencil className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => openResetModal(row)} title="Reset Password">
        <HiOutlineKey className="w-4 h-4 text-amber-500" />
      </Button>
      {row.status === 'active' ? (
        <Button variant="ghost" size="sm" onClick={() => openConfirmAction(row, 'deactivate')} title="Deactivate">
          <HiOutlineXCircle className="w-4 h-4 text-red-500" />
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => openConfirmAction(row, 'activate')} title="Activate">
          <HiOutlineCheckCircle className="w-4 h-4 text-green-500" />
        </Button>
      )}
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle="Manage your team members"
        actions={[
          { label: 'Add Employee', icon: HiOutlinePlus, onClick: openAddModal },
        ]}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <StatCard title="Total Employees" value={stats.total} icon={HiOutlineUserGroup} color="blue" />
        <StatCard title="Active" value={stats.active} icon={HiOutlineCheckCircle} color="green" />
        <StatCard title="Inactive" value={stats.inactive} icon={HiOutlineXCircle} color="red" />
      </div>

      {/* Data Table */}
      {loading ? (
        <LoadingSpinner type="table" />
      ) : employees.length === 0 ? (
        <EmptyState
          title="No employees yet"
          description="Add team members to manage roles and access."
          actionLabel="Add Employee"
          onAction={openAddModal}
        />
      ) : (
        <DataTable
          columns={columns}
          data={loading ? [] : employees}
          loading={loading}
          onSearch={handleSearch}
          searchPlaceholder="Search employees..."
          actions={actions}
          pagination={{
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            onPageChange: handlePageChange,
          }}
        />
      )}

      {/* Add Employee Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Employee" size="lg">
        <form onSubmit={handleAdd}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                name="name"
                label="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Enter employee name"
              />
              <FormInput
                name="email"
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="employee@company.com"
              />
              <FormInput
                name="phone"
                label="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="9876543210"
              />
              <FormSelect
                name="role"
                label="Role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                options={ROLE_OPTIONS}
              />
              <FormInput
                name="password"
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                placeholder="Min 6 characters"
              />
              <FormInput
                name="salary"
                label="Salary"
                type="number"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                min="0"
                placeholder="Monthly salary"
              />
              <FormInput
                name="joiningDate"
                label="Joining Date"
                type="date"
                value={form.joiningDate}
                onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Add Employee</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal (no password field) */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Employee" size="lg">
        <form onSubmit={handleEdit}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                name="name"
                label="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Enter employee name"
              />
              <FormInput
                name="email"
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="employee@company.com"
              />
              <FormInput
                name="phone"
                label="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="9876543210"
              />
              <FormSelect
                name="role"
                label="Role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                options={ROLE_OPTIONS}
              />
              <FormInput
                name="salary"
                label="Salary"
                type="number"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                min="0"
                placeholder="Monthly salary"
              />
              <FormInput
                name="joiningDate"
                label="Joining Date"
                type="date"
                value={form.joiningDate}
                onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)} title="Reset Password" size="md">
        <form onSubmit={handleResetPassword}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Set a new password for <span className="font-semibold text-gray-900">{selectedEmployee?.name}</span>
            </p>
            <FormInput
              name="newPassword"
              label="New Password"
              type="password"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              required
              placeholder="Enter new password (min 6 characters)"
            />
          </div>
          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="secondary" onClick={() => setShowResetModal(false)}>Cancel</Button>
            <Button type="submit" loading={resetting}>Reset Password</Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmAction}
        title={confirmAction === 'deactivate' ? 'Deactivate Employee?' : 'Activate Employee?'}
        message={
          confirmAction === 'deactivate'
            ? `${selectedEmployee?.name} will be deactivated and lose access to the system.`
            : `${selectedEmployee?.name} will be re-activated with full access.`
        }
        confirmText={confirmAction === 'deactivate' ? 'Deactivate' : 'Activate'}
        variant={confirmAction === 'deactivate' ? 'warning' : 'info'}
      />
    </div>
  );
}

export default Employees;