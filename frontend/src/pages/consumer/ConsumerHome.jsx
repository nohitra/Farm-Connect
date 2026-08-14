import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import API from '../../services/api';
import HubInfoBanner from '../../components/HubInfoBanner';
import ProduceCard from '../../components/ProduceCard';
import ProduceDetailModal from '../../components/ProduceDetailModal';
import ProduceSkeletonLoader from '../../components/ProduceSkeletonLoader';
import { Search, Filter, Sprout, Wheat, Milk, RotateCcw } from 'lucide-react';
import './ConsumerPages.css';

const ConsumerHome = () => {
  const { profile } = useAuth();
  const { addToCart } = useCart();
  const [produceList, setProduceList] = useState([]);
  const [selectedProduce, setSelectedProduce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPractice, setSelectedPractice] = useState('all');
  const [productType, setProductType] = useState('all'); // 'all' | 'farm' | 'dairy'

  const hubName = profile?.assignedHub?.name || 'Governorpet / MG Road Hub';

  useEffect(() => {
    API.get('/consumer/produce')
      .then((res) => {
        if (res.data.success) {
          setProduceList(res.data.produce);
        }
      })
      .catch((err) => console.error('Error fetching produce:', err))
      .finally(() => setLoading(false));
  }, []);

  const isDairyItem = (item) => {
    const nameLower = (item.name || '').toLowerCase();
    const catLower = (item.category || '').toLowerCase();
    const dairyKeywords = ['milk', 'ghee', 'paneer', 'curd', 'dahi', 'butter', 'egg', 'honey', 'dairy'];
    return dairyKeywords.some((kw) => nameLower.includes(kw) || catLower.includes(kw));
  };

  const filteredProduce = produceList.filter((item) => {
    const q = search.toLowerCase().trim();
    const prodName = (item.name || '').toLowerCase();
    const catName = (item.category || '').toLowerCase();
    const farmName = (item.farmer?.farmName || item.farmName || '').toLowerCase();
    const farmerName = (item.farmer?.user?.name || item.farmerName || '').toLowerCase();
    const location = (item.farmer?.farmLocation || item.farmLocation || '').toLowerCase();

    const matchesSearch =
      !q ||
      prodName.includes(q) ||
      catName.includes(q) ||
      farmName.includes(q) ||
      farmerName.includes(q) ||
      location.includes(q);

    const itemPractice = (item.practiceTag || item.farmer?.farmingPractice || '').toLowerCase();
    const matchesPractice = selectedPractice === 'all' || itemPractice.includes(selectedPractice.toLowerCase());
    
    const isDairy = isDairyItem(item);
    const matchesType =
      productType === 'all' || (productType === 'farm' && !isDairy) || (productType === 'dairy' && isDairy);

    return matchesSearch && matchesPractice && matchesType;
  });

  const handleTabSwitch = (type) => {
    setProductType(type);
    setSearch(''); // Auto-reset search bar when switching between Farm & Dairy tabs
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedPractice('all');
    setProductType('all');
  };

  return (
    <div className="page-wrapper animate-fade-in">
      <HubInfoBanner hubName={hubName} />

      {/* Main Category Tabs for Consumers: All vs Farm Products vs Dairy */}
      <div className="role-selector-tabs" style={{ marginBottom: '1.25rem', maxWidth: '560px' }}>
        <button
          type="button"
          className={`role-tab ${productType === 'all' ? 'active' : ''}`}
          onClick={() => handleTabSwitch('all')}
        >
          <Sprout size={18} /> All Produce
        </button>
        <button
          type="button"
          className={`role-tab ${productType === 'farm' ? 'active' : ''}`}
          onClick={() => handleTabSwitch('farm')}
        >
          <Wheat size={18} /> Farm Products
        </button>
        <button
          type="button"
          className={`role-tab ${productType === 'dairy' ? 'active' : ''}`}
          onClick={() => handleTabSwitch('dairy')}
        >
          <Milk size={18} /> Dairy & Fresh
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-bar glass-card">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search produce (e.g. Milk) or Farm Name (e.g. Green Meadows)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-dropdown-wrapper">
          <Filter size={18} className="filter-icon" />
          <select
            className="form-control"
            value={selectedPractice}
            onChange={(e) => setSelectedPractice(e.target.value)}
          >
            <option value="all">All Farming Practices</option>
            <option value="organic">Organic Certified</option>
            <option value="natural">Natural (Zero Chemical / Pure A2)</option>
            <option value="conventional">Conventional</option>
          </select>
        </div>
      </div>

      {/* Produce Grid / Loading Skeleton / Empty State */}
      {loading ? (
        <ProduceSkeletonLoader count={6} />
      ) : filteredProduce.length === 0 ? (
        <div className="glass-card text-center" style={{ padding: '3.5rem 1.5rem', borderRadius: 'var(--radius-lg)' }}>
          <Sprout size={56} style={{ color: 'var(--primary-color)', opacity: 0.6, marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>No Produce Found</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0.5rem auto 1.5rem', lineHeight: 1.5 }}>
            {search || selectedPractice !== 'all' || productType !== 'all'
              ? `No items found matching "${search}". Try searching by product name, farm name (e.g. Green Meadows), or farmer name.`
              : `Local farmers in your ${hubName} region haven't posted harvest listings for this order window yet.`}
          </p>
          {(search || selectedPractice !== 'all' || productType !== 'all') && (
            <button onClick={resetFilters} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
              <RotateCcw size={16} /> Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="produce-grid">
          {filteredProduce.map((prod) => (
            <ProduceCard
              key={prod._id}
              produce={prod}
              onAddToCart={addToCart}
              onSelect={setSelectedProduce}
            />
          ))}
        </div>
      )}

      {/* Produce Detail Modal */}
      {selectedProduce && (
        <ProduceDetailModal
          produce={selectedProduce}
          onClose={() => setSelectedProduce(null)}
          onAddToCart={addToCart}
        />
      )}
    </div>
  );
};

export default ConsumerHome;
