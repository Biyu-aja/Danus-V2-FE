import { PlusIcon } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

interface props{
    title?: string
    navigateTo?: string
}

const TitleAdd:React.FC<props> = ({title, navigateTo}) =>{
    const navigate = useNavigate();
    return(
        <div className="flex flex-row justify-between items-center"><p className="font-semibold text-[1.25rem]">{title}</p> <button onClick={()=>navigate(`${navigateTo}`)} className="bg-[#B09331] rounded-lg p-1"><PlusIcon /></button></div>
    )
}

export default TitleAdd