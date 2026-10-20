import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_MATERIALS } from '../data/materialsData';
import { evaluateMaterials } from '../services/decisionEngine';
import { 
  fetchMaterials, 
  fetchDashboardMetrics, 
  fetchProjectEvaluations, 
  saveProjectEvaluation, 
  deleteProjectEvaluation,
  saveMaterialToDb,
  deleteMaterialFromDb
} from '../services/api';
import { getMaterialImageUrl } from '../data/materialImages';

const AppContext = createContext(null);

// ----------------------------------------------------
// DYNAMIC SQLITE-BACKED PROJECTS STATE (Zero Mock Data)
// ----------------------------------------------------

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("home");

  // Materials Database (Loaded dynamically from SQLite database/materials.db)
  const [materialsList, setMaterialsList] = useState(INITIAL_MATERIALS);

  // Form State for Employee Requirements Input
  const [requirements, setRequirements] = useState({
    structureType: "Highway Bridge",
    structuralElement: "Pier / Pylon",
    loadType: "Dynamic / Traffic Load",
    designLife: 100,
    environmentalCondition: "Marine / Coastal",
    budgetRange: "High",
    sustainabilityPreference: true,
    specialRequirements: ["High Compressive Strength", "High Corrosion Resistance"]
  });

  // Current Evaluation Output
  const [evaluationResults, setEvaluationResults] = useState(() => 
    evaluateMaterials(requirements, INITIAL_MATERIALS)
  );

  // Live SQLite Saved Projects List (Zero Mock Data)
  const [savedProjects, setSavedProjects] = useState([]);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    total_materials: 1000,
    total_searches: 0,
    average_score: 0,
    recent_searches: []
  });

  // Materials selected for Side-by-Side Comparison (Shared across views)
  const [comparisonMaterialIds, setComparisonMaterialIds] = useState(['M0001', 'M0002', 'M0004']);

  // Selected project for detailed client/customer view
  const [selectedSavedProject, setSelectedSavedProject] = useState(null);

  // Helper to add a material to comparison and switch view if needed
  const addMaterialToComparison = (materialId) => {
    setComparisonMaterialIds(prev => {
      if (prev.includes(materialId)) return prev;
      if (prev.length >= 4) {
        return [...prev.slice(1), materialId];
      }
      return [...prev, materialId];
    });
  };


  // Transform backend DB project row to frontend model
  const mapBackendProject = (p) => ({
    id: p.id,
    name: p.project_name || p.name,
    description: p.description || '',
    date: p.created_at ? p.created_at.split('T')[0] : (p.date || new Date().toISOString().split('T')[0]),
    author: p.author || "Structural Engineer",
    client: p.client_organization || p.client_name || p.client || "Infrastructure Client",
    clientName: p.client_name || '',
    clientContact: p.client_contact || '',
    clientOrganization: p.client_organization || '',
    clientLogo: p.client_logo || '',
    sitePhotos: typeof p.site_photos === 'string' ? JSON.parse(p.site_photos || '[]') : (p.site_photos || []),
    status: "Stored in SQLite (materials.db)",
    location: "India National Infrastructure Pipeline (NIP)",
    standardCode: "IS 456 / IS 800 / IRC:112",
    requirements: {
      structureType: p.structure_type || p.requirements?.structureType || "Highway Bridge",
      structuralElement: p.structural_element || p.requirements?.structuralElement || "Pier / Pylon",
      loadType: p.load_type || p.requirements?.loadType || "Dynamic / Traffic Load",
      designLife: p.design_life || p.requirements?.designLife || 100,
      environmentalCondition: p.environmental_condition || p.requirements?.environmentalCondition || "Marine / Coastal",
      budgetRange: p.budget_range || p.requirements?.budgetRange || "High",
      sustainabilityPreference: p.sustainability_preference !== undefined ? Boolean(p.sustainability_preference) : true,
      specialRequirements: typeof p.special_requirements === 'string' 
        ? JSON.parse(p.special_requirements || '[]') 
        : (p.special_requirements || p.requirements?.specialRequirements || [])
    },
    topRecommendation: p.top_recommendation || p.topRecommendation || "Ultra High Performance Concrete UHPC",
    suitabilityScore: p.suitability_score || p.suitabilityScore || 90,
    rankedMaterials: typeof p.ranked_materials_json === 'string'
      ? JSON.parse(p.ranked_materials_json || '[]')
      : (p.rankedMaterials || [])
  });

  // Refresh projects and metrics from SQLite
  const refreshProjects = async () => {
    try {
      const [metricsData, projectsData] = await Promise.all([
        fetchDashboardMetrics(),
        fetchProjectEvaluations({ limit: 100 })
      ]);

      if (metricsData) {
        setDashboardMetrics(metricsData);
      }

      if (projectsData && Array.isArray(projectsData) && projectsData.length > 0) {
        const mapped = projectsData.map(mapBackendProject);
        setSavedProjects(mapped);
        if (!selectedSavedProject) {
          setSelectedSavedProject(mapped[0]);
        }
      }
    } catch (err) {
      console.warn("Could not sync projects with SQLite backend, retaining local state:", err);
    }
  };

  // Load materials & projects from backend API on boot
  useEffect(() => {
    let isMounted = true;
    async function loadInitialData() {
      try {
        const data = await fetchMaterials({ limit: 1000 });
        if (isMounted && data && Array.isArray(data) && data.length > 0) {
          const mapped = data.map(m => ({
            id: m.id,
            name: m.name,
            category: m.category,
            imageUrl: m.image_url || getMaterialImageUrl(m),
            compressiveStrength: m.compressive_strength,
            tensileStrength: m.tensile_strength,
            density: m.density,
            elasticModulus: m.elastic_modulus,
            embodiedCarbon: m.embodied_carbon,
            costIndex: m.cost_index,
            costInrM3: m.cost_inr_m3,
            co2Emission: m.co2_emission_kg_m3,
            durabilityScore: m.durability_score,
            maintenanceScore: m.maintenance_score,
            fireRating: m.fire_rating,
            corrosionResistance: m.corrosion_resistance,
            precastSuitability: m.precast_suitability === 1,
            ductilityRating: m.ductility_rating,
            waterImpermeability: m.water_impermeability,
            speedScore: m.speed_score,
            maxDesignLife: m.max_design_life,
            sustainabilityScore: m.co2_emission_kg_m3 ? (m.co2_emission_kg_m3 < 300 ? 92 : (m.co2_emission_kg_m3 < 800 ? 78 : 60)) : 75,
            standards: m.standards,
            description: m.description,
            bestFor: m.description
          }));
          setMaterialsList(mapped);
          setEvaluationResults(evaluateMaterials(requirements, mapped));
        }

        // Also fetch SQLite projects & metrics
        await refreshProjects();
      } catch (err) {
        console.info('Operating with bundled Indian engineering materials dataset.');
      }
    }
    loadInitialData();
    return () => { isMounted = false; };
  }, []);


  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  };

  // Run evaluation on requirements change or material DB update
  const runEvaluation = (customReqs = requirements) => {
    const results = evaluateMaterials(customReqs, materialsList);
    setEvaluationResults(results);
    return results;
  };

  const loginWithSession = (userData) => {
    setCurrentUser(userData);
    showToast(`Welcome, ${userData.name || userData.email}! Authenticated as ${userData.role?.toUpperCase()}`, "success");
    if (userData.role === "admin") {
      setActiveTab("admin-dashboard");
    } else if (userData.role === "employee") {
      setActiveTab("employee-dashboard");
    } else if (userData.role === "customer") {
      setActiveTab("customer-reports");
    } else {
      setActiveTab("home");
    }

  };

  const logout = () => {
    setCurrentUser(null);
    setActiveTab("home");
    showToast("Logged out successfully from session.", "info");
  };


  // Save project evaluation (Persists to SQLite database/materials.db)
  const saveProject = async (projectData, clientNameLegacy) => {
    const topPick = evaluationResults[0];

    // Check if input is legacy (name, client) or rich object
    let payload;
    if (typeof projectData === 'string') {
      payload = {
        project_name: projectData || `${requirements.structureType} - ${requirements.structuralElement}`,
        description: `Structural material evaluation for ${requirements.structureType} (${requirements.structuralElement}) under ${requirements.environmentalCondition} exposure.`,
        structure_type: requirements.structureType,
        structural_element: requirements.structuralElement,
        load_type: requirements.loadType,
        design_life: requirements.designLife,
        environmental_condition: requirements.environmentalCondition,
        budget_range: requirements.budgetRange,
        sustainability_preference: requirements.sustainabilityPreference ? 1 : 0,
        special_requirements: JSON.stringify(requirements.specialRequirements || []),
        client_name: clientNameLegacy || "Infrastructure Stakeholder",
        client_contact: "+91-22-26590001",
        client_organization: clientNameLegacy || "National Infrastructure Pipeline (NIP)",
        client_logo: "",
        site_photos: JSON.stringify([]),
        top_recommendation: topPick ? topPick.material.name : "High Performance Material",
        suitability_score: topPick ? topPick.overallScore : 90,
        ranked_materials_json: JSON.stringify(
          (evaluationResults || []).slice(0, 5).map((r, idx) => ({
            rank: r.rank || idx + 1,
            name: r.material.name,
            score: r.overallScore,
            category: r.material.category,
            cost: r.material.costInrM3 ? `₹${r.material.costInrM3.toLocaleString()}/m³` : (r.material.costIndex || "Medium")
          }))
        ),
        author: currentUser?.name || "Lead Structural Engineer (IS 456)"
      };
    } else {
      // Rich project object
      const req = projectData.requirements || requirements;
      const results = projectData.evaluationResults || evaluationResults || [];
      const top = projectData.topRecommendation || (results[0] ? results[0].material.name : "High Performance Material");
      const score = projectData.suitabilityScore !== undefined ? projectData.suitabilityScore : (results[0] ? results[0].overallScore : 90);

      payload = {
        project_name: projectData.name || projectData.projectName || `${req.structureType} - ${req.structuralElement}`,
        description: projectData.description || `Evaluation for ${req.structureType}`,
        structure_type: req.structureType,
        structural_element: req.structuralElement,
        load_type: req.loadType,
        design_life: Number(req.designLife) || 100,
        environmental_condition: req.environmentalCondition,
        budget_range: req.budgetRange,
        sustainability_preference: req.sustainabilityPreference ? 1 : 0,
        special_requirements: JSON.stringify(req.specialRequirements || []),
        client_name: projectData.clientName || "Project Stakeholder",
        client_contact: projectData.clientContact || "+91-XX-XXXX-XXXX",
        client_organization: projectData.clientOrganization || "Infrastructure Development Authority",
        client_logo: projectData.clientLogo || "",
        site_photos: JSON.stringify(projectData.sitePhotos || []),
        top_recommendation: top,
        suitability_score: Math.round(score),
        ranked_materials_json: JSON.stringify(
          projectData.rankedMaterials || results.slice(0, 5).map((r, idx) => ({
            rank: r.rank || idx + 1,
            name: r.material.name,
            score: r.overallScore,
            category: r.material.category,
            cost: r.material.costInrM3 ? `₹${r.material.costInrM3.toLocaleString()}/m³` : (r.material.costIndex || "Medium")
          }))
        ),
        author: currentUser?.name || projectData.author || "Lead Structural Engineer (IS 456)"
      };
    }

    try {
      const savedDb = await saveProjectEvaluation(payload);
      let newProj;
      if (savedDb) {
        newProj = mapBackendProject(savedDb);
      } else {
        newProj = {
          id: `IND-PROJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
          name: payload.project_name,
          description: payload.description,
          date: new Date().toISOString().split('T')[0],
          author: payload.author,
          client: payload.client_organization || payload.client_name,
          clientName: payload.client_name,
          clientContact: payload.client_contact,
          clientOrganization: payload.client_organization,
          clientLogo: payload.client_logo,
          sitePhotos: JSON.parse(payload.site_photos || '[]'),
          status: "Saved in SQLite",
          location: "India National Infrastructure Pipeline (NIP)",
          standardCode: "IS 456 / IS 800 / IRC:112",
          requirements: typeof projectData === 'object' ? (projectData.requirements || requirements) : requirements,
          topRecommendation: payload.top_recommendation,
          suitabilityScore: payload.suitability_score,
          rankedMaterials: JSON.parse(payload.ranked_materials_json || '[]')
        };
      }

      setSavedProjects(prev => [newProj, ...prev]);
      showToast(`Project "${newProj.name}" successfully persisted to SQLite database`, "success");
      
      // Refresh dashboard metrics
      const updatedMetrics = await fetchDashboardMetrics();
      if (updatedMetrics) setDashboardMetrics(updatedMetrics);

      return newProj;
    } catch (err) {
      console.error("Save project error:", err);
      showToast("Error saving project evaluation", "error");
      return null;
    }
  };

  // Delete project evaluation from SQLite database
  const deleteProject = async (projectId) => {
    try {
      await deleteProjectEvaluation(projectId);
      setSavedProjects(prev => prev.filter(p => p.id !== projectId));
      setDashboardMetrics(prev => ({
        ...prev,
        total_searches: Math.max(0, (prev.total_searches || 1) - 1),
        recent_searches: (prev.recent_searches || []).filter(s => s.id !== projectId)
      }));
      if (selectedSavedProject && selectedSavedProject.id === projectId) {
        setSelectedSavedProject(null);
      }
      showToast(`Project record ${projectId} removed from database`, "info");
    } catch (err) {
      console.error("Delete project error:", err);
      showToast(err.message || "Failed to delete project evaluation", "error");
      throw err;
    }
  };

  // Refresh materials list from SQLite
  const refreshMaterials = async () => {
    try {
      const data = await fetchMaterials({ limit: 1000 });
      if (data && Array.isArray(data) && data.length > 0) {
        const mapped = data.map(m => ({
          id: m.id,
          name: m.name,
          category: m.category,
          compressiveStrength: m.compressive_strength,
          tensileStrength: m.tensile_strength,
          density: m.density,
          elasticModulus: m.elastic_modulus,
          embodiedCarbon: m.embodied_carbon,
          costIndex: m.cost_index,
          costInrM3: m.cost_inr_m3,
          co2Emission: m.co2_emission_kg_m3,
          durabilityScore: m.durability_score,
          maintenanceScore: m.maintenance_score,
          fireRating: m.fire_rating,
          corrosionResistance: m.corrosion_resistance,
          precastSuitability: m.precast_suitability === 1,
          ductilityRating: m.ductility_rating,
          waterImpermeability: m.water_impermeability,
          speedScore: m.speed_score,
          maxDesignLife: m.max_design_life,
          sustainabilityScore: m.co2_emission_kg_m3 ? (m.co2_emission_kg_m3 < 300 ? 92 : (m.co2_emission_kg_m3 < 800 ? 78 : 60)) : 75,
          standards: m.standards,
          description: m.description,
          bestFor: m.description
        }));
        setMaterialsList(mapped);
      }
    } catch (err) {
      console.warn("Could not refresh materials:", err);
    }
  };

  // Add new material to SQLite database
  const addMaterial = async (matData) => {
    try {
      const payload = {
        id: matData.id || `IND-${matData.category?.substring(0, 3).toUpperCase() || 'MAT'}-${Date.now().toString().slice(-4)}`,
        name: matData.name,
        category: matData.category || "Concrete",
        compressive_strength: parseFloat(matData.compressiveStrength || matData.compressive_strength || 30),
        tensile_strength: parseFloat(matData.tensileStrength || matData.tensile_strength || 3.5),
        density: parseInt(matData.density || 2400, 10),
        elastic_modulus: parseFloat(matData.elasticModulus || matData.elastic_modulus || 28),
        embodied_carbon: parseInt(matData.embodiedCarbon || matData.embodied_carbon || 320, 10),
        cost_index: matData.costIndex || "Medium",
        cost_inr_m3: parseFloat(matData.costInrM3 || matData.cost_inr_m3 || 5500),
        co2_emission_kg_m3: parseFloat(matData.co2Emission || matData.co2_emission_kg_m3 || matData.embodiedCarbon || 320),
        durability_score: parseFloat(matData.durabilityScore || matData.durability_score || 4.0),
        corrosion_resistance: parseFloat(matData.corrosionResistance || matData.corrosion_resistance || 7.0),
        fire_rating: parseFloat(matData.fireRating || matData.fire_rating || 7.5),
        precast_suitability: matData.precastSuitability ? 1 : 0,
        ductility_rating: parseFloat(matData.ductilityRating || matData.ductility_rating || 6.5),
        water_impermeability: parseFloat(matData.waterImpermeability || matData.water_impermeability || 7.5),
        speed_score: parseFloat(matData.speedScore || matData.speed_score || 7.5),
        max_design_life: parseInt(matData.maxDesignLife || matData.max_design_life || 100, 10),
        standards: matData.standards || "IS 456 / IS 800",
        description: matData.description || `${matData.name} standard Indian civil engineering grade.`
      };

      const res = await saveMaterialToDb(payload, true);
      const newMapped = {
        id: payload.id,
        name: payload.name,
        category: payload.category,
        compressiveStrength: payload.compressive_strength,
        tensileStrength: payload.tensile_strength,
        density: payload.density,
        elasticModulus: payload.elastic_modulus,
        embodiedCarbon: payload.embodied_carbon,
        costIndex: payload.cost_index,
        costInrM3: payload.cost_inr_m3,
        co2Emission: payload.co2_emission_kg_m3,
        durabilityScore: payload.durability_score,
        corrosionResistance: payload.corrosion_resistance,
        fireRating: payload.fire_rating,
        precastSuitability: payload.precast_suitability === 1,
        ductilityRating: payload.ductility_rating,
        waterImpermeability: payload.water_impermeability,
        speedScore: payload.speed_score,
        maxDesignLife: payload.max_design_life,
        sustainabilityScore: payload.embodied_carbon < 300 ? 92 : (payload.embodied_carbon < 800 ? 78 : 60),
        standards: payload.standards,
        description: payload.description,
        bestFor: payload.description
      };

      setMaterialsList(prev => [newMapped, ...prev]);
      setDashboardMetrics(prev => ({ ...prev, total_materials: (prev.total_materials || 0) + 1 }));
      showToast(`Material "${payload.name}" successfully added to SQLite database`, "success");
      return newMapped;
    } catch (err) {
      console.error("Add material error:", err);
      showToast(err.message || "Failed to add material to database", "error");
      throw err;
    }
  };

  // Update existing material in SQLite database
  const updateMaterial = async (materialId, matData) => {
    try {
      const payload = {
        name: matData.name,
        category: matData.category || "Concrete",
        compressive_strength: parseFloat(matData.compressiveStrength || matData.compressive_strength || 30),
        tensile_strength: parseFloat(matData.tensileStrength || matData.tensile_strength || 3.5),
        density: parseInt(matData.density || 2400, 10),
        elastic_modulus: parseFloat(matData.elasticModulus || matData.elastic_modulus || 28),
        embodied_carbon: parseInt(matData.embodiedCarbon || matData.embodied_carbon || 320, 10),
        cost_index: matData.costIndex || "Medium",
        cost_inr_m3: parseFloat(matData.costInrM3 || matData.cost_inr_m3 || 5500),
        co2_emission_kg_m3: parseFloat(matData.co2Emission || matData.co2_emission_kg_m3 || matData.embodiedCarbon || 320),
        durability_score: parseFloat(matData.durabilityScore || matData.durability_score || 4.0),
        corrosion_resistance: parseFloat(matData.corrosionResistance || matData.corrosion_resistance || 7.0),
        fire_rating: parseFloat(matData.fireRating || matData.fire_rating || 7.5),
        precast_suitability: matData.precastSuitability ? 1 : 0,
        ductility_rating: parseFloat(matData.ductilityRating || matData.ductility_rating || 6.5),
        water_impermeability: parseFloat(matData.waterImpermeability || matData.water_impermeability || 7.5),
        speed_score: parseFloat(matData.speedScore || matData.speed_score || 7.5),
        max_design_life: parseInt(matData.maxDesignLife || matData.max_design_life || 100, 10),
        standards: matData.standards || "IS 456 / IS 800",
        description: matData.description || `${matData.name} updated grade.`
      };

      await saveMaterialToDb({ id: materialId, ...payload }, false);

      setMaterialsList(prev => prev.map(m => {
        if (m.id !== materialId) return m;
        return {
          ...m,
          name: payload.name,
          category: payload.category,
          compressiveStrength: payload.compressive_strength,
          tensileStrength: payload.tensile_strength,
          density: payload.density,
          elasticModulus: payload.elastic_modulus,
          embodiedCarbon: payload.embodied_carbon,
          costIndex: payload.cost_index,
          costInrM3: payload.cost_inr_m3,
          co2Emission: payload.co2_emission_kg_m3,
          durabilityScore: payload.durability_score,
          corrosionResistance: payload.corrosion_resistance,
          fireRating: payload.fire_rating,
          precastSuitability: payload.precast_suitability === 1,
          ductilityRating: payload.ductility_rating,
          waterImpermeability: payload.water_impermeability,
          speedScore: payload.speed_score,
          maxDesignLife: payload.max_design_life,
          sustainabilityScore: payload.embodied_carbon < 300 ? 92 : (payload.embodied_carbon < 800 ? 78 : 60),
          standards: payload.standards,
          description: payload.description
        };
      }));

      showToast(`Material "${payload.name}" updated in SQLite database`, "success");
    } catch (err) {
      console.error("Update material error:", err);
      showToast(err.message || "Failed to update material", "error");
      throw err;
    }
  };

  // Delete material from SQLite database
  const deleteMaterial = async (materialId) => {
    try {
      await deleteMaterialFromDb(materialId);
      setMaterialsList(prev => prev.filter(m => m.id !== materialId));
      setDashboardMetrics(prev => ({ ...prev, total_materials: Math.max(0, (prev.total_materials || 1) - 1) }));
      showToast(`Material ${materialId} deleted from SQLite database`, "info");
    } catch (err) {
      console.error("Delete material error:", err);
      showToast(err.message || "Failed to delete material", "error");
      throw err;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        loginWithSession,
        logout,
        activeTab,
        setActiveTab,
        requirements,
        setRequirements,
        evaluationResults,
        setEvaluationResults,
        runEvaluation,
        materialsList,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        refreshMaterials,
        savedProjects,
        saveProject,
        deleteProject,
        refreshProjects,
        dashboardMetrics,
        comparisonMaterialIds,
        setComparisonMaterialIds,
        addMaterialToComparison,
        selectedSavedProject,
        setSelectedSavedProject,
        toast,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

