import React, { useState } from 'react';
import { DEFAULT_CUSTOMER_PROJECT } from '../data/customerData';
import './CustomerPage.css';

/**
 * CustomerPage Component
 * Displays customer profile, project metadata, and a responsive grid of used materials.
 * 
 * @param {Object} props.projectData - Optional custom project object (falls back to DEFAULT_CUSTOMER_PROJECT)
 * @param {Function} props.onBack - Optional callback to return to previous portal
 */
export default function CustomerPage({ projectData = DEFAULT_CUSTOMER_PROJECT, onBack }) {
  const { customer, project, materials } = projectData;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeImageModal, setActiveImageModal] = useState(null);

  // Extract unique material categories
  const categories = ['All', ...new Set(materials.map(m => m.category).filter(Boolean))];

  // Filter materials based on search term and category
  const filteredMaterials = materials.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      item.name.toLowerCase().includes(q) ||
      item.grade.toLowerCase().includes(q) ||
      item.specification.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="customer-page-container">
      {/* Optional Top Navigation Bar */}
      {onBack && (
        <div className="customer-page-topbar">
          <button onClick={onBack} className="btn-back">
            ← Back to Portal
          </button>
        </div>
      )}

      {/* 1. HEADER SECTION */}
      <header className="customer-header-card">
        <div className="customer-header-main">
          {/* Customer Avatar & Bio */}
          <div className="customer-profile-block">
            <div className="customer-avatar-wrapper">
              <img 
                src={customer.avatar} 
                alt={customer.name} 
                className="customer-avatar-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(customer.name) + "&background=0D9488&color=fff";
                }}
              />
              <span className="customer-badge-verified" title="Verified Customer">✓</span>
            </div>
            <div className="customer-bio">
              <span className="customer-label">Client Dossier</span>
              <h2 className="customer-name">{customer.name}</h2>
              <p className="customer-company">{customer.company}</p>
              <div className="customer-contacts">
                {customer.email && <span>✉ {customer.email}</span>}
                {customer.phone && <span>☎ {customer.phone}</span>}
              </div>
            </div>
          </div>

          {/* Project Title & Status Block */}
          <div className="project-highlight-block">
            <div className="project-status-row">
              <span className={`status-pill ${project.status.toLowerCase().includes('active') ? 'status-active' : 'status-complete'}`}>
                ● {project.status}
              </span>
              <span className="project-code-tag">{project.code}</span>
            </div>

            <h1 className="project-title">{project.name}</h1>
            <p className="project-location">📍 {project.location}</p>

            <div className="project-meta-grid">
              <div className="meta-item">
                <span className="meta-label">Commencement Date</span>
                <span className="meta-value">{project.startDate}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Target Completion</span>
                <span className="meta-value">{project.completionTarget}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Current Phase</span>
                <span className="meta-value">{project.phase}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Sustainability</span>
                <span className="meta-value text-emerald">{project.sustainabilityTier}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. USED MATERIALS SECTION */}
      <section className="materials-section">
        {/* Section Title & Filter Controls */}
        <div className="materials-section-header">
          <div>
            <div className="section-eyebrow">Inventory & Specification Manifest</div>
            <h2 className="section-title">Materials Used in This Project</h2>
            <p className="section-subtitle">
              Certified building materials, quality grades, and installation notes specified for {project.name}.
            </p>
          </div>

          <div className="materials-count-badge">
            Showing <strong>{filteredMaterials.length}</strong> of {materials.length} Materials
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="materials-filter-bar">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search materials by name, grade, or notes (e.g. Marble, Teak, 316L, M120)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="btn-clear-search">
                ✕
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="category-pills-row">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Materials Grid */}
        {filteredMaterials.length > 0 ? (
          <div className="materials-grid">
            {filteredMaterials.map((mat) => (
              <article key={mat.id} className="material-card">
                {/* Material Image Thumbnail */}
                <div 
                  className="material-card-media"
                  onClick={() => setActiveImageModal(mat)}
                  title="Click to view high-resolution photo"
                >
                  <img
                    src={mat.image}
                    alt={mat.name}
                    className="material-thumbnail-img"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80";
                    }}
                  />
                  <div className="media-overlay-badge">
                    <span className="zoom-hint">🔍 Expand Photo</span>
                  </div>
                  {mat.category && (
                    <span className="material-category-tag">{mat.category}</span>
                  )}
                </div>

                {/* Card Body */}
                <div className="material-card-body">
                  {/* Quality Grade Badge */}
                  <div className="grade-badge-container">
                    <span className="quality-grade-badge">
                      ★ {mat.grade}
                    </span>
                    {mat.coverage && (
                      <span className="coverage-badge">Qty: {mat.coverage}</span>
                    )}
                  </div>

                  {/* Material Name */}
                  <h3 className="material-name">{mat.name}</h3>

                  {/* Technical Specification */}
                  {mat.specification && (
                    <div className="specification-box">
                      <span className="spec-label">Specification:</span>
                      <span className="spec-value">{mat.specification}</span>
                    </div>
                  )}

                  {/* Description / Notes */}
                  <p className="material-description">
                    "{mat.description}"
                  </p>

                  {/* Card Footer */}
                  {mat.supplier && (
                    <div className="material-card-footer">
                      <span className="supplier-icon">🏢</span>
                      <span className="supplier-text">Supplier: <strong>{mat.supplier}</strong></span>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state-box">
            <div className="empty-icon">📦</div>
            <h3 className="empty-title">No Materials Found</h3>
            <p className="empty-subtitle">
              No materials match your search query "{searchQuery}". Try selecting "All" or resetting your search.
            </p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} 
              className="btn-reset-filters"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* 3. LIGHTBOX IMAGE MODAL */}
      {activeImageModal && (
        <div className="modal-backdrop" onClick={() => setActiveImageModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="btn-close-modal" onClick={() => setActiveImageModal(null)}>
              ✕
            </button>
            <img 
              src={activeImageModal.image} 
              alt={activeImageModal.name} 
              className="modal-full-img"
            />
            <div className="modal-caption">
              <h4>{activeImageModal.name}</h4>
              <p><strong>Grade:</strong> {activeImageModal.grade} • <strong>Spec:</strong> {activeImageModal.specification}</p>
              <p className="modal-notes">{activeImageModal.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
