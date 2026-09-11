"use client";
/* eslint-disable jsx-a11y/no-autofocus */

import { useEffect, useMemo, useState } from "react";
import { sadaApi, type ApiPaymentMethod, type ApiPaymentReceipt } from "./api-client";
import "./payment.css";

export type PaymentOrder = {
  id: string;
  diamonds: number;
  bonus: number;
  amount: number;
  method: string;
  status: "Completed" | "Processing" | "Refund review" | "Failed";
  date: string;
  providerReference?: string | null;
};

export const initialPaymentOrders: PaymentOrder[] = [
  { id: "SADA-84219", diamonds: 500, bonus: 0, amount: 1350, method: "Easypaisa", status: "Completed", date: "Aug 27 · 21:18" },
  { id: "SADA-83604", diamonds: 120, bonus: 0, amount: 560, method: "JazzCash", status: "Completed", date: "Aug 19 · 18:42" },
  { id: "SADA-82977", diamonds: 300, bonus: 20, amount: 1350, method: "Visa •••• 4242", status: "Failed", date: "Aug 12 · 14:09" },
];

type PaymentView = "packs" | "methods" | "add-method" | "review" | "verify" | "processing" | "success" | "failed" | "history" | "receipt" | "refund";
type Pack = { diamonds: number; bonus: number; amount: number; label: string };
type PaymentMethod = { id: string; label: string; symbol: string; meta: string; provider: ApiPaymentMethod["provider"] };

const packs: Pack[] = [
  { diamonds: 60, bonus: 0, amount: 280, label: "Starter" },
  { diamonds: 300, bonus: 20, amount: 1350, label: "Popular" },
  { diamonds: 680, bonus: 60, amount: 2850, label: "Extra value" },
  { diamonds: 1480, bonus: 180, amount: 5950, label: "Best value" },
];

const initialMethods: PaymentMethod[] = [
  { id: "preview-easypaisa", label: "Easypaisa", symbol: "E", meta: "Sign in to load saved methods", provider: "easypaisa" },
];

function methodFromApi(method: ApiPaymentMethod): PaymentMethod {
  return {
    id: method.id,
    label: method.displayLabel,
    symbol: method.provider === "card" ? "V" : method.provider === "jazzcash" ? "J" : "E",
    meta: method.type === "card" ? "Provider-tokenized bank card" : "Provider-tokenized mobile wallet",
    provider: method.provider,
  };
}

function orderFromApi(receipt: ApiPaymentReceipt, method = "Saved payment method"): PaymentOrder {
  const status = receipt.status === "succeeded" ? "Completed" : receipt.status === "failed" ? "Failed" : "Processing";
  return {
    id: receipt.id,
    diamonds: receipt.diamonds,
    bonus: receipt.bonusDiamonds,
    amount: receipt.amountPkr,
    method,
    status,
    providerReference: receipt.providerReference,
    date: new Date(receipt.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }),
  };
}

function PaymentHeader({ title, meta, onBack, action }: { title: string; meta: string; onBack: () => void; action?: React.ReactNode }) {
  return <div className="feature-header"><button className="screen-back" onClick={onBack} aria-label="Back">‹</button><div><small>{meta}</small><h1>{title}</h1></div>{action ?? <span />}</div>;
}

export function PaymentCenterScreen({ authenticated, balance, orders, onBalanceChange, onOrdersChange, onBack, onSignIn, notify }: {
  authenticated: boolean;
  balance: number;
  orders: PaymentOrder[];
  onBalanceChange: (balance: number) => void;
  onOrdersChange: (orders: PaymentOrder[]) => void;
  onBack: () => void;
  onSignIn: () => void;
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
  const [pending, setPending] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const totalDiamonds = pack.diamonds + pack.bonus;
  const selectedMethod = paymentMethods.find(item => item.id === method);

  const recentOrders = useMemo(() => orders.slice(0, 3), [orders]);
  useEffect(() => {
    if (!authenticated) return;
    let active = true;
    Promise.all([sadaApi.payments.methods(), sadaApi.payments.receipts()]).then(([methodResult, receiptResult]) => {
      if (!active) return;
      const methods = methodResult.items.map(methodFromApi);
      setPaymentMethods(methods);
      setMethod(current => methods.some(item => item.id === current) ? current : (methods[0]?.id ?? ""));
      onOrdersChange(receiptResult.items.map(receipt => orderFromApi(receipt, receipt.methodLabel ?? "Saved payment method")));
    }).catch(error => notify(error instanceof Error ? error.message : "Payment data could not be loaded"));
    return () => { active = false; };
  }, [authenticated, notify, onOrdersChange]);
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

  const beginPayment = async () => {
    if (!authenticated) { notify("Sign in before starting a payment"); onSignIn(); return; }
    if (!method) { notify("Add a provider-tokenized payment method first"); setView("methods"); return; }
    setPending(true);
    try {
      const intent = await sadaApi.payments.createIntent({ methodId: method, amountPkr: pack.amount, diamonds: pack.diamonds, bonusDiamonds: pack.bonus, idempotencyKey: crypto.randomUUID() });
      setPaymentIntentId(intent.id); setOtp(""); setView("verify");
    } catch (error) { notify(error instanceof Error ? error.message : "Payment could not be started"); }
    finally { setPending(false); }
  };

  const completePayment = async () => {
    if (!paymentIntentId) return;
    setPending(true); setView("processing");
    try {
      const result = await sadaApi.payments.confirm(paymentIntentId, otp);
      const activeMethod = paymentMethods.find(item => item.id === method);
      const order: PaymentOrder = { id: paymentIntentId, diamonds: pack.diamonds, bonus: pack.bonus, amount: pack.amount, method: activeMethod?.label ?? "Saved payment method", status: result.status === "succeeded" ? "Completed" : "Processing", date: "Just now" };
      onOrdersChange([order, ...orders.filter(item => item.id !== order.id)]); setSelectedOrder(order);
      if (result.status === "succeeded" && result.wallet) {
        onBalanceChange(result.wallet.diamonds + result.wallet.boundDiamonds); setView("success"); notify(`${totalDiamonds} Diamonds added securely`);
      } else {
        notify("Provider confirmation received · waiting for signed settlement webhook");
      }
    } catch (error) { setView("failed"); notify(error instanceof Error ? error.message : "Payment was declined"); }
    finally { setPending(false); }
  };

  const submitRefund = async () => {
    if (!selectedOrder) return;
    setPending(true);
    try {
      await sadaApi.payments.refund(selectedOrder.id, refundReason, refundNote);
      const updated = orders.map(order => order.id === selectedOrder.id ? { ...order, status: "Refund review" as const } : order);
      const nextOrder = updated.find(order => order.id === selectedOrder.id) ?? selectedOrder;
      onOrdersChange(updated); setSelectedOrder(nextOrder); setView("receipt"); notify("Refund request submitted · review within 1–3 days");
    } catch (error) { notify(error instanceof Error ? error.message : "Refund request failed"); }
    finally { setPending(false); }
  };

  const addPaymentMethod = async () => {
    if (newMethodValue.trim().length < 8) return;
    setPending(true);
    try {
      const provider = newMethodType === "card" ? "card" : "easypaisa";
      const created = await sadaApi.payments.createMethod({ provider, tokenizedReference: newMethodValue.trim(), displayLabel: newMethodType === "card" ? "Tokenized bank card" : "Tokenized mobile wallet", makeDefault: paymentMethods.length === 0 });
      const added = methodFromApi(created); setPaymentMethods(items => [...items, added]); setMethod(added.id); setNewMethodValue(""); setView("methods"); notify("Payment method added and selected");
    } catch (error) { notify(error instanceof Error ? error.message : "Payment method could not be saved"); }
    finally { setPending(false); }
  };

  const removePaymentMethod = async (methodId: string) => {
    setPending(true);
    try {
      await sadaApi.payments.deleteMethod(methodId);
      const next = paymentMethods.filter(item => item.id !== methodId);
      setPaymentMethods(next); if (method === methodId) setMethod(next[0]?.id ?? ""); notify("Payment method removed");
    } catch (error) { notify(error instanceof Error ? error.message : "Payment method could not be removed"); }
    finally { setPending(false); }
  };

  if (view === "processing") return <div className="feature-screen payment-screen payment-state"><div className="payment-loader"><i/><i/><i/></div><h1>Confirming payment</h1><p>Keep SADA open while the provider confirms your payment. Diamonds are credited only after a signed settlement webhook.</p><div className="payment-state-order"><span>Order amount</span><strong>PKR {pack.amount.toLocaleString()}</strong><small>{selectedMethod?.label ?? "Payment provider"} · Secure channel</small></div><button className="payment-secondary" onClick={() => setView("history")}>Check payment history</button></div>;

  if (view === "success") return <div className="feature-screen payment-screen payment-state"><span className="payment-state-icon success">✓</span><small>Payment successful</small><h1>{totalDiamonds.toLocaleString()} Diamonds added</h1><p>Your balance is updated. The receipt and provider reference are saved in Payment history.</p><div className="payment-state-order"><span>New balance</span><strong>◆ {balance.toLocaleString()}</strong><small>Order {selectedOrder?.id}</small></div><button className="payment-primary" onClick={() => setView("receipt")}>View receipt</button><button className="payment-secondary" onClick={onBack}>Return to Wallet</button></div>;

  if (view === "failed") return <div className="feature-screen payment-screen payment-state"><span className="payment-state-icon failed">!</span><small>Payment not completed</small><h1>No money was charged</h1><p>The provider did not authorize this request. Check your wallet balance or choose another payment method.</p><div className="payment-state-order"><span>Order status</span><strong>Declined</strong><small>Reference SADA-TRY-2048</small></div><button className="payment-primary" onClick={() => setView("review")}>Try again</button><button className="payment-secondary" onClick={() => setView("packs")}>Change pack or method</button></div>;

  if (view === "history") return <div className="feature-screen payment-screen"><PaymentHeader title="Payment history" meta="Receipts and support" onBack={backFromFlow}/><div className="payment-summary"><span><small>Successful this month</small><strong>PKR {orders.filter(order => order.status === "Completed").reduce((sum, order) => sum + order.amount, 0).toLocaleString()}</strong></span><span><small>Refund review</small><strong>{orders.filter(order => order.status === "Refund review").length}</strong></span></div><div className="payment-filter"><button className="active">All</button><button>Successful</button><button>Refunds</button><button>Failed</button></div><div className="payment-orders">{orders.map(order => <button key={order.id} onClick={() => { setSelectedOrder(order); setView("receipt"); }}><span className={`payment-order-mark ${order.status.toLowerCase().replace(" ", "-")}`}>{order.status === "Completed" ? "✓" : order.status === "Failed" ? "!" : "…"}</span><span><strong>◆ {(order.diamonds + order.bonus).toLocaleString()} Diamonds</strong><small>{order.date} · {order.method}</small><em>{order.id}</em></span><b>PKR {order.amount.toLocaleString()}<small>{order.status}</small></b></button>)}</div></div>;

  if (view === "receipt" && selectedOrder) return <div className="feature-screen payment-screen"><PaymentHeader title="Payment receipt" meta={selectedOrder.status} onBack={backFromFlow} action={<button className="payment-head-action" onClick={() => notify("Receipt reference ready to copy")}>↗</button>}/><div className="receipt-hero"><span className={selectedOrder.status === "Completed" ? "success" : selectedOrder.status === "Failed" ? "failed" : "review"}>{selectedOrder.status === "Completed" ? "✓" : selectedOrder.status === "Failed" ? "!" : "…"}</span><small>{selectedOrder.status}</small><strong>PKR {selectedOrder.amount.toLocaleString()}</strong><p>{selectedOrder.diamonds + selectedOrder.bonus} Diamonds · {selectedOrder.method}</p></div><div className="receipt-details"><div><span>Order number</span><strong>{selectedOrder.id}</strong></div><div><span>Provider reference</span><strong>{selectedOrder.providerReference ?? "Pending provider settlement"}</strong></div><div><span>Created</span><strong>{selectedOrder.date}</strong></div><div><span>Channel fee</span><strong>Included</strong></div><div><span>Diamonds</span><strong>{selectedOrder.diamonds}</strong></div><div><span>Bound bonus</span><strong>{selectedOrder.bonus}</strong></div></div><div className="payment-protection"><span>⌁</span><p><strong>Purchase protection</strong><small>Never share an OTP. SADA support will not ask you to pay outside this receipt.</small></p></div>{selectedOrder.status === "Completed" && <button className="payment-secondary full" onClick={() => setView("refund")}>Request refund or report a problem</button>}</div>;

  if (view === "refund" && selectedOrder) return <div className="feature-screen payment-screen"><PaymentHeader title="Refund request" meta={selectedOrder.id} onBack={backFromFlow}/><div className="refund-order"><span>◆</span><p><strong>{selectedOrder.diamonds + selectedOrder.bonus} Diamonds</strong><small>PKR {selectedOrder.amount.toLocaleString()} · {selectedOrder.method}</small></p></div><div className="payment-section-title"><h2>What happened?</h2><small>Choose one</small></div><div className="refund-reasons">{["Purchase made by mistake", "Diamonds not received", "Duplicate payment", "Payment not authorized"].map(reason => <button key={reason} className={refundReason === reason ? "active" : ""} onClick={() => setRefundReason(reason)}><span>{refundReason === reason ? "✓" : ""}</span>{reason}</button>)}</div><label className="payment-note">Details<textarea value={refundNote} onChange={event => setRefundNote(event.target.value)} placeholder="Add provider messages or other details"/></label><div className="refund-policy"><b>Before you submit</b><p>Refund eligibility depends on item consumption, payment status and provider rules. Promotional bonus Diamonds are removed when a refund is approved.</p></div><button className="payment-primary" disabled={pending} onClick={submitRefund}>{pending ? "Submitting…" : selectedOrder.status === "Refund review" ? "Update request" : "Submit refund request"}</button></div>;

  if (view === "methods") return <div className="feature-screen payment-screen"><PaymentHeader title="Payment methods" meta="Saved securely" onBack={backFromFlow}/><div className="method-security"><span>⌁</span><p><strong>Your payment details stay protected</strong><small>SADA stores provider tokens, never your full card or wallet credentials.</small></p></div><div className="managed-methods">{paymentMethods.map(item => <article key={item.id} className={method === item.id ? "active" : ""}><button className="managed-method-main" onClick={() => { setMethod(item.id); notify(`${item.label} selected`); }}><span>{item.symbol}</span><p><strong>{item.label}</strong><small>{item.meta}</small></p><b>{method === item.id ? "Default" : "Use"}</b></button><button className="managed-method-remove" disabled={pending || paymentMethods.length === 1} aria-label={`Remove ${item.label}`} onClick={() => removePaymentMethod(item.id)}>×</button></article>)}</div><button className="payment-primary" onClick={() => authenticated ? setView("add-method") : onSignIn()}>{authenticated ? "+ Add payment method" : "Sign in to manage methods"}</button><p className="payment-provider-note">Only provider-issued tokens are accepted. Full card or wallet credentials never enter SADA.</p></div>;

  if (view === "add-method") {
    const valid = newMethodValue.trim().length >= 8;
    return <div className="feature-screen payment-screen"><PaymentHeader title="Add payment method" meta="Provider-protected setup" onBack={backFromFlow}/><div className="method-type-tabs"><button className={newMethodType === "wallet" ? "active" : ""} onClick={() => { setNewMethodType("wallet"); setNewMethodValue(""); }}>Mobile wallet</button><button className={newMethodType === "card" ? "active" : ""} onClick={() => { setNewMethodType("card"); setNewMethodValue(""); }}>Bank card</button></div><div className="add-method-visual"><span>{newMethodType === "wallet" ? "E" : "V"}</span><strong>{newMethodType === "wallet" ? "Easypaisa / JazzCash" : "Visa / Mastercard"}</strong><small>Complete setup with the payment provider, then paste its one-time token here.</small></div><label className="add-method-field">Provider token<input autoFocus value={newMethodValue} onChange={event => setNewMethodValue(event.target.value.slice(0, 300))} placeholder="tok_provider_…"/><small>Do not enter a card number, bank account number, PIN or OTP.</small></label><button className="payment-primary" disabled={pending || !valid} onClick={addPaymentMethod}>{pending ? "Saving…" : "Save and use method"}</button><button className="payment-text" onClick={backFromFlow}>Cancel</button></div>;
  }

  if (view === "review") return <div className="feature-screen payment-screen"><PaymentHeader title="Review payment" meta="No hidden charges" onBack={backFromFlow}/><div className="review-pack"><span>◆</span><p><small>Diamond recharge</small><strong>{totalDiamonds.toLocaleString()} Diamonds</strong><em>{pack.bonus > 0 ? `${pack.diamonds} purchased + ${pack.bonus} bound bonus` : "Purchased Diamonds"}</em></p><b>PKR {pack.amount.toLocaleString()}</b></div><div className="receipt-details review-details"><div><span>Payment method</span><strong>{selectedMethod?.label ?? "No saved method"}</strong></div><div><span>Channel fee</span><strong>PKR 0</strong></div><div><span>Tax</span><strong>Included</strong></div><div><span>Total to pay</span><strong>PKR {pack.amount.toLocaleString()}</strong></div></div><div className="payment-protection"><span>⌁</span><p><strong>SADA protected payment</strong><small>Encrypted request · Provider confirmation · Signed settlement · Automatic receipt</small></p></div><label className="payment-consent"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)}/><span>I confirm the amount and understand that bonus Diamonds are bound.</span></label><button className="payment-primary" disabled={pending || !consent} onClick={beginPayment}>{pending ? "Starting…" : "Continue securely"}</button></div>;

  if (view === "verify") return <div className="feature-screen payment-screen"><PaymentHeader title="Verify payment" meta={selectedMethod?.label ?? "Payment provider"} onBack={backFromFlow}/><div className="verify-visual"><span>{selectedMethod?.symbol ?? "P"}</span><i>→</i><b>SADA</b></div><h2 className="verify-title">Enter the 6-digit code</h2><p className="verify-copy">The payment provider sent a one-time code to your registered mobile number. SADA staff will never ask for this code.</p><label className="otp-field">One-time code<input autoFocus inputMode="numeric" maxLength={6} value={otp} onChange={event => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000"/><small>{otp.length} / 6 digits</small></label><button className="payment-primary" disabled={pending || otp.length !== 6} onClick={completePayment}>{pending ? "Confirming…" : `Pay PKR ${pack.amount.toLocaleString()}`}</button><div className="daily-limit"><span>Daily recharge limit</span><strong>PKR 20,000</strong><i><b style={{ width: "31%" }}/></i><small>PKR 6,230 used after this payment</small></div></div>;

  return <div className="feature-screen payment-screen"><PaymentHeader title="Payments" meta="Pakistan · PKR" onBack={backFromFlow} action={<button className="payment-head-action" onClick={() => setView("history")} aria-label="Payment history">↻</button>}/><div className="payment-balance"><span><small>Diamond balance</small><strong>◆ {balance.toLocaleString()}</strong></span><button onClick={() => setView("history")}>Receipts</button></div><div className="payment-section-title"><h2>Choose a Diamond pack</h2><small>Bonus is bound</small></div><div className="payment-packs">{packs.map(item => <button key={item.diamonds} className={pack.diamonds === item.diamonds ? "active" : ""} onClick={() => setPack(item)}><span>{item.label}</span><strong>◆ {(item.diamonds + item.bonus).toLocaleString()}</strong><small>{item.bonus > 0 ? `${item.diamonds} + ${item.bonus} bonus` : `${item.diamonds} Diamonds`}</small><b>PKR {item.amount.toLocaleString()}</b></button>)}</div><div className="payment-section-title"><h2>Payment method</h2><button onClick={() => setView("methods")}>Manage</button></div><div className="payment-methods">{paymentMethods.map(item => <button key={item.id} className={method === item.id ? "active" : ""} onClick={() => setMethod(item.id)}><span>{item.symbol}</span><p><strong>{item.label}</strong><small>{item.meta}</small></p><b>{method === item.id ? "✓" : ""}</b></button>)}</div><div className="payment-protection compact"><span>⌁</span><p><strong>Secure payment</strong><small>OTP protection · Clear PKR total · Signed settlement receipt</small></p></div><button className="payment-primary" onClick={() => authenticated ? setView("review") : onSignIn()}>{authenticated ? `Review · PKR ${pack.amount.toLocaleString()}` : "Sign in to recharge"}</button>{recentOrders.length > 0 && <><div className="payment-section-title recent"><h2>Recent payments</h2><button onClick={() => setView("history")}>View all</button></div><div className="mini-payment-orders">{recentOrders.slice(0, 2).map(order => <button key={order.id} onClick={() => { setSelectedOrder(order); setView("receipt"); }}><span>{order.status === "Completed" ? "✓" : order.status === "Failed" ? "!" : "…"}</span><p><strong>◆ {order.diamonds + order.bonus}</strong><small>{order.date} · {order.method}</small></p><b>PKR {order.amount.toLocaleString()}</b></button>)}</div></>}</div>;
}
