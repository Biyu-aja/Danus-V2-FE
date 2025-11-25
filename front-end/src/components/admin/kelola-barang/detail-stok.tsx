import React, { useEffect, useState } from "react";
import InputText from "../../general/input";
import Liner from "../../general/liner";
import { Banknote, BanknoteIcon, BoxIcon, HandCoinsIcon, HandHelpingIcon, WalletIcon } from "lucide-react";

interface props{
    data?:any;
}

const DetailStok:React.FC<props> = ({data}) =>{
    const [catatan, setCatatan] = useState("");

    useEffect(() => {
        if (!data) return;

        if (data.catatan?.trim() === "" || data.catatan == null) {
            setCatatan("Tidak ada catatan untuk item ini.");
        } else {
            setCatatan(data.catatan);
        }
    }, [data]);
    return(
        <div className="absolute bg-[#1e1e1e] border border-[#4f4f4f] w-[90%] p-4 rounded-xl" onClick={(e)=>e.stopPropagation()}>
            <p className="font-bold text-[1.25rem]">{data.nama_item}</p>
            <Liner />
            <div className="flex flex-col font-semibold gap-1">
                <p className="flex flex-row gap-1"><BoxIcon /> Stok: {data.stok_tersisa}</p>
                <p className="flex flex-row gap-1"><BanknoteIcon /> Harga: {data.harga_item}</p>
                <p className="flex flex-row gap-1"><WalletIcon /> Modal: {data.modal}</p>
                <p className="flex flex-row gap-1"><HandHelpingIcon /> Ambil: {data.jumlah_ambil}</p>
                <p className="flex flex-row gap-1"><HandCoinsIcon />Setor: {data.jumlah_setor}</p>
                <InputText isTextarea={true} rows={4} value={catatan} label="Catatan" readonly/>
            </div>
            <button className="w-full font-semibold p-1 mt-2 bg-[#B09331] rounded-lg">Edit Stock</button>
        </div>
    )
};

export default DetailStok