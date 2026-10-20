# 💸 Dashboard Pengeluaran Mahasiswa

Dashboard interaktif untuk memantau pengeluaran mahasiswa. Tugas mata kuliah Interaksi Manusia & Komputer (IMK) – Visualisasi Data.

## Struktur Repository
```
dashboard-pengeluaran-mahasiswa/
├── index.html            # halaman dashboard
├── css/style.css         # tampilan (light/dark, responsif)
├── js/app.js             # logika filter, KPI, grafik (Chart.js)
├── data/                 # expenses.csv, expenses.json, insights.json
├── analysis/
│   ├── generate_data.py  # membuat data sintetis
│   └── analyze.py        # analisis: tren, prediksi, anomali
├── .github/workflows/deploy.yml  # auto-deploy GitHub Pages
├── requirements.txt
└── README.md
```

## Cara Menjalankan
```bash
pip install -r requirements.txt
python analysis/generate_data.py   # opsional: buat ulang data
python analysis/analyze.py         # hasilkan expenses.json & insights.json
python -m http.server 8000         # buka http://localhost:8000
```

## Hosting di GitHub Pages
1. Buat repo baru bernama `dashboard-pengeluaran-mahasiswa`, lalu push semua file.
2. Buka **Settings → Pages → Source: GitHub Actions**.
3. Push ke branch `main`; situs aktif di `https://USERNAME.github.io/dashboard-pengeluaran-mahasiswa/`.

## Penerapan Materi IMK
- **Persona**: Rani, mahasiswa semester 5 dengan uang saku terbatas; ingin tahu pengeluaran terbesar dan tidak melewati budget.
- **Visibility & Feedback**: KPI di atas, progress bar budget berubah warna (hijau/kuning/merah), grafik langsung update saat filter diganti.
- **Constraints & Consistency**: filter berupa dropdown (tidak bisa salah input), warna kategori konsisten di semua grafik.
- **Gestalt**: proximity (kartu terkelompok), similarity (warna per kategori), enclosure (kartu berbingkai).
- **Beban kognitif**: 4 KPI utama (dalam batas 7±2 chunk), grafik sederhana.
- **Aksesibilitas (POUR)**: palet Okabe-Ito ramah buta warna, `aria-label` pada grafik, skip link, fokus keyboard terlihat, kontras baik, mode gelap.
- **Etika**: sumbu grafik mulai dari nol, tidak ada manipulasi skala.
