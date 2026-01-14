import { ArrowLeftIcon } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const BackButton:React.FC = () => {
    const navigate = useNavigate()
    return( 
        <div className="flex flex-row gap-3 items-center cursor-pointer" onClick={()=>navigate(-1)}>
            <ArrowLeftIcon className="w-6 h-6" strokeWidth={2.95}/>
            <p className="font-bold text-[1.1rem]">Back</p>
        </div>
    )
}

export default BackButton