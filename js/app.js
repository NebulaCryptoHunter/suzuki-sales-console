/* ============================================================
   Suzuki Sales Console v2.1 — Internal Dealer Application
   Engineered by Heru Prasetyo, SIT Semarang
   ============================================================ */

// ========== CONFIG ==========
const DATA_BASE = 'data/';
const VERSION = '20260809';
const DATA_FILES = {
  pricelist: 'pricelist.json',
  leasingConfig: 'leasing-config.json',
  adira: 'adira.json',
  muf: 'muf.json',
  sufiDP20: 'sufi-dp20.json',
  sufiDP25: 'sufi-dp25.json',
  sufiDP30: 'sufi-dp30.json',
  sufiSubsidi: 'sufi-subsidi.json'
};
const ALL_LEASINGS = ['ADIRA','MUF','SUFI DP20','SUFI DP25','SUFI DP30','BCA','BNI','BRI','MANDIRI'];
const CATEGORIES_MAP = {
  "Commercial": ["New Carry PU","APV","New Carry Chassis","New Carry Karoseri (DSP)","New Carry Karoseri (Antika Raya)"],
  "Passenger": ["Fronx","Fronx Hybrid","XL-7 MC","XL-7 MC Hybrid","XL-7 MC Hybrid Kuro","XL-7","XL-7 Hybrid","All New Ertiga","All New Ertiga Hybrid","S-Presso","Jimny 3 Door","Jimny 5 Door","Grand Vitara MC","e Vitara"],
  "LTD": ["New Carry PU LTD","All New Ertiga LTD","XL-7 MC LTD","S-Presso Luxury"]
};
const PAGE_HEADERS = {
  dashboard: { icon:'🏠', title:'Suzuki Sales Console', subtitle:'Internal Dealer Application - SIT Semarang' },
  pricelist: { icon:'📋', title:'Pricelist', subtitle:'Harga OTR Agustus 2026' },
  kredit:   { icon:'💳', title:'Simulasi Kredit', subtitle:'Perbandingan & Kalkulator' },
  stock:    { icon:'📦', title:'Stock Unit', subtitle:'Cek Ketersediaan Unit' },
  setting:  { icon:'⚙️', title:'Setting', subtitle:'Versi 2.1' }
};

// ========== UTILITY ==========
const $ = id => document.getElementById(id);

async function loadJSON(filename) {
  const res = await fetch(`${DATA_BASE}${filename}?v=${VERSION}`);
  if (!res.ok) throw new Error(`Gagal memuat ${filename}`);
  return res.json();
}

// ========== APP ==========
const APP = {
  state: {
    page: 'dashboard',
    history: [],
    selectedPrice: null,
    selectedNIK: 'nik26',
    kreditSortMode: 'investasi',
    stockUnits: [],
    stockDate: null,
    activeFileName: '',
    recentViews: [],
    favorites: [],
    kreditHistory: [],
    last: {
      category: '', model: '', type: '', leasing: '', tenor: '',
      nik: 'nik26', filterModel: '', filterType: '', filterNik: '', filterColor: '', search: ''
    },
    stockIndex: null,
    importTime: 0,
    kreditTab: 'manual'
  },
  data: {
    pricelist: { regular: [], ltd: [] },
    leasingConfig: {},
    leasing: {},
    sufiSubsidi: {}
  },
  db: {
    priceIndex: {},
    leasingIndex: {},
    modelPatterns: []
  },
  dom: {},

  async init() {
    try {
      await this.loadAllData();
      this.buildModelPatterns();
      this.buildPriceIndex();
      this.buildLeasingIndex();
      this.cacheDOM();
      this.loadState();
      this.renderPage('dashboard');
      this.updateFooter();
    } catch (err) {
      document.body.innerHTML = `<div style="padding:2rem;text-align:center;color:#DC2626;">
        <h2>❌ Gagal Memuat Data</h2>
        <p>${err.message}</p>
        <p>Pastikan file JSON tersedia di folder /data/</p>
      </div>`;
    }
  },

  async loadAllData() {
    const [pricelist, leasingConfig, adira, muf, sufi20, sufi25, sufi30, sufiSubsidi] = await Promise.all([
      loadJSON(DATA_FILES.pricelist),
      loadJSON(DATA_FILES.leasingConfig),
      loadJSON(DATA_FILES.adira),
      loadJSON(DATA_FILES.muf),
      loadJSON(DATA_FILES.sufiDP20),
      loadJSON(DATA_FILES.sufiDP25),
      loadJSON(DATA_FILES.sufiDP30),
      loadJSON(DATA_FILES.sufiSubsidi)
    ]);
    this.data.pricelist = pricelist;
    this.data.leasingConfig = leasingConfig;
    this.data.leasing = {
      ADIRA: adira,
      MUF: muf,
      'SUFI DP20': sufi20,
      'SUFI DP25': sufi25,
      'SUFI DP30': sufi30
    };
    this.data.sufiSubsidi = sufiSubsidi;
  },

  // ---------- BUILD INDEXES ----------
  buildModelPatterns() {
    this.db.modelPatterns = [
      // New Carry PU & variants
      { regex: /CARRY\s*(PU\s*)?(PICK\s*UP\s*)?/i, model: 'New Carry PU', extract: s => s.replace(/.*CARRY\s*(PU\s*)?(PICK\s*UP\s*)?/i, '').trim() },
      { regex: /CARRY.*LTD/i, model: 'New Carry PU LTD', extract: s => s.replace(/.*CARRY.*LTD\s*/i, '').trim() },
      { regex: /CARRY.*KAROSERI.*DSP/i, model: 'New Carry Karoseri (DSP)', extract: s => s.replace(/.*CARRY.*KAROSERI.*DSP\s*/i, '').trim() },
      { regex: /CARRY.*KAROSERI.*ANTIKA/i, model: 'New Carry Karoseri (Antika Raya)', extract: s => s.replace(/.*CARRY.*KAROSERI.*ANTIKA\s*/i, '').trim() },
      { regex: /CARRY/i, model: 'New Carry PU', extract: s => s.replace(/.*CARRY\s*/i, '').replace(/PUFD/,'FD').replace(/PUWD/,'WD').trim() },
      // APV
      { regex: /APV/i, model: 'APV', extract: s => s.replace(/.*APV\s*/i, '').trim() },
      // Ertiga
      { regex: /ALL NEW ERTIGA.*LTD/i, model: 'All New Ertiga LTD', extract: s => s.replace(/.*ALL NEW ERTIGA.*LTD\s*/i, '').trim() },
      { regex: /ALL NEW ERTIGA HYBRID/i, model: 'All New Ertiga Hybrid', extract: s => s.replace(/.*ALL NEW ERTIGA HYBRID\s*/i, '').trim() },
      { regex: /ALL NEW ERTIGA/i, model: 'All New Ertiga', extract: s => { let t = s.replace(/.*ALL NEW ERTIGA\s*/i, '').trim(); return t === 'GA MT' ? 'GA PW' : t; } },
      // XL7
      { regex: /XL-?7.*MC.*LTD/i, model: 'XL-7 MC LTD', extract: s => s.replace(/.*XL-?7\s*MC.*LTD\s*/i, '').trim() },
      { regex: /XL-?7.*KURO/i, model: 'XL-7 MC Hybrid Kuro', extract: s => s.replace(/.*XL-?7\s*(MC\s*)?(HYBRID\s*)?(KURO\s*)?(EDITION\s*)?/i, '').trim() },
      { regex: /(NEW\s*)?XL-?7.*HYBRID/i, model: 'XL-7 MC Hybrid', extract: s => s.replace(/.*(NEW\s*)?XL-?7\s*(MC\s*)?(HYBRID\s*)?/i, '').trim() },
      { regex: /(NEW\s*)?XL-?7\s*(MC|ZETA|BETA|ALPHA)/i, model: 'XL-7 MC', extract: s => s.replace(/.*(NEW\s*)?XL-?7\s*(MC\s*)?/i, '').trim() },
      { regex: /XL-?7\s*NEW\s*(BETA|ALPHA).*HYBRID/i, model: 'XL-7 Hybrid', extract: s => s.replace(/.*XL-?7\s*(HYBRID\s*)?/i, '').trim() },
      { regex: /XL-?7\s*NEW/i, model: 'XL-7', extract: s => s.replace(/.*XL-?7\s*/i, '').trim() },
      // Fronx
      { regex: /FRONX\s*HYBRID/i, model: 'Fronx Hybrid', extract: s => s.replace(/.*FRONX\s*HYBRID\s*/i, '').trim() },
      { regex: /FRONX/i, model: 'Fronx', extract: s => s.replace(/.*FRONX\s*/i, '').trim() },
      // Grand Vitara
      { regex: /GRAND\s*VITARA/i, model: 'Grand Vitara MC', extract: s => s.replace(/.*GRAND\s*VITARA\s*(MC\s*)?/i, '').replace(/\bGX\b/gi, 'GLX').trim() },
      // Jimny
      { regex: /JIMNY\s*5\s*DOOR/i, model: 'Jimny 5 Door', extract: s => s.replace(/.*JIMNY\s*5\s*DOOR\s*/i, '').trim() },
      { regex: /JIMNY/i, model: 'Jimny 3 Door', extract: s => s.replace(/.*JIMNY(\s*3\s*DOOR)?\s*/i, '').trim() },
      // S-Presso
      { regex: /S[-\s]?PRESSO.*LUXURY/i, model: 'S-Presso Luxury', extract: s => s.replace(/.*S-?\s*PRESSO.*LUXURY\s*/i, '').trim() },
      { regex: /S[-\s]?PRESSO/i, model: 'S-Presso', extract: s => s.replace(/.*S-?\s*PRESSO\s*/i, '').trim() },
      // e Vitara
      { regex: /E\s*VITARA/i, model: 'e Vitara', extract: s => s.replace(/.*E\s*VITARA\s*/i, '').trim() },
    ];
  },

  buildPriceIndex() {
    const all = [...this.data.pricelist.regular, ...this.data.pricelist.ltd];
    all.forEach(m => m.type.forEach(t => {
      this.db.priceIndex[m.model + '|' + t.name] = {
        model: m.model, type: t.name, otr: t.otr, nik25: t.nik25, nik26: t.nik26
      };
    }));
  },

  buildLeasingIndex() {
    for (const [ln, ld] of Object.entries(this.data.leasing)) {
      ld.forEach(item => item.paket.forEach(p => {
        let tdp = p.tdp;
        const cfg = this.data.leasingConfig[ln];
        if (cfg?.subsidiDP) {
          const sub = this.data.sufiSubsidi[item.model + '|' + item.type] || 0;
          tdp -= sub;
        }
        this.db.leasingIndex[ln + '|' + item.model + '|' + item.type + '|' + p.tenor] = {
          ...p, tdp, tdp_original: p.tdp, subsidiDP: p.tdp - tdp, otr: item.otr, leasing: ln
        };
      }));
    }
  },

  loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem('suzuki_hub_state'));
      if (saved) {
        const { stockUnits, stockDate, stockIndex, importTime, ...rest } = saved;
        Object.assign(this.state, rest);
        this.state.stockUnits = []; this.state.stockDate = null; this.state.stockIndex = null; this.state.importTime = 0;
      }
    } catch (e) {}
  },

  saveState() {
    const toSave = { ...this.state };
    delete toSave.stockUnits; delete toSave.stockIndex; delete toSave.history;
    try { localStorage.setItem('suzuki_hub_state', JSON.stringify(toSave)); } catch (e) {}
  },

  cacheDOM() {
    this.dom = {
      headerIcon: $('header-icon'), headerTitle: $('header-title'), headerSubtitle: $('header-subtitle'),
      headerBack: $('header-back'), container: $('main-container'),
      footerInfo: $('footer-info'), footerStock: $('footer-stock-info'),
      toastContainer: $('toast-container'), modalBackdrop: $('modal-backdrop'), modalBody: $('modal-body')
    };
  },

  navigateTo(page, opts = {}) {
    if (page === this.state.page) return;
    if (this.state.page !== 'dashboard' && (!this.state.history.length || this.state.history[this.state.history.length-1] !== this.state.page))
      this.state.history.push(this.state.page);
    this.state.page = page;
    if (page === 'kredit') this.state.kreditTab = opts.tab || 'manual';
    this.renderPage(page);
    this.saveState();
  },

  goBack() {
    this.state.page = this.state.history.length ? this.state.history.pop() : 'dashboard';
    this.renderPage(this.state.page);
    this.saveState();
  },

  renderPage(page) {
    const tpl = document.getElementById(`tpl-${page}`);
    if (!tpl) return;
    this.dom.container.innerHTML = '';
    this.dom.container.appendChild(tpl.content.cloneNode(true));
    const hd = PAGE_HEADERS[page];
    this.dom.headerIcon.textContent = hd.icon;
    this.dom.headerTitle.textContent = hd.title;
    this.dom.headerSubtitle.textContent = hd.subtitle;
    this.dom.headerBack.style.display = page !== 'dashboard' ? 'block' : 'none';
    if (page === 'pricelist') this.initPricelist();
    if (page === 'kredit') this.initKredit();
    if (page === 'stock') this.initStockPage();
    if (page === 'setting') this.initSetting();
    if (page === 'dashboard') this.initDashboard();
  },

  // ---------- HELPERS ----------
  fRupiah(n) { return n == null || isNaN(n) ? 'Rp0' : 'Rp' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); },
  parseRupiahInput(s) { return parseInt(String(s||'').replace(/\D/g,'')) || 0; },
  formatRupiahInput(s) { return this.parseRupiahInput(s).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); },
  toast(msg, err) {
    const c = this.dom.toastContainer; if (c.children.length >= 3) c.removeChild(c.firstChild);
    const t = document.createElement('div'); t.className = 'toast';
    t.style.borderLeftColor = err ? '#DC2626' : '#16A34A'; t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
  },
  copyText(t) { navigator.clipboard?.writeText(t).then(() => this.toast('Disalin!')) ?? this.toast('Gagal', true); },
  showModal(h) { this.dom.modalBody.innerHTML = h; this.dom.modalBackdrop.classList.add('active'); },
  closeModal() { this.dom.modalBackdrop.classList.remove('active'); },
  matchType(a, b) { return this.normalizeType(a) === this.normalizeType(b); },
  normalizeType(t) {
    return (t||'').toUpperCase().replace(/20\d{2}/g,'').replace(/HYBRID/gi,'').replace(/NEW/gi,'')
      .replace(/EDITION/gi,'').replace(/KURO/gi,'').replace(/2\s*TONE/gi,'TWO TONE').replace(/TT/gi,'TWO TONE')
      .replace(/DOORS/gi,'DOOR').replace(/\bGX\b/gi,'GLX').replace(/LTD/gi,'LTD').replace(/LUXURY/gi,'LUXURY')
      .replace(/\s+/g,' ').trim();
  },
  getColorName(r) {
    const u = String(r||'').toUpperCase().replace(/^(PRL\.?|PEARL|MET\.?|M\.?)\s*/i,'').replace(/^[A-Z0-9]+\s*-\s*/,'').trim();
    const map = { ZAM:'Midnight Black', ZJ3:'Blueish Black Pearl', ZQD:'Cave Black', C9J:'Arctic White', '26U':'White', WBY:'Savanna Ivory', EYP:'Savanna Ivory', DG5:'Kinetic Yellow', Z2S:'Silky Silver', D17:'Bold Red', D20:'Orange Metallic', Z6Z:'Forest Green', Z7X:'Metallic Silver', D06:'Black', D04:'Silver', '1G3':'Ash Gray', Z5F:'Mustard Yellow', D09:'Bronze', D11:'Deep Blue', Z8U:'Ocean Blue', D15:'Sapphire Blue', D14:'Olive Green', Z9Z:'Dark Brown', Z7T:'Cool White', Z9W:'Super White', Z8X:'Black Mica', D19:'Maroon', '3S7':'Red Pearl' };
    for (const [k,v] of Object.entries(map)) if (u.includes(k)) return v;
    const kw = { HITAM:'Black', BLACK:'Black', PUTIH:'White', WHITE:'White', SILVER:'Silver', ABU:'Gray', GRAY:'Gray', GREY:'Gray', MERAH:'Red', RED:'Red', BIRU:'Blue', BLUE:'Blue', KUNING:'Yellow', YELLOW:'Yellow', HIJAU:'Green', GREEN:'Green', ORANGE:'Orange', JINGGA:'Orange', COKLAT:'Brown', BROWN:'Brown', IVORY:'Ivory', CREAM:'Cream', EMAS:'Gold', GOLD:'Gold' };
    for (const [k,v] of Object.entries(kw)) if (u.includes(k)) return v;
    return u || 'Lainnya';
  },
  getColorClass(r) {
    const u = String(r||'').toLowerCase();
    if (u.includes('hitam')||u.includes('black')) return 'black';
    if (u.includes('putih')||u.includes('white')||u.includes('ivory')) return 'ivory';
    if (u.includes('silver')||u.includes('abu')||u.includes('gray')) return 'silver';
    if (u.includes('merah')||u.includes('red')) return 'red';
    if (u.includes('biru')||u.includes('blue')) return 'blue';
    return 'silver';
  },
  parseModelType(raw) {
    let s = raw.toUpperCase().replace(/[.,\/\\_\-()\[\]{}]/g,' ').replace(/\s+/g,' ').trim();
    s = s.replace(/\b20(2[3-9]|3[0-9])\b/g,'').replace(/\bNIK\s*2[56]\b/gi,'').replace(/\bMY\s*2[56]\b/gi,'');
    s = s.replace(/\s+/g,' ').replace(/\b2TONE\b/g,'TWO TONE').replace(/\b2 TONE\b/g,'TWO TONE').replace(/\b5 DOORS\b/g,'5 DOOR').replace(/\b3 DOORS\b/g,'3 DOOR');
    for (const p of this.db.modelPatterns) {
      if (p.regex.test(s)) {
        let type = p.extract(s).replace(/\s+/g,' ').trim();
        const tu = type.toUpperCase();
        if (tu === 'GA MT' && p.model === 'All New Ertiga') type = 'GA PW';
        else if (tu.includes('GLX AT TWO TONE WHITE')) type = 'GLX AT (Two Tone White & Black)';
        else if (tu.includes('GLX AT TWO TONE')) type = 'GLX AT (Two Tone)';
        else if (tu.includes('GLX AT')) type = 'GLX AT';
        return { model: p.model, type: type || '' };
      }
    }
    return null;
  },
  updateFooter() {
    this.dom.footerInfo.textContent = 'v2.1 • Pricelist: Agustus 2026';
    this.dom.footerStock.textContent = `Stock: ${this.state.stockDate||'belum diunggah'} | ${this.state.stockUnits.length||0} unit`;
  },
  addRecentView(u) { this.state.recentViews = this.state.recentViews.filter(x=>x.idx!==u.idx); this.state.recentViews.unshift(u); if(this.state.recentViews.length>10) this.state.recentViews.pop(); this.saveState(); },
  toggleFavorite(u) { const i=this.state.favorites.findIndex(x=>x.idx===u.idx); i>=0 ? this.state.favorites.splice(i,1) : this.state.favorites.push(u); this.saveState(); },
  isFavorite(idx) { return this.state.favorites.some(x=>x.idx===idx); },
  addKreditHistory(s) { this.state.kreditHistory.unshift(s); if(this.state.kreditHistory.length>20) this.state.kreditHistory.pop(); this.saveState(); },
  hitungAngsuranBaru(leasing, pokok, pokokBaru, angsuranAsli) {
    const rumus = (this.data.leasingConfig[leasing]?.rumus) || 'proporsional';
    if (rumus === 'faktor_leasing') return Math.round(pokokBaru * (angsuranAsli / pokok));
    if (rumus === 'persentase_pokok') return Math.round(angsuranAsli * (pokokBaru / pokok));
    return Math.round(pokokBaru * (angsuranAsli / pokok));
  },

  // ---------- DASHBOARD (tidak berubah) ----------
  initDashboard() {
    const all = this.state.stockUnits;
    const el = $('dashboard-stock-sub'); if (el) el.textContent = all.length ? `${all.length} Unit Ready` : 'Upload Excel • Cek Unit';
    if (all.length) {
      const n25 = all.filter(u=>u.nikGroup==='25').length, n26 = all.filter(u=>u.nikGroup==='26').length;
      const mc = {}; all.forEach(u=>mc[u.model]=(mc[u.model]||0)+1);
      const top = Object.entries(mc).sort((a,b)=>b[1]-a[1])[0] || ['-',0];
      const stats = $('dashboard-stats');
      if (stats) stats.innerHTML = `<div class="stat-grid">
        <div class="stat-card"><div>📦</div><div class="stat-number">${all.length}</div></div>
        <div class="stat-card"><div>🔵</div><div class="stat-number">${n25}</div></div>
        <div class="stat-card"><div>🟣</div><div class="stat-number">${n26}</div></div>
        <div class="stat-card"><div>⭐</div><div class="stat-number">${this.state.favorites.length}</div></div>
      </div>
      <div class="card" style="margin-top:0.5rem;padding:0.6rem;">
        <small>🏆 Model Terbanyak: <strong>${top[0]}</strong> (${top[1]} unit)</small><br>
        <small>📅 Upload: ${this.state.stockDate||'-'} • ⏱️ Waktu Import: ${this.state.importTime||0}s</small>
      </div>`;
    }
    if (this.state.kreditHistory.length) {
      const h = this.state.kreditHistory[0];
      const sim = $('dashboard-sim-terakhir');
      if (sim) sim.innerHTML = `<div class="card"><strong>🧮 Simulasi Terakhir</strong><br>${h.model} ${h.type} | ${h.leasing} | ${h.tenor} Bulan<br>DP: ${this.fRupiah(h.dpBayar)} | Angsuran: ${this.fRupiah(h.angsuran)}</div>`;
    }
    if (this.state.favorites.length) {
      const fav = $('dashboard-fav');
      if (fav) fav.innerHTML = '<div class="card"><strong>⭐ Unit Favorit</strong><br>' + this.state.favorites.slice(0,3).map(u=>`${u.model} ${u.type}`).join('<br>') + '</div>';
    }
  },

  // ---------- PRICELIST (tidak berubah) ----------
  updateNIKDropdown(cid, model, type) {
    const dd = document.getElementById(cid);
    if (!dd) return;
    dd.innerHTML = '<option value="">-- Pilih NIK --</option>';
    dd.disabled = true;
    if (!model || !type) return;
    const pd = this.db.priceIndex[model + '|' + type];
    if (!pd) return;
    const h25 = pd.nik25 && (pd.nik25.total_discount > 0 || pd.nik25.discount > 0);
    const h26 = pd.nik26 && (pd.nik26.total_discount > 0 || pd.nik26.discount > 0);
    if (h25) dd.innerHTML += '<option value="nik25">NIK 25</option>';
    if (h26) dd.innerHTML += '<option value="nik26">NIK 26</option>';
    if (!h25 && !h26) dd.innerHTML += '<option value="nik26">NIK 26 (Tanpa Diskon)</option>';
    dd.disabled = false;
    dd.value = h26 ? 'nik26' : (h25 ? 'nik25' : 'nik26');
  },
  initPricelist() {
    const c = $('cat-select'); if (!c) return;
    c.innerHTML = '<option value="">-- Pilih Kategori --</option>';
    for (const k in CATEGORIES_MAP) c.innerHTML += `<option value="${k}">${k}</option>`;
    if (this.state.last.category) c.value = this.state.last.category;
    const m = $('model-select'); if (m) { m.innerHTML = '<option value="">-- Pilih Model --</option>'; m.disabled = true; }
    const t = $('type-select'); if (t) { t.innerHTML = '<option value="">-- Pilih Type --</option>'; t.disabled = true; }
    const ns = $('nik-selector'); if (ns) ns.classList.add('hidden');
    const nd = $('nik-dropdown'); if (nd) { nd.innerHTML = ''; nd.disabled = true; }
    const pd = $('price-display'); if (pd) pd.classList.add('hidden');
    if (this.state.last.category) this.loadModels();
  },
  loadModels() {
    const pd = $('price-display'); if (pd) pd.classList.add('hidden');
    const cat = $('cat-select')?.value;
    const s = $('model-select'); if (!s) return;
    s.innerHTML = '<option value="">-- Pilih Model --</option>';
    this.state.last.category = cat;
    if (!cat) { s.disabled = true; this.saveState(); return; }
    s.disabled = false;
    (CATEGORIES_MAP[cat] || []).forEach(m => s.innerHTML += `<option value="${m}">${m}</option>`);
    const t = $('type-select'); if (t) { t.disabled = true; t.innerHTML = '<option value="">-- Pilih Type --</option>'; }
    const ns = $('nik-selector'); if (ns) ns.classList.add('hidden');
    if (this.state.last.model && CATEGORIES_MAP[cat]?.includes(this.state.last.model)) {
      s.value = this.state.last.model;
      this.loadTypes();
    }
    this.saveState();
  },
  loadTypes() {
    const pd = $('price-display'); if (pd) pd.classList.add('hidden');
    const model = $('model-select')?.value;
    const s = $('type-select'); if (!s) return;
    s.innerHTML = '<option value="">-- Pilih Type --</option>';
    this.state.last.model = model;
    if (!model) { s.disabled = true; this.saveState(); return; }
    s.disabled = false;
    const types = Object.keys(this.db.priceIndex).filter(k => k.startsWith(model + '|')).map(k => k.split('|')[1]);
    types.forEach(t => s.innerHTML += `<option value="${t}">${t}</option>`);
    if (this.state.last.type && types.includes(this.state.last.type)) {
      s.value = this.state.last.type;
      this.showPriceAndStock();
    }
    this.saveState();
  },
  showPriceAndStock() {
    const model = $('model-select')?.value, type = $('type-select')?.value;
    if (!model || !type) return;
    this.state.last.type = type;
    this.updateNIKDropdown('nik-dropdown', model, type);
    const ns = $('nik-selector'), nd = $('nik-dropdown');
    if (ns && nd) ns.classList.toggle('hidden', nd.disabled);
    if (nd && !nd.disabled) this.state.selectedNIK = nd.value;
    this.updatePriceDisplay();
    this.showStockSummary();
    this.saveState();
  },
  updatePriceDisplay() {
    const model = $('model-select')?.value, type = $('type-select')?.value;
    const nd = $('nik-dropdown');
    if (nd && !nd.disabled) this.state.selectedNIK = nd.value;
    const key = model + '|' + type, pd = this.db.priceIndex[key];
    if (!pd) return;
    const d = pd[this.state.selectedNIK];
    const disp = $('price-display'); if (disp) disp.classList.remove('hidden');
    if (!d) {
      const c = $('price-content'); if (c) c.innerHTML = `<div class="grid-2"><span>OTR</span><span style="text-align:right;">${this.fRupiah(pd.otr)}</span></div><div class="price-nett"><small>Harga Nett</small>${this.fRupiah(pd.otr)}</div>`;
      this.state.selectedPrice = { model, type, otr: pd.otr, nett: pd.otr, total_discount: 0 };
    } else {
      this.state.selectedPrice = { model, type, otr: pd.otr, total_discount: d.total_discount, nett: d.nett };
      const c = $('price-content'); if (c) c.innerHTML = `<div class="grid-2"><span>OTR</span><span style="text-align:right;">${this.fRupiah(pd.otr)}</span></div><div class="grid-2" style="color:#DC2626;"><span>Discount</span><span style="text-align:right;">-${this.fRupiah(d.discount)}</span></div><div class="grid-2" style="color:#059669;"><span>Cashback</span><span style="text-align:right;">-${this.fRupiah(d.cashback)}</span></div><div class="grid-2" style="font-weight:600;"><span>Total Discount</span><span style="text-align:right;">${this.fRupiah(d.total_discount)} <span class="badge badge-discount">${((d.total_discount/pd.otr)*100).toFixed(1)}%</span></span></div><div class="price-nett"><small>Harga Nett</small>${this.fRupiah(d.nett)}</div>`;
    }
  },
  showStockSummary() { /* ... sama seperti sebelumnya ... */ },
  goToKreditFromPricelist() { /* ... */ },

  // ---------- KREDIT (tidak berubah) ----------
  initKredit() { /* ... */ },
  switchKreditTab(tab) { /* ... */ },
  initPaketTab() { /* ... */ },
  loadKreditModelsPaket() { /* ... */ },
  loadKreditTypesPaket() { /* ... */ },
  onKreditTypeChangePaket() { /* ... */ },
  setSortMode(mode) { /* ... */ },
  showAllLeasingResult() { /* ... */ },
  initManualTab() { /* ... */ },
  onManualLeasingChange() { /* ... */ },
  loadManualModels() { /* ... */ },
  loadManualTypes() { /* ... */ },
  onManualTypeChange() { /* ... */ },
  hitungManualPerLeasing() { /* ... */ },

  // ---------- STOCK (PERBAIKAN TOTAL) ----------
  initStockPage() {
    this.setupDragDrop();
    if (this.state.stockUnits.length) {
      $('stock-summary')?.classList.remove('hidden');
      this.populateFilters();
      if (this.state.last.filterModel) { const el = $('stock-model'); if (el) el.value = this.state.last.filterModel; }
      if (this.state.last.filterType) { this.onStockModelChange(); const el = $('stock-type'); if (el) el.value = this.state.last.filterType; }
      if (this.state.last.filterNik) { const el = $('stock-nik'); if (el) el.value = this.state.last.filterNik; }
      if (this.state.last.filterColor) { const el = $('stock-color'); if (el) el.value = this.state.last.filterColor; }
      if (this.state.last.search) { const el = $('stock-search'); if (el) el.value = this.state.last.search; }
      this.applyFilters();
      $('stock-filters')?.classList.remove('hidden');
    }
  },

  handleStockUpload(input) {
    const file = input.files[0];
    if (!file) return;
    this.state.activeFileName = file.name;
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      const s = $('upload-status'); if (s) s.innerHTML = '❌ Format tidak didukung. Gunakan .xlsx atau .xls';
      return;
    }
    const pc = $('upload-progress-container'); if (pc) pc.classList.remove('hidden');
    this.setProgressStep(0, 'Membaca File');
    const reader = new FileReader();
    const startTime = performance.now();
    reader.onload = e => {
      try {
        this.setProgressStep(1, 'Parsing Data');
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        if (!wb.SheetNames.length) throw new Error('File Excel kosong.');

        // Cari sheet berdasarkan nama prioritas
        let targetSheet = null;
        const sheetNamesUpper = wb.SheetNames.map(s => s.toUpperCase().trim());
        const priorityNames = ['STOCK', 'RINCIAN', 'DATA', 'UNIT', 'INVENTORY'];
        for (const name of priorityNames) {
          const found = sheetNamesUpper.find(s => s.includes(name));
          if (found) {
            targetSheet = wb.Sheets[wb.SheetNames[sheetNamesUpper.indexOf(found)]];
            break;
          }
        }
        if (!targetSheet) targetSheet = wb.Sheets[wb.SheetNames[0]];

        const rows = XLSX.utils.sheet_to_json(targetSheet, { header: 1, defval: '' });
        this.setProgressStep(2, 'Validasi Data');

        // Deteksi header yang lebih robust
        const { headerIdx, secondRowIdx } = this.findHeaderRows(rows);
        let headers = rows[headerIdx].map(h => String(h || '').toUpperCase().trim());
        if (secondRowIdx !== -1) {
          const sr = rows[secondRowIdx].map(h => String(h || '').toUpperCase().trim());
          headers = headers.map((h, i) => (h + ' ' + (sr[i] || '')).trim());
        }

        const col = this.mapColumns(headers);
        console.log('Headers:', headers);
        console.log('Mapping:', col);
        if (col.model === -1) throw new Error('Kolom MODEL tidak ditemukan. Header: ' + headers.join(', '));
        if (col.nik === -1) throw new Error('Kolom NIK tidak ditemukan. Header: ' + headers.join(', '));

        const newUnits = [];
        const seenRangka = new Set(), seenMesin = new Set();
        let errorCount = 0, duplikat = 0;
        const errorDetails = [];

        // Tentukan baris mulai data: lewati semua header
        const startRow = (secondRowIdx !== -1 ? secondRowIdx : headerIdx) + 1;

        for (let i = startRow; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.every(c => !c)) continue;
          if (String(row[0] || '').toUpperCase().includes('TOTAL')) continue;

          // Validasi model
          const resolved = this.parseModelType(String(row[col.model] || ''));
          if (!resolved) { errorCount++; errorDetails.push(`Baris ${i+1}: Model/Tipe tidak dikenal`); continue; }

          // Validasi NIK (lebih fleksibel)
          const nikRaw = String(row[col.nik] || '').trim();
          const nikMatch = nikRaw.match(/\b(25|26)\b/);
          const nikGroup = nikMatch ? nikMatch[1] : 'unknown';
          if (nikGroup === 'unknown') { errorCount++; errorDetails.push(`Baris ${i+1}: NIK tidak valid (${nikRaw})`); continue; }

          // Validasi No Rangka wajib
          const noRangka = String(row[col.noRangka] || '').trim();
          if (!noRangka) { errorCount++; errorDetails.push(`Baris ${i+1}: No Rangka kosong`); continue; }

          // Validasi No Mesin wajib
          const noMesin = String(row[col.noMesin] || '').trim();
          if (!noMesin) { errorCount++; errorDetails.push(`Baris ${i+1}: No Mesin kosong`); continue; }

          // Validasi warna
          const warna = String(row[col.warna] || '').trim();
          if (!warna) { errorCount++; errorDetails.push(`Baris ${i+1}: Warna kosong`); continue; }

          // Cek duplikat
          if (seenRangka.has(noRangka)) { duplikat++; continue; }
          if (seenMesin.has(noMesin)) { duplikat++; continue; }
          seenRangka.add(noRangka);
          seenMesin.add(noMesin);

          const normalizedType = this.normalizeType(resolved.type);
          const searchKey = `${resolved.model} ${resolved.type} ${warna} ${noRangka} ${noMesin}`.toLowerCase();
          newUnits.push({
            idx: newUnits.length,
            model: resolved.model,
            type: resolved.type,
            normalizedType,
            warna,
            nik: nikRaw,
            nikGroup,
            noRangka,
            noMesin,
            gd: String(row[col.gd] || '').trim(),
            noDO: String(row[col.noDO] || '').trim(),
            tanggal: String(row[col.tanggal] || '').trim(),
            customer: String(row[col.customer] || '').trim(),
            sales: String(row[col.sales] || '').trim(),
            salesHead: String(row[col.salesHead] || '').trim(),
            keterangan: String(row[col.keterangan] || '').trim(),
            status: 'READY',
            searchKey
          });
        }

        this.setProgressStep(3, 'Import Database');
        this.state.stockUnits = newUnits;
        this.buildStockIndex();
        const endTime = performance.now();
        this.state.importTime = ((endTime - startTime) / 1000).toFixed(2);
        this.state.stockDate = new Date().toLocaleDateString('id-ID');
        this.updateFooter();
        this.setProgressStep(4, 'Selesai');

        const status = $('upload-status');
        if (status) status.innerHTML = `✅ <b>${this.state.activeFileName}</b> • ${newUnits.length} Unit`;
        this.toast(`${newUnits.length} unit berhasil dimuat.`);
        this.showImportSummary(newUnits.length, errorCount, duplikat, errorDetails);

        const summary = $('stock-summary');
        if (summary) {
          summary.classList.remove('hidden');
          summary.innerHTML = `<div class="stat-grid">
            <div class="stat-card"><div>📦</div><div class="stat-number">${newUnits.length}</div></div>
            <div class="stat-card"><div>🔵</div><div class="stat-number">${newUnits.filter(u=>u.nikGroup==='25').length}</div></div>
            <div class="stat-card"><div>🟣</div><div class="stat-number">${newUnits.filter(u=>u.nikGroup==='26').length}</div></div>
            <div class="stat-card"><div>⭐</div><div class="stat-number">${this.state.favorites.length}</div></div>
          </div>`;
        }
        this.populateFilters();
        this.resetFilters();
        $('stock-filters')?.classList.remove('hidden');
        $('stock-summary')?.scrollIntoView({ behavior: 'smooth' });
        this.saveState();
      } catch (err) {
        console.error(err);
        const status = $('upload-status');
        if (status) status.innerHTML = `❌ ${err.message}`;
        $('upload-progress-container')?.classList.add('hidden');
      }
    };
    reader.onerror = () => {
      const status = $('upload-status');
      if (status) status.innerHTML = '❌ Gagal membaca file.';
      $('upload-progress-container')?.classList.add('hidden');
    };
    reader.readAsArrayBuffer(file);
    input.value = '';
  },

  findHeaderRows(rows) {
    const keywords = ['MODEL', 'NIK', 'RANGKA', 'MESIN', 'TYPE', 'WARNA', 'GD', 'NO'];
    // Cari dua baris header yang saling melengkapi
    for (let i = 0; i < rows.length - 1; i++) {
      const row1 = (rows[i] || []).map(c => String(c || '').toUpperCase().trim());
      const row2 = (rows[i + 1] || []).map(c => String(c || '').toUpperCase().trim());
      const combined = row1.map((cell, idx) => (cell + ' ' + (row2[idx] || '')).trim());
      const matched = keywords.filter(k => combined.some(t => t.includes(k)));
      if (matched.length >= 3) return { headerIdx: i, secondRowIdx: i + 1 };
    }
    // Fallback ke 1 baris
    for (let i = 0; i < rows.length; i++) {
      const texts = (rows[i] || []).map(c => String(c || '').toUpperCase().trim());
      const matched = keywords.filter(k => texts.some(t => t.includes(k)));
      if (matched.length >= 2) return { headerIdx: i, secondRowIdx: -1 };
    }
    throw new Error('Header tidak ditemukan. Pastikan kolom Model dan NIK ada.');
  },

  mapColumns(headers) {
    const aliases = {
      model: ['MODEL', 'MODEL UNIT', 'NAMA MODEL', 'TYPE UNIT', 'VARIAN', 'UNIT', 'TIPE', 'TIPE UNIT', 'PRODUK', 'PRODUCT'],
      gd: ['GD', 'GRADE', 'GUDANG', 'LOKASI', 'LOKASI UNIT', 'CABANG'],
      warna: ['WARNA', 'COLOR', 'COLOUR', 'BODY COLOR', 'WARNA UNIT', 'KODE WARNA', 'COLOR CODE'],
      noRangka: ['NO RANGKA', 'RANGKA', 'CHASSIS', 'FRAME', 'NOMOR RANGKA', 'NO CHASSIS', 'NOMOR CHASSIS', 'VIN', 'NO VIN'],
      noMesin: ['NO MESIN', 'MESIN', 'ENGINE', 'NOMOR MESIN', 'ENGINE NUMBER', 'NO ENGINE', 'NOMOR ENGINE'],
      nik: ['NIK', 'NO NIK', 'NIK UNIT', 'TAHUN', 'MY', 'MODEL YEAR', 'TAHUN PRODUKSI', 'YEAR'],
      noDO: ['NO DO', 'NOMOR DO', 'DO', 'DELIVERY ORDER', 'SURAT JALAN'],
      tanggal: ['TANGGAL DO', 'TANGGAL', 'TGL DO', 'TGL', 'DATE', 'TANGGAL MASUK'],
      customer: ['CUSTOMER', 'PEMBELI', 'NAMA CUSTOMER', 'NAMA PEMBELI', 'PELANGGAN', 'KONSUMEN'],
      sales: ['SALES', 'NAMA SALES', 'SALESMAN', 'MARKETING', 'SALES EXECUTIVE'],
      salesHead: ['SALES HEAD', 'SUPERVISOR', 'SPV', 'KEPALA SALES', 'MANAGER'],
      keterangan: ['KETERANGAN', 'KET', 'KONDISI', 'STATUS', 'NOTE', 'CATATAN', 'REMARKS']
    };
    const map = {};
    for (const k in aliases) map[k] = -1;
    headers.forEach((h, i) => {
      const hc = String(h || '').trim().toUpperCase().replace(/[_\-.\s]+/g, ' ');
      for (const [key, al] of Object.entries(aliases)) {
        if (map[key] !== -1) continue;
        if (al.some(a => hc.includes(a))) {
          map[key] = i;
          break;
        }
      }
    });
    return map;
  },

  showImportSummary(total, error, dup, details) {
    const c = $('import-summary-container'); if (!c) return;
    let h = `<div class="import-summary">
      <div class="row"><span>Total Unit Tersimpan</span><strong>${total}</strong></div>
      <div class="row"><span>Error Parsing</span><span style="color:#DC2626;">${error}</span></div>
      <div class="row"><span>Duplikat (No Rangka/Mesin)</span><span style="color:#D97706;">${dup}</span></div>
      <div class="row"><span>Waktu Import</span><span>${this.state.importTime}s</span></div>`;
    if (details.length) h += `<div style="margin-top:0.5rem; color:#DC2626;"><strong>Detail Error:</strong><br>${details.slice(0, 5).map(e => '• ' + e).join('<br>')}</div>`;
    c.innerHTML = h + '</div>';
  },

  buildStockIndex() {
    const idx = {};
    this.state.stockUnits.forEach(u => {
      if (!idx[u.model]) idx[u.model] = {};
      if (!idx[u.model][u.normalizedType]) idx[u.model][u.normalizedType] = {};
      if (!idx[u.model][u.normalizedType][u.nikGroup]) idx[u.model][u.normalizedType][u.nikGroup] = [];
      idx[u.model][u.normalizedType][u.nikGroup].push(u);
    });
    this.state.stockIndex = idx;
  },

  setProgressStep(step, label) {
    const steps = $('progress-steps')?.children;
    if (steps) for (let i = 0; i < steps.length; i++) {
      steps[i].classList.remove('active', 'done');
      if (i < step) steps[i].classList.add('done');
      else if (i === step) steps[i].classList.add('active');
    }
    const fill = $('progress-fill'); if (fill) fill.style.width = (step / 4 * 100) + '%';
    const lbl = $('progress-label'); if (lbl) lbl.textContent = label;
  },

  populateFilters() {
    const models = [...new Set(this.state.stockUnits.map(u => u.model))].filter(Boolean).sort();
    this.fillSelect('stock-model', models);
    const sm = $('stock-model')?.value;
    if (sm) {
      const types = [...new Set(this.state.stockUnits.filter(u => u.model === sm).map(u => u.type))].filter(Boolean).sort();
      this.fillSelect('stock-type', types);
    } else {
      const t = $('stock-type'); if (t) t.innerHTML = '<option value="">Semua</option>';
    }
    const colors = [...new Set(this.state.stockUnits.map(u => this.getColorName(u.warna)).filter(Boolean))].sort();
    this.fillSelect('stock-color', colors);
  },

  fillSelect(id, opts) {
    const sel = $(id); if (!sel) return;
    sel.innerHTML = '<option value="">Semua</option>';
    opts.forEach(o => sel.innerHTML += `<option value="${o}">${o}</option>`);
  },

  onStockModelChange() {
    const sm = $('stock-model')?.value;
    const types = sm ? [...new Set(this.state.stockUnits.filter(u => u.model === sm).map(u => u.type))].filter(Boolean).sort() : [];
    this.fillSelect('stock-type', types);
    requestAnimationFrame(() => this.applyFilters());
  },

  resetFilters() {
    const m = $('stock-model'); if (m) m.value = '';
    const t = $('stock-type'); if (t) t.innerHTML = '<option value="">Semua</option>';
    const n = $('stock-nik'); if (n) n.value = '';
    const c = $('stock-color'); if (c) c.value = '';
    const s = $('stock-search'); if (s) s.value = '';
    Object.assign(this.state.last, { filterModel: '', filterType: '', filterNik: '', filterColor: '', search: '' });
    this.populateFilters(); this.applyFilters(); this.saveState();
  },

  applyFilters() {
    clearTimeout(this._filterTimeout);
    this._filterTimeout = setTimeout(() => this._doFilter(), 200);
  },

  _doFilter() {
    const all = this.state.stockUnits;
    const fModel = $('stock-model')?.value || '', fType = $('stock-type')?.value || '', fNik = $('stock-nik')?.value || '', fColor = $('stock-color')?.value || '';
    const search = ($('stock-search')?.value || '').toLowerCase();
    let filtered = all;
    if (fModel && this.state.stockIndex) {
      const mi = this.state.stockIndex[fModel];
      if (!mi) filtered = [];
      else {
        const tk = fType ? this.normalizeType(fType) : null;
        const units = [];
        if (tk) { if (mi[tk]) for (const n in mi[tk]) if (!fNik || n === fNik) units.push(...mi[tk][n]); }
        else for (const t in mi) for (const n in mi[t]) if (!fNik || n === fNik) units.push(...mi[t][n]);
        filtered = units;
      }
    }
    if (fColor) filtered = filtered.filter(u => this.getColorName(u.warna) === fColor);
    if (search) filtered = filtered.filter(u => u.searchKey && u.searchKey.includes(search));
    const count = $('filter-count'); if (count) count.textContent = `${filtered.length} unit ditemukan`;
    const list = $('stock-list'); if (!list) return;
    list.classList.remove('hidden');
    if (!filtered.length) { list.innerHTML = '<div class="card">Tidak ada unit.</div>'; return; }
    list.innerHTML = filtered.map(u => {
      const fav = this.isFavorite(u.idx);
      return `<div class="card" style="cursor:pointer;padding:0.7rem;" onclick="APP.showStockDetail(${u.idx})">
        <div style="display:flex;align-items:flex-start;gap:0.5rem;">
          <span style="font-size:1.4rem;">🚗</span>
          <div style="flex:1;"><strong>${u.model}</strong><div style="font-size:0.8rem;color:#334155;">${u.type}</div>
          <div style="font-size:0.7rem;color:#64748B;"><span class="color-dot ${this.getColorClass(u.warna)}"></span> ${this.getColorName(u.warna)||u.warna} ${u.nikGroup!=='unknown'?`<span class="badge badge-nik${u.nikGroup}">NIK ${u.nikGroup}</span>`:''}</div>
          <div style="font-size:0.65rem;color:#94A3B8;">📍 ${u.gd||'-'}</div></div>
          <span class="badge badge-ready">READY</span>${fav?' <span class="fav-star">⭐</span>':''}
        </div></div>`;
    }).join('');
    this.saveState();
  },

  showStockDetail(idx) {
    const u = this.state.stockUnits[idx];
    if (!u) return;
    this.addRecentView(u);
    const cn = this.getColorName(u.warna) || u.warna;
    const fav = this.isFavorite(idx);
    const hasPrev = idx > 0, hasNext = idx < this.state.stockUnits.length - 1;
    let h = `<h3>${u.model}</h3><p><strong>Type:</strong> ${u.type}</p><p><strong>Warna:</strong> <span class="color-dot ${this.getColorClass(u.warna)}"></span> ${cn}</p>
    <p><strong>NIK:</strong> ${u.nik||'-'} (${u.nikGroup})</p><button class="btn-sm" onclick="APP.toggleFavorite(APP.state.stockUnits[${idx}]);APP.showStockDetail(${idx})">${fav?'★ Hapus Favorit':'☆ Favorit'}</button>
    <div class="divider"></div><p><strong>GD:</strong> ${u.gd||'-'}</p><p><strong>No Rangka:</strong> ${u.noRangka||'-'} <button class="btn-sm" onclick="APP.copyText('${u.noRangka}')">Copy</button></p>
    <p><strong>No Mesin:</strong> ${u.noMesin||'-'} <button class="btn-sm" onclick="APP.copyText('${u.noMesin}')">Copy</button></p>
    <p><strong>No DO:</strong> ${u.noDO||'-'}</p><p><strong>Tanggal DO:</strong> ${u.tanggal||'-'}</p>
    <div class="divider"></div><p><strong>Customer:</strong> ${u.customer||'-'}</p><p><strong>Sales:</strong> ${u.sales||'-'}</p>
    <p><strong>Sales Head:</strong> ${u.salesHead||'-'}</p><p><strong>Keterangan:</strong> ${u.keterangan||'-'}</p>
    <div class="flex-row" style="margin-top:0.8rem;">${hasPrev?`<button class="btn-outline btn-sm" onclick="APP.showStockDetail(${idx-1})">← Sebelumnya</button>`:''}${hasNext?`<button class="btn-outline btn-sm" onclick="APP.showStockDetail(${idx+1})">Berikutnya →</button>`:''}</div>`;
    this.showModal(h);
  },

  downloadTemplate() {
    const headers = ['Model', 'Type', 'NIK', 'Warna', 'No Rangka', 'No Mesin', 'GD', 'No DO', 'Tanggal', 'Customer', 'Sales', 'Sales Head', 'Keterangan'];
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stock");
    XLSX.writeFile(wb, "template_stock_suzuki.xlsx");
  },

  setupDragDrop() {
    const zone = document.querySelector('#upload-zone');
    if (!zone) return;
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor = '#005BAC'; });
    zone.addEventListener('dragleave', () => zone.style.borderColor = '#CBD5E1');
    zone.addEventListener('drop', e => {
      e.preventDefault(); zone.style.borderColor = '#CBD5E1';
      const file = e.dataTransfer.files[0];
      if (file) {
        const input = $('stock-file');
        if (input) { input.files = e.dataTransfer.files; APP.handleStockUpload(input); }
      }
    });
  },

  // ---------- SETTING (nama perusahaan diperbaiki) ----------
  initSetting() {
    const stockInfo = this.state.stockUnits.length ? `${this.state.stockUnits.length} unit (${this.state.stockDate})` : 'Kosong';
    const info = $('setting-info');
    if (info) info.innerHTML = `<div class="card"><h3>⚙️ Setting</h3>
      <p>Versi: v2.1</p>
      <p>Pricelist: Agustus 2026</p>
      <p>Stok: ${stockInfo}</p>
      <p>Favorit: ${this.state.favorites.length}</p>
      <p>Riwayat Simulasi: ${this.state.kreditHistory.length}</p>
      <p><strong>Dikembangkan oleh:</strong> Heru Prasetyo</p>
      <p><strong>Perusahaan:</strong> PT Sunmotor Indosentra Trada Semarang</p>
      <button class="btn-outline btn-sm btn-block" onclick="APP.clearCache()">🗑️ Hapus Cache & Reset</button>
    </div>`;
  },

  clearCache() {
    localStorage.removeItem("suzuki_hub_state");
    this.state.stockUnits = []; this.state.favorites = []; this.state.recentViews = []; this.state.kreditHistory = [];
    this.state.stockDate = null; this.state.stockIndex = null; this.state.importTime = 0;
    window.location.reload();
  }
};

// ========== START ==========
window.addEventListener('load', () => APP.init());
