import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle2, Loader2, AlertCircle, Printer, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function IssuanceForm() {
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState<{ code: string; name: string } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    kode_surat: '',
    nama_pemohon: '',
    nama_pembuat: '',
    perihal: '',
    tujuan: '',
    tanggal: new Date().toISOString().split('T')[0],
    keterangan: '',
  });

  const fetchNextNumber = React.useCallback(async () => {
    try {
      const year = new Date().getFullYear();
      const { count, error } = await supabase
        .from('surat')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${year}-01-01T00:00:00`)
        .lte('created_at', `${year}-12-31T23:59:59`);

      if (error) throw error;

      const nextNumber = (count || 0) + 1;
      const formattedNumber = nextNumber.toString().padStart(3, '0');
      setFormData(prev => ({ ...prev, kode_surat: `WP.1.PAS.8.${formattedNumber}` }));
    } catch (err) {
      console.error('Error fetching next number:', err);
    }
  }, []);

  React.useEffect(() => {
    fetchNextNumber();
  }, [fetchNextNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('surat')
        .insert([{
          ...formData,
          status: 'Pending'
        }]);

      if (insertError) throw insertError;

      setSuccess({ code: formData.kode_surat, name: formData.nama_pemohon });
      setFormData({ 
        kode_surat: '',
        nama_pemohon: '', 
        nama_pembuat: '', 
        perihal: '', 
        tujuan: '', 
        tanggal: new Date().toISOString().split('T')[0],
        keterangan: '' 
      });
      fetchNextNumber();
    } catch (err: any) {
      console.error('Supabase Error:', err);
      const errorMessage = err.message || 'Gagal mengambil nomor surat.';
      setError(`${errorMessage}. Pastikan tabel "surat" sudah ada dan RLS sudah dikonfigurasi.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(147, 51, 234);
      doc.text('Rutan Kelas IIB Sabang', 105, 30, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setTextColor(100);
      doc.text('Bukti Pengambilan Nomor Surat', 105, 40, { align: 'center' });
      
      // Divider
      doc.setDrawColor(230);
      doc.line(20, 50, 190, 50);
      
      // Content
      doc.setFontSize(12);
      doc.setTextColor(50);
      
      const startY = 65;
      const lineHeight = 10;
      
      doc.text('Kode Surat:', 30, startY);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(147, 51, 234);
      doc.text(success?.code || '', 80, startY);
      
      doc.setFont(undefined, 'normal');
      doc.setTextColor(50);
      doc.text('Nama Pemohon:', 30, startY + lineHeight);
      doc.text(success?.name || '', 80, startY + lineHeight);
      
      doc.text('Tanggal:', 30, startY + lineHeight * 2);
      doc.text(format(new Date(), 'dd MMMM yyyy', { locale: id }), 80, startY + lineHeight * 2);
      
      doc.text('Waktu:', 30, startY + lineHeight * 3);
      doc.text(format(new Date(), 'HH:mm:ss'), 80, startY + lineHeight * 3);
      
      // Footer
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text('Dokumen ini dihasilkan secara otomatis oleh Sistem Nomor Surat Digital Rutan Sabang.', 105, 120, { align: 'center' });
      
      doc.save(`bukti-nomor-surat-${success?.code}.pdf`);
    } catch (err) {
      console.error('Gagal download PDF:', err);
      alert('Gagal mendownload PDF.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-8 border-b border-gray-50 bg-gray-50/50">
          <h2 className="text-2xl font-bold text-gray-900">Ambil Nomor Surat</h2>
          <p className="text-gray-500 mt-1">Silakan isi formulir di bawah untuk mendapatkan nomor surat otomatis.</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Kode Surat</label>
              <div className="flex gap-2">
                <input
                  required
                  type="text"
                  value={formData.kode_surat}
                  onChange={(e) => setFormData({ ...formData, kode_surat: e.target.value })}
                  placeholder="Contoh: WP.1.PAS.8.001"
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none font-mono font-bold text-purple-600"
                />
                <button
                  type="button"
                  onClick={fetchNextNumber}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all text-xs font-bold"
                  title="Generate otomatis"
                >
                  Auto
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Nama Pemohon</label>
              <input
                required
                type="text"
                value={formData.nama_pemohon}
                onChange={(e) => setFormData({ ...formData, nama_pemohon: e.target.value })}
                placeholder="Contoh: Budi Santoso"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Nama Pembuat</label>
              <input
                required
                type="text"
                value={formData.nama_pembuat}
                onChange={(e) => setFormData({ ...formData, nama_pembuat: e.target.value })}
                placeholder="Nama petugas pembuat surat"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Perihal</label>
              <input
                required
                type="text"
                value={formData.perihal}
                onChange={(e) => setFormData({ ...formData, perihal: e.target.value })}
                placeholder="Contoh: Permohonan Cuti"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Tujuan</label>
              <input
                required
                type="text"
                value={formData.tujuan}
                onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })}
                placeholder="Contoh: Kepala Rutan / Kantor Wilayah"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Tanggal Surat</label>
              <input
                required
                type="date"
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Keterangan (Opsional)</label>
              <textarea
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                placeholder="Tambahkan catatan jika diperlukan..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none resize-none"
              />
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl text-sm">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl font-bold shadow-lg shadow-purple-600/20 hover:from-purple-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Memproses...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Dapatkan Nomor Surat
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>

      {/* Success Modal */}
      <AnimatePresence>
        {success && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Berhasil!</h3>
              <p className="text-gray-500 mb-8">Nomor surat telah berhasil dibuat untuk <strong>{success.name}</strong>.</p>
              
              <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Kode Surat Anda</p>
                <p className="text-3xl font-black text-purple-600 font-mono tracking-tighter">{success.code}</p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDownloadPDF}
                  className="w-full py-3 px-6 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
                >
                  <Download size={18} />
                  Download PDF
                </button>
                <button
                  onClick={() => setSuccess(null)}
                  className="w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
