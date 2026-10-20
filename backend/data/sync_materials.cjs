const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const projectRoot = path.resolve(__dirname, '..', '..');
const datasetCsvPath = path.join(projectRoot, 'dataset', 'materials_database_1000.csv');
const backendCsvPath = path.join(projectRoot, 'backend', 'data', 'materials_database_1000.csv');
const dbPath = path.join(projectRoot, 'database', 'materials.db');

console.log('Reading dataset CSV from:', datasetCsvPath);
const content = fs.readFileSync(datasetCsvPath, 'utf8');
const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
const header = lines[0].split(',');
console.log('Dataset header:', header);

// Helper to determine standardized Indian material name and standards
function getStandardizedInfo(cat, comp, tens, density, idNum) {
  let name = '';
  let standards = '';
  let desc = '';
  let precast = 1;
  let ductility = 7.0;
  let waterImp = 7.5;
  let speed = 7.5;
  let maxLife = 100;
  let elasticMod = 30.0;

  switch (cat) {
    case 'Normal Concrete': {
      precast = 1;
      speed = 6.2;
      ductility = 6.5;
      waterImp = 7.5;
      maxLife = 75;
      elasticMod = Math.round((5000 * Math.sqrt(comp) / 1000) * 10) / 10;
      if (comp < 20) {
        name = `Plain Cement Concrete PCC M15 (IS 456) #${idNum}`;
        standards = 'IS 456:2000';
        desc = 'Plain cement concrete bedding mix conforming to IS 456 for mass levelling and sub-bases.';
      } else if (comp < 25) {
        name = `Plain Cement Concrete PCC M20 (IS 456) #${idNum}`;
        standards = 'IS 456:2000';
        desc = 'General plain cement concrete conforming to IS 456 for substructures and floor bases.';
      } else if (comp < 28) {
        name = `Reinforced Cement Concrete RCC M25 (IS 456) #${idNum}`;
        standards = 'IS 456:2000 / IS 10262';
        desc = 'Standard structural reinforced concrete mix widely specified in Indian building frameworks.';
      } else if (comp < 35) {
        name = `Reinforced Cement Concrete RCC M30 (IS 456) #${idNum}`;
        standards = 'IS 456:2000 / IS 10262';
        desc = 'High-durability structural reinforced concrete designed for commercial slabs and columns.';
      } else {
        name = `Reinforced Cement Concrete RCC M35 (IS 456) #${idNum}`;
        standards = 'IS 456:2000 / IS 10262';
        desc = 'High-grade structural concrete mix with enhanced durability for coastal and severe exposures.';
      }
      break;
    }

    case 'High Performance Concrete': {
      precast = 1;
      speed = 7.5;
      ductility = 7.2;
      waterImp = 9.2;
      maxLife = 120;
      elasticMod = Math.round((5000 * Math.sqrt(comp) / 1000) * 10) / 10;
      if (comp < 60) {
        name = `High Performance Concrete HPC M50 (IS 456 / IRC:112) #${idNum}`;
        standards = 'IS 456:2000 / IRC:112-2020';
        desc = 'Micro-silica densified concrete designed for heavily loaded bridge piers and marine splash zones.';
      } else if (comp < 70) {
        name = `High Performance Concrete HPC M60 (IS 456 / IRC:112) #${idNum}`;
        standards = 'IS 456:2000 / IRC:112-2020';
        desc = 'Low water-binder silica fume concrete specified for metro viaduct piers and deep caissons.';
      } else if (comp < 80) {
        name = `High Performance Concrete HPC M70 (IRC:112) #${idNum}`;
        standards = 'IRC:112-2020 / IS 456';
        desc = 'Extreme durability fly-ash slag modified high-strength concrete for major highway bridges.';
      } else {
        name = `High Performance Concrete HPC M80 (IRC:112 / IS 16700) #${idNum}`;
        standards = 'IRC:112-2020 / IS 16700:2017';
        desc = 'Ultra-high strength concrete for skyscraper columns and outrigger shear walls.';
      }
      break;
    }

    case 'Ultra High Performance Concrete': {
      precast = 1;
      speed = 8.5;
      ductility = 8.6;
      waterImp = 9.8;
      maxLife = 200;
      elasticMod = Math.round((5000 * Math.sqrt(comp) / 1000) * 10) / 10;
      if (comp < 135) {
        name = `Ultra High Performance Concrete UHPC M120 (IRC:112) #${idNum}`;
        standards = 'IRC:112-2020 / ACI 239R';
        desc = 'Steel-fiber reinforced reactive powder concrete matrix exceeding 120 MPa compressive capacity.';
      } else if (comp < 160) {
        name = `Ultra High Performance Concrete UHPC M150 (IRC:112) #${idNum}`;
        standards = 'IRC:112-2020 / ACI 239R';
        desc = 'Dense micro-silica and steel-fiber matrix engineered for slender bridge decks and seismic joints.';
      } else {
        name = `Ultra High Performance Concrete UHPC M180 Reactive Powder #${idNum}`;
        standards = 'IRC:112-2020 / AFGC-SNCF';
        desc = 'Advanced ductile reactive powder matrix engineered for blast-resistant and signature structures.';
      }
      break;
    }

    case 'Fiber Reinforced Concrete': {
      precast = 1;
      speed = 7.0;
      ductility = 8.2;
      waterImp = 8.8;
      maxLife = 90;
      elasticMod = Math.round((5000 * Math.sqrt(comp) / 1000) * 10) / 10;
      if (tens < 6.0) {
        name = `Fiber Reinforced Concrete FRC M35 Polypropylene (IS 456) #${idNum}`;
        standards = 'IS 456:2000 / IRC:112-2020';
        desc = 'Synthetic micro-fiber concrete formulated for shrinkage crack suppression and impact toughness.';
      } else if (comp < 45) {
        name = `Fiber Reinforced Concrete FRC M40 Hooked Steel-Fiber (IS 456) #${idNum}`;
        standards = 'IS 456:2000 / ACI 544.4R';
        desc = 'Hooked-end steel fiber reinforced concrete providing post-crack ductility and fatigue resistance.';
      } else {
        name = `Fiber Reinforced Concrete FRC M50 Heavy Duty (IRC:112) #${idNum}`;
        standards = 'IRC:112-2020 / ACI 544';
        desc = 'Structural steel fiber reinforced matrix designed for industrial pavements and tunnel linings.';
      }
      break;
    }

    case 'Precast Concrete': {
      precast = 1;
      speed = 9.2;
      ductility = 7.2;
      waterImp = 9.0;
      maxLife = 100;
      elasticMod = Math.round((5000 * Math.sqrt(comp) / 1000) * 10) / 10;
      if (comp < 45) {
        name = `Precast Prestressed Hollow Core Slab M40 (IS 15916) #${idNum}`;
        standards = 'IS 15916:2010 / IS 456';
        desc = 'Off-site manufactured prestressed hollow core concrete floor unit for fast-track erection.';
      } else if (comp < 58) {
        name = `Precast Segmental Box Girder M50 (IRC:112) #${idNum}`;
        standards = 'IRC:112-2020 / IS 15916';
        desc = 'Match-cast segmental bridge box girder concrete offering high dynamic rigidity and low maintenance.';
      } else {
        name = `Precast Pier Cap & U-Girder M60 (IRC:112) #${idNum}`;
        standards = 'IRC:112-2020 / NHSRCL Specs';
        desc = 'Heavy precast segmental metro girder element conforming to IRC:112 and Indian railway norms.';
      }
      break;
    }

    case 'Specialty Concrete': {
      precast = 1;
      speed = 7.5;
      ductility = 6.8;
      waterImp = 8.5;
      maxLife = 80;
      elasticMod = Math.round((5000 * Math.sqrt(comp) / 1000) * 10) / 10;
      if (comp < 20) {
        name = `Roller Compacted Concrete RCC-Pavement (IRC:SP:68) #${idNum}`;
        standards = 'IRC:SP:68:2005';
        desc = 'Zero-slump concrete compacted with heavy vibratory rollers for heavy industrial yard pavements.';
      } else if (comp < 30) {
        name = `Underwater Tremie Concrete M30 (IS 456) #${idNum}`;
        standards = 'IS 456:2000 / IS 10262';
        desc = 'High-cohesion self-flowing mix with anti-washout admixtures for underwater caissons and diaphragm walls.';
      } else if (comp < 40) {
        name = `Self-Compacting Concrete SCC M35 (IS 456 / IS 10262) #${idNum}`;
        standards = 'IS 456:2000 / IS 10262:2019';
        desc = 'High-slump flow concrete tailored for congested rebar cages without segregation.';
      } else {
        name = `Self-Compacting Concrete SCC M45 (IS 456 / IS 10262) #${idNum}`;
        standards = 'IS 456:2000 / IS 10262:2019';
        desc = 'High-performance self-compacting mix designed for architecturally exposed finishes and shear cores.';
      }
      break;
    }

    case 'Sustainable & Eco-Friendly': {
      precast = 1;
      speed = 7.8;
      ductility = 7.0;
      waterImp = 8.9;
      maxLife = 110;
      elasticMod = Math.round((5000 * Math.sqrt(comp) / 1000) * 10) / 10;
      if (comp < 32) {
        name = `Recycled Aggregate Concrete RAC M25 (IS 383 / IS 456) #${idNum}`;
        standards = 'IS 383:2016 / IS 456';
        desc = 'Sustainable circular construction concrete incorporating certified recycled concrete aggregates.';
      } else if (comp < 40) {
        name = `Recycled Aggregate Concrete RAC M30 (IS 383 / IS 456) #${idNum}`;
        standards = 'IS 383:2016 / IS 456';
        desc = 'Engineered concrete replacing up to 30% coarse aggregate with processed C&D debris per IS 383.';
      } else if (comp < 50) {
        name = `Geopolymer Concrete GeoC40 (Fly-Ash Based, IS 17452) #${idNum}`;
        standards = 'IS 17452:2020 / IRC:SP:112';
        desc = 'Zero-clinker aluminosilicate binder cured via alkaline activation, saving over 70% embodied CO2.';
      } else {
        name = `Geopolymer Concrete GeoC50 (Alkali Slag-Silica, IS 17452) #${idNum}`;
        standards = 'IS 17452:2020 / ASTM C1157';
        desc = 'Slag and fly ash geopolymer composite delivering supreme acid resistance and low heat of hydration.';
      }
      break;
    }

    case 'Structural Steel': {
      precast = 1;
      speed = 9.3;
      waterImp = 9.6;
      maxLife = 120;
      elasticMod = 205.0;
      if (tens < 350) {
        name = `Structural Steel Fe 250 / E250 Grade A (IS 2062) #${idNum}`;
        standards = 'IS 2062:2011 / IS 800:2007';
        desc = 'Standard hot-rolled mild structural steel widely used in Indian building trusses and purlins.';
        ductility = 9.5;
      } else if (tens < 480) {
        name = `Structural Steel Fe 410 / E350 Grade B (IS 2062) #${idNum}`;
        standards = 'IS 2062:2011 / IS 800:2007';
        desc = 'Medium-tensile hot rolled steel section optimized for highway bridge girders and industrial frames.';
        ductility = 9.4;
      } else if (tens < 550) {
        name = `TMT Rebar Fe 500 / Fe 500D (IS 1786 High-Ductility) #${idNum}`;
        standards = 'IS 1786:2008 / IS 13920';
        desc = 'Thermo-mechanically treated high yield rebar with guaranteed elongation for seismic Zone III-V design.';
        ductility = 9.6;
      } else {
        name = `TMT Rebar Fe 550D / Fe 600 (IS 1786 Seismic Grade) #${idNum}`;
        standards = 'IS 1786:2008 / IS 13920:2016';
        desc = 'Superior strength TMT bar engineered to minimize rebar congestion in heavy civil foundations.';
        ductility = 9.3;
      }
      break;
    }

    case 'Weathering Steel': {
      precast = 1;
      speed = 9.0;
      ductility = 9.2;
      waterImp = 9.3;
      maxLife = 130;
      elasticMod = 205.0;
      if (comp < 450) {
        name = `Cor-Ten Weathering Steel Fe 350 (IS 11587 / ASTM A588) #${idNum}`;
        standards = 'IS 11587:2012 / ASTM A588';
        desc = 'Atmospheric corrosion resistant alloy steel that forms an adherent protective rust patina.';
      } else {
        name = `Cor-Ten Weathering Steel Fe 490 (IS 11587 / ASTM A588) #${idNum}`;
        standards = 'IS 11587:2012 / IS 800:2007';
        desc = 'High-strength weathering structural steel eliminating routine recoating on highway flyovers.';
      }
      break;
    }

    case 'Stainless Steel': {
      precast = 1;
      speed = 8.8;
      ductility = 9.1;
      waterImp = 9.8;
      maxLife = 220;
      elasticMod = 200.0;
      if (comp < 580) {
        name = `Austenitic Stainless Steel Grade 304 (IS 6911) #${idNum}`;
        standards = 'IS 6911:2017 / AISI 304';
        desc = 'Classic 18/8 chromium-nickel austenitic stainless alloy for architectural and structural elements.';
      } else if (comp < 680) {
        name = `Austenitic Stainless Steel Grade 316L (IS 6911 Marine) #${idNum}`;
        standards = 'IS 6911:2017 / ASTM A240';
        desc = 'Molybdenum-bearing marine grade stainless steel offering supreme resistance to pitting in saline air.';
      } else {
        name = `Duplex Stainless Steel 2205 (IS 6911 / UNS S32205) #${idNum}`;
        standards = 'IS 6911:2017 / EN 10088-2';
        desc = 'Austenitic-ferritic balanced alloy providing double yield strength and immunity to chloride SCC.';
      }
      break;
    }

    case 'FRP Composites': {
      precast = 1;
      speed = 9.2;
      ductility = 4.2;
      waterImp = 9.7;
      maxLife = 150;
      elasticMod = 190.0;
      if (tens < 1200) {
        name = `Glass Fiber Reinforced Polymer (GFRP Rebar IS 18255) #${idNum}`;
        standards = 'IS 18255:2023 / IRC:112';
        desc = 'Non-magnetic, 100% rust-free glass fiber reinforced composite bar for aggressive coastal decks.';
      } else if (tens < 2000) {
        name = `Basalt Fiber Reinforced Polymer (BFRP Grid Matrix) #${idNum}`;
        standards = 'IRC:112-2020 / ACI 440.2R';
        desc = 'High-temperature resistant volcanic basalt filament rebar offering high tensile-to-weight ratio.';
      } else {
        name = `Carbon Fiber Reinforced Polymer (CFRP Laminate IRC:112) #${idNum}`;
        standards = 'IRC:112-2020 / ACI 440.2R';
        desc = 'High modulus carbon fiber composite for structural retrofitting, stay cables, and seismic wraps.';
      }
      break;
    }

    case 'Timber / Engineered Wood': {
      precast = 1;
      speed = 9.4;
      ductility = 6.2;
      waterImp = 5.2;
      maxLife = 80;
      elasticMod = 12.5;
      if (tens < 45) {
        name = `Glued Laminated Timber Glulam Beam (IS 883 / IS 1708) #${idNum}`;
        standards = 'IS 883:1994 / IS 1708';
        desc = 'Finger-jointed structural timber lamellas bonded with moisture-proof resin for long arch spans.';
      } else if (comp < 55) {
        name = `Cross-Laminated Timber CLT 5-Ply (IS 1708 / EC5) #${idNum}`;
        standards = 'IS 1708 / Eurocode 5';
        desc = 'Orthogonally stacked structural wood panels providing biogenic carbon storage and dry assembly.';
      } else {
        name = `Engineered Teak & Hardwood Composite (IS 3629) #${idNum}`;
        standards = 'IS 3629:1986 / IS 1708';
        desc = 'Chemically treated heavy timber framing material offering natural resilience and aesthetic warmth.';
      }
      break;
    }

    case 'Masonry': {
      precast = 0;
      speed = 5.5;
      ductility = 4.8;
      waterImp = 6.5;
      maxLife = 70;
      elasticMod = Math.round((1000 * comp / 1000) * 10) / 10;
      if (density < 1000) {
        name = `Autoclaved Aerated Concrete AAC Block (IS 2185 Part 3) #${idNum}`;
        standards = 'IS 2185 (Part 3):1984';
        desc = 'Ultra-lightweight cellular concrete block offering thermal efficiency and reduced seismic load.';
      } else if (comp < 12) {
        name = `Fly Ash Brick Masonry Class 10 (IS 12894) #${idNum}`;
        standards = 'IS 12894:2002 / IS 1905';
        desc = 'Eco-friendly pulverized fuel ash masonry units conforming to Indian green building norms.';
      } else {
        name = `Wire-cut Clay Brick Masonry Class 15 (IS 1077) #${idNum}`;
        standards = 'IS 1077:1992 / IS 1905';
        desc = 'Heavy load-bearing wire-cut clay bricks with high compressive strength for structural walls.';
      }
      break;
    }

    case 'Non-Ferrous Metals': {
      precast = 1;
      speed = 9.3;
      ductility = 8.4;
      waterImp = 9.5;
      maxLife = 100;
      elasticMod = 70.0;
      if (tens < 320) {
        name = `Structural Aluminum Alloy 6063-T6 (IS 733) #${idNum}`;
        standards = 'IS 733:1983 / Eurocode 9';
        desc = 'Lightweight architectural alloy with smooth surface finish and good anodizing qualities.';
      } else if (tens < 370) {
        name = `Structural Aluminum Alloy 6061-T6 (IS 733) #${idNum}`;
        standards = 'IS 733:1983 / Eurocode 9';
        desc = 'High-strength structural aluminum extruded beam and column profiles with passive oxide passivity.';
      } else {
        name = `Structural Aluminum Alloy 6082-T6 (IS 733 Heavy Duty) #${idNum}`;
        standards = 'IS 733:1983 / Eurocode 9';
        desc = 'Highest strength 6000-series alloy for aerospace trusses, crane booms, and roof frameworks.';
      }
      break;
    }

    default: {
      name = `${cat} Standard Grade #${idNum}`;
      standards = 'IS 456 / IS 800';
      desc = 'Standard structural material meeting Indian national design codes.';
      break;
    }
  }

  return { name, standards, desc, precast, ductility, waterImp, speed, maxLife, elasticMod };
}

// Process rows
const standardizedDatasetRows = [];
const backendExpandedRows = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  const cols = line.split(',');
  if (cols.length < 12) continue;

  const matId = cols[0].trim();
  const rawName = cols[1].trim();
  const category = cols[2].trim();
  const comp = parseFloat(cols[3]);
  const tens = parseFloat(cols[4]);
  const density = parseFloat(cols[5]);
  const costInr = parseFloat(cols[6]);
  const durability = parseFloat(cols[7]);
  const corrosion = parseFloat(cols[8]);
  const fire = parseFloat(cols[9]);
  const co2 = parseFloat(cols[10]);
  const maintenance = parseFloat(cols[11]);

  const idNum = matId.replace(/\D/g, '');
  const info = getStandardizedInfo(category, comp, tens, density, idNum);

  // Cost Index calculation
  let costIndex = 'Medium';
  if (costInr <= 12000) costIndex = 'Low';
  else if (costInr > 70000) costIndex = 'High';

  // 1. Row for dataset/materials_database_1000.csv
  standardizedDatasetRows.push([
    matId,
    `"${info.name}"`,
    category,
    comp.toFixed(1),
    tens.toFixed(2),
    density.toFixed(1),
    costInr.toFixed(1),
    durability.toFixed(1),
    corrosion.toFixed(1),
    fire.toFixed(1),
    co2.toFixed(1),
    maintenance.toFixed(1)
  ].join(','));

  // 2. Row for backend expanded SQLite & CSV
  backendExpandedRows.push({
    id: matId,
    name: info.name,
    category: category,
    compressive_strength: comp,
    tensile_strength: tens,
    density: Math.round(density),
    elastic_modulus: info.elasticMod,
    embodied_carbon: Math.round(co2),
    cost_index: costIndex,
    cost_inr_m3: costInr,
    co2_emission_kg_m3: co2,
    durability_score: durability,
    corrosion_resistance_score: corrosion,
    fire_resistance_score: fire,
    maintenance_score: maintenance,
    fire_rating: fire,
    corrosion_resistance: corrosion,
    precast_suitability: info.precast,
    ductility_rating: info.ductility,
    water_impermeability: info.waterImp,
    speed_score: info.speed,
    max_design_life: info.maxLife,
    standards: info.standards,
    description: info.desc
  });
}

console.log(`Processed ${standardizedDatasetRows.length} standardized materials.`);

// Write back to dataset/materials_database_1000.csv
const newDatasetCsv = [
  'material_id,material_name,category,compressive_strength_mpa,tensile_strength_mpa,density_kg_m3,cost_inr_m3,durability_score,corrosion_resistance_score,fire_resistance_score,co2_emission_kg_m3,maintenance_score',
  ...standardizedDatasetRows
].join('\n');
fs.writeFileSync(datasetCsvPath, newDatasetCsv, 'utf8');
console.log('Successfully updated dataset/materials_database_1000.csv');

// Write backend CSV
const backendCsvHeader = Object.keys(backendExpandedRows[0]).join(',');
const backendCsvLines = backendExpandedRows.map(r => {
  return [
    r.id,
    `"${r.name.replace(/"/g, '""')}"`,
    `"${r.category}"`,
    r.compressive_strength,
    r.tensile_strength,
    r.density,
    r.elastic_modulus,
    r.embodied_carbon,
    r.cost_index,
    r.cost_inr_m3,
    r.co2_emission_kg_m3,
    r.durability_score,
    r.corrosion_resistance_score,
    r.fire_resistance_score,
    r.maintenance_score,
    r.fire_rating,
    r.corrosion_resistance,
    r.precast_suitability,
    r.ductility_rating,
    r.water_impermeability,
    r.speed_score,
    r.max_design_life,
    `"${r.standards}"`,
    `"${r.description.replace(/"/g, '""')}"`
  ].join(',');
});
fs.writeFileSync(backendCsvPath, [backendCsvHeader, ...backendCsvLines].join('\n'), 'utf8');
console.log('Successfully updated backend/data/materials_database_1000.csv');

// Sync to SQLite database/materials.db
try {
  const db = new DatabaseSync(dbPath);
  db.exec('DROP TABLE IF EXISTS materials;');
  db.exec(`
    CREATE TABLE materials (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      compressive_strength REAL NOT NULL,
      tensile_strength REAL NOT NULL,
      density INTEGER NOT NULL,
      elastic_modulus REAL NOT NULL,
      embodied_carbon INTEGER NOT NULL,
      cost_index TEXT NOT NULL,
      cost_inr_m3 REAL,
      co2_emission_kg_m3 REAL,
      durability_score REAL,
      corrosion_resistance_score REAL,
      fire_resistance_score REAL,
      maintenance_score REAL,
      fire_rating REAL NOT NULL,
      corrosion_resistance REAL NOT NULL,
      precast_suitability INTEGER NOT NULL,
      ductility_rating REAL NOT NULL,
      water_impermeability REAL NOT NULL,
      speed_score REAL NOT NULL,
      max_design_life INTEGER NOT NULL,
      standards TEXT NOT NULL,
      description TEXT
    );
  `);

  const insertStmt = db.prepare(`
    INSERT INTO materials (
      id, name, category, compressive_strength, tensile_strength, density,
      elastic_modulus, embodied_carbon, cost_index, cost_inr_m3, co2_emission_kg_m3,
      durability_score, corrosion_resistance_score, fire_resistance_score, maintenance_score,
      fire_rating, corrosion_resistance, precast_suitability, ductility_rating,
      water_impermeability, speed_score, max_design_life, standards, description
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    );
  `);

  db.exec('BEGIN TRANSACTION;');
  for (const r of backendExpandedRows) {
    insertStmt.run(
      r.id, r.name, r.category, r.compressive_strength, r.tensile_strength, r.density,
      r.elastic_modulus, r.embodied_carbon, r.cost_index, r.cost_inr_m3, r.co2_emission_kg_m3,
      r.durability_score, r.corrosion_resistance_score, r.fire_resistance_score, r.maintenance_score,
      r.fire_rating, r.corrosion_resistance, r.precast_suitability, r.ductility_rating,
      r.water_impermeability, r.speed_score, r.max_design_life, r.standards, r.description
    );
  }
  db.exec('COMMIT;');

  const countRes = db.prepare('SELECT count(*) as total FROM materials;').get();
  console.log('Successfully synced to SQLite database. Total materials:', countRes.total);
  const sample = db.prepare('SELECT id, name, category, cost_inr_m3, standards FROM materials LIMIT 5;').all();
  console.log('Sample materials in SQLite:', sample);
} catch (dbErr) {
  console.error('Error syncing SQLite database:', dbErr);
}
