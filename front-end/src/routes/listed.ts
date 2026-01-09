// Common paths (halaman yang bisa diakses tanpa login)
export const commonListed = {
    auth: '/',
};

// Admin routes
export const adminListed = {
    dashboard: 'dashboard',
    kelolaUser: 'kelola-user',
    kelolaUserDetail: 'kelola-user/:id',
    kelolaBarang: 'kelola-barang',
    semuaBarang: 'semua-barang',
    tambahBarang: 'kelola-barang/tambah-barang',
    tambahStok: 'kelola-barang/tambah-stok',
    kelolaKeuangan: 'kelola-keuangan',
    historiStok: 'histori-stok',
    detailStok: 'detail-stok/:id',
    statusUser: 'status-user',
};

// User routes
export const userListed = {
    dashboard: 'dashboard',
    riwayat: 'riwayat',
    profil: 'profil',
};