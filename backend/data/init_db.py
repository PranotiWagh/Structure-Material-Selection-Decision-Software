"""
Database Initialization Script for SM-DSS (Indian Infrastructure Standards)
Populates materials.db from dataset/materials_database_1000.csv with IS 456, IS 2062, IS 1786, IRC:112 benchmarks.
"""
import os
import csv
import sqlite3

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, "..", ".."))
DATABASE_DIR = os.path.join(PROJECT_ROOT, "database")
DB_PATH = os.path.join(DATABASE_DIR, "materials.db")
DATASET_DIR = os.path.join(PROJECT_ROOT, "dataset")
DATASET_CSV = os.path.join(DATASET_DIR, "materials_database_1000.csv")
BACKEND_CSV = os.path.join(BASE_DIR, "materials_database_1000.csv")

def load_materials_from_dataset():
    if not os.path.exists(DATASET_CSV):
        print(f"Error: {DATASET_CSV} not found.")
        return []

    records = []
    with open(DATASET_CSV, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader):
            mat_id = row.get("material_id") or row.get("id") or f"M{idx+1:04d}"
            name = row.get("material_name") or row.get("name") or f"Structural Material #{idx+1:04d}"
            cat = row.get("category", "Normal Concrete")
            comp = float(row.get("compressive_strength_mpa") or row.get("compressive_strength", 30))
            tens = float(row.get("tensile_strength_mpa") or row.get("tensile_strength", 3))
            density = int(float(row.get("density_kg_m3") or row.get("density", 2400)))
            cost_inr = float(row.get("cost_inr_m3") or 10000.0)
            durability = float(row.get("durability_score") or 7.0)
            corrosion = float(row.get("corrosion_resistance_score") or row.get("corrosion_resistance", 7.0))
            fire = float(row.get("fire_resistance_score") or row.get("fire_rating", 7.0))
            co2 = float(row.get("co2_emission_kg_m3") or row.get("embodied_carbon", 300.0))
            maintenance = float(row.get("maintenance_score") or 7.0)

            # Cost tier
            cost_index = "Low" if cost_inr <= 12000 else ("High" if cost_inr > 70000 else "Medium")

            # Determine standards and realistic civil engineering attributes
            standards = "IS 456:2000"
            desc = "Standard structural material engineered for Indian infrastructure applications."
            precast = 1
            ductility = 7.0
            water_imp = 7.5
            speed = 7.5
            life = 100
            elastic = 30.0

            if "Concrete" in cat or cat == "Precast Concrete" or cat == "Normal Concrete":
                elastic = round((5000 * (comp ** 0.5) / 1000), 1)
                standards = "IS 456:2000 / IS 10262"
                speed = 6.5
                ductility = 6.8
                water_imp = 7.8
                life = 80
                desc = "Engineered structural concrete mix with grading conforming to IS 456:2000."
                if cat == "Ultra High Performance Concrete":
                    standards = "IRC:112-2020 / ACI 239R"
                    speed = 8.5
                    ductility = 8.5
                    water_imp = 9.8
                    life = 200
                    desc = "Ultra-high performance concrete reinforced with steel micro-fibers per IRC:112."
                elif cat == "High Performance Concrete":
                    standards = "IS 456:2000 / IRC:112-2020"
                    speed = 7.5
                    ductility = 7.2
                    water_imp = 9.2
                    life = 120
                    desc = "Micro-silica densified high performance concrete for major bridges and towers."
                elif cat == "Precast Concrete":
                    standards = "IRC:112-2020 / IS 15916"
                    speed = 9.2
                    ductility = 7.2
                    water_imp = 9.0
                    life = 100
                    desc = "Off-site match-cast segmental girder and slab concrete."
                elif cat == "Fiber Reinforced Concrete":
                    standards = "IS 456:2000 / ACI 544"
                    speed = 7.2
                    ductility = 8.2
                    water_imp = 8.8
                    life = 90
                    desc = "Fiber reinforced concrete offering superior crack arresting and post-yield toughness."
                elif cat == "Specialty Concrete":
                    standards = "IS 456:2000 / IS 10262:2019"
                    speed = 7.5
                    ductility = 6.8
                    water_imp = 8.5
                    life = 85
                    desc = "Specialized flowable or compactable concrete mix for complex structural geometry."

            elif cat in ["Structural Steel", "Weathering Steel", "Stainless Steel"]:
                elastic = 200.0
                speed = 9.2
                ductility = 9.4
                water_imp = 9.6
                life = 120
                if cat == "Structural Steel":
                    standards = "IS 2062:2011 / IS 800:2007"
                    desc = "Hot-rolled structural steel sections and plates conforming to IS 2062 standards."
                    if "TMT" in name:
                        standards = "IS 1786:2008 / IS 13920"
                        desc = "Thermo-mechanically treated high-yield rebar for earthquake-resistant ductile frames."
                elif cat == "Weathering Steel":
                    standards = "IS 11587:2012 / ASTM A588"
                    life = 140
                    desc = "Atmospheric corrosion-resistant structural steel that forms a protective oxide patina."
                elif cat == "Stainless Steel":
                    standards = "IS 6911:2017 / ASTM A240"
                    life = 200
                    desc = "High-alloy corrosion resistant steel with supreme passivity against chloride pitting."

            elif cat == "FRP Composites":
                elastic = 190.0
                speed = 9.2
                ductility = 4.2
                water_imp = 9.7
                life = 150
                standards = "IS 18255:2023 / IRC:112"
                desc = "Non-corrosive continuous fiber reinforced polymer matrix for harsh marine environments."

            elif cat == "Timber / Engineered Wood":
                elastic = 12.5
                speed = 9.4
                ductility = 6.2
                water_imp = 5.2
                life = 80
                standards = "IS 1708 / IS 883 / Eurocode 5"
                desc = "Cross-laminated and engineered structural wood panels sequestering biogenic carbon."

            elif cat == "Sustainable & Eco-Friendly":
                elastic = round((5000 * (comp ** 0.5) / 1000), 1)
                standards = "IS 17452:2020 / IS 383:2016"
                speed = 7.8
                ductility = 7.0
                water_imp = 8.9
                life = 110
                desc = "Low-carbon geopolymer or recycled aggregate concrete promoting circular economy."

            elif cat == "Masonry":
                precast = 0
                elastic = round(1.0 * comp, 1)
                speed = 5.5
                ductility = 4.8
                water_imp = 6.5
                life = 70
                standards = "IS 2185 / IS 1077 / IS 1905"
                desc = "Structural load-bearing masonry units meeting Indian bureau of standards specifications."

            elif cat == "Non-Ferrous Metals":
                elastic = 70.0
                speed = 9.3
                ductility = 8.4
                water_imp = 9.5
                life = 100
                standards = "IS 733:1983 / Eurocode 9"
                desc = "Extruded lightweight structural aluminum profiles with high strength-to-weight ratio."

            records.append({
                "id": mat_id,
                "name": name,
                "category": cat,
                "compressive_strength": comp,
                "tensile_strength": tens,
                "density": density,
                "elastic_modulus": elastic,
                "embodied_carbon": int(co2),
                "cost_index": cost_index,
                "cost_inr_m3": cost_inr,
                "co2_emission_kg_m3": co2,
                "durability_score": durability,
                "corrosion_resistance_score": corrosion,
                "fire_resistance_score": fire,
                "maintenance_score": maintenance,
                "fire_rating": fire,
                "corrosion_resistance": corrosion,
                "precast_suitability": precast,
                "ductility_rating": ductility,
                "water_impermeability": water_imp,
                "speed_score": speed,
                "max_design_life": life,
                "standards": standards,
                "description": desc
            })

    return records

def init_sqlite(records):
    os.makedirs(DATABASE_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS materials (
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
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS project_evaluations (
        id TEXT PRIMARY KEY,
        project_name TEXT NOT NULL,
        structure_type TEXT NOT NULL,
        structural_element TEXT NOT NULL,
        load_type TEXT NOT NULL,
        design_life INTEGER NOT NULL,
        environmental_condition TEXT NOT NULL,
        budget_range TEXT NOT NULL,
        sustainability_preference INTEGER NOT NULL,
        special_requirements TEXT,
        top_recommendation TEXT,
        suitability_score INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("DELETE FROM materials;")
    
    insert_sql = """
    INSERT INTO materials (
        id, name, category, compressive_strength, tensile_strength, density,
        elastic_modulus, embodied_carbon, cost_index, cost_inr_m3, co2_emission_kg_m3,
        durability_score, corrosion_resistance_score, fire_resistance_score, maintenance_score,
        fire_rating, corrosion_resistance, precast_suitability, ductility_rating,
        water_impermeability, speed_score, max_design_life, standards, description
    ) VALUES (
        :id, :name, :category, :compressive_strength, :tensile_strength, :density,
        :elastic_modulus, :embodied_carbon, :cost_index, :cost_inr_m3, :co2_emission_kg_m3,
        :durability_score, :corrosion_resistance_score, :fire_resistance_score, :maintenance_score,
        :fire_rating, :corrosion_resistance, :precast_suitability, :ductility_rating,
        :water_impermeability, :speed_score, :max_design_life, :standards, :description
    );
    """
    cursor.executemany(insert_sql, records)
    conn.commit()
    count = cursor.execute("SELECT COUNT(*) FROM materials").fetchone()[0]
    conn.close()
    print(f"Loaded {count} materials into SQLite database at {DB_PATH}")

if __name__ == "__main__":
    records = load_materials_from_dataset()
    if records:
        init_sqlite(records)
