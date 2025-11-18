// src/components/forms/LoginForm.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/useAuth';
import { loginSchema } from '../../lib/validations';
import Button from '../ui/Button';
import Input from '../ui/Input';

const LoginForm = ({ onSuccess }) => {
    const { login, loading } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        const result = await login(data);
        if (result.success && onSuccess) {
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                </label>
                <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    error={errors.email?.message}
                    {...register('email')}
                />
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                </label>
                <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    error={errors.password?.message}
                    {...register('password')}
                />
            </div>

            <Button
                type="submit"
                className="w-full"
                isLoading={loading}
            >
                Sign In
            </Button>
        </form>
    );
};

export default LoginForm;