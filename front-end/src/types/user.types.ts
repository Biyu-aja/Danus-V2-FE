export interface User {
    id: number;
    nama_lengkap: string;
    username: string;
    nomor_telepon: string;
    password: string;
    role: 'user' | 'admin';
    catatan?: string;
}