import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import ProduceCard from '../../components/ProduceCard';
import PriceBreakdownDisplay from '../../components/PriceBreakdownDisplay';
import {
  getAutoCropImage,
  CROP_PHOTO_DATABASE,
  POPULAR_FARM_PRESETS,
  POPULAR_DAIRY_PRESETS,
  DEFAULT_HARVEST_PHOTO,
  DEFAULT_DAIRY_PHOTO,
} from '../../utils/cropImageGenerator';
import {
  Sprout,
  Plus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Milk,
  Wheat,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Grid,
  Zap,
} from 'lucide-react';

const ManageProducePage = () => {
  const [produceList, setProduceList] = useState([]);
  const [activeTab, setActiveTab] = useState('farm'); // 'farm' | 'dairy'
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('vegetables');
  const [unit, setUnit] = useState('kg');
  const [farmerEarning, setFarmerEarning] = useState('');
  const [practiceTag, setPracticeTag] = useState('Organic');

  // Image Selection State
  const [imageMode, setImageMode] = useState('auto'); // 'auto' | 'custom' | 'upload' | 'gallery'
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [selectedGalleryUrl, setSelectedGalleryUrl] = useState('');
  const [uploadedImageData, setUploadedImageData] = useState('');

  useEffect(() => {
    fetchProduce();
  }, []);

  const fetchProduce = () => {
    API.get('/farmer/produce')
      .then((res) => {
        if (res.data.success) setProduceList(res.data.produce);
      })
      .catch((err) => console.error('Error fetching produce:', err))
      .finally(() => setLoading(false));
  };

  // Helper to identify if a produce item belongs to dairy
  const isDairyItem = (item) => {
    const nameLower = (item.name || '').toLowerCase();
    const catLower = (item.category || '').toLowerCase();
    const dairyKeywords = ['milk', 'ghee', 'paneer', 'curd', 'dahi', 'butter', 'egg', 'honey', 'dairy'];
    return dairyKeywords.some((kw) => nameLower.includes(kw) || catLower.includes(kw));
  };

  const farmListings = produceList.filter((item) => !isDairyItem(item));
  const dairyListings = produceList.filter((item) => isDairyItem(item));

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setName('');
    setCustomImageUrl('');
    setSelectedGalleryUrl('');
    setUploadedImageData('');
    setImageMode('auto');
    if (tab === 'dairy') {
      setCategory('dairy');
      setUnit('litre');
    } else {
      setCategory('vegetables');
      setUnit('kg');
    }
  };

  // Apply 1-Click Popular Preset
  const handleApplyPreset = (preset) => {
    setName(preset.name);
    setCategory(preset.category);
    setUnit(preset.unit);
    setFarmerEarning(preset.defaultEarning.toString());
    setPracticeTag(preset.practiceTag || 'Organic');
    setSelectedGalleryUrl(preset.image);
    setImageMode('gallery');
  };

  // Determine active display image
  const autoMatchedImage = getAutoCropImage(name, activeTab === 'dairy' ? 'dairy' : category);

  const getEffectiveImage = () => {
    if (imageMode === 'custom' && customImageUrl.trim()) {
      return customImageUrl.trim();
    }
    if (imageMode === 'upload' && uploadedImageData) {
      return uploadedImageData;
    }
    if (imageMode === 'gallery' && selectedGalleryUrl) {
      return selectedGalleryUrl;
    }
    return autoMatchedImage;
  };

  const currentDisplayImage = getEffectiveImage();

  // Handle local file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file is too large. Please select an image under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImageData(event.target.result);
        setImageMode('upload');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduce = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const finalImage = getEffectiveImage();

      const res = await API.post('/farmer/produce', {
        name,
        category,
        unit,
        farmerEarning: Number(farmerEarning),
        practiceTag,
        images: [finalImage],
      });

      if (res.data.success) {
        setShowAddForm(false);
        setName('');
        setFarmerEarning('');
        setCustomImageUrl('');
        setSelectedGalleryUrl('');
        setUploadedImageData('');
        setImageMode('auto');
        fetchProduce();
      } else {
        setError(res.data.message || 'Failed to add produce listing');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding produce. Verification required.');
    }
  };

  const handleDelete = async (produceId) => {
    try {
      await API.delete(`/farmer/produce/${produceId}`);
      fetchProduce();
    } catch (err) {
      console.error('Error deleting produce:', err);
    }
  };

  const baseEarning = Number(farmerEarning) || 0;
  const platformFee = Math.round(baseEarning * 0.1 * 100) / 100;
  const deliveryCost = Math.round(baseEarning * 0.15 * 100) / 100;
  const totalPrice = baseEarning + platformFee + deliveryCost;

  const currentPresets = activeTab === 'farm' ? POPULAR_FARM_PRESETS : POPULAR_DAIRY_PRESETS;
  const galleryItems = CROP_PHOTO_DATABASE.filter((item) =>
    activeTab === 'dairy' ? item.category === 'dairy' : item.category !== 'dairy'
  );

  return (
    <div className="page-wrapper animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Manage Harvest & Farm Products</h2>
          <p style={{ color: 'var(--text-muted)' }}>List your crops, vegetables, and dairy products for local consumer hubs</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary btn-lg">
          <Plus size={20} /> {showAddForm ? 'Cancel' : `Add New ${activeTab === 'farm' ? 'Farm Product' : 'Dairy Product'}`}
        </button>
      </div>

      {/* Main Category Tabs: Farm Products vs Dairy Products */}
      <div className="role-selector-tabs" style={{ marginBottom: '1.5rem', maxWidth: '520px' }}>
        <button
          type="button"
          className={`role-tab ${activeTab === 'farm' ? 'active' : ''}`}
          onClick={() => handleTabChange('farm')}
          style={{ fontSize: '0.95rem', padding: '0.75rem' }}
        >
          <Wheat size={20} /> Farm Products ({farmListings.length})
        </button>
        <button
          type="button"
          className={`role-tab ${activeTab === 'dairy' ? 'active' : ''}`}
          onClick={() => handleTabChange('dairy')}
          style={{ fontSize: '0.95rem', padding: '0.75rem' }}
        >
          <Milk size={20} /> Dairy Products ({dairyListings.length})
        </button>
      </div>

      {showAddForm && (
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {activeTab === 'farm' ? <Wheat size={22} className="icon-emerald" /> : <Milk size={22} className="icon-emerald" />}
            Add {activeTab === 'farm' ? 'Farm Produce Listing' : 'Dairy Product Listing'}
          </h3>

          {/* Quick 1-Click Popular Templates */}
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
              <Zap size={16} style={{ color: 'var(--primary)' }} /> 1-Click Fast Presets (Click to autofill name & high-res image):
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {currentPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)' }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="auth-error-alert" style={{ marginBottom: '1rem' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleAddProduce}>
            <div className="form-row">
              <div className="form-group">
                <label>{activeTab === 'farm' ? 'Crop / Produce Name' : 'Dairy Product Name'}</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={
                    activeTab === 'farm'
                      ? 'e.g. Fresh Organic Carrots, Sweetcorn, Desi Tomatoes...'
                      : 'e.g. Fresh A2 Cow Milk, Pure Desi Ghee, Paneer, Farm Eggs...'
                  }
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Unit Measure</label>
                <select className="form-control" value={unit} onChange={(e) => setUnit(e.target.value)}>
                  {activeTab === 'farm' ? (
                    <>
                      <option value="kg">Per Kg (Kilogram)</option>
                      <option value="bunch">Per Bunch</option>
                      <option value="pack">Per Pack (250g/500g)</option>
                      <option value="piece">Per Piece / Unit</option>
                    </>
                  ) : (
                    <>
                      <option value="litre">Per Litre</option>
                      <option value="500ml">Per 500ml Pack</option>
                      <option value="kg">Per Kg (Ghee/Paneer)</option>
                      <option value="pack">Per Pack (250g/500g)</option>
                      <option value="dozen">Per Dozen (Eggs)</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* PRODUCT IMAGE SELECTION SECTION */}
            <div style={{ margin: '1.25rem 0', padding: '1.25rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ImageIcon size={18} className="icon-emerald" /> Product Image Configuration
                </span>
                {/* Mode Selector Tabs */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${imageMode === 'auto' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setImageMode('auto')}
                  >
                    <Sparkles size={14} /> Auto-Match
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${imageMode === 'gallery' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setImageMode('gallery')}
                  >
                    <Grid size={14} /> Photo Gallery
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${imageMode === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setImageMode('upload')}
                  >
                    <Upload size={14} /> Upload Photo
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${imageMode === 'custom' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setImageMode('custom')}
                  >
                    <LinkIcon size={14} /> Custom URL
                  </button>
                </div>
              </div>

              {/* Mode Specific Inputs */}
              {imageMode === 'custom' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Paste Direct Image URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://example.com/image.jpg"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                  />
                </div>
              )}

              {imageMode === 'upload' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Choose Picture from Device</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={handleFileUpload}
                  />
                </div>
              )}

              {imageMode === 'gallery' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                    Select from Curated High-Res Photos:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.5rem', maxHeight: '160px', overflowY: 'auto', padding: '0.4rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)' }}>
                    {galleryItems.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedGalleryUrl(item.url)}
                        style={{
                          cursor: 'pointer',
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden',
                          border: selectedGalleryUrl === item.url ? '3px solid var(--primary)' : '1px solid var(--border-color)',
                          boxShadow: selectedGalleryUrl === item.url ? '0 0 8px rgba(16, 185, 129, 0.4)' : 'none',
                          height: '60px',
                        }}
                        title={item.name}
                      >
                        <img src={item.url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Image Preview Card */}
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ width: '120px', height: '90px', position: 'relative', flexShrink: 0, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '2px solid var(--primary)' }}>
                  <img
                    src={currentDisplayImage}
                    alt={name || 'Product Preview'}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = activeTab === 'dairy' ? DEFAULT_DAIRY_PHOTO : DEFAULT_HARVEST_PHOTO;
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--text-main)', fontSize: '1rem', display: 'block', marginBottom: '0.2rem' }}>
                    {name || (activeTab === 'farm' ? 'Fresh Crop Listing' : 'Dairy Listing')}
                  </strong>
                  <span style={{ display: 'inline-block', padding: '0.2rem 0.5rem', background: 'var(--primary-light)', color: 'var(--primary-dark)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                    Mode: {imageMode === 'auto' ? '✨ Smart Auto Matched' : imageMode === 'gallery' ? '🖼️ Gallery Selected' : imageMode === 'upload' ? '📁 Local Upload' : '🔗 Custom URL'}
                  </span>
                  <p style={{ margin: 0, fontSize: '0.8rem' }}>High-resolution photo configured for consumer marketplace presentation.</p>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Your Base Earning Target (₹ per {unit})</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 40"
                  value={farmerEarning}
                  onChange={(e) => setFarmerEarning(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Quality / Farming Badge</label>
                <select className="form-control" value={practiceTag} onChange={(e) => setPracticeTag(e.target.value)}>
                  <option value="Organic">Organic Certified</option>
                  <option value="Natural">Natural (Zero Chemical / A2 Pure)</option>
                  <option value="Conventional">Standard / Conventional</option>
                </select>
              </div>
            </div>

            {/* Live Transparent Price Breakdown Preview */}
            {baseEarning > 0 && (
              <div style={{ margin: '1rem 0' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Automated Consumer Price Preview</h4>
                <PriceBreakdownDisplay
                  farmerEarning={baseEarning}
                  platformFee={platformFee}
                  deliveryCost={deliveryCost}
                  pricePerUnit={totalPrice}
                  unit={unit}
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '1rem', fontWeight: 700 }}>
              <CheckCircle2 size={18} /> Publish {activeTab === 'farm' ? 'Farm Product' : 'Dairy Product'}
            </button>
          </form>
        </div>
      )}

      {/* Filtered Produce Grid */}
      <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {activeTab === 'farm' ? <Wheat size={22} className="icon-emerald" /> : <Milk size={22} className="icon-emerald" />}
        Active {activeTab === 'farm' ? 'Farm Products' : 'Dairy Products'} ({activeTab === 'farm' ? farmListings.length : dairyListings.length})
      </h3>

      {(activeTab === 'farm' ? farmListings : dairyListings).length === 0 ? (
        <div className="glass-card text-center" style={{ padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            No {activeTab === 'farm' ? 'farm products' : 'dairy products'} currently listed. Click "Add New" above to create one!
          </p>
        </div>
      ) : (
        <div className="produce-grid">
          {(activeTab === 'farm' ? farmListings : dairyListings).map((prod) => (
            <ProduceCard key={prod._id} produce={prod} isFarmerView={true} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageProducePage;
