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
    isWhite?: boolean
    readonly?: boolean
}

const InputText:React.FC<props> = ({isPassword, label, placeholder, isImportant, value, setValue, isTextarea, rows, isWhite, readonly}) => {
    const [showPassword, setShowPassword] = useState(false)
    return(
        <div className="w-full flex flex-col gap-2">
            <div className="font-bold">{label ? isImportant ? <div className="flex flex-row gap-1"><p>{label}</p><p className="text-red-500">*</p></div> : <p>{label}</p> : ""}</div>
            <div className={`flex flex-row items-center rounded-lg border border-[#4f4f4f] ${isWhite ? "bg-white text-black" : "bg-[#1e1e1e] text-white"} `}>
                {!isTextarea ?
                    <div className="w-full flex flex-row items-center px-2">
                        <input value={value} onChange={(e)=>setValue?.(e.target.value)} readOnly={readonly}  type={isPassword ? showPassword ? "text" : "password" : "text"} className={`w-full p-2 ${isWhite ? "bg-white" : "bg-[#1e1e1e]"}  rounded-lg outline-none`} placeholder={placeholder ? `${placeholder}` : ""} /> <button className="outline-none" onClick={()=>setShowPassword(!showPassword)}>{isPassword ? showPassword ? <div><Eye /></div> : <div><EyeClosed /></div> : "" }</button> 
                    </div>
                    :
                    <div className="w-full px-2">
                        <textarea value={value} onChange={(e)=>setValue?.(e.target.value)} readOnly={readonly} rows={rows} className={`w-full p-2 ${isWhite ? "bg-white " : "bg-[#1e1e1e] "}  rounded-lg outline-none`} placeholder={placeholder ? `${placeholder}` : ""} />
                    </div>
                }                
            </div>
        </div>
    )
}

export default InputText
