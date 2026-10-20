/**
 * Mock Data for Customer Page
 * Easily update customer details, project information, and material specifications.
 */

export const DEFAULT_CUSTOMER_PROJECT = {
  customer: {
    name: "Vikramaditya Singhania",
    company: "Singhania Luxury Living & Estates",
    email: "vikramaditya@singhaniagroup.in",
    phone: "+91 98200 12345",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  project: {
    name: "Prestige Horizon Coastal Tower & Villas",
    code: "PHC-MUM-2026",
    location: "Worli Sea Face, Mumbai, Maharashtra",
    startDate: "January 15, 2026",
    completionTarget: "December 2027",
    status: "Active / In Progress", // e.g., 'Active / In Progress', 'Completed', 'Under Review'
    phase: "Superstructure & Premium Architectural Finishes",
    contractor: "L&T ECC Infrastructure Division",
    leadArchitect: "Hafeez Contractor & Associates",
    totalBudget: "₹185,00,00,000",
    sustainabilityTier: "IGBC Platinum Pre-Certified"
  },
  materials: [
    {
      id: "mat-01",
      name: "Italian Statuario White Marble",
      grade: "Grade A+ First Choice",
      specification: "20mm Book-Matched / Polished & Anti-Stain Sealed",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80",
      description: "Imported Italian marble slabs selected for the double-height grand lobby and penthouse living pavilion flooring.",
      category: "Flooring & Finishes",
      coverage: "1,850 m²",
      supplier: "Classic Marble Company (CMC Mumbai)"
    },
    {
      id: "mat-02",
      name: "Natural Burmese Teak Wood",
      grade: "Grade A Premium",
      specification: "Kiln-Dried (Moisture < 12%) / Termite & Weather Proofed",
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80",
      description: "Used for solid master suite entrance doorframes, acoustic louver ceilings, and private pool deck pergolas.",
      category: "Timber & Joinery",
      coverage: "420 m³",
      supplier: "Nilambur Heritage Timber Yards"
    },
    {
      id: "mat-03",
      name: "Marine-Grade Stainless Steel (SS 316L)",
      grade: "High Quality (SS 316L)",
      specification: "ASTM A240 / 320-Grit Mirror Polish / Electropolished",
      image: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=600&auto=format&fit=crop&q=80",
      description: "Specified for seaside glass balustrade spigots, external façade tension rods, and splash-zone structural brackets.",
      category: "Architectural Metals",
      coverage: "8.5 Metric Tonnes",
      supplier: "Jindal Stainless Limited"
    },
    {
      id: "mat-04",
      name: "Ultra High Performance Concrete (UHPC M120)",
      grade: "Grade A1 Heavy Structural",
      specification: "IS 456 / IRC:112 / 120 MPa Compressive Strength",
      image: "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=600&auto=format&fit=crop&q=80",
      description: "High-density micro-silica matrix used for perimeter transfer girders, slender columns, and cantilevered balcony ribs.",
      category: "Core Structural",
      coverage: "3,200 m³",
      supplier: "UltraTech Ready Mix Concrete"
    },
    {
      id: "mat-05",
      name: "Fe 500D Corrosion-Resistant Rebar (CRS)",
      grade: "Premium CRS Certified",
      specification: "IS 1786:2008 / Min Yield 500 MPa / High Ductility",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80",
      description: "Engineered reinforcement for marine-exposed basement raft foundation, core shear walls, and retaining diaphragms.",
      category: "Reinforcement Steel",
      coverage: "1,150 Metric Tonnes",
      supplier: "Tata Tiscon CRS Steel"
    },
    {
      id: "mat-06",
      name: "Double Glazed Low-E Acoustic Glass",
      grade: "Anti-Scratch / High Performance",
      specification: "12mm Toughened + 1.52mm PVB + 12mm Low-E (U-Value: 1.3)",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80",
      description: "Full-height coastal panoramic glass curtain walls providing 42dB acoustic noise suppression and 70% solar heat rejection.",
      category: "Glazing & Facades",
      coverage: "2,600 m²",
      supplier: "Saint-Gobain Solar Control Glass"
    }
  ]
};
