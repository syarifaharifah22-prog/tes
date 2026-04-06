export interface Surat {
  id: string;
  kode_surat: string;
  nama_pemohon: string;
  nama_pembuat: string;
  perihal: string;
  tujuan: string;
  tanggal: string;
  keterangan: string | null;
  status: 'Pending' | 'Diproses' | 'Selesai';
  created_at: string;
}

export type NavItem = 'beranda' | 'ambil-nomor' | 'data';
