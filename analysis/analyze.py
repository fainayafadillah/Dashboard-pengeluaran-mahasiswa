"""Analisis mendalam: tren, prediksi, pola hari, dan deteksi anomali (z-score)."""
import json
from pathlib import Path
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
df = pd.read_csv(ROOT / "data" / "expenses.csv", parse_dates=["tanggal"])
df["bulan"] = df["tanggal"].dt.strftime("%Y-%m")

# 1. Tren bulanan + prediksi bulan depan (regresi linear sederhana)
monthly = df.groupby("bulan")["jumlah"].sum()
slope, intercept = np.polyfit(np.arange(len(monthly)), monthly.values, 1)
forecast = float(slope * len(monthly) + intercept)

# 2. Hari paling boros
hari = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]
per_hari = df.groupby(df["tanggal"].dt.dayofweek)["jumlah"].mean()
hari_boros = hari[int(per_hari.idxmax())]

# 3. Anomali: transaksi jauh di atas rata-rata kategorinya
g = df.groupby("kategori")["jumlah"]
df["z"] = (df["jumlah"] - g.transform("mean")) / g.transform("std").replace(0, np.nan)
anom = df[df["z"] > 2.5].sort_values("z", ascending=False).head(5)

# 4. Porsi kategori
porsi = (df.groupby("kategori")["jumlah"].sum() / df["jumlah"].sum() * 100).round(1)

insights = {
    "prediksi_bulan_depan": round(forecast),
    "arah_tren": "naik" if slope > 0 else "turun",
    "perubahan_per_bulan": round(float(slope)),
    "hari_paling_boros": hari_boros,
    "porsi_kategori": porsi.to_dict(),
    "anomali": [
        {"tanggal": r.tanggal.strftime("%Y-%m-%d"), "kategori": r.kategori,
         "deskripsi": r.deskripsi, "jumlah": int(r.jumlah)} for r in anom.itertuples()
    ],
}
out = df.assign(tanggal=df["tanggal"].dt.strftime("%Y-%m-%d"))[["tanggal", "bulan", "kategori", "deskripsi", "jumlah"]]
out.to_json(ROOT / "data" / "expenses.json", orient="records", force_ascii=False)
(ROOT / "data" / "insights.json").write_text(json.dumps(insights, ensure_ascii=False, indent=2), encoding="utf-8")
print("Selesai. Prediksi bulan depan:", insights["prediksi_bulan_depan"])
