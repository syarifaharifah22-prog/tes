import { motion } from 'motion/react';
import { CheckCircle2, FileText, Send, Settings, Database, Award, Shield, Info } from 'lucide-react';

const flowchartSteps = [
  { id: 1, title: 'Buka Website', icon: Info, desc: 'Akses sistem melalui browser' },
  { id: 2, title: 'Klik Ambil Nomor', icon: PlusCircle, desc: 'Pilih menu pengambilan nomor' },
  { id: 3, title: 'Isi Form', icon: FileText, desc: 'Masukkan data pemohon & tujuan' },
  { id: 4, title: 'Submit', icon: Send, desc: 'Kirim data ke sistem' },
  { id: 5, title: 'Proses Sistem', icon: Settings, desc: 'Validasi & generate kode' },
  { id: 6, title: 'Generate Kode', icon: Award, desc: 'Format: WP.1.PAS.8.XXX' },
  { id: 7, title: 'Simpan Data', icon: Database, desc: 'Data tersimpan di Supabase' },
  { id: 8, title: 'Selesai', icon: CheckCircle2, desc: 'Nomor siap digunakan' },
];

import { PlusCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold mb-4 leading-tight"
          >
            Digitalisasi Administrasi <br /> Rutan Kelas IIB Sabang
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-purple-100 text-lg mb-8"
          >
            Sistem pengambilan nomor surat otomatis yang cepat, transparan, dan terintegrasi untuk meningkatkan efisiensi pelayanan publik.
          </motion.p>
        </div>
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-0 translate-y-1/4 translate-x-1/4 w-64 h-64 bg-violet-400 rounded-full blur-3xl opacity-30" />
      </section>

      {/* Profile & Visi Misi */}
      <div className="grid md:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Profil Rutan Sabang</h3>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Rumah Tahanan Negara Kelas IIB Sabang merupakan Unit Pelaksana Teknis di bawah Kantor Wilayah Kementerian Hukum dan HAM Aceh yang berkomitmen memberikan pelayanan prima bagi warga binaan dan masyarakat.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <Award size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Visi & Misi</h3>
          </div>
          <ul className="space-y-4 text-gray-600">
            <li className="flex gap-3">
              <div className="mt-1.5 w-1.5 h-1.5 bg-purple-600 rounded-full shrink-0" />
              <span>Mewujudkan kepastian hukum melalui pelayanan yang transparan.</span>
            </li>
            <li className="flex gap-3">
              <div className="mt-1.5 w-1.5 h-1.5 bg-purple-600 rounded-full shrink-0" />
              <span>Meningkatkan profesionalisme SDM dalam tata kelola administrasi.</span>
            </li>
            <li className="flex gap-3">
              <div className="mt-1.5 w-1.5 h-1.5 bg-purple-600 rounded-full shrink-0" />
              <span>Mengimplementasikan teknologi informasi dalam setiap lini pelayanan.</span>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Flowchart Animation */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Alur Pengambilan Nomor</h3>
          <p className="text-gray-500">Proses digital yang mudah dan terstruktur</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {flowchartSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                delay: index * 0.1,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              className="relative group"
            >
              <div className="h-full bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all duration-500 hover:-translate-y-2">
                <motion.div 
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gradient-to-br group-hover:from-purple-600 group-hover:to-violet-600 group-hover:text-white transition-all duration-300 shadow-sm"
                >
                  <step.icon size={24} />
                </motion.div>
                <h4 className="font-bold text-gray-900 mb-1 text-sm">{step.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                
                {/* Connector Line (Desktop) */}
                {index < flowchartSteps.length - 1 && index % 4 !== 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-px bg-gray-200 z-0" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
