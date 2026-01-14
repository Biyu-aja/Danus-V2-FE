import React from "react";
import Liner from "../liner";
import AbsenComp from "./absen-comp";

interface props{
    id?: number
    data?: any
}

const AbsenForm:React.FC<props> = ({data}) => {

    return(
        <div className="flex flex-col" onClick={(e)=>e.stopPropagation()}>
            <p className="text-[1.15rem] font-bold">Absen {data.nama}</p>
            <Liner />
            <p className="font-bold mb-1">List Barang Yang Diambil</p>
                <AbsenComp id={1} />
            <div className="w-full flex justify-end mt-2">
                <button className="p-1 px-6 rounded-md bg-[#2e2e2e]">Save Changes</button>
            </div>
        
        </div>
    )
}

export default AbsenForm