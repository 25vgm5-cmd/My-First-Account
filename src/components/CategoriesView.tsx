import React, {useMemo, useState} from 'react';
import {Check, Lock, Minus, Pencil, Plus, Trash2, X} from 'lucide-react';
import {useVault} from '../context/VaultContext';
import {t} from '../i18n/translations';
import type {Category, TransactionType} from '../types/finance';

interface CategoriesViewProps {
  embedded?: boolean;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({embedded = false}) => {
  const {settings, categories, transactions, addCategory, updateCategory, deleteCategory} =
    useVault();

  const [newIncomeName, setNewIncomeName] = useState('');
  const [newExpenseName, setNewExpenseName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState('');

  const [showCategories, setShowCategories] = useState(!embedded);
  const [showIncomeCats, setShowIncomeCats] = useState(false);
  const [showExpenseCats, setShowExpenseCats] = useState(false);

  const incomeCategories = useMemo(
    () => categories.filter((c) => c.type === 'income'),
    [categories]
  );
  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === 'expense'),
    [categories]
  );

  const usageCountMap = useMemo(() => {
    const counts = new Map<string, number>();
    for (const tx of transactions) {
      counts.set(tx.categoryId, (counts.get(tx.categoryId) || 0) + 1);
    }
    return counts;
  }, [transactions]);

  const handleAdd = async (type: TransactionType, e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const name = type === 'income' ? newIncomeName : newExpenseName;
    try {
      await addCategory(name, type);
      if (type === 'income') setNewIncomeName('');
      else setNewExpenseName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add category.');
    }
  };

  const handleStartEdit = (cat: Category) => {
    setError('');
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleSaveEdit = async (id: string) => {
    setError('');
    try {
      await updateCategory(id, editingName);
      setEditingId(null);
      setEditingName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to rename category.');
    }
  };

  const handleDelete = async (cat: Category) => {
    setError('');
    try {
      await deleteCategory(cat.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete category.');
    }
  };

  const renderSection = (
    title: string,
    type: TransactionType,
    list: Category[],
    inputVal: string,
    setInputVal: (v: string) => void,
    isOpen: boolean,
    onToggle: () => void
  ) => (
    <div className="rounded-xl border app-surface p-5">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">{title}</h2>
            <span className="text-xs font-mono-tabular app-text-muted">({list.length})</span>
          </div>
          <p className="text-xs app-text-muted mt-0.5">
            Add, rename, or delete custom categories. &ldquo;Others&rdquo; is a mandatory fixed fallback category.
          </p>
        </div>
        <span className="w-7 h-7 rounded-lg border app-border app-surface-elevated flex items-center justify-center shrink-0 app-text-secondary">
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </span>
      </button>

      {isOpen && (
        <div className="mt-4 pt-4 border-t app-border space-y-4">
          <form onSubmit={(e) => void handleAdd(type, e)} className="flex gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={`New ${type} category...`}
              className="flex-1 rounded-lg border app-input px-3 py-2 text-sm min-h-[42px]"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white min-h-[42px] whitespace-nowrap shrink-0"
              style={{backgroundColor: 'var(--accent-primary)'}}
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>

          <div className="divide-y app-border border-t app-border app-zoom-list">
        {list.map((cat) => {
          const isEditing = editingId === cat.id;
          const count = usageCountMap.get(cat.id) || 0;
          return (
            <div key={cat.id} className="py-3 flex items-center justify-between gap-3">
              {isEditing ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1 rounded-lg border app-input px-3 py-1.5 text-sm min-h-[38px]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => void handleSaveEdit(cat.id)}
                    className="p-2 rounded-lg text-emerald-500 min-w-[36px] min-h-[36px] flex items-center justify-center"
                    aria-label="Save category"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="p-2 rounded-lg app-text-muted min-w-[36px] min-h-[36px] flex items-center justify-center"
                    aria-label="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="min-w-0">
                    <div className="font-medium flex items-center gap-2">
                      <span>{cat.name}</span>
                      {cat.isFixed && <Lock className="w-3.5 h-3.5 app-text-muted" />}
                    </div>
                    <div className="app-zoom-list-sm app-text-muted font-mono-tabular mt-0.5">
                      {count} transaction{count === 1 ? '' : 's'}
                      {cat.isFixed ? ' · Mandatory Fixed Category' : ''}
                    </div>
                  </div>

                  {!cat.isFixed && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(cat)}
                        className="p-2 rounded-lg app-text-muted hover:opacity-80 min-w-[36px] min-h-[36px] flex items-center justify-center"
                        aria-label="Edit category"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(cat)}
                        className="p-2 rounded-lg app-text-muted hover:text-rose-500 min-w-[36px] min-h-[36px] flex items-center justify-center"
                        aria-label="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
          </div>
        </div>
      )}
    </div>
  );

  const categoriesGrid = (
    <>
      {error && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {renderSection(
          'Income Categories',
          'income',
          incomeCategories,
          newIncomeName,
          setNewIncomeName,
          showIncomeCats,
          () => setShowIncomeCats((v) => !v)
        )}
        {renderSection(
          'Expense Categories',
          'expense',
          expenseCategories,
          newExpenseName,
          setNewExpenseName,
          showExpenseCats,
          () => setShowExpenseCats((v) => !v)
        )}
      </div>
    </>
  );

  if (embedded) {
    return (
      <div className="rounded-xl border app-surface p-5">
        <button
          type="button"
          onClick={() => setShowCategories((v) => !v)}
          aria-expanded={showCategories}
          className="w-full flex items-center justify-between gap-3 text-left"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold">{t(settings.language, 'navCategories')}</h2>
              <span className="text-xs font-mono-tabular app-text-muted">
                ({incomeCategories.length} income · {expenseCategories.length} expense)
              </span>
            </div>
            <p className="mt-0.5 text-xs app-text-muted">
              Deleting a custom category automatically reassigns its historical transactions to &ldquo;Others&rdquo;.
            </p>
          </div>
          <span className="w-7 h-7 rounded-lg border app-border app-surface-elevated flex items-center justify-center shrink-0 app-text-secondary">
            {showCategories ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </span>
        </button>

        {showCategories && (
          <div className="mt-5 pt-5 border-t app-border space-y-5">{categoriesGrid}</div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b app-border">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          {t(settings.language, 'navCategories')}
        </h1>
        <p className="mt-1 text-xs sm:text-sm app-text-muted">
          Deleting a custom category automatically reassigns its historical transactions to &ldquo;Others&rdquo;.
        </p>
      </div>
      {categoriesGrid}
    </div>
  );
};
