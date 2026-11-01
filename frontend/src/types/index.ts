export interface DropdownHierarchy {
  markets: string[];
  market_regions: Record<string, string[]>;
  region_countries: Record<string, string[]>;
  country_states: Record<string, string[]>;
  departments: string[];
  dept_categories: Record<string, string[]>;
  category_department: Record<string, string>;
  shipping_modes: string[];
  types: string[];
  customer_segments: string[];
}

export interface PredictionInput {
  "Days for shipment (scheduled)": number;
  "Shipping Mode": string;
  Type: string;
  "Customer Segment": string;
  Market: string;
  "Order Region": string;
  "Order Country": string;
  "Order State": string;
  "Category Name": string;
  "Department Name": string;
  "Order Item Quantity": number;
  Sales: number;
  "Order Item Discount": number;
  "Product Price": number;
  Latitude?: number;
  Longitude?: number;
  order_month?: number;
  order_day?: number;
  order_weekday?: number;
  order_hour?: number;
  is_weekend?: number;
}

export interface PredictionResult {
  predicted_shipping_days: number;
  predicted_shipping_days_rounded?: number;
  scheduled_shipping_days: number;
  difference_days: number;
  is_delayed_risk: boolean;
  speed_category: string;
  badge_class: string;
  icon: string;
  description: string;
  disclaimer: string;
  error?: string;
  validation_failed?: boolean;
}

export interface PredictionHistoryItem {
  id: number;
  user_id?: number | null;
  scheduled_days: number;
  shipping_mode: string;
  order_type: string;
  customer_segment: string;
  market: string;
  order_region: string;
  order_country: string;
  order_state: string;
  category_name: string;
  department_name: string;
  quantity: number;
  sales: number;
  discount: number;
  product_price: number;
  predicted_days: number;
  speed_category: string;
  is_delayed_risk: number | boolean;
  source: string;
  created_at: string;
}

export interface PredictionKPIs {
  total_predictions: number;
  avg_predicted_days: number;
  delayed_risk_count: number;
  delayed_risk_rate: number;
  fast_count: number;
  standard_count: number;
  longer_count: number;
  shipping_mode_distribution: Record<string, number>;
  speed_distribution: Record<string, number>;
}

export interface ModelMetadata {
  dataset_name: string;
  dataset_rows_after_cleaning: number;
  target: string;
  feature_count: number;
  selected_final_model: string;
  metrics: {
    mae: number;
    mse: number;
    rmse: number;
    r2: number;
    train_time_sec: number;
  };
  model_comparison: Array<{
    name: string;
    mae: number;
    mse: number;
    rmse: number;
    r2: number;
    train_time_sec: number;
  }>;
  top_feature_importances: Array<{
    feature: string;
    importance: number;
  }>;
  evaluated_at?: string;
}

export interface AnalyticsModel {
  name: string;
  rmse: number;
  mae: number;
  mse: number;
  r2: number;
  train_time_sec: number;
  rank: number;
  model_type?: string;
}

export interface CorrelationHeatmapData {
  features: string[];
  matrix: number[][];
}

export interface MarketModeMatrixRow {
  market: string;
  same_day: number;
  first_class: number;
  second_class: number;
  standard_class: number;
  average_days: number;
}

export interface AnalyticsSuiteData {
  status: string;
  best_model: {
    name: string;
    metrics: {
      mae: number;
      mse: number;
      rmse: number;
      r2: number;
      train_time_sec?: number;
    };
    feature_count: number;
  };
  models: AnalyticsModel[];
  feature_importances: { feature: string; importance: number }[];
  correlation_heatmap: CorrelationHeatmapData;
  market_mode_matrix: MarketModeMatrixRow[];
  transit_distribution: {
    labels: string[];
    values: number[];
  };
  category_distribution: {
    labels: string[];
    values: number[];
  };
  mode_distribution: {
    labels: string[];
    values: number[];
  };
}

export interface DashboardData {
  kpis: PredictionKPIs;
  history: PredictionHistoryItem[];
  metadata: ModelMetadata;
}

export interface CustomerPersona {
  cluster: number;
  count: number;
  pct_customers: number;
  total_sales: number;
  total_sales_sum: number;
  pct_sales: number;
  order_count: number;
  avg_shipping_days: number;
  avg_order_quantity: number;
  avg_discount: number;
  top_segments: Record<string, number>;
  persona_title: string;
  badge_color: string;
  description: string;
  strategy: string;
}

export interface ClusteringResult {
  status: string;
  k: number;
  algorithm: string;
  metrics: {
    silhouette_score: number;
    calinski_harabasz: number;
    davies_bouldin: number;
    wcss: number;
  };
  personas: CustomerPersona[];
  elbow_curve?: Array<{ k: number; wcss: number }>;
  pca_scatter?: Array<{ x: number; y: number; cluster: number }>;
  pca_variance?: number[];
  overview?: string;
}

export interface AssociationRule {
  antecedents: string[];
  consequents: string[];
  support: number;
  confidence: number;
  lift: number;
  leverage: number;
  conviction: number;
  rule_string: string;
}

export interface AssociationRulesResult {
  status: string;
  item_level: string;
  total_baskets: number;
  frequent_itemsets_count: number;
  rules_count: number;
  rules: AssociationRule[];
  summary: {
    max_lift: number;
    avg_confidence: number;
    avg_support: number;
  };
}

