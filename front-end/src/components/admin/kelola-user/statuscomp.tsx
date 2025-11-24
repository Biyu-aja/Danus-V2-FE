import React, { useEffect, useState } from "react";

interface props{
    status: any
}

const StatusComp:React.FC<props> = ({status}) => {
    const [title, setTitle] = useState("")
    useEffect(() => {
        if (!status) return;

        else{
            if(status === "sudah-ambil") setTitle("Sudah Ambil")
            else if(status === "belum-ambil") setTitle("Belum Ambil")
            else if(status === "sudah-setor") setTitle("Sudah Setor")
        }
    }, [])

    
    return(
        <div className={`   ${status === "sudah-setor" && "bg-[#4C7600]/55 border-[#375500] text-[#c4ff55]"} 
                            ${status === "sudah-ambil" && "bg-[#F8C300]/55 border-[#C99A00] text-[#FFF5B3]"}
                            ${status === "belum-ambil" && "bg-[#D40000]/55 border-[#990000] text-[#FFB3B3]"}
                            font-semibold border-2 px-2 rounded-full`}>
            <p>{title}</p>
        </div>
    )
}

export default StatusComp