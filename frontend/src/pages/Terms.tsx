import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { FileText, CheckCircle2, AlertCircle } from "lucide-react";

const Terms = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
            <Header />
            <main className="flex-1 py-16 lg:py-24">
                <div className="container max-w-5xl mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 mb-6 shadow-lg">
                            <FileText className="h-10 w-10 text-primary" />
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-4">
                            Terms & Conditions
                        </h1>
                        <p className="text-xl text-slate-600 font-medium">
                            Last updated: <span className="text-primary font-bold">January 20, 2026</span>
                        </p>
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-xl p-8 lg:p-16 space-y-12">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
                            <p className="text-lg text-slate-800 leading-relaxed">
                                Welcome to <span className="font-black text-primary">CertifyPro</span>. By accessing or using our website and services, you agree to these Terms & Conditions. Please read them carefully.
                            </p>
                        </div>

                        {/* Section 1 */}
                        <section>
                            <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary text-lg font-black">1</span>
                                Service Overview
                            </h2>
                            <p className="text-slate-700 leading-relaxed mb-4 text-lg">CertifyPro allows users to:</p>
                            <div className="grid gap-3">
                                {[
                                    "Create certificates from scratch",
                                    "Use ready-made templates",
                                    "Generate certificates using AI",
                                    "Upload bulk data (Excel) to generate certificates",
                                    "Send certificates via email"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl">
                                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                                        <span className="text-slate-700 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section>
                            <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary text-lg font-black">2</span>
                                User Accounts
                            </h2>
                            <div className="space-y-3">
                                {[
                                    "You must create an account to use most features",
                                    "You are responsible for maintaining the security of your account",
                                    "You must provide accurate information during signup"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                                        <span className="text-slate-700 leading-relaxed">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Section 3 */}
                        <section>
                            <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary text-lg font-black">3</span>
                                Subscription Plans
                            </h2>
                            <p className="text-slate-700 leading-relaxed mb-4 text-lg">
                                CertifyPro offers <span className="font-bold text-slate-900">Free, Pro, and Enterprise</span> plans.
                            </p>
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-6 rounded-xl space-y-3">
                                <p className="text-slate-700"><span className="font-bold text-slate-900">• </span>All plans are time-based and run on a <span className="font-bold text-primary">30-day cycle</span></p>
                                <p className="text-slate-700"><span className="font-bold text-slate-900">• </span>Plans end automatically after 30 days</p>
                                <p className="text-slate-700 font-bold text-slate-900">You may upgrade at any time:</p>
                                <div className="pl-6 space-y-2">
                                    <p className="text-slate-700">→ Free → Pro</p>
                                    <p className="text-slate-700">→ Free → Enterprise</p>
                                    <p className="text-slate-700">→ Pro → Enterprise</p>
                                </div>
                            </div>
                        </section>

                        {/* Section 4 */}
                        <section>
                            <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-green-500/10 text-green-600 text-lg font-black">4</span>
                                Pro-Rated Billing
                            </h2>
                            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-xl space-y-3">
                                <p className="text-slate-700"><span className="font-bold text-green-700">✓</span> When upgrading, you pay only for the remaining days</p>
                                <p className="text-slate-700"><span className="font-bold text-green-700">✓</span> No extra or hidden charges</p>
                                <p className="text-slate-700"><span className="font-bold text-green-700">✓</span> Pricing is calculated fairly based on actual usage time</p>
                            </div>
                        </section>

                        {/* Section 5 */}
                        <section>
                            <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary text-lg font-black">5</span>
                                Payments
                            </h2>
                            <div className="space-y-3">
                                <p className="text-slate-700"><span className="font-bold text-slate-900">• </span>Payments are processed securely via third-party payment providers</p>
                                <p className="text-slate-700"><span className="font-bold text-slate-900">• </span>CertifyPro does not store card or bank details</p>
                            </div>
                        </section>

                        {/* Section 6 - Important */}
                        <section>
                            <h2 className="text-3xl font-black text-red-600 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-red-500/10 text-red-600 text-lg font-black">6</span>
                                No Refund Policy
                            </h2>
                            <div className="bg-red-50 border-2 border-red-200 p-6 rounded-xl space-y-3">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 shrink-0" />
                                    <p className="text-red-900 font-bold text-lg">All payments are final</p>
                                </div>
                                <p className="text-red-800"><span className="font-bold">• </span>No refunds are provided once payment is completed</p>
                                <p className="text-red-800"><span className="font-bold">• </span>Please review plan features carefully before upgrading</p>
                            </div>
                        </section>

                        {/* Section 7 */}
                        <section>
                            <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary text-lg font-black">7</span>
                                Usage Rules
                            </h2>
                            <p className="text-slate-700 leading-relaxed mb-4 font-bold text-lg">You agree not to:</p>
                            <div className="space-y-3">
                                {[
                                    "Use the service for illegal or fraudulent purposes",
                                    "Upload harmful, offensive, or misleading content",
                                    "Attempt to disrupt or reverse engineer the platform"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl">
                                        <span className="text-red-500 font-bold">✗</span>
                                        <span className="text-slate-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Sections 8-11 */}
                        <section>
                            <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary text-lg font-black">8</span>
                                Intellectual Property
                            </h2>
                            <div className="space-y-3">
                                <p className="text-slate-700"><span className="font-bold text-slate-900">• </span>Templates, designs, and platform features belong to CertifyPro</p>
                                <p className="text-slate-700"><span className="font-bold text-green-700">• </span>Certificates created by users belong to the users</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary text-lg font-black">9</span>
                                Service Availability
                            </h2>
                            <p className="text-slate-700 leading-relaxed">
                                We aim for high availability but do not guarantee uninterrupted service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary text-lg font-black">10</span>
                                Changes to Terms
                            </h2>
                            <p className="text-slate-700 leading-relaxed">
                                We may update these Terms from time to time. Continued use means acceptance of changes.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary text-lg font-black">11</span>
                                Contact
                            </h2>
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
                                <p className="text-slate-700 leading-relaxed">
                                    For questions, contact:{" "}
                                    <a href="mailto:support@certifypro.com" className="text-primary font-black hover:underline text-lg">
                                        support@certifypro.com
                                    </a>
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Terms;
