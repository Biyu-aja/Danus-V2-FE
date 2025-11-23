import { BoxIcon, HandCoinsIcon, ShoppingCart } from "lucide-react";
import React from "react";

interface props{
    nama_item?: string,
    harga_item?: string,
    jumlah_ambil?: number,
    stok_tersisa?: number,
    jumlah_setor?: number
}

const StokCard:React.FC<props> = ({nama_item, harga_item, jumlah_ambil, stok_tersisa, jumlah_setor}) => {
    return(
        <div className="relative w-[10rem] h-[10rem] rounded-xl hover:scale-[105%] cursor-pointer transition-all">
            <img src="/image/pfp.jpg" className="object-cover rounded-xl w-[10rem] h-[10rem]" />
            <div className="absolute bottom-0 w-full">
                <p className="font-extrabold ml-2 text-stroke">{nama_item}</p>
                <p className="font-extrabold ml-2 text-stroke">Rp.{harga_item}</p>
                <div className="bg-[#B09331] w-full flex flex-row justify-between rounded-b-xl px-2 p-1">
                    <div className="flex flex-row scale-75 gap-1"><ShoppingCart />{jumlah_ambil}</div>
                    <div className="flex flex-row scale-75 gap-1"><BoxIcon />{stok_tersisa}</div>
                    <div className="flex flex-row scale-75 gap-1"><HandCoinsIcon />{jumlah_setor}</div>
                </div>
            </div>
        </div>
    )
}

export default StokCard