import re
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

# ----------------------------------------------------
# PASSWORD COMPLEXITY VALIDATOR (Strict 5 Rules)
# ----------------------------------------------------
def validate_password_complexity(password: str) -> str:
    missing = []
    if len(password) < 8:
        missing.append("At least 8 characters in length")
    if not re.search(r'[A-Z]', password):
        missing.append("At least one uppercase letter (A-Z)")
    if not re.search(r'[a-z]', password):
        missing.append("At least one lowercase letter (a-z)")
    if not re.search(r'\d', password):
        missing.append("At least one numeric digit (0-9)")
    if not re.search(r'[!@#$%^&*(),.?":{}|<>\-_+=\[\]\\/~`]', password):
        missing.append("At least one special character (!@#$%^&*(),.?\":{}|<>-)")

    if missing:
        raise ValueError(f"Password does not meet complexity requirements: {'; '.join(missing)}.")
    return password

# ----------------------------------------------------
# AUTHENTICATION & USER SCHEMAS
# ----------------------------------------------------
class UserRegisterBase(BaseModel):
    name: Optional[str] = "Civil Engineer"
    email: str = Field(..., min_length=4, max_length=120)
    username: Optional[str] = None
    password: str = Field(..., description="Password satisfying all 5 complexity criteria")
    department: Optional[str] = "Infrastructure & Construction"

    @field_validator("password")
    @classmethod
    def check_password_strength(cls, v: str) -> str:
        return validate_password_complexity(v)

class AdminRegister(UserRegisterBase):
    pass

class EmployeeRegister(UserRegisterBase):
    pass

class CustomerRegister(UserRegisterBase):
    pass

class UserRegister(UserRegisterBase):
    role: str = Field("employee", description="admin, employee, or customer")

class UserLogin(BaseModel):
    email: str = Field(..., description="Institutional Email or Username")
    password: str

class PasswordReset(BaseModel):
    email: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def check_new_password(cls, v: str) -> str:
        return validate_password_complexity(v)

class UserResponse(BaseModel):
    id: str
    email: str
    username: Optional[str] = None
    role: str
    name: Optional[str] = None
    department: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ----------------------------------------------------
# MATERIAL SCHEMAS
# ----------------------------------------------------
class MaterialBase(BaseModel):
    name: str
    category: str
    compressive_strength: float
    tensile_strength: float
    density: int
    elastic_modulus: float = 30.0
    embodied_carbon: int = 300
    cost_index: str = "Medium"
    cost_inr_m3: Optional[float] = None
    co2_emission_kg_m3: Optional[float] = None
    durability_score: Optional[float] = None
    corrosion_resistance_score: Optional[float] = None
    fire_resistance_score: Optional[float] = None
    maintenance_score: Optional[float] = None
    fire_rating: float = 7.0
    corrosion_resistance: float = 7.0
    precast_suitability: int = 1
    ductility_rating: float = 7.0
    water_impermeability: float = 7.5
    speed_score: float = 7.5
    max_design_life: int = 100
    standards: str = "IS 456 / IS 800"
    description: Optional[str] = None
    image_url: Optional[str] = None

class MaterialCreate(MaterialBase):
    id: str

class MaterialResponse(MaterialBase):
    id: str

    class Config:
        from_attributes = True

# ----------------------------------------------------
# PROJECT REQUIREMENTS & EVALUATION SCHEMAS
# ----------------------------------------------------
class ProjectRequirementsInput(BaseModel):
    structure_type: str = Field(..., description="Single-select structure type")
    structural_element: str = Field(..., description="Single-select structural element")
    load_type: str = Field(..., description="Single-select load type")
    design_life: int = Field(50, ge=10, le=250, description="Design life in years (10 to 250)")
    environmental_condition: str = Field(..., description="Single-select environmental condition")
    budget_range: str = Field("Medium", description="Low, Medium, or High")
    sustainability_preference: bool = Field(False, description="Prioritize low embodied carbon")
    special_requirements: List[str] = Field(default_factory=list, description="Multi-select special engineering criteria")

class RankedMaterialResult(BaseModel):
    rank: int
    overall_score: int
    material: MaterialResponse
    scores: dict
    pros: List[str]
    cons: List[str]

class EvaluationResponse(BaseModel):
    project_parameters: ProjectRequirementsInput
    total_evaluated: int
    top_recommendations: List[RankedMaterialResult]

# ----------------------------------------------------
# SAVED PROJECT EVALUATION & HISTORY SCHEMAS
# ----------------------------------------------------
class ProjectEvaluationCreate(BaseModel):
    id: Optional[str] = None
    project_name: str
    description: Optional[str] = None
    structure_type: str
    structural_element: str
    load_type: str
    design_life: int = 50
    environmental_condition: str
    budget_range: str = "Medium"
    sustainability_preference: int = 0
    special_requirements: Optional[str] = None
    client_name: Optional[str] = None
    client_contact: Optional[str] = None
    client_organization: Optional[str] = None
    client_logo: Optional[str] = None
    site_photos: Optional[str] = None
    top_recommendation: Optional[str] = None
    suitability_score: Optional[int] = None
    ranked_materials_json: Optional[str] = None
    author: Optional[str] = None

class ProjectEvaluationResponse(ProjectEvaluationCreate):
    id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DashboardMetricsResponse(BaseModel):
    total_materials: int
    total_searches: int
    average_score: float
    recent_searches: List[ProjectEvaluationResponse]

# ----------------------------------------------------
# MCDM (AHP & TOPSIS) SCHEMAS
# ----------------------------------------------------
class CriteriaBase(BaseModel):
    name: str = Field(..., description="E.g., Compressive Strength, Density, Cost")
    code: str = Field(..., description="E.g., compressive_strength, density, cost_per_unit")
    unit_type: str = Field(..., description="E.g., MPa, kg/m3, INR/m3, kg CO2/m3")
    is_benefit: bool = Field(True, description="True = Higher is better (Benefit), False = Lower is better (Cost)")
    default_weight: float = Field(0.2, ge=0.0, le=1.0)
    description: Optional[str] = None

class CriteriaCreate(CriteriaBase):
    id: Optional[str] = None

class CriteriaResponse(CriteriaBase):
    id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AHPPairwiseMatrixRequest(BaseModel):
    name: str = "Civil Structural Criteria Matrix"
    criteria_codes: List[str] = Field(..., min_length=2, description="Ordered criteria codes")
    matrix: List[List[float]] = Field(..., description="Square 2D pairwise comparison matrix where M[i][j] = 1/M[j][i]")
    created_by: Optional[str] = "Admin / Lead Structural Engineer"

class AHPConsistencyResult(BaseModel):
    weights: List[float]
    lambda_max: float
    consistency_index: float
    consistency_ratio: float
    is_consistent: bool

class AHPPairwiseMatrixResponse(BaseModel):
    id: str
    name: str
    criteria_codes: List[str]
    matrix: List[List[float]]
    weights: List[float]
    lambda_max: Optional[float] = None
    consistency_index: Optional[float] = None
    consistency_ratio: Optional[float] = None
    is_consistent: bool = True
    created_by: Optional[str] = None
    created_at: Optional[datetime] = None

class MCDMEvaluateRequest(BaseModel):
    project_name: Optional[str] = "Infrastructure Material Selection"
    structure_type: Optional[str] = "Bridge / High-Rise"
    material_ids: Optional[List[str]] = Field(default=None, description="Optional list of specific material IDs to compare. If empty, evaluates all available or candidate materials.")
    candidate_materials: Optional[List[dict]] = Field(default=None, description="Optional raw candidate material objects")
    criteria_codes: List[str] = Field(default_factory=lambda: ["compressive_strength", "density", "cost_inr_m3", "embodied_carbon", "durability_score"])
    benefit_criteria: Optional[List[bool]] = Field(default=None, description="Benefit (True) vs Cost (False) flags matching criteria_codes")
    pairwise_matrix: Optional[List[List[float]]] = Field(default=None, description="Optional square AHP pairwise comparison matrix")
    custom_weights: Optional[List[float]] = Field(default=None, description="Optional manual weights vector summing to 1")
    executed_by: Optional[str] = "Structural Engineer"

class MCDMRankedItem(BaseModel):
    rank: int
    material_id: str
    material_name: str
    category: str
    closeness_score: float
    suitability_score: float
    criteria_values: dict
    why_recommended: List[str]
    raw_material: dict

class MCDMEvaluateResponse(BaseModel):
    project_name: str
    total_evaluated: int
    criteria_evaluated: List[str]
    weights: List[float]
    ahp_consistency: Optional[AHPConsistencyResult] = None
    top_recommendation: Optional[MCDMRankedItem] = None
    rankings: List[MCDMRankedItem]
    topsis_details: Optional[dict] = None
    log_id: Optional[str] = None

class EvaluationLogResponse(BaseModel):
    id: str
    project_name: str
    structure_type: str
    materials_evaluated_count: int
    criteria_used: List[str]
    calculated_weights: List[float]
    top_recommended_material: Optional[str] = None
    top_score: Optional[float] = None
    executed_by: Optional[str] = None
    created_at: Optional[datetime] = None
