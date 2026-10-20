/**
 * Mock Sample Data for Admin Dashboard
 * Structured for easy replacement with Machine Learning model outputs.
 */

// 1. KPI Metrics
export const INITIAL_KPI_METRICS = {
  totalMaterials: 1005,
  historicalUsedMaterials: 4820,
  strongMaterialsCount: 712,
  weakMaterialsCount: 148,
  leastUsedMaterialsCount: 64,
  mlModelAccuracy: "94.8%",
  lastUpdated: "October 15, 2026"
};

// 2. Material Quality Classification (Strong vs. Moderate vs. Weak)
// Formatted to simulate Machine Learning classification output
export const MATERIAL_QUALITY_DISTRIBUTION = [
  {
    tier: "Ultra High Strength",
    category: "Structural Elite",
    strengthRange: "> 80 MPa",
    count: 182,
    percentage: 18.1,
    color: "#059669", // emerald-600
    badgeClass: "badge-ultra-strong",
    examples: ["UHPC M150", "Fe 600 TMT", "Carbon Fiber CFRC", "Duplex Stainless Steel"]
  },
  {
    tier: "Strong Structural",
    category: "Primary Structural",
    strengthRange: "40 - 80 MPa",
    count: 530,
    percentage: 52.7,
    color: "#2563eb", // blue-600
    badgeClass: "badge-strong",
    examples: ["M50 Silica Fume", "M60 Fly Ash", "Fe 500D TMT", "Cor-Ten Weathering Steel"]
  },
  {
    tier: "Moderate Standard",
    category: "Utility Secondary",
    strengthRange: "25 - 40 MPa",
    count: 145,
    percentage: 14.4,
    color: "#f59e0b", // amber-500
    badgeClass: "badge-moderate",
    examples: ["M25 Standard", "M30 Reinforced", "Fe 415 Mild Steel", "Glulam Structural Timber"]
  },
  {
    tier: "Weak / Utility",
    category: "Non-Load Bearing",
    strengthRange: "< 25 MPa",
    count: 148,
    percentage: 14.8,
    color: "#ef4444", // rose-500
    badgeClass: "badge-weak",
    examples: ["PCC M15 Blinding", "PCC M20", "Burnt Clay Brick Masonry", "AAC Lightweight Block"]
  }
];

// 2b. Material Category Distribution (for Category Composition Pie / Donut Chart)
export const MATERIAL_CATEGORY_DISTRIBUTION = [
  {
    category: "High Performance Concrete",
    shortName: "Concrete",
    count: 395,
    percentage: 39.3,
    color: "#2563eb", // blue-600
    subtext: "UHPC, M60-M80, Self-Compacting"
  },
  {
    category: "Structural & TMT Steel",
    shortName: "Steel",
    count: 275,
    percentage: 27.4,
    color: "#4f46e5", // indigo-600
    subtext: "Fe 500D, Cor-Ten, Plate Girders"
  },
  {
    category: "FRP & Advanced Composites",
    shortName: "FRP Composites",
    count: 135,
    percentage: 13.4,
    color: "#7c3aed", // violet-600
    subtext: "CFRP Laminates, GFRP Rebars"
  },
  {
    category: "Timber & Engineered Wood",
    shortName: "Timber",
    count: 105,
    percentage: 10.4,
    color: "#059669", // emerald-600
    subtext: "Glulam, Cross-Laminated Timber"
  },
  {
    category: "Masonry & Sustainable",
    shortName: "Eco-Masonry",
    count: 95,
    percentage: 9.5,
    color: "#f59e0b", // amber-500
    subtext: "Geopolymer, AAC, Fly Ash Bricks"
  }
];

// 3. Material Usage Trend Over Time (Months / Quarters)
export const MATERIAL_USAGE_TRENDS = [
  { month: "Jan", mostUsed: 380, standardUsed: 210, leastUsed: 18 },
  { month: "Feb", mostUsed: 410, standardUsed: 225, leastUsed: 22 },
  { month: "Mar", mostUsed: 490, standardUsed: 260, leastUsed: 15 },
  { month: "Apr", mostUsed: 460, standardUsed: 240, leastUsed: 19 },
  { month: "May", mostUsed: 520, standardUsed: 280, leastUsed: 24 },
  { month: "Jun", mostUsed: 580, standardUsed: 310, leastUsed: 28 },
  { month: "Jul", mostUsed: 540, standardUsed: 290, leastUsed: 20 },
  { month: "Aug", mostUsed: 610, standardUsed: 330, leastUsed: 25 },
  { month: "Sep", mostUsed: 670, standardUsed: 360, leastUsed: 30 },
  { month: "Oct", mostUsed: 720, standardUsed: 390, leastUsed: 32 }
];

// Top 5 Most Used vs Top 5 Least Used Materials
export const USAGE_COMPARISON_ITEMS = [
  { name: "Fe 500D TMT Corrosion-Resistant Steel", type: "Most Used", count: 1420, change: "+18%", strength: "Strong" },
  { name: "M60 Silica Fume High Performance Concrete", type: "Most Used", count: 1180, change: "+14%", strength: "Strong" },
  { name: "M45 Fly Ash Self-Compacting Concrete", type: "Most Used", count: 960, change: "+9%", strength: "Strong" },
  { name: "IS 2062 E350 Structural Mild Steel", type: "Most Used", count: 820, change: "+5%", strength: "Strong" },
  { name: "IS 456 M35 Standard Reinforced Concrete", type: "Most Used", count: 710, change: "-2%", strength: "Moderate" },
  { name: "Bamboo-Fiber Reinforced Polymer Composite", type: "Least Used", count: 14, change: "-12%", strength: "Weak" },
  { name: "Autoclaved Aerated Concrete AAC Grade 1", type: "Least Used", count: 28, change: "-8%", strength: "Weak" },
  { name: "Plain Cement Concrete PCC M15 Sub-base", type: "Least Used", count: 32, change: "+1%", strength: "Weak" },
  { name: "Structural Basalt-Fiber Rebar", type: "Least Used", count: 38, change: "+6%", strength: "Strong" },
  { name: "Burmese Teak Heavy Structural Timber", type: "Least Used", count: 42, change: "-4%", strength: "Moderate" }
];

// 4. Initial Employee Roster
export const INITIAL_EMPLOYEES = [
  {
    id: "EMP-101",
    name: "Dr. Rajesh Sharma",
    role: "Senior Structural Engineer",
    email: "rajesh.sharma@smdss.gov.in",
    department: "Civil Design & Metro Infrastructure",
    status: "Active",
    assignedProjects: ["Mumbai Trans Harbour Link (MTHL)", "Chenab Arch Railway Bridge"]
  },
  {
    id: "EMP-102",
    name: "Priya Venkataraman",
    role: "Chief Materials Specialist",
    email: "priya.v@smdss.gov.in",
    department: "Quality Assurance & Material Testing",
    status: "Active",
    assignedProjects: ["GIFT City Tower 2 Structural Scan", "Bandra-Worli Sea Link Retrofit"]
  },
  {
    id: "EMP-103",
    name: "Amitav Ghosh",
    role: "QA/QC Inspection Officer",
    email: "amitav.g@smdss.gov.in",
    department: "Standards Compliance & Verification",
    status: "Active",
    assignedProjects: ["Mumbai-Ahmedabad High-Speed Rail (MAHSR)"]
  },
  {
    id: "EMP-104",
    name: "Ananya Sen",
    role: "Geotechnical Analyst",
    email: "ananya.sen@smdss.gov.in",
    department: "Substructure & Raft Analysis",
    status: "On Leave",
    assignedProjects: ["Kochi Water Metro Jetty Deep Piles"]
  },
  {
    id: "EMP-105",
    name: "Rohan Kulkarni",
    role: "Junior Site Engineer",
    email: "rohan.k@smdss.gov.in",
    department: "Field Execution & Concrete Pouring",
    status: "Inactive",
    assignedProjects: ["Pune Ring Road Viaduct Section 3"]
  }
];

// 5. Initial Dataset Materials for Dataset Management
export const INITIAL_DATASET_MATERIALS = [
  {
    id: "MAT-M150-01",
    name: "Ultra High Performance Concrete (UHPC M150)",
    specification: "IS 456 / IRC:112 Spec A1 / 150 MPa",
    strengthGrade: "Strong",
    category: "Concrete",
    compressiveStrength: 150,
    usageCount: 640,
    stock: "In Stock"
  },
  {
    id: "MAT-FE600-02",
    name: "Fe 600 High Strength Structural TMT Steel",
    specification: "IS 1786:2008 / Min Yield 600 MPa",
    strengthGrade: "Strong",
    category: "Structural Steel",
    compressiveStrength: 600,
    usageCount: 890,
    stock: "In Stock"
  },
  {
    id: "MAT-M60-03",
    name: "M60 Grade Silica Fume High Performance Concrete",
    specification: "IS 456:2000 Table 2 / 20mm Agg / 60 MPa",
    strengthGrade: "Strong",
    category: "Concrete",
    compressiveStrength: 60,
    usageCount: 1180,
    stock: "In Stock"
  },
  {
    id: "MAT-SS316-04",
    name: "Marine-Grade Stainless Steel SS 316L",
    specification: "ASTM A240 / Electropolished Coastal Passivated",
    strengthGrade: "Strong",
    category: "Structural Steel",
    compressiveStrength: 290,
    usageCount: 420,
    stock: "Limited"
  },
  {
    id: "MAT-M35-05",
    name: "M35 Grade Standard Fly Ash Concrete",
    specification: "IS 456:2000 / 30% Fly Ash Substitution",
    strengthGrade: "Moderate",
    category: "Concrete",
    compressiveStrength: 35,
    usageCount: 710,
    stock: "In Stock"
  },
  {
    id: "MAT-TIMB-06",
    name: "Burmese Teak Hardwood Structural Timber",
    specification: "IS 883:1994 / Moisture < 12% / Termite Treated",
    strengthGrade: "Moderate",
    category: "Structural Timber",
    compressiveStrength: 32,
    usageCount: 42,
    stock: "Pre-Order"
  },
  {
    id: "MAT-PCC15-07",
    name: "Plain Cement Concrete (PCC M15) Sub-Base",
    specification: "IS 456:2000 / Nominal Mix 1:2:4",
    strengthGrade: "Weak",
    category: "Concrete",
    compressiveStrength: 15,
    usageCount: 32,
    stock: "In Stock"
  },
  {
    id: "MAT-BRK-08",
    name: "Traditional Burnt Clay Structural Brick Masonry",
    specification: "IS 1077 / Compressive Strength 10.5 MPa",
    strengthGrade: "Weak",
    category: "Masonry",
    compressiveStrength: 10.5,
    usageCount: 18,
    stock: "In Stock"
  },
  {
    id: "MAT-AAC-09",
    name: "Autoclaved Aerated Concrete (AAC) Blocks",
    specification: "IS 2185 Part 3 / Dry Density 650 kg/m³",
    strengthGrade: "Weak",
    category: "Masonry",
    compressiveStrength: 4.5,
    usageCount: 28,
    stock: "Limited"
  }
];
