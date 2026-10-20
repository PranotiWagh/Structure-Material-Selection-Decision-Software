const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const dbPath = path.resolve(__dirname, '..', '..', 'database', 'materials.db');
const db = new DatabaseSync(dbPath);

console.log('Connecting to SQLite:', dbPath);

db.exec('DROP TABLE IF EXISTS project_evaluations;');
db.exec(`
  CREATE TABLE project_evaluations (
    id TEXT PRIMARY KEY,
    project_name TEXT NOT NULL,
    description TEXT,
    structure_type TEXT NOT NULL,
    structural_element TEXT NOT NULL,
    load_type TEXT NOT NULL,
    design_life INTEGER NOT NULL,
    environmental_condition TEXT NOT NULL,
    budget_range TEXT NOT NULL,
    sustainability_preference INTEGER NOT NULL DEFAULT 0,
    special_requirements TEXT,
    client_name TEXT,
    client_contact TEXT,
    client_organization TEXT,
    client_logo TEXT,
    site_photos TEXT,
    top_recommendation TEXT,
    suitability_score INTEGER,
    ranked_materials_json TEXT,
    author TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log('Created project_evaluations table with full metadata support.');

const sampleProjects = [
  {
    id: "IND-MTHL-2026-01",
    project_name: "Mumbai Trans Harbour Link (Atal Setu) - Marine Pylon & Deck",
    description: "Marine pier pylon subjected to Arabian Sea tidal splash, demanding 100+ year durability and chloride impermeability.",
    structure_type: "Highway Bridge",
    structural_element: "Pier / Pylon",
    load_type: "Dynamic / Traffic Load",
    design_life: 120,
    environmental_condition: "Marine / Coastal",
    budget_range: "High",
    sustainability_preference: 1,
    special_requirements: JSON.stringify([
      "High Compressive Strength",
      "High Corrosion Resistance",
      "Ductility & Seismic Energy Dissipation",
      "Low Maintenance Lifecycle"
    ]),
    client_name: "Shri Sanjay Mukherjee, IAS",
    client_contact: "mmrda.mthl@maharashtra.gov.in / +91-22-26590001",
    client_organization: "Mumbai Metropolitan Region Development Authority (MMRDA)",
    client_logo: "",
    site_photos: JSON.stringify([
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80"
    ]),
    top_recommendation: "Ultra High Performance Concrete UHPC M150 (IRC:112)",
    suitability_score: 96,
    author: "Eng. Priya Nair (Lead Structural Designer)",
    ranked_materials_json: JSON.stringify([
      { rank: 1, name: "Ultra High Performance Concrete UHPC M150 (IRC:112)", score: 96, category: "Ultra High Performance Concrete", cost: "₹24,400/m³" },
      { rank: 2, name: "High Performance Concrete HPC M60 (IS 456 / IRC:112)", score: 91, category: "High Performance Concrete", cost: "₹9,400/m³" },
      { rank: 3, name: "Cor-Ten Weathering Steel Fe 490 (IS 11587 / ASTM A588)", score: 87, category: "Weathering Steel", cost: "₹84,900/m³" }
    ])
  },
  {
    id: "IND-CHENAB-2026-02",
    project_name: "Chenab Rail Arch Bridge - Deep Gorge Arch Rib & Pier Abutment",
    description: "Deep gorge steel arch rib resisting 266 km/h Himalayan winds and Zone V seismic peak ground acceleration at -20°C.",
    structure_type: "Railway / Metro Bridge",
    structural_element: "Arch Rib",
    load_type: "Dead + Live + Wind Load",
    design_life: 120,
    environmental_condition: "Severe / Alpine Freeze-Thaw",
    budget_range: "High",
    sustainability_preference: 0,
    special_requirements: JSON.stringify([
      "High Tensile Strength",
      "Ductility & Seismic Energy Dissipation",
      "Low Maintenance Lifecycle"
    ]),
    client_name: "Dr. Rajesh Sharma, Chief Project Director",
    client_contact: "krcl.usbrl@railnet.gov.in / +91-191-2470123",
    client_organization: "Northern Railway & Konkan Railway Corp (USBRL Project)",
    client_logo: "",
    site_photos: JSON.stringify([
      "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=600&q=80"
    ]),
    top_recommendation: "Structural Steel Fe 410 / E350 Grade B (IS 2062)",
    suitability_score: 94,
    author: "Dr. Rajesh Sharma, CPWD / KRCL",
    ranked_materials_json: JSON.stringify([
      { rank: 1, name: "Structural Steel Fe 410 / E350 Grade B (IS 2062)", score: 94, category: "Structural Steel", cost: "₹53,200/m³" },
      { rank: 2, name: "Cor-Ten Weathering Steel Fe 490 (IS 11587 / ASTM A588)", score: 89, category: "Weathering Steel", cost: "₹79,800/m³" },
      { rank: 3, name: "TMT Rebar Fe 500 / Fe 500D (IS 1786 High-Ductility)", score: 86, category: "Structural Steel", cost: "₹50,000/m³" }
    ])
  },
  {
    id: "IND-GIFT-2026-03",
    project_name: "GIFT City Diamond Tower - Composite Mega-Columns & Outrigger Core",
    description: "Slender central shear core and high-strength concrete columns resisting combined wind, seismic, and axial gravity loads.",
    structure_type: "Commercial Building",
    structural_element: "Column",
    load_type: "Dead + Live + Seismic Load",
    design_life: 100,
    environmental_condition: "Moderate / Inland Dry",
    budget_range: "Medium",
    sustainability_preference: 1,
    special_requirements: JSON.stringify([
      "High Compressive Strength",
      "Extreme Fire Resistance",
      "Ductility & Seismic Energy Dissipation",
      "Rapid Construction / Fast-Track Delivery"
    ]),
    client_name: "Tapan Ray, MD & Group CEO",
    client_contact: "procurement@giftgujarat.in / +91-79-29701000",
    client_organization: "Gujarat International Finance Tec-City Co. Ltd. (GIFT City)",
    client_logo: "",
    site_photos: JSON.stringify([
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80"
    ]),
    top_recommendation: "High Performance Concrete HPC M60 (IS 456 / IRC:112)",
    suitability_score: 91,
    author: "Eng. Priya Nair (Lead Structural Designer)",
    ranked_materials_json: JSON.stringify([
      { rank: 1, name: "High Performance Concrete HPC M60 (IS 456 / IRC:112)", score: 91, category: "High Performance Concrete", cost: "₹9,400/m³" },
      { rank: 2, name: "TMT Rebar Fe 500 / Fe 500D (IS 1786 High-Ductility)", score: 88, category: "Structural Steel", cost: "₹50,000/m³" },
      { rank: 3, name: "Geopolymer Concrete GeoC40 (Fly-Ash Based, IS 17452)", score: 84, category: "Sustainable & Eco-Friendly", cost: "₹6,500/m³" }
    ])
  },
  {
    id: "IND-HSR-2026-04",
    project_name: "Bullet Train Elevated Viaduct - Full-Span Segmental Box Girder",
    description: "Full-span precast segmental box girder demanding high dynamic stiffness, low deflection, and accelerated erection cycles.",
    structure_type: "Railway / Metro Bridge",
    structural_element: "Bridge Deck / Girder",
    load_type: "Dynamic / Traffic Load",
    design_life: 100,
    environmental_condition: "Moderate / Inland Dry",
    budget_range: "Medium",
    sustainability_preference: 1,
    special_requirements: JSON.stringify([
      "Precasting Capability",
      "Rapid Construction / Fast-Track Delivery",
      "High Compressive Strength"
    ]),
    client_name: "Rajendra Prasad, Managing Director",
    client_contact: "cpm.ahmedabad@nhsrcl.in / +91-79-23456780",
    client_organization: "National High Speed Rail Corporation Limited (NHSRCL)",
    client_logo: "",
    site_photos: JSON.stringify([
      "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=600&q=80"
    ]),
    top_recommendation: "Precast Segmental Box Girder M50 (IRC:112)",
    suitability_score: 95,
    author: "Shri Vikram Mehta, Chief Executive Consultant",
    ranked_materials_json: JSON.stringify([
      { rank: 1, name: "Precast Segmental Box Girder M50 (IRC:112)", score: 95, category: "Precast Concrete", cost: "₹9,200/m³" },
      { rank: 2, name: "High Performance Concrete HPC M60 (IS 456 / IRC:112)", score: 90, category: "High Performance Concrete", cost: "₹9,400/m³" },
      { rank: 3, name: "Fiber Reinforced Concrete FRC M50 Heavy Duty (IRC:112)", score: 85, category: "Fiber Reinforced Concrete", cost: "₹9,300/m³" }
    ])
  },
  {
    id: "IND-BWSL-2026-05",
    project_name: "Bandra-Worli Sea Link - Cable-Stayed Pylon & Stay Anchorages",
    description: "Cable-stayed bridge pylon exposed to extreme Arabian Sea splash and severe chloride concentrations.",
    structure_type: "Highway Bridge",
    structural_element: "Cable Stay / Suspension Link",
    load_type: "Dynamic / Traffic Load",
    design_life: 120,
    environmental_condition: "Marine / Coastal",
    budget_range: "High",
    sustainability_preference: 1,
    special_requirements: JSON.stringify([
      "High Tensile Strength",
      "High Corrosion Resistance",
      "Low Maintenance Lifecycle"
    ]),
    client_name: "Anil Kumar Gaikwad, Vice Chairman & MD",
    client_contact: "msrdc.projects@maharashtra.gov.in / +91-22-26517900",
    client_organization: "Maharashtra State Road Development Corporation (MSRDC)",
    client_logo: "",
    site_photos: JSON.stringify([
      "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=600&q=80"
    ]),
    top_recommendation: "Carbon Fiber Reinforced Polymer (CFRP Laminate IRC:112)",
    suitability_score: 93,
    author: "Eng. Priya Nair (Lead Structural Designer)",
    ranked_materials_json: JSON.stringify([
      { rank: 1, name: "Carbon Fiber Reinforced Polymer (CFRP Laminate IRC:112)", score: 93, category: "FRP Composites", cost: "₹92,500/m³" },
      { rank: 2, name: "Austenitic Stainless Steel Grade 316L (IS 6911 Marine)", score: 90, category: "Stainless Steel", cost: "₹195,000/m³" },
      { rank: 3, name: "Ultra High Performance Concrete UHPC M150 (IRC:112)", score: 88, category: "Ultra High Performance Concrete", cost: "₹24,400/m³" }
    ])
  }
];

const insertStmt = db.prepare(`
  INSERT INTO project_evaluations (
    id, project_name, description, structure_type, structural_element,
    load_type, design_life, environmental_condition, budget_range,
    sustainability_preference, special_requirements, client_name,
    client_contact, client_organization, client_logo, site_photos,
    top_recommendation, suitability_score, ranked_materials_json, author
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  );
`);

db.exec('BEGIN TRANSACTION;');
for (const p of sampleProjects) {
  insertStmt.run(
    p.id, p.project_name, p.description, p.structure_type, p.structural_element,
    p.load_type, p.design_life, p.environmental_condition, p.budget_range,
    p.sustainability_preference, p.special_requirements, p.client_name,
    p.client_contact, p.client_organization, p.client_logo, p.site_photos,
    p.top_recommendation, p.suitability_score, p.ranked_materials_json, p.author
  );
}
db.exec('COMMIT;');

const count = db.prepare('SELECT count(*) as total FROM project_evaluations;').get();
console.log('Seeded projects into SQLite database. Total projects:', count.total);
