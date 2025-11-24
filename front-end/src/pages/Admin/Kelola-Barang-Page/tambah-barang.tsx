import React from "react";
import Header from "../../../components/general/header";
import BackButton from "../../../components/general/back-button";
import InputText from "../../../components/general/input";

const TambahBarangPage:React.FC = () => {
    return(
        <div className="flex flex-col">
            <header>
                <Header />
                    <main className="mt-[3.5rem] p-3 flex flex-col gap-3">
                        <BackButton />
                        <div className="flex w-full justify-center">
                            <div className="relative w-[14rem] h-[14rem] bg-[#1e1e1e] rounded-lg hover:border border-[#4f4f4f]">
                                <img src="/image/pfp.jpg" className="w-[14rem] h-[14rem] rounded-lg object-cover" />
                                <input type="file" className="absolute top-0 w-[14rem] h-[14rem] opacity-0" />
                            </div>
                        </div>
                        <InputText label="Nama Barang" placeholder="Nama Barang" isImportant/>
                        <InputText label="Deskripsi Barang" placeholder="Deskripsi Barang" isImportant isTextarea rows={5}/>
                        <button className="bg-[#B39135] p-1 rounded-lg mt-4">
                            Tambah Barang
                        </button>
                    </main>
            </header>
        </div>
    )
}

export default TambahBarangPage