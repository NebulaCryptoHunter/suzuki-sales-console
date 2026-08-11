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
  dom: {},
  db: { priceIndex: {}, leasingIndex: {}, categoryMap: {}, modelPatterns: [] },
  init() {
    this.loadState();
    this.buildIndexes();
    this.cacheDOM();
    this.renderPage('dashboard');
    this.updateFooter();
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
  buildIndexes() {
    const allPricelist = [...PRICELIST_DATA, ...PRICELIST_LTD];
    allPricelist.forEach(m => {
      m.type.forEach(t => {
        const key = m.model + '|' + t.name;
        this.db.priceIndex[key] = { model: m.model, type: t.name, otr: t.otr, nik25: t.nik25, nik26: t.nik26 };
      });
    });
    for (let [leasingName, leasingData] of Object.entries(LEASING_DATA)) {
      leasingData.forEach(item => {
        item.paket.forEach(p => {
          const key = leasingName + '|' + item.model + '|' + item.type + '|' + p.tenor;
          this.db.leasingIndex[key] = { ...p, otr: item.otr, leasing: leasingName };
        });
      });
    }
    this.db.categoryMap = CATEGORIES_MAP;
    this.db.modelPatterns = [
      // === CARRY (Komersial) ===
      // CARRY LTD → New Carry PU
      { regex: /CARRY.*LTD/i, model: 'New Carry PU', extract: s => s.replace(/.*CARRY.*LTD\s*/i, '').replace(/PUFD/, 'FD').replace(/PUWD/, 'WD') },
      { regex: /CARRY.*KAROSERI.*DSP/i, model: 'New Carry Karoseri (DSP)', extract: s => s.replace(/.*CARRY.*KAROSERI.*DSP\s*/i, '') },
      { regex: /CARRY.*KAROSERI.*ANTIKA/i, model: 'New Carry Karoseri (Antika Raya)', extract: s => s.replace(/.*CARRY.*KAROSERI.*ANTIKA\s*/i, '') },
      // CARRY 05 → New Carry PU
      { regex: /CARRY\s*05/i, model: 'New Carry PU', extract: s => s.replace(/.*CARRY\s*05\s*/i, '').replace(/PUFD/, 'FD').replace(/PUWD/, 'WD') },
      // CARRY biasa
      { regex: /CARRY/i, model: 'New Carry PU', extract: s => s.replace(/.*CARRY\s*/i, '').replace(/PUFD/, 'FD').replace(/PUWD/, 'WD') },

      // === APV ===
      { regex: /APV/i, model: 'APV', extract: s => s.replace(/.*APV\s*/i, '') },

      // === ERTIGA ===
      // Ertiga LTD → All New Ertiga (standar)
      { regex: /ALL NEW ERTIGA.*LTD/i, model: 'All New Ertiga', extract: s => s.replace(/.*ALL NEW ERTIGA.*LTD\s*/i, '') },
      { regex: /ALL NEW ERTIGA HYBRID/i, model: 'All New Ertiga Hybrid', extract: s => s.replace(/.*ALL NEW ERTIGA HYBRID\s*/i, '') },
      { regex: /ALL NEW ERTIGA/i, model: 'All New Ertiga', extract: s => { let t = s.replace(/.*ALL NEW ERTIGA\s*/i, ''); return t === 'GA MT' ? 'GA PW' : t; } },

      // === XL-7 ===
      // XL-7 MC LTD → XL-7 MC
      { regex: /XL-?7.*MC.*LTD/i, model: 'XL-7 MC', extract: s => s.replace(/.*XL-?7\s*MC.*LTD\s*/i, '') },
      // XL-7 MC Hybrid Kuro
      { regex: /XL-?7.*KURO/i, model: 'XL-7 MC Hybrid Kuro', extract: s => s.replace(/.*XL-?7\s*(MC\s*)?(HYBRID\s*)?(KURO\s*)?(EDITION\s*)?/i, '') },
      // NEW XL7 03 ... Hybrid → XL-7 MC Hybrid
      { regex: /(NEW\s*)?XL-?7\s*03.*HYBRID/i, model: 'XL-7 MC Hybrid', extract: s => s.replace(/.*(NEW\s*)?XL-?7\s*03\s*(HYBRID\s*)?/i, '') },
      // NEW XL7 03 ... → XL-7 MC
      { regex: /(NEW\s*)?XL-?7\s*03/i, model: 'XL-7 MC', extract: s => s.replace(/.*(NEW\s*)?XL-?7\s*03\s*/i, '') },
      // NEW XL7 04 ... Hybrid → XL-7 Hybrid
      { regex: /(NEW\s*)?XL-?7\s*04.*HYBRID/i, model: 'XL-7 Hybrid', extract: s => s.replace(/.*(NEW\s*)?XL-?7\s*04\s*(HYBRID\s*)?/i, '') },
      // NEW XL7 04 ... → XL-7
      { regex: /(NEW\s*)?XL-?7\s*04/i, model: 'XL-7', extract: s => s.replace(/.*(NEW\s*)?XL-?7\s*04\s*/i, '') },

      // === FRONX ===
      { regex: /FRONX\s*HYBRID/i, model: 'Fronx Hybrid', extract: s => s.replace(/.*FRONX\s*HYBRID\s*/i, '') },
      { regex: /FRONX/i, model: 'Fronx', extract: s => s.replace(/.*FRONX\s*/i, '') },

      // === GRAND VITARA ===
      { regex: /GRAND\s*VITARA/i, model: 'Grand Vitara MC', extract: s => s.replace(/.*GRAND\s*VITARA\s*(MC\s*)?/i, '').replace(/\bGX\b/gi, 'GLX') },

      // === JIMNY ===
      { regex: /JIMNY\s*5\s*DOOR/i, model: 'Jimny 5 Door', extract: s => s.replace(/.*JIMNY\s*5\s*DOOR\s*/i, '') },
      { regex: /JIMNY/i, model: 'Jimny 3 Door', extract: s => s.replace(/.*JIMNY(\s*3\s*DOOR)?\s*/i, '') },

      // === S-PRESSO ===
      { regex: /S[-\s]?PRESSO.*LUXURY/i, model: 'S-Presso Luxury', extract: s => s.replace(/.*S-?\s*PRESSO.*LUXURY\s*/i, '') },
      { regex: /S[-\s]?PRESSO/i, model: 'S-Presso', extract: s => s.replace(/.*S-?\s*PRESSO\s*/i, '') },

      // === E VITARA ===
      { regex: /E\s*VITARA/i, model: 'e Vitara', extract: s => s.replace(/.*E\s*VITARA\s*/i, '') },
    ];
  },
  cacheDOM() {
    this.dom = {
      headerIcon: $('header-icon'), headerTitle: $('header-title'), headerSubtitle: $('header-subtitle'),
      headerBack: $('header-back'), container: $('main-container'), footerInfo: $('footer-info'),
      footerStock: $('footer-stock-info'), toastContainer: $('toast-container'),
      modalBackdrop: $('modal-backdrop'), modalBody: $('modal-body')
    };
  },
  navigateTo(page, options = {}) {
    if (page === this.state.page) return;
    if (this.state.page !== 'dashboard') {
      if (this.state.history.length === 0 || this.state.history[this.state.history.length - 1] !== this.state.page) {
        this.state.history.push(this.state.page);
      }
    }
    this.state.page = page;
    if (page === 'kredit') {
      this.state.kreditTab = options.tab || 'manual';
    }
    this.renderPage(page);
    const hd = pageHeaders[page];
    this.dom.headerIcon.textContent = hd.icon;
    this.dom.headerTitle.textContent = hd.title;
    this.dom.headerSubtitle.textContent = hd.subtitle;
    this.dom.headerBack.style.display = page !== 'dashboard' ? 'block' : 'none';
    this.saveState();
  },
  goBack() {
    if (this.state.history.length === 0) {
      this.state.page = 'dashboard';
    } else {
      this.state.page = this.state.history.pop();
    }
    this.renderPage(this.state.page);
    const hd = pageHeaders[this.state.page];
    this.dom.headerIcon.textContent = hd.icon;
    this.dom.headerTitle.textContent = hd.title;
    this.dom.headerSubtitle.textContent = hd.subtitle;
    this.dom.headerBack.style.display = this.state.page !== 'dashboard' ? 'block' : 'none';
    this.saveState();
  },
  renderPage(page) {
    this.dom.container.innerHTML = pageTemplates[page] || '';
    if (page === 'pricelist') this.initPricelist();
    if (page === 'kredit') this.initKredit();
    if (page === 'stock') this.initStockPage();
    if (page === 'setting') this.initSetting();
    if (page === 'dashboard') this.initDashboard();
  },
  fRupiah(n) {
    if (n == null || isNaN(n)) return 'Rp0';
    return 'Rp' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  },
  parseRupiahInput(str) {
    if (!str) return 0;
    return parseInt(str.replace(/\D/g, '')) || 0;
  },
  formatRupiahInput(str) {
    let num = this.parseRupiahInput(str);
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  },
  toast(m, e) {
    const c = this.dom.toastContainer;
    if (c.children.length >= 3) c.removeChild(c.firstChild);
    const t = document.createElement('div');
    t.className = 'toast';
    t.style.borderLeftColor = e ? '#DC2626' : '#16A34A';
    t.textContent = m;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
  },
  copyText(t) {
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(() => this.toast('Disalin!'));
    else this.toast('Gagal menyalin', true);
  },
  showModal(h) { this.dom.modalBody.innerHTML = h; this.dom.modalBackdrop.classList.add('active'); },
  closeModal() { this.dom.modalBackdrop.classList.remove('active'); },
  matchType(a, b) { return this.normalizeType(a) === this.normalizeType(b); },
  normalizeType(t) {
    if (!t) return '';
    return t.toUpperCase().trim().replace(/\b20\d{2}\b/g, '').replace(/\bHYBRID\b/gi, '').replace(/\bNEW\b/gi, '')
      .replace(/\bEDITION\b/gi, '').replace(/\bKURO\b/gi, '').replace(/\b2\s*TONE\b/gi, 'TWO TONE')
      .replace(/\bTT\b/gi, 'TWO TONE').replace(/\bDOORS\b/gi, 'DOOR').replace(/\bGX\b/gi, 'GLX').replace(/\bLTD\b/gi, 'LTD')
      .replace(/\bLUXURY\b/gi, 'LUXURY').replace(/\s+/g, ' ').trim();
  },
  getColorName(r) {
    const u = String(r || '').toUpperCase().trim().replace(/^(PRL\.?|PEARL|MET\.?|M\.?)\s*/i, '').replace(/^[A-Z0-9]+\s*-\s*/, '').replace(/\s+/g, ' ').trim();
    const map = { 'ZAM':'Midnight Black','ZJ3':'Blueish Black Pearl','ZQD':'Cave Black','C9J':'Arctic White','26U':'White','WBY':'Savanna Ivory','EYP':'Savanna Ivory','DG5':'Kinetic Yellow','Z2S':'Silky Silver' };
    for (let [k,v] of Object.entries(map)) if (u.includes(k)) return v;
    return u || 'Lainnya';
  },
  getColorClass(r) {
    const u = String(r || '').toLowerCase();
    if (u.includes('hitam')||u.includes('black')) return 'black';
    if (u.includes('putih')||u.includes('white')||u.includes('ivory')) return 'ivory';
    if (u.includes('silver')||u.includes('silky')||u.includes('abu')||u.includes('gray')) return 'silver';
    if (u.includes('merah')||u.includes('red')) return 'red';
    if (u.includes('biru')||u.includes('blue')) return 'blue';
    return 'silver';
  },
  parseModelType(raw) {
    let s = raw.toUpperCase().trim().replace(/[.,\/\\_\-()\[\]{}]/g, ' ').replace(/\s+/g, ' ').trim();
    s = s.replace(/\b20(2[3-9]|3[0-9])\b/g, '').replace(/\bNIK\s*2[56]\b/gi, '').replace(/\bMY\s*2[56]\b/gi, '');
    s = s.replace(/\s+/g, ' ').trim().replace(/\b2TONE\b/g, 'TWO TONE').replace(/\b2 TONE\b/g, 'TWO TONE').replace(/\b5 DOORS\b/g, '5 DOOR').replace(/\b3 DOORS\b/g, '3 DOOR');
    for (let p of this.db.modelPatterns) {
      if (p.regex.test(s)) {
        let type = p.extract(s).trim();
        const typeUpper = type.toUpperCase();
        if (typeUpper === 'GA MT' && p.model === 'All New Ertiga') type = 'GA PW';
        else if (typeUpper.includes('GLX AT TWO TONE WHITE')) type = 'GLX AT (Two Tone White & Black)';
        else if (typeUpper.includes('GLX AT TWO TONE')) type = 'GLX AT (Two Tone)';
        else if (typeUpper.includes('GLX AT')) type = 'GLX AT';
        type = type.replace(/\s+/g, ' ').trim();
        return { model: p.model, type: type || '' };
      }
    }
    return null;
  },
  updateFooter() {
    this.dom.footerInfo.textContent = 'v2.1 • Pricelist: Agustus 2026';
    this.dom.footerStock.textContent = `Stock: ${this.state.stockDate || 'belum diunggah'} | ${this.state.stockUnits.length || 0} unit`;
  },
  addRecentView(unit) {
    this.state.recentViews = this.state.recentViews.filter(u => u.idx !== unit.idx);
    this.state.recentViews.unshift(unit);
    if (this.state.recentViews.length > 10) this.state.recentViews.pop();
    this.saveState();
  },
  toggleFavorite(unit) {
    const idx = this.state.favorites.findIndex(u => u.idx === unit.idx);
    if (idx >= 0) this.state.favorites.splice(idx, 1);
    else this.state.favorites.push(unit);
    this.saveState();
  },
  isFavorite(idx) { return this.state.favorites.some(u => u.idx === idx); },
  addKreditHistory(sim) {
    this.state.kreditHistory.unshift(sim);
    if (this.state.kreditHistory.length > 20) this.state.kreditHistory.pop();
    this.saveState();
  },
  initDashboard() {
    const all = this.state.stockUnits;
    const elStockSub = $('dashboard-stock-sub');
    if (elStockSub) elStockSub.textContent = all.length ? `${all.length} Unit Ready` : 'Upload Excel • Cek Unit';
    if (all.length) {
      const nik25 = all.filter(u => u.nikGroup === '25').length;
      const nik26 = all.filter(u => u.nikGroup === '26').length;
      const modelCount = {};
      all.forEach(u => modelCount[u.model] = (modelCount[u.model] || 0) + 1);
      const topModel = Object.entries(modelCount).sort((a,b) => b[1]-a[1])[0] || ['-',0];
      const elStats = $('dashboard-stats');
      if (elStats) elStats.innerHTML = `
        <div class="stat-grid">
          <div class="stat-card"><div>📦</div><div class="stat-number">${all.length}</div></div>
          <div class="stat-card"><div>🔵</div><div class="stat-number">${nik25}</div></div>
          <div class="stat-card"><div>🟣</div><div class="stat-number">${nik26}</div></div>
          <div class="stat-card"><div>⭐</div><div class="stat-number">${this.state.favorites.length}</div></div>
        </div>
        <div class="card" style="margin-top:0.5rem;padding:0.6rem;">
          <small>🏆 Model Terbanyak: <strong>${topModel[0]}</strong> (${topModel[1]} unit)</small><br>
          <small>📅 Upload: ${this.state.stockDate || '-'} • ⏱️ Waktu Import: ${this.state.importTime || 0}s</small>
        </div>`;
    }
    if (this.state.kreditHistory.length) {
      const h = this.state.kreditHistory[0];
      const elSim = $('dashboard-sim-terakhir');
      if (elSim) elSim.innerHTML = `<div class="card"><strong>🧮 Simulasi Terakhir</strong><br>${h.model} ${h.type} | ${h.leasing} | ${h.tenor} Bulan<br>DP: ${this.fRupiah(h.dpBayar)} | Angsuran: ${this.fRupiah(h.angsuran)}</div>`;
    }
    if (this.state.favorites.length) {
      const elFav = $('dashboard-fav');
      if (elFav) elFav.innerHTML = '<div class="card"><strong>⭐ Unit Favorit</strong><br>' + this.state.favorites.slice(0,3).map(u => `${u.model} ${u.type}`).join('<br>') + '</div>';
    }
  },
  updateNIKDropdown(containerId, model, type) {
    const dropdown = document.getElementById(containerId);
    if (!dropdown) return;
    dropdown.innerHTML = '<option value="">-- Pilih NIK --</option>';
    dropdown.disabled = true;
    if (!model || !type) return;
    const priceData = this.db.priceIndex[model + '|' + type];
    if (!priceData) return;
    const hasNik25 = priceData.nik25 && (priceData.nik25.total_discount > 0 || priceData.nik25.discount > 0);
    const hasNik26 = priceData.nik26 && (priceData.nik26.total_discount > 0 || priceData.nik26.discount > 0);
    if (hasNik25) dropdown.innerHTML += '<option value="nik25">NIK 25</option>';
    if (hasNik26) dropdown.innerHTML += '<option value="nik26">NIK 26</option>';
    if (!hasNik25 && !hasNik26) dropdown.innerHTML += '<option value="nik26">NIK 26 (Tanpa Diskon)</option>';
    dropdown.disabled = false;
    dropdown.value = hasNik26 ? 'nik26' : (hasNik25 ? 'nik25' : 'nik26');
  },
  initPricelist() {
    const c = $('cat-select'); if (!c) return;
    c.innerHTML = '<option value="">-- Pilih Kategori --</option>';
    for (let k in this.db.categoryMap) c.innerHTML += `<option value="${k}">${k}</option>`;
    if (this.state.last.category) c.value = this.state.last.category;
    const m = $('model-select'); if (m) { m.innerHTML = '<option value="">-- Pilih Model --</option>'; m.disabled = true; }
    const t = $('type-select'); if (t) { t.innerHTML = '<option value="">-- Pilih Type --</option>'; t.disabled = true; }
    const nikSel = $('nik-selector'); if (nikSel) nikSel.classList.add('hidden');
    const nikDrop = $('nik-dropdown'); if (nikDrop) { nikDrop.innerHTML = ''; nikDrop.disabled = true; }
    const priceDisp = $('price-display'); if (priceDisp) priceDisp.classList.add('hidden');
    if (this.state.last.category) this.loadModels();
  },
  loadModels() {
    const priceDisp = $('price-display'); if (priceDisp) priceDisp.classList.add('hidden');
    const cat = $('cat-select')?.value;
    const s = $('model-select');
    if (!s) return;
    s.innerHTML = '<option value="">-- Pilih Model --</option>';
    this.state.last.category = cat;
    if (!cat) { s.disabled = true; this.saveState(); return; }
    s.disabled = false;
    (this.db.categoryMap[cat] || []).forEach(m => s.innerHTML += `<option value="${m}">${m}</option>`);
    const t = $('type-select'); if (t) { t.disabled = true; t.innerHTML = '<option value="">-- Pilih Type --</option>'; }
    const nikSel = $('nik-selector'); if (nikSel) nikSel.classList.add('hidden');
    if (this.state.last.model && this.db.categoryMap[cat]?.includes(this.state.last.model)) { s.value = this.state.last.model; this.loadTypes(); }
    this.saveState();
  },
  loadTypes() {
    const priceDisp = $('price-display'); if (priceDisp) priceDisp.classList.add('hidden');
    const model = $('model-select')?.value;
    const s = $('type-select');
    if (!s) return;
    s.innerHTML = '<option value="">-- Pilih Type --</option>';
    this.state.last.model = model;
    if (!model) { s.disabled = true; this.saveState(); return; }
    s.disabled = false;
    const types = Object.keys(this.db.priceIndex).filter(k => k.startsWith(model + '|')).map(k => k.split('|')[1]);
    types.forEach(t => s.innerHTML += `<option value="${t}">${t}</option>`);
    if (this.state.last.type && types.includes(this.state.last.type)) { s.value = this.state.last.type; this.showPriceAndStock(); }
    this.saveState();
  },
  showPriceAndStock() {
    const model = $('model-select')?.value, type = $('type-select')?.value;
    if (!model || !type) return;
    this.state.last.type = type;
    this.updateNIKDropdown('nik-dropdown', model, type);
    const nikSel = $('nik-selector'); const nikDrop = $('nik-dropdown');
    if (nikSel && nikDrop) nikSel.classList.toggle('hidden', nikDrop.disabled);
    if (nikDrop && !nikDrop.disabled) this.state.selectedNIK = nikDrop.value;
    this.updatePriceDisplay();
    this.showStockSummary();
    this.saveState();
  },
  updatePriceDisplay() {
    const model = $('model-select')?.value, type = $('type-select')?.value;
    const nikDrop = $('nik-dropdown');
    if (nikDrop && !nikDrop.disabled) this.state.selectedNIK = nikDrop.value;
    const key = model + '|' + type, pd = this.db.priceIndex[key];
    if (!pd) return;
    const d = pd[this.state.selectedNIK];
    const priceDisp = $('price-display'); if (priceDisp) priceDisp.classList.remove('hidden');
    if (!d) {
      const content = $('price-content'); if (content) content.innerHTML = `<div class="grid-2"><span>OTR</span><span style="text-align:right;">${this.fRupiah(pd.otr)}</span></div><div class="price-nett"><small>Harga Nett</small>${this.fRupiah(pd.otr)}</div>`;
      this.state.selectedPrice = { model, type, otr: pd.otr, nett: pd.otr, total_discount: 0 };
    } else {
      this.state.selectedPrice = { model, type, otr: pd.otr, total_discount: d.total_discount, nett: d.nett };
      const content = $('price-content'); if (content) content.innerHTML = `<div class="grid-2"><span>OTR</span><span style="text-align:right;">${this.fRupiah(pd.otr)}</span></div><div class="grid-2" style="color:#DC2626;"><span>Discount</span><span style="text-align:right;">-${this.fRupiah(d.discount)}</span></div><div class="grid-2" style="color:#059669;"><span>Cashback</span><span style="text-align:right;">-${this.fRupiah(d.cashback)}</span></div><div class="grid-2" style="font-weight:600;"><span>Total Discount</span><span style="text-align:right;">${this.fRupiah(d.total_discount)} <span class="badge badge-discount">${((d.total_discount/pd.otr)*100).toFixed(1)}%</span></span></div><div class="price-nett"><small>Harga Nett</small>${this.fRupiah(d.nett)}</div>`;
    }
  },
  showStockSummary() {
    const model = $('model-select')?.value, type = $('type-select')?.value;
    const allUnits = this.state.stockUnits.filter(u => u.model === model && this.matchType(u.type, type));
    const container = $('stock-summary-pricelist');
    if (!container) return;
    if (!allUnits.length) {
      container.innerHTML = '<div style="margin-top:0.5rem;padding:0.7rem;background:#F1F5F9;border-radius:10px;text-align:center;color:#64748B;">🔴 Stok Habis</div>';
      return;
    }
    const warnaMap = {};
    allUnits.forEach(u => {
      const w = this.getColorName(u.warna) || u.warna || 'Lainnya';
      if (!warnaMap[w]) warnaMap[w] = { nik25: 0, nik26: 0, total: 0 };
      if (u.nikGroup === '25') warnaMap[w].nik25++; else if (u.nikGroup === '26') warnaMap[w].nik26++;
      warnaMap[w].total++;
    });
    let html = `<div style="margin-top:0.5rem;padding:0.7rem;background:#F8FAFC;border-radius:10px;"><div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;"><span class="badge badge-ready">🟢 ${allUnits.length} Unit Ready</span></div>`;
    for (let [w, d] of Object.entries(warnaMap)) {
      const cls = this.getColorClass(w);
      html += `<div style="display:flex;align-items:center;gap:0.4rem;padding:0.3rem 0;font-size:0.8rem;border-bottom:1px solid #F1F5F9;"><span class="color-dot ${cls}"></span> <strong>${w}</strong> (${d.total}) ${d.nik25?`<span class="badge badge-nik25">NIK 25 · ${d.nik25}</span>`:''} ${d.nik26?`<span class="badge badge-nik26">NIK 26 · ${d.nik26}</span>`:''}</div>`;
    }
    container.innerHTML = html + '</div>';
  },
  goToKreditFromPricelist() {
    if (!this.state.selectedPrice) return;
    this.navigateTo('kredit', { tab: 'paket' });
    setTimeout(() => {
      const { model, type } = this.state.selectedPrice;
      let cat = '';
      for (let k in this.db.categoryMap) if (this.db.categoryMap[k].includes(model)) { cat = k; break; }
      const catEl = $('kredit-cat-paket'); if (catEl) catEl.value = cat;
      this.loadKreditModelsPaket();
      const modelEl = $('kredit-model-paket'); if (modelEl) modelEl.value = model;
      this.loadKreditTypesPaket();
      const typeEl = $('kredit-type-paket'); if (typeEl) typeEl.value = type;
      this.onKreditTypeChangePaket();
      const nikEl = $('kredit-nik-dropdown-paket'); if (nikEl && !nikEl.disabled) nikEl.value = this.state.selectedNIK;
      const tenorEl = $('kredit-tenor-paket'); if (tenorEl) tenorEl.value = '12';
      this.showAllLeasingResult();
    }, 100);
  },
  initKredit() {
    const tab = this.state.kreditTab || 'manual';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
    const btnManual = $('tab-btn-manual'); const btnPaket = $('tab-btn-paket');
    const panelManual = $('panel-manual'); const panelPaket = $('panel-paket');
    if (tab === 'manual') {
      if (btnManual) btnManual.classList.add('active');
      if (panelManual) panelManual.classList.remove('hidden');
      this.initManualTab();
    } else {
      if (btnPaket) btnPaket.classList.add('active');
      if (panelPaket) panelPaket.classList.remove('hidden');
      this.initPaketTab();
    }
  },
  switchKreditTab(tab) {
    this.state.kreditTab = tab;
    this.initKredit();
  },
  initPaketTab() {
    const c = $('kredit-cat-paket'); if (c) { c.innerHTML = '<option value="">-- Pilih Kategori --</option>'; for (let k in this.db.categoryMap) c.innerHTML += `<option value="${k}">${k}</option>`; }
    const m = $('kredit-model-paket'); if (m) { m.innerHTML = '<option value="">-- Pilih Model --</option>'; m.disabled = true; }
    const t = $('kredit-type-paket'); if (t) { t.innerHTML = '<option value="">-- Pilih Type --</option>'; t.disabled = true; }
    const nikSel = $('kredit-nik-selector-paket'); if (nikSel) nikSel.classList.add('hidden');
    const tenor = $('kredit-tenor-paket'); if (tenor) { tenor.disabled = true; tenor.value = ''; }
    const result = $('kredit-result'); if (result) { result.innerHTML = ''; result.classList.add('hidden'); }
    const sort = $('kredit-sort-options'); if (sort) sort.classList.add('hidden');
  },
  loadKreditModelsPaket() {
    const cat = $('kredit-cat-paket')?.value;
    const s = $('kredit-model-paket'); if (!s) return;
    s.innerHTML = '<option value="">-- Pilih Model --</option>';
    if (!cat) { s.disabled = true; return; } s.disabled = false;
    (this.db.categoryMap[cat] || []).forEach(m => s.innerHTML += `<option value="${m}">${m}</option>`);
    const t = $('kredit-type-paket'); if (t) { t.disabled = true; t.innerHTML = '<option value="">-- Pilih Type --</option>'; }
  },
  loadKreditTypesPaket() {
    const model = $('kredit-model-paket')?.value;
    const s = $('kredit-type-paket'); if (!s) return;
    s.innerHTML = '<option value="">-- Pilih Type --</option>';
    if (!model) { s.disabled = true; return; } s.disabled = false;
    const types = Object.keys(this.db.priceIndex).filter(k => k.startsWith(model + '|')).map(k => k.split('|')[1]);
    types.forEach(t => s.innerHTML += `<option value="${t}">${t}</option>`);
  },
  onKreditTypeChangePaket() {
    const model = $('kredit-model-paket')?.value, type = $('kredit-type-paket')?.value;
    if (!model || !type) return;
    this.updateNIKDropdown('kredit-nik-dropdown-paket', model, type);
    const nikSel = $('kredit-nik-selector-paket'); const nikDrop = $('kredit-nik-dropdown-paket');
    if (nikSel && nikDrop) nikSel.classList.toggle('hidden', nikDrop.disabled);
    const tenor = $('kredit-tenor-paket'); if (tenor) { tenor.disabled = false; tenor.value = ''; }
    const result = $('kredit-result'); if (result) { result.classList.add('hidden'); }
    const sort = $('kredit-sort-options'); if (sort) sort.classList.add('hidden');
  },
  setSortMode(mode) { this.state.kreditSortMode = mode; this.showAllLeasingResult(); },
  showAllLeasingResult() {
    const tenor = parseInt($('kredit-tenor-paket')?.value);
    if (!tenor) return;
    const model = $('kredit-model-paket')?.value, type = $('kredit-type-paket')?.value;
    if (!model || !type) return;
    const nikKey = $('kredit-nik-dropdown-paket')?.disabled ? 'nik26' : $('kredit-nik-dropdown-paket')?.value;
    const priceData = this.db.priceIndex[model + '|' + type];
    const container = $('kredit-result');
    if (!container) return;
    if (!priceData) { container.innerHTML = '<div class="card">Data harga tidak ditemukan.</div>'; container.classList.remove('hidden'); return; }
    const totalDiskon = priceData[nikKey]?.total_discount || 0;
    const otr = priceData.otr;
    container.classList.remove('hidden');
    const allResults = ALL_LEASINGS.map(leasingName => {
      const key = leasingName + '|' + model + '|' + type + '|' + tenor;
      const paket = this.db.leasingIndex[key];
      if (paket) {
        const dpBayar = paket.tdp - totalDiskon;
        return { leasing: leasingName, available: true, dpBayar, totalInvestasi: dpBayar + (paket.angsuran * tenor), tdp: paket.tdp, angsuran: paket.angsuran };
      } else return { leasing: leasingName, available: false };
    });
    const available = allResults.filter(r => r.available).sort((a,b) => this.state.kreditSortMode === 'dp' ? a.dpBayar - b.dpBayar : a.totalInvestasi - b.totalInvestasi);
    const unavailable = allResults.filter(r => !r.available);
    const best = available.length > 0 ? available[0] : null;
    const sort = $('kredit-sort-options'); if (sort) sort.classList.toggle('hidden', available.length < 2);
    let html = `<h3>${model} ${type} (${nikKey==='nik25'?'NIK 25':'NIK 26'})</h3>`;
    available.forEach(r => {
      const isBest = best && ((this.state.kreditSortMode === 'investasi' && r.totalInvestasi === best.totalInvestasi) || (this.state.kreditSortMode === 'dp' && r.dpBayar === best.dpBayar));
      html += `<div class="leasing-card">
        <div class="leasing-name">${r.leasing} ${isBest?'<span class="best-badge">TERMURAH</span>':''}</div>
        <div class="detail-row"><span>OTR</span><span>${this.fRupiah(otr)}</span></div>
        <div class="detail-row" style="color:#DC2626;"><span>Total Discount</span><span>-${this.fRupiah(totalDiskon)}</span></div>
        <div class="detail-row"><span>TDP Dealer</span><span>${this.fRupiah(r.tdp)}</span></div>
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
    unavailable.forEach(r => {
      html += `<div class="leasing-card" style="text-align:center; color:#64748B;"><div class="leasing-name">📋 ${r.leasing}</div><div style="font-size:0.8rem;">Data belum tersedia</div></div>`;
    });
    container.innerHTML = html;
    if (best) this.addKreditHistory({ model, type, leasing: best.leasing, tenor, dpBayar: best.dpBayar, angsuran: best.angsuran, totalInvestasi: best.totalInvestasi });
  },
  initManualTab() {
    const sel = $('manual-leasing-select'); if (sel) { sel.innerHTML = '<option value="">-- Pilih Leasing --</option>'; ALL_LEASINGS.forEach(l => sel.innerHTML += `<option value="${l}">${l}</option>`); }
    const cat = $('manual-cat'); if (cat) { cat.innerHTML = '<option value="">-- Pilih Kategori --</option>'; for (let k in this.db.categoryMap) cat.innerHTML += `<option value="${k}">${k}</option>`; }
    const model = $('manual-model'); if (model) { model.innerHTML = '<option value="">-- Pilih Model --</option>'; model.disabled = true; }
    const type = $('manual-type'); if (type) { type.innerHTML = '<option value="">-- Pilih Type --</option>'; type.disabled = true; }
    const nikSel = $('manual-nik-selector'); if (nikSel) nikSel.classList.add('hidden');
    const dp = $('manual-dp'); if (dp) dp.value = '';
    const tenor = $('manual-tenor'); if (tenor) tenor.value = '';
    const result = $('manual-result'); if (result) result.innerHTML = '';
    const unitSection = $('manual-unit-section'); if (unitSection) unitSection.classList.add('hidden');
  },
  onManualLeasingChange() {
    const leasing = $('manual-leasing-select')?.value;
    const unitSection = $('manual-unit-section'); const result = $('manual-result');
    if (!leasing) { if (unitSection) unitSection.classList.add('hidden'); if (result) result.innerHTML = ''; return; }
    if (!LEASING_DATA[leasing]) {
      if (unitSection) unitSection.classList.add('hidden');
      if (result) result.innerHTML = `<div class="leasing-card" style="text-align:center;color:#64748B;">📋 Data leasing <b>${leasing}</b> belum tersedia</div>`;
      return;
    }
    if (unitSection) unitSection.classList.remove('hidden');
  },
  loadManualModels() {
    const cat = $('manual-cat')?.value;
    const s = $('manual-model'); if (!s) return;
    s.innerHTML = '<option value="">-- Pilih Model --</option>';
    if (!cat) { s.disabled = true; return; } s.disabled = false;
    (this.db.categoryMap[cat] || []).forEach(m => s.innerHTML += `<option value="${m}">${m}</option>`);
    const t = $('manual-type'); if (t) t.disabled = true;
  },
  loadManualTypes() {
    const model = $('manual-model')?.value;
    const s = $('manual-type'); if (!s) return;
    s.innerHTML = '<option value="">-- Pilih Type --</option>';
    if (!model) { s.disabled = true; return; } s.disabled = false;
    Object.keys(this.db.priceIndex).filter(k => k.startsWith(model + '|')).map(k => k.split('|')[1]).forEach(t => s.innerHTML += `<option value="${t}">${t}</option>`);
  },
  onManualTypeChange() {
    const model = $('manual-model')?.value, type = $('manual-type')?.value;
    if (!model || !type) return;
    this.updateNIKDropdown('manual-nik-dropdown', model, type);
    const nikSel = $('manual-nik-selector'); const nikDrop = $('manual-nik-dropdown');
    if (nikSel && nikDrop) nikSel.classList.toggle('hidden', nikDrop.disabled);
    this.hitungManualPerLeasing();
  },
  hitungManualPerLeasing() {
    const leasing = $('manual-leasing-select')?.value, model = $('manual-model')?.value, type = $('manual-type')?.value;
    const dpInput = this.parseRupiahInput($('manual-dp')?.value);
    const tenor = parseInt($('manual-tenor')?.value) || 0;
    const result = $('manual-result'); if (!result) return;
    if (!leasing || !model || !type || !tenor) { result.innerHTML = ''; return; }
    const nikKey = $('manual-nik-dropdown')?.disabled ? 'nik26' : $('manual-nik-dropdown')?.value;
    const priceKey = model + '|' + type, pd = this.db.priceIndex[priceKey];
    if (!pd) { result.innerHTML = '<div class="leasing-card">Data unit tidak ditemukan.</div>'; return; }
    const totalDiscount = pd[nikKey]?.total_discount || 0;
    const leasingKey = leasing + '|' + model + '|' + type + '|' + tenor, paket = this.db.leasingIndex[leasingKey];
    if (!paket) { result.innerHTML = '<div class="leasing-card">Paket tenor tidak tersedia.</div>'; return; }
    const otr = pd.otr, tdp = paket.tdp, angsuranAsli = paket.angsuran;
    const dpBayarPaket = tdp - totalDiscount;
    if (dpInput < dpBayarPaket) {
      result.innerHTML = `<div class="leasing-card" style="border-left:4px solid #DC2626;"><div style="color:#DC2626;font-weight:600;">❌ DP Bayar minimal ${this.fRupiah(dpBayarPaket)}</div></div>`;
      return;
    }
    const pokokKredit = otr - tdp;
    if (pokokKredit <= 0) { result.innerHTML = '<div class="leasing-card">Data tidak valid (pokok kredit 0).</div>'; return; }
    const selisihDP = dpInput - dpBayarPaket, pokokKreditBaru = pokokKredit - selisihDP;
    let angsuranBaru;
    if (leasing === 'ADIRA') angsuranBaru = Math.round(pokokKreditBaru * (angsuranAsli / pokokKredit));
    else if (leasing === 'MUF') angsuranBaru = Math.round(angsuranAsli * (pokokKreditBaru / pokokKredit));
    else angsuranBaru = Math.round(pokokKreditBaru * (angsuranAsli / pokokKredit));
    const penurunan = angsuranAsli - angsuranBaru, totalInvestasi = dpInput + (angsuranBaru * tenor);
    result.innerHTML = `<div class="leasing-card">
      <div class="leasing-name">${leasing} – ${model} ${type}</div>
      <div class="detail-row"><span>OTR</span><span>${this.fRupiah(otr)}</span></div>
      <div class="detail-row" style="color:#DC2626;"><span>Total Discount</span><span>-${this.fRupiah(totalDiscount)}</span></div>
      <div class="detail-row"><span>TDP Dealer</span><span>${this.fRupiah(tdp)}</span></div>
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
  initStockPage() {
    this.setupDragDrop();
    if (this.state.stockUnits.length) {
      const summary = $('stock-summary'); if (summary) summary.classList.remove('hidden');
      this.populateFilters();
      if (this.state.last.filterModel) { const el = $('stock-model'); if (el) el.value = this.state.last.filterModel; }
      if (this.state.last.filterType) { this.onStockModelChange(); const el = $('stock-type'); if (el) el.value = this.state.last.filterType; }
      if (this.state.last.filterNik) { const el = $('stock-nik'); if (el) el.value = this.state.last.filterNik; }
      if (this.state.last.filterColor) { const el = $('stock-color'); if (el) el.value = this.state.last.filterColor; }
      if (this.state.last.search) { const el = $('stock-search'); if (el) el.value = this.state.last.search; }
      this.applyFilters();
      const filters = $('stock-filters'); if (filters) filters.classList.remove('hidden');
    }
  },
  handleStockUpload(input) {
    const file = input.files[0];
    if (!file) return;
    this.state.activeFileName = file.name;
    if (!file.name.match(/\.(xlsx|xls)$/i)) { const status = $('upload-status'); if (status) status.innerHTML = '❌ Format tidak didukung. Gunakan .xlsx atau .xls'; return; }
    const progressContainer = $('upload-progress-container'); if (progressContainer) progressContainer.classList.remove('hidden');
    this.setProgressStep(0, 'Membaca File');
    const reader = new FileReader();
    const startTime = performance.now();
    reader.onload = e => {
      try {
        this.setProgressStep(1, 'Parsing Data');
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        if (!wb.SheetNames.length) throw new Error('File Excel kosong.');
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        this.setProgressStep(2, 'Validasi Data');
        const { headerIdx, secondRowIdx } = this.findHeaderRows(rows);
        if (headerIdx === -1) throw new Error('Header tidak ditemukan. Pastikan kolom Model dan NIK ada.');
        let headers = rows[headerIdx].map(h => String(h || '').toUpperCase().trim());
        if (secondRowIdx !== -1) {
          const sr = rows[secondRowIdx].map(h => String(h || '').toUpperCase().trim());
          headers = headers.map((h, i) => (h + ' ' + (sr[i] || '')).trim());
        }
        const col = this.mapColumns(headers);
        if (col.model === -1) throw new Error('Kolom MODEL tidak ditemukan. Header: ' + headers.join(', '));
        if (col.nik === -1) throw new Error('Kolom NIK tidak ditemukan. Header: ' + headers.join(', '));
        const newUnits = [];
        const seenRangka = new Set(), seenMesin = new Set();
        let errorCount = 0, duplikat = 0;
        const errorDetails = [];
        const startRow = (secondRowIdx !== -1 ? secondRowIdx : headerIdx) + 1;
        for (let i = startRow; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.every(c => !c)) continue;
          if (String(row[0] || '').toUpperCase().includes('TOTAL')) continue;
          const resolved = this.parseModelType(String(row[col.model] || ''));
          if (!resolved) { errorCount++; errorDetails.push(`Baris ${i+1}: Model/Tipe tidak dikenal`); continue; }
          const nikRaw = String(row[col.nik] || '').trim();
          const nikMatch = nikRaw.match(/\b(25|26)\b/);
          const nikGroup = nikMatch ? nikMatch[1] : 'unknown';
          if (nikGroup === 'unknown') { errorCount++; errorDetails.push(`Baris ${i+1}: NIK tidak valid`); continue; }
          const warna = String(row[col.warna] || '').trim();
          const noRangka = String(row[col.noRangka] || '').trim();
          const noMesin = String(row[col.noMesin] || '').trim();
          if (noRangka && seenRangka.has(noRangka)) { duplikat++; continue; }
          if (noMesin && seenMesin.has(noMesin)) { duplikat++; continue; }
          if (noRangka) seenRangka.add(noRangka);
          if (noMesin) seenMesin.add(noMesin);
          const normalizedType = this.normalizeType(resolved.type);
          const searchKey = `${resolved.model} ${resolved.type} ${warna} ${noRangka} ${noMesin}`.toLowerCase();
          newUnits.push({
            idx: newUnits.length, model: resolved.model, type: resolved.type, normalizedType,
            warna, nik: nikRaw, nikGroup, noRangka, noMesin,
            gd: String(row[col.gd] || '').trim(), noDO: String(row[col.noDO] || '').trim(),
            tanggal: String(row[col.tanggal] || '').trim(), customer: String(row[col.customer] || '').trim(),
            sales: String(row[col.sales] || '').trim(), salesHead: String(row[col.salesHead] || '').trim(),
            keterangan: String(row[col.keterangan] || '').trim(), status: 'READY', searchKey
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
        const status = $('upload-status'); if (status) status.innerHTML = `✅ <b>${this.state.activeFileName}</b> • ${newUnits.length} Unit`;
        this.toast(`${newUnits.length} unit berhasil dimuat.`);
        this.showImportSummary(newUnits.length, errorCount, duplikat, errorDetails);
        const summary = $('stock-summary'); if (summary) { summary.classList.remove('hidden'); summary.innerHTML = `<div class="stat-grid"><div class="stat-card"><div>📦</div><div class="stat-number">${newUnits.length}</div></div><div class="stat-card"><div>🔵</div><div class="stat-number">${newUnits.filter(u=>u.nikGroup==='25').length}</div></div><div class="stat-card"><div>🟣</div><div class="stat-number">${newUnits.filter(u=>u.nikGroup==='26').length}</div></div><div class="stat-card"><div>⭐</div><div class="stat-number">${this.state.favorites.length}</div></div></div>`; }
        this.populateFilters(); this.resetFilters();
        const filters = $('stock-filters'); if (filters) filters.classList.remove('hidden');
        const summaryEl = $('stock-summary'); if (summaryEl) summaryEl.scrollIntoView({ behavior: 'smooth' });
        this.saveState();
      } catch (err) {
        console.error(err);
        const status = $('upload-status'); if (status) status.innerHTML = `❌ ${err.message}`;
        const progressContainer = $('upload-progress-container'); if (progressContainer) progressContainer.classList.add('hidden');
      }
    };
    reader.onerror = () => {
      const status = $('upload-status'); if (status) status.innerHTML = '❌ Gagal membaca file.';
      const progressContainer = $('upload-progress-container'); if (progressContainer) progressContainer.classList.add('hidden');
    };
    reader.readAsArrayBuffer(file);
    input.value = '';
  },
  setProgressStep(step, label) {
    const steps = $('progress-steps')?.children; if (steps) for (let i = 0; i < steps.length; i++) { steps[i].classList.remove('active', 'done'); if (i < step) steps[i].classList.add('done'); else if (i === step) steps[i].classList.add('active'); }
    const fill = $('progress-fill'); if (fill) fill.style.width = (step / 4 * 100) + '%';
    const lbl = $('progress-label'); if (lbl) lbl.textContent = label;
  },
  showImportSummary(total, error, dup, errorDetails) {
    const container = $('import-summary-container'); if (!container) return;
    let html = `<div class="import-summary"><div class="row"><span>Total Unit Tersimpan</span><strong>${total}</strong></div><div class="row"><span>Error Parsing</span><span style="color:#DC2626;">${error}</span></div><div class="row"><span>Duplikat (No Rangka/Mesin)</span><span style="color:#D97706;">${dup}</span></div><div class="row"><span>Waktu Import</span><span>${this.state.importTime}s</span></div>`;
    if (errorDetails.length) html += `<div style="margin-top:0.5rem; color:#DC2626;"><strong>Detail Error:</strong><br>${errorDetails.slice(0,5).map(e => '• '+e).join('<br>')}</div>`;
    container.innerHTML = html + '</div>';
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
  findHeaderRows(rows) {
    const keywords = ['MODEL', 'NIK', 'RANGKA', 'MESIN', 'TYPE', 'WARNA', 'GD', 'NO'];
    for (let i = 0; i < rows.length; i++) {
      const texts = (rows[i] || []).map(c => String(c || '').toUpperCase().trim());
      const matched = keywords.filter(k => texts.some(t => t.includes(k)));
      if (matched.length >= 2) return { headerIdx: i, secondRowIdx: -1 };
    }
    return { headerIdx: 0, secondRowIdx: -1 };
  },
  mapColumns(headers) {
    const aliases = {
      model: ['MODEL', 'MODEL UNIT', 'NAMA MODEL', 'TYPE UNIT', 'VARIAN', 'UNIT'],
      gd: ['GD', 'GRADE', 'GUDANG', 'LOKASI'],
      warna: ['WARNA', 'COLOR', 'COLOUR', 'BODY COLOR'],
      noRangka: ['NO RANGKA', 'RANGKA', 'CHASSIS', 'FRAME'],
      noMesin: ['NO MESIN', 'MESIN', 'ENGINE'],
      nik: ['NIK', 'NO NIK', 'NIK UNIT', 'TAHUN', 'MY', 'MODEL YEAR'],
      noDO: ['NO DO', 'NOMOR DO'],
      tanggal: ['TANGGAL DO', 'TANGGAL', 'TGL DO'],
      customer: ['CUSTOMER', 'PEMBELI'],
      sales: ['SALES', 'NAMA SALES'],
      salesHead: ['SALES HEAD', 'SUPERVISOR'],
      keterangan: ['KETERANGAN', 'KET', 'KONDISI', 'STATUS']
    };
    const map = {};
    for (let k in aliases) map[k] = -1;
    headers.forEach((h, i) => {
      const hClean = String(h || '').trim().toUpperCase().replace(/[_\-.\s]+/g, ' ');
      for (let [key, aliasesList] of Object.entries(aliases)) {
        if (map[key] !== -1) continue;
        if (aliasesList.some(alias => hClean.includes(alias))) { map[key] = i; break; }
      }
    });
    return map;
  },
  populateFilters() {
    const models = [...new Set(this.state.stockUnits.map(u => u.model))].filter(Boolean).sort();
    this.fillSelect('stock-model', models);
    const selModel = $('stock-model')?.value;
    if (selModel) {
      const types = [...new Set(this.state.stockUnits.filter(u => u.model === selModel).map(u => u.type))].filter(Boolean).sort();
      this.fillSelect('stock-type', types);
    } else { const t = $('stock-type'); if (t) t.innerHTML = '<option value="">Semua</option>'; }
    const colors = [...new Set(this.state.stockUnits.map(u => this.getColorName(u.warna)).filter(Boolean))].sort();
    this.fillSelect('stock-color', colors);
  },
  fillSelect(id, opts) {
    const sel = $(id); if (!sel) return;
    sel.innerHTML = '<option value="">Semua</option>';
    opts.forEach(o => sel.innerHTML += `<option value="${o}">${o}</option>`);
  },
  onStockModelChange() {
    const selModel = $('stock-model')?.value;
    const types = selModel ? [...new Set(this.state.stockUnits.filter(u => u.model === selModel).map(u => u.type))].filter(Boolean).sort() : [];
    this.fillSelect('stock-type', types);
    this.applyFilters();
  },
  resetFilters() {
    const model = $('stock-model'); if (model) model.value = '';
    const type = $('stock-type'); if (type) type.innerHTML = '<option value="">Semua</option>';
    const nik = $('stock-nik'); if (nik) nik.value = '';
    const color = $('stock-color'); if (color) color.value = '';
    const search = $('stock-search'); if (search) search.value = '';
    this.state.last.filterModel = ''; this.state.last.filterType = ''; this.state.last.filterNik = ''; this.state.last.filterColor = ''; this.state.last.search = '';
    this.populateFilters(); this.applyFilters(); this.saveState();
  },
  applyFilters() { clearTimeout(this._filterTimeout); this._filterTimeout = setTimeout(() => this._doFilter(), 200); },
  _doFilter() {
    const all = this.state.stockUnits;
    const fModel = $('stock-model')?.value || '', fType = $('stock-type')?.value || '', fNik = $('stock-nik')?.value || '', fColor = $('stock-color')?.value || '';
    const search = ($('stock-search')?.value || '').toLowerCase();
    let filtered = all;
    if (fModel && this.state.stockIndex) {
      const modelIdx = this.state.stockIndex[fModel];
      if (!modelIdx) filtered = [];
      else {
        const typeKey = fType ? this.normalizeType(fType) : null;
        const units = [];
        if (typeKey) { if (modelIdx[typeKey]) for (let nik in modelIdx[typeKey]) if (!fNik || nik === fNik) units.push(...modelIdx[typeKey][nik]); }
        else for (let type in modelIdx) for (let nik in modelIdx[type]) if (!fNik || nik === fNik) units.push(...modelIdx[type][nik]);
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
    let html = `<h3>${u.model}</h3><p><strong>Type:</strong> ${u.type}</p><p><strong>Warna:</strong> <span class="color-dot ${this.getColorClass(u.warna)}"></span> ${cn}</p>
    <p><strong>NIK:</strong> ${u.nik||'-'} (${u.nikGroup})</p><button class="btn-sm" onclick="APP.toggleFavorite(APP.state.stockUnits[${idx}]);APP.showStockDetail(${idx})">${fav?'★ Hapus Favorit':'☆ Favorit'}</button>
    <div class="divider"></div><p><strong>GD:</strong> ${u.gd||'-'}</p><p><strong>No Rangka:</strong> ${u.noRangka||'-'} <button class="btn-sm" onclick="APP.copyText('${u.noRangka}')">Copy</button></p>
    <p><strong>No Mesin:</strong> ${u.noMesin||'-'} <button class="btn-sm" onclick="APP.copyText('${u.noMesin}')">Copy</button></p>
    <p><strong>No DO:</strong> ${u.noDO||'-'}</p><p><strong>Tanggal DO:</strong> ${u.tanggal||'-'}</p>
    <div class="divider"></div><p><strong>Customer:</strong> ${u.customer||'-'}</p><p><strong>Sales:</strong> ${u.sales||'-'}</p>
    <p><strong>Sales Head:</strong> ${u.salesHead||'-'}</p><p><strong>Keterangan:</strong> ${u.keterangan||'-'}</p>
    <div class="flex-row" style="margin-top:0.8rem;">${hasPrev?`<button class="btn-outline btn-sm" onclick="APP.showStockDetail(${idx-1})">← Sebelumnya</button>`:''}${hasNext?`<button class="btn-outline btn-sm" onclick="APP.showStockDetail(${idx+1})">Berikutnya →</button>`:''}</div>`;
    this.showModal(html);
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
      if (file) { const input = $('stock-file'); if (input) { input.files = e.dataTransfer.files; APP.handleStockUpload(input); } }
    });
  },
  initSetting() {
    const stockInfo = this.state.stockUnits.length ? `${this.state.stockUnits.length} unit (${this.state.stockDate})` : 'Kosong';
    const info = $('setting-info'); if (info) info.innerHTML = `<div class="card"><h3>⚙️ Setting</h3><p>Versi: v2.1</p><p>Pricelist: Agustus 2026</p><p>Stok: ${stockInfo}</p><p>Favorit: ${this.state.favorites.length}</p><p>Riwayat Simulasi: ${this.state.kreditHistory.length}</p><button class="btn-outline btn-sm btn-block" onclick="APP.clearCache()">🗑️ Hapus Cache & Reset</button></div>`;
  },
  clearCache() {
    localStorage.removeItem("suzuki_hub_state");
    this.state.stockUnits = []; this.state.favorites = []; this.state.recentViews = []; this.state.kreditHistory = [];
    this.state.stockDate = null; this.state.stockIndex = null; this.state.importTime = 0;
    window.location.reload();
  }
};
