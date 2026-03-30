import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, Lock, ArrowLeft } from 'lucide-react';

const MockCheckout = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id') || 'mock_session_id';
    const provider = searchParams.get('provider') || 'stripe';
    const orderId = searchParams.get('orderId');
    const [loading, setLoading] = useState(false);

    const isRazorpay = provider === 'razorpay';
    const amount = isRazorpay ? '₹2,900.00' : '$20.00';

    const handlePay = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate processing time
        setTimeout(() => {
            navigate(`/success?session_id=${sessionId}&provider=${provider}`);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col md:flex-row">
            {/* Order Summary Side */}
            <div className={`w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center border-r border-neutral-900 ${isRazorpay ? 'bg-indigo-950/10' : 'bg-neutral-900/20'}`}>
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-12"
                >
                    <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
                
                <div className="max-w-md">
                    <h2 className={`${isRazorpay ? 'text-blue-400' : 'text-indigo-400'} font-semibold mb-2`}>
                        {isRazorpay ? 'Checkout with Razorpay' : 'Subscribe to Pro'}
                    </h2>
                    <h1 className="text-4xl font-bold mb-8">{amount} <span className="text-neutral-500 text-lg font-normal">per month</span></h1>
                    
                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between py-2 border-b border-neutral-800">
                            <span className="text-neutral-400">Pro Plan (Monthly)</span>
                            <span>{amount}</span>
                        </div>
                        <div className="flex justify-between py-2 font-bold text-lg">
                            <span>Total Due</span>
                            <span>{amount}</span>
                        </div>
                    </div>
                    {isRazorpay && orderId && (
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-sm text-blue-300">
                            Order ID: <span className="font-mono">{orderId}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Form Side */}
            <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-neutral-950">
                <div className="max-w-md w-full mx-auto">
                    <div className="flex items-center gap-2 mb-8 text-neutral-400 text-sm font-medium">
                        <Lock className="w-3.5 h-3.5" />
                        TEST MODE ({isRazorpay ? 'Razorpay' : 'Stripe'} Mock)
                    </div>

                    <form onSubmit={handlePay} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">Email</label>
                            <input 
                                type="email" 
                                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono"
                                defaultValue="test@example.com"
                                required
                            />
                        </div>

                        {isRazorpay ? (
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Phone Number</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                                    placeholder="+91 99999 99999"
                                    required
                                />
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-2">Card information</label>
                                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                                        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800">
                                            <CreditCard className="w-5 h-5 text-neutral-500" />
                                            <input 
                                                type="text" 
                                                placeholder="4242 4242 4242 4242"
                                                className="bg-transparent w-full focus:outline-none font-mono"
                                                required
                                            />
                                        </div>
                                        <div className="flex">
                                            <input 
                                                type="text" 
                                                placeholder="MM / YY"
                                                className="w-1/2 p-3 bg-transparent border-r border-neutral-800 focus:outline-none text-center font-mono"
                                                required
                                            />
                                            <input 
                                                type="text" 
                                                placeholder="CVC"
                                                className="w-1/2 p-3 bg-transparent focus:outline-none text-center font-mono"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-2">Name on card</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        placeholder="Jane Doe"
                                        required
                                    />
                                </div>
                            </>
                        )}

                        <button 
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 ${isRazorpay ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'} text-white rounded-xl font-semibold shadow-lg transition-all active:scale-[0.98] disabled:opacity-50`}
                        >
                            {loading ? 'Processing...' : `Pay with ${isRazorpay ? 'Razorpay' : 'Mock Card'}`}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-neutral-500 text-xs">
                        This is a secure mock payment interface. No real charging will occur.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MockCheckout;
