import React from "react";
import Navbar from "../../components/admin/general-admin/navbar";
import Header from "../../components/general/header";
import SearchBar from "../../components/general/searchbar";
import { PlusIcon } from "lucide-react";
import StokCard from "../../components/general/stokcard";
import TitleAdd from "../../components/general/title-add";
import CardBarang from "../../components/admin/kelola-barang/cardbarang";

const KelolaBarang:React.FC = () =>{
    return(
        <div className="flex flex-col">
            <Header />
                <main className="flex flex-col mt-[3.5rem] gap-3 p-3 mb-[3rem]">
                    <SearchBar placeholder="Cari Barang/Stok"/>
                    <div className="flex flex-col gap-1">
                        <TitleAdd title="Stok Hari Ini"/>
                        <div className="flex flex-row overflow-x-auto gap-3 p-2">
                            <StokCard nama_item="Klepon" harga_item="12.000" jumlah_ambil={20} stok_tersisa={10} jumlah_setor={15}/>
                            <StokCard nama_item="Klepon" harga_item="12.000" jumlah_ambil={20} stok_tersisa={10} jumlah_setor={15}/>
                            <StokCard nama_item="Klepon" harga_item="12.000" jumlah_ambil={20} stok_tersisa={10} jumlah_setor={15}/>
                            <StokCard nama_item="Klepon" harga_item="12.000" jumlah_ambil={20} stok_tersisa={10} jumlah_setor={15}/>
                            <StokCard nama_item="Klepon" harga_item="12.000" jumlah_ambil={20} stok_tersisa={10} jumlah_setor={15}/>
                            <StokCard nama_item="Klepon" harga_item="12.000" jumlah_ambil={20} stok_tersisa={10} jumlah_setor={15}/>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <TitleAdd title="Jenis Barang"/>
                        <div className="flex flex-row overflow-x-auto gap-3 p-2">
                            <CardBarang />
                        </div>
                    </div>
                </main>
            <Navbar />
        </div>
    )
}

export default KelolaBarang