import React, { useState } from "react";
import Header from "../../../components/general/header";
import Navbar from "../../../components/admin/general-admin/navbar";
import Total_Saldo from "../../../components/admin/general-admin/totalsaldo";
import CardItem from "../../../components/admin/general-admin/carditem";
import { PlusIcon } from "lucide-react";
import StokCard from "../../../components/general/stokcard";
import TitleAdd from "../../../components/general/title-add";
import DetailStok from "../../../components/admin/kelola-barang/detail-stok";
import { useSaldo, useLaporanHarian } from "../../../hooks/useKeuangan";

const Dashboard:React.FC = () => {
    // Fetch saldo dari backend
    const { saldo, isLoading: loadingSaldo } = useSaldo();
    
    // Fetch laporan harian dari backend
    const { laporan, isLoading: loadingLaporan } = useLaporanHarian();
    
    const data = ([
        // {nama_item: "Klepon", modal: "12.000", harga_item: "12.000", jumlah_ambil:20, stok_tersisa:10, jumlah_setor:15, catatan: ""},
        // {nama_item: "Onde-onde", modal: "53.000", harga_item: "10.000", jumlah_ambil:15, stok_tersisa:5, jumlah_setor:10, catatan: "Delicious and popular snack."},
        // {nama_item: "Lemper", modal: "17.000", harga_item: "8.000", jumlah_ambil:25, stok_tersisa:12, jumlah_setor:20, catatan: "Popular item among customers."},
        // {nama_item: "Bolu Kukus", modal: "17.000", harga_item: "15.000", jumlah_ambil:30, stok_tersisa:20, jumlah_setor:25, catatan: "Best seller item."},
        // {nama_item: "Kue Lapis", modal: "17.000", harga_item: "20.000", jumlah_ambil:18, stok_tersisa:8, jumlah_setor:12, catatan: "Customer favorite."},
        // {nama_item: "Dadar Gulung", modal: "17.000", harga_item: "9.000", jumlah_ambil:22, stok_tersisa:11, jumlah_setor:16, catatan: "Popular item among customers."},
        // {nama_item: "Pisang Goreng", modal: "17.000",harga_item: "7.000", jumlah_ambil:28, stok_tersisa:14, jumlah_setor:18, catatan: "High demand item."},
        // {nama_item: "Risol", modal: "17.000", harga_item: "11.000", jumlah_ambil:16, stok_tersisa:6, jumlah_setor:9, catatan: "Popular item during weekends."},
    ]);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [showDetail, setShowDetail] = useState(false);

    const getDetail = (item:any) => {
        setSelectedItem(item);
        setShowDetail(true);
    }
    
    // Format number ke Rupiah
    const formatRupiah = (num: number) => {
        return new Intl.NumberFormat('id-ID').format(num);
    };
    
    return(
        <div className="flex flex-col">
            <Header />
                <main className="flex flex-col mt-[3.5rem] gap-3 p-3 mb-[3rem]">
                    {/* Total Saldo - gunakan data dari backend */}
                    <Total_Saldo saldo={saldo?.totalSaldo} isLoading={loadingSaldo} />
                    
                    <section className="flex flex-row gap-2">
                        {/* Pemasukan & Pengeluaran dari laporan harian */}
                        <CardItem 
                            label="Pemasukan" 
                            value={loadingLaporan ? "..." : formatRupiah(laporan?.pemasukan.total || 0)}
                        />
                        <CardItem 
                            label="Pengeluaran" 
                            value={loadingLaporan ? "..." : formatRupiah(laporan?.pengeluaran.total || 0)}
                        />
                    </section>
                    <section className="flex flex-row gap-2">
                        <CardItem label="Jumlah Ambil" value="29"/>
                        <CardItem label="Jumlah Setor" value="19"/>
                    </section>
                    <TitleAdd title="Stok Hari Ini" navigateTo="/admin/kelola-barang/tambah-stok"/>
                    <div className="flex flex-row flex-wrap justify-around gap-2">
                        {data.map((item, index)=>(
                            <div key={index} onClick={()=>getDetail(item)}>
                                <StokCard 
                                    nama_item={item.nama_item}
                                    harga_item={item.harga_item}
                                    jumlah_ambil={item.jumlah_ambil}
                                    stok_tersisa={item.stok_tersisa}
                                    jumlah_setor={item.jumlah_setor}
                                />
                            </div>
                        ))}
                    </div>
                </main>
                {
                    showDetail && selectedItem && 
                    <div className="bg-black/40 fixed inset-0 z-60 flex items-center justify-center" onClick={()=>setShowDetail(false)}>
                        <DetailStok data={selectedItem}/>
                    </div>
                }
            <Navbar />
        </div>
    )
}

export default Dashboard