import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/landing/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Award, Clock, Star, Receipt, Calendar, CreditCard, ChevronRight, Download, FileDown } from 'lucide-react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';

interface Bill {
    _id: string;
    amount: number;
    updatedAt: string;
    status: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    webinarId?: {
        name: string;
    };
}

const UserDashboard = () => {
    const { user, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    const [bills, setBills] = useState<Bill[]>([]);
    const [billsLoading, setBillsLoading] = useState(true);

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                navigate('/signin');
            } else if (user?.role === 'organizer') {
                navigate('/organizer/dashboard');
            } else {
                fetchBills();
            }
        }
    }, [user, isAuthenticated, loading, navigate]);

    const fetchBills = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payments/history`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setBills(data);
            }
        } catch (error) {
            console.error('Failed to fetch bills:', error);
        } finally {
            setBillsLoading(false);
        }
    };

    const generateBillPDF = (bill: Bill) => {
        const doc = new jsPDF();
        const dateStr = format(new Date(bill.updatedAt), 'MMM dd, yyyy');
        const timeStr = format(new Date(bill.updatedAt), 'hh:mm a');

        // Header Background
        doc.setFillColor(79, 70, 229); // indigo-600
        doc.rect(0, 0, 210, 40, 'F');

        // Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('CertifyPro', 20, 25);

        doc.setFontSize(14);
        doc.text('PAYMENT RECEIPT', 140, 25);

        // Reset text color
        doc.setTextColor(31, 41, 55); // grey-800

        // Bill Info Section
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('BILL TO:', 20, 55);
        doc.setFont('helvetica', 'normal');
        doc.text(`${user?.name || 'User'}`, 20, 62);
        doc.text(`${user?.email || ''}`, 20, 68);

        doc.setFont('helvetica', 'bold');
        doc.text('RECEIPT DETAILS:', 130, 55);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date: ${dateStr}`, 130, 62);
        doc.text(`Time: ${timeStr}`, 130, 68);
        doc.text(`Status: ${bill.status.toUpperCase()}`, 130, 74);

        // Table Header
        doc.setFillColor(243, 244, 246); // grey-100
        doc.rect(20, 90, 170, 10, 'F');
        doc.setFont('helvetica', 'bold');
        doc.text('DESCRIPTION', 25, 97);
        doc.text('PAYMENT ID', 100, 97);
        doc.text('AMOUNT', 170, 97);

        // Table Row
        doc.setFont('helvetica', 'normal');
        doc.text(bill.webinarId?.name || 'Registered Module', 25, 110);
        doc.setFontSize(8);
        doc.text(bill.razorpayPaymentId || 'N/A', 100, 110);
        doc.setFontSize(10);
        doc.text(`INR ${bill.amount}.00`, 170, 110);

        // Subtotal & Total
        doc.line(20, 120, 190, 120);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL PAID:', 140, 130);
        doc.setTextColor(79, 70, 229);
        doc.text(`INR ${bill.amount}.00`, 170, 130);

        // Order Info
        doc.setTextColor(156, 163, 175); // grey-400
        doc.setFontSize(8);
        doc.text(`Razorpay Order ID: ${bill.razorpayOrderId || 'N/A'}`, 20, 150);
        doc.text(`Transaction unique ID: ${bill._id}`, 20, 155);

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128); // grey-500
        doc.text('This is a computer-generated receipt and does not require a signature.', 105, 270, { align: 'center' });
        doc.setTextColor(79, 70, 229);
        doc.text('Thank you for using CertifyPro!', 105, 275, { align: 'center' });

        doc.save(`CertifyPro_Receipt_${bill._id.substring(0, 8)}.pdf`);
    };

    if (loading || !user || user.role !== 'participant') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col text-slate-900 relative overflow-hidden dashboard-mixed-bg">
            {/* Dark Marketing Header Wrapper */}
            <div className="relative z-20 w-full bg-[#0A0F1E] shadow-xl border-b-[1px] border-indigo-500/10">
                <Header />
            </div>

            <main className="flex-1 py-12 px-4 relative z-10">
                <div className="container max-w-6xl mx-auto space-y-10">
                    {/* Heading Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#38BDF8]/10 rounded-lg border border-[#38BDF8]/20 shadow-sm">
                                <LayoutDashboard className="h-6 w-6 text-[#38BDF8]" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight text-slate-900">Student Dashboard</h1>
                                <p className="text-slate-500 font-medium">Welcome back, {user.name}</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        <Card className="border-none shadow-sm bg-white/80 backdrop-blur-md transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">My Certificates</CardTitle>
                                <Award className="h-5 w-5 text-[#38BDF8] group-hover:scale-110 transition-transform" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-slate-900">0</div>
                                <p className="text-xs text-slate-500 font-medium mt-1">Verified achievements</p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm bg-white/80 backdrop-blur-md transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Registrations</CardTitle>
                                <Clock className="h-5 w-5 text-amber-500 group-hover:rotate-12 transition-transform" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-slate-900">{bills.length}</div>
                                <p className="text-xs text-slate-500 font-medium mt-1">Paid modules</p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm bg-white/80 backdrop-blur-md transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Total Spent</CardTitle>
                                <CreditCard className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-slate-900">₹{bills.reduce((acc, b) => acc + (b.amount || 0), 0)}</div>
                                <p className="text-xs text-slate-500 font-medium mt-1">Lifetime investment</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* My Bills / Payment History Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-indigo-600" />
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Purchase History & Bills</h2>
                        </div>

                        <Card className="border-none shadow-sm bg-white/90 backdrop-blur-md overflow-hidden transition-all duration-300">
                            <CardContent className="p-0">
                                {billsLoading ? (
                                    <div className="p-12 text-center text-slate-400">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                        <p>Fetching your bills...</p>
                                    </div>
                                ) : bills.length > 0 ? (
                                    <div className="divide-y divide-slate-100">
                                        {bills.map((bill) => (
                                            <div key={bill._id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-slate-50/50 transition-colors gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                                                        <Receipt className="h-6 w-6 text-indigo-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-900 text-lg">{bill.webinarId?.name || 'Registered Module'}</h3>
                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                                            <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                                                                <Calendar className="h-3.5 w-3.5" />
                                                                {format(new Date(bill.updatedAt), 'MMM dd, yyyy')}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                                                                <Clock className="h-3.5 w-3.5" />
                                                                {format(new Date(bill.updatedAt), 'hh:mm a')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                                    <div className="text-right">
                                                        <p className="text-xl font-black text-slate-900 tracking-tight">₹{bill.amount}</p>
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 uppercase tracking-wider">
                                                            {bill.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => generateBillPDF(bill)}
                                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all font-bold text-xs"
                                                        >
                                                            <FileDown className="h-3.5 w-3.5" />
                                                            Download Bill
                                                        </button>
                                                        <button className="h-10 w-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                                                            <ChevronRight className="h-5 w-5 text-slate-400" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-16 text-center space-y-4">
                                        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100 shadow-sm">
                                            <Receipt className="h-8 w-8 text-slate-300" />
                                        </div>
                                        <div className="max-w-xs mx-auto">
                                            <h3 className="font-bold text-slate-900">No transactions found</h3>
                                            <p className="text-slate-500 text-sm mt-1">
                                                When you register for paid events, your receipts will appear here automatically.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Certificates Section (Existing) */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-[#38BDF8]" />
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Recent Certificates</h2>
                        </div>
                        <Card className="border-none shadow-sm bg-white/90 backdrop-blur-md p-12 text-center space-y-4 relative overflow-hidden transition-all duration-300 hover:shadow-md">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#38BDF8]/10 rounded-full blur-[60px] pointer-events-none z-0"></div>
                            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100 shadow-sm relative z-10">
                                <Award className="h-10 w-10 text-[#38BDF8]" />
                            </div>
                            <div className="max-w-md mx-auto space-y-2 relative z-10">
                                <h2 className="text-xl font-bold text-slate-900">No certificates yet</h2>
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    Once you complete a module and an organizer issues your certificate, it will appear here instantly.
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;
