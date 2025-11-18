// src/pages/credit/CreditScore.jsx
import React from 'react';

const CreditScore = () => {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Credit Score</h1>
                <div className="text-center py-8">
                    <div className="text-6xl font-bold text-blue-600 mb-4">720</div>
                    <p className="text-gray-600">Good Credit Score</p>
                </div>
            </div>
        </div>
    );
};

export default CreditScore;