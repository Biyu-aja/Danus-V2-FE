// Types untuk Barang & Stok

export interface Barang {
    id: number;
    nama: string;
    keterangan?: string;
    gambar?: string;
    stokHarian?: StokHarian[];
}

export interface StokHarian {
    id: number;
    barangId: number;
    harga: number;
    stok: number;
    modal: number;
    jumlah_ambil?: number;
    jumlah_setor?: number;
    keterangan?: string;
    tanggalEdar: string;
    barang?: Barang;
}

export interface CreateBarangRequest {
    nama: string;
    keterangan?: string;
    gambar?: string;
}

export interface CreateStokRequest {
    barangId: number;
    harga: number;
    stok: number;
    modal: number;
    keterangan?: string;
    tanggalEdar: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}
