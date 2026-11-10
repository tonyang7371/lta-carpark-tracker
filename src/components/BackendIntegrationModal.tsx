import React, { useState } from 'react';
import { BackendConfig } from '../types/carpark';
import { 
  X, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  Code, 
  ExternalLink, 
  RefreshCw, 
  Copy, 
  Check 
} from 'lucide-react';

interface BackendIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BackendConfig;
  onSaveConfig: (newConfig: BackendConfig) => void;
  onTestConnection: (url: string, apiKey?: string) => Promise<{ success: boolean; message: string; count?: number }>;
}

export const BackendIntegrationModal: React.FC<BackendIntegrationModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onTestConnection,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<BackendConfig['mode']>(config.mode);
  const [customApiUrl, setCustomApiUrl] = useState<string>(config.customApiUrl);
  const [apiKey, setApiKey] = useState<string>(config.apiKey || '');
  const [autoRefreshIntervalSec, setAutoRefreshIntervalSec] = useState<number>(config.autoRefreshIntervalSec);
  const [isLivePolling, setIsLivePolling] = useState<boolean>(config.isLivePolling);

  const [testStatus, setTestStatus] = useState<{ testing: boolean; result?: { success: boolean; message: string; count?: number } }>({
    testing: false,
  });
  const [copiedSchema, setCopiedSchema] = useState(false);

  const expectedJsonExample = `[
  {
    "id": "ACB",
    "name": "Block 201-209 Toa Payoh MSCP",
    "agency": "HDB",
    "carparkType": "MSCP",
    "parkingSystem": "Electronic (EPS)",
    "address": "Lorong 1 Toa Payoh",
    "district": "Toa Payoh",
    "region": "Central / CBD",
    "nearestMrt": "Toa Payoh",
    "coordinates": { "lat": 1.3328, "lng": 103.8475 },
    "lots": {
      "car": { "available": 85, "total": 520 },
      "motorcycle": { "available": 32, "total": 100 },
      "heavy": { "available": 0, "total": 0 }
    },
    "rates": {
      "weekdayPeak": "$0.60 / 30 mins",
      "weekdayOffPeak": "$0.60 / 30 mins",
      "saturday": "$0.60 / 30 mins",
      "sundayHoliday": "Free (7am-10:30pm)",
      "gracePeriodMins": 15,
      "nightCap": "Max $5.00 overnight",
      "isCentralArea": false
    },
    "evChargers": { "total": 4, "available": 2, "provider": "SP Group", "powerKw": 22 },
    "heightLimitMeters": 2.15,
    "isSheltered": true
  }
]`;

  const handleTest = async () => {
    setTestStatus({ testing: true });
    try {
      const res = await onTestConnection(customApiUrl, apiKey);
      setTestStatus({ testing: false, result: res });
    } catch (err: any) {
      setTestStatus({
        testing: false,
        result: {
          success: false,
          message: err?.message || 'Connection test failed. Verify CORS and endpoint URL.',
        },
      });
    }
  };

  const handleSave = () => {
    onSaveConfig({
      mode,
      customApiUrl,
      apiKey: apiKey.trim() || undefined,
      autoRefreshIntervalSec,
      isLivePolling,
    });
    onClose();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 p-5 bg-slate-900/90">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Server className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Backend Connection Setup
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Configure real-time carpark availability data source for your Singapore tracker.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Data Provider Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setMode('built-in')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  mode === 'built-in'
                    ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-sm'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">Simulated Real-Time Mode</span>
                  {mode === 'built-in' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-400">
                  Pre-populated with authentic Singapore HDB, URA, and Mall carparks with live EPS sensor lot fluctuations.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMode('custom-api')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  mode === 'custom-api'
                    ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-sm'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">Custom Backend API</span>
                  {mode === 'custom-api' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-400">
                  Connect your Node.js, Python, or Go microservice proxying Data.gov.sg or LTA DataMall v2.
                </p>
              </button>
            </div>
          </div>

          {/* Custom API Inputs */}
          {mode === 'custom-api' && (
            <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Custom Endpoint Configuration
                </span>
                <span className="text-[11px] text-slate-500 font-mono">GET Request</span>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Backend API URL</label>
                <input
                  type="text"
                  placeholder="e.g. http://localhost:8080/api/carparks or /api/carparks"
                  value={customApiUrl}
                  onChange={(e) => setCustomApiUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  API Key / Bearer Token (Optional)
                </label>
                <input
                  type="password"
                  placeholder="Optional token passed in Authorization: Bearer"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={testStatus.testing || !customApiUrl}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testStatus.testing ? 'animate-spin' : ''}`} />
                  Test Endpoint
                </button>

                {testStatus.result && (
                  <div className={`text-xs flex items-center gap-1.5 ${testStatus.result.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {testStatus.result.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{testStatus.result.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Polling & Refresh Timing */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300">
                Live Polling Frequency
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLivePolling}
                  onChange={(e) => setIsLivePolling(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                <span className="ml-2 text-xs text-slate-300">Auto-refresh</span>
              </label>
            </div>

            {isLivePolling && (
              <div className="flex items-center gap-2">
                {[15, 30, 60, 120].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setAutoRefreshIntervalSec(sec)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                      autoRefreshIntervalSec === sec
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-semibold'
                        : 'bg-slate-800/60 text-slate-400 border border-slate-700/60 hover:text-slate-200'
                    }`}
                  >
                    Every {sec}s
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Expected JSON Payload Schema */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <Code className="w-4 h-4 text-slate-400" />
                <span>Backend Target JSON Schema</span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(expectedJsonExample)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSchema ? 'Copied' : 'Copy Example'}
              </button>
            </div>
            <pre className="bg-slate-950 p-3 rounded-lg text-[10px] font-mono text-slate-300 overflow-x-auto max-h-36 border border-slate-800/80">
              {expectedJsonExample}
            </pre>
          </div>

          {/* Singapore Open Data Reference Links */}
          <div className="text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Public Singapore Data APIs to connect:</p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://beta.data.gov.sg/collections/139/datasets/d_23f946fa557947f93a8043bbef41dd09/view"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-emerald-400 hover:underline"
              >
                Data.gov.sg Carpark Availability
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://datamall.lta.gov.sg/content/datamall/en/dynamic-data.html"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-emerald-400 hover:underline"
              >
                LTA DataMall CarParkAvailabilityv2
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-800 p-4 bg-slate-900/90">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
