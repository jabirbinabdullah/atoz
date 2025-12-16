'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TreeVisualizer from '@/components/family/TreeVisualizer';
import HierarchyViewer from '@/components/family/HierarchyViewer';

interface FamilyData {
  id: string;
  name: string;
  familyUnits: Array<{ id: string; father?: { fullName: string }; mother?: { fullName: string } }>;
}

export default function TreeVisualizationPage() {
  const router = useRouter();
  const [families, setFamilies] = useState<FamilyData[]>([]);
  const [selectedFamilyUnit, setSelectedFamilyUnit] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'hierarchy'>('tree');

  useEffect(() => {
    loadFamilies();
  }, []);

  const loadFamilies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/families');
      if (response.ok) {
        const familiesData = await response.json();
        
        // Load family units for each family
        const familiesWithUnits = await Promise.all(
          familiesData.map(async (family: any) => {
            const unitsResponse = await fetch(`/api/family-units?familyId=${family.id}`);
            const units = unitsResponse.ok ? await unitsResponse.json() : [];
            return { ...family, familyUnits: units };
          })
        );

        setFamilies(familiesWithUnits);

        // Set first family unit as default
        if (familiesWithUnits.length > 0 && familiesWithUnits[0].familyUnits.length > 0) {
          setSelectedFamilyUnit(familiesWithUnits[0].familyUnits[0].id);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load families');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data keluarga...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                🌳 Visualisasi Pohon Silsilah
              </h1>
              <p className="text-gray-600">
                Lihat dan verifikasi struktur keluarga yang telah diimpor
              </p>
            </div>
            <Link
              href="/family-units"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50 font-medium"
            >
              ← Kembali ke Susunan Keluarga
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {families.length === 0 ? (
          <div className="p-8 bg-yellow-50 border border-yellow-200 rounded text-center">
            <p className="text-yellow-800">
              Belum ada data keluarga. Silakan buat atau import keluarga terlebih dahulu.
            </p>
            <Link
              href="/family-units"
              className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
            >
              Buat Keluarga
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Pilih Unit Keluarga</h2>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {families.map(family => (
                    <div key={family.id}>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 px-2">
                        {family.name}
                      </h3>
                      <div className="space-y-2">
                        {family.familyUnits && family.familyUnits.length > 0 ? (
                          family.familyUnits.map((unit: any) => (
                            <button
                              key={unit.id}
                              onClick={() => setSelectedFamilyUnit(unit.id)}
                              className={`w-full text-left px-4 py-3 rounded transition text-sm ${
                                selectedFamilyUnit === unit.id
                                  ? 'bg-blue-600 text-white font-semibold'
                                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                              }`}
                            >
                              <div className="font-medium truncate">
                                {unit.father?.fullName || 'Unknown'}
                              </div>
                              {unit.mother?.fullName && (
                                <div className="text-xs truncate">
                                  + {unit.mother.fullName}
                                </div>
                              )}
                            </button>
                          ))
                        ) : (
                          <p className="text-sm text-gray-600 px-2">Tidak ada unit keluarga</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {selectedFamilyUnit ? (
                <div className="space-y-6">
                  {/* View Mode Switcher */}
                  <div className="bg-white rounded-lg shadow p-4 sticky top-8">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewMode('tree')}
                        className={`px-6 py-2 rounded font-medium transition ${
                          viewMode === 'tree'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        📄 View Tree Text
                      </button>
                      <button
                        onClick={() => setViewMode('hierarchy')}
                        className={`px-6 py-2 rounded font-medium transition ${
                          viewMode === 'hierarchy'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        📋 View Hierarki
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="bg-white rounded-lg shadow p-8">
                    {viewMode === 'tree' ? (
                      <TreeVisualizer familyUnitId={selectedFamilyUnit} />
                    ) : (
                      <HierarchyViewer familyUnitId={selectedFamilyUnit} />
                    )}
                  </div>

                  {/* Verification Guide */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-green-900 mb-3">✓ Checklist Verifikasi</h3>
                    <ul className="space-y-2 text-sm text-green-800">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">☐</span>
                        <span><strong>Root Member:</strong> Apakah moyang tertua ada di posisi paling atas?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">☐</span>
                        <span><strong>Indentasi Generasi:</strong> Apakah indentasi menunjukkan generasi dengan benar?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">☐</span>
                        <span><strong>Pasangan:</strong> Apakah pasangan ditampilkan dengan tanda "+"?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">☐</span>
                        <span><strong>Anak-anak:</strong> Apakah semua anak ditampilkan di level yang sesuai?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">☐</span>
                        <span><strong>Meninggal:</strong> Apakah anggota yang meninggal ditandai dengan (Alm) atau ✝?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">☐</span>
                        <span><strong>Total Data:</strong> Apakah jumlah anggota sesuai dengan statistik di dashboard?</span>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded text-center">
                  <p className="text-gray-600">
                    Pilih unit keluarga dari sidebar untuk melihat visualisasi pohon silsilah
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
