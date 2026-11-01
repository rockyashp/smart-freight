import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { predictionService } from '../services/predictionService';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
} from 'lucide-react';

export const BatchPredictPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batchData, setBatchData] = useState<{
    total: number;
    preview: Record<string, any>[];
    columns: string[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.endsWith('.csv')) {
        setError('Please upload a valid CSV file (.csv format)');
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const res = await predictionService.predictBatch(file);
      setBatchData(res);
    } catch (err: any) {
      setError(err.message || 'Batch prediction failed. Check your CSV column headers.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Batch Shipment Duration Prediction"
        subtitle="Upload a CSV manifest to evaluate bulk shipping durations and identify transit bottlenecks"
        actions={
          <a
            href={predictionService.getSampleCsvUrl()}
            className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-[6px] bg-[#161718] border border-[#23252a] text-[#d0d6e0] hover:text-[#ffffff] hover:border-[#383b3f] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#e4f222]" />
            <span>Download Sample CSV Template</span>
          </a>
        }
      />

      {/* ── Upload & Configuration Box ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#23252a]">
            <div>
              <h3 className="text-[14px] font-[510] text-[#ffffff] tracking-tight">
                Upload Manifest File
              </h3>
              <p className="text-[12px] text-[#8a8f98]">
                Standard supply-chain format with pre-shipment columns
              </p>
            </div>
            {file && (
              <Badge variant="lime" size="sm">
                Ready to Process
              </Badge>
            )}
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-[6px] bg-[#eb5757]/10 border border-[#eb5757]/30 text-[#eb5757] text-[12px] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & Drop Zone */}
          <div className="relative border-2 border-dashed border-[#23252a] hover:border-[#383b3f] rounded-[10px] p-8 text-center transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-12 h-12 rounded-full bg-[#161718] border border-[#23252a] flex items-center justify-center mx-auto mb-3 text-[#8a8f98]">
              {file ? (
                <FileText className="w-6 h-6 text-[#e4f222]" />
              ) : (
                <Upload className="w-6 h-6 text-[#8a8f98]" />
              )}
            </div>

            {file ? (
              <div className="space-y-1">
                <p className="text-[14px] font-[510] text-[#ffffff] font-mono">{file.name}</p>
                <p className="text-[12px] text-[#8a8f98]">
                  {(file.size / 1024).toFixed(1)} KB • Ready for automated batch scoring
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-[14px] font-[510] text-[#ffffff]">
                  Click to select or drag and drop your shipment CSV
                </p>
                <p className="text-[12px] text-[#62666d]">
                  Supported file format: .csv (maximum recommended batch size: 5,000 rows)
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 mt-2">
            <p className="text-[12px] text-[#62666d]">
              Enriched with <span className="font-mono text-[#8a8f98]">predicted_shipping_days</span> and <span className="font-mono text-[#8a8f98]">shipping_speed_category</span>.
            </p>

            <Button
              variant="primary"
              size="md"
              disabled={!file}
              loading={uploading}
              onClick={handleUpload}
              icon={<Sparkles className="w-4 h-4" />}
            >
              {uploading ? 'Processing Batch Manifest...' : 'Process Batch Prediction'}
            </Button>
          </div>
        </Card>

        {/* Expected Format Guide */}
        <Card>
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#23252a]">
            <FileSpreadsheet className="w-4 h-4 text-[#e4f222]" />
            <h4 className="text-[13px] font-[510] text-[#ffffff] tracking-tight">
              Expected Column Schema
            </h4>
          </div>

          <p className="text-[12px] text-[#8a8f98] leading-relaxed mb-3">
            Your file should include standard pre-shipment attributes. Missing optional fields will automatically fall back to dataset medians.
          </p>

          <div className="space-y-2 text-[11px] font-mono">
            <div className="p-2 rounded-[4px] bg-[#161718] border border-[#23252a]">
              <span className="text-[#38bdf8] font-bold">Days for shipment (scheduled)</span>
              <p className="text-[#62666d] text-[10px] mt-0.5">Primary transit baseline</p>
            </div>
            <div className="p-2 rounded-[4px] bg-[#161718] border border-[#23252a]">
              <span className="text-[#d0d6e0]">Shipping Mode</span>
              <p className="text-[#62666d] text-[10px] mt-0.5">Standard, Second, First, Same Day</p>
            </div>
            <div className="p-2 rounded-[4px] bg-[#161718] border border-[#23252a]">
              <span className="text-[#d0d6e0]">Market, Order Region, Order Country</span>
              <p className="text-[#62666d] text-[10px] mt-0.5">Destination geography</p>
            </div>
            <div className="p-2 rounded-[4px] bg-[#161718] border border-[#23252a]">
              <span className="text-[#d0d6e0]">Sales, Quantity, Product Price</span>
              <p className="text-[#62666d] text-[10px] mt-0.5">Order commercial parameters</p>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Results Preview Table ───────────────────────────────────────── */}
      {batchData && (
        <Card padding="none">
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#23252a] flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#27a644]" />
                <h3 className="text-[14px] font-[510] text-[#ffffff] tracking-tight">
                  Batch Processing Complete ({batchData.total.toLocaleString()} Rows)
                </h3>
              </div>
              <p className="text-[12px] text-[#8a8f98] mt-0.5">
                Previewing top {batchData.preview.length} scored shipments below
              </p>
            </div>

            <a
              href={predictionService.getBatchDownloadUrl()}
              className="inline-flex items-center gap-2 text-[13px] px-3.5 py-2 rounded-[6px] bg-[#e4f222] text-[#08090a] font-[510] hover:bg-[#d5e31e] transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Enriched CSV</span>
            </a>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left border-collapse text-[12px]">
              <thead className="sticky top-0 bg-[#0f1011] z-10">
                <tr className="border-b border-[#23252a] text-[#62666d] text-[11px] font-mono uppercase">
                  <th className="py-2.5 px-4 font-normal">#</th>
                  <th className="py-2.5 px-4 font-normal text-[#e4f222]">Predicted Days</th>
                  <th className="py-2.5 px-4 font-normal">Speed Tier</th>
                  <th className="py-2.5 px-4 font-normal">Scheduled</th>
                  <th className="py-2.5 px-4 font-normal">Shipping Mode</th>
                  <th className="py-2.5 px-4 font-normal">Destination</th>
                  <th className="py-2.5 px-4 font-normal">Category</th>
                  <th className="py-2.5 px-4 font-normal">Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#23252a]">
                {batchData.preview.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <td className="py-2 px-4 font-mono text-[#62666d]">{idx + 1}</td>
                    <td className="py-2 px-4 font-mono text-[#ffffff] font-bold text-[13px]">
                      {Math.ceil(Number(row.predicted_shipping_days || 0))}d
                      <span className="text-[10px] text-[#62666d] block font-normal">
                        (~{Number(row.predicted_shipping_days || 0).toFixed(1)}d)
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <Badge variant="neutral" size="sm">
                        {row.shipping_speed_category || 'Standard'}
                      </Badge>
                    </td>
                    <td className="py-2 px-4 font-mono text-[#8a8f98]">
                      {row['Days for shipment (scheduled)'] || '—'}d
                    </td>
                    <td className="py-2 px-4 text-[#8a8f98]">{row['Shipping Mode'] || '—'}</td>
                    <td className="py-2 px-4 text-[#ffffff]">
                      {row['Order Country'] || '—'}
                      <span className="text-[#62666d] block text-[10px]">
                        {row['Order Region'] || ''}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-[#8a8f98]">{row['Category Name'] || '—'}</td>
                    <td className="py-2 px-4 font-mono text-[#8a8f98]">
                      ${Number(row.Sales || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
