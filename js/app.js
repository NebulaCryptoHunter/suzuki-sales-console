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
      { regex: /CARRY\s*(PU\s*)?(PICK\s*UP\s*)?/i, model: 'New Carry PU', extract: s => s.replace(/.*CARRY\s*(PU\s*)?(PICK\s*UP\s*)?/i, '').trim() },
      { regex: /CARRY.*LTD/i, model: 'New Carry PU LTD', extract: s => s.replace(/.*CARRY.*LTD\s*/i, '').trim() },
      { regex: /CARRY.*KAROSERI.*DSP/i, model: 'New Carry Karoseri (DSP)', extract: s => s.replace(/.*CARRY.*KAROSERI.*DSP\s*/i, '').trim() },
      { regex: /CARRY.*KAROSERI.*ANTIKA/i, model: 'New Carry Karoseri (Antika Raya)', extract: s => s.replace(/.*CARRY.*KAROSERI.*ANTIKA\s*/i, '').trim() },
      { regex: /CARRY/i, model: 'New Carry PU', extract: s => s.replace(/.*CARRY\s*/i, '').replace(/PUFD/,'FD').replace(/PUWD/,'WD').trim() },
      { regex: /APV/i, model: 'APV', extract: s => s.replace(/.*APV\s*/i, '').trim() },
      { regex: /ALL NEW ERTIGA.*LTD/i, model: 'All New Ertiga LTD', extract: s => s.replace(/.*ALL NEW ERTIGA.*LTD\s*/i, '').trim() },
      { regex: /ALL NEW ERTIGA HYBRID/i, model: 'All New Ertiga Hybrid', extract: s => s.replace(/.*ALL NEW ERTIGA HYBRID\s*/i, '').trim() },
      { regex: /ALL NEW ERTIGA/i, model: 'All New Ertiga', extract: s => { let t = s.replace(/.*ALL NEW ERTIGA\s*/i, '').trim(); return t === 'GA MT' ? 'GA PW' : t; } },
      { regex: /XL-?7.*MC.*LTD/i, model: 'XL-7 MC LTD', extract: s => s.replace(/.*XL-?7\s*MC.*LTD\s*/i, '').trim() },
      { regex: /XL-?7.*KURO/i, model: 'XL-7 MC Hybrid Kuro', extract: s => s.replace(/.*XL-?7\s*(MC\s*)?(HYBRID\s*)?(KURO\s*)?(EDITION\s*)?/i, '').trim() },
      { regex: /(NEW\s*)?XL-?7.*HYBRID/i, model: 'XL-7 MC Hybrid', extract: s => s.replace(/.*(NEW\s*)?XL-?7\s*(MC\s*)?(HYBRID\s*)?/i, '').trim() },
      { regex: /(NEW\s*)?XL-?7\s*(MC|ZETA|BETA|ALPHA)/i, model: 'XL-7 MC', extract: s => s.replace(/.*(NEW\s*)?XL-?7\s*(MC\s*)?/i, '').trim() },
      { regex: /XL-?7\s*NEW\s*(BETA|ALPHA).*HYBRID/i, model: 'XL-7 Hybrid', extract: s => s.replace(/.*XL-?7\s*(HYBRID\s*)?/i, '').trim() },
      { regex: /XL-?7\s*NEW/i, model: 'XL-7', extract: s => s.replace(/.*XL-?7\s*/i, '').trim() },
      { regex: /FRONX\s*HYBRID/i, model: 'Fronx Hybrid', extract: s => s.replace(/.*FRONX\s*HYBRID\s*/i, '').trim() },
      { regex: /FRONX/i, model: 'Fronx', extract: s => s.replace(/.*FRONX\s*/i, '').trim() },
      { regex: /GRAND\s*VITARA/i, model: 'Grand Vitara MC', extract: s => s.replace(/.*GRAND\s*VITARA\s*(MC\s*)?/i, '').replace(/\bGX\b/gi, 'GLX').trim() },
      { regex: /JIMNY\s*5\s*DOOR/i, model: 'Jimny 5 Door', extract: s => s.replace(/.*JIMNY\s*5\s*DOOR\s*/i, '').trim() },
      { regex: /JIMNY/i, model: 'Jimny 3 Door', extract: s => s.replace(/.*JIMNY(\s*3\s*DOOR)?\s*/i, '').trim() },
      { regex: /S[-\s]?PRESSO.*LUXURY/i, model: 'S-Presso Luxury', extract: s => s.replace(/.*S-?\s*PRESSO.*LUXURY\s*/i, '').trim() },
      { regex: /S[-\s]?PRESSO/i, model: 'S-Presso', extract: s => s.replace(/.*S-?\s*PRESSO\s*/i, '').trim() },
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

  // ---------- DASHBOARD ----------
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

  // ---------- PRICELIST ----------
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
  showStockSummary() {
    const model = $('model-select')?.value, type = $('type-select')?.value;
    const units = this.state.stockUnits.filter(u => u.model === model && this.matchType(u.type, type));
    const c = $('stock-summary-pricelist'); if (!c) return;
    if (!units.length) {
      c.innerHTML = '<div style="margin-top:0.5rem;padding:0.7rem;background:#F1F5F9;border-radius:10px;text-align:center;color:#64748B;">🔴 Stok Habis</div>';
      return;
    }
    const wm = {};
    units.forEach(u => {
      const w = this.getColorName(u.warna) || u.warna || 'Lainnya';
      if (!wm[w]) wm[w] = { nik25: 0, nik26: 0, total: 0 };
      if (u.nikGroup === '25') wm[w].nik25++; else if (u.nikGroup === '26') wm[w].nik26++;
      wm[w].total++;
    });
    let h = `<div style="margin-top:0.5rem;padding:0.7rem;background:#F8FAFC;border-radius:10px;"><div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;"><span class="badge badge-ready">🟢 ${units.length} Unit Ready</span></div>`;
    for (const [w, d] of Object.entries(wm)) {
      const cls = this.getColorClass(w);
      h += `<div style="display:flex;align-items:center;gap:0.4rem;padding:0.3rem 0;font-size:0.8rem;border-bottom:1px solid #F1F5F9;"><span class="color-dot ${cls}"></span> <strong>${w}</strong> (${d.total}) ${d.nik25?`<span class="badge badge-nik25">NIK 25 · ${d.nik25}</span>`:''} ${d.nik26?`<span class="badge badge-nik26">NIK 26 · ${d.nik26}</span>`:''}</div>`;
    }
    c.innerHTML = h + '</div>';
  },
  goToKreditFromPricelist() {
    if (!this.state.selectedPrice) return;
    this.navigateTo('kredit', { tab: 'paket' });
    const { model, type } = this.state.selectedPrice;
    let cat = '';
    for (const k in CATEGORIES_MAP) if (CATEGORIES_MAP[k].includes(model)) { cat = k; break; }
    const ce = $('kredit-cat-paket'); if (ce) ce.value = cat;
    this.loadKreditModelsPaket();
    const me = $('kredit-model-paket'); if (me) me.value = model;
    this.loadKreditTypesPaket();
    const te = $('kredit-type-paket'); if (te) te.value = type;
    this.onKreditTypeChangePaket();
    const ne = $('kredit-nik-dropdown-paket'); if (ne && !ne.disabled) ne.value = this.state.selectedNIK;
    const tre = $('kredit-tenor-paket'); if (tre) tre.value = '60';
    this.showAllLeasingResult();
  },

  // ---------- KREDIT ----------
  initKredit() {
    const tab = this.state.kreditTab || 'manual';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
    if (tab === 'manual') {
      const b = $('tab-btn-manual'); if (b) b.classList.add('active');
      $('panel-manual')?.classList.remove('hidden');
      this.initManualTab();
    } else {
      const b = $('tab-btn-paket'); if (b) b.classList.add('active');
      $('panel-paket')?.classList.remove('hidden');
      this.initPaketTab();
    }
  },
  switchKreditTab(tab) { this.state.kreditTab = tab; this.initKredit(); },
  initPaketTab() {
    const c = $('kredit-cat-paket'); if (c) { c.innerHTML = '<option value="">-- Pilih Kategori --</option>'; for (const k in CATEGORIES_MAP) c.innerHTML += `<option value="${k}">${k}</option>`; }
    const m = $('kredit-model-paket'); if (m) { m.innerHTML = '<option value="">-- Pilih Model --</option>'; m.disabled = true; }
    const t = $('kredit-type-paket'); if (t) { t.innerHTML = '<option value="">-- Pilih Type --</option>'; t.disabled = true; }
    const ns = $('kredit-nik-selector-paket'); if (ns) ns.classList.add('hidden');
    const tn = $('kredit-tenor-paket'); if (tn) { tn.disabled = true; tn.value = '60'; }
    const r = $('kredit-result'); if (r) { r.innerHTML = ''; r.classList.add('hidden'); }
    const s = $('kredit-sort-options'); if (s) s.classList.add('hidden');
  },
  loadKreditModelsPaket() {
    const cat = $('kredit-cat-paket')?.value;
    const s = $('kredit-model-paket'); if (!s) return;
    s.innerHTML = '<option value="">-- Pilih Model --</option>';
    if (!cat) { s.disabled = true; return; }
    s.disabled = false;
    (CATEGORIES_MAP[cat] || []).forEach(m => s.innerHTML += `<option value="${m}">${m}</option>`);
    const t = $('kredit-type-paket'); if (t) { t.disabled = true; t.innerHTML = '<option value="">-- Pilih Type --</option>'; }
  },
  loadKreditTypesPaket() {
    const model = $('kredit-model-paket')?.value;
    const s = $('kredit-type-paket'); if (!s) return;
    s.innerHTML = '<option value="">-- Pilih Type --</option>';
    if (!model) { s.disabled = true; return; }
    s.disabled = false;
    const types = Object.keys(this.db.priceIndex).filter(k => k.startsWith(model + '|')).map(k => k.split('|')[1]);
    types.forEach(t => s.innerHTML += `<option value="${t}">${t}</option>`);
  },
  onKreditTypeChangePaket() {
    const model = $('kredit-model-paket')?.value, type = $('kredit-type-paket')?.value;
    if (!model || !type) return;
    this.updateNIKDropdown('kredit-nik-dropdown-paket', model, type);
    const ns = $('kredit-nik-selector-paket'), nd = $('kredit-nik-dropdown-paket');
    if (ns && nd) ns.classList.toggle('hidden', nd.disabled);
    const tn = $('kredit-tenor-paket'); if (tn) { tn.disabled = false; tn.value = '60'; }
    const r = $('kredit-result'); if (r) { r.classList.add('hidden'); }
    const s = $('kredit-sort-options'); if (s) s.classList.add('hidden');
  },
  setSortMode(mode) { this.state.kreditSortMode = mode; this.showAllLeasingResult(); },
  showAllLeasingResult() {
    const tenor = parseInt($('kredit-tenor-paket')?.value);
    if (!tenor) return;
    const model = $('kredit-model-paket')?.value, type = $('kredit-type-paket')?.value;
    if (!model || !type) return;
    const nd = $('kredit-nik-dropdown-paket');
    const nikKey = (nd?.disabled || !nd?.value) ? 'nik26' : nd.value;
    const pd = this.db.priceIndex[model + '|' + type];
    const c = $('kredit-result'); if (!c) return;
    if (!pd) { c.innerHTML = '<div class="card">Data harga tidak ditemukan.</div>'; c.classList.remove('hidden'); return; }
    const totalDiskon = pd[nikKey]?.total_discount || 0;
    const otr = pd.otr;
    c.classList.remove('hidden');
    const results = ALL_LEASINGS.map(ln => {
      const key = ln + '|' + model + '|' + type + '|' + tenor;
      const paket = this.db.leasingIndex[key];
      if (paket) {
        const dpBayar = paket.tdp - totalDiskon;
        return {
          leasing: ln, available: true, dpBayar,
          totalInvestasi: dpBayar + (paket.angsuran * tenor),
          tdp: paket.tdp, angsuran: paket.angsuran,
          subsidiDP: paket.subsidiDP || 0
        };
      }
      return { leasing: ln, available: false };
    });
    const avail = results.filter(r => r.available).sort((a, b) =>
      this.state.kreditSortMode === 'dp' ? a.dpBayar - b.dpBayar : a.totalInvestasi - b.totalInvestasi
    );
    const unavail = results.filter(r => !r.available);
    const best = avail.length > 0 ? avail[0] : null;
    const s = $('kredit-sort-options'); if (s) s.classList.toggle('hidden', avail.length < 2);
    let h = `<h3>${model} ${type} (${nikKey === 'nik25' ? 'NIK 25' : 'NIK 26'})</h3>`;
    avail.forEach(r => {
      const isBest = best && ((this.state.kreditSortMode === 'investasi' && r.totalInvestasi === best.totalInvestasi) || (this.state.kreditSortMode === 'dp' && r.dpBayar === best.dpBayar));
      h += `<div class="leasing-card">
        <div class="leasing-name">${r.leasing} ${isBest ? '<span class="best-badge">TERMURAH</span>' : ''}</div>
        <div class="detail-row"><span>OTR</span><span>${this.fRupiah(otr)}</span></div>
        <div class="detail-row" style="color:#DC2626;"><span>Total Discount</span><span>-${this.fRupiah(totalDiskon)}</span></div>
        <div class="detail-row"><span>TDP Dealer</span><span>${this.fRupiah(r.tdp)}</span></div>
        ${r.subsidiDP > 0 ? `<div class="detail-row" style="color:#059669;"><span>Subsidi DP</span><span>-${this.fRupiah(r.subsidiDP)}</span></div>` : ''}
        <div class="highlight" style="background:#ECFDF5; border-left:4px solid #16A34A;">
          <div class="highlight-row"><span class="highlight-label">💰 DP Bayar</span><span class="highlight-value" style="color:#16A34A; font-size:1.2rem;">${this.fRupiah(r.dpBayar)}</span></div>
        </div>
        <div class="highlight" style="background:#EFF6FF; border-left:4px solid #005BAC;">
          <div class="highlight-row"><span class="highlight-label">📅 Angsuran/Bulan</span><span class="highlight-value" style="color:#005BAC;">${this.fRupiah(r.angsuran)}</span></div>
        </div>
        <div class="highlight" style="background:#FFF7ED; border-left:4px solid #D97706;">
          <div class="highlight-row"><span class="highlight-label">⏳ Tenor</span><span class="highlight-value" style="color:#D97706;">${tenor} Bulan</span></div>
        </div>
        <div class="detail-row" style="font-weight:600; margin-top:0.4rem;"><span>Total Investasi</span><span>${this.fRupiah(r.totalInvestasi)}</span></div>
      </div>`;
    });
    unavail.forEach(r => { h += `<div class="leasing-card" style="text-align:center; color:#64748B;"><div class="leasing-name">📋 ${r.leasing}</div><div style="font-size:0.8rem;">Data belum tersedia</div></div>`; });
    c.innerHTML = h;
    if (best) this.addKreditHistory({ model, type, leasing: best.leasing, tenor, dpBayar: best.dpBayar, angsuran: best.angsuran, totalInvestasi: best.totalInvestasi });
  },
  initManualTab() {
    const sel = $('manual-leasing-select'); if (sel) { sel.innerHTML = '<option value="">-- Pilih Leasing --</option>'; ALL_LEASINGS.forEach(l => sel.innerHTML += `<option value="${l}">${l}</option>`); }
    const cat = $('manual-cat'); if (cat) { cat.innerHTML = '<option value="">-- Pilih Kategori --</option>'; for (const k in CATEGORIES_MAP) cat.innerHTML += `<option value="${k}">${k}</option>`; }
    const m = $('manual-model'); if (m) { m.innerHTML = '<option value="">-- Pilih Model --</option>'; m.disabled = true; }
    const t = $('manual-type'); if (t) { t.innerHTML = '<option value="">-- Pilih Type --</option>'; t.disabled = true; }
    const ns = $('manual-nik-selector'); if (ns) ns.classList.add('hidden');
    const dp = $('manual-dp'); if (dp) dp.value = '';
    const tn = $('manual-tenor'); if (tn) tn.value = '60';
    const r = $('manual-result'); if (r) r.innerHTML = '';
    const us = $('manual-unit-section'); if (us) us.classList.add('hidden');
  },
  onManualLeasingChange() {
    const leasing = $('manual-leasing-select')?.value;
    const us = $('manual-unit-section'), r = $('manual-result');
    if (!leasing) { if (us) us.classList.add('hidden'); if (r) r.innerHTML = ''; return; }
    if (!this.data.leasing[leasing]) {
      if (us) us.classList.add('hidden');
      if (r) r.innerHTML = `<div class="leasing-card" style="text-align:center;color:#64748B;">📋 Data leasing <b>${leasing}</b> belum tersedia</div>`;
      return;
    }
    if (us) us.classList.remove('hidden');
  },
  loadManualModels() {
    const cat = $('manual-cat')?.value;
    const s = $('manual-model'); if (!s) return;
    s.innerHTML = '<option value="">-- Pilih Model --</option>';
    if (!cat) { s.disabled = true; return; }
    s.disabled = false;
    (CATEGORIES_MAP[cat] || []).forEach(m => s.innerHTML += `<option value="${m}">${m}</option>`);
    const t = $('manual-type'); if (t) t.disabled = true;
  },
  loadManualTypes() {
    const model = $('manual-model')?.value;
    const s = $('manual-type'); if (!s) return;
    s.innerHTML = '<option value="">-- Pilih Type --</option>';
    if (!model) { s.disabled = true; return; }
    s.disabled = false;
    Object.keys(this.db.priceIndex).filter(k => k.startsWith(model + '|')).map(k => k.split('|')[1]).forEach(t => s.innerHTML += `<option value="${t}">${t}</option>`);
  },
  onManualTypeChange() {
    const model = $('manual-model')?.value, type = $('manual-type')?.value;
    if (!model || !type) return;
    this.updateNIKDropdown('manual-nik-dropdown', model, type);
    const ns = $('manual-nik-selector'), nd = $('manual-nik-dropdown');
    if (ns && nd) ns.classList.toggle('hidden', nd.disabled);
    this.hitungManualPerLeasing();
  },
  hitungManualPerLeasing() {
    const leasing = $('manual-leasing-select')?.value, model = $('manual-model')?.value, type = $('manual-type')?.value;
    const dpInput = this.parseRupiahInput($('manual-dp')?.value);
    const tenor = parseInt($('manual-tenor')?.value) || 0;
    const r = $('manual-result'); if (!r) return;
    if (!leasing || !model || !type || !tenor) { r.innerHTML = ''; return; }
    const nikKey = $('manual-nik-dropdown')?.disabled ? 'nik26' : $('manual-nik-dropdown')?.value;
    const priceKey = model + '|' + type, pd = this.db.priceIndex[priceKey];
    if (!pd) { r.innerHTML = '<div class="leasing-card">Data unit tidak ditemukan.</div>'; return; }
    const totalDiscount = pd[nikKey]?.total_discount || 0;
    const leasingKey = leasing + '|' + model + '|' + type + '|' + tenor, paket = this.db.leasingIndex[leasingKey];
    if (!paket) { r.innerHTML = '<div class="leasing-card">Paket tenor tidak tersedia.</div>'; return; }
    const otr = pd.otr, tdp = paket.tdp, angsuranAsli = paket.angsuran;
    const dpBayarPaket = tdp - totalDiscount;
    if (dpInput < dpBayarPaket) {
      r.innerHTML = `<div class="leasing-card" style="border-left:4px solid #DC2626;"><div style="color:#DC2626;font-weight:600;">❌ DP Bayar minimal ${this.fRupiah(dpBayarPaket)}</div></div>`;
      return;
    }
    const pokokKredit = otr - tdp;
    if (pokokKredit <= 0) { r.innerHTML = '<div class="leasing-card">Data tidak valid (pokok kredit 0).</div>'; return; }
    const selisihDP = dpInput - dpBayarPaket, pokokKreditBaru = pokokKredit - selisihDP;
    const angsuranBaru = this.hitungAngsuranBaru(leasing, pokokKredit, pokokKreditBaru, angsuranAsli);
    const penurunan = angsuranAsli - angsuranBaru, totalInvestasi = dpInput + (angsuranBaru * tenor);
    const subsidiDP = paket.subsidiDP || 0;
    r.innerHTML = `<div class="leasing-card">
      <div class="leasing-name">${leasing} – ${model} ${type}</div>
      <div class="detail-row"><span>OTR</span><span>${this.fRupiah(otr)}</span></div>
      <div class="detail-row" style="color:#DC2626;"><span>Total Discount</span><span>-${this.fRupiah(totalDiscount)}</span></div>
      <div class="detail-row"><span>TDP Dealer</span><span>${this.fRupiah(tdp)}</span></div>
      ${subsidiDP > 0 ? `<div class="detail-row" style="color:#059669;"><span>Subsidi DP</span><span>-${this.fRupiah(subsidiDP)}</span></div>` : ''}
      <div class="highlight" style="background:#ECFDF5; border-left:4px solid #16A34A;">
        <div class="highlight-row"><span class="highlight-label">💰 DP Bayar</span><span class="highlight-value" style="color:#16A34A; font-size:1.2rem;">${this.fRupiah(dpInput)}</span></div>
      </div>
      <div class="highlight" style="background:#EFF6FF; border-left:4px solid #005BAC;">
        <div class="highlight-row"><span class="highlight-label">📅 Angsuran/Bulan</span><span class="highlight-value" style="color:#005BAC;">${this.fRupiah(angsuranBaru)}</span></div>
      </div>
      <div class="highlight" style="background:#FFF7ED; border-left:4px solid #D97706;">
        <div class="highlight-row"><span class="highlight-label">⏳ Tenor</span><span class="highlight-value" style="color:#D97706;">${tenor} Bulan</span></div>
      </div>
      <div class="detail-row" style="color:#059669; margin-top:0.3rem;"><span>Penurunan Angsuran</span><span>-${this.fRupiah(penurunan)}</span></div>
      <div class="detail-row" style="font-weight:600; margin-top:0.4rem;"><span>Total Investasi</span><span>${this.fRupiah(totalInvestasi)}</span></div>
      <div style="font-size:0.6rem; margin-top:0.5rem; color:#64748B;">Rumus: ${leasing === 'ADIRA' ? 'Faktor Leasing' : leasing === 'MUF' ? 'Persentase Pokok' : 'Proporsional'}</div>
    </div>`;
    this.addKreditHistory({ model, type, leasing, tenor, dpBayar: dpInput, angsuran: angsuranBaru, totalInvestasi });
  },

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

  // ---------- SETTING ----------
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
