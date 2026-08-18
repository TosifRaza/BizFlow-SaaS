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
// import Button from '../../components/Button';
// import Badge from '../../components/Badge';
// import EmptyState from '../../components/EmptyState';
// import LoadingSpinner from '../../components/LoadingSpinner';
// import ConfirmDialog from '../../components/ConfirmDialog';
// import { roleApi } from '../../api/roleApi';

// const PERMISSION_MODULES = [
//   {
//     name: 'Products',
//     permissions: ['View', 'Create', 'Update', 'Delete'],
//   },
//   {
//     name: 'Inventory',
//     permissions: ['View', 'Adjust'],
//   },
//   {
//     name: 'Sales',
//     permissions: ['View', 'Create', 'Cancel', 'Return'],
//   },
//   {
//     name: 'Customers',
//     permissions: ['View', 'Create', 'Update'],
//   },
//   {
//     name: 'Suppliers',
//     permissions: ['View', 'Create', 'Update'],
//   },
//   {
//     name: 'Purchases',
//     permissions: ['View', 'Create'],
//   },
//   {
//     name: 'Expenses',
//     permissions: ['View', 'Create', 'Update', 'Delete'],
//   },
//   {
//     name: 'Employees',
//     permissions: ['View', 'Manage'],
//   },
//   {
//     name: 'Reports',
//     permissions: ['View'],
//   },
//   {
//     name: 'Settings',
//     permissions: ['Manage'],
//   },
//   {
//     name: 'Subscription',
//     permissions: ['Manage'],
//   },
// ];

// const toPermissionKey = (module, action) =>
//   `${module.toLowerCase()}.${action.toLowerCase()}`;

// const fromPermissionKeys = (keys) => {
//   const perms = {};
//   if (!keys || !Array.isArray(keys)) return perms;
//   PERMISSION_MODULES.forEach((mod) => {
//     mod.permissions.forEach((action) => {
//       const key = toPermissionKey(mod.name, action);
//       perms[key] = keys.includes(key);
//     });
//   });
//   return perms;
// };

// const emptyForm = { name: '', description: '' };

// function Roles() {
//   const [roles, setRoles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [isEdit, setIsEdit] = useState(false);
//   const [selectedRole, setSelectedRole] = useState(null);
//   const [form, setForm] = useState({ ...emptyForm });
//   const [permissions, setPermissions] = useState(() => {
//     const perms = {};
//     PERMISSION_MODULES.forEach((mod) => {
//       mod.permissions.forEach((action) => {
//         perms[toPermissionKey(mod.name, action)] = false;
//       });
//     });
//     return perms;
//   });
//   const [submitting, setSubmitting] = useState(false);

//   const fetchRoles = useCallback(async () => {
//     setLoading(true);
//     try {
//       const { data } = await roleApi.getAll();
//       setRoles(data?.data ?? data?.roles ?? []);
//     } catch {
//       toast.error('Failed to load roles');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchRoles();
//   }, [fetchRoles]);

//   const togglePermission = (module, action) => {
//     const key = toPermissionKey(module, action);
//     setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
//   };

//   const toggleModule = (modName, permissionsList, enable) => {
//     const updated = { ...permissions };
//     permissionsList.forEach((action) => {
//       updated[toPermissionKey(modName, action)] = enable;
//     });
//     setPermissions(updated);
//   };

//   const isModuleFullyChecked = (mod) =>
//     mod.permissions.every((action) => permissions[toPermissionKey(mod.name, action)]);

//   const isModulePartiallyChecked = (mod) =>
//     mod.permissions.some((action) => permissions[toPermissionKey(mod.name, action)]) &&
//     !isModuleFullyChecked(mod);

//   const openCreateModal = () => {
//     setIsEdit(false);
//     setSelectedRole(null);
//     setForm({ ...emptyForm });
//     const freshPerms = {};
//     PERMISSION_MODULES.forEach((mod) => {
//       mod.permissions.forEach((action) => {
//         freshPerms[toPermissionKey(mod.name, action)] = false;
//       });
//     });
//     setPermissions(freshPerms);
//     setShowModal(true);
//   };

//   const openEditModal = async (role) => {
//     setSelectedRole(role);
//     setIsEdit(true);
//     setForm({ name: role.name || '', description: role.description || '' });

//     try {
//       const { data } = await roleApi.getById(role.id);
//       const fullRole = data?.data ?? data;
//       setPermissions(fromPermissionKeys(fullRole.permissions));
//     } catch {
//       setPermissions(fromPermissionKeys(role.permissions));
//     }

//     setShowModal(true);
//   };

//   const openDeleteConfirm = (role) => {
//     setSelectedRole(role);
//     setShowConfirm(true);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.name.trim()) {
//       toast.error('Role name is required');
//       return;
//     }
//     setSubmitting(true);
//     try {
//       const enabledPermissions = Object.entries(permissions)
//         .filter(([, val]) => val)
//         .map(([key]) => key);

//       const payload = {
//         name: form.name,
//         description: form.description,
//         permissions: enabledPermissions,
//       };

//       if (isEdit && selectedRole) {
//         await roleApi.update(selectedRole.id, payload);
//         toast.success('Role updated successfully');
//       } else {
//         await roleApi.create(payload);
//         toast.success('Role created successfully');
//       }
//       setShowModal(false);
//       fetchRoles();
//     } catch (err) {
//       toast.error(err?.response?.data?.message || 'Failed to save role');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!selectedRole) return;
//     try {
//       await roleApi.delete(selectedRole.id);
//       toast.success('Role deleted successfully');
//       setShowConfirm(false);
//       fetchRoles();
//     } catch (err) {
//       toast.error(err?.response?.data?.message || 'Failed to delete role');
//     }
//   };

//   const columns = [
//     { key: 'name', label: 'Role Name', render: (val) => <span className="font-medium text-gray-900">{val}</span> },
//     { key: 'description', label: 'Description', render: (val) => <span className="text-gray-500">{val || '-'}</span> },
//     {
//       key: 'usersCount',
//       label: 'Users Count',
//       render: (val) => (
//         <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-xs font-medium text-gray-700">
//           {val ?? 0}
//         </span>
//       ),
//     },
//     {
//       key: 'isDefault',
//       label: 'Is Default',
//       render: (val) => val ? <Badge variant="info">Default</Badge> : <Badge variant="gray">Custom</Badge>,
//     },
//   ];

//   const actions = (row) => (
//     <div className="flex items-center gap-1">
//       <Button variant="ghost" size="sm" onClick={() => openEditModal(row)} title="Edit">
//         <HiOutlinePencil className="w-4 h-4" />
//       </Button>
//       {!row.isDefault && (
//         <Button variant="ghost" size="sm" onClick={() => openDeleteConfirm(row)} title="Delete">
//           <HiOutlineTrash className="w-4 h-4 text-red-500" />
//         </Button>
//       )}
//     </div>
//   );

//   return (
//     <div>
//       <PageHeader
//         title="Roles & Permissions"
//         subtitle="Define roles and access levels for your team"
//         actions={[
//           { label: 'Create Role', icon: HiOutlinePlus, onClick: openCreateModal },
//         ]}
//       />

//       {loading ? (
//         <LoadingSpinner type="table" />
//       ) : roles.length === 0 ? (
//         <EmptyState
//           title="No roles defined"
//           description="Create roles to manage access permissions."
//           actionLabel="Create Role"
//           onAction={openCreateModal}
//         />
//       ) : (
//         <DataTable
//           columns={columns}
//           data={loading ? [] : roles}
//           loading={loading}
//           actions={actions}
//         />
//       )}

//       {/* Create/Edit Role Modal */}
//       <Modal
//         isOpen={showModal}
//         onClose={() => setShowModal(false)}
//         title={isEdit ? 'Edit Role' : 'Create Role'}
//         size="lg"
//       >
//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <FormInput
//               name="name"
//               label="Role Name"
//               value={form.name}
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//               required
//               placeholder="e.g. Store Manager"
//             />
//             <FormInput
//               name="description"
//               label="Description"
//               value={form.description}
//               onChange={(e) => setForm({ ...form, description: e.target.value })}
//               placeholder="Brief description of this role"
//             />
//           </div>

//           {/* Permissions */}
//           <div>
//             <h4 className="text-sm font-semibold text-gray-900 mb-3">Permissions</h4>
//             <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
//               {PERMISSION_MODULES.map((mod) => {
//                 const fullyChecked = isModuleFullyChecked(mod);
//                 const partiallyChecked = isModulePartiallyChecked(mod);

//                 return (
//                   <div key={mod.name} className="border border-gray-200 rounded-lg overflow-hidden">
//                     {/* Module header */}
//                     <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
//                       <label className="flex items-center gap-2 cursor-pointer select-none">
//                         <input
//                           type="checkbox"
//                           checked={fullyChecked}
//                           ref={(el) => {
//                             if (el) el.indeterminate = partiallyChecked;
//                           }}
//                           onChange={(e) => toggleModule(mod.name, mod.permissions, e.target.checked)}
//                           className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
//                         />
//                         <span className="text-sm font-semibold text-gray-900">{mod.name}</span>
//                       </label>
//                       <span className="text-xs text-gray-400">
//                         {mod.permissions.filter((a) => permissions[toPermissionKey(mod.name, a)]).length}/{mod.permissions.length}
//                       </span>
//                     </div>

//                     {/* Permissions grid */}
//                     <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
//                       {mod.permissions.map((action) => {
//                         const key = toPermissionKey(mod.name, action);
//                         return (
//                           <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
//                             <input
//                               type="checkbox"
//                               checked={permissions[key]}
//                               onChange={() => togglePermission(mod.name, action)}
//                               className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
//                             />
//                             <span className="text-xs text-gray-700">{action}</span>
//                           </label>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
//             <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
//             <Button type="submit" loading={submitting}>
//               {isEdit ? 'Update Role' : 'Create Role'}
//             </Button>
//           </div>
//         </form>
//       </Modal>

//       {/* Delete Confirm */}
//       <ConfirmDialog
//         isOpen={showConfirm}
//         onCancel={() => setShowConfirm(false)}
//         onConfirm={handleDelete}
//         title="Delete Role?"
//         message={`Deleting "${selectedRole?.name}" will remove all its permission settings. This cannot be undone.`}
//         confirmText="Delete"
//         variant="danger"
//       />
//     </div>
//   );
// }

// export default Roles;
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
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import { roleApi } from '../../api/roleApi';
import { useAuth } from '../../context/AuthContext';

const PERMISSION_MODULES = [
  {
    name: 'Products',
    permissions: ['View', 'Create', 'Update', 'Delete'],
  },
  {
    name: 'Inventory',
    permissions: ['View', 'Adjust'],
  },
  {
    name: 'Sales',
    permissions: ['View', 'Create', 'Cancel', 'Return'],
  },
  {
    name: 'Customers',
    permissions: ['View', 'Create', 'Update'],
  },
  {
    name: 'Suppliers',
    permissions: ['View', 'Create', 'Update'],
  },
  {
    name: 'Purchases',
    permissions: ['View', 'Create'],
  },
  {
    name: 'Expenses',
    permissions: ['View', 'Create', 'Update', 'Delete'],
  },
  {
    name: 'Employees',
    permissions: ['View', 'Manage'],
  },
  {
    name: 'Reports',
    permissions: ['View'],
  },
  {
    name: 'Settings',
    permissions: ['Manage'],
  },
  {
    name: 'Subscription',
    permissions: ['Manage'],
  },
];

const toPermissionKey = (module, action) =>
  `${module.toLowerCase()}.${action.toLowerCase()}`;

const fromPermissionKeys = (keys) => {
  const perms = {};
  if (!keys || !Array.isArray(keys)) return perms;
  PERMISSION_MODULES.forEach((mod) => {
    mod.permissions.forEach((action) => {
      const key = toPermissionKey(mod.name, action);
      perms[key] = keys.includes(key);
    });
  });
  return perms;
};

const emptyForm = { name: '', description: '' };

function Roles() {
  const { hasPermission } = useAuth();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [permissions, setPermissions] = useState(() => {
    const perms = {};
    PERMISSION_MODULES.forEach((mod) => {
      mod.permissions.forEach((action) => {
        perms[toPermissionKey(mod.name, action)] = false;
      });
    });
    return perms;
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await roleApi.getAll();
      setRoles(data?.data ?? data?.roles ?? []);
    } catch {
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const togglePermission = (module, action) => {
    const key = toPermissionKey(module, action);
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleModule = (modName, permissionsList, enable) => {
    const updated = { ...permissions };
    permissionsList.forEach((action) => {
      updated[toPermissionKey(modName, action)] = enable;
    });
    setPermissions(updated);
  };

  const isModuleFullyChecked = (mod) =>
    mod.permissions.every((action) => permissions[toPermissionKey(mod.name, action)]);

  const isModulePartiallyChecked = (mod) =>
    mod.permissions.some((action) => permissions[toPermissionKey(mod.name, action)]) &&
    !isModuleFullyChecked(mod);

  const openCreateModal = () => {
    setIsEdit(false);
    setSelectedRole(null);
    setForm({ ...emptyForm });
    const freshPerms = {};
    PERMISSION_MODULES.forEach((mod) => {
      mod.permissions.forEach((action) => {
        freshPerms[toPermissionKey(mod.name, action)] = false;
      });
    });
    setPermissions(freshPerms);
    setShowModal(true);
  };

  const openEditModal = async (role) => {
    setSelectedRole(role);
    setIsEdit(true);
    setForm({ name: role.name || '', description: role.description || '' });

    try {
      const { data } = await roleApi.getById(role.id);
      const fullRole = data?.data ?? data;
      setPermissions(fromPermissionKeys(fullRole.permissions));
    } catch {
      setPermissions(fromPermissionKeys(role.permissions));
    }

    setShowModal(true);
  };

  const openDeleteConfirm = (role) => {
    setSelectedRole(role);
    setShowConfirm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Role name is required');
      return;
    }
    setSubmitting(true);
    try {
      const enabledPermissions = Object.entries(permissions)
        .filter(([, val]) => val)
        .map(([key]) => key);

      const payload = {
        name: form.name,
        description: form.description,
        permissions: enabledPermissions,
      };

      if (isEdit && selectedRole) {
        await roleApi.update(selectedRole.id, payload);
        toast.success('Role updated successfully');
      } else {
        await roleApi.create(payload);
        toast.success('Role created successfully');
      }
      setShowModal(false);
      fetchRoles();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRole) return;
    try {
      await roleApi.delete(selectedRole.id);
      toast.success('Role deleted successfully');
      setShowConfirm(false);
      fetchRoles();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete role');
    }
  };

  const columns = [
    { key: 'name', label: 'Role Name', render: (val) => <span className="font-medium text-gray-900">{val}</span> },
    { key: 'description', label: 'Description', render: (val) => <span className="text-gray-500">{val || '-'}</span> },
    {
      key: 'usersCount',
      label: 'Users Count',
      render: (val) => (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-xs font-medium text-gray-700">
          {val ?? 0}
        </span>
      ),
    },
    {
      key: 'isDefault',
      label: 'Is Default',
      render: (val) => val ? <Badge variant="info">Default</Badge> : <Badge variant="gray">Custom</Badge>,
    },
  ];

  const actions = (row) => (
    <div className="flex items-center gap-1">
      {hasPermission('roles.update') && (
      <Button variant="ghost" size="sm" onClick={() => openEditModal(row)} title="Edit">
        <HiOutlinePencil className="w-4 h-4" />
      </Button>
      )}
      {!row.isDefault && hasPermission('roles.delete') && (
        <Button variant="ghost" size="sm" onClick={() => openDeleteConfirm(row)} title="Delete">
          <HiOutlineTrash className="w-4 h-4 text-red-500" />
        </Button>
      )}
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        subtitle="Define roles and access levels for your team"
        actions={hasPermission('roles.create') ? [
          { label: 'Create Role', icon: HiOutlinePlus, onClick: openCreateModal },
        ] : []}
      />

      {loading ? (
        <LoadingSpinner type="table" />
      ) : roles.length === 0 ? (
        <EmptyState
          title="No roles defined"
          description="Create roles to manage access permissions."
          actionLabel={hasPermission('roles.create') ? 'Create Role' : undefined}
          onAction={hasPermission('roles.create') ? openCreateModal : undefined}
        />
      ) : (
        <DataTable
          columns={columns}
          data={loading ? [] : roles}
          loading={loading}
          actions={actions}
        />
      )}

      {/* Create/Edit Role Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEdit ? 'Edit Role' : 'Create Role'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              name="name"
              label="Role Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="e.g. Store Manager"
            />
            <FormInput
              name="description"
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of this role"
            />
          </div>

          {/* Permissions */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Permissions</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {PERMISSION_MODULES.map((mod) => {
                const fullyChecked = isModuleFullyChecked(mod);
                const partiallyChecked = isModulePartiallyChecked(mod);

                return (
                  <div key={mod.name} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Module header */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={fullyChecked}
                          ref={(el) => {
                            if (el) el.indeterminate = partiallyChecked;
                          }}
                          onChange={(e) => toggleModule(mod.name, mod.permissions, e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-sm font-semibold text-gray-900">{mod.name}</span>
                      </label>
                      <span className="text-xs text-gray-400">
                        {mod.permissions.filter((a) => permissions[toPermissionKey(mod.name, a)]).length}/{mod.permissions.length}
                      </span>
                    </div>

                    {/* Permissions grid */}
                    <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {mod.permissions.map((action) => {
                        const key = toPermissionKey(mod.name, action);
                        return (
                          <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={permissions[key]}
                              onChange={() => togglePermission(mod.name, action)}
                              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="text-xs text-gray-700">{action}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>
              {isEdit ? 'Update Role' : 'Create Role'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={showConfirm}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Role?"
        message={`Deleting "${selectedRole?.name}" will remove all its permission settings. This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

export default Roles;
