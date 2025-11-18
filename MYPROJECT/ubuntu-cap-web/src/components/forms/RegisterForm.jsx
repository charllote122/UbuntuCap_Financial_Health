// src/components/forms/RegisterForm.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/useAuth';
import { registerSchema } from '../../lib/validations';
import Button from '../ui/Button';
import Input from '../ui/Input';

const RegisterForm = ({ onSuccess }) => {
    const { register: registerUser, loading } = useAuth();
    const [step, setStep] = useState(1);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data) => {
        // Remove confirm_password before sending to API
        const { confirm_password, ...userData } = data;
        const result = await registerUser(userData);
        if (result.success && onSuccess) {
            onSuccess();
        }
    };

    const nextStep = () => setStep(2);
    const prevStep = () => setStep(1);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {step === 1 && (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                                First Name
                            </label>
                            <Input
                                id="first_name"
                                placeholder="John"
                                error={errors.first_name?.message}
                                {...register('first_name')}
                            />
                        </div>
                        <div>
                            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name
                            </label>
                            <Input
                                id="last_name"
                                placeholder="Doe"
                                error={errors.last_name?.message}
                                {...register('last_name')}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            error={errors.email?.message}
                            {...register('email')}
                        />
                    </div>

                    <div>
                        <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                        </label>
                        <Input
                            id="phone_number"
                            placeholder="0712345678"
                            error={errors.phone_number?.message}
                            {...register('phone_number')}
                        />
                    </div>

                    <Button type="button" onClick={nextStep} className="w-full">
                        Continue
                    </Button>
                </>
            )}

            {step === 2 && (
                <>
                    <div>
                        <label htmlFor="id_number" className="block text-sm font-medium text-gray-700 mb-1">
                            ID Number
                        </label>
                        <Input
                            id="id_number"
                            placeholder="12345678"
                            error={errors.id_number?.message}
                            {...register('id_number')}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Create a password"
                            error={errors.password?.message}
                            {...register('password')}
                        />
                    </div>

                    <div>
                        <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <Input
                            id="confirm_password"
                            type="password"
                            placeholder="Confirm your password"
                            error={errors.confirm_password?.message}
                            {...register('confirm_password')}
                        />
                    </div>

                    <div className="flex space-x-3">
                        <Button type="button" variant="secondary" onClick={prevStep} className="flex-1">
                            Back
                        </Button>
                        <Button type="submit" isLoading={loading} className="flex-1">
                            Create Account
                        </Button>
                    </div>
                </>
            )}
        </form>
    );
};

export default RegisterForm;