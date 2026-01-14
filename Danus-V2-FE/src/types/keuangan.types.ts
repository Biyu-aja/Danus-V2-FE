// Type definitions untuk Keuangan

export interface Saldo {
    id: number;
    totalSaldo: number;
    updatedAt: string;
}

export interface DetailKeuangan {
    id: number;
    detailSetorId: number | null;
    title: string;
    tipe: 'PEMASUKAN' | 'PENGELUARAN';
    nominal: number;
    keterangan: string | null;
    createdAt: string;
    penyetor?: {
        id: number;
        nama_lengkap: string;
    } | null;
}

export interface LaporanHarian {
    tanggal: string;
    pemasukan: {
        total: number;
        count: number;
    };
    pengeluaran: {
        total: number;
        count: number;
    };
    selisih: number;
    transaksi: DetailKeuangan[];
}

export interface LaporanBulanan {
    bulan: string;
    pemasukan: {
        total: number;
        count: number;
    };
    pengeluaran: {
        total: number;
        count: number;
    };
    selisih: number;
    jumlahHariAktif: number;
}
