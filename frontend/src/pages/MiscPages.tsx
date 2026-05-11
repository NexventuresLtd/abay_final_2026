import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Search, Edit2, Trash2, Truck, X, Download, BarChart3, DollarSign, FileSpreadsheet, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { suppliersApi, expensesApi, reportsApi } from '@/api/services';
import { formatCurrency, formatDate, downloadBlob } from '@/utils';
import type { Supplier, Expense } from '@/types';

function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto
                      rounded-t-2xl sm:rounded-2xl shadow-2xl"
        style={{ background: 'var(--color-surface)' }}>
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3.5 border-b"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--color-text)' }}>{title}</h2>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

// ─── Suppliers ────────────────────────────────────────────────────────────────
export function SuppliersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<Supplier | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', { search, page }],
    queryFn: () => suppliersApi.list({ search, page, per_page: 20 }).then(r => r.data),
  });

  const { register, handleSubmit, reset } = useForm<any>();

  const saveMutation = useMutation({
    mutationFn: (data: object) =>
      selected ? suppliersApi.update(selected.id, data) : suppliersApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Saved!');
      setModal(null); setSelected(null); reset();
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail ?? 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => suppliersApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['suppliers'] }); toast.success('Deactivated'); },
  });

  const openEdit = (s: Supplier) => {
    setSelected(s);
    reset({ name: s.name, company_name: s.company_name, email: s.email, phone: s.phone, address: s.address });
    setModal('edit');
  };

  const closeModal = () => { setModal(null); setSelected(null); reset(); };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--color-text)' }}>Suppliers</h1>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {data?.total ?? 0} total suppliers
          </p>
        </div>
        <button onClick={() => { reset({}); setSelected(null); setModal('create'); }}
          className="btn btn-primary">
          <Plus className="w-4 h-4" /> Add Supplier
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: 'var(--color-text-muted)' }} />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="input pl-9" placeholder="Search suppliers…" />
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th className="hidden sm:table-cell">Email</th>
                <th className="hidden md:table-cell">Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 5 }).map((_, j) => <td key={j}><div className="skeleton h-4 w-20" /></td>)}</tr>
                  ))
                : data?.items?.length
                  ? data.items.map((s: Supplier) => (
                      <tr key={s.id}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                              <Truck className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                                {s.name}
                              </div>
                              {s.company_name && (
                                <div className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                                  {s.company_name}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell">
                          <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{s.email ?? '—'}</span>
                        </td>
                        <td className="hidden md:table-cell">
                          <span className="text-sm" style={{ color: 'var(--color-text)' }}>{s.phone ?? '—'}</span>
                        </td>
                        <td>
                          <span className={`badge text-xs ${s.is_active ? 'badge-green' : 'badge-gray'}`}>
                            {s.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(s)}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteMutation.mutate(s.id)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-sm"
                        style={{ color: 'var(--color-text-faint)' }}>No suppliers found</td>
                    </tr>
                  )
              }
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal !== null} onClose={closeModal}
        title={selected ? 'Edit Supplier' : 'Add Supplier'}>
        <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="label">Name *</label>
              <input {...register('name', { required: true })} className="input" placeholder="Contact name" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Company Name</label>
              <input {...register('company_name')} className="input" placeholder="Company Ltd" />
            </div>
            <div>
              <label className="label">Email</label>
              <input {...register('email')} type="email" className="input" placeholder="email@co.com" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input {...register('phone')} className="input" placeholder="+1-555-0000" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Address</label>
              <textarea {...register('address')} className="input" rows={2} placeholder="Full address" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={closeModal} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saveMutation.isPending} className="btn btn-primary flex-1">
              {saveMutation.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── Expenses ─────────────────────────────────────────────────────────────────
export function ExpensesPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [page, setPage] = useState(1);

  const { data } = useQuery({
    queryKey: ['expenses', page],
    queryFn: () => expensesApi.list({ page, per_page: 20 }).then(r => r.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: () => expensesApi.categories().then(r => r.data),
  });

  const { register, handleSubmit, reset } = useForm<any>();

  const createMutation = useMutation({
    mutationFn: (data: object) => expensesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Expense recorded!');
      setModal(false); reset();
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail ?? 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => expensesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); toast.success('Deleted'); },
  });

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--color-text)' }}>Expenses</h1>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {data?.total ?? 0} total records
          </p>
        </div>
        <button onClick={() => setModal(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Expense</th>
                <th className="hidden sm:table-cell">Category</th>
                <th>Amount</th>
                <th className="hidden md:table-cell">Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.items?.length
                ? data.items.map((e: Expense) => (
                    <tr key={e.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                            <DollarSign className="w-4 h-4 text-red-500" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                              {e.title}
                            </div>
                            {e.description && (
                              <div className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                                {e.description}
                              </div>
                            )}
                            {/* Show category inline on mobile */}
                            <span className="badge badge-gray text-xs sm:hidden mt-0.5">
                              {e.category?.name ?? 'Uncategorized'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell">
                        <span className="badge badge-gray text-xs">{e.category?.name ?? 'Uncategorized'}</span>
                      </td>
                      <td>
                        <span className="font-semibold text-sm text-red-600">{formatCurrency(e.amount)}</span>
                      </td>
                      <td className="hidden md:table-cell">
                        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                          {formatDate(e.expense_date)}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => deleteMutation.mutate(e.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm"
                      style={{ color: 'var(--color-text-faint)' }}>No expenses recorded</td>
                  </tr>
                )
              }
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => { setModal(false); reset(); }} title="Record Expense">
        <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="space-y-3">
          <div>
            <label className="label">Title *</label>
            <input {...register('title', { required: true })} className="input" placeholder="e.g. Monthly rent" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Amount *</label>
              <input {...register('amount', { required: true })} type="number" step="0.01" className="input" placeholder="0.00" />
            </div>
            <div>
              <label className="label">Category</label>
              <select {...register('category_id')} className="input">
                <option value="">Select…</option>
                {categories?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea {...register('description')} className="input" rows={2} placeholder="Optional" />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => { setModal(false); reset(); }} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="btn btn-primary flex-1">
              {createMutation.isPending ? 'Saving…' : 'Save Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── Reports ──────────────────────────────────────────────────────────────────
export function ReportsPage() {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (type: 'excel' | 'pdf', report: string) => {
    const key = `${type}-${report}`;
    setExporting(key);
    try {
      const res = type === 'excel'
        ? await reportsApi.exportExcel(report)
        : await reportsApi.exportPdf(report);
      const ext = type === 'excel' ? 'xlsx' : 'pdf';
      downloadBlob(res.data, `${report}_report.${ext}`);
      toast.success(`${type.toUpperCase()} downloaded!`);
    } catch {
      toast.error('Export failed. Make sure the backend is running.');
    } finally {
      setExporting(null);
    }
  };

  const reports = [
    {
      id: 'sales',
      title: 'Sales Report',
      desc: 'Full transaction history including totals, discounts, cashier, payment method, and status.',
      icon: BarChart3,
      color: 'blue' as const,
    },
    {
      id: 'products',
      title: 'Product Inventory Report',
      desc: 'Complete product list with pricing, stock levels, categories, and suppliers.',
      icon: FileSpreadsheet,
      color: 'green' as const,
    },
  ];

  const colorMap = {
    blue:  { bg: '#dbeafe', icon: '#2563eb' },
    green: { bg: '#dcfce7', icon: '#16a34a' },
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div>
        <h1 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--color-text)' }}>Reports</h1>
        <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Export business data as PDF or Excel
        </p>
      </div>

      {/* Report cards — stacked mobile, 2-col sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {reports.map(({ id, title, desc, icon: Icon, color }) => {
          const c = colorMap[color];
          return (
            <div key={id} className="card">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: c.bg }}>
                  <Icon className="w-5 h-5" style={{ color: c.icon }} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base" style={{ color: 'var(--color-text)' }}>
                    {title}
                  </h3>
                  <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {desc}
                  </p>
                </div>
              </div>
              {/* Export buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport('excel', id)}
                  disabled={!!exporting}
                  className="btn btn-secondary btn-sm flex-1 justify-center gap-1.5"
                >
                  {exporting === `excel-${id}`
                    ? 'Exporting…'
                    : <><FileSpreadsheet className="w-3.5 h-3.5 text-green-600" /> Excel</>
                  }
                </button>
                <button
                  onClick={() => handleExport('pdf', id)}
                  disabled={!!exporting}
                  className="btn btn-secondary btn-sm flex-1 justify-center gap-1.5"
                >
                  {exporting === `pdf-${id}`
                    ? 'Exporting…'
                    : <><FileText className="w-3.5 h-3.5 text-red-500" /> PDF</>
                  }
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
