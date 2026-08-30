"use client";
/* eslint-disable jsx-a11y/no-autofocus */

import { useMemo, useState } from "react";
import "./payment.css";

export type PaymentOrder = {
  id: string;
  diamonds: number;
  bonus: number;
  amount: number;
  method: string;
  status: "Completed" | "Refund review" | "Failed";
  date: string;
};

export const initialPaymentOrders: PaymentOrder[] = [
  { id: "SADA-84219", diamonds: 500, bonus: 0, amount: 1350, method: "Easypaisa", status: "Completed", date: "Aug 27 · 21:18" },
  { id: "SADA-83604", diamonds: 120, bonus: 0, amount: 560, method: "JazzCash", status: "Completed", date: "Aug 19 · 18:42" },
  { id: "SADA-82977", diamonds: 300, bonus: 20, amount: 1350, method: "Visa •••• 4242", status: "Failed", date: "Aug 12 · 14:09" },
];

type PaymentView = "packs" | "methods" | "add-method" | "review" | "verify" | "processing" | "success" | "failed" | "history" | "receipt" | "refund";
type Pack = { diamonds: number; bonus: number; amount: number; label: string };
type PaymentMethod = { id: string; symbol: string; meta: string };

const packs: Pack[] = [
  { diamonds: 60, bonus: 0, amount: 280, label: "Starter" },
  { diamonds: 300, bonus: 20, amount: 1350, label: "Popular" },
  { diamonds: 680, bonus: 60, amount: 2850, label: "Extra value" },
  { diamonds: 1480, bonus: 180, amount: 5950, label: "Best value" },
];

const initialMethods: PaymentMethod[] = [
  { id: "Easypaisa", symbol: "E", meta: "Mobile wallet · +92 300 ••• 281" },
  { id: "JazzCash", symbol: "J", meta: "Mobile wallet · +92 321 ••• 804" },
  { id: "Visa •••• 4242", symbol: "V", meta: "Bank card · Expires 08/28" },
];

function PaymentHeader({ title, meta, onBack, action }: { title: string; meta: string; onBack: () => void; action?: React.ReactNode }) {
  return <div className="feature-header"><button className="screen-back" onClick={onBack} aria-label="Back">‹</button><div><small>{meta}</small><h1>{title}</h1></div>{action ?? <span />}</div>;
}

export function PaymentCenterScreen({ balance, orders, onBalanceChange, onOrdersChange, onBack, notify }: {
  balance: number;
  orders: PaymentOrder[];
  onBalanceChange: (balance: number) => void;
  onOrdersChange: (orders: PaymentOrder[]) => void;
  onBack: () => void;
  notify: (message: string) => void;
}) {
  const [view, setView] = useState<PaymentView>("packs");
  const [pack, setPack] = useState<Pack>(packs[1]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(initialMethods);
  const [method, setMethod] = useState(initialMethods[0].id);
  const [newMethodType, setNewMethodType] = useState<"wallet" | "card">("wallet");
  const [newMethodValue, setNewMethodValue] = useState("");
  const [consent, setConsent] = useState(true);
  const [otp, setOtp] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<PaymentOrder | null>(orders[0] ?? null);
  const [refundReason, setRefundReason] = useState("Purchase made by mistake");
  const [refundNote, setRefundNote] = useState("");
  const totalDiamonds = pack.diamonds + pack.bonus;

  const recentOrders = useMemo(() => orders.slice(0, 3), [orders]);
  const backFromFlow = () => {
    if (view === "packs") onBack();
    else if (["history", "success", "failed"].includes(view)) setView("packs");
    else if (view === "receipt") setView("history");
    else if (view === "refund") setView("receipt");
    else if (view === "add-method") setView("methods");
    else if (view === "methods") setView("packs");
    else if (view === "verify") setView("review");
    else setView("packs");
  };

  const completePayment = () => {
    setView("processing");
    window.setTimeout(() => {
      const order: PaymentOrder = {
        id: `SADA-${String(Date.now()).slice(-5)}`,
        diamonds: pack.diamonds,
        bonus: pack.bonus,
        amount: pack.amount,
        method,
        status: "Completed",
        date: "Just now",
      };
      onBalanceChange(balance + totalDiamonds);
      onOrdersChange([order, ...orders]);
      setSelectedOrder(order);
      setView("success");
      notify(`${totalDiamonds} Diamonds added securely`);
    }, 850);
  };

  const submitRefund = () => {
    if (!selectedOrder) return;
    const updated = orders.map(order => order.id === selectedOrder.id ? { ...order, status: "Refund review" as const } : order);
    const nextOrder = updated.find(order => order.id === selectedOrder.id) ?? selectedOrder;
    onOrdersChange(updated);
    setSelectedOrder(nextOrder);
    setView("receipt");
    notify("Refund request submitted · review within 1–3 days");
  };

  const addPaymentMethod = () => {
    const digits = newMethodValue.replace(/\D/g, "");
    if (newMethodType === "wallet" && digits.length < 10) return;
    if (newMethodType === "card" && digits.length < 4) return;
    const added: PaymentMethod = newMethodType === "wallet"
      ? { id: `Easypaisa ••• ${digits.slice(-3)}`, symbol: "E", meta: `Mobile wallet · +92 ••• ${digits.slice(-3)}` }
      : { id: `Visa •••• ${digits.slice(-4)}`, symbol: "V", meta: "Bank card · New payment method" };
    setPaymentMethods(items => [...items, added]);
    setMethod(added.id);
    setNewMethodValue("");
    setView("methods");
    notify("Payment method added and selected");
  };

  if (view === "processing") return <div className="feature-screen payment-screen payment-state"><div className="payment-loader"><i/><i/><i/></div><h1>Confirming payment</h1><p>Keep SADA open while the provider confirms your payment. Do not pay the same request twice.</p><div className="payment-state-order"><span>Order amount</span><strong>PKR {pack.amount.toLocaleString()}</strong><small>{method} · Secure channel</small></div></div>;

  if (view === "success") return <div className="feature-screen payment-screen payment-state"><span className="payment-state-icon success">✓</span><small>Payment successful</small><h1>{totalDiamonds.toLocaleString()} Diamonds added</h1><p>Your balance is updated. The receipt and provider reference are saved in Payment history.</p><div className="payment-state-order"><span>New balance</span><strong>◆ {balance.toLocaleString()}</strong><small>Order {selectedOrder?.id}</small></div><button className="payment-primary" onClick={() => setView("receipt")}>View receipt</button><button className="payment-secondary" onClick={onBack}>Return to Wallet</button></div>;

  if (view === "failed") return <div className="feature-screen payment-screen payment-state"><span className="payment-state-icon failed">!</span><small>Payment not completed</small><h1>No money was charged</h1><p>The provider did not authorize this request. Check your wallet balance or choose another payment method.</p><div className="payment-state-order"><span>Order status</span><strong>Declined</strong><small>Reference SADA-TRY-2048</small></div><button className="payment-primary" onClick={() => setView("review")}>Try again</button><button className="payment-secondary" onClick={() => setView("packs")}>Change pack or method</button></div>;

  if (view === "history") return <div className="feature-screen payment-screen"><PaymentHeader title="Payment history" meta="Receipts and support" onBack={backFromFlow}/><div className="payment-summary"><span><small>Successful this month</small><strong>PKR {orders.filter(order => order.status === "Completed").reduce((sum, order) => sum + order.amount, 0).toLocaleString()}</strong></span><span><small>Refund review</small><strong>{orders.filter(order => order.status === "Refund review").length}</strong></span></div><div className="payment-filter"><button className="active">All</button><button>Successful</button><button>Refunds</button><button>Failed</button></div><div className="payment-orders">{orders.map(order => <button key={order.id} onClick={() => { setSelectedOrder(order); setView("receipt"); }}><span className={`payment-order-mark ${order.status.toLowerCase().replace(" ", "-")}`}>{order.status === "Completed" ? "✓" : order.status === "Failed" ? "!" : "…"}</span><span><strong>◆ {(order.diamonds + order.bonus).toLocaleString()} Diamonds</strong><small>{order.date} · {order.method}</small><em>{order.id}</em></span><b>PKR {order.amount.toLocaleString()}<small>{order.status}</small></b></button>)}</div></div>;

  if (view === "receipt" && selectedOrder) return <div className="feature-screen payment-screen"><PaymentHeader title="Payment receipt" meta={selectedOrder.status} onBack={backFromFlow} action={<button className="payment-head-action" onClick={() => notify("Receipt link copied")}>↗</button>}/><div className="receipt-hero"><span className={selectedOrder.status === "Completed" ? "success" : selectedOrder.status === "Failed" ? "failed" : "review"}>{selectedOrder.status === "Completed" ? "✓" : selectedOrder.status === "Failed" ? "!" : "…"}</span><small>{selectedOrder.status}</small><strong>PKR {selectedOrder.amount.toLocaleString()}</strong><p>{selectedOrder.diamonds + selectedOrder.bonus} Diamonds · {selectedOrder.method}</p></div><div className="receipt-details"><div><span>Order number</span><strong>{selectedOrder.id}</strong></div><div><span>Provider reference</span><strong>PK-{selectedOrder.id.slice(-5)}-92</strong></div><div><span>Created</span><strong>{selectedOrder.date}</strong></div><div><span>Channel fee</span><strong>Included</strong></div><div><span>Diamonds</span><strong>{selectedOrder.diamonds}</strong></div><div><span>Bound bonus</span><strong>{selectedOrder.bonus}</strong></div></div><div className="payment-protection"><span>⌁</span><p><strong>Purchase protection</strong><small>Never share an OTP. SADA support will not ask you to pay outside this receipt.</small></p></div>{selectedOrder.status !== "Failed" && <button className="payment-secondary full" onClick={() => setView("refund")}>{selectedOrder.status === "Refund review" ? "View refund request" : "Request refund or report a problem"}</button>}</div>;

  if (view === "refund" && selectedOrder) return <div className="feature-screen payment-screen"><PaymentHeader title="Refund request" meta={selectedOrder.id} onBack={backFromFlow}/><div className="refund-order"><span>◆</span><p><strong>{selectedOrder.diamonds + selectedOrder.bonus} Diamonds</strong><small>PKR {selectedOrder.amount.toLocaleString()} · {selectedOrder.method}</small></p></div><div className="payment-section-title"><h2>What happened?</h2><small>Choose one</small></div><div className="refund-reasons">{["Purchase made by mistake", "Diamonds not received", "Duplicate payment", "Payment not authorized"].map(reason => <button key={reason} className={refundReason === reason ? "active" : ""} onClick={() => setRefundReason(reason)}><span>{refundReason === reason ? "✓" : ""}</span>{reason}</button>)}</div><label className="payment-note">Details<textarea value={refundNote} onChange={event => setRefundNote(event.target.value)} placeholder="Add provider messages or other details"/></label><div className="refund-policy"><b>Before you submit</b><p>Refund eligibility depends on item consumption, payment status and provider rules. Promotional bonus Diamonds are removed when a refund is approved.</p></div><button className="payment-primary" onClick={submitRefund}>{selectedOrder.status === "Refund review" ? "Update request" : "Submit refund request"}</button></div>;

  if (view === "methods") return <div className="feature-screen payment-screen"><PaymentHeader title="Payment methods" meta="Saved securely" onBack={backFromFlow}/><div className="method-security"><span>⌁</span><p><strong>Your payment details stay protected</strong><small>SADA stores provider tokens, never your full card or wallet credentials.</small></p></div><div className="managed-methods">{paymentMethods.map(item => <article key={item.id} className={method === item.id ? "active" : ""}><button className="managed-method-main" onClick={() => { setMethod(item.id); notify(`${item.id} selected`); }}><span>{item.symbol}</span><p><strong>{item.id}</strong><small>{item.meta}</small></p><b>{method === item.id ? "Default" : "Use"}</b></button><button className="managed-method-remove" disabled={paymentMethods.length === 1} aria-label={`Remove ${item.id}`} onClick={() => { const next = paymentMethods.filter(value => value.id !== item.id); setPaymentMethods(next); if (method === item.id) setMethod(next[0].id); notify("Payment method removed"); }}>×</button></article>)}</div><button className="payment-primary" onClick={() => setView("add-method")}>+ Add payment method</button><p className="payment-provider-note">Demo mode: no banking details leave this device and no real charge is created.</p></div>;

  if (view === "add-method") {
    const digits = newMethodValue.replace(/\D/g, "");
    const valid = newMethodType === "wallet" ? digits.length >= 10 : digits.length >= 4;
    return <div className="feature-screen payment-screen"><PaymentHeader title="Add payment method" meta="Provider-protected setup" onBack={backFromFlow}/><div className="method-type-tabs"><button className={newMethodType === "wallet" ? "active" : ""} onClick={() => { setNewMethodType("wallet"); setNewMethodValue(""); }}>Mobile wallet</button><button className={newMethodType === "card" ? "active" : ""} onClick={() => { setNewMethodType("card"); setNewMethodValue(""); }}>Bank card</button></div><div className="add-method-visual"><span>{newMethodType === "wallet" ? "E" : "V"}</span><strong>{newMethodType === "wallet" ? "Easypaisa / JazzCash" : "Visa / Mastercard"}</strong><small>{newMethodType === "wallet" ? "Verification continues with your mobile wallet provider." : "Only the last four digits are retained in this prototype."}</small></div><label className="add-method-field">{newMethodType === "wallet" ? "Pakistan mobile number" : "Card number"}<input autoFocus inputMode="numeric" value={newMethodValue} onChange={event => setNewMethodValue(event.target.value.replace(/\D/g, "").slice(0, newMethodType === "wallet" ? 11 : 16))} placeholder={newMethodType === "wallet" ? "03XX XXXXXXX" : "•••• •••• •••• 4242"}/><small>{newMethodType === "wallet" ? "Use the number registered with your wallet." : "A real integration will use Stripe Checkout or Payment Element tokenization."}</small></label><button className="payment-primary" disabled={!valid} onClick={addPaymentMethod}>Save and use method</button><button className="payment-text" onClick={backFromFlow}>Cancel</button></div>;
  }

  if (view === "review") return <div className="feature-screen payment-screen"><PaymentHeader title="Review payment" meta="No hidden charges" onBack={backFromFlow}/><div className="review-pack"><span>◆</span><p><small>Diamond recharge</small><strong>{totalDiamonds.toLocaleString()} Diamonds</strong><em>{pack.bonus > 0 ? `${pack.diamonds} purchased + ${pack.bonus} bound bonus` : "Purchased Diamonds"}</em></p><b>PKR {pack.amount.toLocaleString()}</b></div><div className="receipt-details review-details"><div><span>Payment method</span><strong>{method}</strong></div><div><span>Channel fee</span><strong>PKR 0</strong></div><div><span>Tax</span><strong>Included</strong></div><div><span>Total to pay</span><strong>PKR {pack.amount.toLocaleString()}</strong></div></div><div className="payment-protection"><span>⌁</span><p><strong>SADA protected payment</strong><small>Encrypted request · Provider confirmation · Receipt stored automatically</small></p></div><label className="payment-consent"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)}/><span>I confirm the amount and understand that bonus Diamonds are bound.</span></label><button className="payment-primary" disabled={!consent} onClick={() => { setOtp(""); setView("verify"); }}>Continue securely</button><button className="payment-text" onClick={() => setView("failed")}>Preview failed payment state</button></div>;

  if (view === "verify") return <div className="feature-screen payment-screen"><PaymentHeader title="Verify payment" meta={method} onBack={backFromFlow}/><div className="verify-visual"><span>{method.startsWith("Visa") ? "V" : method.charAt(0)}</span><i>→</i><b>SADA</b></div><h2 className="verify-title">Enter the 6-digit code</h2><p className="verify-copy">The payment provider sent a one-time code to your registered mobile number. SADA staff will never ask for this code.</p><label className="otp-field">One-time code<input autoFocus inputMode="numeric" maxLength={6} value={otp} onChange={event => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000"/><small>{otp.length} / 6 digits</small></label><div className="verify-actions"><button onClick={() => notify("A new verification code was sent")}>Resend code</button><span>Code expires in 01:42</span></div><button className="payment-primary" disabled={otp.length !== 6} onClick={completePayment}>Pay PKR {pack.amount.toLocaleString()}</button><div className="daily-limit"><span>Daily recharge limit</span><strong>PKR 20,000</strong><i><b style={{ width: "31%" }}/></i><small>PKR 6,230 used after this payment</small></div></div>;

  return <div className="feature-screen payment-screen"><PaymentHeader title="Payments" meta="Pakistan · PKR" onBack={backFromFlow} action={<button className="payment-head-action" onClick={() => setView("history")} aria-label="Payment history">↻</button>}/><div className="payment-balance"><span><small>Diamond balance</small><strong>◆ {balance.toLocaleString()}</strong></span><button onClick={() => setView("history")}>Receipts</button></div><div className="payment-section-title"><h2>Choose a Diamond pack</h2><small>Bonus is bound</small></div><div className="payment-packs">{packs.map(item => <button key={item.diamonds} className={pack.diamonds === item.diamonds ? "active" : ""} onClick={() => setPack(item)}><span>{item.label}</span><strong>◆ {(item.diamonds + item.bonus).toLocaleString()}</strong><small>{item.bonus > 0 ? `${item.diamonds} + ${item.bonus} bonus` : `${item.diamonds} Diamonds`}</small><b>PKR {item.amount.toLocaleString()}</b></button>)}</div><div className="payment-section-title"><h2>Payment method</h2><button onClick={() => setView("methods")}>Manage</button></div><div className="payment-methods">{paymentMethods.map(item => <button key={item.id} className={method === item.id ? "active" : ""} onClick={() => setMethod(item.id)}><span>{item.symbol}</span><p><strong>{item.id}</strong><small>{item.meta}</small></p><b>{method === item.id ? "✓" : ""}</b></button>)}</div><div className="payment-protection compact"><span>⌁</span><p><strong>Secure payment</strong><small>OTP protection · Clear PKR total · Automatic receipt</small></p></div><button className="payment-primary" onClick={() => setView("review")}>Review · PKR {pack.amount.toLocaleString()}</button>{recentOrders.length > 0 && <><div className="payment-section-title recent"><h2>Recent payments</h2><button onClick={() => setView("history")}>View all</button></div><div className="mini-payment-orders">{recentOrders.slice(0, 2).map(order => <button key={order.id} onClick={() => { setSelectedOrder(order); setView("receipt"); }}><span>{order.status === "Completed" ? "✓" : order.status === "Failed" ? "!" : "…"}</span><p><strong>◆ {order.diamonds + order.bonus}</strong><small>{order.date} · {order.method}</small></p><b>PKR {order.amount.toLocaleString()}</b></button>)}</div></>}</div>;
}
