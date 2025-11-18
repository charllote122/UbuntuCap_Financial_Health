// src/lib/validations.js
import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone_number: z.string().min(10, 'Valid phone number is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string(),
    id_number: z.string().min(5, 'Valid ID number is required'),
}).refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
});

export const loanApplicationSchema = z.object({
    amount: z.number().min(1000, 'Minimum loan amount is KES 1,000').max(1000000, 'Maximum loan amount is KES 1,000,000'),
    purpose: z.string().min(1, 'Loan purpose is required'),
    repayment_period: z.number().min(1, 'Repayment period is required'),
    employment_status: z.string().min(1, 'Employment status is required'),
    monthly_income: z.number().min(1, 'Monthly income is required'),
});

export const profileSchema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone_number: z.string().min(10, 'Valid phone number is required'),
    id_number: z.string().min(5, 'Valid ID number is required'),
    date_of_birth: z.string().optional(),
    gender: z.string().optional(),
    occupation: z.string().optional(),
    monthly_income: z.number().optional(),
});