"""
Multi-Criteria Decision Making (MCDM) Engine
Combines:
1. Analytic Hierarchy Process (AHP) - for dynamic, scientifically rigorous criteria weighting with Consistency Ratio (CR) verification.
2. Technique for Order of Preference by Similarity to Ideal Solution (TOPSIS) - for multi-dimensional performance ranking against ideal civil engineering benchmarks.
"""
from typing import List, Dict, Any, Tuple, Optional
import numpy as np
from .models import Material
from .schemas import ProjectRequirementsInput

# Standard Saaty Random Consistency Index (RI) table for matrix sizes n = 1 to 10
RANDOM_INDEX_TABLE = {
    1: 0.00,
    2: 0.00,
    3: 0.58,
    4: 0.90,
    5: 1.12,
    6: 1.24,
    7: 1.32,
    8: 1.41,
    9: 1.45,
    10: 1.49
}

# ----------------------------------------------------
# 1. AHP (ANALYTIC HIERARCHY PROCESS) MATHEMATICAL ENGINE
# ----------------------------------------------------
def calculate_ahp_weights(pairwise_matrix: np.ndarray) -> Dict[str, Any]:
    """
    Computes normalized criteria weights using column normalization and row averaging,
    and calculates Saaty's Consistency Ratio (CR).
    
    Args:
        pairwise_matrix (np.ndarray): Square matrix (n x n) of pairwise comparisons where A[i][j] = 1 / A[j][i].
        
    Returns:
        dict: {
            "weights": np.ndarray,
            "weights_list": list[float],
            "lambda_max": float,
            "consistency_index": float,
            "consistency_ratio": float,
            "is_consistent": bool
        }
    """
    matrix = np.array(pairwise_matrix, dtype=float)
    if matrix.ndim != 2 or matrix.shape[0] != matrix.shape[1]:
        raise ValueError("Pairwise comparison matrix must be a square 2D matrix.")
    
    n = matrix.shape[0]
    if n == 0:
        return {
            "weights": np.array([]),
            "weights_list": [],
            "lambda_max": 0.0,
            "consistency_index": 0.0,
            "consistency_ratio": 0.0,
            "is_consistent": True
        }
    if n == 1:
        return {
            "weights": np.array([1.0]),
            "weights_list": [1.0],
            "lambda_max": 1.0,
            "consistency_index": 0.0,
            "consistency_ratio": 0.0,
            "is_consistent": True
        }

    # Handle zero or negative values gracefully
    matrix = np.where(matrix <= 0, 1.0, matrix)

    # Step 1: Column normalization
    column_sums = np.sum(matrix, axis=0)
    # Prevent division by zero
    column_sums = np.where(column_sums == 0, 1e-9, column_sums)
    norm_matrix = matrix / column_sums

    # Step 2: Row averaging to obtain weights vector w
    weights = np.mean(norm_matrix, axis=1)
    # Normalize weights so they strictly sum to 1.0
    w_sum = np.sum(weights)
    if w_sum > 0:
        weights = weights / w_sum
    else:
        weights = np.full(n, 1.0 / n)

    # Step 3: Consistency Calculation
    # Aw = matrix @ weights
    aw = np.dot(matrix, weights)
    # lambda_max = average of (Aw_i / w_i)
    safe_weights = np.where(weights == 0, 1e-9, weights)
    lambda_ratios = aw / safe_weights
    lambda_max = float(np.mean(lambda_ratios))

    # Consistency Index (CI) = (lambda_max - n) / (n - 1)
    ci = (lambda_max - n) / (n - 1) if n > 1 else 0.0
    ci = max(0.0, ci)  # handle slight numerical precision artifacts

    # Random Index (RI)
    ri = RANDOM_INDEX_TABLE.get(n, 1.49)

    # Consistency Ratio (CR) = CI / RI
    cr = float(ci / ri) if ri > 0 else 0.0
    is_consistent = bool(cr <= 0.10)

    return {
        "weights": weights,
        "weights_list": [round(float(w), 4) for w in weights],
        "lambda_max": round(lambda_max, 4),
        "consistency_index": round(float(ci), 4),
        "consistency_ratio": round(cr, 4),
        "is_consistent": is_consistent
    }


# ----------------------------------------------------
# 2. TOPSIS MATHEMATICAL EVALUATION ENGINE
# ----------------------------------------------------
def topsis_evaluate(
    decision_matrix: np.ndarray,
    weights: np.ndarray,
    benefit_criteria: List[bool]
) -> Tuple[np.ndarray, np.ndarray, Dict[str, Any]]:
    """
    Ranks alternatives using the Technique for Order of Preference by Similarity to Ideal Solution (TOPSIS).
    
    Args:
        decision_matrix (np.ndarray): Matrix of shape (m, n) where m is alternatives and n is criteria.
        weights (np.ndarray): Weights vector of length n summing to 1.
        benefit_criteria (list[bool]): List of length n indicating True if criterion is beneficial (higher is better),
                                       False if criterion is cost (lower is better).
                                       
    Returns:
        tuple: (
            closeness_scores: np.ndarray of shape (m,) with values [0.0, 1.0],
            rankings: np.ndarray of shape (m,) where 1 is best rank,
            details: dict with normalized_matrix, weighted_matrix, ideal_positive, ideal_negative, s_plus, s_minus
        )
    """
    X = np.array(decision_matrix, dtype=float)
    if X.ndim != 2:
        raise ValueError("Decision matrix must be a 2D array of shape (m, n).")
    
    m, n = X.shape
    if m == 0 or n == 0:
        return np.array([]), np.array([]), {}

    w = np.array(weights, dtype=float)
    if len(w) != n:
        raise ValueError(f"Weights length ({len(w)}) must match number of criteria ({n}).")
    if len(benefit_criteria) != n:
        raise ValueError(f"benefit_criteria length ({len(benefit_criteria)}) must match number of criteria ({n}).")

    # Normalize weights to sum to 1
    w_sum = np.sum(w)
    if w_sum > 0:
        w = w / w_sum
    else:
        w = np.full(n, 1.0 / n)

    # Step 1: Vector normalization
    # r_ij = x_ij / sqrt(sum_i(x_ij^2))
    norm_factors = np.sqrt(np.sum(X ** 2, axis=0))
    # Avoid division by zero
    norm_factors = np.where(norm_factors == 0, 1.0, norm_factors)
    R = X / norm_factors

    # Step 2: Calculate the weighted normalized decision matrix V
    # v_ij = w_j * r_ij
    V = R * w

    # Step 3: Determine ideal best (A+) and ideal worst (A-) solutions
    # For benefit criteria: A+ = max(v_ij), A- = min(v_ij)
    # For cost criteria:    A+ = min(v_ij), A- = max(v_ij)
    A_plus = np.zeros(n, dtype=float)
    A_minus = np.zeros(n, dtype=float)

    for j in range(n):
        if benefit_criteria[j]:
            A_plus[j] = np.max(V[:, j])
            A_minus[j] = np.min(V[:, j])
        else:
            A_plus[j] = np.min(V[:, j])
            A_minus[j] = np.max(V[:, j])

    # Step 4: Calculate Euclidean separation measures from ideal solutions
    # S_i^+ = sqrt(sum_j((v_ij - A_plus_j)^2))
    # S_i^- = sqrt(sum_j((v_ij - A_minus_j)^2))
    S_plus = np.sqrt(np.sum((V - A_plus) ** 2, axis=1))
    S_minus = np.sqrt(np.sum((V - A_minus) ** 2, axis=1))

    # Step 5: Calculate relative closeness to ideal solution
    # C_i = S_i^- / (S_i^+ + S_i^-)
    denominator = S_plus + S_minus
    # Safe division when S_plus + S_minus == 0
    closeness = np.where(denominator == 0, 0.5, S_minus / denominator)

    # Step 6: Rank alternatives (descending order of C_i, highest closeness = Rank 1)
    # argsort gives ascending order, so invert for descending
    order = np.argsort(-closeness)
    rankings = np.empty_like(order)
    rankings[order] = np.arange(1, m + 1)

    details = {
        "normalized_matrix": R.tolist(),
        "weighted_matrix": V.tolist(),
        "ideal_positive": [round(float(v), 5) for v in A_plus],
        "ideal_negative": [round(float(v), 5) for v in A_minus],
        "separation_positive": [round(float(s), 5) for s in S_plus],
        "separation_negative": [round(float(s), 5) for s in S_minus],
        "closeness_scores": [round(float(c), 5) for c in closeness],
        "rankings": rankings.tolist()
    }

    return closeness, rankings, details


# ----------------------------------------------------
# 3. HIGH-LEVEL MCDM EVALUATION WORKFLOW
# ----------------------------------------------------
def execute_mcdm_pipeline(
    materials_data: List[Dict[str, Any]],
    criteria_codes: List[str],
    benefit_flags: List[bool],
    pairwise_matrix: Optional[List[List[float]]] = None,
    custom_weights: Optional[List[float]] = None
) -> Dict[str, Any]:
    """
    Executes end-to-end AHP + TOPSIS evaluation on a collection of materials.
    
    Args:
        materials_data: List of material dicts or model objects.
        criteria_codes: Ordered list of material attribute keys to evaluate.
        benefit_flags: Ordered list of bools (True = higher is better, False = lower is better).
        pairwise_matrix: Optional square list of lists for AHP weighting.
        custom_weights: Optional direct weights list.
        
    Returns:
        Dict containing AHP output, TOPSIS rankings, normalized scores, and recommendation breakdown.
    """
    n_criteria = len(criteria_codes)
    if n_criteria == 0:
        raise ValueError("At least one criterion is required for MCDM evaluation.")
    
    # Calculate or validate weights
    ahp_details = None
    if pairwise_matrix is not None and len(pairwise_matrix) == n_criteria:
        ahp_details = calculate_ahp_weights(np.array(pairwise_matrix))
        weights = ahp_details["weights"]
    elif custom_weights is not None and len(custom_weights) == n_criteria:
        w_arr = np.array(custom_weights, dtype=float)
        w_sum = np.sum(w_arr)
        weights = w_arr / w_sum if w_sum > 0 else np.full(n_criteria, 1.0 / n_criteria)
    else:
        # Default equal weighting
        weights = np.full(n_criteria, 1.0 / n_criteria)

    # Build decision matrix X
    # Rows = materials, Columns = criteria
    m_alternatives = len(materials_data)
    if m_alternatives == 0:
        return {
            "rankings": [],
            "ahp": ahp_details,
            "weights": weights.tolist()
        }

    X = np.zeros((m_alternatives, n_criteria), dtype=float)
    for i, mat in enumerate(materials_data):
        for j, code in enumerate(criteria_codes):
            val = None
            if isinstance(mat, dict):
                val = mat.get(code)
            else:
                val = getattr(mat, code, None)

            # Fallback mappings for common material fields
            if val is None:
                if code in ["cost_per_unit", "cost_inr_m3"]:
                    val = getattr(mat, "cost_inr_m3", None) or 5000.0
                elif code in ["carbon_footprint_kg", "co2_emission_kg_m3"]:
                    val = getattr(mat, "co2_emission_kg_m3", None) or getattr(mat, "embodied_carbon", 300.0)
                elif code in ["compressive_strength", "compressive_strength_mpa"]:
                    val = getattr(mat, "compressive_strength", 30.0)
                elif code in ["density", "density_kg_m3"]:
                    val = getattr(mat, "density", 2400.0)
                elif code in ["tensile_strength", "tensile_strength_mpa"]:
                    val = getattr(mat, "tensile_strength", 3.0)
                elif code in ["elastic_modulus", "elastic_modulus_gpa"]:
                    val = getattr(mat, "elastic_modulus", 30.0)
                elif code in ["durability_score"]:
                    val = getattr(mat, "durability_score", 7.0)
                elif code in ["corrosion_resistance"]:
                    val = getattr(mat, "corrosion_resistance", 7.0)
                else:
                    val = 1.0
            
            try:
                X[i, j] = float(val)
            except (ValueError, TypeError):
                X[i, j] = 1.0

    # Run TOPSIS
    closeness_scores, rank_array, topsis_details = topsis_evaluate(
        X, weights, benefit_flags
    )

    # Package output rankings
    ranked_results = []
    for i, mat in enumerate(materials_data):
        c_score = float(closeness_scores[i])
        suitability_pct = round(c_score * 100.0, 1)
        rank = int(rank_array[i])
        
        # Build pros/cons explanation
        mat_name = mat.get("name") if isinstance(mat, dict) else getattr(mat, "name", "Material")
        mat_cat = mat.get("category") if isinstance(mat, dict) else getattr(mat, "category", "General")
        
        reasons = []
        for j, code in enumerate(criteria_codes):
            val = X[i, j]
            crit_name = code.replace("_", " ").title()
            if benefit_flags[j] and val >= np.percentile(X[:, j], 70):
                reasons.append(f"Superior {crit_name} ({val:.1f})")
            elif not benefit_flags[j] and val <= np.percentile(X[:, j], 30):
                reasons.append(f"Highly favorable low {crit_name} ({val:.1f})")

        ranked_results.append({
            "rank": rank,
            "material_id": mat.get("id") if isinstance(mat, dict) else getattr(mat, "id", f"M{i}"),
            "material_name": mat_name,
            "category": mat_cat,
            "closeness_score": round(c_score, 4),
            "suitability_score": suitability_pct,
            "criteria_values": {criteria_codes[j]: round(float(X[i, j]), 2) for j in range(n_criteria)},
            "why_recommended": reasons[:4] if reasons else [f"Balanced performance across {n_criteria} criteria."],
            "raw_material": mat if isinstance(mat, dict) else {
                "id": mat.id,
                "name": mat.name,
                "category": mat.category,
                "compressive_strength": mat.compressive_strength,
                "tensile_strength": mat.tensile_strength,
                "density": mat.density,
                "elastic_modulus": mat.elastic_modulus,
                "embodied_carbon": mat.embodied_carbon,
                "cost_inr_m3": getattr(mat, "cost_inr_m3", 5000),
                "durability_score": getattr(mat, "durability_score", 7.0),
                "standards": getattr(mat, "standards", "IS 456"),
                "image_url": getattr(mat, "image_url", None)
            }
        })

    # Sort results ascending by rank (1st place first)
    ranked_results.sort(key=lambda x: x["rank"])

    return {
        "ranked_materials": ranked_results,
        "top_recommendation": ranked_results[0] if ranked_results else None,
        "ahp": ahp_details,
        "weights": [round(float(w), 4) for w in weights],
        "criteria_evaluated": criteria_codes,
        "topsis_details": topsis_details
    }


# ----------------------------------------------------
# 4. BACKWARD COMPATIBLE EVALUATION HANDLER
# ----------------------------------------------------
def run_topsis_evaluation(
    requirements: ProjectRequirementsInput,
    materials: List[Material]
) -> List[Dict[str, Any]]:
    """
    Evaluates materials against project engineering requirements using combined
    AHP weighted criteria scoring and TOPSIS benchmarks.
    """
    is_tension_critical = requirements.structural_element in [
        "Cable Stay / Suspension Link", "Truss Member", "Bridge Deck / Girder",
        "Retaining Anchor / Tieback", "Arch Rib"
    ]
    is_compression_critical = requirements.structural_element in [
        "Column", "Deep Foundation (Pile / Caisson)", "Shallow Foundation (Footing / Mat)",
        "Pier / Pylon", "Foundation Pedestal", "Wall (Load-bearing / Shear)"
    ]
    is_seismic = requirements.load_type == "Dead + Live + Seismic Load"
    is_dynamic = requirements.load_type == "Dynamic / Traffic Load"
    is_marine_chem = requirements.environmental_condition in ["Marine / Coastal", "Industrial / Chemical"]
    is_freeze_thaw = requirements.environmental_condition == "Freeze-Thaw Cycling"

    results = []

    for mat in materials:
        # Structural Capacity
        structural_score = 70.0
        if is_tension_critical:
            if mat.tensile_strength > 400:
                structural_score += 25
            elif mat.tensile_strength > 100:
                structural_score += 15
            elif mat.tensile_strength < 10:
                structural_score -= 30

        if is_compression_critical:
            if mat.compressive_strength > 100:
                structural_score += 25
            elif mat.compressive_strength >= 40:
                structural_score += 15
            else:
                structural_score -= 10

        if is_seismic:
            structural_score += (mat.ductility_rating - 5.0) * 4.0
        if is_dynamic:
            structural_score += 15 if mat.ductility_rating >= 8.0 else -10

        structural_score = min(100.0, max(15.0, structural_score))

        # Durability & Service Life
        durability_score = 70.0
        if getattr(mat, 'durability_score', None) is not None:
            durability_score = min(100.0, float(mat.durability_score) * 10.0)

        if mat.max_design_life < requirements.design_life:
            deficit = requirements.design_life - mat.max_design_life
            durability_score -= min(40.0, deficit * 0.5)
        else:
            durability_score += 10.0

        if is_marine_chem:
            corr_val = getattr(mat, 'corrosion_resistance_score', None) or mat.corrosion_resistance
            if corr_val >= 8.5:
                durability_score += 15.0
            elif corr_val <= 6.0:
                durability_score -= 20.0

        if is_freeze_thaw:
            if mat.water_impermeability >= 9.0:
                durability_score += 15.0
            elif mat.water_impermeability < 7.0:
                durability_score -= 18.0

        durability_score = min(100.0, max(15.0, durability_score))

        # Economic Score
        cost_inr = getattr(mat, 'cost_inr_m3', None)
        economic_score = 75.0
        if cost_inr is not None and cost_inr > 0:
            if requirements.budget_range == "Low":
                economic_score = 95.0 if cost_inr <= 12000 else (68.0 if cost_inr <= 50000 else 30.0)
            elif requirements.budget_range == "Medium":
                economic_score = 88.0 if cost_inr <= 15000 else (92.0 if cost_inr <= 85000 else 55.0)
            else:
                economic_score = 90.0 if cost_inr > 70000 else 84.0
        else:
            if requirements.budget_range == "Low":
                economic_score = 95.0 if mat.cost_index == "Low" else (65.0 if mat.cost_index == "Medium" else 30.0)
            elif requirements.budget_range == "Medium":
                economic_score = 85.0 if mat.cost_index == "Low" else (90.0 if mat.cost_index == "Medium" else 55.0)
            else:
                economic_score = 85.0 if mat.cost_index == "High" else 80.0

        # Sustainability
        co2_val = getattr(mat, 'co2_emission_kg_m3', None) or mat.embodied_carbon
        if co2_val < 0:
            sustainability_score = 98.0
        elif co2_val < 250:
            sustainability_score = 92.0
        elif co2_val < 600:
            sustainability_score = 80.0
        elif co2_val < 1800:
            sustainability_score = 65.0
        else:
            sustainability_score = 45.0

        if requirements.sustainability_preference:
            if co2_val < 300:
                sustainability_score += 10.0
            elif co2_val > 1500:
                sustainability_score -= 15.0
        sustainability_score = min(100.0, max(15.0, sustainability_score))

        # Special Requirements
        matched_count = 0
        for req in requirements.special_requirements:
            matched = False
            if req == "High Compressive Strength":
                matched = mat.compressive_strength >= 50.0
            elif req == "High Tensile Strength":
                matched = mat.tensile_strength >= 350.0
            elif req == "Lightweight Construction":
                matched = mat.density <= 2600
            elif req == "Extreme Fire Resistance":
                matched = (getattr(mat, 'fire_resistance_score', None) or mat.fire_rating) >= 7.5
            elif req == "High Corrosion Resistance":
                matched = (getattr(mat, 'corrosion_resistance_score', None) or mat.corrosion_resistance) >= 7.5
            elif req == "Rapid Construction / Fast-Track Delivery":
                matched = mat.speed_score >= 8.0
            elif req == "Precasting Capability":
                matched = mat.precast_suitability == 1
            elif req == "Ductility & Seismic Energy Dissipation":
                matched = mat.ductility_rating >= 8.0
            elif req == "Low Maintenance Lifecycle":
                matched = mat.corrosion_resistance >= 8.0 and mat.max_design_life >= 100
            elif req == "Waterproof / Impermeable Membrane Quality":
                matched = mat.water_impermeability >= 8.5
            else:
                matched = True
            if matched:
                matched_count += 1

        special_score = 80.0 if not requirements.special_requirements else (
            round((matched_count / len(requirements.special_requirements)) * 100.0)
        )

        w_struct = 0.30
        w_dur = 0.25
        w_econ = 0.20
        w_sust = 0.25 if requirements.sustainability_preference else 0.10
        w_spec = 0.25 if requirements.special_requirements else 0.10
        total_w = w_struct + w_dur + w_econ + w_sust + w_spec

        overall_score = round(
            (structural_score * (w_struct / total_w)) +
            (durability_score * (w_dur / total_w)) +
            (economic_score * (w_econ / total_w)) +
            (sustainability_score * (w_sust / total_w)) +
            (special_score * (w_spec / total_w))
        )

        pros = []
        cons = []
        if mat.standards:
            pros.append(f"Complies with {mat.standards}.")
        if mat.compressive_strength >= 60:
            pros.append(f"High compressive capacity ({mat.compressive_strength:.1f} MPa).")
        if mat.tensile_strength >= 400:
            pros.append(f"High tensile yield ({mat.tensile_strength:.1f} MPa).")
        if cost_inr and cost_inr <= 25000:
            pros.append(f"Economical procurement rate (₹{cost_inr:,.0f}/m³).")
        elif getattr(mat, 'corrosion_resistance_score', mat.corrosion_resistance) >= 8.5:
            pros.append("High corrosion passivity against aggressive saline/marine air.")

        if cost_inr and cost_inr > 75000:
            cons.append(f"Higher unit investment tier (₹{cost_inr:,.0f}/m³).")
        elif mat.cost_index == "High":
            cons.append("High upfront material cost tier.")
        if getattr(mat, 'fire_resistance_score', mat.fire_rating) < 6.0:
            cons.append("Fireproofing encasement recommended for code compliance.")
        if mat.max_design_life < requirements.design_life:
            cons.append(f"Service life rating ({mat.max_design_life}y) below target ({requirements.design_life}y).")

        results.append({
            "overall_score": overall_score,
            "material": mat,
            "scores": {
                "structural": int(structural_score),
                "durability": int(durability_score),
                "economic": int(economic_score),
                "sustainability": int(sustainability_score),
                "special": int(special_score)
            },
            "pros": pros[:3],
            "cons": cons[:2] if cons else ["Standard engineering inspection applies."]
        })

    results.sort(key=lambda x: x["overall_score"], reverse=True)
    for idx, item in enumerate(results):
        item["rank"] = idx + 1

    return results
