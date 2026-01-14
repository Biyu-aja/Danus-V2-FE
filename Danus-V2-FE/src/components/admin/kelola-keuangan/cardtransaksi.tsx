import React from "react";

interface props{
    id?: any,
    id_setoran?: any,
    title?: string,
    tipe?: string,
    nominal?: string,
    keterangan?: string,
    created_at?: string,
}

const CardTransaksi:React.FC<props> = ({id, id_setoran, title, tipe, nominal, keterangan, created_at}) =>{
    const nama = "Oguri Cap"
    const kepada = "Biyu"
    return(
        <div className="bg-[#1e1e1e] flex flex-col p-3 rounded-xl hover:scale-[102%] transition-all hover:bg-white/10">
            <span className="flex flex-row justify-between font-bold"><p>{id_setoran ? `Setoran Danus ${nama}`: `${title}`}</p><p className="font-medium">{created_at}</p></span>
            <p className="text-[#B09331] font-semibold">{`Rp.${nominal}`}</p>
        </div>
    )
}

export default CardTransaksi