import React, { useState, useRef, useMemo, useEffect } from 'react';
import { UploadCloud, X, GripHorizontal, BarChart3, TrendingUp, MousePointerClick, DollarSign, ShoppingCart, Activity, Calendar, ToggleLeft, ToggleRight, BarChart2, PieChart, Trophy, Target, ChevronDown, ChevronUp, LayoutList, LineChart, PlusCircle, Trash2, ExternalLink, HelpCircle, Lightbulb, Heart, AlertTriangle, ShoppingBag, Package, Rocket } from 'lucide-react';

export default function App() {
  // --- STATE UNTUK DATA CSV ---
  const [shopeeClicks, setShopeeClicks] = useState([]);
  const [shopeeCommissions, setShopeeCommissions] = useState([]);
  const [metaAds, setMetaAds] = useState([]);

  // State untuk Tab Aktif (Table vs Charts)
  const [activeTab, setActiveTab] = useState('table');

  // State untuk menyimpan pemetaan Tag_link ke Campaign Meta
  const [tagMappings, setTagMappings] = useState({});

  // State untuk Sinkronisasi Tanggal
  const [isSyncDate, setIsSyncDate] = useState(true);

  // State untuk Filter Ringkasan & PPN Dinamis
  const [summaryDateFilter, setSummaryDateFilter] = useState('all');
  const [ppnPercentage, setPpnPercentage] = useState(11); 

  // State untuk Menampilkan/Menyembunyikan Tabel Meta Ads
  const [showMetaAdsTable, setShowMetaAdsTable] = useState(false);

  // State untuk Filter Campaign Aktif di Dropdown
  const [filterActiveCampaigns, setFilterActiveCampaigns] = useState(false);

  // State untuk Tag yang ditampilkan di Tabel (Add 1 by 1)
  const [visibleTags, setVisibleTags] = useState([]);
  const [selectedTagToAdd, setSelectedTagToAdd] = useState('');

  // State untuk pop-up detail harian tag
  const [selectedTagForModal, setSelectedTagForModal] = useState(null);

  // State untuk pilihan tag di Chart Harian
  const [selectedChartTag, setSelectedChartTag] = useState('');

  // --- STATE UNTUK ONBOARDING TOUR (DINAMIS) ---
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [tourStyle, setTourStyle] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
  const [highlightStyle, setHighlightStyle] = useState({ opacity: 0 });

  // State untuk Modal Dukungan
  const [showSupportModal, setShowSupportModal] = useState(false);

  // BARU: State untuk Peringatan Meta Ads tanpa Breakdown
  const [showMetaWarning, setShowMetaWarning] = useState(false);

  // DATA ONBOARDING TOUR
  const tourStepsData = [
    {
      targetId: null, 
      title: "Selamat Datang di Dashboard!",
      desc: "Alat ini dirancang khusus untuk memadukan data Iklan Meta (FB/IG) dengan komisi Shopee Affiliate Anda, menampilkan metrik performa secara otomatis dan akurat.",
      icon: <Lightbulb className="w-10 h-10 text-amber-500" />
    },
    {
      targetId: "step-upload",
      title: "1. Import Data CSV",
      desc: "Unggah ketiga file CSV Anda di sini (Meta Ads, Klik Shopee, Komisi Shopee). Khusus Meta Ads, pastikan Anda menggunakan fitur 'Breakdown By Time -> Day' saat export.",
      icon: <UploadCloud className="w-10 h-10 text-blue-500" />
    },
    {
      targetId: "step-summary",
      title: "2. Ringkasan & Profit",
      desc: "Pantau metrik utama seperti GMV, Meta Clicks, Produk Terjual, hingga Keuntungan Bersih. Jangan lupa atur persentase PPN Meta Anda di sini.",
      icon: <BarChart2 className="w-10 h-10 text-teal-500" />
    },
    {
      targetId: "step-add-tag",
      title: "3. Kelola Tag Kombinasi",
      desc: "Pilih dan tambah Tag dari dropdown ini. Setelah masuk ke tabel, kaitkan Tag tersebut dengan Campaign Meta Ads yang sesuai di kolom paling kiri.",
      icon: <Target className="w-10 h-10 text-indigo-500" />
    },
    {
      targetId: "step-table",
      title: "4. Analisis Detail Tabel",
      desc: "Tabel ini bisa Anda drag/geser ke kanan! Klik pada nama tag (teks warna ungu) untuk membuka pop-up Detail Harian dan melihat performa dari hari ke hari.",
      icon: <Activity className="w-10 h-10 text-rose-500" />
    }
  ];

  // LOGIC POSISI TOUR DINAMIS
  useEffect(() => {
    if (!showTour) return;

    if (tourStep >= 3) setActiveTab('table');

    const updatePosition = () => {
      const step = tourStepsData[tourStep];
      
      if (!step.targetId) {
        setTourStyle({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
        setHighlightStyle({ opacity: 0 });
        return;
      }

      const el = document.getElementById(step.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        let top = rect.bottom + 15;
        let left = rect.left + (rect.width / 2) - 180; 

        if (top + 250 > window.innerHeight) {
          top = rect.top - 260;
          if (top < 10) top = 10; 
        }
        
        if (left < 15) left = 15;
        if (left + 360 > window.innerWidth) left = window.innerWidth - 375;

        setHighlightStyle({
          top: rect.top - 6,
          left: rect.left - 6,
          width: rect.width + 12,
          height: rect.height + 12,
          opacity: 1
        });

        setTourStyle({ top, left, transform: 'none' });
      }
    };

    const step = tourStepsData[tourStep];
    if (step.targetId) {
      const el = document.getElementById(step.targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    const timeout = setTimeout(updatePosition, 300);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [tourStep, showTour]);

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
      const text = event.target.result;
      const lines = text.split('\n');
      if (lines.length < 2) return;

      let headerRowIndex = 0;
      let delimiter = ',';
      
      for (let i = 0; i < Math.min(15, lines.length); i++) {
        const lineLow = lines[i].toLowerCase();
        if (
          lineLow.includes('click id') || lineLow.includes('klik id') || 
          lineLow.includes('order id') || lineLow.includes('id pesanan') || lineLow.includes('id pemesanan') || 
          lineLow.includes('campaign name') || lineLow.includes('nama kampanye') ||
          lineLow.includes('awal pelaporan') || lineLow.includes('reporting starts') ||
          lineLow.includes('waktu klik') || lineLow.includes('click time')
        ) {
          headerRowIndex = i;
          const c = (lines[i].match(/,/g) || []).length;
          const s = (lines[i].match(/;/g) || []).length;
          const t = (lines[i].match(/\t/g) || []).length;
          
          if (s > c && s > t) delimiter = ';';
          else if (t > c && t > s) delimiter = '\t';
          else delimiter = ',';
          break;
        }
      }

      const splitRegex = delimiter === '\t' ? /\t/ : new RegExp(`${delimiter}(?=(?:(?:[^"]*"){2})*[^"]*$)`);

      // Translator Kolom
      const normalizeHeader = (rawHeader) => {
        const h = rawHeader.toLowerCase().replace(/[\u200B-\u200D\uFEFF"]/g, '').trim();
        
        // Meta Ads
        if (h === 'campaign name' || h === 'nama kampanye') return 'Campaign name';
        if (h === 'reporting starts' || h === 'awal pelaporan') return 'Reporting starts';
        if (h === 'reporting ends' || h === 'akhir pelaporan') return 'Reporting ends';
        if (h === 'campaign delivery' || h === 'penayangan kampanye' || h === 'status') return 'Campaign delivery';
        if (h.includes('amount spent') || h.includes('jumlah yang dibelanjakan')) return 'Amount spent (IDR)';
        if (h === 'link clicks' || h === 'klik tautan') return 'Link clicks';
        if (h === 'results' || h === 'hasil') return 'Results';
        if (h === 'impressions' || h === 'impresi') return 'Impressions';
        if (h === 'ctr' || h.includes('ctr') || h.includes('rasio klik')) return 'CTR';
        
        // Shopee Affiliate
        if (h === 'waktu pemesanan' || h === 'order time') return 'Waktu Pemesanan';
        if (h === 'waktu klik' || h === 'click time') return 'Waktu Klik';
        if (h === 'tag_link1' || h === 'tag link 1') return 'Tag_link1';
        if (h === 'tag_link' || h === 'tag link' || h === 'tag') return 'Tag_link';
        
        if (h.includes('total komisi per produk') || h.includes('komisi barang shopee')) return 'Total Komisi per Produk(Rp)';
        if (h.includes('total komisi per pesanan') || h.includes('estimasi komisi') || h.includes('estimated commission')) return 'Total Komisi per Pesanan(Rp)';
        if (h.includes('nilai pembelian') || h.includes('purchase value') || h.includes('total pembelian') || h.includes('harga pesanan') || h.includes('harga barang')) return 'Nilai Pembelian';
        if (h === 'jumlah' || h === 'quantity' || h === 'qty' || h === 'jumlah produk' || h === 'jumlah barang') return 'Jumlah Produk';
        
        if (h === 'klik id' || h === 'click id') return 'Klik ID';
        if (h === 'id pemesanan' || h === 'order id' || h === 'no. pesanan') return 'ID Pemesanan';
        if (h === 'status pesanan' || h === 'order status') return 'Status Pesanan';
        
        return rawHeader.replace(/^"|"$/g, '').trim(); 
      };

      const headers = lines[headerRowIndex].split(splitRegex).map(normalizeHeader);
      const data = [];

      for (let i = headerRowIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(splitRegex).map(v => v.replace(/^"|"$/g, '').trim());
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
      callback(data);
    };
    reader.readAsText(file);
  };

  const handleMultiFileUpload = (e, setter, filterFn, isMetaUpload = false) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach(file => {
      parseCSV(file, (data) => {
        
        // Cek Peringatan jika bukan Breakdown By Day
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
          return; 
        }

        setter(prev => {
          const filtered = data.filter(filterFn);
          const existingSet = new Set(prev.map(r => JSON.stringify(r)));
          const uniqueNewData = filtered.filter(r => {
            const str = JSON.stringify(r);
            if (existingSet.has(str)) return false;
            existingSet.add(str);
            return true;
          });
          return [...prev, ...uniqueNewData];
        });
      });
    });
    e.target.value = null; 
  };

  // --- FORMATTER ---
  const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  const formatNumber = (val) => new Intl.NumberFormat('id-ID').format(val || 0);
  
  const parseNum = (val) => {
    if (!val || val === '--' || val === '-') return 0;
    let strVal = String(val).replace(/Rp|IDR|\s|"/gi, '').trim();

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

  const formatDuration = (ms) => {
    if (ms === null || ms === undefined || isNaN(ms)) return '-';
    if (ms < 0) return '< 1m'; 
    
    const secs = Math.floor(ms / 1000);
    const mins = Math.floor(secs / 60);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} hari ${hours % 24} jam`;
    if (hours > 0) return `${hours} jam ${mins % 60} mnt`;
    if (mins > 0) return `${mins} mnt ${secs % 60} dtk`;
    return `${secs} detik`;
  };

  // --- LOGIC RENTANG TANGGAL KLIK ---
  const clickDateRange = useMemo(() => {
    if (!shopeeClicks.length) return null;
    let min = new Date('2099-01-01');
    let max = new Date('2000-01-01');
    
    shopeeClicks.forEach(r => {
      const dateStr = r['Waktu Klik']?.replace(' ', 'T');
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (!isNaN(d)) {
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
      const dateStr = (r['Waktu Pemesanan'] || r['Waktu Klik'])?.replace(' ', 'T');
      if (!dateStr) return true;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return true;
      return d >= clickDateRange.min; 
    });
  }, [shopeeCommissions, isSyncDate, clickDateRange]);

  // PERBAIKAN: Menghapus baris "Total" & Cek Data Duplikat karena multiple file upload
  const processedMetaAds = useMemo(() => {
    let filtered = metaAds;
    
    if (isSyncDate && clickDateRange) {
      filtered = filtered.filter(r => {
        const startStr = r['Reporting starts'];
        const endStr = r['Reporting ends'];
        if (!startStr || startStr === '--') return true;
        
        const startD = new Date(startStr);
        if (isNaN(startD.getTime())) return true;

        const endD = endStr && endStr !== '--' ? new Date(endStr) : new Date(startStr);
        startD.setHours(0,0,0,0);
        endD.setHours(23,59,59,999);
        
        return startD <= clickDateRange.max && endD >= clickDateRange.min;
      });
    }

    const map = {};
    filtered.forEach(r => {
      const campName = r['Campaign name'];
      // Membuang baris Total bawaan FB Ads
      if (!campName || campName.toLowerCase() === 'total' || campName.toLowerCase().includes('hasil keseluruhan')) return;

      const dateKey = r['Reporting starts'] || 'nodate';
      const key = `${dateKey}_${campName}`;
      
      if (!map[key]) {
        map[key] = r;
      } else {
        // Jika ada duplikasi data dari upload berkali-kali, gunakan angka spend yg paling tinggi (paling up-to-date)
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
      const d = r['Waktu Klik']?.split(' ')[0];
      if (d && d !== '--' && !isNaN(new Date(d).getTime())) dates.add(d);
    });
    processedCommissions.forEach(r => {
      const d = (r['Waktu Pemesanan'] || r['Waktu Klik'])?.split(' ')[0];
      if (d && d !== '--' && !isNaN(new Date(d).getTime())) dates.add(d);
    });
    processedMetaAds.forEach(r => {
      const d = r['Reporting starts'];
      if (d && d !== '--' && !isNaN(new Date(d).getTime())) dates.add(d);
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
      const d = r['Waktu Klik']?.split(' ')[0];
      if (summaryDateFilter === 'all' || d === summaryDateFilter) {
        clicks += 1;
      }
    });

    processedCommissions.forEach(r => {
      const d = (r['Waktu Pemesanan'] || r['Waktu Klik'])?.split(' ')[0];
      if (summaryDateFilter === 'all' || d === summaryDateFilter) {
        const orderId = r['ID Pemesanan'];
        if (orderId) orderIdsSet.add(orderId);

        const komisiProduk = parseNum(r['Total Komisi per Produk(Rp)']);
        const nilaiPembelian = parseNum(r['Nilai Pembelian']);
        
        // Kalkulasi jumlah qty produk (jika kosong, asumsikan 1 baris = 1 item)
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
      const d = r['Reporting starts'];
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
    
    processedCommissions.forEach(r => {
      const d = (r['Waktu Pemesanan'] || r['Waktu Klik'])?.split(' ')[0];
      if (!d || d === '--' || isNaN(new Date(d).getTime())) return;
      if (!map[d]) map[d] = { date: d, commission: 0, spend: 0, addedOrdersComm: {} };
      
      const orderId = r['ID Pemesanan'];
      const komisiProduk = parseNum(r['Total Komisi per Produk(Rp)']);
      
      if (r['Total Komisi per Produk(Rp)'] !== undefined) {
        map[d].commission += komisiProduk;
      } else {
        if (orderId && !map[d].addedOrdersComm[orderId]) {
          map[d].addedOrdersComm[orderId] = true;
          map[d].commission += parseNum(r['Total Komisi per Pesanan(Rp)']);
        }
      }
    });

    processedMetaAds.forEach(r => {
      const d = r['Reporting starts'];
      if (!d || d === '--' || isNaN(new Date(d).getTime())) return;
      if (!map[d]) map[d] = { date: d, commission: 0, spend: 0, addedOrdersComm: {} };
      map[d].spend += parseNum(r['Amount spent (IDR)']) * ppnMultiplier; 
    });

    return Object.values(map).sort((a,b) => new Date(a.date) - new Date(b.date));
  }, [processedCommissions, processedMetaAds, ppnPercentage]);

  const maxSummaryVal = Math.max(...dailySummaryTrend.map(d => Math.max(d.commission, d.spend)), 1);

  // --- LOGIC MENGGABUNGKAN DATA SHOPEE & KALKULASI META ---
  const aggregatedTags = useMemo(() => {
    const tagsMap = {};

    shopeeClicks.forEach(row => {
      let tag = row['Tag_link'];
      if (!tag) return;
      tag = tag.replace(/-+$/, ''); 
      
      if (!tagsMap[tag]) tagsMap[tag] = { 
        clicks: 0, commission: 0, gmv: 0, orderIdsSet: new Set(), addedOrdersComm: {},
        commissionsArr: [], timeDiffs: [], clickTimes: [], orderTimes: []
      };
      tagsMap[tag].clicks += 1;

      const clickTimeStr = row['Waktu Klik']?.replace(' ', 'T');
      if (clickTimeStr) tagsMap[tag].clickTimes.push(new Date(clickTimeStr).getTime());
    });

    processedCommissions.forEach(row => {
      let tag = row['Tag_link1'];
      if (!tag) return;
      tag = tag.replace(/-+$/, '');

      if (!tagsMap[tag]) tagsMap[tag] = { 
        clicks: 0, commission: 0, gmv: 0, orderIdsSet: new Set(), addedOrdersComm: {},
        commissionsArr: [], timeDiffs: [], clickTimes: [], orderTimes: []
      };
      
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

      const orderTimeStr = row['Waktu Pemesanan']?.replace(' ', 'T');
      const commClickTimeStr = row['Waktu Klik']?.replace(' ', 'T');

      if (orderTimeStr) tagsMap[tag].orderTimes.push(new Date(orderTimeStr).getTime());

      if (orderTimeStr && commClickTimeStr) {
        const tOrder = new Date(orderTimeStr).getTime();
        const tClick = new Date(commClickTimeStr).getTime();
        if (!isNaN(tOrder) && !isNaN(tClick)) {
          tagsMap[tag].timeDiffs.push(tOrder - tClick);
        }
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
      const linkedAdsData = processedMetaAds.filter(ad => linkedCampaigns.includes(ad['Campaign name']));
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

      let rateLinkShopee = 0;
      if (metaClicks > 0) rateLinkShopee = (d.clicks / metaClicks) * 100;
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
        amountSpent, ppn, metaClicks, cpr, ctr, keuntungan, roi,
        rateLinkShopee, rateShopeeOrder, results
      };
    }).sort((a, b) => b.shopeeCommission - a.shopeeCommission || b.shopeeOrders - a.shopeeOrders);
  }, [shopeeClicks, processedCommissions, tagMappings, processedMetaAds, ppnPercentage]);

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
      let tag = (r['Tag_link'] || '').replace(/-+$/, '');
      if (tag !== selectedTagForModal) return;
      const dateStr = r['Waktu Klik']?.split(' ')[0];
      if (!dateStr || dateStr === '--' || isNaN(new Date(dateStr).getTime())) return;
      
      if (!dailyMap[dateStr]) dailyMap[dateStr] = { date: dateStr, sClicks: 0, orderIdsSet: new Set(), sComm: 0, sGmv: 0, mSpent: 0, mClicks: 0, mResults: 0, addedOrdersComm: {} };
      dailyMap[dateStr].sClicks += 1;
    });

    processedCommissions.forEach(r => {
      let tag = (r['Tag_link1'] || '').replace(/-+$/, '');
      if (tag !== selectedTagForModal) return;
      const dateStr = (r['Waktu Pemesanan'] || r['Waktu Klik'])?.split(' ')[0];
      if (!dateStr || dateStr === '--' || isNaN(new Date(dateStr).getTime())) return;

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
      const dateStr = r['Reporting starts'];
      
      if (!dateStr || dateStr === '--' || isNaN(new Date(dateStr).getTime())) return;

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
      const dateStr = r['Waktu Pemesanan']?.split(' ')[0] || r['Waktu Klik']?.split(' ')[0];
      
      if (!dateStr || dateStr === '--' || isNaN(new Date(dateStr).getTime())) return;

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

  const currentChartTag = selectedChartTag || (topTags.length > 0 ? topTags[0].tag : '');
  
  const tagDailyChartData = useMemo(() => {
    if (!currentChartTag) return [];
    const map = {};

    shopeeClicks.forEach(r => {
      let tag = (r['Tag_link'] || '').replace(/-+$/, '');
      if (tag !== currentChartTag) return;
      const d = r['Waktu Klik']?.split(' ')[0];
      if (!d || d === '--' || isNaN(new Date(d).getTime())) return;
      if (!map[d]) map[d] = { date: d, clicks: 0, orderIdsSet: new Set() };
      map[d].clicks += 1;
    });

    processedCommissions.forEach(r => {
      let tag = (r['Tag_link1'] || '').replace(/-+$/, '');
      if (tag !== currentChartTag) return;
      const d = (r['Waktu Pemesanan'] || r['Waktu Klik'])?.split(' ')[0];
      if (!d || d === '--' || isNaN(new Date(d).getTime())) return;
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

  return (
    <div className="min-h-screen bg-[#f3f4f8] font-sans text-slate-800 pb-12 relative selection:bg-violet-200">
      
      {/* ---------------- ONBOARDING TOUR COMPONENTS ---------------- */}
      {showTour && highlightStyle.opacity === 1 && (
        <div 
          style={{
            position: 'fixed',
            top: highlightStyle.top,
            left: highlightStyle.left,
            width: highlightStyle.width,
            height: highlightStyle.height,
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.75)',
            borderRadius: '16px',
            zIndex: 9998,
            pointerEvents: 'none',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      )}
      {showTour && highlightStyle.opacity === 0 && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9998] transition-opacity duration-300"></div>
      )}

      {/* KOTAK TOUR GUIDE */}
      {showTour && (
        <div 
          style={{
            position: 'fixed',
            top: tourStyle.top,
            left: tourStyle.left,
            transform: tourStyle.transform,
            zIndex: 9999,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          className="bg-slate-900 rounded-[24px] shadow-2xl max-w-[360px] w-full border border-slate-700 flex flex-col overflow-hidden"
        >
          <div className="p-6 relative">
             <button onClick={() => setShowTour(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors bg-slate-800 p-1 rounded-full">
                <X size={16} />
             </button>

             <div className="flex items-start gap-4 mb-3">
               <div className="bg-slate-800 rounded-2xl p-3 border border-slate-700 shadow-inner shrink-0">
                 {tourStepsData[tourStep].icon}
               </div>
               <div className="pt-1">
                 <h2 className="text-base font-bold text-white leading-tight mb-2">{tourStepsData[tourStep].title}</h2>
                 <div className="flex gap-1.5 mb-2">
                   {tourStepsData.map((_, idx) => (
                     <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === tourStep ? 'w-6 bg-violet-500' : 'w-2 bg-slate-700'}`}></div>
                   ))}
                 </div>
               </div>
             </div>
             
             <p className="text-[13px] text-slate-300 leading-relaxed">{tourStepsData[tourStep].desc}</p>
          </div>
          
          <div className="bg-slate-800/50 px-5 py-4 border-t border-slate-700 flex items-center justify-between">
            <button onClick={() => setShowTour(false)} className="text-[11px] font-bold text-slate-400 hover:text-white transition-colors">
              Skip Panduan
            </button>
            <div className="flex gap-2">
              {tourStep > 0 && (
                <button onClick={handlePrevTour} className="px-4 py-2 text-xs font-bold text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors">
                  Kembali
                </button>
              )}
              <button onClick={handleNextTour} className="px-4 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-colors shadow-lg shadow-violet-500/30">
                {tourStep === tourStepsData.length - 1 ? 'Selesai' : 'Lanjut'}
              </button>
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

      {/* MODAL DUKUNGAN / DOA */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm flex flex-col animate-in zoom-in-95 duration-300 p-8 text-center border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-rose-500/30">
              <Heart className="w-10 h-10 text-white fill-white" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Bermanfaat?</h2>
            <p className="text-sm text-slate-500 mb-6">Jika tools ini membantu Anda, tolong aamiin kan doa ini ya..</p>
            
            <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5 mb-8 relative">
              <p className="text-sm font-bold text-violet-900 italic relative z-10 leading-relaxed">
                "Semoga Allah mudahkan rezeki yang membuat tools ini dan pengguna tools ini selalu dapat ROI 300% setiap hari."
              </p>
            </div>
            
            <button 
              onClick={() => setShowSupportModal(false)}
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold rounded-2xl shadow-lg shadow-violet-500/30 transition-transform hover:-translate-y-1 flex justify-center items-center gap-2"
            >
              Aamiin Ya Rabb
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
                        <th className="px-5 py-4 text-blue-300">Meta Spent (+{ppnPercentage}%)</th>
                        <th className="px-5 py-4 text-blue-300">Hasil Klik (Meta)</th>
                        <th className="px-5 py-4 text-blue-300">Avg CPC</th>
                        <th className="px-5 py-4 text-orange-300">Shopee Clicks</th>
                        <th className="px-5 py-4 text-orange-300">Shopee Orders</th>
                        <th className="px-5 py-4 text-orange-300">GMV</th>
                        <th className="px-5 py-4 text-orange-300">Komisi Shopee</th>
                        <th className="px-5 py-4 text-emerald-300">Keuntungan (Estimasi)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tagDailyDetails.map((day, i) => {
                        const ppnMultiplier = 1 + (ppnPercentage / 100);
                        const mSpentWithPpn = day.mSpent * ppnMultiplier;
                        const estKeuntungan = day.sComm - mSpentWithPpn;
                        const cpr = day.mResults > 0 ? mSpentWithPpn / day.mResults : (day.mClicks > 0 ? mSpentWithPpn / day.mClicks : 0);
                        
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
              Performance Dashboard & Tracking
              <span className="block mt-0.5 text-[10px] text-slate-500 font-medium normal-case tracking-normal">by Slow Living Affiliate</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSupportModal(true)} 
            className="flex items-center gap-2 text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl transition-all border border-slate-700 shadow-sm group"
          >
            <Heart size={16} className="text-rose-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Dukung</span>
          </button>
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
        <div id="step-upload" className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200/60 relative">
          <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><UploadCloud size={20} /></div>
            Import Data CSV
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Upload Box 1 */}
            <div className={`relative border-2 border-dashed rounded-[1.5rem] p-6 flex flex-col items-center justify-center transition-all duration-300 ${metaAds.length > 0 ? 'border-blue-500 bg-blue-50/50 shadow-inner' : 'border-slate-300 hover:bg-slate-50 hover:border-blue-400'}`}>
              {metaAds.length > 0 && (
                <button onClick={() => setMetaAds([])} className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-full transition-colors focus:outline-none">
                  <X size={18} />
                </button>
              )}
              <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-center">
                <Activity className={metaAds.length > 0 ? "text-blue-600 mb-3" : "text-slate-400 mb-3 group-hover:text-blue-500"} size={32} />
                <span className="text-base font-bold text-slate-800">1. Data Meta Ads</span>
                <span className="text-xs text-slate-500 mt-1.5">
                  {metaAds.length > 0 ? <span className="text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded">{metaAds.length} baris termuat</span> : 'Gunakan Breakdown By Day'}
                  <br/><span className="text-[11px] text-blue-500 font-semibold mt-2 inline-block">+ Pilih multiple file</span>
                </span>
                <input type="file" multiple accept=".csv" className="hidden" onChange={(e) => handleMultiFileUpload(e, setMetaAds, r => r['Campaign name'] && parseNum(r['Amount spent (IDR)']) > 0, true)} />
              </label>
            </div>

            {/* Upload Box 2 */}
            <div className={`relative border-2 border-dashed rounded-[1.5rem] p-6 flex flex-col items-center justify-center transition-all duration-300 ${shopeeClicks.length > 0 ? 'border-orange-500 bg-orange-50/50 shadow-inner' : 'border-slate-300 hover:bg-slate-50 hover:border-orange-400'}`}>
              {shopeeClicks.length > 0 && (
                <button onClick={() => setShopeeClicks([])} className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-full transition-colors focus:outline-none">
                  <X size={18} />
                </button>
              )}
              <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-center">
                <MousePointerClick className={shopeeClicks.length > 0 ? "text-orange-500 mb-3" : "text-slate-400 mb-3"} size={32} />
                <span className="text-base font-bold text-slate-800">2. Shopee Clicks</span>
                <span className="text-xs text-slate-500 mt-1.5">
                  {shopeeClicks.length > 0 ? <span className="text-orange-700 font-bold bg-orange-100 px-2 py-0.5 rounded">{shopeeClicks.length} klik termuat</span> : 'WebsiteClickReport.csv'}
                  <br/><span className="text-[11px] text-orange-500 font-semibold mt-2 inline-block">+ Pilih multiple file</span>
                </span>
                <input type="file" multiple accept=".csv" className="hidden" onChange={(e) => handleMultiFileUpload(e, setShopeeClicks, r => r['Klik ID'], false)} />
              </label>
            </div>

            {/* Upload Box 3 */}
            <div className={`relative border-2 border-dashed rounded-[1.5rem] p-6 flex flex-col items-center justify-center transition-all duration-300 ${shopeeCommissions.length > 0 ? 'border-emerald-500 bg-emerald-50/50 shadow-inner' : 'border-slate-300 hover:bg-slate-50 hover:border-emerald-400'}`}>
              {shopeeCommissions.length > 0 && (
                <button onClick={() => setShopeeCommissions([])} className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-full transition-colors focus:outline-none">
                  <X size={18} />
                </button>
              )}
              <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-center">
                <DollarSign className={shopeeCommissions.length > 0 ? "text-emerald-500 mb-3" : "text-slate-400 mb-3"} size={32} />
                <span className="text-base font-bold text-slate-800">3. Shopee Commissions</span>
                <span className="text-xs text-slate-500 mt-1.5">
                  {shopeeCommissions.length > 0 ? <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">{shopeeCommissions.length} pesanan termuat</span> : 'AffiliateCommission.csv'}
                  <br/><span className="text-[11px] text-emerald-500 font-semibold mt-2 inline-block">+ Pilih multiple file</span>
                </span>
                <input type="file" multiple accept=".csv" className="hidden" onChange={(e) => handleMultiFileUpload(e, setShopeeCommissions, r => r['ID Pemesanan'], false)} />
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

        {/* SECTION 3: RINGKASAN TOTAL DENGAN GRADIENT CARDS */}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5 pt-2">
            
            {/* KPI CARD: Meta Clicks */}
            <div className="bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-blue-500/20 text-white hover:-translate-y-1 transition-transform relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-20"><Target size={80} /></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <p className="text-sm font-bold text-white/90">Meta Clicks</p>
                <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm"><Target size={18} /></div>
              </div>
              <h3 className="text-3xl font-black relative z-10">{formatNumber(summaryData.metaResults)}</h3>
            </div>

            {/* KPI CARD: Clicks */}
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-orange-500/20 text-white hover:-translate-y-1 transition-transform relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-20"><MousePointerClick size={80} /></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <p className="text-sm font-bold text-white/90">Shopee Clicks</p>
                <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm"><MousePointerClick size={18} /></div>
              </div>
              <h3 className="text-3xl font-black relative z-10">{formatNumber(summaryData.clicks)}</h3>
            </div>
            
            {/* KPI CARD: Orders */}
            <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-blue-500/20 text-white hover:-translate-y-1 transition-transform relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-20"><ShoppingCart size={80} /></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <p className="text-sm font-bold text-white/90">Total Pesanan</p>
                <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm"><ShoppingCart size={18} /></div>
              </div>
              <h3 className="text-3xl font-black relative z-10">{formatNumber(summaryData.orders)}</h3>
            </div>
            
            {/* KPI CARD: Produk Terjual */}
            <div className="bg-gradient-to-br from-cyan-400 to-teal-500 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-teal-500/20 text-white hover:-translate-y-1 transition-transform relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-20"><Package size={80} /></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <p className="text-sm font-bold text-white/90">Produk Terjual</p>
                <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm"><Package size={18} /></div>
              </div>
              <h3 className="text-3xl font-black relative z-10">{formatNumber(summaryData.produkTerjual)}</h3>
            </div>
            
            {/* KPI CARD: GMV */}
            <div className="bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-rose-500/20 text-white hover:-translate-y-1 transition-transform relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-20"><ShoppingBag size={80} /></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <p className="text-sm font-bold text-white/90">Total GMV</p>
                <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm"><ShoppingBag size={18} /></div>
              </div>
              <h3 className="text-2xl font-black tracking-tight relative z-10">{formatCurrency(summaryData.gmv)}</h3>
            </div>

            {/* KPI CARD: Commission */}
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-emerald-500/20 text-white hover:-translate-y-1 transition-transform relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-20"><DollarSign size={80} /></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <p className="text-sm font-bold text-white/90">Total Komisi</p>
                <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm"><DollarSign size={18} /></div>
              </div>
              <h3 className="text-2xl font-black tracking-tight relative z-10">{formatCurrency(summaryData.commission)}</h3>
            </div>

            {/* KPI CARD: Spend */}
            <div className="bg-gradient-to-br from-violet-400 to-purple-600 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-violet-500/20 text-white hover:-translate-y-1 transition-transform relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-20"><Activity size={80} /></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <p className="text-sm font-bold text-white/90 leading-tight">Ad Spend<br/><span className="text-[10px] font-medium opacity-80">(+PPN {ppnPercentage}%)</span></p>
                <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm"><Activity size={18} /></div>
              </div>
              <h3 className="text-2xl font-black tracking-tight relative z-10">{formatCurrency(summaryData.totalSpentWithPpn)}</h3>
            </div>

            {/* KPI CARD: Profit Dinamis */}
            <div className={`rounded-2xl p-5 flex flex-col justify-between shadow-lg text-white hover:-translate-y-1 transition-transform relative overflow-hidden ${summaryData.commission - summaryData.totalSpentWithPpn >= 0 ? 'bg-gradient-to-br from-slate-800 to-slate-900 shadow-slate-900/20' : 'bg-gradient-to-br from-rose-500 to-red-600 shadow-red-500/20'}`}>
              <div className="absolute -right-4 -top-4 opacity-10"><TrendingUp size={80} /></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <p className="text-sm font-bold text-white/90">Keuntungan Bersih</p>
                <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm"><TrendingUp size={18} /></div>
              </div>
              <h3 className={`text-2xl font-black tracking-tight relative z-10 ${summaryData.commission - summaryData.totalSpentWithPpn >= 0 ? 'text-emerald-400' : 'text-white'}`}>
                {formatCurrency(summaryData.commission - summaryData.totalSpentWithPpn)}
              </h3>
            </div>

          </div>

          {/* CHART RINGKASAN TREND KOMISI VS SPEND */}
          {summaryDateFilter === 'all' && dailySummaryTrend.length > 0 && (
            <div className="mt-6 border-t border-slate-100 pt-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <LineChart size={20} className="text-slate-400" />
                  Tren Harian: Komisi vs Ad Spend
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                  <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-md bg-orange-500 shadow-sm"></span> Komisi Shopee</span>
                  <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-md bg-blue-500 shadow-sm"></span> Ad Spend (+PPN)</span>
                  <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-md bg-rose-400 shadow-sm"></span> Rugi</span>
                </div>
              </div>

              <div className="flex items-end gap-3 h-[22rem] overflow-x-auto pb-6 pt-32 px-10 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                {dailySummaryTrend.map((d, i) => {
                  const profit = d.commission - d.spend;
                  return (
                    <div key={i} className="flex flex-col items-center gap-3 flex-shrink-0 group relative w-16 hover:-translate-y-2 transition-transform hover:z-50 cursor-pointer">
                      <div className="w-full h-40 bg-slate-100/50 rounded-xl flex items-end justify-center gap-1 hover:bg-slate-200/70 transition-colors relative px-1 border-b-2 border-slate-200">
                        <div className="w-1/2 bg-orange-500 rounded-t-md transition-all shadow-sm" style={{ height: `${(d.commission / maxSummaryVal) * 100}%`, minHeight: '6px' }}></div>
                        <div className="w-1/2 bg-blue-500 rounded-t-md transition-all shadow-sm" style={{ height: `${(d.spend / maxSummaryVal) * 100}%`, minHeight: '6px' }}></div>

                        {/* Tooltip Hover Chart */}
                        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col bg-slate-900/95 backdrop-blur-md text-white text-xs py-2 px-3.5 rounded-xl whitespace-nowrap z-[100] shadow-2xl border border-slate-700 pointer-events-none">
                          <span className="font-black text-[11px] mb-2 border-b border-slate-700 pb-1.5 text-center text-slate-300">{formatDate(new Date(d.date))}</span>
                          <div className="flex justify-between gap-5 mb-1.5">
                            <span className="text-orange-400 font-medium">Komisi:</span>
                            <span className="font-bold">{formatCurrency(d.commission)}</span>
                          </div>
                          <div className="flex justify-between gap-5 mb-2 border-b border-slate-700 pb-2">
                            <span className="text-blue-300 font-medium">Spend:</span>
                            <span className="font-bold">{formatCurrency(d.spend)}</span>
                          </div>
                          <div className={`flex justify-between gap-5 font-black text-xs ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            <span>{profit >= 0 ? 'Profit:' : 'Rugi:'}</span>
                            <span>{formatCurrency(Math.abs(profit))}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-500 whitespace-nowrap font-bold">{formatShortDate(d.date)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: TABEL META ADS (DISEMBUNYIKAN) */}
        {processedMetaAds.length > 0 && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowMetaAdsTable(!showMetaAdsTable)}
              className="self-start flex items-center gap-2 px-5 py-3 bg-white border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm hover:shadow-md"
            >
              <BarChart3 size={20} className={showMetaAdsTable ? "text-slate-400" : "text-violet-600"} />
              {showMetaAdsTable ? 'Sembunyikan Daftar Campaign Meta Ads' : `Lihat Daftar Campaign Meta Ads (${processedMetaAds.length} Data)`}
            </button>

            {showMetaAdsTable && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden animate-in slide-in-from-top-4 duration-300">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="bg-violet-100 p-2 rounded-xl text-violet-600"><BarChart3 size={20} /></div>
                    <h2 className="text-lg font-black text-slate-800">Daftar Campaign Meta Ads</h2>
                  </div>
                  {isSyncDate && clickDateRange && <span className="text-[11px] font-bold bg-violet-100 text-violet-800 px-3 py-1.5 rounded-lg border border-violet-200">Difilter sesuai tanggal klik</span>}
                </div>
                <div className="overflow-x-auto max-h-72">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-slate-800 text-slate-200 font-bold sticky top-0 shadow-sm z-20">
                      <tr>
                        <th className="px-6 py-4 border-r border-slate-700">Campaign Name</th>
                        <th className="px-6 py-4 border-r border-slate-700">Total Hari Aktif</th>
                        <th className="px-6 py-4 border-r border-slate-700">Status Terakhir</th>
                        <th className="px-6 py-4">Amount Spent</th>
                        <th className="px-6 py-4">Link Clicks</th>
                        <th className="px-6 py-4">Results</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {aggregatedMetaAdsSummary.map((ad, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-800 border-r border-slate-100">{ad.name}</td>
                          <td className="px-6 py-4 font-medium text-slate-600 border-r border-slate-100">{ad.days} Hari</td>
                          <td className="px-6 py-4 border-r border-slate-100">
                            <span className={`px-3 py-1 rounded-lg text-[11px] font-black tracking-wider uppercase border ${ad.status === 'inactive' ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                              {ad.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-700">{formatCurrency(ad.spent)}</td>
                          <td className="px-6 py-4 font-bold text-slate-700">{formatNumber(ad.clicks)}</td>
                          <td className="px-6 py-4 font-bold text-slate-700">{formatNumber(ad.results)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB NAVIGATION BAWAH - GAYA PILL (SEGMENTED CONTROL) */}
        <div className="flex space-x-1.5 bg-slate-200/70 p-1.5 rounded-full w-fit mt-6 shadow-inner relative z-10 border border-slate-200">
          <button 
            onClick={() => setActiveTab('table')} 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'table' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'}`}
          >
            <LayoutList size={18} /> Tabel Performa Tag
          </button>
          <button 
            onClick={() => setActiveTab('charts')} 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'charts' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'}`}
          >
            <LineChart size={18} /> Analitik & Visual
          </button>
        </div>

        {/* TAB 1: SECTION TABEL DETAIL PERFORMA TAG */}
        {activeTab === 'table' && (
          <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200/80 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-500">
            
            {/* Toolbar Atas Tabel */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white relative z-10">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-orange-400 to-rose-500 p-2 rounded-xl text-white shadow-sm"><TrendingUp size={22} /></div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Kinerja Tag Kombinasi</h2>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">Klik Nama Tag (teks biru) untuk detail data per hari.</p>
                </div>
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 font-bold shadow-sm">
                <GripHorizontal size={16} className="text-slate-400" /> Swipe / Drag Horizontal
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
                    <th className="px-3 py-3 bg-slate-800 text-blue-300 border-b-[3px] border-b-blue-500 sticky top-0 z-20">Amount Spent<br/><span className="text-[10px] font-medium text-slate-400 block mt-0.5">(dari Meta)</span></th>
                    <th className="px-3 py-3 bg-slate-800 text-blue-300 border-b-[3px] border-b-blue-500 sticky top-0 z-20">PPN {ppnPercentage}%<br/><span className="text-[10px] font-medium text-slate-400 block mt-0.5">(Taksiran Meta)</span></th>
                    <th className="px-3 py-3 bg-slate-800 text-blue-300 border-b-[3px] border-b-blue-500 sticky top-0 z-20">Hasil Klik<br/><span className="text-[10px] font-medium text-slate-400 block mt-0.5">(dari Meta)</span></th>
                    <th className="px-3 py-3 bg-slate-800 text-blue-300 border-b-[3px] border-b-blue-500 sticky top-0 z-20">Avg CPC<br/><span className="text-[10px] font-medium text-slate-400 block mt-0.5">(dari Meta)</span></th>
                    <th className="px-3 py-3 bg-slate-800 text-blue-300 border-b-[3px] border-b-blue-500 border-r border-r-slate-700 sticky top-0 z-20">Avg CTR<br/><span className="text-[10px] font-medium text-slate-400 block mt-0.5">(dari Meta)</span></th>
                    
                    {/* KOLOM SHOPEE */}
                    <th className="px-3 py-3 bg-slate-800 text-orange-300 border-b-[3px] border-b-orange-500 sticky top-0 z-20">Shopee Clicks<br/><span className="text-[10px] font-medium text-slate-400 block mt-0.5">(dari Shopee)</span></th>
                    <th className="px-3 py-3 bg-slate-800 text-orange-300 border-b-[3px] border-b-orange-500 sticky top-0 z-20">Pesanan<br/><span className="text-[10px] font-medium text-slate-400 block mt-0.5">(Unik Resi)</span></th>
                    <th className="px-3 py-3 bg-slate-800 text-orange-300 border-b-[3px] border-b-orange-500 sticky top-0 z-20">GMV<br/><span className="text-[10px] font-medium text-slate-400 block mt-0.5">(Nilai Pembelian)</span></th>
                    <th className="px-3 py-3 bg-slate-800 text-orange-300 border-b-[3px] border-b-orange-500 border-r border-r-slate-700 sticky top-0 z-20">Total Komisi<br/><span className="text-[10px] font-medium text-slate-400 block mt-0.5">(dari Shopee)</span></th>
                    
                    {/* KOLOM RATE KONVERSI */}
                    <th className="px-3 py-3 bg-slate-800 text-teal-300 border-b-[3px] border-b-teal-500 sticky top-0 z-20">Rate Link-&gt;Shopee<br/><span className="text-[10px] font-medium text-slate-400 block mt-0.5">(Meta ke Shopee)</span></th>
                    <th className="px-3 py-3 bg-slate-800 text-teal-300 border-b-[3px] border-b-teal-500 border-r border-r-slate-700 sticky top-0 z-20">Rate Shopee-&gt;Order<br/><span className="text-[10px] font-medium text-slate-400 block mt-0.5">(Shopee ke Checkout)</span></th>

                    {/* KOLOM ROI & KEUNTUNGAN */}
                    <th className="px-3 py-3 bg-slate-800 text-emerald-300 border-b-[3px] border-b-emerald-500 sticky top-0 z-20">Keuntungan<br/><span className="text-[10px] font-medium text-slate-400 block mt-0.5">(Komisi-Spent-PPN)</span></th>
                    <th className="px-3 py-3 bg-slate-800 text-emerald-300 border-b-[3px] border-b-emerald-500 border-r border-r-slate-700 sticky top-0 z-20">ROI<br/><span className="text-[10px] font-medium text-slate-400 block mt-0.5">(Return on Spend)</span></th>

                    {/* KOLOM LAINNYA */}
                    <th className="px-3 py-3 bg-slate-800 text-slate-300 border-b-[3px] border-b-slate-600 sticky top-0 z-20">Statistik Komisi<br/><span className="text-[10px] font-medium text-slate-400 block mt-0.5">(Avg, Max, Min)</span></th>
                    <th className="px-3 py-3 bg-slate-800 text-slate-300 border-b-[3px] border-b-slate-600 sticky top-0 z-20">Jeda Waktu Order<br/><span className="text-[10px] font-medium text-slate-400 block mt-0.5">(Dari saat diklik)</span></th>
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

                      let rateL2S_Str = item.rateLinkShopee === Infinity ? '∞' : `${item.rateLinkShopee.toFixed(2)}%`;

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
                                {item.tag || '<Tanpa Tag>'} <ExternalLink size={12} className="opacity-60" />
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
                                  <span className="truncate" title={c}>{c}</span>
                                  <button onClick={() => unlinkCampaign(item.tag, c)} className="hover:text-rose-400 focus:outline-none rounded-full p-px opacity-80 hover:opacity-100 transition-colors bg-white/20">
                                    <X size={10} />
                                  </button>
                                </span>
                              ))}
                            </div>

                            <div className="relative" onMouseDown={(e) => e.stopPropagation()}>
                              <select 
                                className="w-full max-w-[200px] text-[10px] border border-violet-200 rounded-xl py-1.5 px-3 bg-violet-50/50 text-violet-800 font-bold focus:ring-2 focus:ring-violet-400 outline-none shadow-sm hover:bg-violet-100 transition-colors cursor-pointer"
                                onChange={(e) => {
                                  linkCampaign(item.tag, e.target.value);
                                  e.target.value = ""; 
                                }}
                                defaultValue=""
                              >
                                <option value="" disabled>+ Kaitkan Campaign Meta...</option>
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
                            <div className="font-bold text-[11px] text-blue-600">{formatCurrency(item.ppn)}</div>
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
                            <div className="font-black text-[13px] text-teal-700">{rateL2S_Str}</div>
                          </td>
                          <td className={getTdClass(item.rateShopeeOrder, 'rateShopeeOrder', 'bg-teal-50/10 border-r border-slate-100')}>
                            <div className="font-black text-[13px] text-teal-700">{item.rateShopeeOrder.toFixed(2)}%</div>
                          </td>
                          
                          <td className={getTdClass(item.keuntungan, 'keuntungan', 'bg-emerald-50/10')}>
                            <div className={`font-black text-[13px] tracking-tight ${item.keuntungan >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {item.keuntungan < 0 && '- '}{formatCurrency(Math.abs(item.keuntungan))}
                            </div>
                          </td>
                          <td className={getTdClass(item.roi, 'roi', 'bg-emerald-50/10 border-r border-slate-100')}>
                            <div className={`font-black inline-block px-2.5 py-1 rounded-lg text-[11px] shadow-sm border ${item.keuntungan >= 0 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'}`}>
                              {roiStr}
                            </div>
                          </td>
                          
                          <td className="px-3 py-3 align-middle text-[11px] space-y-1 font-medium text-slate-600 whitespace-nowrap bg-white/50">
                            {item.shopeeOrders > 0 ? (
                              <>
                                <div><span className="text-slate-400 inline-block w-8">Avg:</span> <span className="font-bold text-slate-700">{formatCurrency(item.avgComm)}</span></div>
                                <div><span className="text-slate-400 inline-block w-8">Max:</span> <span className="font-bold text-emerald-600">{formatCurrency(item.maxComm)}</span></div>
                                <div><span className="text-slate-400 inline-block w-8">Min:</span> <span className="font-bold text-rose-500">{formatCurrency(item.minComm)}</span></div>
                              </>
                            ) : '-'}
                          </td>
                          <td className="px-3 py-3 align-middle text-[11px] space-y-1 font-medium text-slate-600 whitespace-nowrap bg-white/50">
                            {item.shopeeOrders > 0 ? (
                              <>
                                <div><span className="text-slate-400 inline-block w-10">Cepat:</span> <span className="font-bold text-slate-700">{formatDuration(item.minDiff)}</span></div>
                                <div><span className="text-slate-400 inline-block w-10">Lama:</span> <span className="font-bold text-slate-700">{formatDuration(item.maxDiff)}</span></div>
                              </>
                            ) : '-'}
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: SECTION ANALITIK CHARTS */}
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

          </div>
        )}

      </div>
    </div>
  );
}