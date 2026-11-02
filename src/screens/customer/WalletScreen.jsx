// ==================== src/screens/customer/WalletScreen.jsx (EXACT MOBILE REPLICA) ====================
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  ArrowLeft, 
  RotateCw, 
  Wallet as WalletIcon, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  RefreshCw, 
  PlusCircle, 
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  X,
  CreditCard,
  ArrowUpRight
} from 'lucide-react';

const WalletScreen = () => {
  const navigate = useNavigate();
  const { user, activeRole } = useSelector((state) => state.auth);

  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amount, setAmount] = useState('');
  const [addingMoney, setAddingMoney] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Payout / Withdrawal state hooks for Vendor / Owner
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [requestingPayout, setRequestingPayout] = useState(false);
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' | 'payouts'
  const [payoutRequests, setPayoutRequests] = useState([]);

  useEffect(() => {
    loadWalletData();
  }, [activeRole]);

  const showToast = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
  };

  const loadWalletData = async () => {
    try {
      setLoading(true);

      // 1. Fetch wallet balance from backend
      const walletRes = await api.get('/wallet');
      let walletData = null;

      if (walletRes?.success && walletRes?.data?.wallet) {
        walletData = walletRes.data.wallet;
      } else if (walletRes?.data?.wallet) {
        walletData = walletRes.data.wallet;
      } else if (walletRes?.wallet) {
        walletData = walletRes.wallet;
      } else if (walletRes?.data?.data?.wallet) {
        walletData = walletRes.data.data.wallet;
      }

      if (walletData) {
        setWallet(walletData);
      } else {
        // Fallback default structure
        setWallet({
          balance: 0,
          totalAdded: 0,
          totalSpent: 0,
          isFrozen: false,
        });
      }

      // 2. Fetch transactions
      const txnRes = await api.get('/wallet/transactions?limit=50');
      let transactionsData = [];

      if (txnRes?.success && txnRes?.data?.transactions) {
        transactionsData = txnRes.data.transactions;
      } else if (txnRes?.data?.transactions) {
        transactionsData = txnRes.data.transactions;
      } else if (txnRes?.transactions) {
        transactionsData = txnRes.transactions;
      } else if (txnRes?.data?.data?.transactions) {
        transactionsData = txnRes.data.data.transactions;
      }

      // Role filtering matching mobile app logic
      if (transactionsData && transactionsData.length > 0) {
        if (activeRole === 'vendor') {
          transactionsData = transactionsData.filter(
            (t) => t.source === 'food_booking' || t.purpose === 'withdrawal'
          );
        } else if (activeRole === 'provider') {
          transactionsData = transactionsData.filter(
            (t) => t.purpose === 'service' || t.source === 'service' || t.purpose === 'withdrawal'
          );
        }
      }

      setTransactions(transactionsData || []);

      // 3. Payouts if vendor
      if (activeRole === 'vendor' || user?.isFoodVendor) {
        try {
          const payoutsRes = await api.get('/wallet/payouts');
          const payoutsData = payoutsRes?.success && payoutsRes?.data?.settlements
            ? payoutsRes.data.settlements
            : payoutsRes?.settlements || [];
          setPayoutRequests(payoutsData);
        } catch {
          // ignore
        }
      }
    } catch (error) {
      console.error('Wallet loading error:', error);
      showToast('error', error.message || 'Failed to connect to wallet server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddMoney = async () => {
    const addAmount = parseFloat(amount);
    if (!addAmount || addAmount <= 0) {
      showToast('error', 'Please enter a valid amount');
      return;
    }

    try {
      setAddingMoney(true);
      const response = await api.post('/wallet/add-money', {
        amount: addAmount,
        paymentMethod: 'upi',
      });

      if (response?.success || response?.data?.success) {
        showToast('success', `Successfully added ₹${addAmount} to Wallet!`);
        setAmount('');
        setShowAddMoney(false);
        loadWalletData();
      } else {
        throw new Error(response?.message || 'Failed to add money');
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || error.message || 'Payment failed');
    } finally {
      setAddingMoney(false);
    }
  };

  const handleRequestPayout = async () => {
    const amt = parseFloat(payoutAmount);
    if (!amt || amt <= 0) {
      showToast('error', 'Please enter a valid amount');
      return;
    }
    if (wallet && amt > wallet.balance) {
      showToast('error', 'You cannot withdraw more than your available earnings');
      return;
    }

    try {
      setRequestingPayout(true);
      const response = await api.post('/wallet/payout-request', {
        amount: amt,
        bankDetails: bankDetails.trim() || 'UPI Transfer',
      });

      if (response.success || response.data?.success) {
        showToast('success', 'Your payout request has been submitted to Admin!');
        setShowPayoutModal(false);
        setPayoutAmount('');
        loadWalletData();
      } else {
        throw new Error(response.message || 'Failed to submit payout request');
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || error.message || 'Payout failed');
    } finally {
      setRequestingPayout(false);
    }
  };

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  const getTransactionIcon = (type) => {
    if (type === 'credit' || type === 'transfer_in') {
      return <ArrowDownCircle size={24} color="#10b981" />;
    }
    if (type === 'debit' || type === 'transfer_out') {
      return <ArrowUpCircle size={24} color="#ef4444" />;
    }
    return <RefreshCw size={24} color="#f59e0b" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isVendor = user?.role === 'vendor' || activeRole === 'vendor' || user?.isFoodVendor;
  const isOwner = user?.role === 'owner' || activeRole === 'owner';
  const isEarningRole = isVendor || isOwner || activeRole === 'provider';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: '#f8fafc' }}>
      {/* ─── Top Native Mobile Header ─────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 80,
        boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
      }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
        >
          <ArrowLeft size={22} />
        </button>
        <span style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
          {isOwner ? 'Fleet & Yatra Earnings' : isVendor ? 'Vendor Earnings' : 'My Wallet'}
        </span>
        <button 
          onClick={loadWalletData} 
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
          title="Refresh"
        >
          <RotateCw size={20} className={loading ? 'spin-anim' : ''} />
        </button>
      </div>

      {/* Toast Feedback */}
      {feedback.message && (
        <div style={{
          margin: '12px 16px 0',
          padding: '10px 14px',
          borderRadius: '10px',
          background: feedback.type === 'error' ? '#fef2f2' : '#ecfdf5',
          border: `1px solid ${feedback.type === 'error' ? '#fecaca' : '#a7f3d0'}`,
          color: feedback.type === 'error' ? '#b91c1c' : '#047857',
          fontSize: '13px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          {feedback.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* ─── Scrollable Wallet Body ─────────────────────────────────────────── */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Balance Card (Exact Gradient & Layout from React Native) */}
        <div style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
          borderRadius: '20px',
          padding: '22px 20px',
          color: '#ffffff',
          boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <WalletIcon size={22} color="#ffffff" />
            </div>
            <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500 }}>
              {isEarningRole ? 'Total Available Earnings' : 'Available Balance'}
            </span>
          </div>

          <div style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '16px' }}>
            ₹{loading ? '...' : (wallet?.balance?.toFixed(2) || '0.00')}
          </div>

          {/* Stats Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            padding: '10px 16px',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.75)' }}>Total Added</span>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>₹{(wallet?.totalAdded || 0).toFixed(2)}</span>
            </div>
            <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.25)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.75)' }}>Total Spent</span>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>₹{(wallet?.totalSpent || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Frozen Warning */}
          {wallet?.isFrozen && (
            <div style={{
              background: '#fef3c7',
              color: '#92400e',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '12px',
            }}>
              <AlertTriangle size={14} color="#d97706" />
              <span>Wallet is frozen: {wallet.freezeReason || 'Under Review'}</span>
            </div>
          )}

          {/* Action Button: Add Money and/or Request Payout */}
          {isEarningRole ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => setShowPayoutModal(true)}
                disabled={wallet?.isFrozen || (wallet?.balance || 0) <= 0}
                style={{
                  background: '#ffffff',
                  color: '#4f46e5',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: (wallet?.isFrozen || (wallet?.balance || 0) <= 0) ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                }}
              >
                <ArrowUpRight size={16} color="#4f46e5" />
                <span>Withdraw Payout</span>
              </button>

              <button
                onClick={() => setShowAddMoney(!showAddMoney)}
                disabled={wallet?.isFrozen}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '12px',
                  padding: '12px',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: wallet?.isFrozen ? 'not-allowed' : 'pointer',
                }}
              >
                <PlusCircle size={16} color="#ffffff" />
                <span>Top-Up</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddMoney(!showAddMoney)}
              disabled={wallet?.isFrozen}
              style={{
                background: '#ffffff',
                color: '#4f46e5',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                fontWeight: 700,
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: wallet?.isFrozen ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                width: '100%',
              }}
            >
              <PlusCircle size={18} color="#4f46e5" />
              <span>{showAddMoney ? 'Close Top-Up' : 'Add Money'}</span>
            </button>
          )}
        </div>

        {/* ─── Add Money Section (Animated Accordion) ────────────────────────── */}
        {showAddMoney && !wallet?.isFrozen && (
          <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '20px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Enter Amount</span>

            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', fontWeight: 700, color: '#64748b' }}>₹</span>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '12px 14px 12px 34px',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#0f172a',
                  outline: 'none',
                }}
              />
            </div>

            {/* Quick Amounts Chips */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {quickAmounts.map((amt) => {
                const isSelected = amount === amt.toString();
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt.toString())}
                    style={{
                      background: isSelected ? '#6366f1' : '#f1f5f9',
                      color: isSelected ? '#ffffff' : '#334155',
                      border: isSelected ? '1px solid #6366f1' : '1px solid #e2e8f0',
                      borderRadius: '20px',
                      padding: '8px 14px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    +₹{amt}
                  </button>
                );
              })}
            </div>

            {/* Limits Info Box */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '12px',
              color: '#64748b',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}>
              <span>• Daily Limit: ₹50,000</span>
              <span>• Max Balance: ₹2,00,000</span>
            </div>

            <button
              onClick={handleAddMoney}
              disabled={addingMoney || !amount}
              style={{
                background: '#6366f1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '14px',
                fontWeight: 700,
                fontSize: '15px',
                cursor: addingMoney ? 'wait' : 'pointer',
                opacity: addingMoney || !amount ? 0.6 : 1,
              }}
            >
              {addingMoney ? 'Processing Payment...' : `Add ₹${amount || '0'}`}
            </button>
          </div>
        )}

        {/* ─── Transactions List ──────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              {isVendor ? 'Earnings History' : 'Recent Transactions'}
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {transactions.length} record{transactions.length === 1 ? '' : 's'}
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
              Loading transactions from server...
            </div>
          ) : transactions.length === 0 ? (
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '40px 20px',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Briefcase size={26} color="#94a3b8" />
              </div>
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#334155' }}>No transactions yet</span>
              <span style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '240px' }}>
                Your ticket cashbacks, recharges, and trip payments will appear here.
              </span>
            </div>
          ) : (
            transactions.map((txn, index) => {
              const isCredit = txn.type === 'credit' || txn.type === 'transfer_in';
              const isDebit = txn.type === 'debit' || txn.type === 'transfer_out';

              return (
                <div
                  key={txn._id || txn.id || index}
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    padding: '14px 16px',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: isCredit ? '#ecfdf5' : isDebit ? '#fef2f2' : '#fffbeb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {getTransactionIcon(txn.type)}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                        {txn.title || txn.description || 'Wallet Transaction'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        {formatDate(txn.createdAt || txn.date)}
                      </span>
                      {txn._id && (
                        <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>
                          ID: {txn._id.slice(-8).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: isCredit ? '#10b981' : isDebit ? '#ef4444' : '#f59e0b',
                    }}>
                      {isCredit ? '+' : isDebit ? '-' : ''}₹{txn.amount}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: txn.status === 'completed' ? '#ecfdf5' : '#fef3c7',
                      color: txn.status === 'completed' ? '#047857' : '#b45309',
                    }}>
                      {txn.status || 'COMPLETED'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* ─── Payout Modal for Vendors / Owners ─────────────────────────────── */}
      {showPayoutModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '20px',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '24px',
            width: '100%',
            maxWidth: '380px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>Request Payout</span>
              <button onClick={() => setShowPayoutModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                Withdrawal Amount (Max: ₹{wallet?.balance?.toFixed(2) || '0.00'})
              </label>
              <input
                type="number"
                placeholder="Enter amount"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '16px',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                Bank Account / UPI ID
              </label>
              <input
                type="text"
                placeholder="e.g. UPI: name@upi or A/C number"
                value={bankDetails}
                onChange={(e) => setBankDetails(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <button
              onClick={handleRequestPayout}
              disabled={requestingPayout || !payoutAmount}
              style={{
                background: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '14px',
                fontWeight: 700,
                fontSize: '15px',
                cursor: requestingPayout ? 'wait' : 'pointer',
                marginTop: '6px',
              }}
            >
              {requestingPayout ? 'Submitting...' : 'Confirm Withdrawal'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletScreen;
