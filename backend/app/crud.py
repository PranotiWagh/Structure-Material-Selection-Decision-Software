import bcrypt
import uuid
from sqlalchemy.orm import Session
from typing import List, Optional
from . import models, schemas

# ----------------------------------------------------
# BCRYPT PASSWORD HASHING & VERIFICATION
# ----------------------------------------------------
def hash_password(password: str) -> str:
    """Compute secure bcrypt hash for password storage."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against stored bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        # Graceful fallback for legacy sha256 hashes if any
        import hashlib
        legacy = hashlib.sha256((plain_password + "smdss_structural_salt_2026").encode('utf-8')).hexdigest()
        return legacy == hashed_password

# ----------------------------------------------------
# USER & AUTH CRUD (Using database/users.db)
# ----------------------------------------------------
def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email.strip().lower()).first()

def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.username == username.strip().lower()).first()

def get_user_by_identifier(db: Session, identifier: str) -> Optional[models.User]:
    clean = identifier.strip().lower()
    return db.query(models.User).filter(
        (models.User.email == clean) | (models.User.username == clean)
    ).first()

def get_user_by_id(db: Session, user_id: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user_with_role(db: Session, user: schemas.UserRegisterBase, role: str) -> models.User:
    clean_email = user.email.strip().lower()
    clean_username = user.username.strip().lower() if user.username else clean_email.split('@')[0]
    
    db_user = models.User(
        id=f"usr_{role[:3]}_{uuid.uuid4().hex[:8]}",
        email=clean_email,
        username=clean_username,
        role=role.lower(),
        password_hash=hash_password(user.password),
        name=user.name or f"{role.capitalize()} Engineer",
        department=user.department or "Civil & Infrastructure Department"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def reset_user_password(db: Session, email: str, new_password: str) -> Optional[models.User]:
    db_user = get_user_by_email(db, email)
    if not db_user:
        return None
    db_user.password_hash = hash_password(new_password)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_users(db: Session, role: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[models.User]:
    query = db.query(models.User)
    if role and role.lower() != "all":
        query = query.filter(models.User.role == role.lower())
    return query.order_by(models.User.created_at.desc()).offset(skip).limit(limit).all()

def delete_user_by_id(db: Session, user_id: str) -> bool:
    user = get_user_by_id(db, user_id)
    if not user:
        return False
    db.delete(user)
    db.commit()
    return True

# ----------------------------------------------------
# MATERIALS CRUD (Using database/materials.db)
# ----------------------------------------------------
def get_materials(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    category: Optional[str] = None,
    search: Optional[str] = None
) -> List[models.Material]:
    query = db.query(models.Material)
    if category and category != "All":
        query = query.filter(models.Material.category == category)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (models.Material.name.ilike(search_filter)) |
            (models.Material.standards.ilike(search_filter)) |
            (models.Material.category.ilike(search_filter))
        )
    return query.offset(skip).limit(limit).all()

def get_material_by_id(db: Session, material_id: str) -> Optional[models.Material]:
    return db.query(models.Material).filter(models.Material.id == material_id).first()

def create_material(db: Session, material: schemas.MaterialCreate) -> models.Material:
    db_mat = models.Material(**material.model_dump())
    db.add(db_mat)
    db.commit()
    db.refresh(db_mat)
    return db_mat

def update_material(db: Session, material_id: str, material: schemas.MaterialBase) -> Optional[models.Material]:
    db_mat = get_material_by_id(db, material_id)
    if not db_mat:
        return None
    for key, value in material.model_dump().items():
        setattr(db_mat, key, value)
    db.commit()
    db.refresh(db_mat)
    return db_mat

def delete_material(db: Session, material_id: str) -> bool:
    db_mat = get_material_by_id(db, material_id)
    if not db_mat:
        return False
    db.delete(db_mat)
    db.commit()
    return True

def count_materials(db: Session) -> int:
    return db.query(models.Material).count()

# ----------------------------------------------------
# PROJECT EVALUATION CRUD (database/materials.db)
# ----------------------------------------------------
def create_project_evaluation(db: Session, project: schemas.ProjectEvaluationCreate) -> models.ProjectEvaluation:
    proj_data = project.model_dump()
    if not proj_data.get("id"):
        proj_data["id"] = f"PRJ-{uuid.uuid4().hex[:8].upper()}"
    
    db_proj = models.ProjectEvaluation(**proj_data)
    db.add(db_proj)
    db.commit()
    db.refresh(db_proj)
    return db_proj

def get_project_evaluations(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None
) -> List[models.ProjectEvaluation]:
    query = db.query(models.ProjectEvaluation)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (models.ProjectEvaluation.project_name.ilike(search_filter)) |
            (models.ProjectEvaluation.structure_type.ilike(search_filter)) |
            (models.ProjectEvaluation.client_name.ilike(search_filter)) |
            (models.ProjectEvaluation.top_recommendation.ilike(search_filter))
        )
    return query.order_by(models.ProjectEvaluation.created_at.desc()).offset(skip).limit(limit).all()

def get_project_evaluation_by_id(db: Session, project_id: str) -> Optional[models.ProjectEvaluation]:
    return db.query(models.ProjectEvaluation).filter(models.ProjectEvaluation.id == project_id).first()

def delete_project_evaluation(db: Session, project_id: str) -> bool:
    db_proj = get_project_evaluation_by_id(db, project_id)
    if not db_proj:
        return False
    db.delete(db_proj)
    db.commit()
    return True

def count_project_evaluations(db: Session) -> int:
    return db.query(models.ProjectEvaluation).count()

def get_dashboard_metrics(db: Session):
    total_materials = count_materials(db)
    total_searches = count_project_evaluations(db)
    
    avg_score = 0.0
    if total_searches > 0:
        from sqlalchemy import func
        score_res = db.query(func.avg(models.ProjectEvaluation.suitability_score)).scalar()
        if score_res is not None:
            avg_score = round(float(score_res), 1)

    recent_searches = get_project_evaluations(db, skip=0, limit=5)

    return {
        "total_materials": total_materials,
        "total_searches": total_searches,
        "average_score": avg_score,
        "recent_searches": recent_searches
    }

# ----------------------------------------------------
# MCDM CRITERIA, AHP MATRICES, & EVALUATION LOGS CRUD
# ----------------------------------------------------
import json

DEFAULT_CRITERIA_LIST = [
    {
        "id": "crit_compressive_strength",
        "name": "Compressive Strength",
        "code": "compressive_strength",
        "unit_type": "MPa",
        "is_benefit": True,
        "default_weight": 0.30,
        "description": "Characteristic 28-day compressive yield capacity under axial load (IS 456 / IS 516)."
    },
    {
        "id": "crit_density",
        "name": "Material Density",
        "code": "density",
        "unit_type": "kg/m³",
        "is_benefit": False,  # Lower is better (reduces structural self-weight and seismic inertia)
        "default_weight": 0.15,
        "description": "Self-weight density. Lower values reduce dead-load moments and foundation dimensions."
    },
    {
        "id": "crit_cost_inr_m3",
        "name": "Cost per Unit Volume",
        "code": "cost_inr_m3",
        "unit_type": "₹/m³",
        "is_benefit": False,  # Lower cost is better
        "default_weight": 0.20,
        "description": "Installed unit volume procurement and casting investment rate in Indian Rupees (₹)."
    },
    {
        "id": "crit_embodied_carbon",
        "name": "Carbon Footprint",
        "code": "embodied_carbon",
        "unit_type": "kg CO₂/m³",
        "is_benefit": False,  # Lower carbon is better
        "default_weight": 0.15,
        "description": "Cradle-to-gate embodied carbon emissions per cubic meter according to Indian Green Building Council (IGBC)."
    },
    {
        "id": "crit_durability_score",
        "name": "Durability & Corrosion Resistance",
        "code": "durability_score",
        "unit_type": "Score (1-10)",
        "is_benefit": True,
        "default_weight": 0.20,
        "description": "Resistance to chloride ingress, sulfate attack, carbonation, and aggressive environmental exposure."
    }
]

def seed_default_criteria(db: Session):
    """Initializes standard civil engineering evaluation criteria if table is empty."""
    count = db.query(models.EvaluationCriteria).count()
    if count == 0:
        for item in DEFAULT_CRITERIA_LIST:
            crit = models.EvaluationCriteria(**item)
            db.add(crit)
        db.commit()

def get_all_criteria(db: Session) -> List[models.EvaluationCriteria]:
    seed_default_criteria(db)
    return db.query(models.EvaluationCriteria).order_by(models.EvaluationCriteria.created_at.asc()).all()

def get_criteria_by_code(db: Session, code: str) -> Optional[models.EvaluationCriteria]:
    return db.query(models.EvaluationCriteria).filter(models.EvaluationCriteria.code == code).first()

def create_or_update_criteria(db: Session, crit: schemas.CriteriaCreate) -> models.EvaluationCriteria:
    existing = get_criteria_by_code(db, crit.code)
    if existing:
        existing.name = crit.name
        existing.unit_type = crit.unit_type
        existing.is_benefit = crit.is_benefit
        existing.default_weight = crit.default_weight
        existing.description = crit.description
        db.commit()
        db.refresh(existing)
        return existing
    
    crit_id = crit.id or f"crit_{crit.code.lower()}_{uuid.uuid4().hex[:6]}"
    new_crit = models.EvaluationCriteria(
        id=crit_id,
        name=crit.name,
        code=crit.code,
        unit_type=crit.unit_type,
        is_benefit=crit.is_benefit,
        default_weight=crit.default_weight,
        description=crit.description
    )
    db.add(new_crit)
    db.commit()
    db.refresh(new_crit)
    return new_crit

def get_ahp_matrices(db: Session) -> List[models.AHPPairwiseMatrix]:
    return db.query(models.AHPPairwiseMatrix).order_by(models.AHPPairwiseMatrix.created_at.desc()).all()

def get_ahp_matrix_by_id(db: Session, matrix_id: str) -> Optional[models.AHPPairwiseMatrix]:
    return db.query(models.AHPPairwiseMatrix).filter(models.AHPPairwiseMatrix.id == matrix_id).first()

def save_ahp_matrix(
    db: Session,
    name: str,
    criteria_codes: List[str],
    matrix: List[List[float]],
    ahp_calc_result: dict,
    created_by: str = "Admin Engineer"
) -> models.AHPPairwiseMatrix:
    matrix_id = f"AHP-{uuid.uuid4().hex[:8].upper()}"
    db_matrix = models.AHPPairwiseMatrix(
        id=matrix_id,
        name=name,
        criteria_codes_json=json.dumps(criteria_codes),
        matrix_json=json.dumps(matrix),
        weights_json=json.dumps(ahp_calc_result.get("weights_list", [])),
        lambda_max=ahp_calc_result.get("lambda_max"),
        consistency_index=ahp_calc_result.get("consistency_index"),
        consistency_ratio=ahp_calc_result.get("consistency_ratio"),
        is_consistent=ahp_calc_result.get("is_consistent", True),
        created_by=created_by
    )
    db.add(db_matrix)
    db.commit()
    db.refresh(db_matrix)
    return db_matrix

def create_evaluation_log(
    db: Session,
    project_name: str,
    structure_type: str,
    materials_count: int,
    criteria_used: List[str],
    ahp_matrix: Optional[List[List[float]]],
    weights: List[float],
    topsis_scores: List[float],
    rankings: List[dict],
    top_material: Optional[str],
    top_score: Optional[float],
    executed_by: str = "Structural Engineer"
) -> models.EvaluationLog:
    log_id = f"LOG-{uuid.uuid4().hex[:8].upper()}"
    log = models.EvaluationLog(
        id=log_id,
        project_name=project_name,
        structure_type=structure_type,
        materials_evaluated_count=materials_count,
        criteria_used_json=json.dumps(criteria_used),
        ahp_matrix_json=json.dumps(ahp_matrix) if ahp_matrix else None,
        calculated_weights_json=json.dumps(weights),
        topsis_scores_json=json.dumps(topsis_scores),
        rankings_json=json.dumps(rankings),
        top_recommended_material=top_material,
        top_score=top_score,
        executed_by=executed_by
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

def get_evaluation_logs(db: Session, skip: int = 0, limit: int = 50) -> List[models.EvaluationLog]:
    return db.query(models.EvaluationLog).order_by(models.EvaluationLog.created_at.desc()).offset(skip).limit(limit).all()
