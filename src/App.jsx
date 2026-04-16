import React, { useState, useRef, useMemo, useEffect } from 'react';
import { UploadCloud, X, GripHorizontal, BarChart3, TrendingUp, MousePointerClick, DollarSign, ShoppingCart, Activity, Calendar, ToggleLeft, ToggleRight, BarChart2, PieChart, Trophy, Target, ChevronDown, ChevronUp, LayoutList, LineChart, PlusCircle, Trash2, ExternalLink, HelpCircle, Lightbulb, Heart, AlertTriangle, ShoppingBag, Package, Rocket, Download, FileText, Printer, FileSpreadsheet, Eye, EyeOff } from 'lucide-react';

const MetaIcon = ({ size = 24, className = "", strokeWidth = 2 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} stroke="currentColor" strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 12c-2.21-3-4.42-3-6.63-3A4.37 4.37 0 0 0 1 13.37C1 15.82 2.94 17 5.37 17c2.21 0 4.42-1.5 6.63-5Z"></path>
    <path d="M12 12c2.21 3 4.42 3 6.63 3A4.37 4.37 0 0 0 23 10.63C23 8.18 21.06 7 18.63 7c-2.21 0-4.42 1.5-6.63 5Z"></path>
  </svg>
);

const ShopeeIcon = ({ size = 24, className = "", strokeWidth = 2 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} stroke="currentColor" strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 8V5a4 4 0 0 1 8 0v3"></path>
    <rect x="3" y="8" width="18" height="14" rx="2"></rect>
    <path d="M14.5 13.5a2.5 2.5 0 0 0-5 0c0 1.5 5 1.5 5 3a2.5 2.5 0 0 1-5 0"></path>
  </svg>
);

// --- HELPER UNTUK MENGATASI PERBEDAAN FORMAT TANGGAL ---
const extractDateOnly = (rawStr) => {
  if (!rawStr || rawStr === '--' || rawStr === '-') return null;
  let dStr = String(rawStr).trim().split(' ')[0];
  dStr = dStr.replaceAll('/', '-');
  const parts = dStr.split('-');
  if (parts.length === 3) {
    if (parts[0].length <= 2 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
  }
  return dStr;
};

const getSafeDateObj = (rawStr) => {
  if (!rawStr || rawStr === '--' || rawStr === '-') return null;
  const parts = String(rawStr).trim().split(' ');
  const datePart = extractDateOnly(parts[0]);
  if (!datePart) return null;
  const timePart = parts[1] || '00:00:00';
  const d = new Date(`${datePart}T${timePart}`);
  return isNaN(d.getTime()) ? null : d;
};

export default function App() {
  // --- STATE UNTUK DATA CSV ---
  const [shopeeClicks, setShopeeClicks] = useState([]);
  const [shopeeCommissions, setShopeeCommissions] = useState([]);
  const [metaAds, setMetaAds] = useState([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tagMappings, setTagMappings] = useState({});
  const [isSyncDate, setIsSyncDate] = useState(true);
  const [summaryDateFilter, setSummaryDateFilter] = useState('all');
  const [ppnPercentage, setPpnPercentage] = useState(11); 
  const [showMetaAdsTable, setShowMetaAdsTable] = useState(false);
  const [filterActiveCampaigns, setFilterActiveCampaigns] = useState(false);
  const [visibleTags, setVisibleTags] = useState([]);
  const [selectedTagToAdd, setSelectedTagToAdd] = useState('');
  const [selectedTagForModal, setSelectedTagForModal] = useState(null);
  const [selectedChartTag, setSelectedChartTag] = useState('');
  const [selectedCategoryLevel, setSelectedCategoryLevel] = useState('l1');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [tagTableDateFilter, setTagTableDateFilter] = useState('all');
  const [isNamesHidden, setIsNamesHidden] = useState(false); // BARU: State untuk Sensor Nama
  
  const [exportMonth, setExportMonth] = useState('');
  const [exportType, setExportType] = useState('profit');

  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [showMetaWarning, setShowMetaWarning] = useState(false);

  const tourStepsData = [
    {
      title: "Selamat Datang!",
      desc: "Alat ini memadukan data Iklan Meta dengan komisi Shopee Affiliate Anda. Mari mulai dengan mengunggah 3 file CSV Anda (Meta Ads, Komisi, dan Klik Shopee).",
      icon: <Rocket className="w-24 h-24 text-white drop-shadow-xl" strokeWidth={1.5} />,
      color: "from-orange-400 to-rose-500"
    },
    {
      title: "1. Tab Dashboard Utama",
      desc: "Setelah data terunggah, di sini Anda bisa memantau Ringkasan Performa (ROAS, GMV, Keuntungan) dan melihat Kalender Profit harian interaktif. Jangan lupa atur PPN Meta Anda!",
      icon: <Activity className="w-24 h-24 text-white drop-shadow-xl" strokeWidth={1.5} />,
      color: "from-blue-500 to-cyan-400"
    },
    {
      title: "2. Tab Performa Tag",
      desc: "Kaitkan Tag Shopee dengan Campaign Meta Anda di tabel ini. Anda dapat melihat konversi per tag secara detail dan menyaring data spesifik berdasarkan tanggal.",
      icon: <LayoutList className="w-24 h-24 text-white drop-shadow-xl" strokeWidth={1.5} />,
      color: "from-teal-400 to-emerald-500"
    },
    {
      title: "3. Tab Analitik & Visual",
      desc: "Visualisasikan data Anda! Pantau tren grafik harian, temukan Top 10 Tag, Top 10 Produk terlaris, hingga proporsi kategori produk Anda dengan mudah.",
      icon: <PieChart className="w-24 h-24 text-white drop-shadow-xl" strokeWidth={1.5} />,
      color: "from-indigo-500 to-violet-600"
    },
    {
      title: "4. Tab Export Laporan",
      desc: "Butuh laporan bulanan atau ingin mengolah data lebih lanjut? Unduh rekap performa dalam format Excel (CSV) atau cetak langsung menjadi dokumen PDF!",
      icon: <Download className="w-24 h-24 text-white drop-shadow-xl" strokeWidth={1.5} />,
      color: "from-fuchsia-500 to-pink-600"
    }
  ];

  const handleNextTour = () => {
    if (tourStep < tourStepsData.length - 1) setTourStep(tourStep + 1);
    else setShowTour(false);
  };
  
  const handlePrevTour = () => {
    if (tourStep > 0) setTourStep(tourStep - 1);
  };

  // --- FUNGSI PARSER CSV ---
  const parseCSV = (file, callback) => {
    if (!file) return;
    const reader = new FileReader();
    
    reader.onload = (event) => {
      setTimeout(() => {
        try {
          const text = event.target.result;
          if (!text) {
             callback([]);
             return;
          }

          const sample = text.slice(0, 2000);
          const c = (sample.match(/,/g) || []).length;
          const s = (sample.match(/;/g) || []).length;
          const t = (sample.match(/\t/g) || []).length;
          let delimiter = ',';
          if (s > c && s > t) delimiter = ';';
          else if (t > c && t > s) delimiter = '\t';

          const lines = text.split(/\r?\n/);
          const rows = [];
          let currentLineStr = '';
          let inQuotes = false;

          for (let i = 0; i < lines.length; i++) {
            let line = lines[i];

            if (currentLineStr) {
               currentLineStr += '\n' + line;
            } else {
               currentLineStr = line;
            }

            let quoteCount = 0;
            for (let j = 0; j < line.length; j++) {
               if (line[j] === '"') quoteCount++;
            }

            if (quoteCount % 2 !== 0) {
               inQuotes = !inQuotes;
            }

            if (!inQuotes) {
               if (currentLineStr.trim() !== '') {
                  const cells = [];
                  let cell = '';
                  let inCellQuotes = false;
                  
                  for(let k = 0; k < currentLineStr.length; k++) {
                     const char = currentLineStr[k];
                     if (char === '"') {
                        if (inCellQuotes && currentLineStr[k+1] === '"') {
                           cell += '"';
                           k++; 
                        } else {
                           inCellQuotes = !inCellQuotes;
                        }
                     } else if (char === delimiter && !inCellQuotes) {
                        cells.push(cell);
                        cell = '';
                     } else {
                        cell += char;
                     }
                  }
                  cells.push(cell);
                  rows.push(cells);
               }
               currentLineStr = ''; 
            }
          }

          if (rows.length < 2) {
             callback([]);
             return;
          }

          let headerRowIndex = 0;
          for (let i = 0; i < Math.min(20, rows.length); i++) {
              const rowStr = rows[i].join(' ').toLowerCase();
              if (
                rowStr.includes('click id') || rowStr.includes('klik id') || 
                rowStr.includes('order id') || rowStr.includes('id pesanan') || rowStr.includes('id pemesanan') || 
                rowStr.includes('campaign name') || rowStr.includes('nama kampanye') ||
                rowStr.includes('awal pelaporan') || rowStr.includes('reporting starts') ||
                rowStr.includes('waktu klik') || rowStr.includes('click time')
              ) {
                headerRowIndex = i;
                break;
              }
          }

          const normalizeHeader = (rawHeader) => {
            if (!rawHeader) return '';
            const h = rawHeader.toLowerCase().replace(/[\u200B-\u200D\uFEFF]/g, '').replaceAll('"', '').trim();
            
            if (h === 'campaign name' || h === 'nama kampanye') return 'Campaign name';
            if (h === 'reporting starts' || h === 'awal pelaporan') return 'Reporting starts';
            if (h === 'reporting ends' || h === 'akhir pelaporan') return 'Reporting ends';
            if (h === 'campaign delivery' || h === 'penayangan kampanye' || h === 'status') return 'Campaign delivery';
            if (h.includes('amount spent') || h.includes('jumlah yang dibelanjakan')) return 'Amount spent (IDR)';
            if (h === 'link clicks' || h === 'klik tautan') return 'Link clicks';
            if (h === 'results' || h === 'hasil') return 'Results';
            if (h === 'impressions' || h === 'impresi') return 'Impressions';
            if (h === 'ctr' || h.includes('ctr') || h.includes('rasio klik')) return 'CTR';
            
            if (h === 'waktu pemesanan' || h === 'order time') return 'Waktu Pemesanan';
            if (h === 'waktu klik' || h === 'click time') return 'Waktu Klik';
            if (h === 'tag_link1' || h === 'tag link 1') return 'Tag_link1';
            if (h === 'tag_link' || h === 'tag link' || h === 'tag') return 'Tag_link';
            
            if (h.includes('total komisi per produk') || h.includes('komisi barang shopee')) return 'Total Komisi per Produk(Rp)';
            if (h.includes('total komisi per pesanan') || h.includes('estimasi komisi') || h.includes('estimated commission')) return 'Total Komisi per Pesanan(Rp)';
            if (h.includes('nilai pembelian') || h.includes('purchase value') || h.includes('total pembelian') || h.includes('harga pesanan') || h.includes('harga barang')) return 'Nilai Pembelian';
            if (h === 'jumlah' || h === 'quantity' || h === 'qty' || h === 'jumlah produk' || h === 'jumlah barang') return 'Jumlah Produk';
            if (h.includes('nama produk') || h.includes('product name') || h.includes('item name') || h.includes('nama barang')) return 'Nama Produk';
            
            if (h.includes('l1') && h.includes('kategori')) return 'Kategori L1';
            if (h.includes('l2') && h.includes('kategori')) return 'Kategori L2';
            if (h.includes('l3') && h.includes('kategori')) return 'Kategori L3';
            if (h === 'l1' || h === 'l1 global category' || h === 'kategori l1') return 'Kategori L1';
            if (h === 'l2' || h === 'l2 global category' || h === 'kategori l2') return 'Kategori L2';
            if (h === 'l3' || h === 'l3 global category' || h === 'kategori l3') return 'Kategori L3';

            if (h === 'klik id' || h === 'click id') return 'Klik ID';
            if (h === 'id pemesanan' || h === 'order id' || h === 'no. pesanan') return 'ID Pemesanan';
            if (h === 'status pesanan' || h === 'order status') return 'Status Pesanan';
            
            return rawHeader.trim(); 
          };

          const headers = rows[headerRowIndex].map(normalizeHeader);
          const data = [];

          for (let i = headerRowIndex + 1; i < rows.length; i++) {
            const rowArray = rows[i];
            if (rowArray.length === 0 || (rowArray.length === 1 && rowArray[0].trim() === '')) continue;
            
            const rowObj = {};
            headers.forEach((header, index) => {
              rowObj[header] = (rowArray[index] || '').trim();
            });
            data.push(rowObj);
          }
          
          callback(data);
        } catch (error) {
          console.error("Terjadi masalah saat membaca CSV: ", error);
          alert("Gagal membaca file CSV. Harap pastikan format file sudah benar.");
          setIsProcessing(false);
        }
      }, 50);
    };

    reader.onerror = () => {
      alert("Terjadi kesalahan internal saat membaca file.");
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  const handleMultiFileUpload = (e, setter, filterFn, isMetaUpload = false) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsProcessing(true);

    let processedCount = 0;

    files.forEach(file => {
      parseCSV(file, (data) => {
        let hasErrorRange = false;
        if (isMetaUpload) {
          for (let r of data) {
            const startStr = r['Reporting starts'];
            const endStr = r['Reporting ends'];
            if (startStr && endStr && startStr !== '--' && endStr !== '--' && startStr !== endStr) {
              hasErrorRange = true;
              break;
            }
          }
        }

        if (hasErrorRange) {
          setShowMetaWarning(true);
          processedCount++;
          if (processedCount === files.length) setIsProcessing(false);
          return; 
        }

        setter(prev => {
          const filtered = data.filter(filterFn);
          const existingSet = new Set(prev.map(r => Object.values(r).join('~')));
          const uniqueNewData = filtered.filter(r => {
            const str = Object.values(r).join('~');
            if (existingSet.has(str)) return false;
            existingSet.add(str);
            return true;
          });
          return [...prev, ...uniqueNewData];
        });

        processedCount++;
        if (processedCount === files.length) setIsProcessing(false);
      });
    });
    e.target.value = null; 
  };

  // --- FORMATTER ---
  const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  const formatNumber = (val) => new Intl.NumberFormat('id-ID').format(val || 0);
  
  const parseNum = (val) => {
    if (!val || val === '--' || val === '-') return 0;
    let strVal = String(val).replace(/Rp|IDR|\s/gi, '').replaceAll('"', '').trim();

    if (strVal.includes(',') && strVal.includes('.')) {
      if (strVal.lastIndexOf(',') > strVal.lastIndexOf('.')) {
        strVal = strVal.replace(/\./g, '').replace(',', '.'); 
      } else {
        strVal = strVal.replace(/,/g, ''); 
      }
    } 
    else if (strVal.includes(',')) {
      const parts = strVal.split(',');
      if (parts.length > 2 || parts[parts.length - 1].length === 3) {
        strVal = strVal.replace(/,/g, ''); 
      } else {
        strVal = strVal.replace(/,/g, '.'); 
      }
    }
    
    const parsed = parseFloat(strVal);
    return isNaN(parsed) ? 0 : parsed;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
  };

  const formatShortDate = (timestamp) => {
    if (!timestamp) return '-';
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' }).format(d);
  };

  const monthNamesList = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const formatMonthYear = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return '';
    const parts = dateString.split('-');
    if (parts.length < 2) return dateString;
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
        return `${monthNamesList[monthIndex]} ${year}`;
    }
    return dateString;
  };

  // --- LOGIC RENTANG TANGGAL KLIK ---
  const clickDateRange = useMemo(() => {
    if (!shopeeClicks.length) return null;
    let min = new Date('2099-01-01');
    let max = new Date('2000-01-01');
    
    shopeeClicks.forEach(r => {
      const d = getSafeDateObj(r['Waktu Klik']);
      if (d) {
        if (d < min) min = d;
        if (d > max) max = d;
      }
    });
    
    if (min > max) return null;
    
    const minNormalized = new Date(min);
    minNormalized.setHours(0,0,0,0);
    const maxNormalized = new Date(max);
    maxNormalized.setHours(23,59,59,999);
    
    return { min: minNormalized, max: maxNormalized };
  }, [shopeeClicks]);

  // --- LOGIC FILTER DATA BERDASARKAN TANGGAL ---
  const processedCommissions = useMemo(() => {
    if (!isSyncDate || !clickDateRange) return shopeeCommissions;
    return shopeeCommissions.filter(r => {
      const d = getSafeDateObj(r['Waktu Pemesanan'] || r['Waktu Klik']);
      if (!d) return true;
      return d >= clickDateRange.min; 
    });
  }, [shopeeCommissions, isSyncDate, clickDateRange]);

  const processedMetaAds = useMemo(() => {
    let filtered = metaAds;
    
    if (isSyncDate && clickDateRange) {
      filtered = filtered.filter(r => {
        const startD = getSafeDateObj(r['Reporting starts']);
        if (!startD) return true;
        
        const endD = getSafeDateObj(r['Reporting ends']) || startD;

        startD.setHours(0,0,0,0);
        endD.setHours(23,59,59,999);
        
        return startD <= clickDateRange.max && endD >= clickDateRange.min;
      });
    }

    const map = {};
    filtered.forEach(r => {
      const campName = r['Campaign name'];
      if (!campName || campName.toLowerCase() === 'total' || campName.toLowerCase().includes('hasil keseluruhan')) return;

      const dateKey = r['Reporting starts'] || 'nodate';
      const key = `${dateKey}_${campName}`;
      
      if (!map[key]) {
        map[key] = r;
      } else {
        const existingSpend = parseNum(map[key]['Amount spent (IDR)']);
        const newSpend = parseNum(r['Amount spent (IDR)']);
        if (newSpend > existingSpend) map[key] = r;
      }
    });

    return Object.values(map);
  }, [metaAds, isSyncDate, clickDateRange]);

  const uniqueCampaignNames = useMemo(() => {
    const names = new Set();
    processedMetaAds.forEach(ad => {
      if (ad['Campaign name']) names.add(ad['Campaign name']);
    });
    return Array.from(names).sort();
  }, [processedMetaAds]);

  const aggregatedMetaAdsSummary = useMemo(() => {
    const map = {};
    processedMetaAds.forEach(ad => {
      const name = ad['Campaign name'];
      if (!name) return;
      if (!map[name]) {
        map[name] = { 
          name, 
          status: ad['Campaign delivery'] || '-', 
          spent: 0, 
          clicks: 0, 
          results: 0,
          days: 0 
        };
      }
      map[name].days += 1;
      map[name].spent += parseNum(ad['Amount spent (IDR)']);
      map[name].clicks += parseNum(ad['Link clicks']);
      map[name].results += parseNum(ad['Results']);
      if (ad['Campaign delivery'] && ad['Campaign delivery'] !== 'inactive') {
         map[name].status = ad['Campaign delivery'];
      }
    });
    return Object.values(map).sort((a,b) => b.spent - a.spent);
  }, [processedMetaAds]);

  const activeCampaignNames = useMemo(() => {
    return aggregatedMetaAdsSummary.filter(ad => ad.status !== 'inactive').map(ad => ad.name);
  }, [aggregatedMetaAdsSummary]);

  // --- LOGIC RINGKASAN TOTAL DENGAN FILTER TANGGAL ---
  const availableSummaryDates = useMemo(() => {
    const dates = new Set();
    shopeeClicks.forEach(r => {
      const d = extractDateOnly(r['Waktu Klik']);
      if (d) dates.add(d);
    });
    processedCommissions.forEach(r => {
      const d = extractDateOnly(r['Waktu Pemesanan'] || r['Waktu Klik']);
      if (d) dates.add(d);
    });
    processedMetaAds.forEach(r => {
      const d = extractDateOnly(r['Reporting starts']);
      if (d) dates.add(d);
    });
    return Array.from(dates).sort((a, b) => new Date(b) - new Date(a));
  }, [shopeeClicks, processedCommissions, processedMetaAds]);

  const summaryData = useMemo(() => {
    let clicks = 0;
    let commission = 0;
    let gmv = 0;
    let adSpent = 0;
    let metaResults = 0;
    let produkTerjual = 0;
    
    const orderIdsSet = new Set();
    const processedOrdersComm = {};

    shopeeClicks.forEach(r => {
      const d = extractDateOnly(r['Waktu Klik']);
      if (summaryDateFilter === 'all' || d === summaryDateFilter) {
        clicks += 1;
      }
    });

    processedCommissions.forEach(r => {
      const d = extractDateOnly(r['Waktu Pemesanan'] || r['Waktu Klik']);
      if (summaryDateFilter === 'all' || d === summaryDateFilter) {
        const orderId = r['ID Pemesanan'];
        if (orderId) orderIdsSet.add(orderId);

        const komisiProduk = parseNum(r['Total Komisi per Produk(Rp)']);
        const nilaiPembelian = parseNum(r['Nilai Pembelian']);
        
        const qtyStr = r['Jumlah Produk'];
        let qty = 1; 
        if (qtyStr !== undefined && qtyStr !== '') {
          qty = parseNum(qtyStr);
        }
        produkTerjual += qty;
        
        if (r['Total Komisi per Produk(Rp)'] !== undefined) {
          commission += komisiProduk;
          gmv += nilaiPembelian;
        } else {
          if (orderId && !processedOrdersComm[orderId]) {
            processedOrdersComm[orderId] = true;
            commission += parseNum(r['Total Komisi per Pesanan(Rp)']);
            gmv += nilaiPembelian;
          }
        }
      }
    });

    processedMetaAds.forEach(r => {
      const d = extractDateOnly(r['Reporting starts']);
      if (summaryDateFilter === 'all' || d === summaryDateFilter) {
        adSpent += parseNum(r['Amount spent (IDR)']);
        metaResults += parseNum(r['Results']);
      }
    });

    const totalSpentWithPpn = adSpent * (1 + (ppnPercentage / 100)); 

    return { clicks, orders: orderIdsSet.size, produkTerjual, commission, gmv, totalSpentWithPpn, metaResults };
  }, [shopeeClicks, processedCommissions, processedMetaAds, summaryDateFilter, ppnPercentage]);

  const dailySummaryTrend = useMemo(() => {
    const map = {};
    const ppnMultiplier = 1 + (ppnPercentage / 100);
    
    shopeeClicks.forEach(r => {
      const d = extractDateOnly(r['Waktu Klik']);
      if (!d) return;
      if (!map[d]) map[d] = { date: d, commission: 0, spend: 0, gmv: 0, shopeeClicks: 0, metaClicks: 0, orderIdsSet: new Set(), addedOrdersComm: {} };
      map[d].shopeeClicks += 1;
    });

    processedCommissions.forEach(r => {
      const d = extractDateOnly(r['Waktu Pemesanan'] || r['Waktu Klik']);
      if (!d) return;
      if (!map[d]) map[d] = { date: d, commission: 0, spend: 0, gmv: 0, shopeeClicks: 0, metaClicks: 0, orderIdsSet: new Set(), addedOrdersComm: {} };
      
      const orderId = r['ID Pemesanan'];
      if (orderId) map[d].orderIdsSet.add(orderId);
      
      const komisiProduk = parseNum(r['Total Komisi per Produk(Rp)']);
      const nilaiPembelian = parseNum(r['Nilai Pembelian']);
      
      if (r['Total Komisi per Produk(Rp)'] !== undefined) {
        map[d].commission += komisiProduk;
        map[d].gmv += nilaiPembelian;
      } else {
        if (orderId && !map[d].addedOrdersComm[orderId]) {
          map[d].addedOrdersComm[orderId] = true;
          map[d].commission += parseNum(r['Total Komisi per Pesanan(Rp)']);
          map[d].gmv += nilaiPembelian;
        }
      }
    });

    processedMetaAds.forEach(r => {
      const d = extractDateOnly(r['Reporting starts']);
      if (!d) return;
      if (!map[d]) map[d] = { date: d, commission: 0, spend: 0, gmv: 0, shopeeClicks: 0, metaClicks: 0, orderIdsSet: new Set(), addedOrdersComm: {} };
      map[d].spend += parseNum(r['Amount spent (IDR)']) * ppnMultiplier; 
      map[d].metaClicks += parseNum(r['Results']);
    });

    return Object.values(map).map(d => ({
      ...d,
      shopeeOrders: d.orderIdsSet.size
    })).sort((a,b) => new Date(a.date) - new Date(b.date));
  }, [shopeeClicks, processedCommissions, processedMetaAds, ppnPercentage]);

  const maxSummaryVal = Math.max(...dailySummaryTrend.map(d => Math.max(d.commission, d.spend)), 1);

  const summaryProfit = summaryData.commission - summaryData.totalSpentWithPpn;
  let summaryRoi = '-';
  let summaryRoas = '-';
  if (summaryData.totalSpentWithPpn > 0) {
    summaryRoi = `${((summaryProfit / summaryData.totalSpentWithPpn) * 100).toFixed(2)}%`;
    summaryRoas = `${(summaryProfit / summaryData.totalSpentWithPpn).toFixed(2)}x`;
  } else if (summaryProfit > 0) {
    summaryRoi = '∞';
    summaryRoas = '∞';
  } else {
    summaryRoi = '0%';
    summaryRoas = '0x';
  }

  // --- LOGIC KALENDER PROFIT ---
  const availableMonths = useMemo(() => {
    const months = new Set();
    dailySummaryTrend.forEach(d => {
      if (d && d.date) {
        const m = d.date.substring(0, 7);
        if (m.length === 7) months.add(m);
      }
    });
    return Array.from(months).sort().reverse();
  }, [dailySummaryTrend]);

  useEffect(() => {
    if (availableMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(availableMonths[0]);
      setExportMonth(availableMonths[0]);
    } else if (availableMonths.length > 0 && !availableMonths.includes(selectedMonth)) {
      setSelectedMonth(availableMonths[0]);
      setExportMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  const calendarDays = useMemo(() => {
    if (!selectedMonth) return [];
    const parts = selectedMonth.split('-');
    if (parts.length !== 2) return [];
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);

    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayData = dailySummaryTrend.find(d => d.date === dateStr);
      let profit = 0;
      let hasData = false;
      
      if (dayData) {
         profit = dayData.commission - dayData.spend;
         hasData = true;
         days.push({ day: i, dateStr, profit, hasData, ...dayData });
      } else {
         days.push({ day: i, dateStr, profit, hasData });
      }
    }
    return days;
  }, [selectedMonth, dailySummaryTrend]);

  const monthlySummary = useMemo(() => {
    let spend = 0;
    let gmv = 0;
    let commission = 0;

    if (!selectedMonth) return { spend, gmv, commission, profit: 0 };

    dailySummaryTrend.forEach(d => {
      if (d.date && d.date.startsWith(selectedMonth)) {
        spend += d.spend || 0;
        gmv += d.gmv || 0;
        commission += d.commission || 0;
      }
    });

    const profit = commission - spend;
    return { spend, gmv, commission, profit };
  }, [selectedMonth, dailySummaryTrend]);

  // --- LOGIC MENGGABUNGKAN DATA SHOPEE & KALKULASI META ---
  const aggregatedTags = useMemo(() => {
    const tagsMap = {};

    shopeeClicks.forEach(r => {
      let tag = r['Tag_link'];
      if (tag === undefined || tag === null) return;
      tag = String(tag).replace(/-+$/, '');
      if (!tagsMap[tag]) {
        tagsMap[tag] = { clicks: 0, commission: 0, gmv: 0, orderIdsSet: new Set(), addedOrdersComm: {}, commissionsArr: [], timeDiffs: [], clickTimes: [], orderTimes: [] };
      }
    });

    processedCommissions.forEach(r => {
      let tag = r['Tag_link1'];
      if (tag === undefined || tag === null) return;
      tag = String(tag).replace(/-+$/, '');
      if (!tagsMap[tag]) {
        tagsMap[tag] = { clicks: 0, commission: 0, gmv: 0, orderIdsSet: new Set(), addedOrdersComm: {}, commissionsArr: [], timeDiffs: [], clickTimes: [], orderTimes: [] };
      }
    });

    shopeeClicks.forEach(row => {
      const d = extractDateOnly(row['Waktu Klik']);
      if (tagTableDateFilter !== 'all' && d !== tagTableDateFilter) return;

      let tag = row['Tag_link'];
      if (tag === undefined || tag === null) return;
      tag = String(tag).replace(/-+$/, ''); 
      
      if (!tagsMap[tag]) {
         tagsMap[tag] = { clicks: 0, commission: 0, gmv: 0, orderIdsSet: new Set(), addedOrdersComm: {}, commissionsArr: [], timeDiffs: [], clickTimes: [], orderTimes: [] };
      }
      
      tagsMap[tag].clicks += 1;

      const clickTime = getSafeDateObj(row['Waktu Klik']);
      if (clickTime) tagsMap[tag].clickTimes.push(clickTime.getTime());
    });

    processedCommissions.forEach(row => {
      const d = extractDateOnly(row['Waktu Pemesanan'] || row['Waktu Klik']);
      if (tagTableDateFilter !== 'all' && d !== tagTableDateFilter) return;

      let tag = row['Tag_link1'];
      if (tag === undefined || tag === null) return;
      tag = String(tag).replace(/-+$/, '');
      
      if (!tagsMap[tag]) {
         tagsMap[tag] = { clicks: 0, commission: 0, gmv: 0, orderIdsSet: new Set(), addedOrdersComm: {}, commissionsArr: [], timeDiffs: [], clickTimes: [], orderTimes: [] };
      }
      
      const orderId = row['ID Pemesanan'];
      if (orderId) tagsMap[tag].orderIdsSet.add(orderId);

      const komisiProduk = parseNum(row['Total Komisi per Produk(Rp)']);
      const nilaiPembelian = parseNum(row['Nilai Pembelian']);

      if (row['Total Komisi per Produk(Rp)'] !== undefined) {
        tagsMap[tag].commission += komisiProduk;
        tagsMap[tag].gmv += nilaiPembelian;
        tagsMap[tag].commissionsArr.push(komisiProduk);
      } else {
        if (orderId && !tagsMap[tag].addedOrdersComm[orderId]) {
          tagsMap[tag].addedOrdersComm[orderId] = true;
          const komisiPesanan = parseNum(row['Total Komisi per Pesanan(Rp)']);
          tagsMap[tag].commission += komisiPesanan;
          tagsMap[tag].gmv += nilaiPembelian;
          tagsMap[tag].commissionsArr.push(komisiPesanan);
        }
      }

      const orderTime = getSafeDateObj(row['Waktu Pemesanan']);
      const commClickTime = getSafeDateObj(row['Waktu Klik']);

      if (orderTime) tagsMap[tag].orderTimes.push(orderTime.getTime());

      if (orderTime && commClickTime) {
        tagsMap[tag].timeDiffs.push(orderTime.getTime() - commClickTime.getTime());
      }
    });

    return Object.keys(tagsMap).map(tag => {
      const d = tagsMap[tag];
      const comms = d.commissionsArr;
      const diffs = d.timeDiffs;
      const cTimes = d.clickTimes.filter(t => !isNaN(t));
      const oTimes = d.orderTimes.filter(t => !isNaN(t));

      const avgComm = comms.length ? d.commission / comms.length : 0;
      const maxComm = comms.length ? Math.max(...comms) : 0;
      const minComm = comms.length ? Math.min(...comms) : 0;

      const maxDiff = diffs.length ? Math.max(...diffs) : null;
      const minDiff = diffs.length ? Math.min(...diffs) : null;

      const minClick = cTimes.length ? Math.min(...cTimes) : null;
      const maxClick = cTimes.length ? Math.max(...cTimes) : null;
      const minOrder = oTimes.length ? Math.min(...oTimes) : null;
      const maxOrder = oTimes.length ? Math.max(...oTimes) : null;

      const linkedCampaigns = tagMappings[tag] || [];
      
      const linkedAdsData = processedMetaAds.filter(ad => {
        const adDate = extractDateOnly(ad['Reporting starts']);
        if (tagTableDateFilter !== 'all' && adDate !== tagTableDateFilter) return false;
        return linkedCampaigns.includes(ad['Campaign name']);
      });

      const amountSpent = linkedAdsData.reduce((sum, ad) => sum + parseNum(ad['Amount spent (IDR)']), 0);
      const metaClicks = linkedAdsData.reduce((sum, ad) => sum + parseNum(ad['Link clicks']), 0);
      const impressions = linkedAdsData.reduce((sum, ad) => sum + parseNum(ad['Impressions']), 0);
      const results = linkedAdsData.reduce((sum, ad) => sum + parseNum(ad['Results']), 0);
      
      const cpr = results > 0 ? amountSpent / results : (metaClicks > 0 ? amountSpent / metaClicks : 0);
      
      let totalCtr = 0;
      let ctrCount = 0;
      linkedAdsData.forEach(ad => {
        if (ad['CTR'] !== undefined && ad['CTR'] !== '' && ad['CTR'] !== '--') {
          totalCtr += parseNum(ad['CTR']);
          ctrCount += 1;
        }
      });
      const ctr = ctrCount > 0 ? (totalCtr / ctrCount) : (impressions > 0 ? (metaClicks / impressions) * 100 : 0);

      const ppn = amountSpent * (ppnPercentage / 100);
      const totalSpentPlusPpn = amountSpent + ppn;
      const keuntungan = d.commission - totalSpentPlusPpn;
      
      const orders = d.orderIdsSet.size;

      let roi = 0;
      if (totalSpentPlusPpn > 0) roi = (keuntungan / totalSpentPlusPpn) * 100;
      else if (d.commission > 0) roi = Infinity;

      let roas = 0;
      if (totalSpentPlusPpn > 0) roas = keuntungan / totalSpentPlusPpn;
      else if (keuntungan > 0) roas = Infinity;

      let rateLinkShopee = 0;
      if (results > 0) rateLinkShopee = (d.clicks / results) * 100;
      else if (d.clicks > 0) rateLinkShopee = Infinity;

      let rateShopeeOrder = 0;
      if (d.clicks > 0) rateShopeeOrder = (orders / d.clicks) * 100;

      return {
        tag,
        shopeeClicks: d.clicks,
        shopeeOrders: orders,
        shopeeCommission: d.commission,
        gmv: d.gmv,
        avgComm, maxComm, minComm,
        maxDiff, minDiff,
        minClick, maxClick, minOrder, maxOrder,
        linkedCampaigns,
        amountSpent, ppn, metaClicks, cpr, ctr, keuntungan, roi, roas,
        rateLinkShopee, rateShopeeOrder, results
      };
    }).sort((a, b) => b.shopeeCommission - a.shopeeCommission || b.shopeeOrders - a.shopeeOrders);
  }, [shopeeClicks, processedCommissions, tagMappings, processedMetaAds, ppnPercentage, tagTableDateFilter]);

  // LOGIC UNTUK TAG YANG DITAMPILKAN DI TABEL
  const availableTagsToAdd = useMemo(() => {
    return aggregatedTags.filter(item => !visibleTags.includes(item.tag));
  }, [aggregatedTags, visibleTags]);

  const displayedTagsInTable = useMemo(() => {
    return aggregatedTags.filter(item => visibleTags.includes(item.tag));
  }, [aggregatedTags, visibleTags]);

  const handleAddTag = () => {
    if (selectedTagToAdd && !visibleTags.includes(selectedTagToAdd)) {
      setVisibleTags([...visibleTags, selectedTagToAdd]);
      setSelectedTagToAdd('');
    }
  };

  // --- LOGIC HARIAN UNTUK MODAL DETAIL TAG ---
  const tagDailyDetails = useMemo(() => {
    if (!selectedTagForModal) return [];
    
    const dailyMap = {};

    shopeeClicks.forEach(r => {
      let tag = r['Tag_link'];
      if (tag === undefined || tag === null) return;
      tag = String(tag).replace(/-+$/, '');
      if (tag !== selectedTagForModal) return;

      const dateStr = extractDateOnly(r['Waktu Klik']);
      if (!dateStr) return;
      
      if (!dailyMap[dateStr]) dailyMap[dateStr] = { date: dateStr, sClicks: 0, orderIdsSet: new Set(), sComm: 0, sGmv: 0, mSpent: 0, mClicks: 0, mResults: 0, addedOrdersComm: {} };
      dailyMap[dateStr].sClicks += 1;
    });

    processedCommissions.forEach(r => {
      let tag = r['Tag_link1'];
      if (tag === undefined || tag === null) return;
      tag = String(tag).replace(/-+$/, '');
      if (tag !== selectedTagForModal) return;

      const dateStr = extractDateOnly(r['Waktu Pemesanan'] || r['Waktu Klik']);
      if (!dateStr) return;

      if (!dailyMap[dateStr]) dailyMap[dateStr] = { date: dateStr, sClicks: 0, orderIdsSet: new Set(), sComm: 0, sGmv: 0, mSpent: 0, mClicks: 0, mResults: 0, addedOrdersComm: {} };
      
      const orderId = r['ID Pemesanan'];
      if (orderId) dailyMap[dateStr].orderIdsSet.add(orderId);

      const komisiProduk = parseNum(r['Total Komisi per Produk(Rp)']);
      const nilaiPembelian = parseNum(r['Nilai Pembelian']);

      if (r['Total Komisi per Produk(Rp)'] !== undefined) {
        dailyMap[dateStr].sComm += komisiProduk;
        dailyMap[dateStr].sGmv += nilaiPembelian;
      } else {
        if (orderId && !dailyMap[dateStr].addedOrdersComm[orderId]) {
          dailyMap[dateStr].addedOrdersComm[orderId] = true;
          dailyMap[dateStr].sComm += parseNum(r['Total Komisi per Pesanan(Rp)']);
          dailyMap[dateStr].sGmv += nilaiPembelian;
        }
      }
    });

    const linked = tagMappings[selectedTagForModal] || [];
    processedMetaAds.forEach(r => {
      if (!linked.includes(r['Campaign name'])) return;
      const dateStr = extractDateOnly(r['Reporting starts']);
      if (!dateStr) return;

      if (!dailyMap[dateStr]) dailyMap[dateStr] = { date: dateStr, sClicks: 0, orderIdsSet: new Set(), sComm: 0, mSpent: 0, mClicks: 0, mResults: 0, addedOrdersComm: {} };
      dailyMap[dateStr].mSpent += parseNum(r['Amount spent (IDR)']);
      dailyMap[dateStr].mClicks += parseNum(r['Link clicks']);
      dailyMap[dateStr].mResults += parseNum(r['Results']);
    });

    return Object.values(dailyMap).map(d => ({
       ...d,
       sOrders: d.orderIdsSet.size
    })).sort((a,b) => new Date(a.date) - new Date(b.date));
  }, [selectedTagForModal, shopeeClicks, processedCommissions, processedMetaAds, tagMappings]);

  // --- LOGIC CHARTS ---
  const dailyTrend = useMemo(() => {
    const trendMap = {};
    processedCommissions.forEach(r => {
      const dateStr = extractDateOnly(r['Waktu Pemesanan'] || r['Waktu Klik']);
      if (!dateStr) return;

      if (!trendMap[dateStr]) trendMap[dateStr] = { date: dateStr, orderIdsSet: new Set(), commission: 0, addedOrdersComm: {} };
      
      const orderId = r['ID Pemesanan'];
      if (orderId) trendMap[dateStr].orderIdsSet.add(orderId);

      const komisiProduk = parseNum(r['Total Komisi per Produk(Rp)']);
      if (r['Total Komisi per Produk(Rp)'] !== undefined) {
        trendMap[dateStr].commission += komisiProduk;
      } else {
        if (orderId && !trendMap[dateStr].addedOrdersComm[orderId]) {
          trendMap[dateStr].addedOrdersComm[orderId] = true;
          trendMap[dateStr].commission += parseNum(r['Total Komisi per Pesanan(Rp)']);
        }
      }
    });

    return Object.values(trendMap).map(d => ({
       ...d,
       orders: d.orderIdsSet.size
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [processedCommissions]);

  const maxDailyOrders = Math.max(...dailyTrend.map(d => d.orders), 1);

  const statusData = useMemo(() => {
    const sMap = {};
    let total = 0;
    const trackedOrders = new Set();
    
    processedCommissions.forEach(r => {
      const orderId = r['ID Pemesanan'];
      if (orderId && trackedOrders.has(orderId)) return; 
      if (orderId) trackedOrders.add(orderId);

      const status = r['Status Pesanan'] || 'Tidak Diketahui';
      if (!sMap[status]) sMap[status] = 0;
      sMap[status] += 1;
      total += 1;
    });
    return {
      total,
      data: Object.entries(sMap).map(([status, count]) => ({ status, count })).sort((a,b) => b.count - a.count)
    };
  }, [processedCommissions]);

  const topTags = useMemo(() => {
    return [...aggregatedTags].sort((a,b) => b.shopeeCommission - a.shopeeCommission).slice(0, 10);
  }, [aggregatedTags]);
  const maxTagComm = Math.max(...topTags.map(t => t.shopeeCommission), 1);

  const productStats = useMemo(() => {
    const pMap = {};
    processedCommissions.forEach(r => {
      const pName = r['Nama Produk'];
      if (!pName || pName === '--' || pName === '-') return;

      const qtyStr = r['Jumlah Produk'];
      let qty = 1;
      if (qtyStr !== undefined && qtyStr !== '') {
        qty = parseNum(qtyStr);
      }

      if (!pMap[pName]) pMap[pName] = { name: pName, qty: 0, commission: 0, gmv: 0 };
      pMap[pName].qty += qty;
      
      let comm = 0;
      if (r['Total Komisi per Produk(Rp)'] !== undefined) {
        comm = parseNum(r['Total Komisi per Produk(Rp)']);
      } else {
        comm = parseNum(r['Total Komisi per Pesanan(Rp)']);
      }
      
      pMap[pName].commission += comm;
      pMap[pName].gmv += parseNum(r['Nilai Pembelian']);
    });

    const values = Object.values(pMap);
    return {
      byQty: [...values].sort((a,b) => b.qty - a.qty).slice(0, 10),
      byComm: [...values].sort((a,b) => b.commission - a.commission).slice(0, 10)
    };
  }, [processedCommissions]);

  const topProducts = productStats.byQty;
  const topProductsByComm = productStats.byComm;

  const categoryStats = useMemo(() => {
    const l1Map = {};
    const l2Map = {};
    const l3Map = {};
    let totalQty = 0;

    processedCommissions.forEach(r => {
      const pName = r['Nama Produk'];
      if (!pName || pName === '--' || pName === '-') return;

      const qtyStr = r['Jumlah Produk'];
      let qty = 1;
      if (qtyStr !== undefined && qtyStr !== '') qty = parseNum(qtyStr);

      const l1 = r['Kategori L1'] || 'Tidak Diketahui';
      const l2 = r['Kategori L2'] || 'Tidak Diketahui';
      const l3 = r['Kategori L3'] || 'Tidak Diketahui';

      if (!l1Map[l1]) l1Map[l1] = 0;
      l1Map[l1] += qty;

      if (!l2Map[l2]) l2Map[l2] = 0;
      l2Map[l2] += qty;

      if (!l3Map[l3]) l3Map[l3] = 0;
      l3Map[l3] += qty;

      totalQty += qty;
    });

    const formatData = (map) => Object.entries(map)
      .map(([name, count]) => ({ name: name === '--' || name === '-' ? 'Lainnya' : name, count }))
      .sort((a,b) => b.count - a.count);

    return {
      total: totalQty,
      l1: formatData(l1Map),
      l2: formatData(l2Map),
      l3: formatData(l3Map)
    };
  }, [processedCommissions]);

  const currentChartTag = selectedChartTag || (topTags.length > 0 ? topTags[0].tag : '');
  
  const tagDailyChartData = useMemo(() => {
    if (!currentChartTag) return [];
    const map = {};

    shopeeClicks.forEach(r => {
      let tag = r['Tag_link'];
      if (tag === undefined || tag === null) return;
      tag = String(tag).replace(/-+$/, '');
      if (tag !== currentChartTag) return;

      const d = extractDateOnly(r['Waktu Klik']);
      if (!d) return;
      if (!map[d]) map[d] = { date: d, clicks: 0, orderIdsSet: new Set() };
      map[d].clicks += 1;
    });

    processedCommissions.forEach(r => {
      let tag = r['Tag_link1'];
      if (tag === undefined || tag === null) return;
      tag = String(tag).replace(/-+$/, '');
      if (tag !== currentChartTag) return;

      const d = extractDateOnly(r['Waktu Pemesanan'] || r['Waktu Klik']);
      if (!d) return;
      if (!map[d]) map[d] = { date: d, clicks: 0, orderIdsSet: new Set() };
      
      const orderId = r['ID Pemesanan'];
      if (orderId) map[d].orderIdsSet.add(orderId);
    });

    return Object.values(map).map(d => ({
       ...d,
       orders: d.orderIdsSet.size
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [currentChartTag, shopeeClicks, processedCommissions]);

  const maxTagDailyVal = Math.max(...tagDailyChartData.map(d => Math.max(d.clicks, d.orders)), 1);

  // --- LOGIC MENGKAITKAN CAMPAIGN ---
  const linkCampaign = (tagName, campaignName) => {
    if (!campaignName) return;
    setTagMappings(prev => {
      const currentCampaigns = prev[tagName] || [];
      if (currentCampaigns.length >= 1) return prev; 
      if (currentCampaigns.includes(campaignName)) return prev;
      return { ...prev, [tagName]: [...currentCampaigns, campaignName] };
    });
  };

  const unlinkCampaign = (tagName, campaignName) => {
    setTagMappings(prev => {
      const currentCampaigns = prev[tagName] || [];
      return { ...prev, [tagName]: currentCampaigns.filter(c => c !== campaignName) };
    });
  };

  // --- LOGIC GET WARNA TABEL ---
  const getTdClass = (value, type, baseBg) => {
    return `px-3 py-3 align-middle transition-colors border-r border-b border-slate-100 ${baseBg}`;
  };

  // --- LOGIC DRAG TO SCROLL TABEL ---
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  const onMouseLeave = () => setIsDragging(false);
  const onMouseUp = () => setIsDragging(false);
  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault(); 
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // --- FUNGSI GENERATE EXPORT Laporan ---
  const getExportData = () => {
    let title = '';
    let headers = [];
    let rows = [];
    let totalRow = [];

    if (exportType === 'profit') {
      title = `Rekap Profit Harian - ${formatMonthYear(exportMonth)}`;
      headers = ['Tanggal', 'Klik Meta', 'Klik Shopee', 'Pesanan', 'GMV (Rp)', 'Ad Spend (Rp)', 'Komisi (Rp)', 'Profit (Rp)', 'ROAS'];
      
      let tMetaC = 0, tShopeeC = 0, tOrders = 0, tGmv = 0, tSpend = 0, tComm = 0, tProfit = 0;
      
      dailySummaryTrend.filter(d => d.date.startsWith(exportMonth)).forEach(d => {
        const spend = d.spend;
        const profit = d.commission - spend;
        const roas = spend > 0 ? (profit / spend) : (profit > 0 ? '∞' : 0);
        
        tMetaC += d.metaClicks || 0;
        tShopeeC += d.shopeeClicks || 0;
        tOrders += d.shopeeOrders || 0;
        tGmv += d.gmv || 0;
        tSpend += spend || 0;
        tComm += d.commission || 0;
        tProfit += profit || 0;

        rows.push([
          formatDate(new Date(d.date)),
          formatNumber(d.metaClicks || 0),
          formatNumber(d.shopeeClicks || 0),
          formatNumber(d.shopeeOrders || 0),
          formatCurrency(d.gmv || 0),
          formatCurrency(spend),
          formatCurrency(d.commission),
          formatCurrency(profit),
          roas === '∞' ? '∞' : `${roas.toFixed(2)}x`
        ]);
      });

      const totalRoas = tSpend > 0 ? (tProfit / tSpend) : (tProfit > 0 ? '∞' : 0);
      totalRow = [
        'TOTAL BULAN INI',
        formatNumber(tMetaC),
        formatNumber(tShopeeC),
        formatNumber(tOrders),
        formatCurrency(tGmv),
        formatCurrency(tSpend),
        formatCurrency(tComm),
        formatCurrency(tProfit),
        totalRoas === '∞' ? '∞' : `${totalRoas.toFixed(2)}x`
      ];

    } else if (exportType === 'meta') {
      title = `Laporan Iklan Meta Harian - ${formatMonthYear(exportMonth)}`;
      headers = ['Tanggal', 'Biaya Iklan (Rp)', 'Impresi', 'Klik Tautan', 'Hasil', 'Avg CPC (Rp)', 'Avg CTR (%)'];
      
      const map = {};
      const ppnMultiplier = 1 + (ppnPercentage / 100);
      
      processedMetaAds.filter(r => r['Reporting starts'] && r['Reporting starts'].startsWith(exportMonth)).forEach(r => {
         const d = r['Reporting starts'];
         if(!map[d]) map[d] = { spent: 0, impressions: 0, clicks: 0, results: 0 };
         map[d].spent += parseNum(r['Amount spent (IDR)']) * ppnMultiplier;
         map[d].impressions += parseNum(r['Impressions']);
         map[d].clicks += parseNum(r['Link clicks']);
         map[d].results += parseNum(r['Results']);
      });

      let tSpend = 0, tImp = 0, tClicks = 0, tRes = 0;

      Object.entries(map).sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB)).forEach(([date, d]) => {
         const cpc = d.results > 0 ? d.spent / d.results : (d.clicks > 0 ? d.spent / d.clicks : 0);
         const ctr = d.impressions > 0 ? (d.clicks / d.impressions) * 100 : 0;
         
         tSpend += d.spent; tImp += d.impressions; tClicks += d.clicks; tRes += d.results;

         rows.push([
           formatDate(new Date(date)),
           formatCurrency(d.spent),
           formatNumber(d.impressions),
           formatNumber(d.clicks),
           formatNumber(d.results),
           formatCurrency(cpc),
           `${ctr.toFixed(2)}%`
         ]);
      });

      const tCpc = tRes > 0 ? tSpend / tRes : (tClicks > 0 ? tSpend / tClicks : 0);
      const tCtr = tImp > 0 ? (tClicks / tImp) * 100 : 0;
      totalRow = [
        'TOTAL BULAN INI',
        formatCurrency(tSpend),
        formatNumber(tImp),
        formatNumber(tClicks),
        formatNumber(tRes),
        formatCurrency(tCpc),
        `${tCtr.toFixed(2)}%`
      ];
    }

    return { title, headers, rows, totalRow };
  };

  const handleExportCSV = () => {
    const { title, headers, rows, totalRow } = getExportData();
    if (rows.length === 0) return alert('Tidak ada data untuk diekspor pada bulan ini.');

    const csvContent = "\uFEFF" + [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(',')),
      totalRow.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(',')
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title.replaceAll(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const { title, headers, rows, totalRow } = getExportData();
    if (rows.length === 0) return alert('Tidak ada data untuk diekspor pada bulan ini.');

    const printWindow = window.open('', '_blank');
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; line-height: 1.5; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
            h2 { margin: 0 0 5px 0; font-size: 24px; color: #0f172a; }
            p { margin: 0; color: #64748b; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: right; }
            th { background-color: #f1f5f9; font-weight: bold; color: #334155; text-align: center; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
            td:first-child, th:first-child { text-align: left; }
            .total-row td { font-weight: 900; background-color: #f8fafc; border-top: 2px solid #94a3b8; }
            .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
            @media print {
              body { padding: 0; }
              @page { size: landscape; margin: 1cm; }
            }
          </style>
        </head>
        <body onload="setTimeout(function(){ window.print(); window.close(); }, 500)">
          <div class="header">
            <h2>${title}</h2>
            <p>Laporan Resmi Shopee Affiliate x Meta Dashboard</p>
          </div>
          <table>
            <thead>
              <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map(row => `<tr>${row.map((cell, i) => `<td style="${i===0 ? 'text-align:left;':''}">${cell}</td>`).join('')}</tr>`).join('')}
              <tr class="total-row">${totalRow.map((cell, i) => `<td style="${i===0 ? 'text-align:left;':''}">${cell}</td>`).join('')}</tr>
            </tbody>
          </table>
          <div class="footer">Diekspor pada: ${new Date().toLocaleString('id-ID')} | Dibuat menggunakan Performance Dashboard by Slow Living Affiliate</div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-[#f3f4f8] font-sans text-slate-800 pb-12 relative selection:bg-violet-200">
      
      {/* LOADING OVERLAY SAAT MEMPROSES CSV BESAR */}
      {isProcessing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99999] flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm text-center">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-violet-600 border-t-transparent animate-spin"></div>
              <UploadCloud className="absolute inset-0 m-auto text-violet-600 w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Memproses File CSV...</h3>
            <p className="text-sm font-medium text-slate-500">Membaca baris data membutuhkan waktu beberapa saat. Harap tunggu.</p>
          </div>
        </div>
      )}

      {/* ---------------- ONBOARDING TOUR COMPONENTS (MODAL BARU) ---------------- */}
      {showTour && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity" onClick={() => setShowTour(false)}></div>
          
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden relative z-10 animate-in zoom-in-95 duration-300 min-h-[400px]">
            
            {/* Panel Kiri: Animasi Warna & Ikon */}
            <div className={`md:w-2/5 p-8 flex flex-col items-center justify-center bg-gradient-to-br transition-colors duration-500 ${tourStepsData[tourStep].color} relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3"></div>
              <div className="relative z-10 transform transition-transform duration-500 scale-110 hover:scale-125">
                {tourStepsData[tourStep].icon}
              </div>
            </div>

            {/* Panel Kanan: Konten Teks & Navigasi */}
            <div className="md:w-3/5 p-8 sm:p-10 flex flex-col justify-between bg-white relative">
              <button onClick={() => setShowTour(false)} className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors focus:outline-none">
                <X size={20} />
              </button>
              
              <div className="mt-4 md:mt-0">
                <div className="inline-block px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black tracking-widest uppercase rounded-lg mb-4">
                  Panduan {tourStep + 1} dari {tourStepsData.length}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 leading-tight">{tourStepsData[tourStep].title}</h2>
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
                  {tourStepsData[tourStep].desc}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-10">
                <div className="flex gap-2">
                  {tourStepsData.map((_, i) => (
                    <div key={i} className={`h-2.5 rounded-full transition-all duration-300 ${i === tourStep ? 'w-8 bg-violet-600' : 'w-2.5 bg-slate-200'}`} />
                  ))}
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto">
                  {tourStep > 0 && (
                    <button onClick={handlePrevTour} className="flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                      Kembali
                    </button>
                  )}
                  <button onClick={handleNextTour} className="flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold text-white bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-600/30 transition-transform hover:-translate-y-0.5">
                    {tourStep === tourStepsData.length - 1 ? 'Mulai Gunakan' : 'Lanjut'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL PERINGATAN META ADS */}
      {showMetaWarning && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col animate-in zoom-in-95 duration-300 p-8 text-center border border-slate-100">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-rose-100 shadow-inner">
              <AlertTriangle className="w-10 h-10 text-rose-500" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-3">Format Meta Ads Keliru!</h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Sistem mendeteksi data Meta Ads Anda merangkum beberapa hari sekaligus (tidak di-breakdown per hari). Grafik Anda akan menjadi tidak akurat.
            </p>
            <div className="bg-slate-50 rounded-2xl p-5 mb-8 text-sm text-slate-700 text-left border border-slate-200">
              <strong className="block mb-2 text-slate-900">Solusi Perbaikan:</strong> Silakan export ulang data dari Facebook Ads Manager dengan opsi:<br/>
              <span className="text-violet-700 font-bold mt-3 inline-block bg-violet-100 px-3 py-1.5 rounded-lg border border-violet-200 shadow-sm">Breakdown ➔ By Time ➔ Day</span>
            </div>
            <button 
              onClick={() => setShowMetaWarning(false)}
              className="w-full py-3.5 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl shadow-lg transition-transform hover:-translate-y-1"
            >
              Baik, Saya Mengerti
            </button>
          </div>
        </div>
      )}

      {/* MODAL DETAIL HARIAN TAG */}
      {selectedTagForModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4" onClick={() => setSelectedTagForModal(null)}>
          <div 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white z-10">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                  <div className="bg-violet-100 p-2 rounded-xl text-violet-600"><Activity size={20} /></div>
                  Detail Harian: <span className="text-violet-700 bg-violet-50 border border-violet-100 px-3 py-1 rounded-lg text-lg">{selectedTagForModal}</span>
                </h2>
              </div>
              <button onClick={() => setSelectedTagForModal(null)} className="p-2.5 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 rounded-full transition-colors">
                <X size={20} className="text-slate-600" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              {tagDailyDetails.length === 0 ? (
                <div className="text-center bg-white rounded-2xl p-12 border border-slate-200">
                  <Activity size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 font-medium">Tidak ada data harian untuk tag ini.</p>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-slate-800 text-slate-200 font-semibold sticky top-0">
                      <tr>
                        <th className="px-5 py-4 border-r border-slate-700">Tanggal</th>
                        <th className="px-5 py-4 text-blue-300">Biaya Iklan (+{ppnPercentage}%)</th>
                        <th className="px-5 py-4 text-blue-300">Klik Meta</th>
                        <th className="px-5 py-4 text-blue-300">Avg CPC</th>
                        <th className="px-5 py-4 text-orange-300">Klik Shopee</th>
                        <th className="px-5 py-4 text-orange-300">Shopee Orders</th>
                        <th className="px-5 py-4 text-orange-300">GMV</th>
                        <th className="px-5 py-4 text-orange-300">Komisi Shopee</th>
                        <th className="px-5 py-4 text-emerald-300">Keuntungan (Estimasi)</th>
                        <th className="px-5 py-4 text-emerald-300">ROAS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tagDailyDetails.map((day, i) => {
                        const ppnMultiplier = 1 + (ppnPercentage / 100);
                        const mSpentWithPpn = day.mSpent * ppnMultiplier;
                        const estKeuntungan = day.sComm - mSpentWithPpn;
                        const cpr = day.mResults > 0 ? mSpentWithPpn / day.mResults : (day.mClicks > 0 ? mSpentWithPpn / day.mClicks : 0);
                        const roas = mSpentWithPpn > 0 ? estKeuntungan / mSpentWithPpn : (estKeuntungan > 0 ? Infinity : 0);
                        
                        return (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-3 font-bold border-r border-slate-100 text-slate-700">{formatShortDate(day.date)}</td>
                            <td className="px-5 py-3 bg-blue-50/30 text-slate-800 font-medium">{formatCurrency(mSpentWithPpn)}</td>
                            <td className="px-5 py-3 bg-blue-50/30 text-slate-800">{formatNumber(day.mResults)}</td>
                            <td className="px-5 py-3 bg-blue-50/30 text-slate-600">{formatCurrency(cpr)}</td>
                            <td className="px-5 py-3 bg-orange-50/10 font-medium text-slate-800">{formatNumber(day.sClicks)}</td>
                            <td className="px-5 py-3 bg-orange-50/10 font-bold text-slate-900">{formatNumber(day.sOrders)}</td>
                            <td className="px-5 py-3 bg-orange-50/10 text-slate-800 font-bold">{formatCurrency(day.sGmv)}</td>
                            <td className="px-5 py-3 bg-orange-50/10 text-orange-600 font-bold">{formatCurrency(day.sComm)}</td>
                            <td className={`px-5 py-3 font-bold bg-emerald-50/20 ${estKeuntungan >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {formatCurrency(estKeuntungan)}
                            </td>
                            <td className="px-5 py-3 font-bold bg-emerald-50/20 text-emerald-600">
                              {roas === Infinity ? '∞' : `${roas.toFixed(2)}x`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-900 text-white font-bold sticky bottom-0 border-t-2 border-slate-700">
                      <tr>
                        <td className="px-5 py-4 border-r border-slate-700 tracking-wider">TOTAL</td>
                        <td className="px-5 py-4">{formatCurrency(tagDailyDetails.reduce((a,b)=>a+b.mSpent,0) * (1 + (ppnPercentage / 100)))}</td>
                        <td className="px-5 py-4">{formatNumber(tagDailyDetails.reduce((a,b)=>a+b.mResults,0))}</td>
                        <td className="px-5 py-4 text-slate-300">
                          {formatCurrency(
                            (tagDailyDetails.reduce((a,b)=>a+b.mResults,0) > 0) 
                            ? (tagDailyDetails.reduce((a,b)=>a+b.mSpent,0) * (1 + (ppnPercentage / 100))) / tagDailyDetails.reduce((a,b)=>a+b.mResults,0) 
                            : (tagDailyDetails.reduce((a,b)=>a+b.mClicks,0) > 0 ? (tagDailyDetails.reduce((a,b)=>a+b.mSpent,0) * (1 + (ppnPercentage / 100))) / tagDailyDetails.reduce((a,b)=>a+b.mClicks,0) : 0)
                          )}
                        </td>
                        <td className="px-5 py-4">{formatNumber(tagDailyDetails.reduce((a,b)=>a+b.sClicks,0))}</td>
                        <td className="px-5 py-4">{formatNumber(tagDailyDetails.reduce((a,b)=>a+b.sOrders,0))}</td>
                        <td className="px-5 py-4">{formatCurrency(tagDailyDetails.reduce((a,b)=>a+b.sGmv,0))}</td>
                        <td className="px-5 py-4 text-orange-400">{formatCurrency(tagDailyDetails.reduce((a,b)=>a+b.sComm,0))}</td>
                        <td className="px-5 py-4 text-emerald-400">
                          {formatCurrency(tagDailyDetails.reduce((a,b) => a + (b.sComm - (b.mSpent * (1 + (ppnPercentage / 100)))), 0))}
                        </td>
                        <td className="px-5 py-4 text-emerald-400">
                          { (() => {
                               const totalKeuntungan = tagDailyDetails.reduce((a,b) => a + (b.sComm - (b.mSpent * (1 + (ppnPercentage / 100)))), 0);
                               const totalSpent = tagDailyDetails.reduce((a,b)=>a+b.mSpent,0) * (1 + (ppnPercentage / 100));
                               return totalSpent > 0 ? `${(totalKeuntungan / totalSpent).toFixed(2)}x` : (totalKeuntungan > 0 ? '∞' : '0x');
                            })() }
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HEADER UTAMA DARK MODE */}
      <nav className="bg-[#0f172a] px-6 py-4 sticky top-0 z-40 shadow-xl border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-orange-500 to-rose-500 p-2.5 rounded-xl text-white shadow-lg shadow-orange-500/20">
            <Rocket size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wide">
              <span className="text-orange-500">SHOPEE AFFF</span> <span className="text-white">x</span> <span className="text-blue-500">META</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">
              Performance Dashboard & Tag Tracking
              <span className="block mt-0.5 text-[10px] text-slate-500 font-medium normal-case tracking-normal">by Slow Living Affiliate</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => { setShowTour(true); setTourStep(0); }} 
            className="flex items-center gap-2 text-sm font-bold text-slate-900 bg-white hover:bg-slate-100 px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-white/10"
          >
            <HelpCircle size={18} />
            <span className="hidden sm:inline">Panduan</span>
          </button>
        </div>
      </nav>

      {/* CONTAINER UTAMA DIBUAT FULL WIDTH / FLUID */}
      <div className="w-full px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* SECTION 1: UPLOAD DATA */}
        <div id="step-upload" className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-sm border border-slate-200/80 relative overflow-hidden">
          {/* Dekorasi Background */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 text-slate-50 opacity-50 pointer-events-none">
            <UploadCloud size={300} />
          </div>
          
          <div className="relative z-10 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-2">
                <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-600/30">
                  <UploadCloud size={24} />
                </div>
                Import Data CSV
              </h2>
              <p className="text-sm font-medium text-slate-500 ml-14">Unggah file laporan dari Meta dan Shopee untuk mulai sinkronisasi.</p>
            </div>
            
            <div className="flex gap-2 ml-14 sm:ml-0">
               <div className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border ${metaAds.length > 0 && shopeeCommissions.length > 0 && shopeeClicks.length > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                 <span className={`w-2 h-2 rounded-full ${metaAds.length > 0 && shopeeCommissions.length > 0 && shopeeClicks.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                 {metaAds.length > 0 && shopeeCommissions.length > 0 && shopeeClicks.length > 0 ? 'Data Lengkap' : 'Menunggu Data'}
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            
            {/* Upload Box 1: Meta Ads */}
            <div className={`group relative rounded-[1.5rem] transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1 ${metaAds.length > 0 ? 'bg-blue-50/50 border-2 border-blue-400 shadow-md shadow-blue-100' : 'bg-slate-50/50 border-2 border-dashed border-slate-300 hover:border-emerald-400 hover:bg-blue-50/30 hover:shadow-lg'}`}>
              {metaAds.length > 0 && (
                <button onClick={() => setMetaAds([])} className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 bg-white hover:bg-rose-50 p-2 rounded-full shadow-sm transition-colors z-20 focus:outline-none">
                  <X size={16} className="stroke-[3]" />
                </button>
              )}
              <label className="cursor-pointer flex flex-col items-center justify-center p-8 text-center h-full w-full relative z-10">
                <div className={`p-4 rounded-2xl mb-5 transition-all duration-300 ${metaAds.length > 0 ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/40 scale-110' : 'bg-white text-slate-400 shadow-sm border border-slate-200 group-hover:border-blue-200 group-hover:text-blue-500 group-hover:scale-110'}`}>
                  <MetaIcon size={32} strokeWidth={metaAds.length > 0 ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Langkah 1</span>
                <span className="text-lg font-black text-slate-800 mb-2">Data Meta Ads</span>
                
                {metaAds.length > 0 ? (
                  <div className="flex flex-col items-center animate-in zoom-in duration-300 mt-1">
                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 shadow-sm mb-1.5">
                      {formatNumber(metaAds.length)} Baris
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">Berhasil dimuat</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center mt-1">
                    <span className="text-xs text-slate-500 mb-3">Gunakan <span className="font-bold text-slate-700">Breakdown By Day</span></span>
                    <span className="text-[11px] font-bold text-blue-600 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm group-hover:border-blue-300 group-hover:bg-blue-50 transition-colors">Pilih File CSV</span>
                  </div>
                )}
                <input type="file" multiple accept=".csv" className="hidden" onChange={(e) => handleMultiFileUpload(e, setMetaAds, r => r['Campaign name'] && parseNum(r['Amount spent (IDR)']) > 0, true)} />
              </label>
            </div>

            {/* Upload Box 2: Shopee Commissions */}
            <div className={`group relative rounded-[1.5rem] transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1 ${shopeeCommissions.length > 0 ? 'bg-emerald-50/50 border-2 border-emerald-400 shadow-md shadow-emerald-100' : 'bg-slate-50/50 border-2 border-dashed border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/30 hover:shadow-lg'}`}>
              {shopeeCommissions.length > 0 && (
                <button onClick={() => setShopeeCommissions([])} className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 bg-white hover:bg-rose-50 p-2 rounded-full shadow-sm transition-colors z-20 focus:outline-none">
                  <X size={16} className="stroke-[3]" />
                </button>
              )}
              <label className="cursor-pointer flex flex-col items-center justify-center p-8 text-center h-full w-full relative z-10">
                <div className={`p-4 rounded-2xl mb-5 transition-all duration-300 ${shopeeCommissions.length > 0 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 scale-110' : 'bg-white text-slate-400 shadow-sm border border-slate-200 group-hover:border-emerald-200 group-hover:text-emerald-500 group-hover:scale-110'}`}>
                  <ShopeeIcon size={32} strokeWidth={shopeeCommissions.length > 0 ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Langkah 2</span>
                <span className="text-lg font-black text-slate-800 mb-2">Komisi Shopee</span>
                
                {shopeeCommissions.length > 0 ? (
                  <div className="flex flex-col items-center animate-in zoom-in duration-300 mt-1">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-sm mb-1.5">
                      {formatNumber(shopeeCommissions.length)} Pesanan
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">Berhasil dimuat</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center mt-1">
                    <span className="text-xs text-slate-500 mb-3">File <span className="font-bold text-slate-700">AffiliateCommission</span></span>
                    <span className="text-[11px] font-bold text-emerald-600 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm group-hover:border-emerald-300 group-hover:bg-emerald-50 transition-colors">Pilih File CSV</span>
                  </div>
                )}
                <input type="file" multiple accept=".csv" className="hidden" onChange={(e) => handleMultiFileUpload(e, setShopeeCommissions, r => r['ID Pemesanan'], false)} />
              </label>
            </div>

            {/* Upload Box 3: Shopee Clicks */}
            <div className={`group relative rounded-[1.5rem] transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1 ${shopeeClicks.length > 0 ? 'bg-orange-50/50 border-2 border-orange-400 shadow-md shadow-orange-100' : 'bg-slate-50/50 border-2 border-dashed border-slate-300 hover:border-orange-400 hover:bg-orange-50/30 hover:shadow-lg'}`}>
              {shopeeClicks.length > 0 && (
                <button onClick={() => setShopeeClicks([])} className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 bg-white hover:bg-rose-50 p-2 rounded-full shadow-sm transition-colors z-20 focus:outline-none">
                  <X size={16} className="stroke-[3]" />
                </button>
              )}
              <label className="cursor-pointer flex flex-col items-center justify-center p-8 text-center h-full w-full relative z-10">
                <div className={`p-4 rounded-2xl mb-5 transition-all duration-300 ${shopeeClicks.length > 0 ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/40 scale-110' : 'bg-white text-slate-400 shadow-sm border border-slate-200 group-hover:border-orange-200 group-hover:text-orange-500 group-hover:scale-110'}`}>
                  <ShopeeIcon size={32} strokeWidth={shopeeClicks.length > 0 ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Langkah 3</span>
                <span className="text-lg font-black text-slate-800 mb-2">Klik Shopee</span>
                
                {shopeeClicks.length > 0 ? (
                  <div className="flex flex-col items-center animate-in zoom-in duration-300 mt-1">
                    <span className="text-xs font-bold text-orange-700 bg-orange-100 px-3 py-1.5 rounded-xl border border-orange-200 shadow-sm mb-1.5">
                      {formatNumber(shopeeClicks.length)} Klik
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">Berhasil dimuat</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center mt-1">
                    <span className="text-xs text-slate-500 mb-3">File <span className="font-bold text-slate-700">WebsiteClickReport</span></span>
                    <span className="text-[11px] font-bold text-orange-600 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm group-hover:border-orange-300 group-hover:bg-orange-50 transition-colors">Pilih File CSV</span>
                  </div>
                )}
                <input type="file" multiple accept=".csv" className="hidden" onChange={(e) => handleMultiFileUpload(e, setShopeeClicks, r => r['Klik ID'], false)} />
              </label>
            </div>

          </div>
        </div>

        {/* SECTION 2: PENGATURAN SINGKRONISASI TANGGAL & META ADS */}
        {clickDateRange && (
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-[2rem] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex items-start gap-4 relative z-10">
              <div className="bg-white/10 p-3 rounded-2xl text-violet-300 backdrop-blur-sm border border-white/5">
                <Calendar size={24} />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Rentang Tanggal Sinkronisasi</h3>
                <p className="text-sm text-slate-300 mt-1">
                  Mendeteksi data dari <span className="font-bold text-violet-300">{formatDate(clickDateRange.min)}</span> hingga <span className="font-bold text-violet-300">{formatDate(clickDateRange.max)}</span>
                </p>
                {isSyncDate && (
                  <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Meta Ads otomatis difilter sesuai rentang klik.
                  </p>
                )}
              </div>
            </div>
            
            <button 
              onClick={() => setIsSyncDate(!isSyncDate)}
              className={`relative z-10 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg ${isSyncDate ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/20 border border-violet-500' : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'}`}
            >
              {isSyncDate ? <ToggleRight className="text-white" size={20}/> : <ToggleLeft className="text-slate-400" size={20}/>}
              {isSyncDate ? 'Sinkronasi Aktif' : 'Sinkronasi Mati'}
            </button>
          </div>
        )}

        {/* TAB NAVIGATION BAWAH - MODERN GLASSMORPHISM STYLE */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-2 bg-white/60 backdrop-blur-xl p-2.5 rounded-[2rem] sm:rounded-full w-full sm:w-fit mt-4 mb-8 shadow-xl shadow-slate-200/40 border border-white/80 relative z-20 mx-auto sm:mx-0">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl sm:rounded-full text-sm font-black transition-all duration-300 flex-1 sm:flex-none ${activeTab === 'dashboard' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-[1.02] sm:scale-105 ring-2 ring-slate-900/10' : 'text-slate-500 hover:text-slate-900 hover:bg-white/80'}`}
          >
            <Activity size={18} className={activeTab === 'dashboard' ? 'text-violet-400' : 'opacity-70'} /> 
            <span className="whitespace-nowrap">Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('table')} 
            className={`flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl sm:rounded-full text-sm font-black transition-all duration-300 flex-1 sm:flex-none ${activeTab === 'table' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-[1.02] sm:scale-105 ring-2 ring-slate-900/10' : 'text-slate-500 hover:text-slate-900 hover:bg-white/80'}`}
          >
            <LayoutList size={18} className={activeTab === 'table' ? 'text-orange-400' : 'opacity-70'} /> 
            <span className="whitespace-nowrap">Performa Tag</span>
          </button>
          <button 
            onClick={() => setActiveTab('charts')} 
            className={`flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl sm:rounded-full text-sm font-black transition-all duration-300 flex-1 sm:flex-none ${activeTab === 'charts' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-[1.02] sm:scale-105 ring-2 ring-slate-900/10' : 'text-slate-500 hover:text-slate-900 hover:bg-white/80'}`}
          >
            <LineChart size={18} className={activeTab === 'charts' ? 'text-blue-400' : 'opacity-70'} /> 
            <span className="whitespace-nowrap">Analitik & Visual</span>
          </button>
          <button 
            onClick={() => setActiveTab('export')} 
            className={`flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl sm:rounded-full text-sm font-black transition-all duration-300 flex-1 sm:flex-none ${activeTab === 'export' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-[1.02] sm:scale-105 ring-2 ring-slate-900/10' : 'text-slate-500 hover:text-slate-900 hover:bg-white/80'}`}
          >
            <Download size={18} className={activeTab === 'export' ? 'text-emerald-400' : 'opacity-70'} /> 
            <span className="whitespace-nowrap">Export Laporan</span>
          </button>
        </div>

        {/* TAB 1: DASHBOARD (Menyatukan Ringkasan & Kalender) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* SECTION: RINGKASAN TOTAL DENGAN GRADIENT CARDS */}
            <div id="step-summary" className={`bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200/60 flex flex-col gap-6 transition-all duration-500 ${(shopeeClicks.length === 0 && shopeeCommissions.length === 0 && processedMetaAds.length === 0) ? 'opacity-50 grayscale-[50%]' : ''}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2 rounded-xl text-slate-700"><BarChart2 size={24} /></div>
                  <h2 className="text-xl font-black text-slate-900">Ringkasan Performa Keseluruhan</h2>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-20">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500 font-bold">PPN Meta:</span>
                    <div className="flex items-center bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-200 w-24 shadow-inner transition-all">
                      <input
                        type="number"
                        className="w-full bg-transparent text-sm text-slate-800 outline-none text-center font-black"
                        value={ppnPercentage}
                        onChange={(e) => setPpnPercentage(Number(e.target.value) || 0)}
                      />
                      <span className="text-sm text-slate-400 font-bold">%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500 font-bold hidden sm:block">Filter:</span>
                    <select
                      className="text-sm border border-slate-300 rounded-xl px-4 py-2 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow-sm font-bold text-slate-800 min-w-[220px] cursor-pointer"
                      value={summaryDateFilter}
                      onChange={(e) => setSummaryDateFilter(e.target.value)}
                    >
                      <option value="all">Semua Waktu (Keseluruhan)</option>
                      {availableSummaryDates.map(date => (
                        <option key={date} value={date}>{formatDate(new Date(date))}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5 pt-2">
                
                {/* KPI CARD: Klik Meta */}
                <div className="bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-blue-500/20 text-white hover:-translate-y-1 transition-transform relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-20"><Target size={80} /></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <p className="text-sm font-bold text-white/90">Klik Meta</p>
                    <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm"><Target size={18} /></div>
                  </div>
                  <h3 className="text-xl xl:text-2xl font-black tracking-tight relative z-10 truncate" title={formatNumber(summaryData.metaResults)}>{formatNumber(summaryData.metaResults)}</h3>
                </div>

                {/* KPI CARD: Klik Shopee */}
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-orange-500/20 text-white hover:-translate-y-1 transition-transform relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-20"><MousePointerClick size={80} /></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <p className="text-sm font-bold text-white/90">Klik Shopee</p>
                    <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm"><MousePointerClick size={18} /></div>
                  </div>
                  <h3 className="text-xl xl:text-2xl font-black tracking-tight relative z-10 truncate" title={formatNumber(summaryData.clicks)}>{formatNumber(summaryData.clicks)}</h3>
                </div>
                
                {/* KPI CARD: Orders */}
                <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-blue-500/20 text-white hover:-translate-y-1 transition-transform relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-20"><ShoppingCart size={80} /></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <p className="text-sm font-bold text-white/90">Total Pesanan</p>
                    <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm"><ShoppingCart size={18} /></div>
                  </div>
                  <h3 className="text-xl xl:text-2xl font-black tracking-tight relative z-10 truncate" title={formatNumber(summaryData.orders)}>{formatNumber(summaryData.orders)}</h3>
                </div>
                
                {/* KPI CARD: Produk Terjual */}
                <div className="bg-gradient-to-br from-cyan-400 to-teal-500 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-teal-500/20 text-white hover:-translate-y-1 transition-transform relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-20"><Package size={80} /></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <p className="text-sm font-bold text-white/90">Produk Terjual</p>
                    <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm"><Package size={18} /></div>
                  </div>
                  <h3 className="text-xl xl:text-2xl font-black tracking-tight relative z-10 truncate" title={formatNumber(summaryData.produkTerjual)}>{formatNumber(summaryData.produkTerjual)}</h3>
                </div>
                
                {/* KPI CARD: GMV */}
                <div className="bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-rose-500/20 text-white hover:-translate-y-1 transition-transform relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-20"><ShoppingBag size={80} /></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <p className="text-sm font-bold text-white/90">Total GMV</p>
                    <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm"><ShoppingBag size={18} /></div>
                  </div>
                  <h3 className="text-xl xl:text-2xl font-black tracking-tight relative z-10 truncate" title={formatCurrency(summaryData.gmv)}>{formatCurrency(summaryData.gmv)}</h3>
                </div>

                {/* KPI CARD: Commission */}
                <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-emerald-500/20 text-white hover:-translate-y-1 transition-transform relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-20"><DollarSign size={80} /></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <p className="text-sm font-bold text-white/90">Total Komisi</p>
                    <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm"><DollarSign size={18} /></div>
                  </div>
                  <h3 className="text-xl xl:text-2xl font-black tracking-tight relative z-10 truncate" title={formatCurrency(summaryData.commission)}>{formatCurrency(summaryData.commission)}</h3>
                </div>

                {/* KPI CARD: Spend */}
                <div className="bg-gradient-to-br from-violet-400 to-purple-600 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-violet-500/20 text-white hover:-translate-y-1 transition-transform relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-20"><Activity size={80} /></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <p className="text-sm font-bold text-white/90 leading-tight">Ad Spend<br/><span className="text-[10px] font-medium opacity-80">(+PPN {ppnPercentage}%)</span></p>
                    <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm"><Activity size={18} /></div>
                  </div>
                  <h3 className="text-xl xl:text-2xl font-black tracking-tight relative z-10 truncate" title={formatCurrency(summaryData.totalSpentWithPpn)}>{formatCurrency(summaryData.totalSpentWithPpn)}</h3>
                </div>

                {/* KPI CARD: Profit Dinamis */}
                <div className={`rounded-2xl p-5 flex flex-col justify-between shadow-lg text-white hover:-translate-y-1 transition-transform relative overflow-hidden ${summaryProfit >= 0 ? 'bg-gradient-to-br from-slate-800 to-slate-900 shadow-slate-900/20' : 'bg-gradient-to-br from-rose-500 to-red-600 shadow-red-500/20'}`}>
                  <div className="absolute -right-4 -top-4 opacity-10"><TrendingUp size={80} /></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <p className="text-sm font-bold text-white/90">Keuntungan Bersih</p>
                    <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm"><TrendingUp size={18} /></div>
                  </div>
                  <h3 className={`text-xl xl:text-2xl font-black tracking-tight relative z-10 truncate ${summaryProfit >= 0 ? 'text-emerald-400' : 'text-white'}`} title={formatCurrency(summaryProfit)}>
                    {formatCurrency(summaryProfit)}
                  </h3>
                </div>

                {/* KPI CARD: ROI */}
                <div className={`rounded-2xl p-5 flex flex-col justify-between shadow-lg text-white hover:-translate-y-1 transition-transform relative overflow-hidden ${summaryProfit >= 0 ? 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-500/20' : 'bg-gradient-to-br from-rose-500 to-red-600 shadow-red-500/20'}`}>
                  <div className="absolute -right-4 -top-4 opacity-10"><Target size={80} /></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <p className="text-sm font-bold text-white/90">ROI</p>
                    <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm"><Target size={18} /></div>
                  </div>
                  <h3 className="text-xl xl:text-2xl font-black tracking-tight relative z-10 truncate" title={summaryRoi}>{summaryRoi}</h3>
                </div>

                {/* KPI CARD: ROAS */}
                <div className={`rounded-2xl p-5 flex flex-col justify-between shadow-lg text-white hover:-translate-y-1 transition-transform relative overflow-hidden ${summaryProfit >= 0 ? 'bg-gradient-to-br from-fuchsia-500 to-pink-600 shadow-fuchsia-500/20' : 'bg-gradient-to-br from-rose-500 to-red-600 shadow-red-500/20'}`}>
                  <div className="absolute -right-4 -top-4 opacity-10"><Activity size={80} /></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <p className="text-sm font-bold text-white/90">ROAS</p>
                    <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm"><Activity size={18} /></div>
                  </div>
                  <h3 className="text-xl xl:text-2xl font-black tracking-tight relative z-10 truncate" title={summaryRoas}>{summaryRoas}</h3>
                </div>

              </div>
            </div>

            {/* KALENDER PROFIT HARIAN */}
            {dailySummaryTrend.length > 0 && (
              <div className="mt-8 border-t border-slate-200 pt-8 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200/80 flex flex-col relative z-20">
                  <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white rounded-t-3xl relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-violet-500 to-fuchsia-600 p-3.5 rounded-2xl text-white shadow-lg shadow-violet-500/30 shrink-0">
                        <Calendar size={28} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Kalender Profit Harian</h2>
                        <p className="text-sm font-medium text-slate-500 mt-1">Detail performa harian: Komisi vs Pengeluaran Iklan.</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
                       {selectedMonth && availableMonths.length > 0 && (
                          <div className="flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-200 shadow-inner w-full sm:w-auto overflow-x-auto shrink-0">
                             <div className="px-4 py-2 flex flex-col">
                               <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider whitespace-nowrap">Ad Spend</span>
                               <span className="text-sm font-black text-rose-500 whitespace-nowrap">{formatCurrency(monthlySummary.spend)}</span>
                             </div>
                             <div className="w-px h-8 bg-slate-200 mx-1 shrink-0"></div>
                             <div className="px-4 py-2 flex flex-col">
                               <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider whitespace-nowrap">Komisi</span>
                               <span className="text-sm font-black text-emerald-500 whitespace-nowrap">{formatCurrency(monthlySummary.commission)}</span>
                             </div>
                             <div className="w-px h-8 bg-slate-200 mx-1 shrink-0"></div>
                             <div className={`px-5 py-2 flex flex-col rounded-xl shadow-sm shrink-0 ${monthlySummary.profit >= 0 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                               <span className="text-[10px] text-white/80 uppercase font-black tracking-wider whitespace-nowrap">Net Profit</span>
                               <span className="text-sm font-black whitespace-nowrap">{formatCurrency(monthlySummary.profit)}</span>
                             </div>
                          </div>
                       )}
                       <select
                          className="text-sm border-2 border-slate-200 rounded-xl px-5 py-4 md:py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 font-black text-slate-700 shadow-sm cursor-pointer bg-white transition-all w-full md:w-auto shrink-0"
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                          {availableMonths.map(m => <option key={m} value={m}>{formatMonthYear(m)}</option>)}
                          {availableMonths.length === 0 && <option value="" disabled>Belum ada data</option>}
                        </select>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 bg-slate-50/30 rounded-b-3xl">
                     {availableMonths.length === 0 ? (
                        <div className="text-center py-16 flex flex-col items-center justify-center">
                           <Calendar size={48} className="text-slate-300 mb-4" />
                           <p className="text-slate-500 font-bold text-lg">Unggah data CSV untuk melihat kalender profit.</p>
                        </div>
                     ) : (
                        <div className="grid grid-cols-7 gap-3 sm:gap-5 relative">
                          {['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(day => (
                            <div key={day} className="text-center font-black text-slate-400 text-[10px] sm:text-xs py-3 uppercase tracking-widest bg-white rounded-xl shadow-sm border border-slate-100">{day.substring(0, 3)}</div>
                          ))}
                          
                          {calendarDays.map((cDay, i) => {
                            if (!cDay) return <div key={`empty-${i}`} className="p-2 sm:p-4 rounded-2xl border border-transparent"></div>;

                            let colorClass = 'text-slate-900';
                            let bgClass = 'bg-white border-slate-200 hover:border-slate-300';
                            let profitBg = 'bg-slate-100 text-slate-600';

                            if (cDay.hasData) {
                              if (cDay.profit > 0) {
                                colorClass = 'text-emerald-700';
                                bgClass = 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-400 hover:shadow-emerald-500/10';
                                profitBg = 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm';
                              } else if (cDay.profit < 0) {
                                colorClass = 'text-rose-700';
                                bgClass = 'bg-rose-50/40 border-rose-200 hover:border-rose-400 hover:shadow-rose-500/10';
                                profitBg = 'bg-rose-100 text-rose-700 border border-rose-200 shadow-sm';
                              } else {
                                colorClass = 'text-slate-800';
                                bgClass = 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-slate-500/10';
                                profitBg = 'bg-slate-100 text-slate-700 border border-slate-200 shadow-sm';
                              }
                            }

                            const isFirstRow = i < 7; 
                            const dayOfWeek = i % 7;

                            let yPos = isFirstRow ? "top-full mt-3" : "bottom-full mb-3";
                            let originY = isFirstRow ? "origin-top" : "origin-bottom";

                            let xPos = "left-1/2 -translate-x-1/2";
                            let originX = "";

                            if (dayOfWeek === 0 || dayOfWeek === 1) { 
                              xPos = "left-0";
                              originX = "-left";
                            } else if (dayOfWeek === 5 || dayOfWeek === 6) { 
                              xPos = "right-0";
                              originX = "-right";
                            }

                            const tooltipPosClass = `${yPos} ${xPos} ${originY}${originX}`;

                            return (
                              <div key={i} className={`flex flex-col p-3 sm:p-4 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-xl relative group hover:z-50 min-h-[100px] sm:min-h-[135px] cursor-pointer ${bgClass}`}>
                                 <div className="flex justify-between items-start mb-2">
                                   <span className={`text-base sm:text-xl font-black ${cDay.hasData ? colorClass : 'text-slate-400'}`}>{cDay.day}</span>
                                   {cDay.hasData && cDay.profit > 0 && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>}
                                   {cDay.hasData && cDay.profit < 0 && <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>}
                                 </div>
                                 
                                 {cDay.hasData && (
                                   <div className="flex flex-col h-full justify-end gap-2 mt-auto">
                                     <div className={`px-1 sm:px-2 py-1.5 rounded-lg text-center ${profitBg}`}>
                                       <span className="block text-[10px] sm:text-xs font-black truncate">
                                         {cDay.profit > 0 ? '+' : ''}{formatCurrency(cDay.profit)}
                                       </span>
                                     </div>
                                     
                                     <div className="hidden sm:flex flex-col gap-1 border-t border-slate-300/60 pt-2 mt-1">
                                       <div className="flex justify-between items-center text-[9px] font-bold">
                                         <span className="text-slate-400 uppercase tracking-widest">Spnd</span>
                                         <span className="text-rose-500 truncate pl-1" title={formatCurrency(cDay.spend)}>{formatCurrency(cDay.spend)}</span>
                                       </div>
                                       <div className="flex justify-between items-center text-[9px] font-bold">
                                         <span className="text-slate-400 uppercase tracking-widest">Comm</span>
                                         <span className="text-emerald-600 truncate pl-1" title={formatCurrency(cDay.commission)}>{formatCurrency(cDay.commission)}</span>
                                       </div>
                                     </div>
                                   </div>
                                 )}
                                 
                                 {cDay.hasData && (
                                    <div className={`absolute ${tooltipPosClass} hidden group-hover:flex flex-col bg-slate-900/95 backdrop-blur-xl text-white text-[10px] p-3.5 rounded-2xl w-48 z-[100] shadow-2xl border border-slate-700 pointer-events-none scale-0 group-hover:scale-100 transition-transform duration-200 ease-out`}>
                                      <div className="font-black text-xs border-b border-slate-700/80 pb-1.5 mb-2 text-center text-white">{formatDate(new Date(cDay.dateStr))}</div>
                                      
                                      <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-slate-400 font-medium">Meta Klik/Order</span>
                                        <span className="font-bold"><span className="text-sky-400">{formatNumber(cDay.metaClicks)}</span> <span className="text-slate-600">|</span> <span className="text-orange-400">{formatNumber(cDay.shopeeOrders)}</span></span>
                                      </div>
                                      
                                      <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-slate-400 font-medium">Ad Spend</span>
                                        <span className="font-bold text-rose-400">{formatCurrency(cDay.spend)}</span>
                                      </div>
                                      
                                      <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-slate-400 font-medium">Komisi</span>
                                        <span className="font-bold text-emerald-400">{formatCurrency(cDay.commission)}</span>
                                      </div>
                                      
                                      <div className="flex justify-between items-center mb-2.5 border-b border-slate-700/80 pb-2">
                                        <span className="text-slate-400 font-medium">GMV</span>
                                        <span className="font-bold text-slate-300">{formatCurrency(cDay.gmv)}</span>
                                      </div>
                                      
                                      <div className={`flex justify-between items-center bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/5 ${cDay.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        <span className="font-black uppercase tracking-widest text-[9px]">{cDay.profit >= 0 ? 'Profit' : 'Rugi'}</span>
                                        <span className="font-black text-xs">{cDay.profit > 0 ? '+' : ''}{formatCurrency(cDay.profit)}</span>
                                      </div>
                                    </div>
                                 )}
                              </div>
                            )
                          })}
                        </div>
                     )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SECTION TABEL DETAIL PERFORMA TAG */}
        {activeTab === 'table' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            {/* TABEL PERFORMA TAG */}
            <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200/80 overflow-hidden flex flex-col">
              
              {/* Toolbar Atas Tabel */}
              <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white relative z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-orange-400 to-rose-500 p-2 rounded-xl text-white shadow-sm"><TrendingUp size={22} /></div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Kinerja Tag Kombinasi</h2>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">Klik Nama Tag (teks biru) untuk detail data per hari.</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-sm font-bold text-slate-500 hidden sm:block">Filter Tanggal:</span>
                    <select
                      className="flex-1 sm:flex-none text-sm border border-slate-300 rounded-xl px-4 py-2 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow-sm font-bold text-slate-800 cursor-pointer min-w-[200px]"
                      value={tagTableDateFilter}
                      onChange={(e) => setTagTableDateFilter(e.target.value)}
                    >
                      <option value="all">Semua Waktu (Keseluruhan)</option>
                      {availableSummaryDates.map(date => (
                        <option key={date} value={date}>{formatDate(new Date(date))}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* BARU: Tombol Sensor Nama */}
                  <button 
                    onClick={() => setIsNamesHidden(!isNamesHidden)}
                    className="text-xs text-slate-600 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 px-4 py-2.5 sm:py-2 rounded-xl border border-slate-200 font-bold shadow-sm w-full sm:w-auto transition-colors"
                    title="Sembunyikan nama tag dan campaign dari layar"
                  >
                    {isNamesHidden ? <EyeOff size={16} className="text-rose-500" /> : <Eye size={16} className="text-slate-400" />}
                    <span className="hidden sm:block">{isNamesHidden ? 'Buka Sensor' : 'Sensor Nama'}</span>
                  </button>

                  <div className="text-xs text-slate-600 flex items-center justify-center gap-2 bg-slate-50 px-4 py-2.5 sm:py-2 rounded-xl border border-slate-200 font-bold shadow-sm w-full sm:w-auto">
                    <GripHorizontal size={16} className="text-slate-400" /> Swipe Horizontal
                  </div>
                </div>
              </div>

              {/* PANEL ADD 1 BY 1 & MENGELOLA TAG */}
              <div id="step-add-tag" className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
                <div className="flex flex-col sm:flex-row gap-2 w-full max-w-lg relative z-20">
                  <select
                    className="flex-1 text-sm border border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow-sm font-bold text-slate-700"
                    value={selectedTagToAdd}
                    onChange={(e) => setSelectedTagToAdd(e.target.value)}
                  >
                    <option value="" disabled>Pilih Tag untuk dimasukkan ke tabel...</option>
                    {availableTagsToAdd.map((t, idx) => (
                      <option key={idx} value={t.tag}>
                        {t.tag || '<Tanpa Tag>'} — ({formatNumber(t.shopeeOrders)} Pesanan)
                      </option>
                    ))}
                    {aggregatedTags.length === 0 && <option value="" disabled>Upload Data CSV terlebih dahulu</option>}
                  </select>
                  <button
                    onClick={handleAddTag}
                    className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:hover:translate-y-0"
                    disabled={!selectedTagToAdd}
                  >
                    <PlusCircle size={18} /> Tambah Tag
                  </button>
                </div>

                <div className="flex items-center gap-3 relative z-20">
                  <button 
                    onClick={() => setVisibleTags(aggregatedTags.map(t => t.tag))} 
                    className="text-xs text-violet-700 hover:text-white font-bold px-4 py-2 bg-violet-100 hover:bg-violet-600 border border-violet-200 rounded-xl transition-colors whitespace-nowrap shadow-sm"
                    disabled={aggregatedTags.length === 0}
                  >
                    Tampilkan Semua ({aggregatedTags.length})
                  </button>
                  <button 
                    onClick={() => setVisibleTags([])} 
                    className="text-xs text-rose-600 hover:text-white font-bold px-4 py-2 bg-rose-50 hover:bg-rose-600 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
                  >
                    <Trash2 size={16} /> Kosongkan
                  </button>
                </div>
              </div>

              {/* CONTAINER TABEL UTAMA - DARK HEADER THEME */}
              <div 
                id="step-table"
                ref={scrollRef}
                onMouseDown={onMouseDown}
                onMouseLeave={onMouseLeave}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}
                className={`overflow-y-auto overflow-x-auto select-none max-h-[70vh] relative bg-white ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} z-10 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-50`}
              >
                <table className="min-w-max w-full text-xs text-left border-collapse">
                  <thead className="font-bold">
                    <tr>
                      {/* TH PERTAMA */}
                      <th className="px-4 py-3 w-64 border-r border-slate-700 border-b-[3px] border-b-slate-900 bg-slate-900 text-white sticky top-0 left-0 z-30 shadow-[1px_0_0_0_#334155]">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[13px] tracking-wide">Tag Link Shopee &<br/>Kaitan Campaign Meta</span>
                          <label className="flex items-center gap-1.5 mt-1 cursor-pointer w-fit group bg-slate-800/80 p-1.5 rounded-lg border border-slate-700">
                            <input 
                              type="checkbox" 
                              className="rounded text-violet-500 focus:ring-violet-500 w-3.5 h-3.5 cursor-pointer bg-slate-700 border-slate-600"
                              checked={filterActiveCampaigns}
                              onChange={(e) => setFilterActiveCampaigns(e.target.checked)}
                            />
                            <span className="text-[10px] font-medium text-slate-300 group-hover:text-white transition-colors">Tampilkan yg aktif saja</span>
                          </label>
                        </div>
                      </th>
                      
                      {/* KOLOM META ADS */}
                      <th className="px-3 py-3 bg-slate-800 text-blue-300 border-b-[3px] border-b-blue-500 sticky top-0 z-20">Biaya Iklan<br/><span className="text-[10px] font-medium text-slate-400 block mt-0.5">(dari Meta)</span></th>
                      <th className="px-3 py-3 bg-slate-800 text-blue-300 border-b-[3px] border-b-blue-500 sticky top-0 z-20">PPN {ppnPercentage}%<br/><span className="text-[10px] font-medium text-slate-400 block mt-0.5">(Taksiran Meta)</span></th>
                      <th className="px-3 py-3 bg-slate-800 text-blue-300 border-b-[3px] border-b-blue-500 sticky top-0 z-20">Klik Meta<br/><span className="text-[10px] font-medium text-slate-400 block mt-0.5">(dari Meta)</span></th>
                      <th className="px-3 py-3 bg-slate-800 text-blue-300 border-b-[3px] border-b-blue-500 sticky top-0 z-20">Avg CPC<br/><span className="text-[10px] font-medium text-slate-400 block mt-0.5">(dari Meta)</span></th>
                      <th className="px-3 py-3 bg-slate-800 text-blue-300 border-b-[3px] border-b-blue-500 border-r border-r-slate-700 sticky top-0 z-20">Avg CTR<br/><span className="text-[10px] font-medium text-slate-400 block mt-0.5">(dari Meta)</span></th>
                      
                      {/* KOLOM SHOPEE */}
                      <th className="px-3 py-3 bg-slate-800 text-orange-300 border-b-[3px] border-b-orange-500 sticky top-0 z-20">Klik Shopee<br/><span className="text-[10px] font-medium text-slate-400 block mt-0.5">(dari Shopee)</span></th>
                      <th className="px-3 py-3 bg-slate-800 text-orange-300 border-b-[3px] border-b-orange-500 sticky top-0 z-20">Pesanan<br/><span className="text-[10px] font-medium text-slate-400 block mt-0.5">(Unik Resi)</span></th>
                      <th className="px-3 py-3 bg-slate-800 text-orange-300 border-b-[3px] border-b-orange-500 sticky top-0 z-20">GMV<br/><span className="text-[10px] font-medium text-slate-400 block mt-0.5">(Nilai Pembelian)</span></th>
                      <th className="px-3 py-3 bg-slate-800 text-orange-300 border-b-[3px] border-b-orange-500 border-r border-r-slate-700 sticky top-0 z-20">Total Komisi<br/><span className="text-[10px] font-medium text-slate-400 block mt-0.5">(dari Shopee)</span></th>
                      
                      {/* KOLOM RATE KONVERSI */}
                      <th className="px-3 py-3 bg-slate-800 text-teal-300 border-b-[3px] border-b-teal-500 sticky top-0 z-20">Rate Klik-&gt;Shopee<br/><span className="text-[10px] font-medium text-slate-400 block mt-0.5">(Klik Meta ke Shopee)</span></th>
                      <th className="px-3 py-3 bg-slate-800 text-teal-300 border-b-[3px] border-b-teal-500 border-r border-r-slate-700 sticky top-0 z-20">Rate Shopee-&gt;Order<br/><span className="text-[10px] font-medium text-slate-400 block mt-0.5">(Shopee ke Checkout)</span></th>

                      {/* KOLOM ROI & KEUNTUNGAN */}
                      <th className="px-3 py-3 bg-slate-800 text-emerald-300 border-b-[3px] border-b-emerald-500 sticky top-0 z-20">Keuntungan<br/><span className="text-[10px] font-medium text-slate-400 block mt-0.5">(Komisi-Spent-PPN)</span></th>
                      <th className="px-3 py-3 bg-slate-800 text-emerald-300 border-b-[3px] border-b-emerald-500 sticky top-0 z-20">ROI<br/><span className="text-[10px] font-medium text-slate-400 block mt-0.5">(Return on Investment)</span></th>
                      <th className="px-3 py-3 bg-slate-800 text-emerald-300 border-b-[3px] border-b-emerald-500 border-r border-r-slate-700 sticky top-0 z-20">ROAS<br/><span className="text-[10px] font-medium text-slate-400 block mt-0.5">(Return On Ads Spend)</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white relative z-0">
                    
                    {displayedTagsInTable.length === 0 ? (
                      <tr>
                        <td colSpan="15" className="px-4 py-32 text-center">
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <LayoutList size={56} className="mb-5 opacity-40 text-violet-500" />
                            <h3 className="text-xl font-black text-slate-700 mb-2 tracking-tight">Data Tabel Kosong</h3>
                            <p className="text-sm font-medium">Silakan pilih dan <b className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded">Tambah Tag</b> melalui menu dropdown di atas tabel.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      displayedTagsInTable.map((item, idx) => {
                        let roiStr = '-';
                        if (item.roi === Infinity) roiStr = '∞';
                        else if (item.amountSpent > 0) roiStr = `${item.roi.toFixed(2)}%`;
                        else roiStr = '0%';

                        let roasStr = '-';
                        if (item.roas === Infinity) roasStr = '∞';
                        else if (item.amountSpent > 0) roasStr = `${item.roas.toFixed(2)}x`;
                        else roasStr = '0x';

                        let rateL2S_Str = item.rateLinkShopee === Infinity ? '∞' : `${item.rateLinkShopee.toFixed(2)}%`;

                        // Logika Warna Dinamis untuk Rate Klik -> Shopee
                        let rateColorClass = "text-slate-900";
                        if (item.rateLinkShopee === Infinity || item.rateLinkShopee >= 80) {
                          rateColorClass = "text-emerald-600"; // Hijau
                        } else if (item.rateLinkShopee >= 65) {
                          rateColorClass = "text-amber-500"; // Kuning/Amber
                        } else {
                          rateColorClass = "text-rose-600"; // Merah
                        }

                        return (
                          <tr key={idx} className="group transition-colors relative z-0 hover:bg-slate-50/70">
                            
                            {/* TD PERTAMA (Sticky kiri) - Tetap terang untuk kontras */}
                            <td className="px-4 py-3.5 align-middle border-r border-slate-200 bg-white sticky left-0 z-10 group-hover:bg-slate-50 shadow-[1px_0_0_0_#e2e8f0]">
                              
                              <div className="flex justify-between items-start mb-2">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setSelectedTagForModal(item.tag); }}
                                  className="font-black text-violet-700 hover:text-violet-900 text-[13px] text-left hover:underline flex items-center gap-1.5 transition-colors"
                                  title="Klik untuk lihat detail harian"
                                >
                                  {isNamesHidden ? '******' : (item.tag || '<Tanpa Tag>')} <ExternalLink size={12} className="opacity-60" />
                                </button>
                                
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setVisibleTags(visibleTags.filter(t => t !== item.tag)); }} 
                                  className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded p-1 transition-colors"
                                  title="Hapus dari tabel"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                              
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {item.linkedCampaigns.map(c => (
                                  <span key={c} className="inline-flex items-center gap-1 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-md max-w-[200px] shadow-sm">
                                    <span className="truncate" title={c}>{isNamesHidden ? '******' : c}</span>
                                    <button onClick={() => unlinkCampaign(item.tag, c)} className="hover:text-rose-400 focus:outline-none rounded-full p-px opacity-80 hover:opacity-100 transition-colors bg-white/20">
                                      <X size={10} />
                                    </button>
                                  </span>
                                ))}
                              </div>

                              <div className="relative" onMouseDown={(e) => e.stopPropagation()}>
                                <select 
                                  className="w-full max-w-[200px] text-[10px] border border-violet-200 rounded-xl py-1.5 px-3 bg-violet-50/50 text-violet-800 font-bold focus:ring-2 focus:ring-violet-400 outline-none shadow-sm hover:bg-violet-100 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-violet-50/50"
                                  onChange={(e) => {
                                    linkCampaign(item.tag, e.target.value);
                                    e.target.value = ""; 
                                  }}
                                  defaultValue=""
                                  disabled={item.linkedCampaigns.length >= 1}
                                >
                                  <option value="" disabled>
                                    {item.linkedCampaigns.length >= 1 ? 'Maksimal 1 Campaign Terkait' : '+ Kaitkan Campaign Meta...'}
                                  </option>
                                  {uniqueCampaignNames
                                    .filter(name => !filterActiveCampaigns || activeCampaignNames.includes(name))
                                    .map((campaignName, i) => {
                                      if (item.linkedCampaigns.includes(campaignName)) return null;
                                      return (
                                        <option key={i} value={campaignName}>
                                          {campaignName}
                                        </option>
                                      );
                                  })}
                                  {uniqueCampaignNames.length === 0 && <option value="" disabled>Data Kosong</option>}
                                  {filterActiveCampaigns && activeCampaignNames.length === 0 && uniqueCampaignNames.length > 0 && <option value="" disabled>Tidak ada yg aktif</option>}
                                </select>
                              </div>
                            </td>

                            {/* Kolom Metrik */}
                            <td className={getTdClass(item.amountSpent, 'amountSpent', 'bg-blue-50/10')}>
                              <div className="font-bold text-slate-800 text-[13px]">{formatCurrency(item.amountSpent)}</div>
                            </td>
                            <td className={getTdClass(item.ppn, 'ppn', 'bg-blue-50/10')}>
                              <div className="font-bold text-[13px] text-blue-600">{formatCurrency(item.ppn)}</div>
                            </td>
                            <td className={getTdClass(item.results, 'metaClicks', 'bg-blue-50/10')}>
                              <div className="font-black text-slate-800 text-[13px]">{formatNumber(item.results)}</div>
                            </td>
                            <td className={getTdClass(item.cpr, 'cpr', 'bg-blue-50/10')}>
                              <div className="font-bold text-slate-700 text-[13px]">{formatCurrency(item.cpr)}</div>
                            </td>
                            <td className={getTdClass(item.ctr, 'ctr', 'bg-blue-50/10 border-r border-slate-100')}>
                              <div className="font-bold text-slate-700 text-[13px]">{item.ctr.toFixed(2)}%</div>
                            </td>
                            
                            <td className={getTdClass(item.shopeeClicks, 'shopeeClicks', 'bg-orange-50/10')}>
                              <div className="font-black text-[13px] text-slate-800">{formatNumber(item.shopeeClicks)}</div>
                              {item.minClick && (
                                <div className="text-[9px] mt-1 font-medium whitespace-nowrap text-slate-400">
                                  {formatShortDate(item.minClick)} - {formatShortDate(item.maxClick)}
                                </div>
                              )}
                            </td>
                            <td className={getTdClass(item.shopeeOrders, 'shopeeOrders', 'bg-orange-50/10')}>
                              <div className="font-black text-[13px] text-slate-800">{formatNumber(item.shopeeOrders)}</div>
                              {item.minOrder && (
                                <div className="text-[9px] mt-1 font-medium whitespace-nowrap text-slate-400">
                                  {formatShortDate(item.minOrder)} - {formatShortDate(item.maxOrder)}
                                </div>
                              )}
                            </td>
                            <td className={getTdClass(item.gmv, 'gmv', 'bg-orange-50/10')}>
                              <div className="text-[13px] font-black text-slate-800">{formatCurrency(item.gmv)}</div>
                            </td>
                            <td className={getTdClass(item.shopeeCommission, 'shopeeCommission', 'bg-orange-50/10 border-r border-slate-100')}>
                              <div className="text-[13px] font-black text-orange-600">{formatCurrency(item.shopeeCommission)}</div>
                            </td>
                            
                            <td className={getTdClass(item.rateLinkShopee, 'rateLinkShopee', 'bg-teal-50/10')}>
                              <div className={`font-black text-[13px] ${rateColorClass}`}>{rateL2S_Str}</div>
                            </td>
                            <td className={getTdClass(item.rateShopeeOrder, 'rateShopeeOrder', 'bg-teal-50/10 border-r border-slate-100')}>
                              <div className="font-black text-[13px] text-slate-900">{item.rateShopeeOrder.toFixed(2)}%</div>
                            </td>
                            
                            <td className={getTdClass(item.keuntungan, 'keuntungan', 'bg-emerald-50/10')}>
                              <div className={`font-black text-[13px] tracking-tight ${item.keuntungan >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {item.keuntungan < 0 && '- '}{formatCurrency(Math.abs(item.keuntungan))}
                              </div>
                            </td>
                            <td className={getTdClass(item.roi, 'roi', 'bg-emerald-50/10')}>
                              <div className={`font-black inline-block px-2.5 py-1 rounded-lg text-[11px] shadow-sm border ${item.keuntungan >= 0 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'}`}>
                                {roiStr}
                              </div>
                            </td>
                            <td className={getTdClass(item.roas, 'roas', 'bg-emerald-50/10 border-r border-slate-100')}>
                              <div className={`font-black inline-block px-2.5 py-1 rounded-lg text-[11px] shadow-sm border ${item.roas >= 0 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'}`}>
                                {roasStr}
                              </div>
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SECTION ANALITIK CHARTS */}
        {activeTab === 'charts' && processedCommissions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            
            {/* Chart: Tren Pesanan Harian */}
            <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200/60 lg:col-span-2 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-5">
                <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><BarChart2 size={22} /></div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Tren Pesanan Harian</h2>
              </div>
              
              <div className="flex items-end gap-3.5 h-[20rem] overflow-x-auto pb-6 pt-24 px-10 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                {dailyTrend.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 flex-shrink-0 group relative hover:-translate-y-2 transition-transform cursor-pointer">
                    <div className="w-14 h-40 bg-slate-100/50 rounded-xl relative flex items-end justify-center hover:bg-slate-200/70 transition-colors border-b-2 border-slate-200">
                      <div className="w-full bg-blue-500 rounded-t-lg transition-all relative shadow-sm" style={{ height: `${(d.orders / maxDailyOrders) * 100}%`, minHeight: '6px' }}>
                        
                        {/* Tooltip Hover */}
                        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md text-white text-[11px] py-2 px-3 rounded-xl whitespace-nowrap z-[100] shadow-2xl border border-slate-700 pointer-events-none">
                          <span className="font-black mb-1">{d.orders} Pesanan</span>
                          <span className="text-emerald-400 font-bold border-t border-slate-700 pt-1">{formatCurrency(d.commission)}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500 whitespace-nowrap font-bold">{formatShortDate(d.date)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart: Status Pesanan */}
            <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-5">
                <div className="bg-rose-100 p-2 rounded-xl text-rose-600"><PieChart size={22} /></div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Status Pesanan</h2>
              </div>
              
              <div className="flex flex-col gap-6 pt-2">
                {statusData.data.map((st, i) => {
                  const pct = ((st.count / statusData.total) * 100).toFixed(1);
                  let colorClass = 'bg-blue-400';
                  if (st.status.toLowerCase().includes('selesai')) colorClass = 'bg-emerald-500';
                  else if (st.status.toLowerCase().includes('tertunda')) colorClass = 'bg-amber-400';
                  else if (st.status.toLowerCase().includes('batal') || st.status.toLowerCase().includes('gagal')) colorClass = 'bg-rose-500';

                  return (
                    <div key={i} className="group">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="font-bold text-slate-700">{st.status}</span>
                        <div className="text-right">
                          <span className="text-slate-900 font-black">{st.count}</span> <span className="text-slate-400 font-medium ml-1">({pct}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner border border-slate-200/50">
                        <div className={`${colorClass} h-full rounded-full transition-all group-hover:opacity-80`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart: Tren Klik vs Pesanan per Tag */}
            <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200/60 lg:col-span-3 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-8 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-xl text-orange-600"><TrendingUp size={22} /></div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Tren Klik & Pesanan per Tag</h2>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3 text-[11px] font-bold bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-blue-400 shadow-sm"></span> Klik Shopee</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-orange-400 shadow-sm"></span> Pesanan</span>
                  </div>
                  <select
                    className="text-sm border border-slate-300 rounded-xl px-4 py-2 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 font-bold text-slate-700 max-w-[250px] shadow-sm cursor-pointer bg-white"
                    value={currentChartTag}
                    onChange={(e) => setSelectedChartTag(e.target.value)}
                  >
                    {aggregatedTags.map((t, idx) => (
                      <option key={idx} value={t.tag}>{t.tag || '<Tanpa Tag>'}</option>
                    ))}
                    {aggregatedTags.length === 0 && <option value="" disabled>Belum ada data Tag</option>}
                  </select>
                </div>
              </div>

              <div className="flex items-end gap-3.5 h-[22rem] overflow-x-auto pb-6 pt-32 px-10 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                {tagDailyChartData.map((d, i) => {
                  const rate = d.clicks > 0 ? ((d.orders / d.clicks) * 100).toFixed(1) : 0;
                  return (
                    <div key={i} className="flex flex-col items-center gap-3 flex-shrink-0 group relative hover:-translate-y-2 transition-transform cursor-pointer">
                      <div className="w-16 h-40 bg-slate-100/50 rounded-xl flex items-end justify-center gap-1 hover:bg-slate-200/70 transition-colors relative px-1 border-b-2 border-slate-200">
                        <div className="w-1/2 bg-blue-400 rounded-t-md transition-all shadow-sm" style={{ height: `${(d.clicks / maxTagDailyVal) * 100}%`, minHeight: '6px' }}></div>
                        <div className="w-1/2 bg-orange-400 rounded-t-md transition-all shadow-sm" style={{ height: `${(d.orders / maxTagDailyVal) * 100}%`, minHeight: '6px' }}></div>
                        
                        {/* Tooltip Hover */}
                        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col bg-slate-900/95 backdrop-blur-md text-white text-[11px] py-2 px-3.5 rounded-xl whitespace-nowrap z-[100] shadow-2xl border border-slate-700 pointer-events-none">
                          <span className="font-black mb-2 border-b border-slate-700 pb-1.5 text-center text-slate-300">{formatDate(new Date(d.date))}</span>
                          <div className="flex justify-between gap-5 mb-1.5">
                            <span className="text-blue-300 font-medium">Klik Shopee:</span>
                            <span className="font-bold">{formatNumber(d.clicks)}</span>
                          </div>
                          <div className="flex justify-between gap-5 mb-2 border-b border-slate-700 pb-2">
                            <span className="text-orange-300 font-medium">Pesanan:</span>
                            <span className="font-bold">{formatNumber(d.orders)}</span>
                          </div>
                          <div className="flex justify-between gap-5 font-black text-[11px] text-teal-400">
                            <span>Rate Konversi:</span>
                            <span>{rate}%</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-500 whitespace-nowrap font-bold">{formatShortDate(d.date)}</span>
                    </div>
                  );
                })}
                {tagDailyChartData.length === 0 && (
                  <div className="w-full flex justify-center items-center h-full text-slate-400 text-sm font-bold">Tidak ada data harian untuk tag yang dipilih.</div>
                )}
              </div>
            </div>

            {/* List: Top 10 Tags */}
            <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200/60 lg:col-span-3 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-5">
                <div className="bg-amber-100 p-2 rounded-xl text-amber-600"><Trophy size={22} /></div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Top 10 Tag Tertinggi (Berdasarkan Komisi)</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8 pt-2">
                {topTags.map((tag, i) => (
                  <div key={i} className="flex flex-col justify-center group hover:scale-[1.02] transition-transform">
                    <div className="flex justify-between items-end text-sm mb-2">
                      <span className="font-black text-slate-800 truncate pr-3 text-[15px]" title={tag.tag}>
                        <span className="text-amber-500 font-black mr-1.5">#{i + 1}</span> 
                        {tag.tag || '<Tanpa Tag>'}
                      </span>
                      <span className="text-emerald-600 font-black whitespace-nowrap text-base">{formatCurrency(tag.shopeeCommission)}</span>
                    </div>
                    
                    <div className="flex justify-between text-[11px] text-slate-500 mb-2.5 font-bold">
                      <span>{formatNumber(tag.shopeeClicks)} Klik • {formatNumber(tag.shopeeOrders)} Pesanan</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md">Avg {formatCurrency(tag.avgComm)}</span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-3 shadow-inner overflow-hidden border border-slate-200/50">
                      <div className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full rounded-full transition-all" style={{ width: `${(tag.shopeeCommission / maxTagComm) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* List: Top 10 Produk Terjual */}
            <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200/60 lg:col-span-3 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-5">
                <div className="bg-cyan-100 p-2 rounded-xl text-cyan-600"><Package size={22} /></div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Top 10 Produk Terjual (Berdasarkan Qty)</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8 pt-2">
                {topProducts.map((prod, i) => {
                   const maxQty = topProducts[0]?.qty || 1;
                   return (
                    <div key={i} className="flex flex-col justify-center group hover:scale-[1.02] transition-transform">
                      <div className="flex justify-between items-start text-sm mb-2 gap-3">
                        <span className="font-black text-slate-800 line-clamp-2 text-[13px] leading-tight" title={prod.name}>
                          <span className="text-cyan-500 font-black mr-1.5">#{i + 1}</span> 
                          {prod.name}
                        </span>
                        <span className="text-cyan-600 font-black whitespace-nowrap text-base">{formatNumber(prod.qty)} <span className="text-[10px] text-slate-400 font-bold">Qty</span></span>
                      </div>
                      
                      <div className="flex justify-between text-[11px] text-slate-500 mb-2.5 font-bold">
                        <span>GMV: {formatCurrency(prod.gmv)}</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md text-emerald-600">Komisi: {formatCurrency(prod.commission)}</span>
                      </div>

                      <div className="w-full bg-slate-100 rounded-full h-3 shadow-inner overflow-hidden border border-slate-200/50">
                        <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all" style={{ width: `${(prod.qty / maxQty) * 100}%` }}></div>
                      </div>
                    </div>
                  );
                })}
                {topProducts.length === 0 && (
                  <div className="col-span-full text-center text-slate-400 text-sm font-bold py-8">
                    Data produk belum tersedia. Pastikan kolom "Nama Produk" atau "Nama Barang" ada di file CSV Anda.
                  </div>
                )}
              </div>
            </div>

            {/* List: Top 10 Produk Terjual (Berdasarkan Komisi) */}
            <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200/60 lg:col-span-3 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-5">
                <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600"><DollarSign size={22} /></div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Top 10 Produk Terjual (Berdasarkan Komisi)</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8 pt-2">
                {topProductsByComm.map((prod, i) => {
                   const maxComm = topProductsByComm[0]?.commission || 1;
                   return (
                    <div key={i} className="flex flex-col justify-center group hover:scale-[1.02] transition-transform">
                      <div className="flex justify-between items-start text-sm mb-2 gap-3">
                        <span className="font-black text-slate-800 line-clamp-2 text-[13px] leading-tight" title={prod.name}>
                          <span className="text-emerald-500 font-black mr-1.5">#{i + 1}</span> 
                          {prod.name}
                        </span>
                        <span className="text-emerald-600 font-black whitespace-nowrap text-base">{formatCurrency(prod.commission)}</span>
                      </div>
                      
                      <div className="flex justify-between text-[11px] text-slate-500 mb-2.5 font-bold">
                        <span>GMV: {formatCurrency(prod.gmv)}</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md text-cyan-600">Terjual: {formatNumber(prod.qty)} Qty</span>
                      </div>

                      <div className="w-full bg-slate-100 rounded-full h-3 shadow-inner overflow-hidden border border-slate-200/50">
                        <div className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full transition-all" style={{ width: `${(prod.commission / maxComm) * 100}%` }}></div>
                      </div>
                    </div>
                  );
                })}
                {topProductsByComm.length === 0 && (
                  <div className="col-span-full text-center text-slate-400 text-sm font-bold py-8">
                    Data produk belum tersedia. Pastikan kolom "Nama Produk" atau "Nama Barang" ada di file CSV Anda.
                  </div>
                )}
              </div>
            </div>

            {/* Chart: Persentase Kategori Produk */}
            <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200/60 lg:col-span-3 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-8 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3">
                  <div className="bg-fuchsia-100 p-2 rounded-xl text-fuchsia-600"><PieChart size={22} /></div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Persentase Kategori Produk</h2>
                </div>
                <select
                  className="text-sm border border-slate-300 rounded-xl px-4 py-2 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 font-bold text-slate-700 max-w-[250px] shadow-sm cursor-pointer bg-white"
                  value={selectedCategoryLevel}
                  onChange={(e) => setSelectedCategoryLevel(e.target.value)}
                >
                  <option value="l1">Kategori L1 (Utama)</option>
                  <option value="l2">Kategori L2 (Sub-kategori)</option>
                  <option value="l3">Kategori L3 (Spesifik)</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6 pt-2">
                {categoryStats[selectedCategoryLevel].slice(0, 15).map((cat, i) => {
                  const pct = categoryStats.total > 0 ? ((cat.count / categoryStats.total) * 100).toFixed(1) : 0;
                  return (
                    <div key={i} className="group">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="font-bold text-slate-700 truncate pr-4" title={cat.name}>{cat.name}</span>
                        <div className="text-right whitespace-nowrap">
                          <span className="text-slate-900 font-black">{formatNumber(cat.count)}</span> <span className="text-slate-400 font-medium ml-1">({pct}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner border border-slate-200/50">
                        <div className="bg-gradient-to-r from-fuchsia-400 to-purple-500 h-full rounded-full transition-all group-hover:opacity-80" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
                {categoryStats[selectedCategoryLevel].length === 0 && (
                   <div className="col-span-full text-center text-slate-400 text-sm font-bold py-8">
                     Data kategori belum tersedia di file CSV Anda.
                   </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: SECTION EXPORT LAPORAN */}
        {activeTab === 'export' && (
          <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200/80 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
              <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-3 rounded-2xl text-white shadow-sm">
                <FileSpreadsheet size={28} strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Export Laporan Bulanan</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Unduh data harian dalam format Excel (CSV) atau cetak sebagai PDF.</p>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex flex-col gap-8">
              
              {/* Form Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">1. Pilih Bulan</label>
                  <select
                    className="w-full text-base border-2 border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 font-bold text-slate-800 shadow-sm cursor-pointer bg-white transition-all"
                    value={exportMonth}
                    onChange={(e) => setExportMonth(e.target.value)}
                  >
                    {availableMonths.map(m => <option key={m} value={m}>{formatMonthYear(m)}</option>)}
                    {availableMonths.length === 0 && <option value="" disabled>Belum ada data tersedia</option>}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">2. Jenis Laporan</label>
                  <select
                    className="w-full text-base border-2 border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 font-bold text-slate-800 shadow-sm cursor-pointer bg-white transition-all"
                    value={exportType}
                    onChange={(e) => setExportType(e.target.value)}
                  >
                    <option value="profit">Rekap Profit Harian (Lengkap)</option>
                    <option value="meta">Iklan Meta Harian (Khusus Ads)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
                <button
                  onClick={handleExportPDF}
                  disabled={availableMonths.length === 0}
                  className="flex-1 flex justify-center items-center gap-2 px-6 py-4 rounded-2xl font-black text-white bg-slate-900 hover:bg-black shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <Printer size={20} /> Cetak / Simpan PDF
                </button>
                <button
                  onClick={handleExportCSV}
                  disabled={availableMonths.length === 0}
                  className="flex-1 flex justify-center items-center gap-2 px-6 py-4 rounded-2xl font-black text-emerald-900 bg-emerald-100 hover:bg-emerald-400 border border-emerald-200 hover:border-emerald-400 hover:text-white shadow-lg transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <Download size={20} /> Unduh File Excel (CSV)
                </button>
              </div>

              {/* Laporan Preview Info */}
              <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl mt-2 flex items-start gap-4">
                <Lightbulb size={24} className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-blue-900 mb-1">Informasi Laporan</h4>
                  <p className="text-xs text-blue-700/80 leading-relaxed">
                    {exportType === 'profit' 
                      ? "Laporan 'Rekap Profit' akan merangkum seluruh aktivitas dari Klik Meta, Pesanan Shopee, hingga estimasi ROAS dan Keuntungan (Profit) Bersih per harinya untuk bulan yang dipilih."
                      : "Laporan 'Iklan Meta' hanya akan menampilkan rincian performa Iklan di Facebook/Instagram (Biaya, Impresi, CPC, CTR) tanpa menyertakan konversi Shopee."}
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}