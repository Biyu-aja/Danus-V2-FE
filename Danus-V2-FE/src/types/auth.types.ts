// Type definitions untuk Auth

export interface User {
    id: number;
    nama_lengkap: string;
    username: string;
    nomor_telepon: string;
    role: 'user' | 'admin';
    catatan?: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    data?: {
        user: User;
    };
}
