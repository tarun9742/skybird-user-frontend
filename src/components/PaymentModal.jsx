import { useState } from "react";
import { formatPrice } from "../data/courses";
import API from "../api/axios";
import { ShieldCheck, CreditCard, Zap, Loader2, Tag, X } from "lucide-react";

export default function PaymentModal({ course, onClose, onSuccess, processing }) {
  const [paying, setPaying] = useState(false);
  const [method, setMethod] = useState("payu");
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const originalAmount = Number(course?.price || 0);
  const discount = Number(coupon?.pricing?.discountAmount || 0);
  const finalAmount = Number(coupon?.pricing?.finalAmount ?? originalAmount);

  async function applyCoupon() {
    if (!couponCode.trim()) return setErrorMsg("Enter a coupon code.");
    setCouponLoading(true);
    setErrorMsg("");
    try {
      const { data } = await API.post("/coupons/validate", {
        courseId: course.id,
        couponCode: couponCode.trim(),
      });
      if (!data.success) throw new Error(data.message);
      setCoupon(data.data);
    } catch (err) {
      setCoupon(null);
      setErrorMsg(err.response?.data?.message || err.message || "Invalid coupon code");
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setCoupon(null);
    setCouponCode("");
    setErrorMsg("");
  }

  async function handleCheckout(event) {
    event.preventDefault();
    setPaying(true);
    setErrorMsg("");

    if (method === "direct") {
      try {
        await onSuccess();
      } catch {
        setErrorMsg("Purchase failed. Please try again.");
      } finally {
        setPaying(false);
      }
      return;
    }

    try {
      const { data } = await API.post("/payment/payu/initiate", {
        courseId: course.id,
        couponCode: coupon?.coupon?.code || "",
      });

      if (!data.success || !data.data) {
        throw new Error(data.message || "Failed to initialize PayU payment");
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.data.action;

      Object.entries(data.data.params).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value ?? "";
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to redirect to PayU");
      setPaying(false);
    }
  }

  const busy = paying || processing;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
        <div className="flex items-start justify-between border-b border-gray-100 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-forest bg-mint px-2 py-0.5 rounded">Secure Checkout</span>
            <h2 className="mt-1 text-lg font-bold text-gray-900">{course.title}</h2>
          </div>
          <button type="button" onClick={onClose} disabled={busy} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-50"><X className="w-5 h-5" /></button>
        </div>

        <div className="rounded-xl bg-gray-50 p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Course Price</span><span className="font-semibold">{formatPrice(originalAmount)}</span></div>
          {coupon && <div className="flex justify-between text-emerald-600"><span>Coupon Discount</span><span>-{formatPrice(discount)}</span></div>}
          <div className="border-t pt-2 flex items-baseline justify-between">
            <span className="text-xs text-gray-500 font-medium">Total Payable</span>
            <span className="text-2xl font-extrabold text-forest">{formatPrice(finalAmount)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <input value={couponCode} onChange={e=>setCouponCode(e.target.value.toUpperCase())} onKeyDown={e=>e.key==="Enter" && applyCoupon()} disabled={busy || !!coupon} placeholder="Enter coupon code" className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm uppercase outline-none focus:ring-2 focus:ring-leaf" />
          {coupon ? <button type="button" onClick={removeCoupon} disabled={busy} className="px-4 rounded-xl border text-sm font-semibold">Remove</button> : <button type="button" onClick={applyCoupon} disabled={busy || couponLoading} className="px-4 rounded-xl bg-forest text-white text-sm font-semibold flex items-center gap-2">{couponLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}<Tag className="w-3.5 h-3.5" />Apply</button>}
        </div>

        {coupon && <div className="rounded-lg bg-emerald-50 text-emerald-700 p-2.5 text-xs font-semibold">Coupon {coupon.coupon.code} applied successfully.</div>}
        {errorMsg && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium">{errorMsg}</div>}

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-600 block">Select Gateway:</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={()=>setMethod("payu")} className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold ${method==="payu"?"border-leaf bg-mint/50 text-forest ring-1 ring-leaf":"border-gray-200 text-gray-600 hover:bg-gray-50"}`}><CreditCard className="w-4 h-4" />PayU Gateway</button>
            <button type="button" onClick={()=>setMethod("direct")} className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold ${method==="direct"?"border-leaf bg-mint/50 text-forest ring-1 ring-leaf":"border-gray-200 text-gray-600 hover:bg-gray-50"}`}><Zap className="w-4 h-4 text-amber-500" />Test Unlock</button>
          </div>
        </div>

        <form onSubmit={handleCheckout} className="space-y-4 pt-2">
          <div className="text-[11px] text-gray-500 bg-gray-50 p-3 rounded-lg flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-leaf shrink-0" /><span>{method==="payu" ? "You will be securely redirected to PayU to pay via UPI, Card, or NetBanking." : "Instant test unlock for development demonstration."}</span></div>
          <button type="submit" disabled={busy} className="btn-shine w-full rounded-full bg-leaf py-3 font-bold text-white hover:bg-forest disabled:opacity-70 transition text-sm flex items-center justify-center gap-2 shadow-sm">
            {busy ? <><Loader2 className="w-4 h-4 animate-spin" />Connecting Gateway...</> : method==="payu" ? `Proceed to PayU (${formatPrice(finalAmount)})` : `Unlock Course Instantly (${formatPrice(finalAmount)})`}
          </button>
        </form>
      </div>
    </div>
  );
}
