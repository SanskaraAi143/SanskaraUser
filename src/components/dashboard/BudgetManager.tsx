
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, DollarSign, Edit, PieChart, FileText, Download } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

type BudgetCategory = 'venue' | 'catering' | 'decor' | 'attire' | 'photography' | 'music' | 'transportation' | 'priest' | 'gifts' | 'other';

type Expense = {
  id: string;
  name: string;
  category: BudgetCategory;
  amount: number;
  vendor: string;
  paid: boolean;
};

const BudgetManager = () => {
  const [totalBudget, setTotalBudget] = useState(25000);
  const [editingBudget, setEditingBudget] = useState(false);
  const [newBudgetAmount, setNewBudgetAmount] = useState(totalBudget.toString());
  
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: '1',
      name: 'Venue Deposit',
      category: 'venue',
      amount: 5000,
      vendor: 'Grand Ballroom',
      paid: true
    },
    {
      id: '2',
      name: 'Catering Advance',
      category: 'catering',
      amount: 3500,
      vendor: 'Spice Route Catering',
      paid: true
    },
    {
      id: '3',
      name: 'Photography Package',
      category: 'photography',
      amount: 2500,
      vendor: 'Memories Studios',
      paid: true
    },
    {
      id: '4',
      name: 'Decor & Mandap',
      category: 'decor',
      amount: 3000,
      vendor: 'Floral Elegance',
      paid: false
    },
    {
      id: '5',
      name: 'DJ & Sound System',
      category: 'music',
      amount: 1500,
      vendor: 'Rhythm Masters',
      paid: false
    }
  ]);
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  const [formData, setFormData] = useState<Omit<Expense, 'id'>>({
    name: '',
    category: 'venue',
    amount: 0,
    vendor: '',
    paid: false
  });
  
  const { toast } = useToast();
  
  const handleAddExpense = () => {
    const newExpense: Expense = {
      ...formData,
      id: Date.now().toString()
    };
    
    setExpenses(prev => [...prev, newExpense]);
    resetForm();
    setShowAddDialog(false);
    
    toast({
      title: "Expense added",
      description: `Added ${newExpense.name} to your budget.`
    });
  };
  
  const handleUpdateExpense = () => {
    if (!editingExpense) return;
    
    setExpenses(prev => prev.map(expense => 
      expense.id === editingExpense.id ? { ...formData, id: expense.id } : expense
    ));
    
    resetForm();
    setEditingExpense(null);
    
    toast({
      title: "Expense updated",
      description: "Your expense has been updated successfully."
    });
  };
  
  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
    
    toast({
      title: "Expense deleted",
      description: "The expense has been removed from your budget."
    });
  };
  
  const handleEditExpense = (expense: Expense) => {
    setFormData({
      name: expense.name,
      category: expense.category,
      amount: expense.amount,
      vendor: expense.vendor,
      paid: expense.paid
    });
    
    setEditingExpense(expense);
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      category: 'venue',
      amount: 0,
      vendor: '',
      paid: false
    });
  };
  
  const handleDialogClose = () => {
    resetForm();
    setEditingExpense(null);
    setShowAddDialog(false);
  };
  
  const handleUpdateBudget = () => {
    const newAmount = parseInt(newBudgetAmount);
    if (!isNaN(newAmount) && newAmount > 0) {
      setTotalBudget(newAmount);
      toast({
        title: "Budget updated",
        description: `Your total budget has been updated to $${newAmount.toLocaleString()}.`
      });
    }
    setEditingBudget(false);
  };
  
  // Calculate budget statistics
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = totalBudget - totalSpent;
  const percentSpent = (totalSpent / totalBudget) * 100;
  
  // Group expenses by category for the chart
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(expense => {
    if (!categoryTotals[expense.category]) {
      categoryTotals[expense.category] = 0;
    }
    categoryTotals[expense.category] += expense.amount;
  });
  
  const pieChartData = Object.entries(categoryTotals).map(([category, amount]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: amount
  }));
  
  // Chart colors
  const COLORS = ['#D62F32', '#F4A261', '#F9C74F', '#90BE6D', '#43AA8B', '#577590', '#277DA1', '#9C27B0', '#673AB7', '#3F51B5'];
  
  const categoryLabels: Record<BudgetCategory, string> = {
    venue: 'Venue & Ceremony',
    catering: 'Catering & Food',
    decor: 'Decorations & Flowers',
    attire: 'Attire & Accessories',
    photography: 'Photography & Video',
    music: 'Music & Entertainment',
    transportation: 'Transportation',
    priest: 'Priest & Rituals',
    gifts: 'Favors & Gifts',
    other: 'Miscellaneous'
  };

  return (
    <div className="space-y-6">
      {/* Budget Overview Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Budget Overview</CardTitle>
              <CardDescription>Track your wedding expenses</CardDescription>
            </div>
            
            {editingBudget ? (
              <div className="flex items-center space-x-2">
                <Input
                  value={newBudgetAmount}
                  onChange={(e) => setNewBudgetAmount(e.target.value)}
                  type="number"
                  className="w-32"
                />
                <Button size="sm" onClick={handleUpdateBudget}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingBudget(false)}>Cancel</Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setEditingBudget(true)}
              >
                <Edit size={14} className="mr-1" />
                Edit Budget
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">${totalBudget.toLocaleString()}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Spent So Far</p>
              <p className="text-2xl font-bold text-wedding-red">${totalSpent.toLocaleString()}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Remaining</p>
              <p className="text-2xl font-bold text-green-600">${remaining.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>{percentSpent.toFixed(0)}% of budget used</span>
              <span>${totalSpent.toLocaleString()} / ${totalBudget.toLocaleString()}</span>
            </div>
            <Progress value={percentSpent} className="h-2" />
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64">
              <h3 className="text-sm font-medium mb-3 flex items-center">
                <PieChart size={16} className="mr-1" />
                Expense Breakdown
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, null]} />
                  <Legend />
                </RechartsChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium mb-3 flex items-center">
                <FileText size={16} className="mr-1" />
                Budget Summary
              </h3>
              <div className="space-y-3">
                {Object.entries(categoryTotals).map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center text-sm">
                    <span className="capitalize">{categoryLabels[category as BudgetCategory]}</span>
                    <div className="flex items-center">
                      <span className="mr-2">${amount.toLocaleString()}</span>
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[Object.keys(categoryTotals).indexOf(category) % COLORS.length] }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="mt-4 w-full">
                <Download size={16} className="mr-1" />
                Export Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Expenses List Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>Manage your wedding expenses</CardDescription>
          </div>
          <Button 
            onClick={() => {
              resetForm();
              setShowAddDialog(true);
            }}
          >
            <Plus size={16} className="mr-1" />
            Add Expense
          </Button>
        </CardHeader>
        
        <CardContent>
          <div className="border rounded-md divide-y">
            <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50 font-medium text-sm">
              <div className="col-span-4">Item</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-2">Vendor</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1"></div>
            </div>
            
            {expenses.length > 0 ? (
              expenses.map(expense => (
                <div key={expense.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center text-sm">
                  <div className="col-span-4 font-medium">{expense.name}</div>
                  <div className="col-span-2 capitalize">{expense.category}</div>
                  <div className="col-span-2">${expense.amount.toLocaleString()}</div>
                  <div className="col-span-2">{expense.vendor}</div>
                  <div className="col-span-1">
                    <span className={`px-2 py-1 rounded-full text-xs ${expense.paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {expense.paid ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEditExpense(expense)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteExpense(expense.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No expenses added yet. Click "Add Expense" to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Add/Edit Expense Dialog */}
      <Dialog open={showAddDialog || editingExpense !== null} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Expense Name</label>
              <Input 
                placeholder="e.g., Venue Deposit" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select 
                value={formData.category} 
                onValueChange={(value: BudgetCategory) => setFormData({...formData, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount ($)</label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <Input 
                  type="number" 
                  className="pl-8"
                  placeholder="0.00" 
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Vendor/Provider</label>
              <Input 
                placeholder="Vendor name" 
                value={formData.vendor}
                onChange={(e) => setFormData({...formData, vendor: e.target.value})}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="payment-status" 
                checked={formData.paid}
                onChange={(e) => setFormData({...formData, paid: e.target.checked})}
                className="rounded border-gray-300 text-wedding-red focus:ring-wedding-red"
              />
              <label htmlFor="payment-status" className="text-sm font-medium">Mark as paid</label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>Cancel</Button>
            <Button 
              onClick={editingExpense ? handleUpdateExpense : handleAddExpense}
              disabled={!formData.name || formData.amount <= 0}
            >
              {editingExpense ? 'Update' : 'Add'} Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BudgetManager;
