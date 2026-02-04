
import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import API from '../../Api/Api';
import { FaWallet, FaHistory, FaArrowUp, FaArrowDown, FaRupeeSign, FaMoneyBillWave } from 'react-icons/fa';
import { useToast } from '../common/Toast';

const Wallet = () => {
    const { currency, convertPrice } = useContext(AppContext);
    const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    useEffect(() => {
        fetchWallet();
    }, []);

    const fetchWallet = async () => {
        try {
            const res = await API.get('/wallet');
            if (res.data.success) {
                setWallet(res.data.wallet);
            }
        } catch (error) {
            console.error("Failed to fetch wallet", error);
        }
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();
        if (!amount || amount <= 0) return toast.error("Enter valid amount");
        if (amount > wallet.balance) return toast.error("Insufficient balance");

        setLoading(true);
        try {
            const res = await API.post('/wallet/withdraw', { amount, upiId: "user@upi" }); // Hardcoded for now, can ask input
            if (res.data.success) {
                toast.success(res.data.message);
                setWallet(prev => ({ ...prev, balance: res.data.balance }));
                setAmount('');
                fetchWallet(); // Refresh to show new transaction
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Withdrawal failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 font-serif flex items-center gap-2">
                    <FaWallet className="text-[#FF8F9C]" /> My Wallet
                </h2>
            </div>

            {/* Balance Card */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-gray-400 font-medium tracking-wide uppercase text-sm mb-1">Total Balance</p>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight flex items-center gap-1">
                        {currency === 'USD' ? '$' : '₹'}
                        <span className="font-mono">{convertPrice(wallet.balance)}</span>
                    </h1>
                </div>
                
                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-20 w-32 h-32 bg-[#FF8F9C]/20 rounded-full blur-2xl"></div>
            </div>

            {/* Withdrawal Section */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaMoneyBillWave className="text-green-500" /> Withdraw Funds
                </h3>
                <form onSubmit={handleWithdraw} className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Amount</label>
                        <input 
                            type="number" 
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)} 
                            placeholder="0.00" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 outline-none focus:border-[#FF8F9C] transition-colors"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading || wallet.balance === 0}
                        className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? "Processing..." : "Withdraw"}
                    </button>
                </form>
                <p className="text-xs text-gray-400 mt-3 font-medium">
                    * Minimum withdrawal amount is {currency === 'USD' ? '$10' : '₹500'}. Requests are processed within 24 hours.
                </p>
            </div>

            {/* Transactions History */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <FaHistory className="text-gray-400" /> Transaction History
                </h3>

                {wallet.transactions.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium text-sm">No transactions yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                         {wallet.transactions.slice().reverse().map((txn, i) => (
                             <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between hover:shadow-sm transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${txn.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {txn.type === 'credit' ? <FaArrowDown /> : <FaArrowUp />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">{txn.description}</p>
                                        <p className="text-xs text-gray-500 font-medium">
                                            {new Date(txn.date).toLocaleDateString(undefined, {
                                                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className={`font-bold font-mono ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                    {txn.type === 'credit' ? '+' : '-'}{currency === 'USD' ? '$' : '₹'}{convertPrice(txn.amount)}
                                </div>
                             </div>
                         ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wallet;
