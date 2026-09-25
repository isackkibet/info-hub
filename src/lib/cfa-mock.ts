export const cfaSites = [
  {
    name: "Site A, Kapsabet Forest",
    areaHectares: 4.2,
    totalTrees: 12400,
    species: 9,
    planted: 9800,
    surviving: 8650,
  },
  {
    name: "Site B, Kaptagat Riparian Buffer",
    areaHectares: 2.6,
    totalTrees: 6100,
    species: 6,
    planted: 5200,
    surviving: 4700,
  },
  {
    name: "Nursery C",
    areaHectares: 0.4,
    totalTrees: 15800,
    species: 12,
    planted: 0,
    surviving: 15800,
  },
];

export const cfaPipeline = [
  { stage: "Pending", count: 14 },
  { stage: "Clean", count: 22 },
  { stage: "Verified", count: 96 },
  { stage: "Anchored", count: 81 },
];

export const cfaSpeciesSample = [
  { name: "Prunus africana", classification: "Indigenous", purpose: "Medicinal" },
  { name: "Vitex keniensis", classification: "Indigenous", purpose: "Timber" },
  { name: "Grevillea robusta", classification: "Exotic", purpose: "Fodder" },
  { name: "Dombeya torrida", classification: "Indigenous", purpose: "Riparian Buffer" },
];

export const cfaTotals = {
  activeSites: cfaSites.length,
  totalTrees: cfaSites.reduce((sum, s) => sum + s.totalTrees, 0),
  surviving: cfaSites.reduce((sum, s) => sum + s.surviving, 0),
  speciesCount: 21,
};
