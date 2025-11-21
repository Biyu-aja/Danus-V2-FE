import React from "react";

interface props {
    label?: string,
    value?: string
}

const CardItem:React.FC<props> = ({label, value}) =>{
    return(
        <div className="bg-[#2E2E2E] flex flex-col w-full p-3 text-[#B09331]">
            <p>{label}</p>
            <div><p>{value}</p></div>
        </div>
    )
}

export default CardItem