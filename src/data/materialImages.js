/**
 * Structural Material Visual Imagery Mapping
 * High-resolution authentic civil engineering imagery calibrated for Indian & International Standards
 */

export const CATEGORY_IMAGE_MAP = {
  "High Performance Concrete": "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=700&q=80",
  "Ultra High Performance Concrete": "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=700&q=80",
  "Normal Concrete": "https://images.unsplash.com/photo-1508873696983-2df5703bc20d?auto=format&fit=crop&w=700&q=80",
  "Structural Steel": "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=700&q=80",
  "Weathering Steel": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=80",
  "FRP Composites": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=700&q=80",
  "Timber / Engineered Wood": "https://images.unsplash.com/photo-1546484475-7f7bd55792da?auto=format&fit=crop&w=700&q=80",
  "Sustainable & Eco-Friendly": "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=700&q=80",
  "Masonry / Brickwork": "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&w=700&q=80",
  "Precast Prestressed Concrete": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80",
  "High Strength Concrete": "https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?auto=format&fit=crop&w=700&q=80",
  "Geopolymer Concrete": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=700&q=80",
  "Stainless Steel Rebar": "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=700&q=80",
  "Self-Compacting Concrete": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=700&q=80",
  "Lightweight Concrete": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=700&q=80"
};

// Fallback civil engineering image asset
export const DEFAULT_CIVIL_IMAGE = "/civil_engineering_structure.jpg";

/**
 * Returns a high-resolution authentic material image URL
 * @param {Object} material Material record
 * @returns {string} Image URL
 */
export function getMaterialImageUrl(material) {
  if (!material) return DEFAULT_CIVIL_IMAGE;

  // 1. Explicit image_url / imageUrl from database or object
  if (material.image_url && typeof material.image_url === 'string' && material.image_url.trim()) {
    return material.image_url;
  }
  if (material.imageUrl && typeof material.imageUrl === 'string' && material.imageUrl.trim()) {
    return material.imageUrl;
  }

  const name = (material.name || material.material_name || '').toLowerCase();
  const cat = (material.category || '').trim();

  // 2. Keyword-specific material matching for maximum realism
  if (name.includes('weathering') || name.includes('cor-ten') || name.includes('corten')) {
    return CATEGORY_IMAGE_MAP["Weathering Steel"];
  }
  if (name.includes('rebar') || name.includes('tmt') || name.includes('fe 500') || name.includes('fe 550')) {
    return "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=700&q=80";
  }
  if (name.includes('uhpc') || name.includes('ultra high')) {
    return CATEGORY_IMAGE_MAP["Ultra High Performance Concrete"];
  }
  if (name.includes('clt') || name.includes('timber') || name.includes('wood') || name.includes('glulam')) {
    return CATEGORY_IMAGE_MAP["Timber / Engineered Wood"];
  }
  if (name.includes('frp') || name.includes('gfrp') || name.includes('cfrp') || name.includes('polymer')) {
    return CATEGORY_IMAGE_MAP["FRP Composites"];
  }
  if (name.includes('brick') || name.includes('masonry') || name.includes('aac')) {
    return CATEGORY_IMAGE_MAP["Masonry / Brickwork"];
  }
  if (name.includes('geopolymer') || name.includes('recycled') || name.includes('fly ash')) {
    return CATEGORY_IMAGE_MAP["Sustainable & Eco-Friendly"];
  }
  if (name.includes('precast') || name.includes('prestressed')) {
    return CATEGORY_IMAGE_MAP["Precast Prestressed Concrete"];
  }
  if (name.includes('stainless')) {
    return CATEGORY_IMAGE_MAP["Stainless Steel Rebar"];
  }
  if (name.includes('steel') || name.includes('is 2062') || name.includes('e250') || name.includes('e350')) {
    return CATEGORY_IMAGE_MAP["Structural Steel"];
  }

  // 3. Category match
  if (CATEGORY_IMAGE_MAP[cat]) {
    return CATEGORY_IMAGE_MAP[cat];
  }

  // 4. Default structural civil engineering backdrop
  return DEFAULT_CIVIL_IMAGE;
}

export const getMaterialPhoto = getMaterialImageUrl;
