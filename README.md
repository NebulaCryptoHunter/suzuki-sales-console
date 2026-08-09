# Suzuki Sales Hub

Aplikasi internal dealer Suzuki berbasis HTML, CSS, dan JavaScript.

## Struktur Project

```
suzuki-sales-hub/
│
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── data/
│   ├── pricelist.json
│   ├── leasing-config.json
│   ├── adira.json
│   ├── muf.json
│   ├── sufi-dp20.json
│   ├── sufi-dp25.json
│   ├── sufi-dp30.json
│   └── sufi-subsidi.json
└── README.md
```

## Fitur

- Dashboard
- Pricelist
- Simulasi Kredit
- Stock Upload Excel
- Setting

## Teknologi

- HTML5
- CSS3
- JavaScript (Vanilla)
- SheetJS (XLSX)
- GitHub
- Cloudflare Pages

## Cara Update Bulanan

Update file pada folder `data/`:

- pricelist.json
- leasing-config.json
- adira.json
- muf.json
- sufi-dp20.json
- sufi-dp25.json
- sufi-dp30.json
- sufi-subsidi.json

Tidak perlu mengubah:

- index.html
- css/style.css
- js/app.js

## Stock

Stock diimpor melalui file Excel dan diproses langsung di browser. Data stok tidak disimpan di repository.

## Version

v2.1

## Developer

Heru Prasetyo
PT. Sun Motor Indosentra Trada
Suzuki Semarang
