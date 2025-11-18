// src/components/common/LoadingSpinner.jsx
import { cn } from '../../lib/utils';

const LoadingSpinner = ({ size = 'md', className }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <div className={cn("flex items-center justify-center", className)}>
            <div className={cn(
                "animate-spin rounded-full border-b-2 border-blue-600",
                sizes[size]
            )}></div>
        </div>
    );
};

export default LoadingSpinner;