import React, { useState } from "react";
import StatusComp from "./statuscomp";
import { BoxIcon } from "lucide-react";
import InputText from "../../general/input";
import AbsenForm from "../../general/absen/absen-form";

interface props{
    data?: any
    isOpen?: boolean
    onclose?: ()=>void
    
}

const DetailUser:React.FC<props> = ({data, isOpen, onclose}) => {
    const datastatis = ([
        {id: 1, nama: "Oguri Cap", status: "belum-ambil", jumlah_ambil:1023, catatan: "This guy eat to much bruh"}
    ])
    const user = data
    const [showing, setShowing] = useState("detail-user")

    const handleShowAbsen = (data:any) => {
        setShowing("absen-form");
    }
    return(
        <div className="absolute bg-[#1e1e1e] border border-[#4f4f4f    ] w-[90%] p-4 rounded-xl" onClick={(e)=>e.stopPropagation()}>
            {
                showing === "detail-user" ?
                    <div className="flex flex-col gap-3">
                    <div className="flex flex-row justify-between items-center">
                        <p className="text-[1.15rem] font-bold">{user.nama}</p>
                        <StatusComp status={user.status} />
                    </div>
                    <div className="bg-[#2e2e2e] p-3 rounded-lg flex flex-col gap-2">
                        <p>Data Hari Ini</p>
                        <button className="bg-[#1e1e1e] w-full p-1 rounded-lg hover:bg-white/20" onClick={()=>handleShowAbsen(user)}>Lihat Detail</button>
                    </div>
                    <div className="bg-[#2e2e2e] flex flex-row gap-2 p-2 rounded-lg items-center">
                        <BoxIcon />
                        <p className="text-[1.05rem] font-bold">Jumlah Pengambilan: {user.jumlah_ambil}</p>
                    </div>
                    <div className="bg-[#2e2e2e] flex flex-col gap-2 p-2 rounded-lg">
                        <p>Catatan User</p>
                        <InputText isTextarea={true} rows={4} value={user.catatan} />
                    </div>
                    <div className="flex flex-row gap-3">
                        <button className="bg-[#2e2e2e] p-2 w-full rounded-lg font-semibold hover:bg-white/20">Edit User</button>
                        <button className="bg-[#2e2e2e] p-2 w-full rounded-lg font-semibold hover:bg-white/20">Edit Status</button>
                    </div>
                </div>
                :
                <AbsenForm data={user} />
            }
        </div>
    )
}

export default DetailUser