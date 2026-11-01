import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { predictionService } from '../../services/predictionService';
import type { DropdownHierarchy, PredictionInput, PredictionResult } from '../../types';
import { Sparkles, MapPin, Package, Clock, ShieldAlert, Zap, Box, Building } from 'lucide-react';

export interface PredictionFormProps {
  onSuccess: (result: PredictionResult, input: PredictionInput) => void;
}

export const PredictionForm: React.FC<PredictionFormProps> = ({ onSuccess }) => {
  const [hierarchy, setHierarchy] = useState<DropdownHierarchy | null>(null);
  const [loadingHierarchy, setLoadingHierarchy] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Form state initialized with sensible defaults
  const [formData, setFormData] = useState<PredictionInput>({
    'Days for shipment (scheduled)': 4,
    'Shipping Mode': 'Standard Class',
    Type: 'DEBIT',
    'Customer Segment': 'Consumer',
    Market: 'Europe',
    'Order Region': 'Western Europe',
    'Order Country': 'Alemania',
    'Order State': 'Bavaria',
    'Department Name': 'Fan Shop',
    'Category Name': 'Sporting Goods',
    'Order Item Quantity': 1,
    Sales: 150.0,
    'Order Item Discount': 0.0,
    'Product Price': 150.0,
    Latitude: 52.52,
    Longitude: 13.405,
    order_month: new Date().getMonth() + 1,
    order_day: new Date().getDate(),
    order_weekday: new Date().getDay() === 0 ? 6 : new Date().getDay() - 1,
    order_hour: 14,
    is_weekend: [0, 6].includes(new Date().getDay()) ? 1 : 0,
  });

  // Load cascading hierarchy from backend on mount
  useEffect(() => {
    predictionService
      .getHierarchy()
      .then((data) => {
        setHierarchy(data);
        const m = data.markets[0] || 'Europe';
        const r = data.market_regions[m]?.[0] || 'Western Europe';
        const c = data.region_countries[r]?.[0] || 'Alemania';
        const s = data.country_states[c]?.[0] || 'Bavaria';
        const dept = data.departments[0] || 'Fan Shop';
        const cat = data.dept_categories[dept]?.[0] || 'Sporting Goods';

        setFormData((prev) => ({
          ...prev,
          Market: m,
          'Order Region': r,
          'Order Country': c,
          'Order State': s,
          'Department Name': dept,
          'Category Name': cat,
        }));
        setLoadingHierarchy(false);
      })
      .catch((err) => {
        setFormError('Failed to load geographic hierarchy from server: ' + err.message);
        setLoadingHierarchy(false);
      });
  }, []);

  // One-Click Preset Scenario Loader
  const loadPreset = (presetKey: 'tech_europe' | 'sporting_latam' | 'equipment_usca') => {
    setActivePreset(presetKey);
    setFormError(null);

    if (presetKey === 'tech_europe') {
      setFormData((prev) => ({
        ...prev,
        'Days for shipment (scheduled)': 1,
        'Shipping Mode': 'First Class',
        Type: 'TRANSFER',
        'Customer Segment': 'Corporate',
        Market: 'Europe',
        'Order Region': 'Western Europe',
        'Order Country': 'Alemania',
        'Order State': 'Bavaria',
        'Department Name': 'Technology',
        'Category Name': 'Computers',
        'Order Item Quantity': 2,
        Sales: 1300.0,
        'Order Item Discount': 25.0,
        'Product Price': 650.0,
      }));
    } else if (presetKey === 'sporting_latam') {
      setFormData((prev) => ({
        ...prev,
        'Days for shipment (scheduled)': 4,
        'Shipping Mode': 'Standard Class',
        Type: 'DEBIT',
        'Customer Segment': 'Consumer',
        Market: 'LATAM',
        'Order Region': 'South America',
        'Order Country': 'Brasil',
        'Order State': 'Sao Paulo',
        'Department Name': 'Fitness',
        'Category Name': 'Sporting Goods',
        'Order Item Quantity': 4,
        Sales: 340.0,
        'Order Item Discount': 0.0,
        'Product Price': 85.0,
      }));
    } else if (presetKey === 'equipment_usca') {
      setFormData((prev) => ({
        ...prev,
        'Days for shipment (scheduled)': 2,
        'Shipping Mode': 'Second Class',
        Type: 'PAYMENT',
        'Customer Segment': 'Home Office',
        Market: 'USCA',
        'Order Region': 'East of USA',
        'Order Country': 'Estados Unidos',
        'Order State': 'New York',
        'Department Name': 'Fan Shop',
        'Category Name': 'Apparel',
        'Order Item Quantity': 1,
        Sales: 220.0,
        'Order Item Discount': 10.0,
        'Product Price': 220.0,
      }));
    }
  };

  // Cascading Geographic Options
  const marketOptions = (hierarchy?.markets || ['Europe', 'LATAM', 'Pacific Asia', 'USCA', 'Africa']).map((m) => ({
    value: m,
    label: m,
  }));

  const regionOptions = (
    hierarchy?.market_regions?.[formData.Market] || [
      'Western Europe',
      'Northern Europe',
      'Southern Europe',
      'Central America',
      'South America',
    ]
  ).map((r) => ({ value: r, label: r }));

  const countryOptions = (
    hierarchy?.region_countries?.[formData['Order Region']] || ['Alemania', 'Francia', 'United Kingdom', 'Italy']
  ).map((c) => ({ value: c, label: c }));

  const stateOptions = (
    hierarchy?.country_states?.[formData['Order Country']] || ['Bavaria', 'Berlin', 'Hamburg', 'Hesse']
  ).map((s) => ({ value: s, label: s }));

  // Department & Category Cascading Options
  const departmentOptions = (
    hierarchy?.departments || ['Fan Shop', 'Apparel', 'Golf', 'Footwear', 'Fitness', 'Outdoors', 'Technology']
  ).map((d) => ({ value: d, label: d }));

  const categoryOptions = (
    hierarchy?.dept_categories?.[formData['Department Name']] || [
      'Sporting Goods',
      "Men's Footwear",
      "Women's Apparel",
      'Camping & Hiking',
      'Computers',
    ]
  ).map((c) => ({ value: c, label: c }));

  const shippingModeOptions = (
    hierarchy?.shipping_modes || ['Standard Class', 'Second Class', 'First Class', 'Same Day']
  ).map((m) => ({ value: m, label: m }));

  const customerSegmentOptions = (
    hierarchy?.customer_segments || ['Consumer', 'Corporate', 'Home Office']
  ).map((s) => ({ value: s, label: s }));

  const paymentTypeOptions = (
    hierarchy?.types || ['DEBIT', 'TRANSFER', 'PAYMENT', 'CASH']
  ).map((t) => ({ value: t, label: t }));

  // Handle cascading market change
  const handleMarketChange = (newMarket: string) => {
    setActivePreset(null);
    const availableRegions = hierarchy?.market_regions?.[newMarket] || [];
    const firstRegion = availableRegions[0] || '';
    const availableCountries = hierarchy?.region_countries?.[firstRegion] || [];
    const firstCountry = availableCountries[0] || '';
    const availableStates = hierarchy?.country_states?.[firstCountry] || [];
    const firstState = availableStates[0] || '';

    setFormData((prev) => ({
      ...prev,
      Market: newMarket,
      'Order Region': firstRegion,
      'Order Country': firstCountry,
      'Order State': firstState,
    }));
  };

  // Handle cascading region change
  const handleRegionChange = (newRegion: string) => {
    setActivePreset(null);
    const availableCountries = hierarchy?.region_countries?.[newRegion] || [];
    const firstCountry = availableCountries[0] || '';
    const availableStates = hierarchy?.country_states?.[firstCountry] || [];
    const firstState = availableStates[0] || '';

    setFormData((prev) => ({
      ...prev,
      'Order Region': newRegion,
      'Order Country': firstCountry,
      'Order State': firstState,
    }));
  };

  // Handle cascading country change
  const handleCountryChange = (newCountry: string) => {
    setActivePreset(null);
    const availableStates = hierarchy?.country_states?.[newCountry] || [];
    const firstState = availableStates[0] || '';

    setFormData((prev) => ({
      ...prev,
      'Order Country': newCountry,
      'Order State': firstState,
    }));
  };

  // Handle department change
  const handleDepartmentChange = (newDept: string) => {
    setActivePreset(null);
    const availableCats = hierarchy?.dept_categories?.[newDept] || [];
    const firstCat = availableCats[0] || '';

    setFormData((prev) => ({
      ...prev,
      'Department Name': newDept,
      'Category Name': firstCat,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const result = await predictionService.predictSingle(formData);
      onSuccess(result, formData);
    } catch (err: any) {
      setFormError(err.message || 'Prediction failed. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Atmospheric Demo Preset Chips Strip ──────────────────────────── */}
      <div className="p-3 rounded-[10px] bg-[#0f1011] border border-[#23252a] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#8a8f98] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#e4f222]" />
            One-Click Demonstration Scenarios
          </span>
          <span className="text-[10px] text-[#62666d]">Instant field hydration</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => loadPreset('tech_europe')}
            className={`px-3 py-2 rounded-[6px] text-left border text-[12px] transition-all cursor-pointer flex items-center gap-2 ${
              activePreset === 'tech_europe'
                ? 'bg-[#e4f222]/10 border-[#e4f222] text-[#ffffff]'
                : 'bg-[#161718] border-[#23252a] text-[#8a8f98] hover:text-[#ffffff] hover:border-[#383b3f]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#e4f222] flex-shrink-0" />
            <div>
              <span className="font-medium block leading-tight text-[#ffffff]">
                High-Priority Tech Order
              </span>
              <span className="text-[10px] text-[#62666d] block font-mono">
                First Class • Europe
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => loadPreset('sporting_latam')}
            className={`px-3 py-2 rounded-[6px] text-left border text-[12px] transition-all cursor-pointer flex items-center gap-2 ${
              activePreset === 'sporting_latam'
                ? 'bg-[#38bdf8]/10 border-[#38bdf8] text-[#ffffff]'
                : 'bg-[#161718] border-[#23252a] text-[#8a8f98] hover:text-[#ffffff] hover:border-[#383b3f]'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-[#38bdf8] flex-shrink-0" />
            <div>
              <span className="font-medium block leading-tight text-[#ffffff]">
                Bulk Sporting Goods
              </span>
              <span className="text-[10px] text-[#62666d] block font-mono">
                Standard Class • LATAM
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => loadPreset('equipment_usca')}
            className={`px-3 py-2 rounded-[6px] text-left border text-[12px] transition-all cursor-pointer flex items-center gap-2 ${
              activePreset === 'equipment_usca'
                ? 'bg-[#a78bfa]/10 border-[#a78bfa] text-[#ffffff]'
                : 'bg-[#161718] border-[#23252a] text-[#8a8f98] hover:text-[#ffffff] hover:border-[#383b3f]'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-[#a78bfa] flex-shrink-0" />
            <div>
              <span className="font-medium block leading-tight text-[#ffffff]">
                Corporate Equipment
              </span>
              <span className="text-[10px] text-[#62666d] block font-mono">
                Second Class • USCA
              </span>
            </div>
          </button>
        </div>
      </div>

      {formError && (
        <div className="p-3.5 rounded-[8px] bg-[#eb5757]/10 border border-[#eb5757]/30 text-[#eb5757] text-[13px] flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      {/* Section 1: Shipping Mode & Schedule */}
      <Card>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#23252a]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#e4f222]" />
            <h3 className="text-[14px] font-[510] text-[#ffffff] tracking-tight">
              1. Fulfillment & Delivery Schedule
            </h3>
          </div>
          <Badge variant="lime" size="sm">Primary Regression Feature</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Shipping Mode"
            options={shippingModeOptions}
            value={formData['Shipping Mode']}
            onChange={(e) => {
              setActivePreset(null);
              setFormData({ ...formData, 'Shipping Mode': e.target.value });
            }}
            helperText="Carrier fulfillment speed tier"
          />

          <Input
            label="Scheduled Shipping Days"
            type="number"
            min={0}
            max={10}
            step={1}
            value={formData['Days for shipment (scheduled)']}
            onChange={(e) => {
              setActivePreset(null);
              setFormData({
                ...formData,
                'Days for shipment (scheduled)': parseInt(e.target.value, 10) || 0,
              });
            }}
            helperText="Promised transit duration according to chosen mode"
          />
        </div>
      </Card>

      {/* Section 2: Destination Geography */}
      <Card>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#23252a]">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#02b8cc]" />
            <h3 className="text-[14px] font-[510] text-[#ffffff] tracking-tight">
              2. Geographic Destination (Cascading Hierarchy)
            </h3>
          </div>
          <Badge variant="teal" size="sm">Strict Pre-Shipment Audit</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Market"
            options={marketOptions}
            value={formData.Market}
            onChange={(e) => handleMarketChange(e.target.value)}
          />

          <Select
            label="Order Region"
            options={regionOptions}
            value={formData['Order Region']}
            onChange={(e) => handleRegionChange(e.target.value)}
          />

          <Select
            label="Order Country"
            options={countryOptions}
            value={formData['Order Country']}
            onChange={(e) => handleCountryChange(e.target.value)}
          />

          <Select
            label="Order State / Province"
            options={stateOptions}
            value={formData['Order State']}
            onChange={(e) => {
              setActivePreset(null);
              setFormData({ ...formData, 'Order State': e.target.value });
            }}
          />
        </div>
      </Card>

      {/* Section 3: Order, Product & Commercial Attributes */}
      <Card>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#23252a]">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#6366f1]" />
            <h3 className="text-[14px] font-[510] text-[#ffffff] tracking-tight">
              3. Order Attributes & Merchandise
            </h3>
          </div>
          <Badge variant="violet" size="sm">Zero Post-Fulfillment Leakage</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <Select
            label="Department"
            options={departmentOptions}
            value={formData['Department Name']}
            onChange={(e) => handleDepartmentChange(e.target.value)}
          />

          <Select
            label="Category Name"
            options={categoryOptions}
            value={formData['Category Name']}
            onChange={(e) => {
              setActivePreset(null);
              setFormData({ ...formData, 'Category Name': e.target.value });
            }}
          />

          <Select
            label="Customer Segment"
            options={customerSegmentOptions}
            value={formData['Customer Segment']}
            onChange={(e) => {
              setActivePreset(null);
              setFormData({ ...formData, 'Customer Segment': e.target.value });
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Payment Type"
            options={paymentTypeOptions}
            value={formData.Type}
            onChange={(e) => {
              setActivePreset(null);
              setFormData({ ...formData, Type: e.target.value });
            }}
          />

          <Input
            label="Order Quantity"
            type="number"
            min={1}
            max={50}
            value={formData['Order Item Quantity']}
            onChange={(e) => {
              setActivePreset(null);
              setFormData({ ...formData, 'Order Item Quantity': parseInt(e.target.value, 10) || 1 });
            }}
          />

          <Input
            label="Product Price ($)"
            type="number"
            step="0.01"
            min={0}
            value={formData['Product Price']}
            onChange={(e) => {
              setActivePreset(null);
              setFormData({ ...formData, 'Product Price': parseFloat(e.target.value) || 0 });
            }}
          />

          <Input
            label="Total Sales ($)"
            type="number"
            step="0.01"
            min={0}
            value={formData.Sales}
            onChange={(e) => {
              setActivePreset(null);
              setFormData({ ...formData, Sales: parseFloat(e.target.value) || 0 });
            }}
          />
        </div>
      </Card>

      {/* Submission CTA */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-[12px] text-[#62666d]">
          Empirically evaluated against production regression pipeline (RMSE ~0.97d).
        </p>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={submitting || loadingHierarchy}
          icon={<Sparkles className="w-4 h-4" />}
        >
          {submitting ? 'Running Inference...' : 'Generate Shipping Forecast'}
        </Button>
      </div>
    </form>
  );
};
