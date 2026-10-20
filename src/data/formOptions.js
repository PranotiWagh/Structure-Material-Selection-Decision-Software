export const STRUCTURE_TYPES = [
  "Highway Bridge",
  "Railway / Metro Bridge",
  "Commercial Building",
  "Residential Building",
  "Industrial Plant / Warehouse",
  "Footbridge / Pedestrian Overpass",
  "Retaining Wall / Earth Retention",
  "Marine / Offshore Pier",
  "Tunnel / Underground Structure",
  "Water Tank / Reservoir",
  "Dam / Spillway Structure",
  "Airport Terminal / Hangar",
  "Stadium / Sports Arena",
  "Power Plant Structure",
  "Chimney / Industrial Tower",
  "Silo / Grain Storage",
  "Wharf / Quay Wall",
  "Offshore Oil Platform",
  "Foundation Caisson",
  "Nuclear Containment Structure"
];

export const STRUCTURAL_ELEMENTS = [
  "Pier / Pylon",
  "Arch Rib",
  "Bridge Deck / Girder",
  "Column",
  "Beam",
  "Slab (Floor / Roof)",
  "Deep Foundation (Pile / Caisson)",
  "Shallow Foundation (Footing / Mat)",
  "Wall (Load-bearing / Shear)",
  "Retaining Wall Stem",
  "Truss Member",
  "Cable Stay / Suspension Link",
  "Staircase Core",
  "Retaining Anchor / Tieback",
  "Pavement Slab",
  "Bracing Strut",
  "Corbel / Bracket",
  "Diaphragm Wall",
  "Tunnel Lining Segment",
  "Foundation Pedestal"
];

export const LOAD_TYPES = [
  { value: "Dead Load Only", label: "Dead Load Only", desc: "Permanent gravity loads, self-weight, and fixed equipment" },
  { value: "Dead + Live Load", label: "Dead + Live Load", desc: "Standard occupancy loads, transient human/storage weights" },
  { value: "Dead + Live + Wind Load", label: "Dead + Live + Wind Load (IS 875 Part 3)", desc: "Aerodynamic pressures conforming to IS 875 Part 3" },
  { value: "Dead + Live + Seismic Load", label: "Dead + Live + Seismic (IS 1893 Zone II-V)", desc: "Cyclic lateral ground acceleration, ductility demand per IS 1893" },
  { value: "Dynamic / Traffic Load", label: "Dynamic / Traffic Load (IRC:6 / IRS)", desc: "Repeated impact, fatigue cycles, 70R / Class A vehicle loading" }
];

export const ENVIRONMENTAL_CONDITIONS = [
  { value: "Moderate / Inland Dry", label: "Moderate / Inland Dry (IS 456 Moderate)", desc: "Sheltered from rain, low relative humidity, minimal airborne chloride" },
  { value: "Marine / Coastal", label: "Marine / Coastal (IS 456 Severe / Very Severe)", desc: "High atmospheric chloride, splash zone, Arabian Sea / Bay of Bengal tidal saline exposure" },
  { value: "Industrial / Chemical", label: "Industrial / Chemical Exposure", desc: "Acid rain, sulfur dioxide, aggressive chemical effluent" },
  { value: "Subterranean / Foundation", label: "Subterranean / Foundation Exposure", desc: "Sulfate attack from groundwater, aggressive soil salinity" },
  { value: "Severe / Alpine Freeze-Thaw", label: "Severe / Alpine Freeze-Thaw (Himalayan)", desc: "Sub-zero transitions (-20°C), de-icing salts in Himalayan corridors (USBRL)" }
];

export const BUDGET_RANGES = [
  { value: "Low", label: "Low Budget Priority", desc: "Cost-sensitive, standard local commoditized materials preferred" },
  { value: "Medium", label: "Medium Balanced", desc: "Balanced capital expenditure with predictable maintenance profile" },
  { value: "High", label: "High / Premium Performance", desc: "High upfront capital acceptable for high performance and durability" }
];

export const SPECIAL_REQUIREMENTS = [
  { id: "High Compressive Strength", label: "High Compressive Strength", tag: "f'c > 60 MPa (M60-M80)", desc: "Critical for heavily loaded columns, arches & caissons" },
  { id: "High Tensile Strength", label: "High Tensile Strength", tag: "fy > 500 MPa (Fe 500D / 550D)", desc: "Essential for flexural tension, suspension links, and slender members" },
  { id: "Lightweight Construction", label: "Lightweight Construction", tag: "Density < 2200 kg/m³", desc: "Reduces dead load, foundation demand and transport footprint" },
  { id: "Extreme Fire Resistance", label: "Extreme Fire Resistance", tag: "2 to 4 hr rating", desc: "High temperature stability without catastrophic loss of capacity" },
  { id: "High Corrosion Resistance", label: "High Corrosion Resistance", tag: "CPT / C5-M Class", desc: "Resists chloride pitting in coastal sea link structures" },
  { id: "Rapid Construction / Fast-Track Delivery", label: "Rapid Construction / Fast-Track", tag: "Speed Index", desc: "Enables accelerated project schedules and off-site modular assembly" },
  { id: "Precasting Capability", label: "Precasting Capability", tag: "Segmental Casting", desc: "Fabricated off-site with strict tolerance and high-early strength" },
  { id: "Ductility & Seismic Energy Dissipation", label: "Ductility & Seismic Dissipation", tag: "IS 13920 Detailing", desc: "High strain capacity to absorb seismic energy without sudden brittle collapse" },
  { id: "Low Maintenance Lifecycle", label: "Low Maintenance Lifecycle", tag: "100+ Yr LCC", desc: "Minimal recoating, cathodic protection, or scheduled retrofits" },
  { id: "Waterproof / Impermeable Membrane Quality", label: "Waterproof / Impermeable Quality", tag: "IS 2645 Low Perm", desc: "High hydraulic resistance against seepage and water head pressure" }
];

export const DESIGN_LIFE_MILESTONES = [10, 25, 50, 75, 100, 120, 200];

export const ENGINEERING_PRESETS = [
  {
    name: "Mumbai Trans Harbour Link (Atal Setu)",
    badge: "IRC:112 Marine",
    description: "Marine pier pylon subjected to Arabian Sea tidal splash, demanding 100+ year durability and chloride impermeability.",
    data: {
      structureType: "Highway Bridge",
      structuralElement: "Pier / Pylon",
      loadType: "Dynamic / Traffic Load",
      designLife: 120,
      environmentalCondition: "Marine / Coastal",
      budgetRange: "High",
      sustainabilityPreference: true,
      specialRequirements: [
        "High Compressive Strength",
        "High Corrosion Resistance",
        "Ductility & Seismic Energy Dissipation",
        "Low Maintenance Lifecycle"
      ]
    }
  },
  {
    name: "Chenab Rail Arch Bridge",
    badge: "IS 800 / IRS",
    description: "Deep gorge steel arch rib resisting 266 km/h Himalayan winds and Zone V seismic accelerations at -20°C.",
    data: {
      structureType: "Railway / Metro Bridge",
      structuralElement: "Arch Rib",
      loadType: "Dead + Live + Wind Load",
      designLife: 120,
      environmentalCondition: "Severe / Alpine Freeze-Thaw",
      budgetRange: "High",
      sustainabilityPreference: false,
      specialRequirements: [
        "High Tensile Strength",
        "Ductility & Seismic Energy Dissipation",
        "Low Maintenance Lifecycle"
      ]
    }
  },
  {
    name: "GIFT City Diamond Tower Core",
    badge: "IS 16700 Tall",
    description: "Slender central shear wall and composite columns resisting combined wind, seismic, and axial gravity loads.",
    data: {
      structureType: "Commercial Building",
      structuralElement: "Column",
      loadType: "Dead + Live + Seismic Load",
      designLife: 100,
      environmentalCondition: "Moderate / Inland Dry",
      budgetRange: "Medium",
      sustainabilityPreference: true,
      specialRequirements: [
        "High Compressive Strength",
        "Extreme Fire Resistance",
        "Ductility & Seismic Energy Dissipation",
        "Rapid Construction / Fast-Track Delivery"
      ]
    }
  },
  {
    name: "Bullet Train Elevated Viaduct",
    badge: "NHSRCL Precast",
    description: "Full-span precast segmental box girder demanding high dynamic stiffness and low maintenance.",
    data: {
      structureType: "Railway / Metro Bridge",
      structuralElement: "Bridge Deck / Girder",
      loadType: "Dynamic / Traffic Load",
      designLife: 100,
      environmentalCondition: "Moderate / Inland Dry",
      budgetRange: "Medium",
      sustainabilityPreference: true,
      specialRequirements: [
        "Precasting Capability",
        "Rapid Construction / Fast-Track Delivery",
        "High Compressive Strength"
      ]
    }
  }
];
