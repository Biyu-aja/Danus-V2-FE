import React from "react";
import type { TrendingUp, TrendingDown, Package, CheckCircle, LucideIcon } from "lucide-react";

interface CardItemProps {
    label: string;
    value: string;
    icon?: LucideIcon;
    variant?: 'default' | 'income' | 'expense' | 'info';
    prefix?: string;
    onClick?: () => void;
}

const CardItem: React.FC<CardItemProps> = ({ 
    label, 
    value, 
    icon: Icon,
    variant = 'default',
    prefix,
    onClick 
}) => {
    const variants = {
        default: {
            bg: 'bg-[#1e1e1e]',
            border: 'border-[#333]',
            iconBg: 'bg-[#B09331]/10',
            iconColor: 'text-[#B09331]',
            valueColor: 'text-white',
        },
        income: {
            bg: 'bg-[#1e1e1e]',
            border: 'border-green-500/20',
            iconBg: 'bg-green-500/10',
            iconColor: 'text-green-400',
            valueColor: 'text-green-400',
        },
        expense: {
            bg: 'bg-[#1e1e1e]',
            border: 'border-red-500/20',
            iconBg: 'bg-red-500/10',
            iconColor: 'text-red-400',
            valueColor: 'text-red-400',
        },
        info: {
            bg: 'bg-[#1e1e1e]',
            border: 'border-blue-500/20',
            iconBg: 'bg-blue-500/10',
            iconColor: 'text-blue-400',
            valueColor: 'text-blue-400',
        },
    };

    const style = variants[variant];

    return (
        <div 
            className={`${style.bg} flex flex-col w-full p-3 rounded-xl border ${style.border} ${onClick ? 'cursor-pointer hover:brightness-110 transition-all' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-center gap-2 mb-1">
                {Icon && (
                    <div className={`p-1.5 rounded-lg ${style.iconBg}`}>
                        <Icon className={`w-4 h-4 ${style.iconColor}`} />
                    </div>
                )}
                <p className="text-[#888] text-xs font-medium">{label}</p>
            </div>
            <p className={`text-lg font-bold ${style.valueColor}`}>
                {prefix}{value}
            </p>
        </div>
    );
};

export default CardItem;