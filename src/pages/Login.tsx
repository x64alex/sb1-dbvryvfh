import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

type Step = 'phone' | 'verify';

export const Login: React.FC = () => {
    const { login, verifyLogin } = useAuth();
    const [step, setStep] = useState<Step>('phone');
    const [formData, setFormData] = useState({
        phoneNumber: '',
        code: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (step === 'phone') {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            if (step === 'phone') {
                const response = await login(formData.phoneNumber);
                toast.success(response.message);
                setStep('verify');
            } else {
                await verifyLogin({
                    phoneNumber: formData.phoneNumber,
                    code: formData.code
                });
                toast.success('Login successful!');
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
                        {step === 'phone' ? 'Sign in to your account' : 'Enter verification code'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {step === 'phone' ? (
                            <>
                                Or{' '}
                                <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                                    create a new account
                                </Link>
                            </>
                        ) : (
                            'Check your phone for the verification code'
                        )}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {step === 'phone' ? (
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
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {step === 'phone' ? 'Continue' : 'Verify'}
                        </button>
                    </div>
                </form>

                {step === 'phone' && (
                    <div className="text-center">
                        <Link
                            to="/forgot-pin"
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            Forgot your PIN?
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};
