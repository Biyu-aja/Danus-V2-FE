import React from "react";

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
        <div className="bg-[#B09331] flex flex-col p-4 rounded-xl">
            <div className="text-white/75 font-bold">Total Saldo</div>
            <div className="flex w-full justify-center">
                <p className="text-[2.25rem] font-semibold">
                    {isLoading ? "..." : saldo !== undefined ? formatRupiah(saldo) : "0"}
                </p>
            </div>
        </div>
    );
};

export default Total_Saldo;