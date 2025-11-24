import { Eye, EyeClosed, Rows } from "lucide-react";
import React, { useState } from "react";

interface props {
    rows? : number,
    isTextarea?: boolean,
    isPassword?: boolean,
    label?: string,
    placeholder?: string,
    isImportant?: boolean
    value?: string,
    setValue?: (value: string) => void
}

const InputText:React.FC<props> = ({isPassword, label, placeholder, isImportant, value, setValue, isTextarea, rows}) => {
    const [showPassword, setShowPassword] = useState(false)
    return(
        <div className="w-full flex flex-col gap-2">
            <p className="font-bold">{label ? isImportant ? <div className="flex flex-row gap-1"><p>{label}</p><p className="text-red-500">*</p></div> : <p>{label}</p> : ""}</p>
            <div className="flex flex-row items-center rounded-lg">
                {!isTextarea ?
                    <div className="w-full flex flex-row items-center">
                        <input value={value} onChange={(e)=>setValue?.(e.target.value)} type={isPassword ? showPassword ? "text" : "password" : "text"} className="w-full p-2 bg-[#1e1e1e] text-white rounded-lg outline-none" placeholder={placeholder ? `${placeholder}` : ""} /> <button className="outline-none" onClick={()=>setShowPassword(!showPassword)}>{isPassword ? showPassword ? <div><Eye className="text-black" /></div> : <div><EyeClosed className="text-black" /></div> : "" }</button> 
                    </div>
                    :
                    <div className="w-full">
                        <textarea value={value} onChange={(e)=>setValue?.(e.target.value)} rows={rows} className="w-full p-2 bg-[#1e1e1e] text-white rounded-lg outline-none" placeholder={placeholder ? `${placeholder}` : ""} />
                    </div>
                }                
            </div>
        </div>
    )
}

export default InputText
