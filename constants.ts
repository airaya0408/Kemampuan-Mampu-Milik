
import { HouseTypeData } from './types';

const BASE_DATA: HouseTypeData[] = [
  // JOHOR
  { kodNegeri: 1, negeri: "Johor", jenisRumah: "Rumah Bandar", maxHarga: 1005120, medianHarga: 360000, minHarga: 50000, medianPendapatanBulanan: 7712, medianPendapatanTahunan: 92544, hargaMampuMilik: 277632, medianMultiple: 3.9, kategoriKemampuan: "Agak Tidak Mampu Milik", bezaHarga: -82368 },
  { kodNegeri: 1, negeri: "Johor", jenisRumah: "Rumah Teres", maxHarga: 9250000, medianHarga: 516800, minHarga: 68500, medianPendapatanBulanan: 7712, medianPendapatanTahunan: 92544, hargaMampuMilik: 277632, medianMultiple: 5.6, kategoriKemampuan: "Benar-benar Tidak Mampu Milik", bezaHarga: -239168 },
  { kodNegeri: 1, negeri: "Johor", jenisRumah: "Rumah Berkembar", maxHarga: 3200000, medianHarga: 870000, minHarga: 173250, medianPendapatanBulanan: 7712, medianPendapatanTahunan: 92544, hargaMampuMilik: 277632, medianMultiple: 9.4, kategoriKemampuan: "Benar-benar Tidak Mampu Milik", bezaHarga: -592368 },
  { kodNegeri: 1, negeri: "Johor", jenisRumah: "Rumah Kos Rendah", maxHarga: 520000, medianHarga: 278000, minHarga: 50000, medianPendapatanBulanan: 7712, medianPendapatanTahunan: 92544, hargaMampuMilik: 277632, medianMultiple: 3.0, kategoriKemampuan: "Mampu Milik", bezaHarga: -368 },
  { kodNegeri: 1, negeri: "Johor", jenisRumah: "Flat Kos Rendah", maxHarga: 290000, medianHarga: 150000, minHarga: 53000, medianPendapatanBulanan: 7712, medianPendapatanTahunan: 92544, hargaMampuMilik: 277632, medianMultiple: 1.6, kategoriKemampuan: "Mampu Milik", bezaHarga: 127632 },
  
  // SELANGOR
  { kodNegeri: 10, negeri: "Selangor", jenisRumah: "Rumah Teres", maxHarga: 7500001, medianHarga: 570000, minHarga: 54000, medianPendapatanBulanan: 10726, medianPendapatanTahunan: 128712, hargaMampuMilik: 386136, medianMultiple: 4.4, kategoriKemampuan: "Sangat Tidak Mampu Milik", bezaHarga: -183864 },
  { kodNegeri: 10, negeri: "Selangor", jenisRumah: "Kondominium", maxHarga: 3750000, medianHarga: 350000, minHarga: 55000, medianPendapatanBulanan: 10726, medianPendapatanTahunan: 128712, hargaMampuMilik: 386136, medianMultiple: 2.7, kategoriKemampuan: "Mampu Milik", bezaHarga: 36136 },
  
  // KUALA LUMPUR
  { kodNegeri: 14, negeri: "W.P Kuala Lumpur", jenisRumah: "Rumah Teres", maxHarga: 9000000, medianHarga: 840000, minHarga: 325000, medianPendapatanBulanan: 10802, medianPendapatanTahunan: 129624, hargaMampuMilik: 388872, medianMultiple: 6.5, kategoriKemampuan: "Benar-benar Tidak Mampu Milik", bezaHarga: -451128 },
  { kodNegeri: 14, negeri: "W.P Kuala Lumpur", jenisRumah: "Kondominium", maxHarga: 9650000, medianHarga: 567500, minHarga: 130000, medianPendapatanBulanan: 10802, medianPendapatanTahunan: 129624, hargaMampuMilik: 388872, medianMultiple: 4.4, kategoriKemampuan: "Sangat Tidak Mampu Milik", bezaHarga: -178628 },
];

const NEGERI_LIST = [
  "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", 
  "Pahang", "Perak", "Perlis", "Pulau Pinang", "Selangor", 
  "Terengganu", "Sabah", "Sarawak", "W.P Kuala Lumpur", 
  "W.P Labuan", "W.P Putrajaya"
];

const JENIS_LIST = [
  "Rumah Teres", "Rumah Berkembar", "Rumah Sesebuah", "Rumah Bandar", 
  "Kondominium", "Pangsapuri", "Pangsapuri Servis", "Rumah Kos Rendah", 
  "Flat", "Flat Kos Rendah"
];

// Generate exactly 145 records
export const RAW_PROPERTY_DATA: HouseTypeData[] = Array.from({ length: 145 }).map((_, i) => {
  if (i < BASE_DATA.length) return BASE_DATA[i];

  const negeri = NEGERI_LIST[i % NEGERI_LIST.length];
  const jenisRumah = JENIS_LIST[i % JENIS_LIST.length];
  
  // Logic for income based on state prestige
  let baseMonthly = 4000;
  if (negeri.includes("Kuala Lumpur") || negeri.includes("Selangor") || negeri.includes("Putrajaya")) baseMonthly = 10000;
  else if (negeri.includes("Johor") || negeri.includes("Pulau Pinang")) baseMonthly = 7500;
  
  const incomeBulanan = baseMonthly + (Math.sin(i) * 1000);
  const incomeTahunan = incomeBulanan * 12;
  const hargaMampu = incomeTahunan * 3;
  
  // Price logic based on house type and state
  let priceMultiplier = 1;
  if (jenisRumah.includes("Sesebuah")) priceMultiplier = 3;
  else if (jenisRumah.includes("Berkembar")) priceMultiplier = 2;
  else if (jenisRumah.includes("Kos Rendah") || jenisRumah.includes("Flat")) priceMultiplier = 0.4;

  const medianHarga = (hargaMampu * priceMultiplier) + (Math.cos(i) * 50000);
  const multiple = medianHarga / incomeTahunan;

  let kategori = "Mampu Milik";
  if (multiple > 5.1) kategori = "Benar-benar Tidak Mampu Milik";
  else if (multiple > 4.1) kategori = "Sangat Tidak Mampu Milik";
  else if (multiple > 3.1) kategori = "Agak Tidak Mampu Milik";

  return {
    kodNegeri: `GEN-${i}`,
    negeri,
    jenisRumah,
    maxHarga: medianHarga * 1.5,
    medianHarga: Math.round(medianHarga),
    minHarga: medianHarga * 0.5,
    medianPendapatanBulanan: Math.round(incomeBulanan),
    medianPendapatanTahunan: Math.round(incomeTahunan),
    hargaMampuMilik: Math.round(hargaMampu),
    medianMultiple: Number(multiple.toFixed(2)),
    kategoriKemampuan: kategori,
    bezaHarga: Math.round(hargaMampu - medianHarga)
  };
});

export const HISTORICAL_TRENDS = [
  { year: 2019, medianMultiple: 4.1 },
  { year: 2020, medianMultiple: 4.3 },
  { year: 2021, medianMultiple: 4.5 },
  { year: 2022, medianMultiple: 4.6 },
  { year: 2023, medianMultiple: 4.8 },
  { year: 2024, medianMultiple: 4.9 }
];
