// Payment gateway seam. Today: simulated. Later: create the order on the server (POST /api/payments/razorpay/order),
// pass the returned id to getRazorpayOptions(), open window.Razorpay(options), then verify the signature on the server.
import { wait } from './db'
export const PAYMENT_METHODS = [
  { id: 'Razorpay', label: 'Razorpay', hint: 'Cards, UPI, wallets and more via Razorpay Checkout', gateway: true },
  { id: 'UPI', label: 'UPI', hint: 'Pay with any UPI app' },
  { id: 'Credit/Debit Card', label: 'Credit / Debit Card', hint: 'Visa, Mastercard, RuPay, Amex' },
  { id: 'Net Banking', label: 'Net Banking', hint: 'All major Indian banks' },
  { id: 'Cash on Delivery', label: 'Cash on Delivery', hint: '₹40 handling fee · cash or UPI at your door' }]
export const BANKS = ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra Bank', 'Yes Bank']
export const getRazorpayOptions = ({ amount, orderRef, customer }) => ({ key: import.meta.env?.VITE_RAZORPAY_KEY_ID || 'rzp_test_xxxxxxxx', amount: Math.round(amount * 100), currency: 'INR', name: 'BEAUTIQ',
  description: `Order ${orderRef}`, order_id: null /* from server */, prefill: { name: customer?.name, email: customer?.email, contact: customer?.phone }, theme: { color: '#A8665A' } })
export const createPayment = async ({ method, amount, details = {} }) => { await wait(null, 1400)
  if (method === 'Credit/Debit Card' && String(details.number || '').replace(/\s/g, '').endsWith('0002')) { const e = new Error('Your card was declined by the bank. Try another card or payment method.'); e.code = 'DECLINED'; throw e }
  return { ok: true, paymentId: `pay_${Math.random().toString(36).slice(2, 12)}`, method, amount, status: method === 'Cash on Delivery' ? 'Pending' : 'Paid' } }
