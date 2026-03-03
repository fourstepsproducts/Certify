import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Ban, AlertTriangle, CheckCircle2 } from "lucide-react";

const Refund = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-red-50/30 to-white">
            <Header />
            <main className="flex-1 py-16 lg:py-24">
                <div className="container max-w-5xl mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br from-red-500/20 to-red-500/5 mb-6 shadow-lg">
                            <Ban className="h-10 w-10 text-red-600" />
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-4">
                            Refund Policy
                        </h1>
                        <p className="text-xl text-slate-600 font-medium">
                            Last updated: <span className="text-primary font-bold">January 20, 2026</span>
                        </p>
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-xl p-8 lg:p-16 space-y-12">

                        {/* Critical Notice */}
                        <div className="bg-gradient-to-r from-red-100 to-red-50 border-4 border-red-500 p-8 rounded-2xl shadow-lg">
                            <div className="flex items-start gap-4 mb-4">
                                <AlertTriangle className="h-10 w-10 text-red-600 shrink-0" />
                                <div>
                                    <h3 className="text-2xl font-black text-red-900 mb-2">⚠️ IMPORTANT NOTICE</h3>
                                    <p className="text-red-900 font-bold text-xl leading-relaxed">
                                        CertifyPro follows a strict <span className="underline decoration-4 decoration-red-600">NO-REFUND POLICY</span>
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white/80 p-6 rounded-xl mt-4">
                                <p className="text-red-900 font-black text-lg">
                                    All payments are FINAL and NON-REFUNDABLE once completed.
                                </p>
                                <p className="text-red-800 mt-2">
                                    Please review plan details carefully before making any purchase.
                                </p>
                            </div>
                        </div>

                        {/* Section 1 */}
                        <section>
                            <h2 className="text-3xl font-black text-red-600 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-red-500/10 text-red-600 text-lg font-black">1</span>
                                No Refunds
                            </h2>
                            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl space-y-4">
                                <div className="flex items-start gap-3">
                                    <span className="text-red-600 font-black text-xl">✗</span>
                                    <p className="text-red-900 font-bold text-lg">Once a payment is made, it is non-refundable</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-red-600 font-black text-xl">✗</span>
                                    <p className="text-red-900 font-bold text-lg">This applies to both Pro and Enterprise plans</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-red-600 font-black text-xl">✗</span>
                                    <p className="text-red-900 font-bold text-lg">No exceptions or special cases</p>
                                </div>
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section>
                            <h2 className="text-3xl font-black text-blue-600 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 text-lg font-black">2</span>
                                Plan Upgrades
                            </h2>
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl space-y-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="h-6 w-6 text-blue-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-blue-900 font-bold text-lg">Users can upgrade plans at any time</p>
                                        <p className="text-blue-800 text-sm mt-1">Free → Pro, Free → Enterprise, Pro → Enterprise</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="h-6 w-6 text-blue-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-blue-900 font-bold text-lg">Charges are pro-rated</p>
                                        <p className="text-blue-800 text-sm mt-1">Fair pricing based on remaining days</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="h-6 w-6 text-blue-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-blue-900 font-bold text-lg">You pay only for remaining days in the 30-day cycle</p>
                                        <p className="text-blue-800 text-sm mt-1">No hidden fees or extra charges</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 3 */}
                        <section>
                            <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-slate-200 text-slate-900 text-lg font-black">3</span>
                                Plan Expiry
                            </h2>
                            <div className="bg-slate-50 border-l-4 border-slate-400 p-6 rounded-r-xl space-y-3">
                                <p className="text-slate-700"><span className="font-bold text-slate-900">• </span>All plans end automatically after <span className="font-bold text-primary">30 days</span></p>
                                <p className="text-slate-700"><span className="font-bold text-slate-900">• </span>No auto-renewal or auto-extension without user action</p>
                                <p className="text-slate-700"><span className="font-bold text-slate-900">• </span>You have full control over your subscription</p>
                            </div>
                        </section>

                        {/* Section 4 */}
                        <section>
                            <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 text-lg font-black">4</span>
                                User Responsibility
                            </h2>
                            <p className="text-slate-700 leading-relaxed mb-6 text-lg font-bold">
                                Please review plan details before making a purchase. We recommend:
                            </p>
                            <div className="grid gap-4">
                                {[
                                    { icon: "🆓", text: "Testing features on the Free plan first", desc: "Try before you buy" },
                                    { icon: "📊", text: "Reading the plan comparison carefully", desc: "Understand what each tier offers" },
                                    { icon: "📥", text: "Understanding the download limits and features", desc: "Know your usage needs" },
                                    { icon: "💬", text: "Contacting support if you have questions", desc: "We're here to help before purchase" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-4 bg-gradient-to-r from-slate-50 to-white p-5 rounded-xl border border-slate-200">
                                        <span className="text-3xl">{item.icon}</span>
                                        <div>
                                            <p className="text-slate-900 font-bold text-lg">{item.text}</p>
                                            <p className="text-slate-600 text-sm mt-1">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Help Section */}
                        <div className="bg-gradient-to-r from-blue-100 to-blue-50 border-2 border-blue-300 p-8 rounded-2xl">
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
                                    <span className="text-2xl">💡</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-blue-900 mb-3">Need Help Before Purchasing?</h3>
                                    <p className="text-blue-800 text-lg mb-4">
                                        If you have questions about our plans, features, or pricing, we're here to help!
                                    </p>
                                    <a
                                        href="mailto:support@certifypro.com"
                                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-xl transition-colors"
                                    >
                                        📧 Contact Support: support@certifypro.com
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Final Warning */}
                        <div className="bg-red-50 border-2 border-red-300 p-6 rounded-xl">
                            <p className="text-center text-red-900 font-black text-lg">
                                ⚠️ Remember: Once you complete a payment, it cannot be reversed or refunded. Choose wisely!
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Refund;
