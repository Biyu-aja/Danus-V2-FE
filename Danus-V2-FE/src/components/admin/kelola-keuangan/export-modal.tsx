import React, { useState } from "react";
import { X, FileSpreadsheet, Download } from "lucide-react";
import * as XLSX from "xlsx";
import type { DetailKeuangan } from "../../../types/keuangan.types";

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    histori: DetailKeuangan[];
    bulan: string; // Format: "Januari 2026"
}

type ExportMode = 'detail' | 'gabung_harian' | 'ringkasan';

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, histori, bulan }) => {
    const [exportMode, setExportMode] = useState<ExportMode>('detail');
    const [includeModal, setIncludeModal] = useState(true);

    if (!isOpen) return null;

    // Format date for display
    const formatDateDisplay = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Format date short
    const formatDateShort = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short'
        });
    };

    // Export handler
    const handleExport = () => {
        let data: any[] = [];
        const fileName = `Keuangan_${bulan.replace(' ', '_')}.xlsx`;

        if (exportMode === 'detail') {
            // Mode 1: Detail semua transaksi
            data = histori.map(item => ({
                'Tanggal': formatDateDisplay(item.createdAt),
                'Waktu': new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                'Judul': item.title,
                'Tipe': item.tipe === 'PEMASUKAN' ? 'Pemasukan' : 'Pengeluaran',
                'Penyetor': item.penyetor?.nama_lengkap || '-',
                'Nominal': item.tipe === 'PEMASUKAN' ? item.nominal : -item.nominal,
                'Keterangan': item.keterangan || '-'
            }));

            // Add totals row
            const totalPemasukan = histori.filter(h => h.tipe === 'PEMASUKAN').reduce((sum, h) => sum + h.nominal, 0);
            const totalPengeluaran = histori.filter(h => h.tipe === 'PENGELUARAN').reduce((sum, h) => sum + h.nominal, 0);
            
            data.push({});
            data.push({
                'Tanggal': 'TOTAL PEMASUKAN',
                'Nominal': totalPemasukan
            });
            data.push({
                'Tanggal': 'TOTAL PENGELUARAN',
                'Nominal': -totalPengeluaran
            });
            data.push({
                'Tanggal': 'SELISIH',
                'Nominal': totalPemasukan - totalPengeluaran
            });

        } else if (exportMode === 'gabung_harian') {
            // Mode 2: Gabungkan setor per hari
            const groupedByDate: { [key: string]: { setor: number; pengeluaran: DetailKeuangan[] } } = {};

            histori.forEach(item => {
                const dateKey = new Date(item.createdAt).toDateString();
                if (!groupedByDate[dateKey]) {
                    groupedByDate[dateKey] = { setor: 0, pengeluaran: [] };
                }
                
                if (item.tipe === 'PEMASUKAN') {
                    groupedByDate[dateKey].setor += item.nominal;
                } else {
                    groupedByDate[dateKey].pengeluaran.push(item);
                }
            });

            Object.entries(groupedByDate).forEach(([dateKey, dayData]) => {
                const date = new Date(dateKey);
                const dateStr = formatDateShort(date.toISOString());

                // Add gabungan setor
                if (dayData.setor > 0) {
                    data.push({
                        'Tanggal': formatDateDisplay(date.toISOString()),
                        'Judul': `Danus ${dateStr}`,
                        'Tipe': 'Pemasukan',
                        'Nominal': dayData.setor,
                        'Keterangan': 'Gabungan setoran hari ini'
                    });
                }

                // Add pengeluaran detail
                dayData.pengeluaran.forEach(item => {
                    data.push({
                        'Tanggal': formatDateDisplay(item.createdAt),
                        'Judul': item.title,
                        'Tipe': 'Pengeluaran',
                        'Nominal': -item.nominal,
                        'Keterangan': item.keterangan || '-'
                    });
                });
            });

            // Add totals
            const totalSetor = Object.values(groupedByDate).reduce((sum, d) => sum + d.setor, 0);
            const totalPengeluaran = Object.values(groupedByDate).reduce(
                (sum, d) => sum + d.pengeluaran.reduce((s, p) => s + p.nominal, 0), 
                0
            );

            data.push({});
            data.push({
                'Tanggal': 'TOTAL SETOR (DANUS)',
                'Nominal': totalSetor
            });
            if (includeModal) {
                data.push({
                    'Tanggal': 'TOTAL MODAL/PENGELUARAN',
                    'Nominal': -totalPengeluaran
                });
            }
            data.push({
                'Tanggal': 'KEUNTUNGAN BERSIH',
                'Nominal': totalSetor - totalPengeluaran
            });

        } else if (exportMode === 'ringkasan') {
            // Mode 3: Ringkasan saja (total setor - modal)
            const totalPemasukan = histori.filter(h => h.tipe === 'PEMASUKAN').reduce((sum, h) => sum + h.nominal, 0);
            const totalPengeluaran = histori.filter(h => h.tipe === 'PENGELUARAN').reduce((sum, h) => sum + h.nominal, 0);

            data = [
                { 'Keterangan': 'Laporan Keuangan', 'Nilai': bulan },
                {},
                { 'Keterangan': 'Total Pemasukan (Setor)', 'Nilai': totalPemasukan },
                { 'Keterangan': 'Total Pengeluaran (Modal)', 'Nilai': totalPengeluaran },
                {},
                { 'Keterangan': 'KEUNTUNGAN BERSIH', 'Nilai': totalPemasukan - totalPengeluaran },
                {},
                { 'Keterangan': 'Jumlah Transaksi Masuk', 'Nilai': histori.filter(h => h.tipe === 'PEMASUKAN').length },
                { 'Keterangan': 'Jumlah Transaksi Keluar', 'Nilai': histori.filter(h => h.tipe === 'PENGELUARAN').length },
            ];
        }

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(data);
        
        // Set column widths
        ws['!cols'] = [
            { wch: 20 }, // Tanggal
            { wch: 30 }, // Judul
            { wch: 12 }, // Tipe
            { wch: 20 }, // Penyetor / Nama
            { wch: 15 }, // Nominal
            { wch: 30 }, // Keterangan
        ];

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Keuangan');

        // Download
        XLSX.writeFile(wb, fileName);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-[#1e1e1e] rounded-2xl w-full max-w-md border border-[#333]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#333]">
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-green-500" />
                        <h2 className="text-white font-bold text-lg">Export ke Excel</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-[#333] flex items-center justify-center text-[#888] hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    <p className="text-[#888] text-sm">
                        Export data keuangan <span className="text-white font-medium">{bulan}</span>
                    </p>

                    {/* Export Mode Options */}
                    <div className="space-y-2">
                        <p className="text-white text-sm font-medium">Pilih Format Export:</p>
                        
                        <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                            exportMode === 'detail' 
                                ? 'bg-[#B09331]/10 border-[#B09331]' 
                                : 'bg-[#252525] border-[#333] hover:border-[#444]'
                        }`}>
                            <input 
                                type="radio" 
                                name="exportMode" 
                                value="detail"
                                checked={exportMode === 'detail'}
                                onChange={() => setExportMode('detail')}
                                className="mt-1 accent-[#B09331]"
                            />
                            <div>
                                <p className="text-white font-medium">Detail Semua Transaksi</p>
                                <p className="text-[#888] text-xs">Semua transaksi ditampilkan satu per satu dengan nama penyetor</p>
                            </div>
                        </label>

                        <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                            exportMode === 'gabung_harian' 
                                ? 'bg-[#B09331]/10 border-[#B09331]' 
                                : 'bg-[#252525] border-[#333] hover:border-[#444]'
                        }`}>
                            <input 
                                type="radio" 
                                name="exportMode" 
                                value="gabung_harian"
                                checked={exportMode === 'gabung_harian'}
                                onChange={() => setExportMode('gabung_harian')}
                                className="mt-1 accent-[#B09331]"
                            />
                            <div>
                                <p className="text-white font-medium">Gabung Setor Harian</p>
                                <p className="text-[#888] text-xs">Semua setoran di hari yang sama digabung jadi "Danus [tanggal]"</p>
                            </div>
                        </label>

                        <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                            exportMode === 'ringkasan' 
                                ? 'bg-[#B09331]/10 border-[#B09331]' 
                                : 'bg-[#252525] border-[#333] hover:border-[#444]'
                        }`}>
                            <input 
                                type="radio" 
                                name="exportMode" 
                                value="ringkasan"
                                checked={exportMode === 'ringkasan'}
                                onChange={() => setExportMode('ringkasan')}
                                className="mt-1 accent-[#B09331]"
                            />
                            <div>
                                <p className="text-white font-medium">Ringkasan Saja</p>
                                <p className="text-[#888] text-xs">Hanya total pemasukan, pengeluaran, dan keuntungan bersih</p>
                            </div>
                        </label>
                    </div>

                    {/* Additional Options */}
                    {exportMode === 'gabung_harian' && (
                        <label className="flex items-center gap-3 p-3 bg-[#252525] rounded-xl">
                            <input 
                                type="checkbox"
                                checked={includeModal}
                                onChange={(e) => setIncludeModal(e.target.checked)}
                                className="accent-[#B09331]"
                            />
                            <span className="text-white text-sm">Sertakan detail modal/pengeluaran</span>
                        </label>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[#333]">
                    <button
                        onClick={handleExport}
                        disabled={histori.length === 0}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <Download className="w-5 h-5" />
                        Download Excel
                    </button>
                    {histori.length === 0 && (
                        <p className="text-red-400 text-xs text-center mt-2">
                            Tidak ada data untuk di-export
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExportModal;
