import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthProvider';
import { authApi } from '../network/api';

type Step = 'details' | 'verify';

export const SignUp: React.FC = () => {
    const { signup, verifySignup } = useAuth();
    const [step, setStep] = useState<Step>('details');
    const [formData, setFormData] = useState({
        email: '',
        phoneNumber: '',
        code: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [resendTimer, setResendTimer] = useState(0);

    // Handle countdown timer for resend button
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setInterval(() => {
                setResendTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [resendTimer]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (step === 'details') {
            if (!formData.email) {
                newErrors.email = 'Email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = 'Invalid email format';
            }

            if (!formData.phoneNumber) {
                newErrors.phoneNumber = 'Phone number is required';
            } else if (!/^\+[1-9]\d{1,14}$/.test(formData.phoneNumber)) {
                newErrors.phoneNumber = 'Invalid phone number format (e.g., +1234567890)';
            }
        } else {
            if (!formData.code) {
                newErrors.code = 'Verification code is required';
            } else if (!/^\d{6}$/.test(formData.code)) {
                newErrors.code = 'Code must be 6 digits';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleResendCode = async () => {
        if (resendTimer > 0) return;

        try {
            const response = await authApi.resendCode({
                phoneNumber: formData.phoneNumber,
                type: 'signup'
            });
            toast.success(response.message);
            setResendTimer(60); // Start 60-second countdown
        } catch (error: any) {
            if (error.response?.data?.remainingTime) {
                setResendTimer(error.response.data.remainingTime);
            }
            toast.error(error.response?.data?.message || 'Error resending code');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            if (step === 'details') {
                const response = await signup({
                    email: formData.email,
                    phoneNumber: formData.phoneNumber
                });
                toast.success(response.message);
                setStep('verify');
                setResendTimer(60); // Start initial 60-second countdown
            } else {
                await verifySignup({
                    phoneNumber: formData.phoneNumber,
                    code: formData.code
                });
                toast.success('Sign up successful!');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'An error occurred');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        {step === 'details' ? 'Create your account' : 'Verify your phone'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {step === 'details' ? (
                            <>
                                Already have an account?{' '}
                                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                    Sign in
                                </Link>
                            </>
                        ) : (
                            'Enter the verification code sent to your phone'
                        )}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {step === 'details' ? (
                        <>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email Address
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                            errors.email ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="you@example.com"
                                    />
                                    {errors.email && (
                                        <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                                    Phone Number
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        type="tel"
                                        required
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                            errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="+1234567890"
                                    />
                                    {errors.phoneNumber && (
                                        <p className="mt-2 text-sm text-red-600">{errors.phoneNumber}</p>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                                Verification Code
                            </label>
                            <div className="mt-1">
                                <input
                                    id="code"
                                    name="code"
                                    type="text"
                                    required
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                        errors.code ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter 6-digit code"
                                />
                                {errors.code && (
                                    <p className="mt-2 text-sm text-red-600">{errors.code}</p>
                                )}
                                <div className="mt-2 text-right">
                                    <button
                                        type="button"
                                        onClick={handleResendCode}
                                        disabled={resendTimer > 0}
                                        className={`text-sm ${
                                            resendTimer > 0
                                                ? 'text-gray-400 cursor-not-allowed'
                                                : 'text-blue-600 hover:text-blue-500'
                                        }`}
                                    >
                                        {resendTimer > 0
                                            ? `Resend code in ${resendTimer}s`
                                            : 'Resend code'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {step === 'details' ? 'Continue' : 'Verify'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
