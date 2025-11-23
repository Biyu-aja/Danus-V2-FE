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
        <div className="bg-[#1e1e1e] flex flex-col p-2 rounded-xl">
            <span className="flex flex-row justify-between"><p>{id_setoran ? `Setoran: ${nama}`: `${title}`}</p><p>{created_at}</p></span>
            {id_setoran && <p>{`Kepada: ${kepada}`}</p>}
            <p>{`Keterangan: ${keterangan ? keterangan : "-"}`}</p>
            <p>{`Nominal: Rp. ${nominal}`}</p>
        </div>
    )
}

export default CardTransaksi