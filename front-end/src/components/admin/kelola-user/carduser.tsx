import React from "react";
import StatusComp from "./statuscomp";
import { BoxIcon } from "lucide-react";

interface props{
    id?: any,
    nama?: string,
    status?: any,
    jumlah_ambil?: number
}

const CardUser:React.FC<props> = ({id, nama, status, jumlah_ambil}) => {
    return(
        <div className="bg-[#2e2e2e] flex flex-row p-2 rounded-xl hover:scale-[102%] transition-all hover:bg-white/30 cursor-pointer">
            <img src="/image/pfp.jpg" className="w-[5rem] h-[5rem] object-cover rounded-2xl" />
            <div className="flex flex-col w-full pl-2">
                <div className="flex flex-row justify-between items-center">
                    <p className="text-[1.15rem]">{nama}</p>
                    <StatusComp status={status}/>
                </div>
                <div className="h-full flex flex-row items-center gap-1"><BoxIcon /><p className="font-semibold">{jumlah_ambil}</p></div>
            </div>
        </div>
    )
}

export default CardUser