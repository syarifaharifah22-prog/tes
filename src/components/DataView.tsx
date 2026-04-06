import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Download, 
  FileSpreadsheet, 
  FileText as FilePdf,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  ChevronDown,
  ChevronUp,
  X,
  Check
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Surat } from '../types';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { cn } from '../lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

type FilterType = 'all' | 'daily' | 'weekly' | 'monthly' | 'yearly';
type SortOrder = 'asc' | 'desc';

export default function DataView() {
  const [data, setData] = React.useState<Surat[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<FilterType>('all');
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('desc');
  
  // Multi-select filters
  const [selectedTujuans, setSelectedTujuans] = React.useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);
  const [showTujuanFilter, setShowTujuanFilter] = React.useState(false);
  const [showStatusFilter, setShowStatusFilter] = React.useState(false);

  const fetchData = async () => {
    setLoading(true);
    let query = supabase.from('surat').select('*').order('created_at', { ascending: sortOrder === 'asc' });

    const now = new Date();
    if (filter === 'daily') {
      query = query.gte('created_at', startOfDay(now).toISOString()).lte('created_at', endOfDay(now).toISOString());
    } else if (filter === 'weekly') {
      query = query.gte('created_at', startOfWeek(now).toISOString()).lte('created_at', endOfWeek(now).toISOString());
    } else if (filter === 'monthly') {
      query = query.gte('created_at', startOfMonth(now).toISOString()).lte('created_at', endOfMonth(now).toISOString());
    } else if (filter === 'yearly') {
      query = query.gte('created_at', startOfYear(now).toISOString()).lte('created_at', endOfYear(now).toISOString());
    }

    const { data: result, error } = await query;
    if (error) console.error(error);
    else setData(result || []);
    setLoading(false);
  };

  React.useEffect(() => {
    fetchData();
  }, [filter, sortOrder]);

  // Extract unique values for filters
  const uniqueTujuans = React.useMemo(() => {
    const tujuans = new Set<string>();
    data.forEach(item => tujuans.add(item.tujuan));
    return Array.from(tujuans).sort();
  }, [data]);

  const uniqueStatuses = ['Pending', 'Diproses', 'Selesai'];

  const filteredData = data.filter(item => {
    const matchesSearch = 
      item.nama_pemohon.toLowerCase().includes(search.toLowerCase()) ||
      item.nama_pembuat.toLowerCase().includes(search.toLowerCase()) ||
      item.perihal.toLowerCase().includes(search.toLowerCase()) ||
      item.kode_surat.toLowerCase().includes(search.toLowerCase()) ||
      item.tujuan.toLowerCase().includes(search.toLowerCase()) ||
      item.tanggal.toLowerCase().includes(search.toLowerCase());
    
    const matchesTujuan = selectedTujuans.length === 0 || selectedTujuans.includes(item.tujuan);
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(item.status || 'Pending');

    return matchesSearch && matchesTujuan && matchesStatus;
  });

  const toggleTujuan = (tujuan: string) => {
    setSelectedTujuans(prev => 
      prev.includes(tujuan) ? prev.filter(t => t !== tujuan) : [...prev, tujuan]
    );
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  // Chart Data Preparation
  const chartData = React.useMemo(() => {
    const dailyCounts: Record<string, number> = {};
    const destinationCounts: Record<string, number> = {};
    
    filteredData.forEach(item => {
      const date = format(new Date(item.created_at), 'dd MMM');
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
      
      const dest = item.tujuan.split(' ')[0]; // Simplified destination
      destinationCounts[dest] = (destinationCounts[dest] || 0) + 1;
    });

    const sortedDates = Object.keys(dailyCounts).sort();

    return {
      bar: {
        labels: sortedDates,
        datasets: [{
          label: 'Jumlah Surat',
          data: sortedDates.map(d => dailyCounts[d]),
          backgroundColor: 'rgba(147, 51, 234, 0.8)',
          borderRadius: 8,
        }]
      },
      line: {
        labels: sortedDates,
        datasets: [{
          label: 'Tren Pengambilan',
          data: sortedDates.map(d => dailyCounts[d]),
          borderColor: 'rgb(147, 51, 234)',
          backgroundColor: 'rgba(147, 51, 234, 0.1)',
          fill: true,
          tension: 0.4,
        }]
      },
      pie: {
        labels: Object.keys(destinationCounts),
        datasets: [{
          data: Object.values(destinationCounts),
          backgroundColor: [
            'rgba(147, 51, 234, 0.8)',
            'rgba(139, 92, 246, 0.6)',
            'rgba(167, 139, 250, 0.4)',
            'rgba(107, 33, 168, 0.9)',
          ],
        }]
      }
    };
  }, [filteredData]);

  const exportToPdf = () => {
    try {
      const doc = new jsPDF();
      
      // Add Title
      doc.setFontSize(18);
      doc.setTextColor(147, 51, 234); // Purple color
      doc.text('Rutan Kelas IIB Sabang', 14, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text('Data Pengambilan Nomor Surat Digital', 14, 28);
      
      doc.setFontSize(10);
      doc.text(`Dicetak pada: ${format(new Date(), 'dd MMMM yyyy HH:mm', { locale: id })}`, 14, 35);
      
      // Add Table
      autoTable(doc, {
        head: [['No', 'Kode Surat', 'Pemohon', 'Pembuat', 'Perihal', 'Tujuan', 'Tgl Surat', 'Status']],
        body: filteredData.map((item, index) => [
          index + 1,
          item.kode_surat,
          item.nama_pemohon,
          item.nama_pembuat,
          item.perihal,
          item.tujuan,
          format(new Date(item.tanggal), 'dd/MM/yyyy'),
          item.status || 'Pending'
        ]),
        startY: 45,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [147, 51, 234], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [250, 245, 255] },
        margin: { top: 45 },
      });
      
      // Save PDF
      doc.save(`data-surat-rutan-sabang-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (err) {
      console.error('Gagal mengekspor PDF:', err);
      alert('Gagal mengekspor PDF. Silakan coba lagi.');
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData.map(item => ({
      'Kode Surat': item.kode_surat,
      'Nama Pemohon': item.nama_pemohon,
      'Nama Pembuat': item.nama_pembuat,
      'Perihal': item.perihal,
      'Tujuan': item.tujuan,
      'Tanggal Surat': item.tanggal,
      'Status': item.status || 'Pending',
      'Keterangan': item.keterangan,
      'Waktu Input': format(new Date(item.created_at), 'dd/MM/yyyy HH:mm')
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Surat');
    XLSX.writeFile(wb, `data-surat-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Surat</p>
              <h4 className="text-2xl font-black text-gray-900">{filteredData.length}</h4>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Hari Ini</p>
              <h4 className="text-2xl font-black text-gray-900">
                {filteredData.filter(d => format(new Date(d.created_at), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).length}
              </h4>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <BarChart3 size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Bulan Ini</p>
              <h4 className="text-2xl font-black text-gray-900">
                {filteredData.filter(d => format(new Date(d.created_at), 'yyyy-MM') === format(new Date(), 'yyyy-MM')).length}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 size={18} className="text-purple-600" />
              Statistik Harian
            </h3>
          </div>
          <div className="h-64">
            <Bar data={chartData.bar} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <PieChartIcon size={18} className="text-purple-600" />
              Distribusi Tujuan
            </h3>
          </div>
          <div className="h-64 flex justify-center">
            <Pie data={chartData.pie} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Cari nama atau kode surat..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent focus:bg-white focus:border-purple-500 rounded-xl outline-none transition-all text-sm"
                />
              </div>
              <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl">
                {(['all', 'daily', 'weekly', 'monthly', 'yearly'] as FilterType[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      filter === f ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={exportToPdf}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-all"
              >
                <FilePdf size={18} />
                PDF
              </button>
              <button 
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl text-sm font-bold hover:bg-green-100 transition-all"
              >
                <FileSpreadsheet size={18} />
                Excel
              </button>
            </div>
          </div>

          {/* Advanced Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all"
            >
              <Filter size={16} className="text-purple-600" />
              Tanggal: {sortOrder === 'asc' ? 'Terlama' : 'Terbaru'}
              {sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {/* Tujuan Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowTujuanFilter(!showTujuanFilter);
                  setShowStatusFilter(false);
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                  selectedTujuans.length > 0 ? "bg-purple-50 text-purple-600" : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                )}
              >
                Tujuan {selectedTujuans.length > 0 && `(${selectedTujuans.length})`}
                <ChevronDown size={16} />
              </button>
              <AnimatePresence>
                {showTujuanFilter && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 p-2"
                  >
                    <div className="max-h-64 overflow-y-auto space-y-1">
                      {uniqueTujuans.map(t => (
                        <button
                          key={t}
                          onClick={() => toggleTujuan(t)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-sm transition-all"
                        >
                          <span className={selectedTujuans.includes(t) ? "font-bold text-purple-600" : "text-gray-700"}>{t}</span>
                          {selectedTujuans.includes(t) && <Check size={16} className="text-purple-600" />}
                        </button>
                      ))}
                    </div>
                    {selectedTujuans.length > 0 && (
                      <button
                        onClick={() => setSelectedTujuans([])}
                        className="w-full mt-2 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        Reset Filter
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowStatusFilter(!showStatusFilter);
                  setShowTujuanFilter(false);
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                  selectedStatuses.length > 0 ? "bg-purple-50 text-purple-600" : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                )}
              >
                Status {selectedStatuses.length > 0 && `(${selectedStatuses.length})`}
                <ChevronDown size={16} />
              </button>
              <AnimatePresence>
                {showStatusFilter && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 p-2"
                  >
                    <div className="space-y-1">
                      {uniqueStatuses.map(s => (
                        <button
                          key={s}
                          onClick={() => toggleStatus(s)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-sm transition-all"
                        >
                          <span className={selectedStatuses.includes(s) ? "font-bold text-purple-600" : "text-gray-700"}>{s}</span>
                          {selectedStatuses.includes(s) && <Check size={16} className="text-purple-600" />}
                        </button>
                      ))}
                    </div>
                    {selectedStatuses.length > 0 && (
                      <button
                        onClick={() => setSelectedStatuses([])}
                        className="w-full mt-2 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        Reset Filter
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Clear All Filters */}
            {(selectedTujuans.length > 0 || selectedStatuses.length > 0) && (
              <button
                onClick={() => {
                  setSelectedTujuans([]);
                  setSelectedStatuses([]);
                }}
                className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-all"
              >
                <X size={14} />
                Hapus Semua Filter
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Kode Surat</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Pemohon</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Pembuat</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Perihal</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tujuan</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tgl Surat</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Waktu Input</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">Memuat data...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">Tidak ada data ditemukan.</td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md text-sm">
                        {item.kode_surat}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">{item.nama_pemohon}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{item.nama_pembuat}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{item.perihal}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{item.tujuan}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {format(new Date(item.tanggal), 'dd MMM yyyy', { locale: id })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        item.status === 'Selesai' ? "bg-green-100 text-green-600" :
                        item.status === 'Diproses' ? "bg-yellow-100 text-yellow-600" :
                        "bg-purple-100 text-purple-600"
                      )}>
                        {item.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-500">
                        {format(new Date(item.created_at), 'dd/MM/yy HH:mm')}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
