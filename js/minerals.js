/* Mineral data — all properties are stored as language-neutral keys; translations live in i18n.js.
   Fields: id, cls (class), f (formula), h [min,max] Mohs, d [min,max] g/cm³, st streak, lu luster, c colours,
   cl cleavage, sys crystal system, mag 0/1/2 (none/weak/strong), hcl 0/1/2 (none/only powder or warm/fizzes strongly),
   oc occurrence, lk look-alikes, p commonness 1–5, sp special properties, use uses, sf safety {lvl:'red'|'amber', k}, v variety of, kid (shown in kids' quiz) */
'use strict';
window.MI = window.MI || {};
(function () {
  const L = [];
  const s = x => x ? x.split(' ') : [];
  function R(id, cls, f, h, d, st, lu, c, cl, sys, mag, hcl, oc, lk, p, x) {
    x = x || {};
    L.push({ id, cls, f, h, d, st: s(st), lu: s(lu), c: s(c), cl: s(cl), sys, mag: Array.isArray(mag) ? mag : [mag], hcl, oc: s(oc), lk: s(lk), p,
      sp: s(x.sp), use: s(x.use), sf: x.sf || null, v: x.v || null, kid: !!x.kid });
  }
  const RED = k => ({ lvl: 'red', k }), AMB = k => ({ lvl: 'amber', k });

  // ---------- native elements ----------
  R('gold', 'native', 'Au', [2.5, 3], [15.5, 19.3], 'yellow', 'metallic', 'gold', 'none', 'cubic', 0, 0, 'hydrothermal placer', 'pyrite chalcopyrite', 2, { sp: 'malleable very_heavy', use: 'jewelry electronics money', kid: 1 });
  R('silver', 'native', 'Ag', [2.5, 3], [10.1, 11.1], 'grey', 'metallic', 'silver grey black', 'none', 'cubic', 0, 0, 'hydrothermal oxidized', 'galena arsenopyrite', 1, { sp: 'malleable tarnishes very_heavy', use: 'jewelry electronics money', kid: 1 });
  R('copper', 'native', 'Cu', [2.5, 3], [8.9, 8.95], 'redbrown', 'metallic', 'copper brown green', 'none', 'cubic', 0, 0, 'volcanic oxidized', 'bornite cuprite', 2, { sp: 'malleable tarnishes', use: 'wires electronics money', kid: 1 });
  R('sulfur', 'native', 'S', [1.5, 2.5], [2.05, 2.09], 'white yellow', 'resinous greasy', 'yellow', 'none', 'ortho', 0, 0, 'volcanic hotspring evaporite', 'orpiment autunite wulfenite', 3, { sp: 'smells_sulfur', use: 'chemicals fertilizer', kid: 1 });
  R('graphite', 'native', 'C', [1, 2], [2.1, 2.3], 'black', 'metallic submetallic', 'black grey', '1', 'hex', 0, 0, 'metamorphic', 'molybdenite', 3, { sp: 'greasy_feel marks_paper', use: 'pencils batteries', kid: 1 });
  R('diamond', 'native', 'C', [10, 10], [3.5, 3.53], 'white', 'adamantine', 'colorless yellow brown', '4', 'cubic', 0, 0, 'ultramafic placer', 'quartz zircon', 1, { use: 'jewelry abrasives', kid: 1 });
  R('bismuth', 'native', 'Bi', [2, 2.5], [9.7, 9.8], 'grey', 'metallic', 'silver pink', '1', 'trig', 0, 0, 'hydrothermal', 'galena stibnite', 1, { sp: 'iridescent very_heavy', use: 'medicine alloys', kid: 1 });

  // ---------- sulfides ----------
  R('pyrite', 'sulfide', 'FeS2', [6, 6.5], [4.9, 5.2], 'greenblack', 'metallic', 'brass', 'none', 'cubic', 0, 0, 'hydrothermal sedimentary metamorphic', 'gold chalcopyrite marcasite', 5, { sp: 'striated_cubes', use: 'chemicals', kid: 1 });
  R('marcasite', 'sulfide', 'FeS2', [6, 6.5], [4.85, 4.9], 'greenblack', 'metallic', 'brass', 'none', 'ortho', 0, 0, 'sedimentary', 'pyrite', 2, { sp: 'crumbles_in_air' });
  R('chalcopyrite', 'sulfide', 'CuFeS2', [3.5, 4], [4.1, 4.3], 'greenblack', 'metallic', 'brass gold', 'none', 'tetra', 0, 0, 'hydrothermal skarn', 'pyrite gold bornite', 4, { sp: 'iridescent', use: 'ore_copper', kid: 1 });
  R('bornite', 'sulfide', 'Cu5FeS4', [3, 3], [4.9, 5.3], 'black grey', 'metallic', 'copper brown purple blue', 'none', 'ortho', 0, 0, 'hydrothermal', 'chalcopyrite copper covellite', 2, { sp: 'iridescent', use: 'ore_copper' });
  R('galena', 'sulfide', 'PbS', [2.5, 2.75], [7.4, 7.6], 'grey', 'metallic', 'silver grey', '3cube', 'cubic', 0, 0, 'hydrothermal skarn limestone', 'stibnite silver sphalerite', 4, { sp: 'very_heavy', use: 'ore_lead batteries', sf: AMB('lead'), kid: 1 });
  R('sphalerite', 'sulfide', 'ZnS', [3.5, 4], [3.9, 4.1], 'white yellowbrown brown', 'resinous adamantine submetallic', 'brown black yellow red green', 'many', 'cubic', 0, 0, 'hydrothermal skarn limestone', 'galena cassiterite siderite', 4, { use: 'ore_zinc' });
  R('cinnabar', 'sulfide', 'HgS', [2, 2.5], [8, 8.2], 'red', 'adamantine submetallic', 'red', 'none 3rhomb', 'trig', 0, 0, 'hydrothermal hotspring volcanic', 'realgar hematite cuprite', 1, { sp: 'very_heavy', use: 'ore_mercury pigment', sf: RED('mercury') });
  R('stibnite', 'sulfide', 'Sb2S3', [2, 2], [4.6, 4.7], 'grey', 'metallic', 'silver grey', '1', 'ortho', 0, 0, 'hydrothermal', 'galena molybdenite', 2, { sp: 'bladed', use: 'flame_retardant', sf: AMB('antimony') });
  R('molybdenite', 'sulfide', 'MoS2', [1, 1.5], [4.6, 5], 'grey greenblack', 'metallic', 'silver grey', '1', 'hex', 0, 0, 'pegmatite hydrothermal skarn', 'graphite', 2, { sp: 'greasy_feel flexible_sheets', use: 'steel' });
  R('arsenopyrite', 'sulfide', 'FeAsS', [5.5, 6], [5.9, 6.2], 'black grey', 'metallic', 'silver grey', 'none', 'mono', 0, 0, 'hydrothermal', 'pyrite marcasite galena', 2, { sp: 'garlic_smell', sf: RED('arsenic') });
  R('realgar', 'sulfide', 'As4S4', [1.5, 2], [3.5, 3.6], 'orange', 'resinous', 'red orange', '1', 'mono', 0, 0, 'hydrothermal hotspring', 'cinnabar orpiment cuprite', 1, { sp: 'decays_in_light', sf: RED('arsenic') });
  R('orpiment', 'sulfide', 'As2S3', [1.5, 2], [3.4, 3.5], 'yellow', 'resinous pearly', 'yellow orange', '1', 'mono', 0, 0, 'hydrothermal hotspring', 'sulfur realgar', 1, { sp: 'flexible_sheets', use: 'pigment', sf: RED('arsenic') });
  R('pyrrhotite', 'sulfide', 'Fe(1-x)S', [3.5, 4.5], [4.6, 4.7], 'black grey', 'metallic', 'brass brown', 'none', 'mono', 1, 0, 'ultramafic hydrothermal', 'pyrite chalcopyrite', 2, { sp: 'magnetic_weak' });
  R('covellite', 'sulfide', 'CuS', [1.5, 2], [4.6, 4.8], 'grey black', 'submetallic metallic', 'blue black', '1', 'hex', 0, 0, 'oxidized', 'bornite', 1, { sp: 'iridescent flexible_sheets', use: 'ore_copper' });
  R('chalcocite', 'sulfide', 'Cu2S', [2.5, 3], [5.5, 5.8], 'black grey', 'metallic', 'grey black', 'none', 'mono', 0, 0, 'oxidized hydrothermal', 'bornite galena', 1, { use: 'ore_copper' });

  // ---------- halides ----------
  R('halite', 'halide', 'NaCl', [2, 2.5], [2.1, 2.2], 'white', 'vitreous', 'colorless white pink blue orange', '3cube', 'cubic', 0, 0, 'evaporite', 'calcite fluorite sylvite', 4, { sp: 'salty soluble', use: 'food road_salt chemicals', kid: 1 });
  R('sylvite', 'halide', 'KCl', [2, 2.5], [1.95, 2], 'white', 'vitreous', 'colorless white red pink', '3cube', 'cubic', 0, 0, 'evaporite', 'halite', 1, { sp: 'soluble', use: 'fertilizer' });
  R('fluorite', 'halide', 'CaF2', [4, 4], [3.1, 3.2], 'white', 'vitreous', 'purple green blue yellow colorless pink', '4', 'cubic', 0, 0, 'hydrothermal limestone', 'amethyst calcite halite', 4, { sp: 'fluorescent', use: 'steel chemicals', kid: 1 });

  // ---------- carbonates ----------
  R('calcite', 'carbonate', 'CaCO3', [3, 3], [2.7, 2.72], 'white', 'vitreous', 'colorless white yellow orange pink grey brown', '3rhomb', 'trig', 0, 2, 'limestone sedimentary hydrothermal metamorphic', 'quartz dolomite halite aragonite fluorite barite', 5, { sp: 'double_refraction fluorescent', use: 'cement building', kid: 1 });
  R('aragonite', 'carbonate', 'CaCO3', [3.5, 4], [2.9, 2.95], 'white', 'vitreous', 'white colorless yellow brown', 'none', 'ortho', 0, 2, 'limestone hotspring sedimentary', 'calcite', 2, { sp: 'fluorescent' });
  R('dolomite', 'carbonate', 'CaMg(CO3)2', [3.5, 4], [2.84, 2.86], 'white', 'vitreous pearly', 'white pink grey colorless brown', '3rhomb', 'trig', 0, 1, 'sedimentary hydrothermal', 'calcite magnesite siderite', 4, { sp: 'curved_crystals', use: 'building' });
  R('magnesite', 'carbonate', 'MgCO3', [3.5, 4.5], [2.98, 3.02], 'white', 'vitreous earthy', 'white grey yellow', '3rhomb', 'trig', 0, 1, 'ultramafic sedimentary', 'dolomite calcite', 2, { use: 'refractory' });
  R('siderite', 'carbonate', 'FeCO3', [3.5, 4.5], [3.9, 4], 'white', 'vitreous pearly', 'brown yellow', '3rhomb', 'trig', 0, 1, 'sedimentary hydrothermal', 'sphalerite dolomite rhodochrosite', 2, { use: 'ore_iron' });
  R('rhodochrosite', 'carbonate', 'MnCO3', [3.5, 4], [3.6, 3.7], 'white', 'vitreous', 'pink red', '3rhomb', 'trig', 0, 1, 'hydrothermal', 'rhodonite rose_quartz', 2, { sp: 'banded', use: 'jewelry', kid: 1 });
  R('smithsonite', 'carbonate', 'ZnCO3', [4, 4.5], [4.3, 4.5], 'white', 'vitreous pearly', 'blue green pink white yellow', '3rhomb', 'trig', 0, 1, 'oxidized', 'hemimorphite prehnite chrysocolla', 1, { sp: 'botryoidal', use: 'ore_zinc' });
  R('malachite', 'carbonate', 'Cu2CO3(OH)2', [3.5, 4], [3.6, 4.05], 'green', 'silky vitreous earthy', 'green', 'none', 'mono', 0, 2, 'oxidized', 'chrysocolla dioptase', 3, { sp: 'banded botryoidal', use: 'jewelry pigment', kid: 1 });
  R('azurite', 'carbonate', 'Cu3(CO3)2(OH)2', [3.5, 4], [3.7, 3.8], 'blue', 'vitreous', 'blue', 'none', 'mono', 0, 2, 'oxidized', 'lazurite sodalite chrysocolla covellite', 2, { use: 'pigment', kid: 1 });
  R('cerussite', 'carbonate', 'PbCO3', [3, 3.5], [6.5, 6.6], 'white', 'adamantine', 'colorless white grey', 'none', 'ortho', 0, 1, 'oxidized', 'barite calcite', 1, { sp: 'very_heavy', sf: AMB('lead') });

  // ---------- sulfates ----------
  R('gypsum', 'sulfate', 'CaSO4·2H2O', [2, 2], [2.3, 2.33], 'white', 'vitreous pearly silky', 'colorless white grey brown pink', '1', 'mono', 0, 0, 'evaporite sedimentary clay limestone', 'calcite halite anhydrite muscovite ulexite', 5, { sp: 'flexible_sheets', use: 'plaster building', kid: 1 });
  R('anhydrite', 'sulfate', 'CaSO4', [3, 3.5], [2.9, 3], 'white', 'vitreous pearly', 'white blue grey colorless', '3cube', 'ortho', 0, 0, 'evaporite', 'calcite gypsum dolomite', 2, { use: 'cement' });
  R('barite', 'sulfate', 'BaSO4', [3, 3.5], [4.3, 4.5], 'white', 'vitreous', 'white colorless yellow blue brown grey', '2 3rhomb', 'ortho', 0, 0, 'hydrothermal sedimentary', 'calcite celestine gypsum', 3, { sp: 'heavy_for_light', use: 'drilling_mud medicine' });
  R('celestine', 'sulfate', 'SrSO4', [3, 3.5], [3.9, 4], 'white', 'vitreous', 'blue colorless white', '2 3rhomb', 'ortho', 0, 0, 'sedimentary evaporite geode', 'barite anhydrite', 2, { sp: 'red_flame', use: 'fireworks', kid: 1 });
  R('chalcanthite', 'sulfate', 'CuSO4·5H2O', [2.5, 2.5], [2.2, 2.3], 'white', 'vitreous', 'blue', 'none', 'tric', 0, 0, 'oxidized', 'azurite', 1, { sp: 'soluble', sf: AMB('soluble_toxic') });

  // ---------- phosphates, vanadates, molybdates ----------
  R('apatite', 'phosphate', 'Ca5(PO4)3(F,Cl,OH)', [5, 5], [3.1, 3.25], 'white', 'vitreous', 'green blue yellow brown colorless purple', 'none', 'hex', 0, 0, 'pegmatite igneous metamorphic sedimentary', 'beryl olivine tourmaline', 3, { use: 'fertilizer' });
  R('turquoise', 'phosphate', 'CuAl6(PO4)4(OH)8·4H2O', [5, 6], [2.6, 2.9], 'white green blue', 'waxy', 'blue green', 'none', 'tric', 0, 0, 'oxidized', 'chrysocolla smithsonite', 2, { sp: 'often_dyed', use: 'jewelry', kid: 1 });
  R('pyromorphite', 'phosphate', 'Pb5(PO4)3Cl', [3.5, 4], [6.5, 7.1], 'white', 'resinous', 'green yellow brown orange', 'none', 'hex', 0, 0, 'oxidized', 'apatite vanadinite', 1, { sp: 'very_heavy', sf: AMB('lead') });
  R('vanadinite', 'phosphate', 'Pb5(VO4)3Cl', [3, 4], [6.8, 6.9], 'white yellow', 'resinous adamantine', 'red orange brown', 'none', 'hex', 0, 0, 'oxidized', 'wulfenite', 2, { sp: 'very_heavy', sf: AMB('lead') });
  R('wulfenite', 'phosphate', 'PbMoO4', [3, 3], [6.5, 7], 'white', 'adamantine resinous', 'orange yellow brown red', 'none', 'tetra', 0, 0, 'oxidized', 'vanadinite', 2, { sp: 'very_heavy tabular', sf: AMB('lead') });
  R('autunite', 'phosphate', 'Ca(UO2)2(PO4)2·10–12H2O', [2, 2.5], [3.1, 3.2], 'yellow', 'vitreous pearly', 'yellow green', '1', 'tetra', 0, 0, 'oxidized pegmatite', 'torbernite sulfur', 1, { sp: 'fluorescent', sf: RED('radioactive') });
  R('torbernite', 'phosphate', 'Cu(UO2)2(PO4)2·8–12H2O', [2, 2.5], [3.2, 3.6], 'green', 'vitreous pearly', 'green', '1', 'tetra', 0, 0, 'oxidized igneous', 'autunite', 1, { sf: RED('radioactive') });
  R('vivianite', 'phosphate', 'Fe3(PO4)2·8H2O', [1.5, 2], [2.6, 2.7], 'white blue', 'vitreous pearly', 'blue green colorless', '1', 'mono', 0, 0, 'sedimentary clay', 'azurite', 1, { sp: 'darkens_in_light flexible_sheets' });
  R('carnotite', 'phosphate', 'K2(UO2)2(VO4)2·3H2O', [2, 2], [4.7, 5], 'yellow', 'earthy', 'yellow', '1', 'mono', 0, 0, 'sedimentary', 'sulfur autunite', 1, { sf: RED('radioactive') });

  // ---------- oxides & hydroxides ----------
  R('magnetite', 'oxide', 'Fe3O4', [5.5, 6.5], [5.1, 5.2], 'black', 'metallic', 'black grey', 'none', 'cubic', 2, 0, 'igneous ultramafic metamorphic placer skarn', 'hematite chromite ilmenite', 4, { sp: 'magnetic', use: 'ore_iron', kid: 1 });
  R('hematite', 'oxide', 'Fe2O3', [5, 6.5], [5.2, 5.3], 'redbrown red', 'metallic submetallic earthy', 'silver grey black red brown', 'none', 'trig', [0, 1], 0, 'sedimentary hydrothermal metamorphic', 'magnetite goethite cinnabar', 5, { use: 'ore_iron pigment', kid: 1 });
  R('goethite', 'oxide', 'FeO(OH)', [5, 5.5], [3.3, 4.3], 'yellowbrown brown', 'submetallic silky earthy', 'brown black yellow', 'none', 'ortho', 0, 0, 'sedimentary oxidized clay', 'hematite limonite', 4, { sp: 'botryoidal', use: 'pigment ore_iron' });
  R('limonite', 'mineraloid', 'FeO(OH)·nH2O', [4, 5.5], [2.7, 4.3], 'yellowbrown', 'earthy', 'brown yellow', 'none', 'amorph', 0, 0, 'clay oxidized sedimentary', 'goethite hematite', 4, { use: 'pigment' });
  R('corundum', 'oxide', 'Al2O3', [9, 9], [3.95, 4.1], 'white', 'adamantine vitreous', 'grey brown blue red pink yellow', 'none', 'trig', 0, 0, 'metamorphic pegmatite placer', 'spinel quartz', 2, { use: 'abrasives jewelry' });
  R('ruby', 'oxide', 'Al2O3 (Cr)', [9, 9], [3.95, 4.1], 'white', 'adamantine vitreous', 'red pink', 'none', 'trig', 0, 0, 'metamorphic placer', 'garnet spinel', 1, { v: 'corundum', sp: 'fluorescent', use: 'jewelry', kid: 1 });
  R('sapphire', 'oxide', 'Al2O3 (Fe,Ti)', [9, 9], [3.95, 4.1], 'white', 'adamantine vitreous', 'blue yellow pink', 'none', 'trig', 0, 0, 'metamorphic volcanic placer', 'spinel cordierite', 1, { v: 'corundum', use: 'jewelry', kid: 1 });
  R('spinel', 'oxide', 'MgAl2O4', [7.5, 8], [3.55, 4.1], 'white', 'vitreous', 'red pink blue black purple', 'none', 'cubic', 0, 0, 'metamorphic placer', 'ruby garnet', 1, { use: 'jewelry' });
  R('rutile', 'oxide', 'TiO2', [6, 6.5], [4.2, 4.3], 'brown', 'adamantine submetallic', 'brown red black gold', '2', 'tetra', 0, 0, 'metamorphic pegmatite placer', 'cassiterite tourmaline', 2, { sp: 'needles', use: 'pigment' });
  R('cassiterite', 'oxide', 'SnO2', [6, 7], [6.8, 7.1], 'white brown', 'adamantine submetallic', 'brown black', 'none', 'tetra', 0, 0, 'pegmatite hydrothermal placer', 'sphalerite rutile magnetite', 2, { sp: 'very_heavy', use: 'ore_tin' });
  R('chromite', 'oxide', 'FeCr2O4', [5.5, 5.5], [4.5, 4.8], 'brown', 'submetallic metallic', 'black', 'none', 'cubic', 1, 0, 'ultramafic', 'magnetite ilmenite', 2, { use: 'steel' });
  R('ilmenite', 'oxide', 'FeTiO3', [5, 6], [4.7, 4.8], 'black', 'submetallic metallic', 'black', 'none', 'trig', 1, 0, 'igneous placer', 'magnetite hematite chromite', 2, { use: 'pigment' });
  R('pyrolusite', 'oxide', 'MnO2', [2, 6.5], [4.4, 5.1], 'black', 'metallic earthy', 'black grey', 'none', 'tetra', 0, 0, 'sedimentary oxidized', 'graphite', 3, { sp: 'dendrites soils_fingers', use: 'batteries steel' });
  R('cuprite', 'oxide', 'Cu2O', [3.5, 4], [6, 6.15], 'redbrown red', 'adamantine submetallic', 'red black', 'none', 'cubic', 0, 0, 'oxidized', 'cinnabar hematite', 1, { use: 'ore_copper' });
  R('uraninite', 'oxide', 'UO2', [5, 6], [6.5, 10.9], 'black brown', 'submetallic greasy', 'black', 'none', 'cubic', 0, 0, 'pegmatite hydrothermal', 'magnetite', 1, { sp: 'very_heavy', sf: RED('radioactive') });

  // ---------- quartz family & silica ----------
  R('quartz', 'silicate', 'SiO2', [7, 7], [2.65, 2.66], 'white', 'vitreous', 'colorless white grey', 'none', 'trig', 0, 0, 'igneous pegmatite hydrothermal sedimentary geode placer', 'calcite fluorite topaz halite apophyllite', 5, { sp: 'conchoidal hex_prisms', use: 'glass electronics', kid: 1 });
  R('amethyst', 'silicate', 'SiO2', [7, 7], [2.65, 2.66], 'white', 'vitreous', 'purple', 'none', 'trig', 0, 0, 'geode volcanic hydrothermal', 'fluorite', 3, { v: 'quartz', sp: 'conchoidal hex_prisms', use: 'jewelry', kid: 1 });
  R('citrine', 'silicate', 'SiO2', [7, 7], [2.65, 2.66], 'white', 'vitreous', 'yellow orange', 'none', 'trig', 0, 0, 'pegmatite hydrothermal', 'topaz calcite', 2, { v: 'quartz', sp: 'conchoidal often_heated', use: 'jewelry', kid: 1 });
  R('smoky_quartz', 'silicate', 'SiO2', [7, 7], [2.65, 2.66], 'white', 'vitreous', 'brown grey black', 'none', 'trig', 0, 0, 'pegmatite igneous', 'obsidian topaz', 3, { v: 'quartz', sp: 'conchoidal hex_prisms', use: 'jewelry', kid: 1 });
  R('rose_quartz', 'silicate', 'SiO2', [7, 7], [2.65, 2.66], 'white', 'vitreous greasy', 'pink', 'none', 'trig', 0, 0, 'pegmatite', 'rhodochrosite rhodonite', 3, { v: 'quartz', sp: 'conchoidal', use: 'jewelry', kid: 1 });
  R('chalcedony', 'silicate', 'SiO2', [6.5, 7], [2.58, 2.64], 'white', 'waxy vitreous', 'white grey blue brown', 'none', 'trig', 0, 0, 'volcanic sedimentary geode', 'opal prehnite', 4, { sp: 'conchoidal botryoidal', use: 'jewelry' });
  R('agate', 'silicate', 'SiO2', [6.5, 7], [2.58, 2.64], 'white', 'waxy vitreous', 'white grey blue brown red orange', 'none', 'trig', 0, 0, 'volcanic geode placer', 'jasper onyx_glass', 4, { v: 'chalcedony', sp: 'banded conchoidal', use: 'jewelry', kid: 1 });
  R('jasper', 'silicate', 'SiO2 (+Fe)', [6.5, 7], [2.58, 2.91], 'white brown', 'waxy earthy', 'red brown yellow green', 'none', 'trig', 0, 0, 'sedimentary volcanic placer', 'agate chert', 4, { v: 'chalcedony', sp: 'conchoidal', use: 'jewelry', kid: 1 });
  R('chert', 'silicate', 'SiO2', [6.5, 7], [2.6, 2.65], 'white', 'waxy earthy', 'grey black brown white', 'none', 'trig', 0, 0, 'sedimentary limestone placer', 'obsidian jasper', 4, { v: 'chalcedony', sp: 'conchoidal sharp_edges', use: 'tools', kid: 1 });
  R('tigers_eye', 'silicate', 'SiO2 (+FeO(OH))', [6.5, 7], [2.64, 2.71], 'brown yellowbrown', 'silky', 'gold brown yellow', 'none', 'trig', 0, 0, 'sedimentary metamorphic', 'riebeckite', 2, { v: 'quartz', sp: 'chatoyant', use: 'jewelry', kid: 1 });
  R('opal', 'mineraloid', 'SiO2·nH2O', [5.5, 6.5], [1.9, 2.3], 'white', 'vitreous waxy resinous', 'white colorless orange blue', 'none', 'amorph', 0, 0, 'volcanic sedimentary hotspring', 'chalcedony', 2, { sp: 'play_of_color conchoidal', use: 'jewelry', kid: 1 });

  // ---------- feldspars ----------
  R('orthoclase', 'silicate', 'KAlSi3O8', [6, 6], [2.55, 2.63], 'white', 'vitreous', 'pink white orange grey', '2', 'mono', 0, 0, 'igneous pegmatite metamorphic', 'plagioclase quartz calcite microcline', 5, { use: 'ceramics glass', kid: 1 });
  R('microcline', 'silicate', 'KAlSi3O8', [6, 6.5], [2.54, 2.57], 'white', 'vitreous', 'pink white green', '2', 'tric', 0, 0, 'pegmatite igneous', 'orthoclase', 3, { use: 'ceramics' });
  R('amazonite', 'silicate', 'KAlSi3O8', [6, 6.5], [2.54, 2.57], 'white', 'vitreous', 'green blue', '2', 'tric', 0, 0, 'pegmatite', 'turquoise jadeite', 2, { v: 'microcline', use: 'jewelry', kid: 1 });
  R('plagioclase', 'silicate', '(Na,Ca)(Si,Al)4O8', [6, 6.5], [2.62, 2.76], 'white', 'vitreous', 'white grey colorless blue', '2', 'tric', 0, 0, 'igneous volcanic metamorphic', 'orthoclase calcite', 5, { sp: 'striations', use: 'ceramics' });
  R('labradorite', 'silicate', '(Ca,Na)(Al,Si)4O8', [6, 6.5], [2.68, 2.72], 'white', 'vitreous', 'grey black blue green', '2', 'tric', 0, 0, 'igneous', 'plagioclase', 2, { v: 'plagioclase', sp: 'labradorescence striations', use: 'jewelry', kid: 1 });

  // ---------- micas & sheet silicates ----------
  R('muscovite', 'silicate', 'KAl2(AlSi3O10)(OH)2', [2, 2.5], [2.76, 2.88], 'white', 'vitreous pearly', 'colorless silver white brown', '1', 'mono', 0, 0, 'pegmatite igneous metamorphic', 'biotite gypsum talc lepidolite', 5, { sp: 'elastic_sheets', use: 'electronics cosmetics', kid: 1 });
  R('biotite', 'silicate', 'K(Mg,Fe)3AlSi3O10(OH)2', [2.5, 3], [2.8, 3.4], 'white grey', 'vitreous pearly submetallic', 'black brown green', '1', 'mono', 0, 0, 'igneous metamorphic pegmatite', 'muscovite chlorite', 5, { sp: 'elastic_sheets', kid: 1 });
  R('lepidolite', 'silicate', 'K(Li,Al)3(Al,Si)4O10(F,OH)2', [2.5, 3.5], [2.8, 2.9], 'white', 'pearly vitreous', 'purple pink grey', '1', 'mono', 0, 0, 'pegmatite', 'muscovite', 2, { sp: 'elastic_sheets', use: 'batteries' });
  R('chlorite', 'silicate', '(Mg,Fe)5Al(AlSi3O10)(OH)8', [2, 2.5], [2.6, 3.3], 'white green', 'pearly vitreous greasy', 'green', '1', 'mono', 0, 0, 'metamorphic hydrothermal', 'biotite serpentine talc', 4, { sp: 'flexible_sheets' });
  R('talc', 'silicate', 'Mg3Si4O10(OH)2', [1, 1], [2.58, 2.83], 'white', 'pearly greasy', 'white green grey', '1', 'mono', 0, 0, 'metamorphic ultramafic', 'gypsum chlorite muscovite', 4, { sp: 'greasy_feel', use: 'cosmetics ceramics paper', kid: 1 });
  R('serpentine', 'silicate', 'Mg3Si2O5(OH)4', [2.5, 4], [2.5, 2.6], 'white', 'greasy waxy silky', 'green yellow black', 'none', 'mono', 0, 0, 'ultramafic metamorphic', 'jadeite chlorite', 3, { use: 'building' });
  R('chrysotile', 'silicate', 'Mg3Si2O5(OH)4', [2.5, 3], [2.5, 2.6], 'white', 'silky', 'white green yellow', 'none', 'mono', 0, 0, 'ultramafic', 'ulexite gypsum tremolite', 1, { sp: 'fibrous', sf: RED('asbestos') });
  R('kaolinite', 'silicate', 'Al2Si2O5(OH)4', [2, 2.5], [2.6, 2.65], 'white', 'earthy', 'white yellow', 'none', 'tric', 0, 0, 'clay igneous', 'talc', 4, { sp: 'plastic_when_wet', use: 'ceramics paper' });

  // ---------- chain silicates ----------
  R('hornblende', 'silicate', 'Ca2(Mg,Fe,Al)5(Al,Si)8O22(OH)2', [5, 6], [2.9, 3.5], 'white grey', 'vitreous', 'black green brown', '2', 'mono', 0, 0, 'igneous metamorphic', 'augite tourmaline biotite', 5, {});
  R('tremolite', 'silicate', 'Ca2Mg5Si8O22(OH)2', [5, 6], [2.9, 3.1], 'white', 'vitreous silky', 'white grey green', '2', 'mono', 0, 0, 'metamorphic skarn', 'wollastonite actinolite', 2, { sp: 'fibrous', sf: AMB('asbestos_possible') });
  R('actinolite', 'silicate', 'Ca2(Mg,Fe)5Si8O22(OH)2', [5, 6], [3, 3.4], 'white', 'vitreous silky', 'green', '2', 'mono', 0, 0, 'metamorphic', 'epidote tourmaline', 2, { sp: 'fibrous', sf: AMB('asbestos_possible') });
  R('riebeckite', 'silicate', 'Na2(Fe,Mg)3Fe2Si8O22(OH)2', [5, 6], [3.3, 3.4], 'grey blue', 'vitreous silky', 'blue black', '2', 'mono', 0, 0, 'igneous sedimentary', 'tigers_eye', 1, { sp: 'fibrous', sf: RED('asbestos') });
  R('augite', 'silicate', '(Ca,Na)(Mg,Fe,Al)(Si,Al)2O6', [5.5, 6], [3.2, 3.6], 'white grey green', 'vitreous', 'black green brown', '2', 'mono', 0, 0, 'igneous volcanic', 'hornblende diopside', 4, {});
  R('diopside', 'silicate', 'CaMgSi2O6', [5.5, 6.5], [3.2, 3.4], 'white green', 'vitreous', 'green white colorless', '2', 'mono', 0, 0, 'metamorphic skarn ultramafic', 'augite olivine epidote', 3, { use: 'jewelry' });
  R('jadeite', 'silicate', 'NaAlSi2O6', [6.5, 7], [3.24, 3.43], 'white', 'vitreous greasy', 'green white purple grey', 'none', 'mono', 0, 0, 'metamorphic placer', 'serpentine amazonite prehnite', 1, { sp: 'very_tough', use: 'jewelry tools' });
  R('spodumene', 'silicate', 'LiAlSi2O6', [6.5, 7], [3.1, 3.2], 'white', 'vitreous', 'colorless white grey pink green', '2', 'mono', 0, 0, 'pegmatite', 'orthoclase tremolite', 2, { use: 'batteries jewelry' });
  R('rhodonite', 'silicate', 'MnSiO3', [5.5, 6.5], [3.4, 3.75], 'white', 'vitreous', 'pink red black', '2', 'tric', 0, 0, 'metamorphic hydrothermal skarn', 'rhodochrosite rose_quartz', 2, { use: 'jewelry', kid: 1 });
  R('wollastonite', 'silicate', 'CaSiO3', [4.5, 5], [2.86, 3.09], 'white', 'vitreous silky pearly', 'white grey colorless', '2', 'tric', 0, 0, 'skarn metamorphic', 'tremolite', 1, { sp: 'fibrous', use: 'ceramics' });

  // ---------- other silicates ----------
  R('olivine', 'silicate', '(Mg,Fe)2SiO4', [6.5, 7], [3.2, 4.4], 'white', 'vitreous', 'green yellow brown', 'none', 'ortho', 0, 0, 'ultramafic volcanic', 'diopside epidote prehnite', 4, { sp: 'conchoidal', use: 'jewelry refractory', kid: 1 });
  R('garnet', 'silicate', '(Fe,Mg,Ca,Mn)3(Al,Fe,Cr)2(SiO4)3', [6.5, 7.5], [3.5, 4.3], 'white', 'vitreous resinous', 'red brown black orange green pink', 'none', 'cubic', 0, 0, 'metamorphic skarn pegmatite placer', 'ruby spinel staurolite', 5, { sp: 'dodecahedra', use: 'abrasives jewelry', kid: 1 });
  R('tourmaline', 'silicate', '(Na,Ca)(Fe,Mg,Li,Al)3Al6(BO3)3Si6O18(OH)4', [7, 7.5], [3, 3.26], 'white', 'vitreous', 'black green pink blue brown red', 'none', 'trig', 0, 0, 'pegmatite metamorphic igneous', 'hornblende augite actinolite', 4, { sp: 'striated_prisms triangular', use: 'jewelry', kid: 1 });
  R('beryl', 'silicate', 'Be3Al2Si6O18', [7.5, 8], [2.6, 2.9], 'white', 'vitreous', 'green blue yellow pink white colorless', 'none', 'hex', 0, 0, 'pegmatite metamorphic', 'apatite quartz', 3, { sp: 'hex_prisms', use: 'jewelry' });
  R('emerald', 'silicate', 'Be3Al2Si6O18 (Cr,V)', [7.5, 8], [2.67, 2.78], 'white', 'vitreous', 'green', 'none', 'hex', 0, 0, 'metamorphic pegmatite', 'dioptase diopside', 1, { v: 'beryl', sp: 'hex_prisms', use: 'jewelry', kid: 1 });
  R('aquamarine', 'silicate', 'Be3Al2Si6O18 (Fe)', [7.5, 8], [2.67, 2.8], 'white', 'vitreous', 'blue green', 'none', 'hex', 0, 0, 'pegmatite', 'topaz apatite', 1, { v: 'beryl', sp: 'hex_prisms', use: 'jewelry', kid: 1 });
  R('topaz', 'silicate', 'Al2SiO4(F,OH)2', [8, 8], [3.49, 3.57], 'white', 'vitreous', 'colorless yellow blue brown pink orange', '1', 'ortho', 0, 0, 'pegmatite volcanic placer', 'quartz citrine aquamarine', 2, { use: 'jewelry', kid: 1 });
  R('zircon', 'silicate', 'ZrSiO4', [7.5, 7.5], [4.6, 4.7], 'white', 'adamantine', 'brown red colorless yellow grey blue', 'none', 'tetra', 0, 0, 'igneous placer', 'diamond cassiterite', 3, { sp: 'fluorescent', use: 'ceramics' });
  R('kyanite', 'silicate', 'Al2SiO5', [4.5, 7], [3.53, 3.67], 'white', 'vitreous pearly', 'blue white grey green', '1 2', 'tric', 0, 0, 'metamorphic', 'sillimanite', 2, { sp: 'two_hardness bladed', use: 'refractory' });
  R('andalusite', 'silicate', 'Al2SiO5', [6.5, 7.5], [3.13, 3.21], 'white', 'vitreous', 'pink brown grey', '2', 'ortho', 0, 0, 'metamorphic', 'kyanite staurolite', 2, { sp: 'cross_section', use: 'refractory' });
  R('sillimanite', 'silicate', 'Al2SiO5', [6.5, 7.5], [3.23, 3.27], 'white', 'vitreous silky', 'white grey brown', '1', 'ortho', 0, 0, 'metamorphic', 'kyanite tremolite', 1, { sp: 'fibrous', use: 'refractory' });
  R('staurolite', 'silicate', 'Fe2Al9Si4O23(OH)', [7, 7.5], [3.65, 3.83], 'white grey', 'vitreous resinous', 'brown black', 'none', 'mono', 0, 0, 'metamorphic', 'garnet andalusite', 2, { sp: 'cross_twins', kid: 1 });
  R('epidote', 'silicate', 'Ca2(Al,Fe)3(SiO4)(Si2O7)O(OH)', [6, 7], [3.3, 3.6], 'white grey', 'vitreous', 'green yellow black', '1', 'mono', 0, 0, 'metamorphic skarn hydrothermal', 'olivine actinolite tourmaline', 3, { sp: 'striations' });
  R('titanite', 'silicate', 'CaTiSiO5', [5, 5.5], [3.48, 3.6], 'white', 'adamantine resinous', 'brown yellow green black', 'none 2', 'mono', 0, 0, 'igneous metamorphic', 'staurolite sphalerite', 2, { sp: 'wedge_crystals' });
  R('cordierite', 'silicate', '(Mg,Fe)2Al4Si5O18', [7, 7.5], [2.57, 2.66], 'white', 'vitreous', 'blue purple grey', 'none', 'ortho', 0, 0, 'metamorphic', 'sapphire quartz', 1, { sp: 'pleochroic', use: 'jewelry' });
  R('prehnite', 'silicate', 'Ca2Al2Si3O10(OH)2', [6, 6.5], [2.8, 2.95], 'white', 'vitreous pearly', 'green yellow white', '1', 'ortho', 0, 0, 'volcanic hydrothermal', 'smithsonite chalcedony', 2, { sp: 'botryoidal', use: 'jewelry' });
  R('natrolite', 'silicate', 'Na2Al2Si3O10·2H2O', [5, 5.5], [2.2, 2.26], 'white', 'vitreous', 'colorless white', '2', 'ortho', 0, 0, 'volcanic geode', 'aragonite', 2, { sp: 'needles' });
  R('stilbite', 'silicate', 'NaCa4(Si27Al9)O72·28H2O', [3.5, 4], [2.1, 2.2], 'white', 'vitreous pearly', 'white pink orange colorless', '1', 'mono', 0, 0, 'volcanic geode', 'apophyllite calcite', 2, { sp: 'sheaves' });
  R('apophyllite', 'silicate', 'KCa4Si8O20(F,OH)·8H2O', [4.5, 5], [2.3, 2.4], 'white', 'vitreous pearly', 'colorless white green', '1', 'tetra', 0, 0, 'volcanic geode', 'quartz calcite', 2, { kid: 1 });
  R('chrysocolla', 'silicate', '(Cu,Al)2H2Si2O5(OH)4·nH2O', [2, 4], [1.9, 2.4], 'white green blue', 'vitreous waxy earthy', 'blue green', 'none', 'amorph', 0, 0, 'oxidized', 'turquoise malachite azurite smithsonite', 2, { sp: 'sticks_to_tongue', use: 'jewelry' });
  R('dioptase', 'silicate', 'CuSiO3·H2O', [5, 5], [3.28, 3.35], 'green', 'vitreous', 'green', '3rhomb', 'trig', 0, 0, 'oxidized', 'emerald malachite', 1, {});
  R('hemimorphite', 'silicate', 'Zn4Si2O7(OH)2·H2O', [4.5, 5], [3.4, 3.5], 'white', 'vitreous silky', 'blue white colorless green', '2', 'ortho', 0, 0, 'oxidized', 'smithsonite chrysocolla turquoise', 1, { sp: 'botryoidal', use: 'ore_zinc' });
  R('sodalite', 'silicate', 'Na8(Al6Si6O24)Cl2', [5.5, 6], [2.27, 2.33], 'white', 'vitreous greasy', 'blue white grey', 'none', 'cubic', 0, 0, 'igneous', 'lazurite azurite', 2, { sp: 'fluorescent', use: 'jewelry', kid: 1 });
  R('lazurite', 'silicate', '(Na,Ca)8(AlSiO4)6(S,SO4,Cl)', [5, 5.5], [2.38, 2.9], 'blue', 'vitreous earthy', 'blue', 'none', 'cubic', 0, 0, 'metamorphic skarn', 'sodalite azurite', 1, { sp: 'pyrite_flecks', use: 'pigment jewelry', kid: 1 });

  // ---------- borates ----------
  R('borax', 'borate', 'Na2B4O5(OH)4·8H2O', [2, 2.5], [1.7, 1.72], 'white', 'vitreous resinous', 'white colorless', '1', 'mono', 0, 0, 'evaporite', 'halite gypsum', 1, { sp: 'soluble crumbles_in_air', use: 'detergent glass' });
  R('ulexite', 'borate', 'NaCaB5O6(OH)6·5H2O', [1, 2.5], [1.95, 1.96], 'white', 'silky vitreous', 'white colorless', '1', 'tric', 0, 0, 'evaporite', 'gypsum chrysotile', 1, { sp: 'tv_effect fibrous', use: 'glass', kid: 1 });

  // ---------- mineraloids ----------
  R('obsidian', 'mineraloid', 'SiO2 (glass)', [5, 5.5], [2.35, 2.6], 'white', 'vitreous', 'black brown grey red', 'none', 'amorph', 0, 0, 'volcanic', 'smoky_quartz chert', 3, { sp: 'conchoidal sharp_edges', use: 'tools jewelry', kid: 1 });
  R('amber', 'mineraloid', 'C10H16O (approx.)', [2, 2.5], [1.05, 1.1], 'white', 'resinous', 'yellow orange brown', 'none', 'amorph', 0, 0, 'sedimentary placer', 'opal', 2, { sp: 'floats_saltwater static fossils_inside', use: 'jewelry', kid: 1 });

  // fix look-alike links that are not in the list
  const ids = new Set(L.map(m => m.id));
  L.forEach(m => { m.lk = m.lk.filter(x => ids.has(x) && x !== m.id); });
  const BY = Object.fromEntries(L.map(m => [m.id, m]));
  // add reverse look-alike links (if A looks like B, B looks like A)
  L.forEach(m => m.lk.forEach(o => { if (!BY[o].lk.includes(m.id)) BY[o].lk.push(m.id); }));

  MI.MINERALS = L; MI.BY = BY;

  // Vocabularies used by tests (order = display order)
  MI.VOC = {
    cls: ['native', 'sulfide', 'halide', 'oxide', 'carbonate', 'sulfate', 'phosphate', 'borate', 'silicate', 'mineraloid'],
    colors: ['colorless', 'white', 'grey', 'black', 'red', 'pink', 'orange', 'yellow', 'brown', 'green', 'blue', 'purple', 'gold', 'brass', 'silver', 'copper'],
    streak: ['white', 'grey', 'black', 'greenblack', 'red', 'redbrown', 'brown', 'yellowbrown', 'yellow', 'orange', 'green', 'blue'],
    luster: ['metallic', 'submetallic', 'vitreous', 'adamantine', 'resinous', 'pearly', 'silky', 'greasy', 'waxy', 'earthy'],
    cleavage: ['none', '1', '2', '3cube', '3rhomb', '4', 'many'],
    sys: ['cubic', 'tetra', 'hex', 'trig', 'ortho', 'mono', 'tric', 'amorph'],
    occ: ['igneous', 'volcanic', 'pegmatite', 'ultramafic', 'metamorphic', 'skarn', 'hydrothermal', 'oxidized', 'sedimentary', 'limestone', 'evaporite', 'clay', 'geode', 'hotspring', 'placer']
  };
  // swatch colours for UI
  MI.SWATCH = { colorless: '#eef3f7', white: '#ffffff', grey: '#9aa3ab', black: '#1d1d1f', red: '#c62828', pink: '#f48fb1', orange: '#ef6c00', yellow: '#fdd835', brown: '#795548', green: '#2e7d32', blue: '#1e63c4', purple: '#7b3fa0', gold: '#d4a017', brass: '#c9ae5d', silver: '#c0c6cc', copper: '#b8642e',
    greenblack: '#2b3a2e', redbrown: '#8d3b2a', yellowbrown: '#b08a3c' };
})();
