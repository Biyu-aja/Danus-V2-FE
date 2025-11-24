import React from "react";
import Header from "../../../components/general/header";
import Navbar from "../../../components/admin/general-admin/navbar";
import SearchBar from "../../../components/general/searchbar";
import CardUser from "../../../components/admin/kelola-user/carduser";

const KelolaUser:React.FC = () => {
    const dropdown = ([
        {value: "alfabet", Menu: "Alfabet"},
        {value: "jumlah-ambil", Menu: "Jumlah Ambil"},
        {value: "sudah-setor", Menu: "Sudah Setor"},
        {value: "sudah-ambil", Menu: "Sudah Ambil"},
        {value: "belum-ambil", Menu: "Belum Ambil"},
    ])
    return(
        <div className="flex flex-col">
            <Header />
                <main className="flex flex-col mt-[3.5rem] gap-3 p-3 mb-[3rem]">
                    <SearchBar placeholder="Cari User"/>
                    <div className="flex flex-row gap-2 items-center">
                        <p className="text-[1.25rem] font-bold">Sort By</p>
                        <select className="bg-[#1e1e1e] p-1 rounded-lg border border-[#4f4f4f]">
                            {dropdown.map((data,index)=>(
                                <option key={index} value={data.value}>{data.Menu}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-3">
                        <CardUser nama="Oguri Cap" status="sudah-ambil" jumlah_ambil={5}  />
                        <CardUser nama="Oguri Cap" status="belum-ambil" jumlah_ambil={5}  />
                        <CardUser nama="Oguri Cap" status="sudah-setor" jumlah_ambil={5}  />
                    </div>
                </main>
            <Navbar />
        </div>
    )
}

export default KelolaUser