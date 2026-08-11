<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover">
  <meta name="theme-color" content="#005BAC">
  <title>Suzuki Sales Hub v2.1</title>
  <script src="https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #F4F6FA; color: #1E293B; line-height: 1.5; min-height: 100vh; display: flex; flex-direction: column; -webkit-font-smoothing: antialiased; }
    .header { background: linear-gradient(135deg, #001a33 0%, #003366 30%, #005BAC 100%); color: white; padding: 0 1.2rem; display: flex; align-items: center; gap: 0.8rem; height: 66px; box-shadow: 0 2px 12px rgba(0,0,0,0.2); z-index: 100; flex-shrink: 0; position: sticky; top: 0; border-bottom: 1px solid rgba(255,255,255,0.15); }
    .header-back { background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; padding: 0.25rem; display: none; width: 36px; height: 36px; border-radius: 50%; }
    .header-icon { width: 42px; height: 42px; background: rgba(255,255,255,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
    .header-text { flex: 1; } .header-title { font-size: 1.2rem; font-weight: 700; letter-spacing: 0.03em; } .header-subtitle { font-size: 0.7rem; opacity: 0.85; }
    .container { flex: 1; padding: 1rem 1rem 5rem 1rem; max-width: 720px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; }
    .footer { position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 1px solid #E2E8F0; box-shadow: 0 -4px 12px rgba(0,0,0,0.05); z-index: 99; padding: 0.6rem 1rem; text-align: center; font-size: 0.7rem; color: #64748B; display: flex; align-items: center; justify-content: space-between; min-height: 56px; padding-bottom: max(0.6rem, env(safe-area-inset-bottom)); }
    .card { background: white; border: 1px solid #E8ECF1; border-radius: 18px; padding: 1rem; margin-bottom: 0.7rem; box-shadow: 0 4px 12px rgba(0,0,0,0.05); position: relative; overflow: hidden; }
    .card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 18px 18px 0 0; }
    .card.accent-blue::before { background: linear-gradient(90deg, #005BAC, #3B82F6); }
    .card.accent-green::before { background: linear-gradient(90deg, #059669, #10B981); }
    .card.accent-orange::before { background: linear-gradient(90deg, #D97706, #F59E0B); }
    .card.accent-gray::before { background: linear-gradient(90deg, #64748B, #94A3B8); }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.3rem; height: 46px; padding: 0 1.4rem; border-radius: 14px; font-weight: 600; font-size: 0.88rem; border: none; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
    .btn-primary { background: #005BAC; color: white; } .btn-outline { background: white; color: #005BAC; border: 1.5px solid #005BAC; }
    .btn-sm { height: 34px; padding: 0 0.9rem; font-size: 0.75rem; border-radius: 10px; } .btn-block { width: 100%; }
    select, input[type="file"], input[type="text"], input[type="search"], input[type="number"] { width: 100%; height: 46px; padding: 0 0.9rem; border: 1.5px solid #E2E8F0; border-radius: 14px; font-size: 0.88rem; background: white; color: #1E293B; outline: none; font-family: inherit; }
    select { appearance: none; background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="%2394A3B8" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>'); background-repeat: no-repeat; background-position: right 1rem center; }
    label { display: block; margin-bottom: 0.25rem; font-size: 0.8rem; font-weight: 600; color: #475569; margin-top: 0.5rem; } label:first-of-type { margin-top: 0; }
    .flex-row { display: flex; gap: 0.5rem; flex-wrap: wrap; } .flex-row > * { flex: 1; min-width: 110px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.2rem 1rem; align-items: center; }
    .hidden { display: none; }
    .page { display: none; animation: fadeSlideIn 0.25s ease; } .page.active { display: block; }
    @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .menu-list { display: flex; flex-direction: column; gap: 0.9rem; width: 100%; }
    .menu-card { background: white; border-radius: 20px; padding: 1.1rem 1.3rem; display: flex; align-items: center; gap: 1rem; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #E8ECF1; }
    .menu-icon { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; flex-shrink: 0; }
    .menu-icon.blue { background: #EFF6FF; color: #005BAC; } .menu-icon.green { background: #ECFDF5; color: #059669; } .menu-icon.orange { background: #FFF7ED; color: #D97706; } .menu-icon.gray { background: #F1F5F9; color: #475569; }
    .menu-info { flex: 1; } .menu-title { font-size: 1.05rem; font-weight: 700; } .menu-sub { font-size: 0.78rem; color: #64748B; }
    .price-nett { background: linear-gradient(135deg, #EFF6FF, #DBEAFE); border-radius: 14px; padding: 0.6rem 1rem; text-align: right; font-size: 1.6rem; font-weight: 700; color: #005BAC; margin-top: 0.4rem; }
    .badge { display: inline-block; padding: 0.25rem 0.7rem; border-radius: 999px; font-size: 0.7rem; font-weight: 600; }
    .badge-ready { background: #DCFCE7; color: #15803D; } .badge-nik25 { background: #F1F5F9; color: #475569; } .badge-nik26 { background: #EFF6FF; color: #005BAC; } .badge-discount { background: #FEE2E2; color: #B91C1C; }
    .leasing-card { background: white; border: 1px solid #E8ECF1; border-radius: 16px; padding: 0.8rem; margin-bottom: 0.5rem; }
    .leasing-name { font-weight: 700; font-size: 0.9rem; color: #005BAC; margin-bottom: 0.4rem; }
    .highlight { border-radius: 10px; padding: 0.5rem; margin: 0.3rem 0; }
    .highlight-row { display: flex; justify-content: space-between; align-items: center; }
    .highlight-label { font-size: 0.8rem; font-weight: 600; } .highlight-value { font-size: 1rem; font-weight: 700; }
    .detail-row { display: flex; justify-content: space-between; font-size: 0.78rem; padding: 0.15rem 0; }
    .best-badge { display: inline-block; background: #DCFCE7; color: #15803D; padding: 0.1rem 0.5rem; border-radius: 8px; font-size: 0.65rem; font-weight: 600; margin-left: 0.5rem; }
    .upload-zone { border: 2px dashed #CBD5E1; border-radius: 16px; padding: 1.2rem; text-align: center; cursor: pointer; background: #FAFBFC; }
    .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
    .stat-card { background: white; border: 1px solid #E8ECF1; border-radius: 14px; padding: 0.7rem; text-align: center; }
    .stat-number { font-size: 1.3rem; font-weight: 700; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(15,23,42,0.5); backdrop-filter: blur(6px); z-index: 1500; display: flex; align-items: center; justify-content: center; opacity: 0; visibility: hidden; }
    .modal-backdrop.active { opacity: 1; visibility: visible; }
    .modal { background: white; border-radius: 22px; padding: 1.5rem; max-width: 480px; width: 90%; max-height: 80vh; overflow-y: auto; position: relative; }
    .modal-close { position: absolute; top: 0.8rem; right: 0.8rem; background: #F1F5F9; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; color: #64748B; }
    .progress-container { margin-top: 0.8rem; }
    .progress-steps { display: flex; justify-content: space-between; margin-bottom: 0.3rem; font-size: 0.7rem; color: #64748B; }
    .progress-step { flex: 1; text-align: center; position: relative; }
    .progress-step::after { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 10px; height: 10px; border-radius: 50%; background: #E2E8F0; z-index: 1; }
    .progress-step.active::after { background: #005BAC; } .progress-step.done::after { background: #16A34A; }
    .progress-bar { height: 6px; background: #E2E8F0; border-radius: 3px; overflow: hidden; margin-top: 0.3rem; }
    .progress-fill { height: 100%; background: #005BAC; width: 0%; transition: width 0.4s; }
    .import-summary { margin-top: 0.8rem; background: #F8FAFC; border-radius: 12px; padding: 0.8rem; font-size: 0.8rem; }
    .import-summary .row { display: flex; justify-content: space-between; padding: 0.2rem 0; }
    .spinner { width: 22px; height: 22px; border: 3px solid #E2E8F0; border-top-color: #005BAC; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .toast-container { position: fixed; top: 75px; right: 0.75rem; z-index: 2000; display: flex; flex-direction: column; gap: 0.3rem; pointer-events: none; }
    .toast { background: white; border-radius: 12px; padding: 0.6rem 1rem; box-shadow: 0 6px 20px rgba(0,0,0,0.1); font-size: 0.8rem; font-weight: 500; animation: slideIn 0.3s ease; border-left: 4px solid #16A34A; pointer-events: auto; max-width: 280px; }
    @keyframes slideIn { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
    .divider { height: 1px; background: #E2E8F0; margin: 0.8rem 0; }
    .color-dot { display: inline-block; width: 14px; height: 14px; border-radius: 50%; margin-right: 4px; vertical-align: middle; }
    .color-dot.black { background: #111; } .color-dot.ivory { background: #F5F5DC; border: 1px solid #ccc; } .color-dot.silver { background: #C0C0C0; } .color-dot.red { background: #DC2626; } .color-dot.blue { background: #2563EB; }
    .fav-star { cursor: pointer; font-size: 1.2rem; color: #F59E0B; }
    @media (max-width: 500px) { .stat-grid { grid-template-columns: repeat(2, 1fr); } }
    .tab-nav { display: flex; gap: 0; margin-bottom: 1rem; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0; }
    .tab-btn { flex: 1; padding: 0.7rem; text-align: center; background: #F8FAFC; color: #64748B; font-weight: 600; font-size: 0.85rem; cursor: pointer; border: none; outline: none; }
    .tab-btn.active { background: #005BAC; color: white; }
  </style>
</head>
<body>
  <header class="header" id="main-header">
    <button class="header-back" id="header-back" onclick="APP.goBack()">←</button>
    <div class="header-icon" id="header-icon">🏠</div>
    <div class="header-text">
      <div class="header-title" id="header-title">Suzuki Sales Hub</div>
      <div class="header-subtitle" id="header-subtitle">Internal Dealer Application</div>
    </div>
  </header>
  <div class="toast-container" id="toast-container"></div>
  <div class="container" id="main-container"></div>
  <footer class="footer" id="main-footer"><span id="footer-info">v2.1</span><span id="footer-stock-info">Stock: belum diunggah</span></footer>
  <div class="modal-backdrop" id="modal-backdrop" onclick="APP.closeModal()"><div class="modal" onclick="event.stopPropagation()"><button class="modal-close" onclick="APP.closeModal()">✕</button><div id="modal-body"></div></div></div>

  <script>
    // ========== DATA LENGKAP ==========
    const PRICELIST_DATA = [{"model":"New Carry PU","type":[{"name":"FD","otr":187000000,"nik25":null,"nik26":{"discount":30000000,"cashback":3500000,"total_discount":33500000,"nett":153500000}},{"name":"WD","otr":188100000,"nik25":null,"nik26":{"discount":30000000,"cashback":3500000,"total_discount":33500000,"nett":154600000}},{"name":"FD AC PS","otr":195300000,"nik25":null,"nik26":{"discount":30000000,"cashback":3500000,"total_discount":33500000,"nett":161800000}},{"name":"WD AC PS","otr":196200000,"nik25":null,"nik26":{"discount":30000000,"cashback":3500000,"total_discount":33500000,"nett":162700000}}]},{"model":"APV","type":[{"name":"GE3 PS DEL VAN (Blind Van)","otr":193500000,"nik25":null,"nik26":{"discount":9000000,"cashback":0,"total_discount":9000000,"nett":184500000}},{"name":"GA","otr":236500000,"nik25":null,"nik26":{"discount":9000000,"cashback":0,"total_discount":9000000,"nett":227500000}},{"name":"GL ARENA M/T","otr":245000000,"nik25":null,"nik26":{"discount":9000000,"cashback":0,"total_discount":9000000,"nett":236000000}},{"name":"GX ARENA M/T","otr":259000000,"nik25":null,"nik26":{"discount":9000000,"cashback":0,"total_discount":9000000,"nett":250000000}},{"name":"SGX ARENA M/T","otr":263000000,"nik25":null,"nik26":{"discount":9000000,"cashback":0,"total_discount":9000000,"nett":254000000}}]},{"model":"All New Ertiga","type":[{"name":"GA PW","otr":255100000,"nik25":null,"nik26":{"discount":14000000,"cashback":0,"total_discount":14000000,"nett":241100000}},{"name":"GL MT","otr":279000000,"nik25":null,"nik26":{"discount":23000000,"cashback":4000000,"total_discount":27000000,"nett":252000000}},{"name":"GL AT","otr":290700000,"nik25":null,"nik26":{"discount":23000000,"cashback":4000000,"total_discount":27000000,"nett":263700000}}]},{"model":"All New Ertiga Hybrid","type":[{"name":"GX MT","otr":298900000,"nik25":null,"nik26":{"discount":23000000,"cashback":4000000,"total_discount":27000000,"nett":271900000}},{"name":"GX AT","otr":310100000,"nik25":null,"nik26":{"discount":23000000,"cashback":4000000,"total_discount":27000000,"nett":283100000}},{"name":"Cruise MT","otr":312000000,"nik25":null,"nik26":{"discount":23000000,"cashback":4000000,"total_discount":27000000,"nett":285000000}},{"name":"Cruise MT Two Tone","otr":314000000,"nik25":null,"nik26":{"discount":23000000,"cashback":4000000,"total_discount":27000000,"nett":287000000}},{"name":"Cruise AT","otr":323300000,"nik25":null,"nik26":{"discount":23000000,"cashback":4000000,"total_discount":27000000,"nett":296300000}},{"name":"Cruise AT Two Tone","otr":325300000,"nik25":null,"nik26":{"discount":23000000,"cashback":4000000,"total_discount":27000000,"nett":298300000}}]},{"model":"XL-7 MC","type":[{"name":"Zeta MT","otr":285000000,"nik25":null,"nik26":{"discount":23000000,"cashback":3000000,"total_discount":26000000,"nett":259000000}},{"name":"Zeta AT","otr":297000000,"nik25":null,"nik26":{"discount":23000000,"cashback":3000000,"total_discount":26000000,"nett":271000000}}]},{"model":"XL-7 MC Hybrid","type":[{"name":"Beta MT","otr":313500000,"nik25":null,"nik26":{"discount":26000000,"cashback":3000000,"total_discount":29000000,"nett":284500000}},{"name":"Beta AT","otr":325500000,"nik25":null,"nik26":{"discount":26000000,"cashback":3000000,"total_discount":29000000,"nett":296500000}},{"name":"Alpha MT","otr":325000000,"nik25":null,"nik26":{"discount":26000000,"cashback":3000000,"total_discount":29000000,"nett":296000000}},{"name":"Alpha MT (2 Tone)","otr":327000000,"nik25":null,"nik26":{"discount":26000000,"cashback":3000000,"total_discount":29000000,"nett":298000000}},{"name":"Alpha AT","otr":336500000,"nik25":null,"nik26":{"discount":26000000,"cashback":3000000,"total_discount":29000000,"nett":307500000}},{"name":"Alpha AT (2 Tone)","otr":338500000,"nik25":null,"nik26":{"discount":26000000,"cashback":3000000,"total_discount":29000000,"nett":309500000}}]},{"model":"XL-7 MC Hybrid Kuro","type":[{"name":"Alpha AT","otr":340500000,"nik25":{"discount":27500000,"cashback":3000000,"total_discount":30500000,"nett":310000000},"nik26":{"discount":25000000,"cashback":3000000,"total_discount":28000000,"nett":312500000}},{"name":"Alpha AT (2 Tone)","otr":342500000,"nik25":{"discount":27500000,"cashback":3000000,"total_discount":30500000,"nett":312000000},"nik26":{"discount":25000000,"cashback":3000000,"total_discount":28000000,"nett":314500000}}]},{"model":"XL-7","type":[{"name":"New Zeta MT","otr":294100000,"nik25":null,"nik26":{"discount":10000000,"cashback":3000000,"total_discount":13000000,"nett":281100000}},{"name":"New Zeta AT","otr":305900000,"nik25":null,"nik26":{"discount":10000000,"cashback":3000000,"total_discount":13000000,"nett":292900000}}]},{"model":"XL-7 Hybrid","type":[{"name":"New Beta MT","otr":322700000,"nik25":null,"nik26":{"discount":10000000,"cashback":3000000,"total_discount":13000000,"nett":309700000}},{"name":"New Beta AT","otr":334600000,"nik25":null,"nik26":{"discount":10000000,"cashback":3000000,"total_discount":13000000,"nett":321600000}},{"name":"New Alpha AT","otr":348900000,"nik25":null,"nik26":{"discount":10000000,"cashback":3000000,"total_discount":13000000,"nett":335900000}},{"name":"New Alpha AT (2 Tone)","otr":350900000,"nik25":null,"nik26":{"discount":10000000,"cashback":3000000,"total_discount":13000000,"nett":337900000}}]},{"model":"S-Presso","type":[{"name":"MT","otr":194400000,"nik25":null,"nik26":{"discount":12000000,"cashback":3000000,"total_discount":15000000,"nett":179400000}},{"name":"AGS","otr":206500000,"nik25":null,"nik26":{"discount":12000000,"cashback":3000000,"total_discount":15000000,"nett":191500000}}]},{"model":"Grand Vitara MC","type":[{"name":"GLX AT","otr":445000000,"nik25":{"discount":45000000,"cashback":4000000,"total_discount":49000000,"nett":396000000},"nik26":null},{"name":"GLX AT (Two Tone)","otr":448000000,"nik25":{"discount":45000000,"cashback":4000000,"total_discount":49000000,"nett":399000000},"nik26":null},{"name":"GLX AT (Two Tone White & Black)","otr":448000000,"nik25":{"discount":50000000,"cashback":4000000,"total_discount":54000000,"nett":394000000},"nik26":null}]},{"model":"Fronx","type":[{"name":"GL MT","otr":275800000,"nik25":{"discount":18400000,"cashback":2000000,"total_discount":20400000,"nett":255400000},"nik26":{"discount":9000000,"cashback":2000000,"total_discount":11000000,"nett":264800000}},{"name":"GL AT","otr":287200000,"nik25":{"discount":11800000,"cashback":2000000,"total_discount":13800000,"nett":273400000},"nik26":{"discount":9000000,"cashback":2000000,"total_discount":11000000,"nett":276200000}}]},{"model":"Fronx Hybrid","type":[{"name":"GX MT","otr":300400000,"nik25":{"discount":10400000,"cashback":2000000,"total_discount":12400000,"nett":288000000},"nik26":{"discount":9000000,"cashback":2000000,"total_discount":11000000,"nett":289400000}},{"name":"GX AT","otr":318700000,"nik25":{"discount":11000000,"cashback":2000000,"total_discount":13000000,"nett":305700000},"nik26":{"discount":9000000,"cashback":2000000,"total_discount":11000000,"nett":307700000}},{"name":"SGX AT","otr":345200000,"nik25":{"discount":16000000,"cashback":2000000,"total_discount":18000000,"nett":327200000},"nik26":{"discount":3000000,"cashback":2000000,"total_discount":5000000,"nett":340200000}},{"name":"SGX AT Two Tone","otr":347200000,"nik25":{"discount":16000000,"cashback":2000000,"total_discount":18000000,"nett":329200000},"nik26":{"discount":3000000,"cashback":2000000,"total_discount":5000000,"nett":342200000}},{"name":"SGX AT Kuro","otr":347700000,"nik25":null,"nik26":{"discount":3000000,"cashback":2000000,"total_discount":5000000,"nett":342700000}}]},{"model":"Jimny 3 Door","type":[{"name":"AT","otr":510400000,"nik25":{"discount":44000000,"cashback":0,"total_discount":44000000,"nett":466400000},"nik26":null},{"name":"AT Two Tone","otr":513400000,"nik25":{"discount":44000000,"cashback":0,"total_discount":44000000,"nett":469400000},"nik26":null}]},{"model":"Jimny 5 Door","type":[{"name":"AT","otr":526300000,"nik25":{"discount":34000000,"cashback":0,"total_discount":34000000,"nett":492300000},"nik26":null},{"name":"AT Two Tone","otr":529300000,"nik25":{"discount":34000000,"cashback":0,"total_discount":34000000,"nett":495300000},"nik26":null}]},{"model":"e Vitara","type":[{"name":"1 Tone With Charging","otr":769000000,"nik25":null,"nik26":null},{"name":"2 Tone With Charging","otr":772000000,"nik25":null,"nik26":null}]}];
    const PRICELIST_LTD = [{"model":"New Carry PU LTD","type":[{"name":"FD","otr":202000000,"nik25":null,"nik26":{"discount":43000000,"cashback":3500000,"total_discount":46500000,"nett":155500000}},{"name":"WD","otr":203100000,"nik25":null,"nik26":{"discount":43000000,"cashback":3500000,"total_discount":46500000,"nett":156600000}},{"name":"FD AC PS","otr":210300000,"nik25":null,"nik26":{"discount":43000000,"cashback":3500000,"total_discount":46500000,"nett":163800000}},{"name":"WD AC PS","otr":211200000,"nik25":null,"nik26":{"discount":43000000,"cashback":3500000,"total_discount":46500000,"nett":164700000}}]},{"model":"All New Ertiga LTD","type":[{"name":"GL MT LTD","otr":294100000,"nik25":null,"nik26":{"discount":35000000,"cashback":4000000,"total_discount":39000000,"nett":255100000}},{"name":"GL AT LTD","otr":305800000,"nik25":null,"nik26":{"discount":35000000,"cashback":4000000,"total_discount":39000000,"nett":266800000}}]},{"model":"XL-7 MC LTD","type":[{"name":"Zeta MT LTD","otr":300100000,"nik25":null,"nik26":{"discount":35000000,"cashback":3000000,"total_discount":38000000,"nett":262100000}},{"name":"Zeta AT LTD","otr":312100000,"nik25":null,"nik26":{"discount":35000000,"cashback":3000000,"total_discount":38000000,"nett":274100000}},{"name":"Beta MT LTD","otr":328600000,"nik25":null,"nik26":{"discount":38000000,"cashback":3000000,"total_discount":41000000,"nett":287600000}},{"name":"Beta AT LTD","otr":340600000,"nik25":null,"nik26":{"discount":38000000,"cashback":3000000,"total_discount":41000000,"nett":299600000}}]},{"model":"S-Presso Luxury","type":[{"name":"MT Luxury","otr":207000000,"nik25":null,"nik26":{"discount":23000000,"cashback":3000000,"total_discount":26000000,"nett":181000000}},{"name":"AGS Luxury","otr":219100000,"nik25":null,"nik26":{"discount":23000000,"cashback":3000000,"total_discount":26000000,"nett":193100000}}]},{"model":"New Carry Karoseri (DSP)","type":[{"name":"PU FD AC PS - BOX Composite","otr":243800000,"nik25":null,"nik26":{"discount":30000000,"cashback":3500000,"total_discount":33500000,"nett":210300000}},{"name":"PU FD AC PS - BOX MBG","otr":286400000,"nik25":null,"nik26":{"discount":30000000,"cashback":3500000,"total_discount":33500000,"nett":252900000}},{"name":"PU FD AC PS - BOX MBG NON RAK","otr":265800000,"nik25":null,"nik26":{"discount":30000000,"cashback":3500000,"total_discount":33500000,"nett":232300000}},{"name":"PU FD AC PS - BOX Full Aluminium","otr":256100000,"nik25":null,"nik26":{"discount":30000000,"cashback":3500000,"total_discount":33500000,"nett":222600000}}]},{"model":"New Carry Karoseri (Antika Raya)","type":[{"name":"PU FD AC PS - BOX MBG NON RAK","otr":269100000,"nik25":null,"nik26":{"discount":30000000,"cashback":3500000,"total_discount":33500000,"nett":235600000}},{"name":"PU FD AC PS - HALF BOX Full Aluminium","otr":243700000,"nik25":null,"nik26":{"discount":30000000,"cashback":3500000,"total_discount":33500000,"nett":210200000}}]}];
    const LEASING_ADIRA = [{"model":"New Carry PU","type":"FD","otr":187000000,"paket":[{"tenor":12,"tdp":46750000,"angsuran":13403000},{"tenor":24,"tdp":46750000,"angsuran":7399000},{"tenor":36,"tdp":46750000,"angsuran":5452000},{"tenor":48,"tdp":46750000,"angsuran":4502000},{"tenor":60,"tdp":56100000,"angsuran":3747000}]},{"model":"New Carry PU","type":"WD","otr":188100000,"paket":[{"tenor":12,"tdp":47030000,"angsuran":13480000},{"tenor":24,"tdp":47030000,"angsuran":7441000},{"tenor":36,"tdp":47030000,"angsuran":5483000},{"tenor":48,"tdp":47030000,"angsuran":4527000},{"tenor":60,"tdp":56430000,"angsuran":3769000}]},{"model":"New Carry PU","type":"FD AC PS","otr":195300000,"paket":[{"tenor":12,"tdp":48830000,"angsuran":13985000},{"tenor":24,"tdp":48830000,"angsuran":7719000},{"tenor":36,"tdp":48830000,"angsuran":5687000},{"tenor":48,"tdp":48830000,"angsuran":4696000},{"tenor":60,"tdp":58590000,"angsuran":3908000}]},{"model":"New Carry PU","type":"WD AC PS","otr":196200000,"paket":[{"tenor":12,"tdp":49050000,"angsuran":14048000},{"tenor":24,"tdp":49050000,"angsuran":7754000},{"tenor":36,"tdp":49050000,"angsuran":5713000},{"tenor":48,"tdp":49050000,"angsuran":4717000},{"tenor":60,"tdp":58860000,"angsuran":3925000}]},{"model":"All New Ertiga","type":"GL MT","otr":279000000,"paket":[{"tenor":12,"tdp":41850000,"angsuran":22408000},{"tenor":24,"tdp":41850000,"angsuran":12209000},{"tenor":36,"tdp":41850000,"angsuran":8870000},{"tenor":48,"tdp":41850000,"angsuran":7249000},{"tenor":60,"tdp":55800000,"angsuran":6074000}]},{"model":"All New Ertiga","type":"GL AT","otr":290700000,"paket":[{"tenor":12,"tdp":43610000,"angsuran":23335000},{"tenor":24,"tdp":43610000,"angsuran":12713000},{"tenor":36,"tdp":43610000,"angsuran":9236000},{"tenor":48,"tdp":43610000,"angsuran":7548000},{"tenor":60,"tdp":58140000,"angsuran":6323000}]},{"model":"All New Ertiga Hybrid","type":"GX MT","otr":298900000,"paket":[{"tenor":12,"tdp":44840000,"angsuran":23985000},{"tenor":24,"tdp":44840000,"angsuran":13067000},{"tenor":36,"tdp":44840000,"angsuran":9492000},{"tenor":48,"tdp":44840000,"angsuran":7757000},{"tenor":60,"tdp":59780000,"angsuran":6498000}]},{"model":"All New Ertiga Hybrid","type":"GX AT","otr":310100000,"paket":[{"tenor":12,"tdp":46520000,"angsuran":24873000},{"tenor":24,"tdp":46520000,"angsuran":13550000},{"tenor":36,"tdp":46520000,"angsuran":9842000},{"tenor":48,"tdp":46520000,"angsuran":8043000},{"tenor":60,"tdp":62020000,"angsuran":6737000}]},{"model":"All New Ertiga Hybrid","type":"Cruise MT","otr":312000000,"paket":[{"tenor":12,"tdp":46800000,"angsuran":25024000},{"tenor":24,"tdp":46800000,"angsuran":13632000},{"tenor":36,"tdp":46800000,"angsuran":9902000},{"tenor":48,"tdp":46800000,"angsuran":8092000},{"tenor":60,"tdp":62400000,"angsuran":6777000}]},{"model":"All New Ertiga Hybrid","type":"Cruise AT","otr":323300000,"paket":[{"tenor":12,"tdp":48500000,"angsuran":25919000},{"tenor":24,"tdp":48500000,"angsuran":14119000},{"tenor":36,"tdp":48500000,"angsuran":10255000},{"tenor":48,"tdp":48500000,"angsuran":8381000},{"tenor":60,"tdp":64660000,"angsuran":7018000}]},{"model":"XL-7 MC","type":"Zeta MT","otr":285000000,"paket":[{"tenor":12,"tdp":42750000,"angsuran":22884000},{"tenor":24,"tdp":42750000,"angsuran":12468000},{"tenor":36,"tdp":42750000,"angsuran":9058000},{"tenor":48,"tdp":42750000,"angsuran":7402000},{"tenor":60,"tdp":57000000,"angsuran":6202000}]},{"model":"XL-7 MC","type":"Zeta AT","otr":297000000,"paket":[{"tenor":12,"tdp":44550000,"angsuran":23835000},{"tenor":24,"tdp":44550000,"angsuran":12985000},{"tenor":36,"tdp":44550000,"angsuran":9433000},{"tenor":48,"tdp":44550000,"angsuran":7709000},{"tenor":60,"tdp":59400000,"angsuran":6458000}]},{"model":"XL-7 MC Hybrid","type":"Beta MT","otr":313500000,"paket":[{"tenor":12,"tdp":47030000,"angsuran":25143000},{"tenor":24,"tdp":47030000,"angsuran":13696000},{"tenor":36,"tdp":47030000,"angsuran":9949000},{"tenor":48,"tdp":47030000,"angsuran":8130000},{"tenor":60,"tdp":62700000,"angsuran":6809000}]},{"model":"XL-7 MC Hybrid","type":"Beta AT","otr":325500000,"paket":[{"tenor":12,"tdp":48830000,"angsuran":26094000},{"tenor":24,"tdp":48830000,"angsuran":14213000},{"tenor":36,"tdp":48830000,"angsuran":10324000},{"tenor":48,"tdp":48830000,"angsuran":8437000},{"tenor":60,"tdp":65100000,"angsuran":7065000}]},{"model":"XL-7 MC Hybrid","type":"Alpha MT","otr":325000000,"paket":[{"tenor":12,"tdp":48750000,"angsuran":26054000},{"tenor":24,"tdp":48750000,"angsuran":14192000},{"tenor":36,"tdp":48750000,"angsuran":10308000},{"tenor":48,"tdp":48750000,"angsuran":8424000},{"tenor":60,"tdp":65000000,"angsuran":7054000}]},{"model":"XL-7 MC Hybrid","type":"Alpha AT","otr":336500000,"paket":[{"tenor":12,"tdp":50480000,"angsuran":26966000},{"tenor":24,"tdp":50480000,"angsuran":14688000},{"tenor":36,"tdp":50480000,"angsuran":10668000},{"tenor":48,"tdp":50480000,"angsuran":8709000},{"tenor":60,"tdp":67300000,"angsuran":7284000}]},{"model":"XL-7 MC Hybrid Kuro","type":"Alpha AT","otr":340500000,"paket":[{"tenor":12,"tdp":51080000,"angsuran":27283000},{"tenor":24,"tdp":51080000,"angsuran":14860000},{"tenor":36,"tdp":51080000,"angsuran":10793000},{"tenor":48,"tdp":51080000,"angsuran":8811000},{"tenor":60,"tdp":68100000,"angsuran":7369000}]},{"model":"XL-7","type":"New Zeta MT","otr":294100000,"paket":[{"tenor":12,"tdp":44120000,"angsuran":23605000},{"tenor":24,"tdp":44120000,"angsuran":12860000},{"tenor":36,"tdp":44120000,"angsuran":9342000},{"tenor":48,"tdp":44120000,"angsuran":7635000},{"tenor":60,"tdp":58820000,"angsuran":6396000}]},{"model":"XL-7","type":"New Zeta AT","otr":305900000,"paket":[{"tenor":12,"tdp":45890000,"angsuran":24540000},{"tenor":24,"tdp":45890000,"angsuran":13369000},{"tenor":36,"tdp":45890000,"angsuran":9711000},{"tenor":48,"tdp":45890000,"angsuran":7936000},{"tenor":60,"tdp":61180000,"angsuran":6647000}]},{"model":"XL-7 Hybrid","type":"New Beta MT","otr":322700000,"paket":[{"tenor":12,"tdp":48410000,"angsuran":25872000},{"tenor":24,"tdp":48410000,"angsuran":14093000},{"tenor":36,"tdp":48410000,"angsuran":10236000},{"tenor":48,"tdp":48410000,"angsuran":8365000},{"tenor":60,"tdp":64540000,"angsuran":7005000}]},{"model":"XL-7 Hybrid","type":"New Beta AT","otr":334600000,"paket":[{"tenor":12,"tdp":50190000,"angsuran":26815000},{"tenor":24,"tdp":50190000,"angsuran":14606000},{"tenor":36,"tdp":50190000,"angsuran":10608000},{"tenor":48,"tdp":50190000,"angsuran":8661000},{"tenor":60,"tdp":66920000,"angsuran":7244000}]},{"model":"XL-7 Hybrid","type":"New Alpha AT","otr":348900000,"paket":[{"tenor":12,"tdp":52340000,"angsuran":27949000},{"tenor":24,"tdp":52340000,"angsuran":15222000},{"tenor":36,"tdp":52340000,"angsuran":11055000},{"tenor":48,"tdp":52340000,"angsuran":9026000},{"tenor":60,"tdp":69780000,"angsuran":7548000}]},{"model":"Fronx","type":"GL MT","otr":275800000,"paket":[{"tenor":12,"tdp":41370000,"angsuran":22145000},{"tenor":24,"tdp":41370000,"angsuran":12065000},{"tenor":36,"tdp":41370000,"angsuran":8761000},{"tenor":48,"tdp":41370000,"angsuran":7158000},{"tenor":60,"tdp":55160000,"angsuran":5997000}]},{"model":"Fronx","type":"GL AT","otr":287200000,"paket":[{"tenor":12,"tdp":43080000,"angsuran":23060000},{"tenor":24,"tdp":43080000,"angsuran":12564000},{"tenor":36,"tdp":43080000,"angsuran":9123000},{"tenor":48,"tdp":43080000,"angsuran":7454000},{"tenor":60,"tdp":57440000,"angsuran":6245000}]},{"model":"Fronx Hybrid","type":"GX MT","otr":300400000,"paket":[{"tenor":12,"tdp":45060000,"angsuran":24120000},{"tenor":24,"tdp":45060000,"angsuran":13142000},{"tenor":36,"tdp":45060000,"angsuran":9542000},{"tenor":48,"tdp":45060000,"angsuran":7798000},{"tenor":60,"tdp":60080000,"angsuran":6532000}]},{"model":"Fronx Hybrid","type":"GX AT","otr":318700000,"paket":[{"tenor":12,"tdp":47810000,"angsuran":25589000},{"tenor":24,"tdp":47810000,"angsuran":13942000},{"tenor":36,"tdp":47810000,"angsuran":10123000},{"tenor":48,"tdp":47810000,"angsuran":8275000},{"tenor":60,"tdp":63740000,"angsuran":6931000}]},{"model":"Fronx Hybrid","type":"SGX AT","otr":345200000,"paket":[{"tenor":12,"tdp":51780000,"angsuran":27718000},{"tenor":24,"tdp":51780000,"angsuran":15102000},{"tenor":36,"tdp":51780000,"angsuran":10965000},{"tenor":48,"tdp":51780000,"angsuran":8963000},{"tenor":60,"tdp":69040000,"angsuran":7507000}]},{"model":"Fronx Hybrid","type":"SGX AT Two Tone","otr":347200000,"paket":[{"tenor":12,"tdp":52080000,"angsuran":27879000},{"tenor":24,"tdp":52080000,"angsuran":15189000},{"tenor":36,"tdp":52080000,"angsuran":11028000},{"tenor":48,"tdp":52080000,"angsuran":9015000},{"tenor":60,"tdp":69440000,"angsuran":7550000}]},{"model":"Fronx Hybrid","type":"SGX AT Kuro","otr":347700000,"paket":[{"tenor":12,"tdp":52160000,"angsuran":27919000},{"tenor":24,"tdp":52160000,"angsuran":15211000},{"tenor":36,"tdp":52160000,"angsuran":11044000},{"tenor":48,"tdp":52160000,"angsuran":9028000},{"tenor":60,"tdp":69540000,"angsuran":7561000}]},{"model":"S-Presso","type":"MT","otr":194400000,"paket":[{"tenor":12,"tdp":29160000,"angsuran":15606000},{"tenor":24,"tdp":29160000,"angsuran":8501000},{"tenor":36,"tdp":29160000,"angsuran":6173000},{"tenor":48,"tdp":29160000,"angsuran":5045000},{"tenor":60,"tdp":38880000,"angsuran":4227000}]},{"model":"S-Presso","type":"AGS","otr":206500000,"paket":[{"tenor":12,"tdp":30980000,"angsuran":16577000},{"tenor":24,"tdp":30980000,"angsuran":9030000},{"tenor":36,"tdp":30980000,"angsuran":6557000},{"tenor":48,"tdp":30980000,"angsuran":5359000},{"tenor":60,"tdp":41300000,"angsuran":4490000}]}];
    const LEASING_MUF = [{"model":"New Carry PU LTD","type":"FD AC PS","otr":210300000,"paket":[{"tenor":36,"tdp":65664000,"angsuran":5705000},{"tenor":48,"tdp":66856000,"angsuran":4654000},{"tenor":60,"tdp":67963000,"angsuran":4037000}]},{"model":"Fronx","type":"GL MT","otr":275800000,"paket":[{"tenor":36,"tdp":42249000,"angsuran":8825000},{"tenor":48,"tdp":43196000,"angsuran":7142000},{"tenor":60,"tdp":44082000,"angsuran":6152000}]},{"model":"Fronx","type":"GL AT","otr":287200000,"paket":[{"tenor":36,"tdp":43866000,"angsuran":9216000},{"tenor":48,"tdp":44549000,"angsuran":7459000},{"tenor":60,"tdp":45470000,"angsuran":6424000}]},{"model":"Fronx Hybrid","type":"GX MT","otr":300400000,"paket":[{"tenor":36,"tdp":45616000,"angsuran":9640000},{"tenor":48,"tdp":46325000,"angsuran":7802000},{"tenor":60,"tdp":47284000,"angsuran":6720000}]},{"model":"Fronx Hybrid","type":"GX AT","otr":318700000,"paket":[{"tenor":36,"tdp":47776000,"angsuran":10163000},{"tenor":48,"tdp":48519000,"angsuran":8225000},{"tenor":60,"tdp":49216000,"angsuran":7084000}]},{"model":"Fronx Hybrid","type":"SGX AT","otr":345200000,"paket":[{"tenor":36,"tdp":51288000,"angsuran":11013000},{"tenor":48,"tdp":52085000,"angsuran":8913000},{"tenor":60,"tdp":52832000,"angsuran":7677000}]},{"model":"Fronx Hybrid","type":"SGX AT Two Tone","otr":347200000,"paket":[{"tenor":36,"tdp":51553000,"angsuran":11077000},{"tenor":48,"tdp":52354000,"angsuran":8965000},{"tenor":60,"tdp":53105000,"angsuran":7722000}]},{"model":"All New Ertiga","type":"GA PW","otr":255100000,"paket":[{"tenor":36,"tdp":39898000,"angsuran":8186000},{"tenor":48,"tdp":40784000,"angsuran":6625000},{"tenor":60,"tdp":41614000,"angsuran":5706000}]},{"model":"All New Ertiga","type":"GL MT","otr":279000000,"paket":[{"tenor":36,"tdp":42779000,"angsuran":8953000},{"tenor":48,"tdp":43738000,"angsuran":7246000},{"tenor":60,"tdp":44636000,"angsuran":6241000}]},{"model":"All New Ertiga","type":"GL AT","otr":290700000,"paket":[{"tenor":36,"tdp":44330000,"angsuran":9328000},{"tenor":48,"tdp":45020000,"angsuran":7550000},{"tenor":60,"tdp":45951000,"angsuran":6503000}]},{"model":"All New Ertiga Hybrid","type":"GX MT","otr":298900000,"paket":[{"tenor":36,"tdp":44661000,"angsuran":9409000},{"tenor":48,"tdp":45356000,"angsuran":7615000},{"tenor":60,"tdp":46295000,"angsuran":6559000}]},{"model":"All New Ertiga Hybrid","type":"GX AT","otr":310100000,"paket":[{"tenor":36,"tdp":46199000,"angsuran":9781000},{"tenor":48,"tdp":46917000,"angsuran":7916000},{"tenor":60,"tdp":47889000,"angsuran":6818000}]},{"model":"All New Ertiga Hybrid","type":"Cruise MT","otr":312000000,"paket":[{"tenor":36,"tdp":46477000,"angsuran":9848000},{"tenor":48,"tdp":47200000,"angsuran":7971000},{"tenor":60,"tdp":48178000,"angsuran":6865000}]},{"model":"All New Ertiga Hybrid","type":"Cruise MT Two Tone","otr":314000000,"paket":[{"tenor":36,"tdp":46742000,"angsuran":9912000},{"tenor":48,"tdp":47469000,"angsuran":8022000},{"tenor":60,"tdp":48151000,"angsuran":6910000}]},{"model":"All New Ertiga Hybrid","type":"Cruise AT","otr":323300000,"paket":[{"tenor":36,"tdp":47988000,"angsuran":10214000},{"tenor":48,"tdp":48734000,"angsuran":8267000},{"tenor":60,"tdp":49434000,"angsuran":7120000}]},{"model":"All New Ertiga Hybrid","type":"Cruise AT Two Tone","otr":325300000,"paket":[{"tenor":36,"tdp":48253000,"angsuran":10278000},{"tenor":48,"tdp":49003000,"angsuran":8319000},{"tenor":60,"tdp":49707000,"angsuran":7165000}]},{"model":"XL-7","type":"New Zeta MT","otr":294100000,"paket":[{"tenor":36,"tdp":43574000,"angsuran":9145000},{"tenor":48,"tdp":44552000,"angsuran":7402000},{"tenor":60,"tdp":45467000,"angsuran":6375000}]},{"model":"XL-7","type":"New Zeta AT","otr":305900000,"paket":[{"tenor":36,"tdp":45165000,"angsuran":9530000},{"tenor":48,"tdp":45868000,"angsuran":7713000},{"tenor":60,"tdp":46817000,"angsuran":6644000}]},{"model":"XL-7 Hybrid","type":"New Beta MT","otr":322700000,"paket":[{"tenor":36,"tdp":47352000,"angsuran":10060000},{"tenor":48,"tdp":48088000,"angsuran":8142000},{"tenor":60,"tdp":48779000,"angsuran":7013000}]},{"model":"XL-7 Hybrid","type":"New Beta AT","otr":334600000,"paket":[{"tenor":36,"tdp":48942000,"angsuran":10445000},{"tenor":48,"tdp":49703000,"angsuran":8454000},{"tenor":60,"tdp":50417000,"angsuran":7281000}]},{"model":"XL-7 Hybrid","type":"New Alpha AT","otr":348900000,"paket":[{"tenor":36,"tdp":50400000,"angsuran":10798000},{"tenor":48,"tdp":51183000,"angsuran":8739000},{"tenor":60,"tdp":51918000,"angsuran":7527000}]},{"model":"XL-7 Hybrid","type":"New Alpha AT (2 Tone)","otr":350900000,"paket":[{"tenor":36,"tdp":50665000,"angsuran":10862000},{"tenor":48,"tdp":51452000,"angsuran":8791000},{"tenor":60,"tdp":52191000,"angsuran":7571000}]},{"model":"XL-7 MC","type":"Zeta MT","otr":285000000,"paket":[{"tenor":36,"tdp":43574000,"angsuran":9145000},{"tenor":48,"tdp":44552000,"angsuran":7402000},{"tenor":60,"tdp":45467000,"angsuran":6375000}]},{"model":"XL-7 MC","type":"Zeta AT","otr":297000000,"paket":[{"tenor":36,"tdp":45165000,"angsuran":9530000},{"tenor":48,"tdp":45868000,"angsuran":7713000},{"tenor":60,"tdp":46817000,"angsuran":6644000}]},{"model":"XL-7 MC Hybrid","type":"Beta MT","otr":313500000,"paket":[{"tenor":36,"tdp":47352000,"angsuran":10060000},{"tenor":48,"tdp":48088000,"angsuran":8142000},{"tenor":60,"tdp":48779000,"angsuran":7013000}]},{"model":"XL-7 MC Hybrid","type":"Beta AT","otr":325500000,"paket":[{"tenor":36,"tdp":48942000,"angsuran":10445000},{"tenor":48,"tdp":49703000,"angsuran":8454000},{"tenor":60,"tdp":50417000,"angsuran":7281000}]},{"model":"XL-7 MC Hybrid","type":"Alpha MT","otr":325000000,"paket":[{"tenor":36,"tdp":48876000,"angsuran":10429000},{"tenor":48,"tdp":49636000,"angsuran":8441000},{"tenor":60,"tdp":50348000,"angsuran":7270000}]},{"model":"XL-7 MC Hybrid","type":"Alpha MT (2 Tone)","otr":327000000,"paket":[{"tenor":36,"tdp":49141000,"angsuran":10493000},{"tenor":48,"tdp":49905000,"angsuran":8493000},{"tenor":60,"tdp":50646000,"angsuran":7315000}]},{"model":"XL-7 MC Hybrid","type":"Alpha AT","otr":336500000,"paket":[{"tenor":36,"tdp":50400000,"angsuran":10798000},{"tenor":48,"tdp":51183000,"angsuran":8739000},{"tenor":60,"tdp":51918000,"angsuran":7527000}]},{"model":"XL-7 MC Hybrid","type":"Alpha AT (2 Tone)","otr":338500000,"paket":[{"tenor":36,"tdp":50665000,"angsuran":10862000},{"tenor":48,"tdp":51452000,"angsuran":8791000},{"tenor":60,"tdp":52191000,"angsuran":7571000}]},{"model":"XL-7 MC Hybrid Kuro","type":"Alpha AT","otr":340500000,"paket":[{"tenor":36,"tdp":50930000,"angsuran":10926000},{"tenor":48,"tdp":51722000,"angsuran":8843000},{"tenor":60,"tdp":52463000,"angsuran":7617000}]},{"model":"XL-7 MC Hybrid Kuro","type":"Alpha AT (2 Tone)","otr":342500000,"paket":[{"tenor":36,"tdp":51195000,"angsuran":10990000},{"tenor":48,"tdp":51991000,"angsuran":8895000},{"tenor":60,"tdp":52736000,"angsuran":7661000}]},{"model":"Grand Vitara MC","type":"GLX AT","otr":445000000,"paket":[{"tenor":36,"tdp":61888000,"angsuran":14279000},{"tenor":48,"tdp":62892000,"angsuran":11557000},{"tenor":60,"tdp":63830000,"angsuran":9954000}]},{"model":"Grand Vitara MC","type":"GLX AT (Two Tone)","otr":448000000,"paket":[{"tenor":36,"tdp":62266000,"angsuran":14376000},{"tenor":48,"tdp":63276000,"angsuran":11635000},{"tenor":60,"tdp":64220000,"angsuran":10021000}]},{"model":"Jimny 3 Door","type":"AT","otr":510400000,"paket":[{"tenor":36,"tdp":95136000,"angsuran":15468000},{"tenor":48,"tdp":96272000,"angsuran":12519000},{"tenor":60,"tdp":97334000,"angsuran":10783000}]},{"model":"Jimny 3 Door","type":"AT Two Tone","otr":513400000,"paket":[{"tenor":36,"tdp":95661000,"angsuran":15560000},{"tenor":48,"tdp":96802000,"angsuran":12593000},{"tenor":60,"tdp":97869000,"angsuran":10847000}]},{"model":"Jimny 5 Door","type":"AT","otr":526300000,"paket":[{"tenor":36,"tdp":97919000,"angsuran":15950000},{"tenor":48,"tdp":99087000,"angsuran":12909000},{"tenor":60,"tdp":100179000,"angsuran":11118000}]},{"model":"Jimny 5 Door","type":"AT Two Tone","otr":529300000,"paket":[{"tenor":36,"tdp":98444000,"angsuran":16041000},{"tenor":48,"tdp":99618000,"angsuran":12983000},{"tenor":60,"tdp":100714000,"angsuran":11182000}]},{"model":"New Carry PU","type":"FD","otr":187000000,"paket":[{"tenor":36,"tdp":57591000,"angsuran":5142000},{"tenor":48,"tdp":58652000,"angsuran":4194000},{"tenor":60,"tdp":59636000,"angsuran":3639000}]},{"model":"New Carry PU","type":"WD","otr":188100000,"paket":[{"tenor":36,"tdp":57898000,"angsuran":5172000},{"tenor":48,"tdp":58964000,"angsuran":4219000},{"tenor":60,"tdp":59955000,"angsuran":3660000}]},{"model":"New Carry PU","type":"FD AC PS","otr":195300000,"paket":[{"tenor":36,"tdp":59903000,"angsuran":5370000},{"tenor":48,"tdp":61011000,"angsuran":4380000},{"tenor":60,"tdp":62039000,"angsuran":3800000}]},{"model":"New Carry PU","type":"WD AC PS","otr":196200000,"paket":[{"tenor":36,"tdp":59654000,"angsuran":5394000},{"tenor":48,"tdp":60766000,"angsuran":4400000},{"tenor":60,"tdp":61799000,"angsuran":3818000}]}];
    const LEASING_DATA = { ADIRA: LEASING_ADIRA, MUF: LEASING_MUF };
    const ALL_LEASINGS = ['ADIRA', 'MUF', 'SUFI', 'BCA', 'BNI', 'BRI', 'MANDIRI'];
    const CATEGORIES_MAP = {
      "Commercial": ["New Carry PU", "APV", "New Carry Karoseri (DSP)", "New Carry Karoseri (Antika Raya)"],
      "Passenger": ["Fronx", "Fronx Hybrid", "XL-7 MC", "XL-7 MC Hybrid", "XL-7 MC Hybrid Kuro", "XL-7", "XL-7 Hybrid", "All New Ertiga", "All New Ertiga Hybrid", "S-Presso", "Jimny 3 Door", "Jimny 5 Door", "Grand Vitara MC", "e Vitara"],
      "LTD": ["New Carry PU LTD", "All New Ertiga LTD", "XL-7 MC LTD", "S-Presso Luxury"]
    };
    const pageHeaders = {
      dashboard: { icon:'🏠', title:'Suzuki Sales Hub', subtitle:'Internal Dealer Application' },
      pricelist: { icon:'📋', title:'Pricelist', subtitle:'Harga OTR Agustus 2026' },
      kredit: { icon:'💳', title:'Simulasi Kredit', subtitle:'Perbandingan & Kalkulator' },
      stock: { icon:'📦', title:'Stock Unit', subtitle:'Cek Ketersediaan Unit' },
      setting: { icon:'⚙️', title:'Setting', subtitle:'Versi 2.1' }
    };
    const $ = id => document.getElementById(id);

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
          { regex: /CARRY.*LTD/i, model: 'New Carry PU LTD', extract: s => s.replace(/.*CARRY.*LTD\s*/i, '') },
          { regex: /CARRY.*KAROSERI.*DSP/i, model: 'New Carry Karoseri (DSP)', extract: s => s.replace(/.*CARRY.*KAROSERI.*DSP\s*/i, '') },
          { regex: /CARRY.*KAROSERI.*ANTIKA/i, model: 'New Carry Karoseri (Antika Raya)', extract: s => s.replace(/.*CARRY.*KAROSERI.*ANTIKA\s*/i, '') },
          { regex: /CARRY/i, model: 'New Carry PU', extract: s => s.replace(/.*CARRY\s*/i, '').replace(/PUFD/, 'FD').replace(/PUWD/, 'WD') },
          { regex: /APV/i, model: 'APV', extract: s => s.replace(/.*APV\s*/i, '') },
          { regex: /ALL NEW ERTIGA.*LTD/i, model: 'All New Ertiga LTD', extract: s => s.replace(/.*ALL NEW ERTIGA.*LTD\s*/i, '') },
          { regex: /ALL NEW ERTIGA HYBRID/i, model: 'All New Ertiga Hybrid', extract: s => s.replace(/.*ALL NEW ERTIGA HYBRID\s*/i, '') },
          { regex: /ALL NEW ERTIGA/i, model: 'All New Ertiga', extract: s => { let t = s.replace(/.*ALL NEW ERTIGA\s*/i, ''); return t === 'GA MT' ? 'GA PW' : t; } },
          { regex: /XL-?7.*MC.*LTD/i, model: 'XL-7 MC LTD', extract: s => s.replace(/.*XL-?7\s*MC.*LTD\s*/i, '') },
          { regex: /XL-?7.*KURO/i, model: 'XL-7 MC Hybrid Kuro', extract: s => s.replace(/.*XL-?7\s*(MC\s*)?(HYBRID\s*)?(KURO\s*)?(EDITION\s*)?/i, '') },
          { regex: /(NEW\s*)?XL-?7.*HYBRID/i, model: 'XL-7 MC Hybrid', extract: s => s.replace(/.*(NEW\s*)?XL-?7\s*(MC\s*)?(HYBRID\s*)?/i, '') },
          { regex: /(NEW\s*)?XL-?7\s*(MC|ZETA|BETA|ALPHA)/i, model: 'XL-7 MC', extract: s => s.replace(/.*(NEW\s*)?XL-?7\s*(MC\s*)?/i, '') },
          { regex: /XL-?7\s*NEW\s*(BETA|ALPHA).*HYBRID/i, model: 'XL-7 Hybrid', extract: s => s.replace(/.*XL-?7\s*(HYBRID\s*)?/i, '') },
          { regex: /XL-?7\s*NEW/i, model: 'XL-7', extract: s => s.replace(/.*XL-?7\s*/i, '') },
          { regex: /FRONX\s*HYBRID/i, model: 'Fronx Hybrid', extract: s => s.replace(/.*FRONX\s*HYBRID\s*/i, '') },
          { regex: /FRONX/i, model: 'Fronx', extract: s => s.replace(/.*FRONX\s*/i, '') },
          { regex: /GRAND\s*VITARA/i, model: 'Grand Vitara MC', extract: s => s.replace(/.*GRAND\s*VITARA\s*(MC\s*)?/i, '').replace(/\bGX\b/gi, 'GLX') },
          { regex: /JIMNY\s*5\s*DOOR/i, model: 'Jimny 5 Door', extract: s => s.replace(/.*JIMNY\s*5\s*DOOR\s*/i, '') },
          { regex: /JIMNY/i, model: 'Jimny 3 Door', extract: s => s.replace(/.*JIMNY(\s*3\s*DOOR)?\s*/i, '') },
          { regex: /S[-\s]?PRESSO.*LUXURY/i, model: 'S-Presso Luxury', extract: s => s.replace(/.*S-?\s*PRESSO.*LUXURY\s*/i, '') },
          { regex: /S[-\s]?PRESSO/i, model: 'S-Presso', extract: s => s.replace(/.*S-?\s*PRESSO\s*/i, '') },
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
        // simpan history sebelum pindah (kecuali dashboard tidak perlu disimpan)
        if (this.state.page !== 'dashboard') {
          // hindari duplikasi berturut-turut
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
          // jika history kosong, arahkan ke dashboard (tapi jangan tambah history)
          this.state.page = 'dashboard';
        } else {
          this.state.page = this.state.history.pop();
        }
        // render halaman tanpa mengubah history lagi
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

    // Page Templates
    const pageTemplates = {
      dashboard: `
        <div class="menu-list">
          <div class="menu-card" onclick="APP.navigateTo('pricelist')"><div class="menu-icon blue">📋</div><div class="menu-info"><div class="menu-title">Pricelist</div><div class="menu-sub">Harga • Diskon • Cashback</div></div><span style="color:#94A3B8;">→</span></div>
          <div class="menu-card" onclick="APP.navigateTo('kredit', {tab:'manual'})"><div class="menu-icon green">💳</div><div class="menu-info"><div class="menu-title">Kredit</div><div class="menu-sub">Kalkulator Manual</div></div><span style="color:#94A3B8;">→</span></div>
          <div class="menu-card" onclick="APP.navigateTo('stock')"><div class="menu-icon orange">📦</div><div class="menu-info"><div class="menu-title">Stock</div><div class="menu-sub" id="dashboard-stock-sub">Upload Excel • Cek Unit</div></div><span style="color:#94A3B8;">→</span></div>
          <div class="menu-card" onclick="APP.navigateTo('setting')"><div class="menu-icon gray">⚙️</div><div class="menu-info"><div class="menu-title">Setting</div><div class="menu-sub">Tentang • Versi • Cache</div></div><span style="color:#94A3B8;">→</span></div>
        </div>
        <div id="dashboard-stats"></div>
        <div id="dashboard-sim-terakhir"></div>
        <div id="dashboard-fav"></div>`,
      pricelist: `
        <div class="card accent-blue">
          <label>Kategori</label><select id="cat-select" onchange="APP.loadModels()"><option value="">-- Pilih Kategori --</option></select>
          <label>Model</label><select id="model-select" onchange="APP.loadTypes()" disabled><option value="">-- Pilih Model --</option></select>
          <label>Type</label><select id="type-select" onchange="APP.showPriceAndStock()" disabled><option value="">-- Pilih Type --</option></select>
          <div id="nik-selector" class="hidden"><label>NIK</label><select id="nik-dropdown" onchange="APP.updatePriceDisplay()" disabled></select></div>
        </div>
        <div id="price-display" class="card accent-blue hidden"><div id="price-content"></div><div id="stock-summary-pricelist" style="margin-top:0.8rem;"></div><button class="btn-primary btn-sm" style="width:auto;padding:0.6rem 1rem;margin-top:0.8rem;" onclick="APP.goToKreditFromPricelist()">🧮 Simulasi Kredit</button></div>`,
      kredit: `
        <div class="tab-nav">
          <button class="tab-btn" id="tab-btn-paket" onclick="APP.switchKreditTab('paket')">Perbandingan Leasing</button>
          <button class="tab-btn" id="tab-btn-manual" onclick="APP.switchKreditTab('manual')">Kalkulator Manual</button>
        </div>
        <div class="tab-panel hidden" id="panel-paket">
          <div class="card accent-green">
            <label>Kategori</label><select id="kredit-cat-paket" onchange="APP.loadKreditModelsPaket()"><option value="">-- Pilih Kategori --</option></select>
            <label>Model</label><select id="kredit-model-paket" onchange="APP.loadKreditTypesPaket()" disabled><option value="">-- Pilih Model --</option></select>
            <label>Type</label><select id="kredit-type-paket" onchange="APP.onKreditTypeChangePaket()" disabled><option value="">-- Pilih Type --</option></select>
            <div id="kredit-nik-selector-paket" class="hidden"><label>NIK</label><select id="kredit-nik-dropdown-paket" onchange="APP.showAllLeasingResult()" disabled></select></div>
            <label>Tenor</label><select id="kredit-tenor-paket" onchange="APP.showAllLeasingResult()" disabled><option value="">-- Pilih Tenor --</option><option value="12">12 Bulan</option><option value="24">24 Bulan</option><option value="36">36 Bulan</option><option value="48">48 Bulan</option><option value="60">60 Bulan</option></select>
            <div id="kredit-sort-options" class="hidden" style="margin-top:0.5rem;display:flex;gap:0.5rem;"><button class="btn-outline btn-sm" onclick="APP.setSortMode('investasi')">📊 Investasi Terkecil</button><button class="btn-outline btn-sm" onclick="APP.setSortMode('dp')">💵 DP Terkecil</button></div>
          </div>
          <div id="kredit-result" class="hidden"></div>
        </div>
        <div class="tab-panel hidden" id="panel-manual">
          <div class="card accent-green">
            <label>Leasing</label><select id="manual-leasing-select" onchange="APP.onManualLeasingChange()"><option value="">-- Pilih Leasing --</option></select>
            <div id="manual-unit-section" class="hidden">
              <label>Kategori</label><select id="manual-cat" onchange="APP.loadManualModels()"><option value="">-- Pilih Kategori --</option></select>
              <label>Model</label><select id="manual-model" onchange="APP.loadManualTypes()" disabled><option value="">-- Pilih Model --</option></select>
              <label>Type</label><select id="manual-type" onchange="APP.onManualTypeChange()" disabled><option value="">-- Pilih Type --</option></select>
              <div id="manual-nik-selector" class="hidden"><label>NIK</label><select id="manual-nik-dropdown" onchange="APP.hitungManualPerLeasing()" disabled></select></div>
              <label>DP Bayar</label><input type="text" id="manual-dp" placeholder="Contoh: 10.000.000" oninput="this.value = APP.formatRupiahInput(this.value); APP.hitungManualPerLeasing();">
              <label>Tenor</label><select id="manual-tenor" onchange="APP.hitungManualPerLeasing()"><option value="">-- Pilih Tenor --</option><option value="12">12 Bulan</option><option value="24">24 Bulan</option><option value="36">36 Bulan</option><option value="48">48 Bulan</option><option value="60">60 Bulan</option></select>
              <div id="manual-result" style="margin-top:0.5rem;"></div>
            </div>
          </div>
        </div>`,
      stock: `
        <div class="card accent-orange">
          <div class="upload-zone" id="upload-zone" onclick="document.getElementById('stock-file').click()"><div style="font-size:1.8rem;">📄</div><p style="font-weight:600;">Upload Stock Dealer</p><p style="font-size:0.7rem;color:#64748B;">Klik atau tarik file Excel</p></div>
          <input type="file" id="stock-file" accept=".xlsx,.xls" onchange="APP.handleStockUpload(this)" style="display:none;">
          <div id="upload-status" style="margin-top:0.4rem;"></div>
          <div id="upload-progress-container" class="progress-container hidden">
            <div class="progress-steps" id="progress-steps"><div class="progress-step">Baca</div><div class="progress-step">Parse</div><div class="progress-step">Validasi</div><div class="progress-step">Import</div><div class="progress-step">Selesai</div></div>
            <div class="progress-bar"><div class="progress-fill" id="progress-fill"></div></div>
            <div id="progress-label" style="font-size:0.7rem;text-align:center;margin-top:0.2rem;"></div>
          </div>
          <div id="import-summary-container"></div>
          <button class="btn-outline btn-sm" style="margin-top:0.5rem;" onclick="APP.downloadTemplate()">📥 Download Template Excel</button>
        </div>
        <div id="stock-summary" class="hidden"></div>
        <div id="stock-filters" class="hidden card accent-orange">
          <div class="flex-row"><div><label>Model</label><select id="stock-model" onchange="APP.onStockModelChange()"></select></div><div><label>Type</label><select id="stock-type" onchange="APP.applyFilters()"></select></div></div>
          <div class="flex-row"><div><label>NIK</label><select id="stock-nik" onchange="APP.applyFilters()"><option value="">Semua</option><option value="25">NIK 25</option><option value="26">NIK 26</option></select></div><div><label>Warna</label><select id="stock-color" onchange="APP.applyFilters()"></select></div></div>
          <input type="search" id="stock-search" placeholder="🔍 Cari Model, No Rangka, Customer..." oninput="APP.applyFilters()">
          <button class="btn-outline btn-sm" style="margin-top:0.4rem;" onclick="APP.resetFilters()">↺ Reset Filter</button>
          <p style="margin-top:0.4rem;font-size:0.75rem;color:#64748B;" id="filter-count"></p>
        </div>
        <div id="stock-list" class="hidden"></div>`,
      setting: `<div class="card accent-gray" id="setting-info"></div>`
    };

    window.addEventListener('load', () => APP.init());
  </script>
</body>
</html>
