// Palet Okabe-Ito (ramah buta warna)
const WARNA = ["#0072B2","#E69F00","#009E73","#D55E00","#CC79A7","#56B4E9","#F0E442"];
const rp = n => "Rp " + Math.round(n).toLocaleString("id-ID");
const $ = id => document.getElementById(id);
let data = [], info = {}, cKat, cTren;

async function init() {
  try {
    [data, info] = await Promise.all([
      fetch("data/expenses.json").then(r => r.json()),
      fetch("data/insights.json").then(r => r.json()),
    ]);
  } catch (e) {
    document.querySelector("main").innerHTML = "<p>Gagal memuat data. Jalankan lewat server (mis. GitHub Pages atau <code>python -m http.server</code>).</p>";
    return;
  }
  const bulan = [...new Set(data.map(d => d.bulan))].sort();
  const kat = [...new Set(data.map(d => d.kategori))].sort();
  $("fBulan").innerHTML = '<option value="all">Semua bulan</option>' + bulan.map(b => `<option>${b}</option>`).join("");
  $("fKat").innerHTML = '<option value="all">Semua kategori</option>' + kat.map(k => `<option>${k}</option>`).join("");
  $("fBudget").value = localStorage.getItem("budget") || 2500000;
  ["fBulan","fKat","fBudget"].forEach(id => $(id).addEventListener("input", render));
  $("btnReset").addEventListener("click", () => { $("fBulan").value = "all"; $("fKat").value = "all"; $("fBudget").value = 2500000; render(); });
  renderInsights();
  render();
}

function sumBy(rows, key) {
  const m = {}; rows.forEach(r => m[r[key]] = (m[r[key]] || 0) + r.jumlah); return m;
}

function render() {
  const b = $("fBulan").value, k = $("fKat").value, budget = +$("fBudget").value || 0;
  try { localStorage.setItem("budget", budget); } catch (e) {}
  const rows = data.filter(d => (b === "all" || d.bulan === b) && (k === "all" || d.kategori === k));
  const total = rows.reduce((s, r) => s + r.jumlah, 0);
  const hari = new Set(rows.map(r => r.tanggal)).size || 1;
  const perKat = sumBy(rows, "kategori");
  const top = Object.entries(perKat).sort((a, b) => b[1] - a[1])[0];

  $("kTotal").textContent = rp(total);
  $("kHarian").textContent = rp(total / hari);
  $("kTop").textContent = top ? top[0] : "-";

  // Budget dibandingkan terhadap semua kategori pada bulan terpilih
  const bulanRows = data.filter(d => b === "all" || d.bulan === b);
  const nBulan = b === "all" ? new Set(data.map(d => d.bulan)).size : 1;
  const pakai = bulanRows.reduce((s, r) => s + r.jumlah, 0), batas = budget * nBulan;
  const persen = batas ? pakai / batas * 100 : 0;
  const bar = $("bBar");
  bar.style.width = Math.min(persen, 100) + "%";
  bar.style.background = persen > 100 ? "var(--bad)" : persen > 80 ? "var(--warn)" : "var(--ok)";
  $("kBudget").textContent = persen > 100 ? `⚠️ Lewat ${rp(pakai - batas)}` : persen > 80 ? `⚡ ${persen.toFixed(0)}% terpakai` : `✅ ${persen.toFixed(0)}% terpakai`;

  // Grafik kategori
  const ent = Object.entries(perKat).sort((a, b) => b[1] - a[1]);
  cKat && cKat.destroy();
  cKat = new Chart($("cKat"), { type: "bar",
    data: { labels: ent.map(e => e[0]), datasets: [{ data: ent.map(e => e[1]), backgroundColor: WARNA }] },
    options: { indexAxis: "y", plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => rp(c.parsed.x) } } },
      scales: { x: { ticks: { callback: v => (v / 1000) + "rb" } } } } });

  // Grafik tren (ikut filter kategori, semua bulan)
  const tren = sumBy(data.filter(d => k === "all" || d.kategori === k), "bulan");
  const bl = Object.keys(tren).sort();
  cTren && cTren.destroy();
  cTren = new Chart($("cTren"), { type: "line",
    data: { labels: bl, datasets: [{ data: bl.map(x => tren[x]), borderColor: WARNA[0], backgroundColor: WARNA[0] + "33", fill: true, tension: .3, pointRadius: 5 }] },
    options: { plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => rp(c.parsed.y) } } },
      scales: { y: { beginAtZero: true, ticks: { callback: v => (v / 1000000).toFixed(1) + " jt" } } } } });

  // Tabel transaksi terbaru
  $("tbl").innerHTML = [...rows].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 10)
    .map(r => `<tr><td>${r.tanggal}</td><td>${r.kategori}</td><td>${r.deskripsi}</td><td>${rp(r.jumlah)}</td></tr>`).join("");
}

function renderInsights() {
  const li = [
    `Tren pengeluaran <b>${info.arah_tren}</b> sekitar ${rp(Math.abs(info.perubahan_per_bulan))} per bulan.`,
    `Prediksi pengeluaran bulan depan: <b>${rp(info.prediksi_bulan_depan)}</b>.`,
    `Hari paling boros: <b>${info.hari_paling_boros}</b>.`,
    ...info.anomali.slice(0, 3).map(a => `Transaksi tak biasa: ${a.deskripsi} (${a.kategori}) ${rp(a.jumlah)} pada ${a.tanggal}.`),
  ];
  $("insights").innerHTML = li.map(t => `<li>${t}</li>`).join("");
}
init();
