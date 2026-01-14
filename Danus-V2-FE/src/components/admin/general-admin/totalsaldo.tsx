import React from "react";
import { Wallet } from "lucide-react";

interface TotalSaldoProps {
    saldo?: number;
    isLoading?: boolean;
}

const Total_Saldo: React.FC<TotalSaldoProps> = ({ saldo, isLoading }) => {
    // Format number ke Rupiah
    const formatRupiah = (num: number) => {
        return new Intl.NumberFormat('id-ID').format(num);
    };

    return (
        <div className="bg-gradient-to-br from-[#B09331] to-[#8B7429] rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 text-white/70 mb-1">
                <Wallet className="w-4 h-4" />
                <span className="text-sm font-medium">Total Saldo</span>
            </div>
            <p className="text-white text-3xl font-bold">
                Rp {isLoading ? "..." : saldo !== undefined ? formatRupiah(saldo) : "0"}
            </p>
        </div>
    );
};

export default Total_Saldo;