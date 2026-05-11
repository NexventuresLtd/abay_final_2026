import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, Tag, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { categoriesApi } from '@/api/services';
import { formatDate } from '@/utils';
import type { Category } from '@/types';

function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl"
        style={{ background: 'var(--color-surface)' }}>
        <div className="flex items-center justify-between px-4 py-3.5 border-b"
          style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--color-text)' }}>{title}</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

const CARD_COLORS = [
  { bg: '#dbeafe', icon: '#2563eb' },
  { bg: '#dcfce7', icon: '#16a34a' },
  { bg: '#fef9c3', icon: '#ca8a04' },
  { bg: '#fee2e2', icon: '#dc2626' },
  { bg: '#f3e8ff', icon: '#9333ea' },
  { bg: '#ffedd5', icon: '#ea580c' },
  { bg: '#cffafe', icon: '#0891b2' },
  { bg: '#fce7f3', icon: '#db2777' },
];

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<Category | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list().then(r => r.data),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>();

  const saveMutation = useMutation({
    mutationFn: (data: any) =>
      selected ? categoriesApi.update(selected.id, data) : categoriesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success(selected ? 'Category updated!' : 'Category created!');
      setModal(null); setSelected(null); reset();
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail ?? 'Error saving category'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoriesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success('Deleted'); },
    onError: (err: any) => toast.error(err?.response?.data?.detail ?? 'Cannot delete — may have products'),
  });

  const openEdit = (cat: Category) => {
    setSelected(cat);
    reset({ name: cat.name, description: cat.description ?? '' });
    setModal('edit');
  };

  const openCreate = () => {
    setSelected(null);
    reset({ name: '', description: '' });
    setModal('create');
  };

  const closeModal = () => { setModal(null); setSelected(null); reset(); };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--color-text)' }}>
            Categories
          </h1>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {categories?.length ?? 0} product categories
          </p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Cards — 2 cols mobile, 3 sm, 4 lg */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card space-y-2">
              <div className="skeleton w-10 h-10 rounded-xl" />
              <div className="skeleton w-24 h-4" />
              <div className="skeleton w-32 h-3" />
            </div>
          ))}
        </div>
      ) : categories?.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map((cat: Category, idx: number) => {
            const color = CARD_COLORS[idx % CARD_COLORS.length];
            return (
              <div key={cat.id} className="card group relative p-3 sm:p-4">
                {/* Hover action buttons */}
                <div className="absolute top-2.5 right-2.5 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(cat)}
                    className="p-1.5 rounded-lg shadow-sm"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: '#2563eb' }}>
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(cat.id)}
                    className="p-1.5 rounded-lg shadow-sm"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: '#ef4444' }}>
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2.5"
                  style={{ background: color.bg }}>
                  <Tag className="w-5 h-5" style={{ color: color.icon }} />
                </div>

                <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                  {cat.name}
                </div>

                {cat.description ? (
                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                    {cat.description}
                  </p>
                ) : (
                  <p className="text-xs mt-0.5 italic" style={{ color: 'var(--color-text-faint)' }}>
                    No description
                  </p>
                )}

                <div className="mt-2.5 pt-2 border-t text-xs" style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-faint)',
                }}>
                  {formatDate(cat.created_at)}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card py-14 text-center">
          <Tag className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: 'var(--color-text)' }} />
          <p className="font-medium mb-1" style={{ color: 'var(--color-text)' }}>No categories yet</p>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Create categories to organize your products
          </p>
          <button onClick={openCreate} className="btn btn-primary mx-auto">
            <Plus className="w-4 h-4" /> Add First Category
          </button>
        </div>
      )}

      {/* Modal */}
      <Modal open={modal !== null} onClose={closeModal}
        title={selected ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Name *</label>
            <input {...register('name', { required: 'Name is required' })}
              className="input" placeholder="e.g. Electronics, Clothing…" />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{String(errors.name.message)}</p>
            )}
          </div>
          <div>
            <label className="label">Description</label>
            <textarea {...register('description')} className="input" rows={3}
              placeholder="Optional description…" />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={closeModal} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saveMutation.isPending} className="btn btn-primary flex-1">
              {saveMutation.isPending ? 'Saving…' : selected ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
