import React, { useState, useEffect } from 'react';
import { getUserBudgetMax, updateUserBudgetMax, getExpenses, addExpense, updateExpense, deleteExpense, Expense } from '@/services/api/budgetApi';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

const BudgetManager = () => {
  const { user } = useAuth();
  const [budget, setBudget] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Fetch data on load
  useEffect(() => {
    if (!user?.wedding_id) return;
    setLoading(true);
    Promise.all([
      getUserBudgetMax(user.internal_user_id),
      getExpenses(user.wedding_id)
    ]).then(([budgetMax, exp]) => {
      setBudget(budgetMax || 0);
      setExpenses(exp);
    }).finally(() => setLoading(false));
  }, [user]);

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const budgetProgress = budget > 0 ? (totalSpent / budget) * 100 : 0;

  const categoryData = expenses.reduce((acc, exp) => {
    const category = exp.category || 'Uncategorized';
    if (!acc[category]) acc[category] = 0;
    acc[category] += exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));
  const COLORS = ['#FFC107', '#FF8F00', '#F57C00', '#E65100', '#BF360C'];

  const handleFormSubmit = async (formData: Partial<Expense>) => {
    if (!user?.wedding_id) return;
    try {
      if (editingExpense) {
        await updateExpense({ ...formData, item_id: editingExpense.item_id, wedding_id: user.wedding_id });
      } else {
        await addExpense({ ...formData, wedding_id: user.wedding_id });
      }
      setExpenses(await getExpenses(user.wedding_id));
      setShowAddForm(false);
      setEditingExpense(null);
    } catch (error) {
      console.error("Failed to save expense", error);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      await deleteExpense(itemId);
      setExpenses(expenses.filter(exp => exp.item_id !== itemId));
    }
  };

  if (loading) return <div>Loading Budget...</div>;

  return (
    <div className="space-y-8">
      {/* Budget Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
          <CardDescription>Your total budget is ₹{budget.toLocaleString()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Spent: ₹{totalSpent.toLocaleString()}</span>
            <span className="text-sm font-medium">Remaining: ₹{(budget - totalSpent).toLocaleString()}</span>
          </div>
          <Progress value={budgetProgress} />
        </CardContent>
      </Card>

      {/* Add/Edit Expense Form */}
      {showAddForm || editingExpense ? (
        <ExpenseForm
          onSubmit={handleFormSubmit}
          initialData={editingExpense}
          onCancel={() => { setShowAddForm(false); setEditingExpense(null); }}
        />
      ) : (
        <Button onClick={() => setShowAddForm(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Expense
        </Button>
      )}

      {/* Expenses List and Chart */}
      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Expense List</CardTitle></CardHeader>
          <CardContent>
            <ExpenseTable expenses={expenses} onEdit={setEditingExpense} onDelete={handleDelete} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Spending by Category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Expense Form Sub-component
const ExpenseForm = ({ onSubmit, initialData, onCancel }: { onSubmit: (data: Partial<Expense>) => void, initialData: Expense | null, onCancel: () => void }) => {
  const [formData, setFormData] = useState<Partial<Expense>>(initialData || { item_name: '', category: '', amount: 0 });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  return (
    <Card>
      <CardHeader><CardTitle>{initialData ? 'Edit Expense' : 'Add New Expense'}</CardTitle></CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <Input placeholder="Expense Name" value={formData.item_name} onChange={e => setFormData({...formData, item_name: e.target.value})} required />
          <Input placeholder="Category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
          <Input type="number" placeholder="Amount" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})} required />
          <Input placeholder="Vendor (optional)" value={formData.vendor_name} onChange={e => setFormData({...formData, vendor_name: e.target.value})} />
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
          <Button type="submit">{initialData ? 'Update' : 'Save'} Expense</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

// Expense Table Sub-component
const ExpenseTable = ({ expenses, onEdit, onDelete }: { expenses: Expense[], onEdit: (exp: Expense) => void, onDelete: (id: string) => void }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Category</TableHead>
        <TableHead className="text-right">Amount</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {expenses.map(exp => (
        <TableRow key={exp.item_id}>
          <TableCell>{exp.item_name}</TableCell>
          <TableCell>{exp.category}</TableCell>
          <TableCell className="text-right">₹{exp.amount.toLocaleString()}</TableCell>
          <TableCell><Badge variant={exp.status === 'Paid' ? 'default' : 'secondary'}>{exp.status}</Badge></TableCell>
          <TableCell className="text-right">
            <Button variant="ghost" size="icon" onClick={() => onEdit(exp)}><Edit className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(exp.item_id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default BudgetManager;
