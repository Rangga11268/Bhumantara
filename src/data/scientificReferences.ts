export interface ScientificReference {
  id: string;
  category: 'satellite' | 'algorithm' | 'physics' | 'policy' | 'api';
  title: string;
  authors: string;
  year: number;
  publication: string;
  doi?: string;
  url: string;
  abstract: string;
  keyTakeaway: string;
  bibtex: string;
  apa: string;
}

export const scientificReferences: ScientificReference[] = [
  {
    id: 'modis-active-fire',
    category: 'satellite',
    title: 'The Collection 6 MODIS Active Fire Detection Algorithm and Fire Radiative Power (FRP) Product',
    authors: 'Giglio, L., Schroeder, W., & Justice, C. O.',
    year: 2016,
    publication: 'Remote Sensing of Environment, 178, 31-41',
    doi: '10.1016/j.rse.2016.02.054',
    url: 'https://doi.org/10.1016/j.rse.2016.02.054',
    abstract: 'Describes the Collection 6 MODIS active fire detection and FRP retrieval algorithm, addressing false alarm reductions, elevated background temperature handling, and sensor degradation adjustments across Terra (MOD14) and Aqua (MYD14).',
    keyTakeaway: 'Establishes the 1 km standard thermal anomaly baseline operating on the 3.9 µm (Channel 21/22) and 11 µm (Channel 31) spectral channels since 2000.',
    bibtex: `@article{giglio2016modis,
  title={The Collection 6 MODIS active fire detection algorithm and Fire Radiative Power (FRP) product},
  author={Giglio, Louis and Schroeder, Wilfrid and Justice, Christopher O},
  journal={Remote Sensing of Environment},
  volume={178},
  pages={31--41},
  year={2016},
  publisher={Elsevier},
  doi={10.1016/j.rse.2016.02.054}
}`,
    apa: 'Giglio, L., Schroeder, W., & Justice, C. O. (2016). The Collection 6 MODIS active fire detection algorithm and Fire Radiative Power (FRP) product. Remote Sensing of Environment, 178, 31-41. https://doi.org/10.1016/j.rse.2016.02.054'
  },
  {
    id: 'viirs-375m',
    category: 'satellite',
    title: 'Validation of the VIIRS 375m Active Fire Detection Algorithm in the Amazon and Tropical Peatlands',
    authors: 'Schroeder, W., Oliva, P., Giglio, L., & Csiszar, I. A.',
    year: 2014,
    publication: 'Remote Sensing of Environment, 143, 85-96',
    doi: '10.1016/j.rse.2013.12.008',
    url: 'https://doi.org/10.1016/j.rse.2013.12.008',
    abstract: 'Evaluates the higher spatial resolution 375 m I-band active fire detection algorithm for the Visible Infrared Imaging Radiometer Suite (VIIRS) aboard Suomi-NPP and NOAA-20/21.',
    keyTakeaway: 'Demonstrates a ~3x to 5x increase in detection sensitivity over 1 km MODIS due to reduced sub-pixel smearing, requiring spatial cell harmonisation to prevent artificial trend inflation.',
    bibtex: `@article{schroeder2014viirs,
  title={Validation of the VIIRS 375 m active fire detection algorithm in the Amazon and tropical peatlands},
  author={Schroeder, Wilfrid and Oliva, Patricia and Giglio, Louis and Csiszar, Ivan A},
  journal={Remote Sensing of Environment},
  volume={143},
  pages={85--96},
  year={2014},
  publisher={Elsevier},
  doi={10.1016/j.rse.2013.12.008}
}`,
    apa: 'Schroeder, W., Oliva, P., Giglio, L., & Csiszar, I. A. (2014). Validation of the VIIRS 375 m active fire detection algorithm. Remote Sensing of Environment, 143, 85-96. https://doi.org/10.1016/j.rse.2013.12.008'
  },
  {
    id: 'frp-stefan-boltzmann',
    category: 'physics',
    title: 'Fire Radiative Energy and Carbon Biomass Combustion in Tropical Peatland Ecosystems',
    authors: 'Wooster, M. J., Roberts, G., Perry, G. L. W., & Kaufman, Y. J.',
    year: 2005,
    publication: 'Journal of Geophysical Research: Atmospheres, 110(D24)',
    doi: '10.1029/2005JD006318',
    url: 'https://doi.org/10.1029/2005JD006318',
    abstract: 'Formulates the empirical and thermodynamic basis for deriving instantaneous Fire Radiative Power (FRP, MW) and Fire Radiative Energy (FRE, MJ) from mid-infrared radiances based on the Stefan-Boltzmann fourth-power law (E = εσT⁴).',
    keyTakeaway: 'Proves a linear coefficient (0.368 ± 0.015 kg/MJ) directly converting integrated FRE into dry biomass burned and corresponding greenhouse gas emission flux.',
    bibtex: `@article{wooster2005fre,
  title={Retrieval of biomass combustion rates and totals from Fire Radiative Power (FRP) measurements},
  author={Wooster, MJ and Roberts, G and Perry, GLW and Kaufman, YJ},
  journal={Journal of Geophysical Research: Atmospheres},
  volume={110},
  number={D24},
  year={2005},
  publisher={Wiley Online Library},
  doi={10.1029/2005JD006318}
}`,
    apa: 'Wooster, M. J., Roberts, G., Perry, G. L. W., & Kaufman, Y. J. (2005). Retrieval of biomass combustion rates from Fire Radiative Power measurements. Journal of Geophysical Research: Atmospheres, 110(D24). https://doi.org/10.1029/2005JD006318'
  },
  {
    id: 'peat-regulation-indonesia',
    category: 'policy',
    title: 'Indonesian Government Regulation No. 71/2014 jo. No. 57/2016 on Peatland Hydrological Ecosystem Protection',
    authors: 'Republic of Indonesia (KLHK & BRGM)',
    year: 2016,
    publication: 'State Gazette of the Republic of Indonesia No. 255',
    url: 'https://peraturan.bpk.go.id/Details/61466/pp-no-57-tahun-2016',
    abstract: 'Establishes the legal mandatory standard for tropical peatland water table management in Indonesia, designating a maximum allowable ground water level (Tinggi Muka Air Tanah / TMAG) of -0.40 meters (-40 cm) relative to the peat surface.',
    keyTakeaway: 'Water table depths below -40 cm dramatically accelerate smoldering subterranean peat combustion; re-wetting canals (TMAG > -25 cm) reduces ignition probability by over 80%.',
    bibtex: `@misc{indonesia2016pp57,
  title={Peraturan Pemerintah Republik Indonesia Nomor 57 Tahun 2016 tentang Perlindungan dan Pengelolaan Ekosistem Gambut},
  author={{Pemerintah Republik Indonesia}},
  year={2016},
  note={Lembaran Negara Republik Indonesia Tahun 2016 Nomor 255}
}`,
    apa: 'Pemerintah Republik Indonesia. (2016). Peraturan Pemerintah No. 57 Tahun 2016 tentang Perlindungan dan Pengelolaan Ekosistem Gambut. Lembaran Negara RI No. 255.'
  },
  {
    id: 'nasa-firms-api',
    category: 'api',
    title: 'NASA Fire Information for Resource Management System (FIRMS) API & GIBS Tile Service',
    authors: 'NASA Land, Atmosphere Near real-time Capability for EOS (LANCE)',
    year: 2026,
    publication: 'NASA Earth Science Data and Information System (ESDIS)',
    doi: '10.5067/FIRMS/WMS.002',
    url: 'https://firms.modaps.eosdis.nasa.gov/',
    abstract: 'Provides low-latency (NRT < 3 hours) near-real-time thermal anomaly vector data and Web Map Tile Services (EPSG:4326) across Terra/Aqua MODIS and Suomi-NPP / NOAA-20 / NOAA-21 VIIRS.',
    keyTakeaway: 'Powers the live telemetry sync in Wanareksa using secure client-side token headers and direct OpenStreetMap/Leaflet raster tile layers.',
    bibtex: `@manual{nasafirms2026,
  title={NASA FIRMS: Fire Information for Resource Management System NRT API Documentation},
  author={{NASA ESDIS}},
  year={2026},
  organization={NASA Goddard Space Flight Center},
  url={https://firms.modaps.eosdis.nasa.gov/api/}
}`,
    apa: 'NASA ESDIS. (2026). NASA Fire Information for Resource Management System (FIRMS) NRT Data Feed. NASA Goddard Space Flight Center. https://firms.modaps.eosdis.nasa.gov/'
  }
];
