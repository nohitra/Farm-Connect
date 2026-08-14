import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import ProduceCard from '../../components/ProduceCard';
import PriceBreakdownDisplay from '../../components/PriceBreakdownDisplay';
import { getAutoCropImage } from '../../utils/cropImageGenerator';
import { Sprout, Plus, CheckCircle2, AlertCircle, Sparkles, Milk, Wheat } from 'lucide-react';

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
    setName(''); // Reset produce name input when switching tabs
    if (tab === 'dairy') {
      setCategory('dairy');
      setUnit('litre');
    } else {
      setCategory('vegetables');
      setUnit('kg');
    }
  };

  const autoCropImage = getAutoCropImage(name);

  const handleAddProduce = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await API.post('/farmer/produce', {
        name,
        category,
        unit,
        farmerEarning: Number(farmerEarning),
        practiceTag,
        images: [autoCropImage],
      });

      if (res.data.success) {
        setShowAddForm(false);
        setName('');
        setFarmerEarning('');
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

  return (
    <div className="page-wrapper animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
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
          <h3 style={{ marginBottom: '1rem' }}>
            Add {activeTab === 'farm' ? '🌾 Farm Produce Listing' : '🥛 Dairy Product Listing'}
          </h3>

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

            {/* Smart Auto-Generated Crop Photo Live Preview Banner */}
            <div style={{ margin: '1rem 0', padding: '1rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-dark)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sparkles size={16} style={{ color: 'var(--primary)' }} /> Smart Auto-Generated Product Photo
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Auto-selected based on product name</span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <img
                  src={autoCropImage}
                  alt={name || 'Harvest Product'}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
                  }}
                  style={{ width: '100px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '2px solid var(--primary)' }}
                />
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--text-main)', display: 'block' }}>{name || 'Enter product name above'}</strong>
                  Automatic high-resolution photo matched for your listing preview. No manual upload needed!
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
