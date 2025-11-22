import { LayoutDashboardIcon, PackagePlusIcon, UsersIcon, WalletIcon } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar:React.FC = () =>{
    const [menu, setMenu] = useState("dashboard");
    const navigate = useNavigate()
    const [icon, setIcon] = useState([
        { id: "dashboard", label: "Dashboard", icon: <LayoutDashboardIcon /> },
        { id: "kelola-keuangan", label: "Kelola Keuangan", icon: <WalletIcon /> },
        { id: "kelola-user", label: "Kelola User", icon: <UsersIcon /> },
        { id: "kelola-barang", label: "Kelola Barang", icon: <PackagePlusIcon /> },
    ])
    return(
        <div className="fixed bottom-0 flex flex-row justify-around text-[#B09331] items-center bg-[#1C1C20] rounded-t-xl w-full h-[3rem]">
            {icon.map((data, index)=>(
                <div key={index} className={`${menu === data?.id && "text-[#F0C633] scale-105"  }`} onClick={()=>{setMenu(data.id), navigate(`/admin/${data.id}`)}} >
                    {data.icon}
                </div>
            ))}
        </div>
    )
}

export default Navbar