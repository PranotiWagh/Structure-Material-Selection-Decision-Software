"""
MCDM (Analytic Hierarchy Process & TOPSIS) Router
Provides API endpoints for criteria management, AHP pairwise matrix calculation,
and TOPSIS material ranking.
"""
from typing import List, Optional
import json
import numpy as np
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas, crud
from ..mcdm_engine import (
    calculate_ahp_weights,
    topsis_evaluate,
    execute_mcdm_pipeline
)

router = APIRouter(
    prefix="/api/mcdm",
    tags=["MCDM - AHP & TOPSIS"]
)

# ----------------------------------------------------
# 1. EVALUATION CRITERIA ENDPOINTS
# ----------------------------------------------------
@router.get("/criteria", response_model=List[schemas.CriteriaResponse])
def get_evaluation_criteria(db: Session = Depends(get_db)):
    """Retrieve all active civil engineering evaluation criteria."""
    return crud.get_all_criteria(db)

@router.post("/criteria", response_model=schemas.CriteriaResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_criteria(
    criteria_in: schemas.CriteriaCreate,
    db: Session = Depends(get_db)
):
    """Add or modify an engineering evaluation criterion (Benefit vs. Cost)."""
    return crud.create_or_update_criteria(db, criteria_in)


# ----------------------------------------------------
# 2. AHP PAIRWISE MATRIX & CONSISTENCY ENDPOINTS
# ----------------------------------------------------
@router.post("/ahp/calculate", response_model=schemas.AHPConsistencyResult)
def calculate_ahp_live(request: schemas.AHPPairwiseMatrixRequest):
    """
    Computes normalized criteria weights and Saaty's Consistency Ratio (CR) on-the-fly.
    Used by Admin/Employee interactive matrix sliders.
    """
    n = len(request.criteria_codes)
    if len(request.matrix) != n:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Matrix row count ({len(request.matrix)}) does not match criteria count ({n})."
        )
    for row in request.matrix:
        if len(row) != n:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Each matrix row must contain exactly {n} values."
            )

    try:
        matrix_np = np.array(request.matrix, dtype=float)
        calc_result = calculate_ahp_weights(matrix_np)
        return schemas.AHPConsistencyResult(
            weights=calc_result["weights_list"],
            lambda_max=calc_result["lambda_max"],
            consistency_index=calc_result["consistency_index"],
            consistency_ratio=calc_result["consistency_ratio"],
            is_consistent=calc_result["is_consistent"]
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/ahp-matrix", response_model=List[schemas.AHPPairwiseMatrixResponse])
def list_ahp_matrices(db: Session = Depends(get_db)):
    """List saved expert AHP comparison matrices."""
    items = crud.get_ahp_matrices(db)
    result = []
    for item in items:
        result.append(schemas.AHPPairwiseMatrixResponse(
            id=item.id,
            name=item.name,
            criteria_codes=json.loads(item.criteria_codes_json or "[]"),
            matrix=json.loads(item.matrix_json or "[]"),
            weights=json.loads(item.weights_json or "[]"),
            lambda_max=item.lambda_max,
            consistency_index=item.consistency_index,
            consistency_ratio=item.consistency_ratio,
            is_consistent=item.is_consistent,
            created_by=item.created_by,
            created_at=item.created_at
        ))
    return result

@router.post("/ahp-matrix", response_model=schemas.AHPPairwiseMatrixResponse, status_code=status.HTTP_201_CREATED)
def save_ahp_matrix(
    request: schemas.AHPPairwiseMatrixRequest,
    db: Session = Depends(get_db)
):
    """Save an approved AHP pairwise comparison matrix to SQLite."""
    try:
        matrix_np = np.array(request.matrix, dtype=float)
        calc_result = calculate_ahp_weights(matrix_np)
        saved = crud.save_ahp_matrix(
            db=db,
            name=request.name,
            criteria_codes=request.criteria_codes,
            matrix=request.matrix,
            ahp_calc_result=calc_result,
            created_by=request.created_by or "Admin Engineer"
        )
        return schemas.AHPPairwiseMatrixResponse(
            id=saved.id,
            name=saved.name,
            criteria_codes=request.criteria_codes,
            matrix=request.matrix,
            weights=calc_result["weights_list"],
            lambda_max=saved.lambda_max,
            consistency_index=saved.consistency_index,
            consistency_ratio=saved.consistency_ratio,
            is_consistent=saved.is_consistent,
            created_by=saved.created_by,
            created_at=saved.created_at
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ----------------------------------------------------
# 3. MCDM EVALUATION ENDPOINT (AHP + TOPSIS)
# ----------------------------------------------------
@router.post("/evaluate", response_model=schemas.MCDMEvaluateResponse)
def evaluate_mcdm(
    request: schemas.MCDMEvaluateRequest,
    db: Session = Depends(get_db)
):
    """
    Executes full multi-criteria decision making pipeline:
    1. Determines criteria weights via AHP pairwise comparison or weights vector.
    2. Constructs normalized and weighted decision matrices.
    3. Calculates positive/negative ideal solutions and Euclidean separation.
    4. Computes relative closeness scores and returns ordered rankings.
    5. Records run in SQLite evaluation_logs table.
    """
    # Step 1: Gather candidate materials
    candidate_materials = []
    if request.candidate_materials and len(request.candidate_materials) > 0:
        candidate_materials = request.candidate_materials
    elif request.material_ids and len(request.material_ids) > 0:
        db_mats = db.query(models.Material).filter(models.Material.id.in_(request.material_ids)).all()
        candidate_materials = db_mats
    else:
        # Default: evaluate candidate materials from database (first 100 or representative sample)
        candidate_materials = db.query(models.Material).limit(100).all()

    if not candidate_materials:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No materials available for MCDM evaluation."
        )

    # Step 2: Resolve criteria benefit flags from database if not explicitly passed
    criteria_codes = request.criteria_codes
    if not criteria_codes:
        criteria_codes = ["compressive_strength", "density", "cost_inr_m3", "embodied_carbon", "durability_score"]

    benefit_flags = request.benefit_criteria
    if not benefit_flags or len(benefit_flags) != len(criteria_codes):
        # Look up from database
        db_criteria = {c.code: c.is_benefit for c in crud.get_all_criteria(db)}
        benefit_flags = [db_criteria.get(code, True) for code in criteria_codes]

    # Step 3: Run pipeline
    try:
        pipeline_output = execute_mcdm_pipeline(
            materials_data=candidate_materials,
            criteria_codes=criteria_codes,
            benefit_flags=benefit_flags,
            pairwise_matrix=request.pairwise_matrix,
            custom_weights=request.custom_weights
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"MCDM Execution Error: {str(err)}"
        )

    # Step 4: Record log in evaluation_logs
    ranked_list = pipeline_output["ranked_materials"]
    top_item = pipeline_output["top_recommendation"]
    
    ahp_consistency = None
    if pipeline_output.get("ahp"):
        ahp_dict = pipeline_output["ahp"]
        ahp_consistency = schemas.AHPConsistencyResult(
            weights=ahp_dict["weights_list"],
            lambda_max=ahp_dict["lambda_max"],
            consistency_index=ahp_dict["consistency_index"],
            consistency_ratio=ahp_dict["consistency_ratio"],
            is_consistent=ahp_dict["is_consistent"]
        )

    try:
        closeness_list = [item["closeness_score"] for item in ranked_list]
        log_entry = crud.create_evaluation_log(
            db=db,
            project_name=request.project_name or "Infrastructure Material Benchmark",
            structure_type=request.structure_type or "Civil Structural Element",
            materials_count=len(ranked_list),
            criteria_used=criteria_codes,
            ahp_matrix=request.pairwise_matrix,
            weights=pipeline_output["weights"],
            topsis_scores=closeness_list,
            rankings=[{
                "rank": r["rank"],
                "material_id": r["material_id"],
                "material_name": r["material_name"],
                "suitability_score": r["suitability_score"]
            } for r in ranked_list[:10]],
            top_material=top_item["material_name"] if top_item else None,
            top_score=top_item["suitability_score"] if top_item else None,
            executed_by=request.executed_by or "Structural Engineer"
        )
        log_id = log_entry.id
    except Exception as e:
        log_id = None

    return schemas.MCDMEvaluateResponse(
        project_name=request.project_name or "Structural Material Selection",
        total_evaluated=len(ranked_list),
        criteria_evaluated=criteria_codes,
        weights=pipeline_output["weights"],
        ahp_consistency=ahp_consistency,
        top_recommendation=top_item,
        rankings=ranked_list,
        topsis_details=pipeline_output.get("topsis_details"),
        log_id=log_id
    )


# ----------------------------------------------------
# 4. EVALUATION AUDIT LOGS ENDPOINTS
# ----------------------------------------------------
@router.get("/logs", response_model=List[schemas.EvaluationLogResponse])
def get_evaluation_history(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Retrieve historical selection runs and ranking calculations."""
    logs = crud.get_evaluation_logs(db, skip=skip, limit=limit)
    result = []
    for log in logs:
        result.append(schemas.EvaluationLogResponse(
            id=log.id,
            project_name=log.project_name,
            structure_type=log.structure_type,
            materials_evaluated_count=log.materials_evaluated_count,
            criteria_used=json.loads(log.criteria_used_json or "[]"),
            calculated_weights=json.loads(log.calculated_weights_json or "[]"),
            top_recommended_material=log.top_recommended_material,
            top_score=log.top_score,
            executed_by=log.executed_by,
            created_at=log.created_at
        ))
    return result
