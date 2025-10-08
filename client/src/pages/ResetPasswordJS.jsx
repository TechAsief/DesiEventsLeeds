import React, { useState, useEffect } from 'react';

const ResetPasswordJS = () => {
    const [token, setToken] = useState(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenParam = urlParams.get('token');
        if (tokenParam) {
            setToken(tokenParam);
        } else {
            setMessage('Invalid reset link - no token found');
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setMessage('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
                credentials: 'include'
            });

            const data = await response.json();
            
            if (response.ok) {
                setIsSuccess(true);
                setMessage('Password reset successful! You can now log in with your new password.');
            } else {
                setMessage(data.message || 'Failed to reset password');
            }
        } catch (error) {
            setMessage('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="max-w-md mx-auto p-8 bg-white shadow-xl rounded-xl">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-green-600 mb-2">Password Reset Successful!</h2>
                        <p className="text-gray-600 mb-6">
                            Your password has been updated successfully. You can now log in with your new password.
                        </p>
                        <button
                            onClick={() => window.location.href = '/login'}
                            className="w-full px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition duration-150"
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="max-w-md mx-auto p-8 bg-white shadow-xl rounded-xl">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-red-600 mb-2">Invalid Reset Link</h2>
                        <p className="text-gray-600 mb-6">
                            This password reset link is invalid or has expired. Please request a new password reset link.
                        </p>
                        <button
                            onClick={() => window.location.href = '/login'}
                            className="w-full px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition duration-150"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md mx-auto p-8 bg-white shadow-xl rounded-xl">
                <h2 className="text-3xl font-bold text-center text-orange-600 mb-6">
                    Reset Your Password
                </h2>
                <p className="text-center text-gray-600 mb-6">
                    Enter your new password below
                </p>
                
                {message && (
                    <div className={`mb-4 p-3 rounded-lg text-center ${
                        message.includes('successful') 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                    }`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Enter your new password"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Confirm your new password"
                            required
                        />
                    </div>

                    <div className="text-xs text-gray-500">
                        <ul className="list-disc list-inside space-y-1">
                            <li>Password must be at least 6 characters long</li>
                            <li>Use a combination of letters, numbers, and symbols for better security</li>
                        </ul>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition duration-150 disabled:bg-gray-400 shadow-md"
                    >
                        {loading ? 'Updating Password...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordJS;
