import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Landmark, Plus, DollarSign, CheckCircle, Search, FileText } from 'lucide-react';

export const FinanceSystem: React.FC = () => {
  const [feeStructures, setFeeStructures] = useState<any[]>([
    { id: '1', name: 'Tuition Fee', amount: 800 },
    { id: '2', name: 'Boarding Fee', amount: 500 },
    { id: '3', name: 'Development Levy', amount: 150 },
    { id: '4', name: 'Examination Fee', amount: 50 }
  ]);

  const [studentAccounts, setStudentAccounts] = useState<any[]>([
    { id: '1', name: 'Alice Smith', adm: 'ADM/2026/0001', due: 1500, paid: 1200, balance: 300 },
    { id: '2', name: 'Bob Jones', adm: 'ADM/2026/0002', due: 1500, paid: 1500, balance: 0 },
    { id: '3', name: 'Charlie Miller', adm: 'ADM/2026/0003', due: 1500, paid: 800, balance: 700 },
    { id: '4', name: 'Diana Watson', adm: 'ADM/2026/0004', due: 1500, paid: 500, balance: 1000 },
    { id: '5', name: 'Ethan Carter', adm: 'ADM/2026/0005', due: 1500, paid: 1500, balance: 0 }
  ]);

  const [recentPayments, setRecentPayments] = useState<any[]>([
    { id: '101', student: 'Alice Smith', amount: 400, method: 'Bank Transfer', ref: 'TXN-984392', date: '2026-06-20' },
    { id: '102', student: 'Charlie Miller', amount: 300, method: 'Mobile Money', ref: 'TXN-847291', date: '2026-06-22' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showPayForm, setShowPayForm] = useState(false);

  // Form Fields
  const [payStudentId, setPayStudentId] = useState('1');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('bank_transfer');
  const [payRef, setPayRef] = useState('');
  const [successReceipt, setSuccessReceipt] = useState<string | null>(null);

  useEffect(() => {
    const loadFinance = async () => {
      const { data: structures } = await supabase.from('fee_structures').select('*, fee_types(name)');
      if (structures && structures.length > 0) {
        const mapped = structures.map(s => ({ id: s.id, name: s.fee_types?.name, amount: s.amount }));
        setFeeStructures(mapped);
      }
    };
    loadFinance();
  }, []);

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(payAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const student = studentAccounts.find(s => s.id === payStudentId);
    if (!student) return;

    // Generate simulated receipt number
    const receiptNo = `REC-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Update student paid balance
    setStudentAccounts(studentAccounts.map(s => {
      if (s.id === payStudentId) {
        const newPaid = s.paid + amountNum;
        return { ...s, paid: newPaid, balance: s.due - newPaid };
      }
      return s;
    }));

    // Log payment record
    const newPayLog = {
      id: crypto.randomUUID(),
      student: student.name,
      amount: amountNum,
      method: payMethod.replace('_', ' '),
      ref: payRef || 'N/A',
      date: new Date().toISOString().split('T')[0]
    };

    setRecentPayments([newPayLog, ...recentPayments]);
    setSuccessReceipt(receiptNo);
    setShowPayForm(false);
    
    // Clear forms
    setPayAmount('');
    setPayRef('');

    setTimeout(() => {
      setSuccessReceipt(null);
    }, 5000);
  };

  const filteredAccounts = studentAccounts.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.adm.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="glass-panel p-6 flex justify-between items-center border border-[rgba(255,255,255,0.08)]">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Landmark className="w-5 h-5 text-indigo-400" />
            School Finance & Ledger Accounts
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Configure terminal fee requirements, search balance ledgers, log parents payments, issue invoices.
          </p>
        </div>
        <button
          onClick={() => setShowPayForm(!showPayForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Log Fee Payment</span>
        </button>
      </div>

      {successReceipt && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-4 rounded-xl flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle className="w-5 h-5 shrink-0 animate-pulse" />
            <span>Payment Logged Successfully!</span>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed pl-7">
            A serialized receipt has been generated: <span className="font-mono text-white bg-indigo-500/10 border border-indigo-500/25 px-2 py-0.5 rounded font-bold uppercase">{successReceipt}</span>. The student's statement accounts have been updated.
          </p>
        </div>
      )}

      {showPayForm && (
        <form onSubmit={handlePaymentSubmit} className="glass-panel p-6 rounded-2xl space-y-4 border-indigo-500/20">
          <h3 className="text-sm font-bold text-white">Record Student Payment</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase font-bold">Select Student</label>
              <select
                value={payStudentId}
                onChange={(e) => setPayStudentId(e.target.value)}
                className="w-full bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-gray-400 focus:outline-none"
              >
                {studentAccounts.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.adm})</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase font-bold">Payment Amount ($)</label>
              <input
                type="number"
                required
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="Amount (e.g. 500)"
                className="w-full bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase font-bold">Payment Method</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-gray-400 focus:outline-none"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash Payment</option>
                <option value="card">Credit/Debit Card</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase font-bold">Reference / Txn ID</label>
              <input
                type="text"
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                placeholder="Reference Code"
                className="w-full bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setShowPayForm(false)}
              className="px-4 py-2 border border-white/10 rounded-xl text-xs font-semibold text-white hover:bg-white/5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-xs font-bold cursor-pointer"
            >
              Log Transaction
            </button>
          </div>
        </form>
      )}

      {/* Grid: Fee Structures & Arrears Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Term Structure List */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            Standard Term Invoice
          </h3>
          <div className="space-y-3">
            {feeStructures.map(fee => (
              <div key={fee.id} className="p-3 bg-white/2 rounded-xl border border-white/5 flex justify-between items-center text-xs text-white">
                <span className="font-semibold text-gray-300">{fee.name}</span>
                <span className="font-bold text-indigo-400">${fee.amount}.00</span>
              </div>
            ))}
            <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl flex justify-between items-center text-xs font-bold text-white">
              <span>Term Total due</span>
              <span>$1,500.00</span>
            </div>
          </div>
        </div>

        {/* Arrears and Ledger Sheet */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-indigo-400" />
              Outstanding Arrears Ledgers
            </h3>
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search ledger..."
                className="w-full bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl pl-8 pr-3 py-1.5 text-[11px] text-white placeholder-gray-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-gray-500">
                  <th className="py-2.5 px-3 font-semibold uppercase">Student</th>
                  <th className="py-2.5 px-3 font-semibold uppercase">Total Due</th>
                  <th className="py-2.5 px-3 font-semibold uppercase">Total Paid</th>
                  <th className="py-2.5 px-3 font-semibold uppercase">Ledger Balance</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map(account => (
                  <tr key={account.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-bold text-white leading-none">{account.name}</p>
                      <span className="text-[10px] text-gray-500 mt-1 block">{account.adm}</span>
                    </td>
                    <td className="py-3 px-3 text-gray-300">${account.due}</td>
                    <td className="py-3 px-3 text-emerald-400 font-semibold">${account.paid}</td>
                    <td className={`py-3 px-3 font-black ${account.balance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      ${account.balance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
