'use client';

import { useState } from 'react';

interface TreeVisualizerProps {
  familyUnitId: string;
}

export default function TreeVisualizer({ familyUnitId }: TreeVisualizerProps) {
  const [treeText, setTreeText] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showStats, setShowStats] = useState(false);

  const loadTree = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/family-units/export?familyUnitId=${familyUnitId}`);

      if (!response.ok) throw new Error('Failed to load tree');

      const data = await response.json();
      setTreeText(data.treeText);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tree');
    } finally {
      setLoading(false);
    }
  };

  const downloadTree = () => {
    const element = document.createElement('a');
    const file = new Blob([treeText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `family-tree-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(treeText);
      alert('Pohon silsilah copied to clipboard!');
    } catch {
      alert('Failed to copy');
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={loadTree}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {loading ? 'Memuat...' : '🌳 Tampilkan Pohon Silsilah'}
        </button>

        {treeText && (
          <>
            <button
              onClick={copyToClipboard}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
            >
              📋 Copy ke Clipboard
            </button>

            <button
              onClick={downloadTree}
              className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-medium"
            >
              ⬇️ Download File
            </button>

            <button
              onClick={() => setShowStats(!showStats)}
              className="px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 font-medium"
            >
              📊 {showStats ? 'Sembunyikan' : 'Tampilkan'} Statistik
            </button>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Statistics */}
      {stats && showStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 border border-gray-300 rounded">
          <div>
            <p className="text-sm text-gray-600">Total Unit Keluarga</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalUnits}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Anggota</p>
            <p className="text-3xl font-bold text-green-600">{stats.totalMembers}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Generasi</p>
            <p className="text-3xl font-bold text-purple-600">{stats.generations}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Meninggal (Alm)</p>
            <p className="text-3xl font-bold text-gray-600">{stats.deceasedCount}</p>
          </div>
        </div>
      )}

      {/* Tree Display */}
      {treeText && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Pohon Silsilah:</h3>
            <span className="text-sm text-gray-600">Format: Tree Text</span>
          </div>

          <div className="p-6 bg-white border border-gray-300 rounded-lg overflow-x-auto">
            <pre className="font-mono text-sm text-gray-800 whitespace-pre-wrap break-words">
              {treeText}
            </pre>
          </div>

          {/* Verification Tips */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <h4 className="font-semibold text-blue-900 mb-2">✓ Cara Verifikasi:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Periksa root (moyang) ada di baris paling atas</li>
              <li>• Pastikan indentasi menunjukkan generasi dengan benar</li>
              <li>• Klik member profile untuk lihat detail relasi</li>
              <li>• Gunakan statistik untuk cek total data sesuai</li>
              <li>• Tanda ✝ untuk anggota yang meninggal (Alm)</li>
            </ul>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!treeText && !loading && (
        <div className="p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded text-center">
          <p className="text-gray-600 mb-3">
            Belum ada pohon silsilah yang ditampilkan
          </p>
          <p className="text-sm text-gray-500">
            Klik tombol "Tampilkan Pohon Silsilah" untuk melihat struktur keluarga
          </p>
        </div>
      )}
    </div>
  );
}
