import { Eye, EyeClosed, Rows } from "lucide-react";
import React, { useState } from "react";

interface props {
    label?: string,
    placeholder?: string,
    isImportant?: boolean
    value?: string,
    setValue?: (value: string) => void
    data?: any[]
}

const DropDown:React.FC<props> = ({label, placeholder, isImportant, value, setValue, data}) => {

    return(
        <div className="w-full flex flex-col gap-2">
            <p className="font-bold">{label ? isImportant ? <div className="flex flex-row gap-1"><p>{label}</p><p className="text-red-500">*</p></div> : <p>{label}</p> : ""}</p>
            <div className={`flex flex-row items-center rounded-lg bg-[#1e1e1e] text-white `}>
                <div className="w-full flex flex-row items-center px-2">
                    <select value={value} onChange={(e)=>setValue?.(e.target.value)} className={`w-full p-2 bg-[#1e1e1e] rounded-lg outline-none`}> 
                        {data?.map((item, index)=>(
                            <option key={index} value={item}>{item}</option>
                        ))}
                    </select>
                </div>             
            </div>
        </div>
    )
}

export default DropDown
