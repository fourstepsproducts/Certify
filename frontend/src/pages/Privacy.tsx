import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Shield, Lock, Eye, CheckCircle2, AlertCircle } from "lucide-react";

const Privacy = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50/30 to-white">
            <Header />
            <main className="flex-1 py-16 lg:py-24">
                <div className="container max-w-5xl mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br from-green-500/20 to-green-500/5 mb-6 shadow-lg">
                            <Shield className="h-10 w-10 text-green-600" />
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-4">
                            Privacy Policy
                        </h1>
                        <p className="text-xl text-slate-600 font-medium">
                            Last updated: <span className="text-primary font-bold">January 20, 2026</span>
                        </p>
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-xl p-8 lg:p-16 space-y-12">
                        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-xl">
                            <p className="text-lg text-slate-800 leading-relaxed">
                                Your privacy matters to us. This policy explains how <span className="font-black text-primary">CertifyPro</span> collects and uses data.
                            </p>
                        </div>

                        {/* Section 1 */}
                        <section>
                            <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 text-lg font-black">1</span>
                                Information We Collect
                            </h2>

                            <div className="space-y-6">
                                <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500">
                                    <h3 className="text-xl font-black text-blue-900 mb-4 flex items-center gap-2">
                                        <Eye className="h-5 w-5" />
                                        Account Information
                                    </h3>
                                    <div className="space-y-2">
                                        {["Name", "Email address", "Login credentials (encrypted)"].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
                                                <span className="text-blue-900 font-medium">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-purple-50 p-6 rounded-xl border-l-4 border-purple-500">
                                    <h3 className="text-xl font-black text-purple-900 mb-4 flex items-center gap-2">
                                        <Eye className="h-5 w-5" />
                                        Usage Information
                                    </h3>
                                    <div className="space-y-2">
                                        {["Certificates created", "Templates used", "Downloads and exports"].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <CheckCircle2 className="h-5 w-5 text-purple-600 shrink-0" />
                                                <span className="text-purple-900 font-medium">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-amber-50 p-6 rounded-xl border-l-4 border-amber-500">
                                    <h3 className="text-xl font-black text-amber-900 mb-4 flex items-center gap-2">
                                        <Eye className="h-5 w-5" />
                                        Bulk Data
                                    </h3>
                                    <div className="space-y-2">
                                        {[
                                            "Excel files uploaded by users",
                                            "Data is used only for certificate generation"
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <CheckCircle2 className="h-5 w-5 text-amber-600 shrink-0" />
                                                <span className="text-amber-900 font-medium">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section>
                            <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary text-lg font-black">2</span>
                                How We Use Your Information
                            </h2>
                            <p className="text-slate-700 leading-relaxed mb-4 text-lg font-bold">We use data to:</p>
                            <div className="grid gap-3">
                                {[
                                    "Provide and improve services",
                                    "Manage subscriptions and billing",
                                    "Generate and deliver certificates",
                                    "Send certificates via email (when requested)"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl">
                                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                                        <span className="text-slate-700 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Section 3 - Security */}
                        <section>
                            <h2 className="text-3xl font-black text-green-600 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-green-500/10 text-green-600 text-lg font-black">3</span>
                                Data Security
                            </h2>
                            <div className="bg-gradient-to-r from-green-100 to-green-50 border-2 border-green-300 p-8 rounded-2xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <Lock className="h-8 w-8 text-green-600" />
                                    <h3 className="text-2xl font-black text-green-900">Your Data is Protected</h3>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { icon: "🔒", text: "Passwords are encrypted", desc: "Industry-standard encryption" },
                                        { icon: "💳", text: "Payments handled by secure providers", desc: "We never store payment details" },
                                        { icon: "🚫", text: "We do not sell user data", desc: "Your privacy is our priority" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-4 bg-white p-4 rounded-xl">
                                            <span className="text-2xl">{item.icon}</span>
                                            <div>
                                                <p className="text-green-900 font-bold text-lg">{item.text}</p>
                                                <p className="text-green-700 text-sm">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Section 4 */}
                        <section>
                            <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary text-lg font-black">4</span>
                                Cookies & Tracking
                            </h2>
                            <p className="text-slate-700 leading-relaxed mb-4 text-lg">We use cookies for:</p>
                            <div className="space-y-3 mb-6">
                                {["Login sessions", "Security", "Analytics (with user consent)"].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                                        <span className="text-slate-700 leading-relaxed">{item}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
                                <p className="text-blue-900 font-medium">
                                    Details are explained in our{" "}
                                    <a href="/cookies" className="text-primary font-black hover:underline">
                                        Cookie Policy →
                                    </a>
                                </p>
                            </div>
                        </section>

                        {/* Section 5 */}
                        <section>
                            <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-red-500/10 text-red-600 text-lg font-black">5</span>
                                Data Sharing
                            </h2>
                            <div className="bg-red-50 border-2 border-red-200 p-6 rounded-xl mb-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 shrink-0" />
                                    <p className="text-red-900 font-black text-lg">
                                        We do NOT sell or rent your data
                                    </p>
                                </div>
                            </div>
                            <p className="text-slate-700 leading-relaxed mb-4 font-bold">We only share data when required to:</p>
                            <div className="space-y-3">
                                {[
                                    "Process payments",
                                    "Send emails",
                                    "Comply with legal requirements"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl">
                                        <span className="text-slate-600">→</span>
                                        <span className="text-slate-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Section 6 */}
                        <section>
                            <h2 className="text-3xl font-black text-blue-600 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 text-lg font-black">6</span>
                                Your Rights
                            </h2>
                            <p className="text-slate-700 leading-relaxed mb-4 text-lg font-bold">You may:</p>
                            <div className="grid gap-4">
                                {[
                                    { icon: "👁️", text: "Access your data", desc: "View what we have" },
                                    { icon: "🗑️", text: "Request deletion of your account", desc: "Remove all your data" },
                                    { icon: "✏️", text: "Update your profile information", desc: "Keep it current" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-4 bg-blue-50 p-5 rounded-xl border-l-4 border-blue-500">
                                        <span className="text-2xl">{item.icon}</span>
                                        <div>
                                            <p className="text-blue-900 font-bold text-lg">{item.text}</p>
                                            <p className="text-blue-700 text-sm">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Section 7 */}
                        <section>
                            <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary text-lg font-black">7</span>
                                Policy Updates
                            </h2>
                            <p className="text-slate-700 leading-relaxed">
                                We may update this policy. Changes will be reflected on this page.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Privacy;
