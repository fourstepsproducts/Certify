import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Cookie, CheckCircle2, Settings, Shield } from "lucide-react";

const Cookies = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50/30 to-white">
            <Header />
            <main className="flex-1 py-16 lg:py-24">
                <div className="container max-w-5xl mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 mb-6 shadow-lg">
                            <Cookie className="h-10 w-10 text-amber-600" />
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-4">
                            Cookie Policy
                        </h1>
                        <p className="text-xl text-slate-600 font-medium">
                            Last updated: <span className="text-primary font-bold">January 20, 2026</span>
                        </p>
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-xl p-8 lg:p-16 space-y-12">
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-xl">
                            <p className="text-lg text-slate-800 leading-relaxed">
                                This policy explains how <span className="font-black text-primary">CertifyPro</span> uses cookies to enhance your experience.
                            </p>
                        </div>

                        {/* Section 1 */}
                        <section>
                            <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 text-lg font-black">1</span>
                                What Are Cookies?
                            </h2>
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-2xl border-2 border-amber-200">
                                <div className="flex items-start gap-4">
                                    <span className="text-4xl">🍪</span>
                                    <div>
                                        <p className="text-slate-800 text-lg leading-relaxed font-medium">
                                            Cookies are <span className="font-black text-amber-900">small files</span> stored in your browser to help the site function properly and remember your preferences.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section>
                            <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary text-lg font-black">2</span>
                                Types of Cookies We Use
                            </h2>

                            <div className="space-y-6">
                                {/* Essential Cookies */}
                                <div className="bg-green-50 p-6 rounded-2xl border-l-4 border-green-500">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Shield className="h-7 w-7 text-green-600" />
                                        <h3 className="text-2xl font-black text-green-900">Essential Cookies</h3>
                                        <span className="ml-auto bg-green-600 text-white text-xs font-black px-3 py-1 rounded-full">REQUIRED</span>
                                    </div>
                                    <p className="text-green-800 font-medium mb-4">These cookies are necessary for the website to function. They cannot be disabled.</p>
                                    <div className="space-y-3">
                                        {[
                                            { icon: "🔐", text: "Login sessions", desc: "Keep you signed in" },
                                            { icon: "🛡️", text: "Security features", desc: "Protect your account" },
                                            { icon: "⚙️", text: "Core functionality", desc: "Enable basic features" }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-start gap-3 bg-white p-4 rounded-xl">
                                                <span className="text-xl">{item.icon}</span>
                                                <div>
                                                    <p className="text-green-900 font-bold">{item.text}</p>
                                                    <p className="text-green-700 text-sm">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Analytics Cookies */}
                                <div className="bg-blue-50 p-6 rounded-2xl border-l-4 border-blue-500">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Settings className="h-7 w-7 text-blue-600" />
                                        <h3 className="text-2xl font-black text-blue-900">Analytics Cookies</h3>
                                        <span className="ml-auto bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full">OPTIONAL</span>
                                    </div>
                                    <p className="text-blue-800 font-medium mb-4">Help us understand how you use the site. Used only with your consent.</p>
                                    <div className="space-y-3">
                                        {[
                                            { icon: "📊", text: "Understand site usage", desc: "See what features are popular" },
                                            { icon: "⚡", text: "Improve performance", desc: "Make the site faster" },
                                            { icon: "✅", text: "Used only with consent", desc: "You control this" }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-start gap-3 bg-white p-4 rounded-xl">
                                                <span className="text-xl">{item.icon}</span>
                                                <div>
                                                    <p className="text-blue-900 font-bold">{item.text}</p>
                                                    <p className="text-blue-700 text-sm">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Marketing Cookies */}
                                <div className="bg-purple-50 p-6 rounded-2xl border-l-4 border-purple-500">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Cookie className="h-7 w-7 text-purple-600" />
                                        <h3 className="text-2xl font-black text-purple-900">Marketing Cookies</h3>
                                        <span className="ml-auto bg-purple-600 text-white text-xs font-black px-3 py-1 rounded-full">OPTIONAL</span>
                                    </div>
                                    <p className="text-purple-800 font-medium mb-4">Track engagement with features. Only enabled if you choose.</p>
                                    <div className="space-y-3">
                                        {[
                                            { icon: "🎯", text: "Used only if enabled by user", desc: "Completely your choice" },
                                            { icon: "📈", text: "May track feature engagement", desc: "See what you like" }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-start gap-3 bg-white p-4 rounded-xl">
                                                <span className="text-xl">{item.icon}</span>
                                                <div>
                                                    <p className="text-purple-900 font-bold">{item.text}</p>
                                                    <p className="text-purple-700 text-sm">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 3 */}
                        <section>
                            <h2 className="text-3xl font-black text-blue-600 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 text-lg font-black">3</span>
                                Managing Cookies
                            </h2>
                            <div className="bg-gradient-to-r from-blue-100 to-blue-50 border-2 border-blue-300 p-8 rounded-2xl">
                                <h3 className="text-2xl font-black text-blue-900 mb-6">You Have Full Control</h3>
                                <div className="space-y-4">
                                    {[
                                        { icon: "✅", text: "Accept or reject non-essential cookies", desc: "Choose what you're comfortable with" },
                                        { icon: "⚙️", text: "Change preferences anytime", desc: "Update in your browser settings" },
                                        { icon: "🔄", text: "Clear cookies whenever you want", desc: "Full control over your data" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-4 bg-white p-5 rounded-xl">
                                            <span className="text-2xl">{item.icon}</span>
                                            <div>
                                                <p className="text-blue-900 font-bold text-lg">{item.text}</p>
                                                <p className="text-blue-700">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Section 4 */}
                        <section>
                            <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-slate-200 text-slate-900 text-lg font-black">4</span>
                                Third-Party Cookies
                            </h2>
                            <div className="bg-slate-50 border-l-4 border-slate-400 p-6 rounded-r-xl">
                                <p className="text-slate-700 leading-relaxed text-lg">
                                    Some analytics tools may set cookies based on your consent. We only work with trusted providers.
                                </p>
                            </div>
                        </section>

                        {/* Help Section */}
                        <div className="bg-gradient-to-r from-amber-100 to-amber-50 border-2 border-amber-300 p-8 rounded-2xl">
                            <div className="flex items-start gap-4">
                                <span className="text-4xl">💡</span>
                                <div>
                                    <h3 className="text-2xl font-black text-amber-900 mb-3">Cookie Preferences</h3>
                                    <p className="text-amber-800 text-lg">
                                        You can manage your cookie preferences at any time using the cookie consent banner that appears when you first visit our site.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Cookies;
