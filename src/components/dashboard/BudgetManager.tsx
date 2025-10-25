import React, { useState, useEffect } from 'react';
import { getUserBudgetMax, updateUserBudgetMax, getExpenses, addExpense, updateExpense, deleteExpense, Expense, ExpenseStatus } from '@/services/api/budgetApi';
import { useWeddingDetails, useUpdateWeddingBudget } from '@/services/api/weddingApi';
import * as RechartsPrimitive from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { Edit, Trash2, Link, Plus, AlertCircle } from 'lucide-react'; // Using lucide-react for modern icons

// Main Budget Manager Component - Redesigned
const BudgetManager = () => {
  const { user } = useAuth();
  const { data: weddingDetails, isLoading: weddingDetailsLoading } = useWeddingDetails(user?.wedding_id || '');
  const [totalWeddingBudget, setTotalWeddingBudget] = useState<number>(0);
  const [myIndividualBudget, setMyIndividualBudget] = useState<number>(0);
  const [showMyBudget, setShowMyBudget] = useState(false);
  const currentBudget = showMyBudget ? myIndividualBudget : totalWeddingBudget;

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBudgetEdit, setShowBudgetEdit] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [expenseForm, setExpenseForm] = useState<Omit<Expense, 'item_id' | 'created_at' | 'updated_at'>>({ item_name: '', category: '', amount: 0, vendor_name: '', status: 'Quote Received', contribution_by: 'shared', wedding_id: user?.wedding_id || '' });
  const [editingExpense, setEditingExpense] = useState<Expense|null>(null);
  const [error, setError] = useState<string|null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const updateWeddingBudgetMutation = useUpdateWeddingBudget();

  // --- All the data fetching and handling logic remains unchanged ---
  
  // Budget parsing logic
  const parseIndianBudget = (val: any): number | null => {
    if (val == null) return null;
    if (typeof val === 'number' && !isNaN(val)) return val;
    if (typeof val !== 'string') return null;
    const s = val.toString().trim().toLowerCase().replace(/[,\s]+/g, '');
    const numMatch = s.match(/([0-9]+(?:\.[0-9]+)?)/);
    if (!numMatch) return null;
    const n = parseFloat(numMatch[1]);
    if (isNaN(n)) return null;
    if (s.includes('cr') || s.includes('crore')) return Math.round(n * 10000000);
    if (s.includes('l') || s.includes('lakh')) return Math.round(n * 100000);
    return Math.round(n);
  };

  // Budget extraction logic
  const extractBudgetFromDetails = (weddingData: any, userEmail?: string, userRole?: string): { total: number | null; individual: number | null } => {
    if (!weddingData) return { total: null, individual: null };
    let totalBudget: number | null = null;
    let individualBudget: number | null = null;

    // Prioritize the top-level total_budget, then fall back to the nested details object
    const details = weddingData.details || {};
    totalBudget = parseIndianBudget(weddingData.total_budget || details.budget_total || details.budget || details.estimated_budget);
    
    const partnerData = details.partner_data || {};
    if (userEmail && partnerData[userEmail]?.budget_range) {
      individualBudget = parseIndianBudget(partnerData[userEmail].budget_range);
    }
    
    if (totalBudget === null) {
      let sumOfIndividualBudgets = 0;
      let hasIndividualBudgets = false;
      for (const key of Object.keys(partnerData)) {
        const val = parseIndianBudget(partnerData[key]?.budget_range);
        if (val !== null) {
          sumOfIndividualBudgets += val;
          hasIndividualBudgets = true;
        }
      }
      if (hasIndividualBudgets) {
        totalBudget = sumOfIndividualBudgets;
      }
    }
    
    if (individualBudget === null && totalBudget !== null && Object.keys(partnerData).length <= 1) {
        individualBudget = totalBudget;
    }
    
    return { total: totalBudget, individual: individualBudget };
  };

  useEffect(() => {
    if (!user?.wedding_id) return;
    setLoading(true);
    Promise.all([
      getExpenses(user.wedding_id),
      weddingDetails ? Promise.resolve(weddingDetails) : Promise.resolve(null)
    ]).then(([e, wd]) => {
      setExpenses(e);
      const { total, individual } = extractBudgetFromDetails(wd, user?.email || undefined, user?.role || undefined);
      setTotalWeddingBudget(total ?? 0);
      setMyIndividualBudget(individual ?? 0);
      setBudgetInput((showMyBudget ? individual : total)?.toString() || '0');
      setLoading(false);
    }).catch((e) => {
      setError(e?.message || (typeof e === 'string' ? e : 'Failed to load expenses.'));
      setLoading(false);
    });
  }, [user, weddingDetails, showMyBudget]);

  const handleBudgetSave = async () => {
    if (!user?.wedding_id) return;
    try {
      if (showMyBudget) {
        // This still updates the user's individual budget preference
        await updateUserBudgetMax(user.internal_user_id, parseFloat(budgetInput));
        setMyIndividualBudget(parseFloat(budgetInput));
      } else {
        // This now updates the wedding's total budget using the mutation
        updateWeddingBudgetMutation.mutate({ weddingId: user.wedding_id, totalBudget: parseFloat(budgetInput) });
      }
      setShowBudgetEdit(false);
    } catch (e) {
      setError('Failed to update budget.');
    }
  };

  const handleExpenseSave = async () => {
    if (!user?.internal_user_id) return;
    try {
      if (editingExpense) {
        await updateExpense({ ...expenseForm, item_id: editingExpense.item_id, wedding_id: user.wedding_id, amount: expenseForm.amount || 0 });
      } else {
        await addExpense({ ...expenseForm, wedding_id: user.wedding_id, amount: expenseForm.amount || 0 });
      }
      setExpenses(await getExpenses(user.wedding_id));
      setShowExpenseDialog(false);
      setEditingExpense(null);
      setExpenseForm({ item_name: '', category: '', amount: 0, vendor_name: '', status: 'Quote Received', contribution_by: 'shared', wedding_id: user?.wedding_id || '' });
    } catch (e: unknown) {
      console.error('Failed to save expense:', e, expenseForm, editingExpense);
      const errorMessage = e instanceof Error ? e.message : String(e);
      setError(`Failed to save expense: ${errorMessage}. Please check the console for more details.`);
    }
  };

  const handleExpenseDelete = async (item_id: string) => {
    if (!user?.internal_user_id) return;
    try {
      await deleteExpense(item_id);
      setExpenses(await getExpenses(user.wedding_id));
    } catch (e: unknown) {
      console.error('Failed to delete expense:', e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      setError(`Failed to delete expense: ${errorMessage}. Please check the console for more details.`);
    }
  };

  const filteredExpenses = expenses.filter(exp => {
    const categoryMatches = selectedCategory ? exp.category === selectedCategory : true;
    if (showMyBudget) {
      if (!user?.role) return false;
      const userRole = user.role.toLowerCase();
      const contributionBy = (exp.contribution_by || '').toLowerCase();
      if (contributionBy === 'shared' || contributionBy === 'couple') {
        return categoryMatches;
      } else if (userRole.includes('bride') && contributionBy.includes('bride')) {
        return categoryMatches;
      } else if (userRole.includes('groom') && contributionBy.includes('groom')) {
        return categoryMatches;
      }
      return false;
    }
    return categoryMatches;
  });

  const totalSpent = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const remainingBudget = currentBudget - totalSpent;
  const spentPercentage = currentBudget > 0 ? Math.min(100, (totalSpent / currentBudget) * 100) : 0;

  // --- UI ---
  if (!user?.wedding_id) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md border border-red-200">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-4 text-lg font-semibold text-red-600">Access Denied</h3>
            <p className="mt-2 text-sm text-slate-600">Please log in to manage your wedding budget.</p>
        </div>
      </div>
    )
  }

  if (loading || weddingDetailsLoading) {
    return <div className="p-8 text-center text-slate-500">Loading your budget details...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold text-foreground">Budget Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Manage your wedding expenses and keep track of your budget in one place.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Left Column: Budget Overview */}
          <div className="lg:col-span-3 bg-card text-card-foreground rounded-xl shadow-md border border-border p-6 space-y-6">
            <div className="flex items-center justify-between">
              {/* Budget Toggle */}
              <div className="flex items-center bg-muted rounded-full p-1">
                <Button variant={!showMyBudget ? 'default' : 'ghost'} size="sm" onClick={() => setShowMyBudget(false)} className={`rounded-full px-4 ${!showMyBudget ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground'}`}>Total Budget</Button>
                <Button variant={showMyBudget ? 'default' : 'ghost'} size="sm" onClick={() => setShowMyBudget(true)} className={`rounded-full px-4 ${showMyBudget ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground'}`}>My Budget</Button>
              </div>
              <Button variant="outline" onClick={() => setShowBudgetEdit(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Budget
              </Button>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">{showMyBudget ? 'Your Individual Budget' : 'Total Wedding Budget'}</p>
              <p className="text-4xl font-bold text-foreground mt-1">₹{currentBudget.toLocaleString()}</p>
            </div>
            
            {/* Progress Bar */}
            <div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${spentPercentage}%` }}></div>
              </div>
              <div className="flex justify-between mt-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Spent</p>
                  <p className="font-semibold text-destructive">₹{totalSpent.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Remaining</p>
                  <p className="font-semibold text-primary">₹{remainingBudget.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Donut Chart */}
          <div className="lg:col-span-2 bg-card text-card-foreground rounded-xl shadow-md border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Budget Breakdown</h2>
            <DonutChartComponent budget={currentBudget} expenses={filteredExpenses} onCategoryClick={setSelectedCategory} />
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-card text-card-foreground rounded-xl shadow-md border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Expenses</h2>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold" onClick={() => { setShowExpenseDialog(true); setEditingExpense(null); setExpenseForm({ item_name: '', category: '', amount: 0, vendor_name: '', status: 'Quote Received', contribution_by: 'shared', wedding_id: user?.wedding_id || '' }); }}>
              <Plus className="h-5 w-5 mr-2" />
              Add Expense
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Category</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Amount Paid</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Vendor</th>
                  <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length === 0 ? (
                  <tr><td colSpan={6} className="text-center p-8 text-muted-foreground">No expenses recorded yet.</td></tr>
                ) : filteredExpenses.map((exp) => (
                <tr key={exp.item_id} className="border-b border-border/80 hover:bg-muted/80 transition-colors">
                  <td className="px-4 py-4 font-medium text-foreground">{exp.item_name}</td>
                  <td className="px-4 py-4 text-muted-foreground">{exp.category}</td>
                  <td className="px-4 py-4 text-right font-semibold text-primary">₹{(exp.amount || 0).toLocaleString()}</td>
                  <td className="px-4 py-4 text-muted-foreground">{exp.vendor_name || 'N/A'}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      exp.status === 'Paid in Full' ? 'bg-primary/20 text-primary' :
                      exp.status === 'Deposit Paid' ? 'bg-accent/20 text-accent' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {exp.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2 justify-center">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingExpense(exp); setExpenseForm({ item_name: exp.item_name, category: exp.category, amount: exp.amount, vendor_name: exp.vendor_name, status: exp.status, contribution_by: exp.contribution_by, wedding_id: exp.wedding_id }); setShowExpenseDialog(true); }} aria-label={`Edit expense ${exp.item_name}`}>
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleExpenseDelete(exp.item_id)} aria-label={`Delete expense ${exp.item_name}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dialogs remain functionally the same, with updated styling to match */}
        <Dialog open={showBudgetEdit} onOpenChange={setShowBudgetEdit}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Budget</DialogTitle>
              <DialogDescription>Update your total or individual budget amount.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <label htmlFor="budget-input" className="block text-sm font-medium text-foreground mb-1">Set New Budget Amount</label>
              <Input id="budget-input" type="number" value={budgetInput} onChange={e => setBudgetInput(e.target.value)} placeholder="e.g., 1200000" />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowBudgetEdit(false)}>Cancel</Button>
              <Button onClick={handleBudgetSave}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={showExpenseDialog} onOpenChange={open => { setShowExpenseDialog(open); if (!open) setEditingExpense(null); }}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
                <DialogDescription>
                  {editingExpense ? 'Update the details of your existing expense.' : 'Add a new expense to your budget.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="md:col-span-2">
                    <label htmlFor="expense-name" className="block text-sm font-medium text-foreground mb-1">Expense Name</label>
                    <Input id="expense-name" placeholder="E.g., Catering Deposit" value={expenseForm.item_name} onChange={e => setExpenseForm(f => ({ ...f, item_name: e.target.value }))} />
                  </div>
                  <div>
                    <label htmlFor="expense-category" className="block text-sm font-medium text-foreground mb-1">Category</label>
                    <Input id="expense-category" placeholder="E.g., Venue, Decor" value={expenseForm.category} onChange={e => setExpenseForm(f => ({ ...f, category: e.target.value }))} />
                  </div>
                  <div>
                    <label htmlFor="expense-status" className="block text-sm font-medium text-foreground mb-1">Status</label>
                    <select id="expense-status" value={expenseForm.status} onChange={e => setExpenseForm(f => ({ ...f, status: e.target.value as ExpenseStatus }))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="Quote Received">Quote Received</option>
                      <option value="Deposit Paid">Deposit Paid</option>
                      <option value="Paid in Full">Paid in Full</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="amount" className="block text-sm font-medium text-foreground mb-1">Amount (₹)</label>
                    <Input id="amount" placeholder="0" type="number" value={expenseForm.amount} onChange={e => setExpenseForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} />
                  </div>
                  <div>
                    <label htmlFor="expense-vendor" className="block text-sm font-medium text-foreground mb-1">Vendor (Optional)</label>
                    <Input id="expense-vendor" placeholder="E.g., Royal Catering" value={expenseForm.vendor_name} onChange={e => setExpenseForm(f => ({ ...f, vendor_name: e.target.value }))} />
                  </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => { setShowExpenseDialog(false); setEditingExpense(null); }}>Cancel</Button>
                <Button onClick={handleExpenseSave}>{editingExpense ? 'Update Expense' : 'Add Expense'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        {error && <div className="text-destructive text-center mt-2">{error}</div>}
      </div>
  );
};

// Redesigned Donut Chart Component
const DonutChartComponent = ({ budget, expenses, onCategoryClick }: { budget: number; expenses: Expense[]; onCategoryClick: (category: string | null) => void }) => {
  const categoryTotals: { [category: string]: number } = {};
  expenses.forEach(e => {
    const actualAmount = e.amount || 0;
    if (actualAmount > 0) {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + actualAmount;
    }
  });

  const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const remainingBudget = Math.max(0, budget - totalSpent);

  const COLORS = ['#FFC107', '#FF9800', '#FFEB3B', '#FFD54F', '#FFB74D', '#FFA726'];

  const pieData = [
    ...Object.entries(categoryTotals).map(([cat, amt], idx) => ({ name: cat, value: amt, fill: COLORS[idx % COLORS.length] })),
    { name: 'Remaining', value: remainingBudget, fill: '#E5E7EB' }
  ].filter(d => d.value > 0); // Only show categories with spending or remaining budget

  return (
    <div className="w-full flex flex-col md:flex-row items-center gap-8">
      <div className="relative w-48 h-48 flex-shrink-0">
        <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
          <RechartsPrimitive.PieChart>
            <RechartsPrimitive.Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="65%" outerRadius="100%" paddingAngle={2}>
              {pieData.map((entry, idx) => (
                <RechartsPrimitive.Cell key={`cell-${idx}`} fill={entry.fill} className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" />
              ))}
            </RechartsPrimitive.Pie>
            <ChartTooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
          </RechartsPrimitive.PieChart>
        </RechartsPrimitive.ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <p className="text-xs text-muted-foreground">Spent</p>
          <p className="text-2xl font-bold text-foreground">₹{totalSpent.toLocaleString()}</p>
        </div>
      </div>
      <div className="w-full flex-grow">
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          {pieData.map((entry) => (
            <button
              key={entry.name}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
              onClick={() => onCategoryClick(entry.name === 'Remaining' ? null : entry.name)}
            >
              <span className="w-3 h-3 rounded-full" style={{ background: entry.fill }} />
              <span className="text-muted-foreground truncate" title={entry.name}>{entry.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BudgetManager;