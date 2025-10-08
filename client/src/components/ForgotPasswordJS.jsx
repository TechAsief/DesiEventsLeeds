import React, { useState } from 'react';

const ForgotPasswordJS = ({ onBack }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
                credentials: 'include'
            });

            const data = await response.json();
            
            if (response.ok) {
                setEmailSent(true);
                setMessage('Check your email for password reset instructions');
            } else {
                setMessage(data.message || 'Failed to send reset email');
            }
        } catch (error) {
            setMessage('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (emailSent) {
        return (
            <div className="max-w-md mx-auto mt-10 p-8 bg-white shadow-xl rounded-xl">
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                    <p className="text-gray-600 mb-6">
                        We've sent password reset instructions to your email address
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        If you don't see the email in your inbox, please check your spam folder.
                        The reset link will expire in 1 hour for security reasons.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={onBack}
                            className="w-full px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition duration-150"
                        >
                            Back to Login
                        </button>
                        <button
                            onClick={() => setEmailSent(false)}
                            className="w-full px-4 py-2 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition duration-150"
                        >
                            Try Different Email
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-8 bg-white shadow-xl rounded-xl">
            <h2 className="text-3xl font-bold text-center text-orange-600 mb-6">
                Forgot Password?
            </h2>
            <p className="text-center text-gray-600 mb-6">
                Enter your email address and we'll send you a link to reset your password
            </p>
            
            {message && (
                <div className={`mb-4 p-3 rounded-lg text-center ${
                    message.includes('Check your email') 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                }`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        placeholder="you@example.com"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition duration-150 disabled:bg-gray-400 shadow-md"
                >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button
                    onClick={onBack}
                    className="text-orange-600 hover:underline text-sm"
                >
                    ← Back to Login
                </button>
            </div>
        </div>
    );
};

export default ForgotPasswordJS;
