// src/pages/loans/LoanDetails.jsx
import React from 'react';
import { useParams } from 'react-router-dom';

const LoanDetails = () => {
    const { loanId } = useParams();

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Loan Details</h1>
                <p className="text-gray-600">Details for loan {loanId} will appear here...</p>
            </div>
        </div>
    );
};

export default LoanDetails;