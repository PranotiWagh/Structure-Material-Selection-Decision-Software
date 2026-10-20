"""
Structural Material Selection Decision Support Software (SM-DSS)
FastAPI Backend with Multi-Role Authentication, SQLite Storage (database/users.db),
and MCDA TOPSIS Ranking Engine (database/materials.db).
"""
import os
import re
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .database import (
    materials_engine, 
    users_engine, 
    get_db, 
    get_user_db
)
from .mcdm_engine import run_topsis_evaluation
from .routers.mcdm import router as mcdm_router

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

# Initialize SQLite database schemas
models.Base.metadata.create_all(bind=materials_engine)
models.UserBase.metadata.create_all(bind=users_engine)

app = FastAPI(
    title="Structural Material Selection Decision Support API",
    description="Multi-role civil engineering decision support system with SQLite persistence, strict password rules, and MCDA TOPSIS material benchmarking.",
    version="2.0.0"
)

# Custom handler to guarantee 400 Bad Request on password complexity failures
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    errors = exc.errors()
    for err in errors:
        msg = err.get("msg", "")
        loc = err.get("loc", [])
        if "password" in loc or "Password" in msg:
            clean_msg = msg.replace("Value error, ", "")
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": clean_msg}
            )
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": errors[0].get("msg", "Invalid request parameters")}
    )

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register MCDM (AHP & TOPSIS) Router
app.include_router(mcdm_router)

# ----------------------------------------------------
# DATABASE POPULATION HOOK (Reads from dataset/)
# ----------------------------------------------------
@app.on_event("startup")
def populate_db_from_dataset():
    """Populate materials.db on boot from dataset/materials_database_1000.csv if empty."""
    db = next(get_db())
    try:
        # Seed standard civil engineering MCDM criteria
        crud.seed_default_criteria(db)

        count = crud.count_materials(db)
        if count == 0:
            dataset_csv = os.path.join(
                os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")),
                "dataset",
                "materials_database_1000.csv"
            )
            if os.path.exists(dataset_csv):
                import csv
                with open(dataset_csv, mode="r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        mat_id = row.get("material_id") or row.get("id") or f"M{count+1:04d}"
                        name = row.get("material_name") or row.get("name") or "Standard Structural Material"
                        category = row.get("category", "Normal Concrete")
                        comp = float(row.get("compressive_strength_mpa") or row.get("compressive_strength", 30))
                        tens = float(row.get("tensile_strength_mpa") or row.get("tensile_strength", 3))
                        density = int(float(row.get("density_kg_m3") or row.get("density", 2400)))
                        
                        cost_inr = float(row["cost_inr_m3"]) if "cost_inr_m3" in row and row["cost_inr_m3"] else None
                        co2 = float(row["co2_emission_kg_m3"]) if "co2_emission_kg_m3" in row and row["co2_emission_kg_m3"] else None
                        dur = float(row["durability_score"]) if "durability_score" in row and row["durability_score"] else None
                        corr = float(row["corrosion_resistance_score"]) if "corrosion_resistance_score" in row and row["corrosion_resistance_score"] else None
                        fire = float(row["fire_resistance_score"]) if "fire_resistance_score" in row and row["fire_resistance_score"] else None
                        maint = float(row["maintenance_score"]) if "maintenance_score" in row and row["maintenance_score"] else None

                        # Cost index
                        cost_idx = row.get("cost_index")
                        if not cost_idx:
                            if cost_inr is not None:
                                cost_idx = "Low" if cost_inr <= 12000 else ("High" if cost_inr > 70000 else "Medium")
                            else:
                                cost_idx = "Medium"

                        fire_val = fire if fire is not None else float(row.get("fire_rating", 7.0))
                        corr_val = corr if corr is not None else float(row.get("corrosion_resistance", 7.0))
                        carbon_val = int(co2) if co2 is not None else int(float(row.get("embodied_carbon", 300)))
                        elastic_val = float(row.get("elastic_modulus", 30.0))
                        standards_val = row.get("standards", "IS 456 / IS 800")
                        desc_val = row.get("description", "Standard Indian structural material.")
                        
                        mat = schemas.MaterialCreate(
                            id=mat_id,
                            name=name,
                            category=category,
                            compressive_strength=comp,
                            tensile_strength=tens,
                            density=density,
                            elastic_modulus=elastic_val,
                            embodied_carbon=carbon_val,
                            cost_index=cost_idx,
                            cost_inr_m3=cost_inr,
                            co2_emission_kg_m3=co2,
                            durability_score=dur,
                            corrosion_resistance_score=corr,
                            fire_resistance_score=fire,
                            maintenance_score=maint,
                            fire_rating=fire_val,
                            corrosion_resistance=corr_val,
                            precast_suitability=int(row.get("precast_suitability", 1)),
                            ductility_rating=float(row.get("ductility_rating", 7.0)),
                            water_impermeability=float(row.get("water_impermeability", 7.5)),
                            speed_score=float(row.get("speed_score", 7.5)),
                            max_design_life=int(float(row.get("max_design_life", 100))),
                            standards=standards_val,
                            description=desc_val
                        )
                        crud.create_material(db, mat)
    finally:
        db.close()


# ----------------------------------------------------
# PASSWORD COMPLEXITY REGEX VALIDATOR
# ----------------------------------------------------
def enforce_password_policy(password: str):
    """
    Strict validation rule checks:
    - Minimum length: 8
    - Uppercase (A-Z)
    - Lowercase (a-z)
    - Numeric (0-9)
    - Special character (!@#$%^&*(),.?":{}|<>-)
    """
    missing = []
    if len(password) < 8:
        missing.append("At least 8 characters long")
    if not re.search(r'[A-Z]', password):
        missing.append("At least one uppercase letter (A-Z)")
    if not re.search(r'[a-z]', password):
        missing.append("At least one lowercase letter (a-z)")
    if not re.search(r'\d', password):
        missing.append("At least one numeric digit (0-9)")
    if not re.search(r'[!@#$%^&*(),.?":{}|<>\-_+=\[\]\\/~`]', password):
        missing.append("At least one special character (!@#$%^&*(),.?\":{}|<>-)")

    if missing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Password does not satisfy policy criteria: {'; '.join(missing)}."
        )

def authenticate_role_user(login_data: schemas.UserLogin, required_role: str, user_db: Session):
    clean_identifier = login_data.email.strip().lower()
    user = crud.get_user_by_identifier(user_db, clean_identifier)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No registered account found with institutional identifier '{clean_identifier}'."
        )

    if not crud.verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid credentials. Please verify your password."
        )

    if user.role.lower() != required_role.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access Denied: This account is registered with role '{user.role.upper()}'. It cannot be used to authenticate into the {required_role.upper()} portal."
        )

    return {
        "success": True,
        "message": f"Authenticated successfully into {required_role.capitalize()} Portal.",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "name": user.name,
            "role": user.role,
            "department": user.department,
            "created_at": str(user.created_at) if user.created_at else None
        },
        "token": f"jwt_{user.id}_active_session"
    }

# ----------------------------------------------------
# SYSTEM HEALTH
# ----------------------------------------------------
@app.get("/", tags=["Health"])
def root():
    return {
        "status": "online",
        "system": "Structural Material Selection Decision Support Software",
        "databases": {
            "materials": "database/materials.db",
            "users": "database/users.db"
        },
        "version": "2.0.0"
    }

# ----------------------------------------------------
# 1. ADMIN AUTHENTICATION ENDPOINTS
# ----------------------------------------------------
@app.post("/api/admin/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED, tags=["Admin Portal"])
def register_admin(user_in: schemas.AdminRegister, user_db: Session = Depends(get_user_db)):
    """Register an Administrative User into database/users.db."""
    enforce_password_policy(user_in.password)

    existing = crud.get_user_by_email(user_db, user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An administrative account with this email address already exists."
        )

    new_user = crud.create_user_with_role(user_db, user_in, role="admin")
    return new_user

@app.post("/api/admin/login", tags=["Admin Portal"])
def login_admin(login_data: schemas.UserLogin, user_db: Session = Depends(get_user_db)):
    """Authenticate Administrator credentials against database/users.db."""
    return authenticate_role_user(login_data, "admin", user_db)

# ----------------------------------------------------
# 2. EMPLOYEE AUTHENTICATION ENDPOINTS
# ----------------------------------------------------
@app.post("/api/employee/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED, tags=["Employee Portal"])
def register_employee(user_in: schemas.EmployeeRegister, user_db: Session = Depends(get_user_db)):
    """Register a Structural/Civil Engineer into database/users.db."""
    enforce_password_policy(user_in.password)

    existing = crud.get_user_by_email(user_db, user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An engineering account with this email address already exists."
        )

    new_user = crud.create_user_with_role(user_db, user_in, role="employee")
    return new_user

@app.post("/api/employee/login", tags=["Employee Portal"])
def login_employee(login_data: schemas.UserLogin, user_db: Session = Depends(get_user_db)):
    """Authenticate Engineer credentials against database/users.db."""
    return authenticate_role_user(login_data, "employee", user_db)

# ----------------------------------------------------
# 3. CUSTOMER AUTHENTICATION ENDPOINTS
# ----------------------------------------------------
@app.post("/api/customer/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED, tags=["Customer Portal"])
def register_customer(user_in: schemas.CustomerRegister, user_db: Session = Depends(get_user_db)):
    """Register a Client / Project Stakeholder into database/users.db."""
    enforce_password_policy(user_in.password)

    existing = crud.get_user_by_email(user_db, user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A customer account with this email address already exists."
        )

    new_user = crud.create_user_with_role(user_db, user_in, role="customer")
    return new_user

@app.post("/api/customer/login", tags=["Customer Portal"])
def login_customer(login_data: schemas.UserLogin, user_db: Session = Depends(get_user_db)):
    """Authenticate Client / Stakeholder credentials against database/users.db."""
    return authenticate_role_user(login_data, "customer", user_db)

# ----------------------------------------------------
# GENERAL AUTHENTICATION COMPATIBILITY & VALIDATION
# ----------------------------------------------------
@app.post("/api/auth/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED, tags=["Authentication"])
def register_general(user_in: schemas.UserRegister, user_db: Session = Depends(get_user_db)):
    enforce_password_policy(user_in.password)
    existing = crud.get_user_by_email(user_db, user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Account already registered with this email.")
    return crud.create_user_with_role(user_db, user_in, role=user_in.role)

@app.post("/api/auth/login", tags=["Authentication"])
def login_general(login_data: schemas.UserLogin, user_db: Session = Depends(get_user_db)):
    clean_identifier = login_data.email.strip().lower()
    user = crud.get_user_by_identifier(user_db, clean_identifier)
    if not user or not crud.verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials.")
    return {
        "success": True,
        "message": f"Authenticated successfully as {user.role.upper()}",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "name": user.name,
            "role": user.role,
            "department": user.department,
            "created_at": str(user.created_at) if user.created_at else None
        },
        "token": f"jwt_{user.id}_active_session"
    }

@app.post("/api/auth/validate-password-policy", tags=["Authentication"])
def validate_password_policy(payload: dict):
    password = payload.get("password", "")
    rules = {
        "minLength": len(password) >= 8,
        "hasUppercase": bool(re.search(r'[A-Z]', password)),
        "hasLowercase": bool(re.search(r'[a-z]', password)),
        "hasDigit": bool(re.search(r'\d', password)),
        "hasSpecial": bool(re.search(r'[!@#$%^&*(),.?":{}|<>\-_+=\[\]\\/~`]', password))
    }
    all_passed = all(rules.values())
    return {
        "valid": all_passed,
        "rules": rules,
        "missing": [k for k, v in rules.items() if not v]
    }

# ----------------------------------------------------
# REGISTERED USERS & EMPLOYEE ROSTER ENDPOINTS (database/users.db)
# ----------------------------------------------------
@app.get("/api/admin/employees", response_model=List[schemas.UserResponse], tags=["Admin Portal"])
def get_registered_employees(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    user_db: Session = Depends(get_user_db)
):
    """Retrieve all real registered employees from database/users.db."""
    return crud.get_users(user_db, role="employee", skip=skip, limit=limit)

@app.get("/api/users", response_model=List[schemas.UserResponse], tags=["Authentication"])
def list_registered_users(
    role: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    user_db: Session = Depends(get_user_db)
):
    """Retrieve registered users filtered by role from database/users.db."""
    return crud.get_users(user_db, role=role, skip=skip, limit=limit)

@app.delete("/api/users/{user_id}", tags=["Authentication"])
def delete_user(user_id: str, user_db: Session = Depends(get_user_db)):
    """Remove a registered user/employee from database/users.db."""
    success = crud.delete_user_by_id(user_db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User record not found in database/users.db")
    return {"message": f"User {user_id} removed successfully"}

# ----------------------------------------------------
# MATERIALS DATABASE ENDPOINTS (database/materials.db)
# ----------------------------------------------------
@app.get("/api/materials", response_model=List[schemas.MaterialResponse], tags=["Materials"])
def list_materials(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return crud.get_materials(db, skip=skip, limit=limit, category=category, search=search)

@app.get("/api/materials/count", tags=["Materials"])
def count_materials(db: Session = Depends(get_db)):
    return {"total_materials": crud.count_materials(db)}

@app.get("/api/materials/{material_id}", response_model=schemas.MaterialResponse, tags=["Materials"])
def get_material(material_id: str, db: Session = Depends(get_db)):
    mat = crud.get_material_by_id(db, material_id)
    if not mat:
        raise HTTPException(status_code=404, detail="Material not found")
    return mat

@app.post("/api/materials", response_model=schemas.MaterialResponse, status_code=201, tags=["Materials"])
def create_material(material: schemas.MaterialCreate, db: Session = Depends(get_db)):
    existing = crud.get_material_by_id(db, material.id)
    if existing:
        raise HTTPException(status_code=400, detail="Material ID already exists")
    return crud.create_material(db, material)

@app.put("/api/materials/{material_id}", response_model=schemas.MaterialResponse, tags=["Materials"])
def update_material(material_id: str, material: schemas.MaterialBase, db: Session = Depends(get_db)):
    updated = crud.update_material(db, material_id, material)
    if not updated:
        raise HTTPException(status_code=404, detail="Material not found")
    return updated

@app.delete("/api/materials/{material_id}", tags=["Materials"])
def delete_material(material_id: str, db: Session = Depends(get_db)):
    success = crud.delete_material(db, material_id)
    if not success:
        raise HTTPException(status_code=404, detail="Material not found")
    return {"message": f"Material {material_id} deleted successfully"}

# ----------------------------------------------------
# MCDM TOPSIS EVALUATION ENDPOINT
# ----------------------------------------------------
@app.post("/api/evaluate", response_model=schemas.EvaluationResponse, tags=["MCDM Evaluation"])
def evaluate_project_requirements(
    requirements: schemas.ProjectRequirementsInput,
    top_k: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db)
):
    all_materials = crud.get_materials(db, skip=0, limit=1005)
    if not all_materials:
        raise HTTPException(status_code=500, detail="Materials database empty")

    ranked_results = run_topsis_evaluation(requirements, all_materials)

    top_ranked = []
    for item in ranked_results[:top_k]:
        top_ranked.append(schemas.RankedMaterialResult(
            rank=item["rank"],
            overall_score=item["overall_score"],
            material=schemas.MaterialResponse.model_validate(item["material"]),
            scores=item["scores"],
            pros=item["pros"],
            cons=item["cons"]
        ))

    return schemas.EvaluationResponse(
        project_parameters=requirements,
        total_evaluated=len(all_materials),
        top_recommendations=top_ranked
    )

# ----------------------------------------------------
# PROJECT EVALUATION & HISTORY ENDPOINTS (SQLite database/materials.db)
# ----------------------------------------------------
@app.get("/api/projects/metrics/summary", response_model=schemas.DashboardMetricsResponse, tags=["Projects"])
@app.get("/api/dashboard/metrics", response_model=schemas.DashboardMetricsResponse, tags=["Projects"])
def get_dashboard_metrics(db: Session = Depends(get_db)):
    """Summary metrics and recent searches for the Employee Dashboard."""
    return crud.get_dashboard_metrics(db)

@app.get("/api/projects", response_model=List[schemas.ProjectEvaluationResponse], tags=["Projects"])
def list_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve historical project evaluations and searches."""
    return crud.get_project_evaluations(db, skip=skip, limit=limit, search=search)

@app.post("/api/projects", response_model=schemas.ProjectEvaluationResponse, status_code=201, tags=["Projects"])
def save_project_evaluation(
    project_in: schemas.ProjectEvaluationCreate,
    db: Session = Depends(get_db)
):
    """Save an evaluated structural project search with customer & media metadata."""
    return crud.create_project_evaluation(db, project_in)

@app.get("/api/projects/{project_id}", response_model=schemas.ProjectEvaluationResponse, tags=["Projects"])
def get_project_by_id(project_id: str, db: Session = Depends(get_db)):
    proj = crud.get_project_evaluation_by_id(db, project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project evaluation record not found")
    return proj

@app.delete("/api/projects/{project_id}", tags=["Projects"])
def delete_project_by_id(project_id: str, db: Session = Depends(get_db)):
    success = crud.delete_project_evaluation(db, project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project evaluation record not found")
    return {"message": f"Project evaluation {project_id} deleted successfully"}
