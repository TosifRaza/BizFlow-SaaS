// import { useState, useEffect, useCallback } from 'react';
// import toast from 'react-hot-toast';
// import PageHeader from '../../components/PageHeader';
// import DataTable from '../../components/DataTable';
// import Badge from '../../components/Badge';
// import Button from '../../components/Button';
// import FormSelect from '../../components/FormSelect';
// import FormInput from '../../components/FormInput';
// import LoadingSpinner from '../../components/LoadingSpinner';
// import EmptyState from '../../components/EmptyState';
// import { adminApi } from '../../api/adminApi';
// import { formatDate } from '../../utils/helpers';

// const ROLE_VARIANT = {
//   owner: 'primary',
//   manager: 'info',
//   staff: 'gray',
// };

// const STATUS_VARIANT = {
//   active: 'success',
//   suspended: 'danger',
//   inactive: 'warning',
// };

// const roleOptions = [
//   { value: '', label: 'All Roles' },
//   { value: 'owner', label: 'Owner' },
//   { value: 'manager', label: 'Manager' },
//   { value: 'staff', label: 'Staff' },
// ];

// const statusOptions = [
//   { value: '', label: 'All Statuses' },
//   { value: 'active', label: 'Active' },
//   { value: 'suspended', label: 'Suspended' },
// ];

// function Users() {
//   const [loading, setLoading] = useState(true);
//   const [users, setUsers] = useState([]);
//   const [total, setTotal] = useState(0);
//   const [page, setPage] = useState(1);
//   const limit = 20;

//   // Filters
//   const [search, setSearch] = useState('');
//   const [roleFilter, setRoleFilter] = useState('');
//   const [statusFilter, setStatusFilter] = useState('');

//   const fetchUsers = useCallback(async () => {
//     try {
//       setLoading(true);
//       const params = { page, limit };
//       if (search) params.search = search;
//       if (roleFilter) params.role = roleFilter;
//       if (statusFilter) params.status = statusFilter;

//       const res = await adminApi.getUsers(params);
//       const data = res.data?.data || res.data || res;
//       setUsers(data.users || data.data || []);
//       setTotal(data.total || 0);
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to load users');
//     } finally {
//       setLoading(false);
//     }
//   }, [page, search, roleFilter, statusFilter]);

//   useEffect(() => {
//     fetchUsers();
//   }, [fetchUsers]);

//   const resetFilters = () => {
//     setSearch('');
//     setRoleFilter('');
//     setStatusFilter('');
//     setPage(1);
//   };

//   const columns = [
//     {
//       key: 'name',
//       label: 'Name',
//       render: (val) => <span className="font-semibold text-gray-900">{val || '—'}</span>,
//     },
//     {
//       key: 'email',
//       label: 'Email',
//       render: (val) => <span className="text-gray-600">{val || '—'}</span>,
//     },
//     {
//       key: 'phone',
//       label: 'Phone',
//       render: (val) => <span className="text-gray-600">{val || '—'}</span>,
//     },
//     {
//       key: 'role',
//       label: 'Role',
//       render: (val) => (
//         <Badge variant={ROLE_VARIANT[val?.toLowerCase()] || 'gray'}>
//           {val || 'Unknown'}
//         </Badge>
//       ),
//     },
//     {
//       key: 'businessId',
//       label: 'Business',
//       render: (val) => (
//         <span className="text-gray-700">
//           {val?.name || '—'}
//         </span>
//       ),
//     },
//     {
//       key: 'status',
//       label: 'Status',
//       render: (val) => (
//         <Badge variant={STATUS_VARIANT[val?.toLowerCase()] || 'gray'}>
//           {val || 'Unknown'}
//         </Badge>
//       ),
//     },
//     {
//       key: 'createdAt',
//       label: 'Created',
//       render: (val) => <span className="text-gray-500">{formatDate(val)}</span>,
//     },
//   ];

//   const hasFilters = search || roleFilter || statusFilter;

//   return (
//     <div>
//       <PageHeader title="Users" subtitle="Manage all platform users across businesses" />

//       {/* Filter Bar */}
//       <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
//         <div className="flex flex-col lg:flex-row lg:items-end gap-4">
//           <div className="flex-1 min-w-0">
//             <FormInput
//               name="search"
//               placeholder="Search by name or email..."
//               value={search}
//               onChange={(e) => { setSearch(e.target.value); setPage(1); }}
//             />
//           </div>
//           <div className="w-full sm:w-40">
//             <FormSelect
//               name="role"
//               value={roleFilter}
//               onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
//               options={roleOptions}
//               placeholder="All Roles"
//             />
//           </div>
//           <div className="w-full sm:w-40">
//             <FormSelect
//               name="status"
//               value={statusFilter}
//               onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
//               options={statusOptions}
//               placeholder="All Statuses"
//             />
//           </div>
//           {hasFilters && (
//             <Button variant="ghost" size="sm" onClick={resetFilters}>
//               Clear
//             </Button>
//           )}
//         </div>
//       </div>

//       {/* Data Table */}
//       {loading ? (
//         <LoadingSpinner type="table" />
//       ) : users.length === 0 ? (
//         <EmptyState
//           title="No users found"
//           description={
//             hasFilters
//               ? 'Try adjusting your filters to see more results.'
//               : 'Platform users will appear here.'
//           }
//         />
//       ) : (
//         <DataTable
//           columns={columns}
//           data={users}
//           pagination={{
//             page,
//             limit,
//             total,
//             onPageChange: setPage,
//           }}
//         />
//       )}
//     </div>
//   );
// }

// export default Users;
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import FormSelect from '../../components/FormSelect';
import FormInput from '../../components/FormInput';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { adminApi } from '../../api/adminApi';
import { formatDate } from '../../utils/helpers';

const ROLE_VARIANT = {
  owner: 'primary',
  manager: 'info',
  staff: 'gray',
};

const STATUS_VARIANT = {
  active: 'success',
  suspended: 'danger',
  inactive: 'warning',
};

const roleOptions = [
  { value: '', label: 'All Roles' },
  { value: 'owner', label: 'Owner' },
  { value: 'manager', label: 'Manager' },
  { value: 'staff', label: 'Staff' },
];

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
];

function Users() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await adminApi.getUsers(params);
      const raw = res.data;

      // Backend returns { success, data: [...], pagination: { total, page, limit } }
      let items = [];
      if (Array.isArray(raw?.data)) {
        items = raw.data;
      } else if (Array.isArray(raw)) {
        items = raw;
      } else if (raw?.data && !Array.isArray(raw.data) && Array.isArray(raw.data.users)) {
        items = raw.data.users;
      }

      setUsers(items);
      setTotal(raw?.pagination?.total ?? items.length ?? 0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const resetFilters = () => {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
    setPage(1);
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (val) => <span className="font-semibold text-gray-900">{val || '—'}</span>,
    },
    {
      key: 'email',
      label: 'Email',
      render: (val) => <span className="text-gray-600">{val || '—'}</span>,
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (val) => <span className="text-gray-600">{val || '—'}</span>,
    },
    {
      key: 'role',
      label: 'Role',
      render: (val) => (
        <Badge variant={ROLE_VARIANT[val?.toLowerCase()] || 'gray'}>
          {val || 'Unknown'}
        </Badge>
      ),
    },
    {
      key: 'businessId',
      label: 'Business',
      render: (val) => (
        <span className="text-gray-700">
          {val?.name || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <Badge variant={STATUS_VARIANT[val?.toLowerCase()] || 'gray'}>
          {val || 'Unknown'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (val) => <span className="text-gray-500">{formatDate(val)}</span>,
    },
  ];

  const hasFilters = search || roleFilter || statusFilter;

  return (
    <div>
      <PageHeader title="Users" subtitle="Manage all platform users across businesses" />

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="flex-1 min-w-0">
            <FormInput
              name="search"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="w-full sm:w-40">
            <FormSelect
              name="role"
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              options={roleOptions}
              placeholder="All Roles"
            />
          </div>
          <div className="w-full sm:w-40">
            <FormSelect
              name="status"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              options={statusOptions}
              placeholder="All Statuses"
            />
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <LoadingSpinner type="table" />
      ) : users.length === 0 ? (
        <EmptyState
          title="No users found"
          description={
            hasFilters
              ? 'Try adjusting your filters to see more results.'
              : 'Platform users will appear here.'
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={users}
          pagination={{
            page,
            limit,
            total,
            onPageChange: setPage,
          }}
        />
      )}
    </div>
  );
}

export default Users;