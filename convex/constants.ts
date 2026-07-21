export const MATERIAL_UNITS = [
  // Hitung satuan (countable/discrete)
  { value: "lembar", label: "Lembar" }, // keramik, triplek, dll
  { value: "batang", label: "Batang" }, // besi, kayu
  { value: "buah", label: "Buah" }, // umum, per-item
  { value: "pcs", label: "Pcs" }, // umum, per-item (alternatif "buah")
  { value: "unit", label: "Unit" }, // alat, perangkat
  { value: "set", label: "Set" }, // paket alat/fitting

  // Panjang
  { value: "meter", label: "Meter" }, // kabel, pipa refrigerant, pipa PVC

  // Berat
  { value: "kg", label: "Kilogram" }, // semen curah, paku, dll
  { value: "ton", label: "Ton" }, // material alam dalam jumlah besar

  // Volume
  { value: "liter", label: "Liter" }, // cat, thinner
  { value: "m3", label: "Meter Kubik" }, // pasir, batu split, kerikil

  // Kemasan umum (dipakai sebagai base unit itu sendiri, bukan konversi)
  { value: "sak", label: "Sak" }, // semen
  { value: "dus", label: "Dus" }, // ubin/keramik kalau mau dihitung per dus langsung
  { value: "pail", label: "Pail" }, // cat
  { value: "kaleng", label: "Kaleng" }, // cat, thinner ukuran kecil
  { value: "roll", label: "Roll" }, // kabel/pipa kalau mau dihitung per roll langsung
  { value: "karung", label: "Karung" }, // pasir/split kemasan kecil

  // Volume angkut (material alam)
  { value: "truk", label: "Truk" }, // pasir/batu per rit/truk
  { value: "rit", label: "Rit" }, // istilah lokal utk 1x angkut truk

  // Lain-lain
  { value: "lonjor", label: "Lonjor" }, // besi/pipa per batang panjang standar
] as const;

export type MaterialUnit = (typeof MATERIAL_UNITS)[number]["value"];
