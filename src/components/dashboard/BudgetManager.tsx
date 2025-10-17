import React, { useState, useEffect } from 'react';
import { getUserBudgetMax, updateUserBudgetMax, getExpenses, addExpense, updateExpense, deleteExpense, Expense, ExpenseStatus } from '@/services/api/budgetApi';
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
  const [expenseForm, setExpenseForm] = useState<Omit<Expense, 'item_id' | 'created_at' | 'updated_at'>>({ item_name: '', category: '', estimated_cost: 0, actual_cost: 0, amount_paid: 0, vendor_name: '', status: 'Quote Received', paid_by: '', attachments: [], contribution_by: 'shared', wedding_id: user?.wedding_id || '' });
  const [editingExpense, setEditingExpense] = useState<Expense|null>(null);
  const [error, setError] = useState<string|null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // New state for filtering

  useEffect(() => {
    if (!user?.wedding_id) return;
    setLoading(true);
    Promise.all([
      getUserBudgetMax(user.internal_user_id),
      getExpenses(user.wedding_id)
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
    if (!user?.internal_user_id) return;
    try {
      await updateUserBudgetMax(user.internal_user_id, parseFloat(budgetInput));
      setBudget(parseFloat(budgetInput));
      setShowBudgetEdit(false);
    } catch (e) { setError('Failed to update budget.'); }
  };

  // Expense add/edit
  const handleExpenseSave = async () => {
    if (!user?.internal_user_id) return;
    try {
      if (editingExpense) {
        await updateExpense({ ...expenseForm, item_id: editingExpense.item_id, wedding_id: user.wedding_id, amount_paid: expenseForm.amount_paid || 0 });
      } else {
        await addExpense({ ...expenseForm, wedding_id: user.wedding_id, amount_paid: expenseForm.amount_paid || 0 });
      }
      setExpenses(await getExpenses(user.wedding_id));
      setShowExpenseDialog(false);
      setEditingExpense(null);
      setExpenseForm({ item_name: '', category: '', estimated_cost: 0, actual_cost: 0, amount_paid: 0, vendor_name: '', status: 'Quote Received', paid_by: '', attachments: [], contribution_by: 'shared', wedding_id: user?.wedding_id || '' });
    } catch (e: unknown) {
      console.error('Failed to save expense:', e, expenseForm, editingExpense);
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleExpenseDelete = async (item_id: string) => {
    if (!user?.internal_user_id) return;
    try {
      await deleteExpense(item_id);
      setExpenses(await getExpenses(user.wedding_id));
    } catch (e: unknown) { setError(e instanceof Error ? e.message : String(e)); }
  };

  const filteredExpenses = expenses.filter(exp => {
    if (!user?.role) return true; // If no role, show all (or implement default visibility)

    const userRole = user.role.toLowerCase();
    const contributionBy = (exp.contribution_by || '').toLowerCase();

    const categoryMatches = selectedCategory ? exp.category === selectedCategory : true;

    if (contributionBy === 'shared' || contributionBy === 'couple') {
      return categoryMatches; // Shared expenses are visible to all members of the couple
    } else if (userRole.includes('bride') && contributionBy.includes('bride')) {
      return categoryMatches;
    } else if (userRole.includes('groom') && contributionBy.includes('groom')) {
      return categoryMatches;
    }
    return false; // Hide if not shared, not matching role
  });

  // UI
  return (
    <div>
      {!user?.wedding_id ? (
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
                  style={{ width: `${Math.min(100, ((filteredExpenses.reduce((sum, e) => sum + (e.actual_cost || e.estimated_cost || e.amount_paid), 0)) / budget) * 100)}%` }}
                />
                <div className="flex justify-between absolute w-full px-2 text-xs top-1 text-gray-700 pointer-events-none">
                  <span className="font-semibold flex items-center gap-1" title="Used Budget"><svg width="14" height="14" fill="currentColor" className="text-rose-500"><circle cx="7" cy="7" r="7"/></svg>₹{filteredExpenses.reduce((sum, e) => sum + (e.actual_cost || e.estimated_cost || e.amount_paid), 0).toLocaleString()}</span>
                  <span className="font-semibold flex items-center gap-1" title="Remaining Budget"><svg width="14" height="14" fill="currentColor" className="text-green-500"><circle cx="7" cy="7" r="7"/></svg>₹{(budget - filteredExpenses.reduce((sum, e) => sum + (e.actual_cost || e.estimated_cost || e.amount_paid), 0)).toLocaleString()}</span>
                </div>
              </div>
            </div>
            {/* Pie Chart for Category Breakdown */}
            <div className="mt-8">
              <div className="text-md font-bold mb-2 text-gray-800 tracking-wide">Budget Breakdown</div>
              <div className="max-w-xs mx-auto bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 rounded-xl p-4 shadow hover:shadow-lg transition-shadow duration-300">
                <DonutChartComponent budget={budget} expenses={expenses} onCategoryClick={setSelectedCategory} />
              </div>
            </div>
          </div>
          {/* Expenses List */}
          <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-wide text-gray-800">Expenses</h2>
              <Button className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-full px-6 py-2 shadow transition-all duration-300" onClick={() => { setShowExpenseDialog(true); setEditingExpense(null); setExpenseForm({ item_name: '', category: '', estimated_cost: 0, actual_cost: 0, amount_paid: 0, vendor_name: '', status: 'Quote Received', contribution_by: 'shared', wedding_id: user?.wedding_id || '' }); }}>
                <svg className="inline mr-2 -mt-1" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
                Add Expense
              </Button>
            </div>
            <table className="w-full text-sm border rounded overflow-hidden">
              <thead className="bg-gradient-to-r from-blue-50 via-green-50 to-yellow-50 border-b-2 border-gray-200">
                <tr>
                  <th className="p-2 text-left font-semibold text-gray-700">Name</th>
                  <th className="p-2 text-left font-semibold text-gray-700">Category</th>
                  <th className="p-2 text-right font-semibold text-gray-700">Estimated Cost</th>
                  <th className="p-2 text-right font-semibold text-gray-700">Actual Cost</th>
                  <th className="p-2 text-right font-semibold text-gray-700">Amount Paid</th>
                  <th className="p-2 text-left font-semibold text-gray-700">Vendor</th>
                  <th className="p-2 text-left font-semibold text-gray-700">Paid By</th>
                  <th className="p-2 text-center">Status</th>
                  <th className="p-2">Attach</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length === 0 ? (
                  <tr><td colSpan={10} className="text-center p-6 text-gray-400">No expenses yet.</td></tr>
                ) : filteredExpenses.map((exp, idx) => (
                  <tr
                    key={exp.item_id}
                    className={
                      `transition-shadow duration-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:shadow-md hover:bg-yellow-50`}
                  >
                    <td className="p-3 font-medium text-gray-800">{exp.item_name}</td>
                    <td className="p-3 text-gray-700">{exp.category}</td>
                    <td className="p-3 text-right text-gray-700">₹{(exp.estimated_cost || 0).toLocaleString()}</td>
                    <td className="p-3 text-right text-gray-700">₹{(exp.actual_cost || 0).toLocaleString()}</td>
                    <td className="p-3 text-right font-semibold text-green-700">₹{exp.amount_paid.toLocaleString()}</td>
                    <td className="p-3 text-gray-700">{exp.vendor_name}</td>
                    <td className="p-3 text-gray-700">{exp.paid_by}</td>
                    <td className="p-3 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        exp.status === 'Paid in Full' ? 'bg-green-100 text-green-700 border border-green-300' :
                        exp.status === 'Deposit Paid' ? 'bg-blue-100 text-blue-700 border border-blue-300' :
                        'bg-yellow-100 text-yellow-700 border border-yellow-300'
                      }`}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {exp.attachments && exp.attachments.length > 0 ? (
                        <a href={exp.attachments[0]} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3m-.5 4h7"/></svg>
                        </a>
                      ) : (
                        <button className="text-gray-400 hover:text-gray-600" onClick={() => {/* Handle attachment upload */}}>
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3m-.5 4h7"/></svg>
                        </button>
                      )}
                    </td>
                    <td className="p-3 flex gap-2 justify-center">
                      <Button variant="outline" size="sm" className="hover:bg-blue-100" onClick={() => { setEditingExpense(exp); setExpenseForm({ item_name: exp.item_name, category: exp.category, estimated_cost: exp.estimated_cost || 0, actual_cost: exp.actual_cost || 0, amount_paid: exp.amount_paid, vendor_name: exp.vendor_name, status: exp.status, paid_by: exp.paid_by, attachments: exp.attachments, contribution_by: exp.contribution_by, wedding_id: exp.wedding_id }); setShowExpenseDialog(true); }} aria-label={`Edit expense ${exp.item_name}`}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16.862 5.487l1.65 1.65a2.25 2.25 0 0 1 0 3.182l-7.5 7.5a2.25 2.25 0 0 1-1.591.659H6v-3.421c0-.597.237-1.17.659-1.591l7.5-7.5a2.25 2.25 0 0 1 3.182 0z"/></svg>
                      </Button>
                      <Button variant="destructive" size="sm" className="hover:bg-rose-100" onClick={() => handleExpenseDelete(exp.item_id)} aria-label={`Delete expense ${exp.item_name}`}>
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
            <DialogContent className="glass-card">
              <DialogHeader><DialogTitle className="font-playfair title-gradient">Edit Total Budget</DialogTitle></DialogHeader>
              <div className="space-y-2 py-3">
                <label htmlFor="total-budget-input" className="block text-sm font-medium text-wedding-brown">Set New Budget Amount</label>
                <Input
                  id="total-budget-input"
                  type="number"
                  value={budgetInput}
                  onChange={e => setBudgetInput(e.target.value)}
                  className="mb-4 glass-card border-wedding-gold/30"
                  placeholder="e.g., 500000"
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setShowBudgetEdit(false)} className="nav-link">Cancel</Button>
                <Button onClick={handleBudgetSave}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Add/Edit Expense Dialog */}
          <Dialog open={showExpenseDialog} onOpenChange={open => { setShowExpenseDialog(open); if (!open) setEditingExpense(null); }}>
            <DialogContent className="glass-card">
              <DialogHeader><DialogTitle className="font-playfair title-gradient">{editingExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle></DialogHeader>
              <div className="space-y-4 py-3"> {/* Increased space-y for better separation */}
                <div>
                  <label htmlFor="expense-name" className="block text-sm font-medium text-wedding-brown mb-1">Expense Name</label>
                  <Input id="expense-name" placeholder="E.g., Catering Deposit" value={expenseForm.item_name} onChange={e => setExpenseForm(f => ({ ...f, item_name: e.target.value }))} className="glass-card border-wedding-gold/30" />
                </div>
                <div>
                  <label htmlFor="expense-category" className="block text-sm font-medium text-wedding-brown mb-1">Category</label>
                  <Input id="expense-category" placeholder="E.g., Venue, Decor" value={expenseForm.category} onChange={e => setExpenseForm(f => ({ ...f, category: e.target.value }))} className="glass-card border-wedding-gold/30" />
                </div>
                <div>
                  <label htmlFor="estimated-cost" className="block text-sm font-medium text-wedding-brown mb-1">Estimated Cost (₹)</label>
                  <Input id="estimated-cost" placeholder="0.00" type="number" value={expenseForm.estimated_cost} onChange={e => setExpenseForm(f => ({ ...f, estimated_cost: parseFloat(e.target.value) || 0 }))} className="glass-card border-wedding-gold/30" />
                </div>
                <div>
                  <label htmlFor="actual-cost" className="block text-sm font-medium text-wedding-brown mb-1">Actual Cost (₹)</label>
                  <Input id="actual-cost" placeholder="0.00" type="number" value={expenseForm.actual_cost} onChange={e => setExpenseForm(f => ({ ...f, actual_cost: parseFloat(e.target.value) || 0 }))} className="glass-card border-wedding-gold/30" />
                </div>
                <div>
                  <label htmlFor="amount-paid" className="block text-sm font-medium text-wedding-brown mb-1">Amount Paid (₹)</label>
                  <Input id="amount-paid" placeholder="0.00" type="number" value={expenseForm.amount_paid} onChange={e => setExpenseForm(f => ({ ...f, amount_paid: parseFloat(e.target.value) || 0 }))} className="glass-card border-wedding-gold/30" />
                </div>
                <div>
                  <label htmlFor="expense-vendor" className="block text-sm font-medium text-wedding-brown mb-1">Vendor (Optional)</label>
                  <Input id="expense-vendor" placeholder="E.g., Royal Catering" value={expenseForm.vendor_name} onChange={e => setExpenseForm(f => ({ ...f, vendor_name: e.target.value }))} className="glass-card border-wedding-gold/30" />
                </div>
                <div>
                  <label htmlFor="paid-by" className="block text-sm font-medium text-wedding-brown mb-1">Paid By (Optional)</label>
                  <Input id="paid-by" placeholder="E.g., Bride's Father" value={expenseForm.paid_by} onChange={e => setExpenseForm(f => ({ ...f, paid_by: e.target.value }))} className="glass-card border-wedding-gold/30" />
                </div>
                <div>
                  <label htmlFor="expense-status" className="block text-sm font-medium text-wedding-brown mb-1">Status</label>
                  <select
                    id="expense-status"
                    value={expenseForm.status}
                    onChange={e => setExpenseForm(f => ({ ...f, status: e.target.value as ExpenseStatus }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 glass-card border-wedding-gold/30"
                  >
                    <option value="Quote Received">Quote Received</option>
                    <option value="Deposit Paid">Deposit Paid</option>
                    <option value="Paid in Full">Paid in Full</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => { setShowExpenseDialog(false); setEditingExpense(null); }} className="nav-link">Cancel</Button>
                <Button onClick={handleExpenseSave} className="cta-button">{editingExpense ? 'Update Expense' : 'Add Expense'}</Button>
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
const DonutChartComponent = ({ budget, expenses, onCategoryClick }: { budget: number, expenses: Expense[], onCategoryClick: (category: string | null) => void }) => {
  const categoryTotals: { [category: string]: number } = {};
  expenses.forEach(e => {
    const actualAmount = e.actual_cost || e.estimated_cost || e.amount_paid;
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + actualAmount;
  });

  const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const remainingBudget = Math.max(0, budget - totalSpent);

  const pieData = [
    ...Object.entries(categoryTotals).map(([cat, amt], idx) => ({ name: cat, value: amt, fill: COLORS[idx % COLORS.length] })),
    { name: 'Remaining', value: remainingBudget, fill: '#d1d5db' } // Default color for remaining
  ];

  const COLORS = ['#6366f1', '#f59e42', '#10b981', '#f43f5e', '#eab308', '#3b82f6', '#a21caf', '#6ee7b7', '#f472b6', '#475569'];

  return (
    <div className="w-full flex justify-center py-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col md:flex-row items-center md:items-center px-4 md:px-8 py-8 gap-8 animate-fadein">
        <div className="flex items-center justify-center w-full md:w-[320px] relative">
          <RechartsPrimitive.ResponsiveContainer width={240} height={240}>
            <RechartsPrimitive.PieChart>
              <RechartsPrimitive.Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60} // Donut chart inner radius
                outerRadius={95}
                fill="#8884d8"
                label={false}
                labelLine={false}
                minAngle={3}
              >
                {pieData.map((entry, idx) => (
                  <RechartsPrimitive.Cell key={`cell-${idx}`} fill={entry.fill || COLORS[idx % COLORS.length]} />
                ))}
              </RechartsPrimitive.Pie>
              <ChartTooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
            </RechartsPrimitive.PieChart>
          </RechartsPrimitive.ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-sm text-gray-500">Total Spent</div>
            <div className="text-xl font-bold text-rose-600">₹{totalSpent.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-2">Total Budget</div>
            <div className="text-lg font-bold text-green-700">₹{budget.toLocaleString()}</div>
          </div>
        </div>
        <div className="w-full md:w-auto flex flex-col gap-2 items-center md:items-start justify-center">
          {pieData.map((entry, idx) => (
            <div
              key={entry.name}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow border border-gray-200 min-w-[150px] transition-all duration-200 hover:bg-blue-50 hover:shadow-md cursor-pointer"
              style={{ fontSize: '1rem', fontWeight: 500 }}
              onClick={() => onCategoryClick(entry.name === 'Remaining' ? null : entry.name)} // Interactive legend
            >
              <span className="inline-block w-3.5 h-3.5 rounded-full" style={{ background: entry.fill || COLORS[idx % COLORS.length] }} />
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
