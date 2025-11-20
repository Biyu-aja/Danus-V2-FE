import { Eye, EyeClosed } from "lucide-react";
import React, { useState } from "react";

interface props {
    isPassword?: boolean,
    label?: string,
    placeholder?: string,
    isImportant?: boolean
    value?: string,
    setValue?: (value: string) => void
}

const InputText:React.FC<props> = ({isPassword, label, placeholder, isImportant, value, setValue}) => {
    const [showPassword, setShowPassword] = useState(false)
    return(
        <div className="w-full flex flex-col gap-2">
            <p className="font-bold">{label ? isImportant ? <div><p>{label}</p><p className="text-red-500">*</p></div> : <p>{label}</p> : ""}</p>
            <div className="flex flex-row items-center px-2 rounded-lg bg-white"><input value={value} onChange={(e)=>setValue?.(e.target.value)} type={isPassword ? showPassword ? "text" : "password" : "text"} className="w-full p-2 bg-white text-black rounded-lg outline-none" placeholder={placeholder ? `${placeholder}` : ""} /> <button className="outline-none" onClick={()=>setShowPassword(!showPassword)}>{isPassword ? showPassword ? <div><Eye className="text-black" /></div> : <div><EyeClosed className="text-black" /></div> : "" }</button> </div>
        </div>
    )
}

export default InputText
