
export interface HouseTypeData {
  kodNegeri: number | string;
  negeri: string;
  jenisRumah: string;
  maxHarga: number;
  medianHarga: number;
  minHarga: number;
  medianPendapatanBulanan: number;
  medianPendapatanTahunan: number;
  hargaMampuMilik: number;
  medianMultiple: number;
  kategoriKemampuan: string;
  bezaHarga: number;
}

export interface StateSummary {
  negeri: string;
  medianPendapatanBulanan: number;
  purataMultiple: number;
  bilanganJenisRumah: number;
}

/**
 * AffordabilityStatus enum used by the StateCard component to categorize housing markets.
 */
export enum AffordabilityStatus {
  AFFORDABLE = 'Mampu Milik',
  MODERATELY_UNAFFORDABLE = 'Agak Tidak Mampu Milik',
  SERIOUSLY_UNAFFORDABLE = 'Sangat Tidak Mampu Milik',
  SEVERELY_UNAFFORDABLE = 'Benar-benar Tidak Mampu Milik',
}

/**
 * StateData interface required by the StateCard component.
 */
export interface StateData {
  name: string;
  medianHousePrice: number;
  medianMonthlyIncome: number;
}
