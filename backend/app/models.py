from sqlalchemy import Column, String, Integer, Float, DateTime, Text, Boolean
from sqlalchemy.sql import func
from .database import Base, UserBase

# ----------------------------------------------------
# USER AUTHENTICATION SCHEMA (Stored in database/users.db)
# ----------------------------------------------------
class User(UserBase):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, index=True)  # 'admin', 'employee', 'customer'
    name = Column(String, nullable=True)
    department = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# ----------------------------------------------------
# MATERIALS & MCDM SCHEMAS (Stored in database/materials.db)
# ----------------------------------------------------
class Material(Base):
    __tablename__ = "materials"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)
    compressive_strength = Column(Float, nullable=False)
    tensile_strength = Column(Float, nullable=False)
    density = Column(Integer, nullable=False)
    elastic_modulus = Column(Float, nullable=False)
    embodied_carbon = Column(Integer, nullable=False)
    cost_index = Column(String, nullable=False)
    cost_inr_m3 = Column(Float, nullable=True)
    co2_emission_kg_m3 = Column(Float, nullable=True)
    durability_score = Column(Float, nullable=True)
    corrosion_resistance_score = Column(Float, nullable=True)
    fire_resistance_score = Column(Float, nullable=True)
    maintenance_score = Column(Float, nullable=True)
    fire_rating = Column(Float, nullable=False)
    corrosion_resistance = Column(Float, nullable=False)
    precast_suitability = Column(Integer, nullable=False, default=1)
    ductility_rating = Column(Float, nullable=False)
    water_impermeability = Column(Float, nullable=False)
    speed_score = Column(Float, nullable=False)
    max_design_life = Column(Integer, nullable=False)
    standards = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)

    @property
    def compressive_strength_mpa(self):
        return self.compressive_strength

    @property
    def density_kg_m3(self):
        return self.density

    @property
    def cost_per_unit(self):
        return self.cost_inr_m3 if self.cost_inr_m3 is not None else 6000.0

    @property
    def carbon_footprint_kg(self):
        return self.co2_emission_kg_m3 if self.co2_emission_kg_m3 is not None else float(self.embodied_carbon)

class EvaluationCriteria(Base):
    __tablename__ = "evaluation_criteria"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True, index=True)
    code = Column(String, nullable=False, unique=True, index=True)
    unit_type = Column(String, nullable=False)
    is_benefit = Column(Boolean, nullable=False, default=True)  # True = higher is better, False = lower is better
    default_weight = Column(Float, nullable=False, default=0.2)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AHPPairwiseMatrix(Base):
    __tablename__ = "ahp_pairwise_matrices"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    criteria_codes_json = Column(Text, nullable=False)  # JSON list of criteria codes
    matrix_json = Column(Text, nullable=False)          # 2D JSON array of pairwise ratios
    weights_json = Column(Text, nullable=False)         # 1D JSON array of calculated weights
    lambda_max = Column(Float, nullable=True)
    consistency_index = Column(Float, nullable=True)
    consistency_ratio = Column(Float, nullable=True)
    is_consistent = Column(Boolean, nullable=False, default=True)
    created_by = Column(String, nullable=True, default="Admin Engineer")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class EvaluationLog(Base):
    __tablename__ = "evaluation_logs"

    id = Column(String, primary_key=True, index=True)
    project_name = Column(String, nullable=False)
    structure_type = Column(String, nullable=False)
    materials_evaluated_count = Column(Integer, nullable=False, default=0)
    criteria_used_json = Column(Text, nullable=False)
    ahp_matrix_json = Column(Text, nullable=True)
    calculated_weights_json = Column(Text, nullable=False)
    topsis_scores_json = Column(Text, nullable=False)
    rankings_json = Column(Text, nullable=False)
    top_recommended_material = Column(String, nullable=True)
    top_score = Column(Float, nullable=True)
    executed_by = Column(String, nullable=True, default="Structural Engineer")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ProjectEvaluation(Base):
    __tablename__ = "project_evaluations"

    id = Column(String, primary_key=True, index=True)
    project_name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    structure_type = Column(String, nullable=False)
    structural_element = Column(String, nullable=False)
    load_type = Column(String, nullable=False)
    design_life = Column(Integer, nullable=False)
    environmental_condition = Column(String, nullable=False)
    budget_range = Column(String, nullable=False)
    sustainability_preference = Column(Integer, nullable=False, default=0)
    special_requirements = Column(Text, nullable=True)
    client_name = Column(String, nullable=True)
    client_contact = Column(String, nullable=True)
    client_organization = Column(String, nullable=True)
    client_logo = Column(Text, nullable=True)
    site_photos = Column(Text, nullable=True)
    top_recommendation = Column(String, nullable=True)
    suitability_score = Column(Integer, nullable=True)
    ranked_materials_json = Column(Text, nullable=True)
    author = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
