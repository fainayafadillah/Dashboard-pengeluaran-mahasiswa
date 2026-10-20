"""Membuat data pengeluaran SINTETIS mahasiswa (Mei-Okt 2026)."""
import csv, random
from datetime import date, timedelta
from pathlib import Path

random.seed(42)
ROOT = Path(__file__).resolve().parent.parent
# kategori: (peluang per hari, rentang nominal, deskripsi)
KAT = {
    "Makanan":   (0.95, (10000, 35000), ["Makan siang", "Makan malam", "Sarapan", "Kopi"]),
    "Transport": (0.55, (8000, 30000),  ["Bensin", "Ojek online", "Angkot"]),
    "Hiburan":   (0.15, (20000, 120000), ["Nonton", "Game", "Nongkrong"]),
    "Belanja":   (0.10, (30000, 200000), ["Kebutuhan harian", "Pakaian", "Skincare"]),
    "Pendidikan": (0.12, (10000, 150000), ["Fotokopi", "Buku", "Kuota internet"]),
    "Kesehatan": (0.03, (20000, 150000), ["Obat", "Vitamin"]),
}
rows, d = [], date(2026, 5, 1)
while d <= date(2026, 10, 19):
    if d.day == 1:
        rows.append([d, "Kos/Tempat tinggal", "Bayar kos", 600000])
    for k, (p, (lo, hi), ds) in KAT.items():
        if random.random() < p:
            amt = round(random.randint(lo, hi), -3)
            if k == "Belanja" and random.random() < 0.03: amt *= 4  # pencilan
            rows.append([d, k, random.choice(ds), amt])
    d += timedelta(days=1)
with open(ROOT / "data" / "expenses.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f); w.writerow(["tanggal", "kategori", "deskripsi", "jumlah"]); w.writerows(rows)
print(len(rows), "transaksi dibuat")
