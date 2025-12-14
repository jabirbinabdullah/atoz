'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { parseGenealogyTree, generateImportPreview } from '@/lib/genealogy-parser';

interface ImportGenealogyProps {
  familyId: string;
  onComplete?: () => void;
}

export default function ImportGenealogy({ familyId, onComplete }: ImportGenealogyProps) {
  const router = useRouter();
  const [step, setStep] = useState<'input' | 'preview' | 'importing' | 'success'>('input');
  const [treeText, setTreeText] = useState('');
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleParse = () => {
    try {
      setError('');
      const parseResult = parseGenealogyTree(treeText);
      const previewText = generateImportPreview(parseResult);
      setPreview(previewText);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse tree');
    }
  };

  const handleImport = async () => {
    try {
      setStep('importing');
      setError('');

      const response = await fetch('/api/import/genealogy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          treeText,
          familyId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Import failed');
      }

      const importResult = await response.json();
      setResult(importResult);
      setStep('success');

      // Refresh after 2 seconds
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        } else {
          router.push('/family-units');
        }
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
      setStep('preview');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📥 Import Bagan Silsilah
        </h2>
        <p className="text-gray-600">
          Paste bagan silsilah dalam format tree untuk diimpor secara otomatis
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Step 1: Input */}
      {step === 'input' && (
        <div className="space-y-6">
          {/* Instructions */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">Format yang Didukung:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Gunakan simbol tree (│, ├, └, ─) untuk struktur</li>
              <li>• Gunakan <code className="bg-blue-100 px-1">+</code> untuk menandai pasangan (contoh: "Ahmad + Siti")</li>
              <li>• Gunakan <code className="bg-blue-100 px-1">•</code> untuk menandai anak</li>
              <li>• Gunakan <code className="bg-blue-100 px-1">(Alm)</code> untuk yang sudah meninggal</li>
              <li>• Numbering seperti "1.", "2." akan otomatis dihapus</li>
            </ul>
          </div>

          {/* Example */}
          <div className="p-4 bg-gray-50 border border-gray-300 rounded">
            <h3 className="font-semibold text-gray-900 mb-2">Contoh Format:</h3>
            <pre className="text-sm text-gray-700 overflow-x-auto">
{`MBAH NURYO UTOMO
│
└── ALI SISWAWIYATA
    │
    ├── 1. SITI MURSIDAH + Muh. Husein
    │   │
    │   ├── • GUNARTO JAZIM + Umi Muaf
    │   │   │
    │   │   └── • Alfareja Ega Avansa
    │   │
    │   └── • NUNUNG NURHAYATI
    │
    └── 2. SITI MARTILAH + Imam Harsono (Alm)
        │
        └── • IMAM HADI PURWANTO + Purwanti`}
            </pre>
          </div>

          {/* Input Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste Bagan Silsilah di Sini:
            </label>
            <textarea
              value={treeText}
              onChange={(e) => setTreeText(e.target.value)}
              className="w-full h-96 px-4 py-3 border border-gray-300 rounded font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Paste bagan silsilah Anda di sini..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium"
            >
              Batal
            </button>
            <button
              onClick={handleParse}
              disabled={!treeText.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Preview Import →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 'preview' && (
        <div className="space-y-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800">
              ✓ Bagan berhasil di-parse! Review data di bawah sebelum melanjutkan.
            </p>
          </div>

          <div className="p-6 bg-gray-50 border border-gray-300 rounded">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {preview}
            </pre>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800 text-sm">
              <strong>Perhatian:</strong> Proses import akan membuat semua anggota, pernikahan, 
              dan unit keluarga secara otomatis. Pastikan data sudah benar sebelum melanjutkan.
            </p>
          </div>

          <div className="flex justify-between gap-4">
            <button
              onClick={() => setStep('input')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium"
            >
              ← Edit Bagan
            </button>
            <button
              onClick={handleImport}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
            >
              ✓ Konfirmasi & Import
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Importing */}
      {step === 'importing' && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Sedang Mengimpor...
          </h3>
          <p className="text-gray-600">
            Mohon tunggu, sistem sedang membuat anggota dan relasi keluarga
          </p>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 'success' && result && (
        <div className="text-center py-12 space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h3 className="text-2xl font-bold text-gray-900">
            Import Berhasil! 🎉
          </h3>

          <div className="max-w-md mx-auto bg-gray-50 border border-gray-300 rounded-lg p-6">
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-sm text-gray-600">Anggota Dibuat</p>
                <p className="text-2xl font-bold text-blue-600">{result.membersCreated}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pernikahan Dibuat</p>
                <p className="text-2xl font-bold text-purple-600">{result.marriagesCreated}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Unit Keluarga</p>
                <p className="text-2xl font-bold text-green-600">{result.familyUnitsCreated}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Error</p>
                <p className="text-2xl font-bold text-red-600">{result.errors?.length || 0}</p>
              </div>
            </div>
          </div>

          {result.errors && result.errors.length > 0 && (
            <div className="max-w-md mx-auto p-4 bg-yellow-50 border border-yellow-200 rounded text-left">
              <h4 className="font-semibold text-yellow-900 mb-2">Warnings:</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                {result.errors.map((err: string, idx: number) => (
                  <li key={idx}>• {err}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-gray-600">
            Mengalihkan ke halaman unit keluarga...
          </p>
        </div>
      )}
    </div>
  );
}
