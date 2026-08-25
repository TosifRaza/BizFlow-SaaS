import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineSquares2X2,
  HiOutlineListBullet,
  HiOutlineTag,
} from 'react-icons/hi2';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import FormSelect from '../../components/FormSelect';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import ConfirmDialog from '../../components/ConfirmDialog';
import { categoryApi } from '../../api/categoryApi';
import { useAuth } from '../../context/AuthContext';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const CARD_COLORS = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
  'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-red-500',
  'bg-yellow-500', 'bg-cyan-500',
];

function Categories() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('categories.create');
  const canUpdate = hasPermission('categories.update');
  const canDelete = hasPermission('categories.delete');

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const [formModal, setFormModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', status: 'active' });
  const [formLoading, setFormLoading] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // const fetchCategories = useCallback(async () => {
  //   setLoading(true);
  //   try {
  //     const { data } = await categoryApi.getAll({ search });
  //     setCategories(data.data || data.categories || data || []);
  //   } catch {
  //     toast.error('Failed to load categories');
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [search]);
    const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoryApi.getAll({ search });
      const raw = res.data;
      let items = [];
      if (Array.isArray(raw?.data)) {
        items = raw.data;
      } else if (Array.isArray(raw)) {
        items = raw;
      } else if (raw?.data && !Array.isArray(raw.data) && Array.isArray(raw.data.categories)) {
        items = raw.data.categories;
      } else if (raw?.categories && Array.isArray(raw.categories)) {
        items = raw.categories;
      }
      setCategories(items);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openAddModal = () => {
    setEditingCategory(null);
    setForm({ name: '', description: '', status: 'active' });
    setFormModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setForm({
      name: category.name || '',
      description: category.description || '',
      status: category.status || 'active',
    });
    setFormModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Category name is required'); return; }
    setFormLoading(true);
    try {
      if (editingCategory) {
        await categoryApi.update(editingCategory.id, form);
        toast.success('Category updated');
      } else {
        await categoryApi.create(form);
        toast.success('Category added');
      }
      setFormModal(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await categoryApi.delete(deleteId);
      toast.success('Category deleted');
      setDeleteId(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setDeleteLoading(false);
    }
  };

  const tableColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'description', label: 'Description', render: (val) => val || '—' },
    { key: 'productCount', label: 'Product Count', sortable: true, render: (val) => val ?? 0 },
    {
      key: 'status', label: 'Status',
      render: (val) => <Badge variant={val === 'active' ? 'success' : 'gray'}>{val || 'active'}</Badge>,
    },
  ];

  if (loading) return <LoadingSpinner type="page" />;

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle={`${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'}`}
        actions={canCreate ? [{ label: 'Add Category', icon: HiOutlinePlus, onClick: openAddModal }] : []}
      />

      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setViewMode('grid')} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}>
          <HiOutlineSquares2X2 className="w-4 h-4" /> Grid
        </button>
        <button onClick={() => setViewMode('table')} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}>
          <HiOutlineListBullet className="w-4 h-4" /> Table
        </button>
      </div>

      {categories.length === 0 && !loading ? (
        <EmptyState
          icon={<HiOutlineTag className="w-16 h-16" />}
          title="No categories yet"
          description="Create categories to organize your products."
          actionLabel={canCreate ? 'Add Category' : undefined}
          onAction={canCreate ? openAddModal : undefined}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat, idx) => {
            const colorClass = CARD_COLORS[idx % CARD_COLORS.length];
            return (
              <div key={cat.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full ${colorClass} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                      {(cat.name || '?')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{cat.name}</h3>
                      <Badge variant={cat.status === 'active' ? 'success' : 'gray'}>{cat.status || 'active'}</Badge>
                    </div>
                  </div>
                </div>
                {cat.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{cat.description}</p>}
                <div className="text-sm text-gray-500 mb-4">
                  <span className="font-medium text-gray-700">{cat.productCount ?? 0}</span> product{(cat.productCount ?? 0) !== 1 ? 's' : ''}
                </div>
                {(canUpdate || canDelete) && (
                  <div className="flex items-center gap-1 pt-3 border-t border-gray-100">
                    {canUpdate && (
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(cat)}>
                        <HiOutlinePencilSquare className="w-4 h-4 text-blue-600" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(cat.id)}>
                        <HiOutlineTrash className="w-4 h-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <DataTable
          columns={tableColumns} data={categories} loading={loading}
          onSearch={(val) => setSearch(val)} searchPlaceholder="Search categories..."
          actions={(row) => {
            if (!canUpdate && !canDelete) return null;
            return (
              <div className="flex items-center gap-1">
                {canUpdate && <Button variant="ghost" size="sm" onClick={() => openEditModal(row)}><HiOutlinePencilSquare className="w-4 h-4 text-blue-600" /></Button>}
                {canDelete && <Button variant="ghost" size="sm" onClick={() => setDeleteId(row.id)}><HiOutlineTrash className="w-4 h-4 text-red-600" /></Button>}
              </div>
            );
          }}
        />
      )}

      <Modal isOpen={formModal} onClose={() => setFormModal(false)} title={editingCategory ? 'Edit Category' : 'Add Category'} size="md">
        <form onSubmit={handleFormSubmit}>
          <div className="flex flex-col gap-4">
            <FormInput label="Name" name="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Category name" required />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
              <textarea id="description" name="description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Describe this category" rows={3} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" />
            </div>
            <FormSelect label="Status" name="status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} options={STATUS_OPTIONS} placeholder="Select status" />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setFormModal(false)}>Cancel</Button>
            <Button type="submit" loading={formLoading}>{editingCategory ? 'Update' : 'Add'} Category</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} title="Delete Category" message="Are you sure you want to delete this category? Products in this category will become uncategorized." confirmText="Delete" variant="danger" loading={deleteLoading} />
    </div>
  );
}

export default Categories;