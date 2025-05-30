import React, { useState, useEffect } from 'react';
import { getUserBudgetMax, updateUserBudgetMax, getExpenses, addExpense, updateExpense, deleteExpense, Expense } from '@/services/api/budgetApi';
import { Progress } from '@/components/ui/progress';
import * as RechartsPrimitive from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ChartContainer, ChartLegend, ChartTooltip } from '@/components/ui/chart';

// Modern, minimal, and clean Budget Manager UI
const BudgetManager = () => {
  const { user } = useAuth();
  const [budget, setBudget] = useState<number>(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBudgetEdit, setShowBudgetEdit] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [expenseForm, setExpenseForm] = useState<Omit<Expense, 'item_id'|'user_id'|'created_at'>>({ item_name: '', category: '', amount: 0, vendor_name: '', status: 'Pending' });
  const [editingExpense, setEditingExpense] = useState<Expense|null>(null);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.all([
      getUserBudgetMax(user.id),
      getExpenses(user.id)
    ]).then(([budgetMax, e]) => {
      setBudget(budgetMax || 0);
      setBudgetInput(budgetMax?.toString() || '');
      setExpenses(e);
      setLoading(false);
    }).catch((e) => {
      setError(e?.message || (typeof e === 'string' ? e : 'Failed to load budget.'));
      setLoading(false);
    });
  }, [user]);

  // Budget update
  const handleBudgetSave = async () => {
    if (!user?.id) return;
    try {
      await updateUserBudgetMax(user.id, parseFloat(budgetInput));
      setBudget(parseFloat(budgetInput));
      setShowBudgetEdit(false);
    } catch (e) { setError('Failed to update budget.'); }
  };

  // Expense add/edit
  const handleExpenseSave = async () => {
    if (!user?.id) return;
    try {
      if (editingExpense) {
        await updateExpense({ ...expenseForm, item_id: editingExpense.item_id, user_id: user.id });
      } else {
        await addExpense({ ...expenseForm, user_id: user.id });
      }
      setExpenses(await getExpenses(user.id));
      setShowExpenseDialog(false);
      setEditingExpense(null);
      setExpenseForm({ item_name: '', category: '', amount: 0, vendor_name: '', status: 'Pending' });
    } catch (e: any) {
      console.error('Failed to save expense:', e, expenseForm, editingExpense);
      setError(e?.message || (typeof e === 'string' ? e : 'Failed to save expense.'));
    }
  };

  const handleExpenseDelete = async (item_id: string) => {
    if (!user?.id) return;
    try {
      await deleteExpense(item_id);
      setExpenses(await getExpenses(user.id));
    } catch (e) { setError('Failed to delete expense.'); }
  };

  // UI
  return (
    <div>
      {!user?.id ? (
        <div className="p-8 text-center text-red-500 font-semibold">Please log in to view your budget.</div>
      ) : loading ? (
        <div className="p-8 text-center">Loading...</div>
      ) : (
        <div className="max-w-3xl mx-auto py-8 space-y-8">
          {/* Budget Overview */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-lg font-semibold">Total Budget</div>
                <div className="text-3xl font-bold text-green-700">₹{budget.toLocaleString()}</div>
              </div>
              <Button onClick={() => setShowBudgetEdit(true)}>Edit</Button>
            </div>
            {/* Progress Bar for Budget Used */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-600">Used</span>
                <span className="font-medium text-gray-600">Remaining</span>
              </div>
              <div className="relative w-full h-5 mt-2 mb-1 rounded-full bg-gradient-to-r from-rose-100 via-yellow-100 to-green-100 overflow-hidden shadow-sm">
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-rose-500 via-yellow-400 to-green-500 shadow-md transition-all duration-700"
                  style={{ width: `${Math.min(100, (expenses.reduce((sum, e) => sum + e.amount, 0) / budget) * 100)}%` }}
                />
                <div className="flex justify-between absolute w-full px-2 text-xs top-1 text-gray-700 pointer-events-none">
                  <span className="font-semibold flex items-center gap-1" title="Used Budget"><svg width="14" height="14" fill="currentColor" className="text-rose-500"><circle cx="7" cy="7" r="7"/></svg>₹{expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}</span>
                  <span className="font-semibold flex items-center gap-1" title="Remaining Budget"><svg width="14" height="14" fill="currentColor" className="text-green-500"><circle cx="7" cy="7" r="7"/></svg>₹{(budget - expenses.reduce((sum, e) => sum + e.amount, 0)).toLocaleString()}</span>
                </div>
              </div>
            </div>
            {/* Pie Chart for Category Breakdown */}
            <div className="mt-8">
              <div className="text-md font-bold mb-2 text-gray-800 tracking-wide">Budget Breakdown</div>
              <div className="max-w-xs mx-auto bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 rounded-xl p-4 shadow hover:shadow-lg transition-shadow duration-300">
                <PieChartComponent budget={budget} expenses={expenses} />
              </div>
            </div>
          </div>
          {/* Expenses List */}
          <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-wide text-gray-800">Expenses</h2>
              <Button className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-full px-6 py-2 shadow transition-all duration-300" onClick={() => { setShowExpenseDialog(true); setEditingExpense(null); setExpenseForm({ item_name: '', category: '', amount: 0, vendor_name: '', status: 'Pending' }); }}>
                <svg className="inline mr-2 -mt-1" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
                Add Expense
              </Button>
            </div>
            <table className="w-full text-sm border rounded overflow-hidden">
              <thead className="bg-gradient-to-r from-blue-50 via-green-50 to-yellow-50 border-b-2 border-gray-200">
                <tr>
                  <th className="p-2 text-left font-semibold text-gray-700">Name</th>
                  <th className="p-2 text-left font-semibold text-gray-700">Category</th>
                  <th className="p-2 text-right font-semibold text-gray-700">Amount</th>
                  <th className="p-2 text-left font-semibold text-gray-700">Vendor</th>
                  <th className="p-2 text-center">Status</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr><td colSpan={6} className="text-center p-6 text-gray-400">No expenses yet.</td></tr>
                ) : expenses.map((exp, idx) => (
                  <tr
                    key={exp.item_id}
                    className={
                      `transition-shadow duration-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:shadow-md hover:bg-yellow-50`}
                  >
                    <td className="p-3 font-medium text-gray-800">{exp.item_name}</td>
                    <td className="p-3 text-gray-700">{exp.category}</td>
                    <td className="p-3 text-right font-semibold text-green-700">₹{exp.amount.toLocaleString()}</td>
                    <td className="p-3 text-gray-700">{exp.vendor_name}</td>
                    <td className="p-3 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${exp.status === 'Paid' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-yellow-100 text-yellow-700 border border-yellow-300'}`}>
                        {exp.status === 'Paid' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-3 flex gap-2 justify-center">
                      <Button variant="outline" size="sm" className="hover:bg-blue-100" onClick={() => { setEditingExpense(exp); setExpenseForm({ item_name: exp.item_name, category: exp.category, amount: exp.amount, vendor_name: exp.vendor_name, status: exp.status }); setShowExpenseDialog(true); }} title="Edit">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16.862 5.487l1.65 1.65a2.25 2.25 0 0 1 0 3.182l-7.5 7.5a2.25 2.25 0 0 1-1.591.659H6v-3.421c0-.597.237-1.17.659-1.591l7.5-7.5a2.25 2.25 0 0 1 3.182 0z"/></svg>
                      </Button>
                      <Button variant="destructive" size="sm" className="hover:bg-rose-100" onClick={() => handleExpenseDelete(exp.item_id)} title="Delete">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 7h12M9 7v10m6-10v10M4 7h16"/></svg>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Budget Edit Dialog */}
          <Dialog open={showBudgetEdit} onOpenChange={open => setShowBudgetEdit(open)}>
            <DialogContent>
              <DialogHeader><DialogTitle>Edit Budget</DialogTitle></DialogHeader>
              <div className="space-y-3 py-2">
                <Input type="number" value={budgetInput} onChange={e => setBudgetInput(e.target.value)} className="mb-4" />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowBudgetEdit(false)}>Cancel</Button>
                <Button onClick={handleBudgetSave}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Add/Edit Expense Dialog */}
          <Dialog open={showExpenseDialog} onOpenChange={open => { setShowExpenseDialog(open); if (!open) setEditingExpense(null); }}>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingExpense ? 'Edit Expense' : 'Add Expense'}</DialogTitle></DialogHeader>
              <div className="space-y-3 py-2">
                <Input placeholder="Name" value={expenseForm.item_name} onChange={e => setExpenseForm(f => ({ ...f, item_name: e.target.value }))} />
                <Input placeholder="Category" value={expenseForm.category} onChange={e => setExpenseForm(f => ({ ...f, category: e.target.value }))} />
                <Input placeholder="Amount" type="number" value={expenseForm.amount} onChange={e => setExpenseForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} />
                <Input placeholder="Vendor" value={expenseForm.vendor_name} onChange={e => setExpenseForm(f => ({ ...f, vendor_name: e.target.value }))} />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={expenseForm.status === 'Paid'}
                    onChange={e => setExpenseForm(f => ({ ...f, status: e.target.checked ? 'Paid' : 'Pending' }))}
                  /> Paid
                </label>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setShowExpenseDialog(false); setEditingExpense(null); }}>Cancel</Button>
                <Button onClick={handleExpenseSave}>{editingExpense ? 'Update' : 'Add'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Error */}
          {error && <div className="text-red-500 text-center mt-2">{error}</div>}
        </div>
      )}
    </div>
  );
};

// Pie Chart Component for Budget Breakdown
const PieChartComponent = ({ budget, expenses }: { budget: number, expenses: Expense[] }) => {
  // Group expenses by category
  const categoryTotals: { [category: string]: number } = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });
  const used = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const remaining = Math.max(0, budget - used);
  const pieData = [
    ...Object.entries(categoryTotals).map(([cat, amt]) => ({ name: cat, value: amt })),
    { name: 'Remaining', value: remaining }
  ];
  const COLORS = ['#6366f1', '#f59e42', '#10b981', '#f43f5e', '#eab308', '#3b82f6', '#a21caf', '#6ee7b7', '#f472b6', '#475569'];
  // Custom label renderer for clarity
  const renderCustomLabel = ({ name, value, percent, x, y, cx, cy, midAngle }) => {
    if (!value || percent < 0.04) return null;
    // Place label outside the pie
    const RADIAN = Math.PI / 180;
    const radius = 110;
    const sx = cx + Math.cos(-midAngle * RADIAN) * radius;
    const sy = cy + Math.sin(-midAngle * RADIAN) * radius;
    let displayName = name.length > 10 ? name.slice(0, 9) + '…' : name;
    return (
      <text x={sx} y={sy} fill="#222" fontSize={14} textAnchor={sx > cx ? 'start' : 'end'} dominantBaseline="central">
        {displayName}: ₹{value.toLocaleString()}
      </text>
    );
  };
  const CLEAN_COLORS = ['#6366f1', '#f59e42', '#10b981', '#f43f5e', '#eab308', '#3b82f6', '#a21caf', '#6ee7b7', '#f472b6', '#475569'];
  // For right-side values list
  const total = pieData.reduce((a, b) => a + b.value, 0);
  // Remove all pie chart labels
  return (
    <div className="w-full flex justify-center py-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col md:flex-row items-center md:items-center px-4 md:px-8 py-8 gap-8 animate-fadein">
        <div className="flex items-center justify-center w-full md:w-[320px]">
          <div className="bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 rounded-2xl flex items-center justify-center p-3 w-[240px] h-[240px] border border-blue-100 shadow-md">
            <RechartsPrimitive.ResponsiveContainer width={190} height={190}>
              <RechartsPrimitive.PieChart>
                <RechartsPrimitive.Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  fill="#6366f1"
                  label={false}
                  labelLine={false}
                  minAngle={10}
                >
                  {pieData.map((entry, idx) => (
                    <RechartsPrimitive.Cell key={`cell-${idx}`} fill={CLEAN_COLORS[idx % CLEAN_COLORS.length]} />
                  ))}
                </RechartsPrimitive.Pie>
                <ChartTooltip />
              </RechartsPrimitive.PieChart>
            </RechartsPrimitive.ResponsiveContainer>
          </div>
        </div>
        <div className="w-full md:w-auto flex flex-col gap-2 items-center md:items-start justify-center">
          {pieData.map((entry, idx) => (
            <div
              key={entry.name}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow border border-gray-200 min-w-[150px] transition-all duration-200 hover:bg-blue-50 hover:shadow-md cursor-pointer"
              style={{ fontSize: '1rem', fontWeight: 500 }}
            >
              <span className="inline-block w-3.5 h-3.5 rounded-full" style={{ background: CLEAN_COLORS[idx % CLEAN_COLORS.length] }} />
              <span className="font-semibold text-gray-700 truncate max-w-[90px]" title={entry.name}>{entry.name.length > 14 ? entry.name.slice(0, 13) + '…' : entry.name}</span>
              <span className="text-gray-500 font-mono text-xs ml-1">₹{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes fadein { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        .animate-fadein { animation: fadein 0.7s cubic-bezier(.4,0,.2,1); }
      `}</style>
    </div>
  );
};

export default BudgetManager;
