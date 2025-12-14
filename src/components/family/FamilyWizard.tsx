'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FamilyWizardProps {
  familyId: string;
  onComplete?: () => void;
}

interface WizardStep {
  father: {
    fullName: string;
    gender: string;
    birthDate: string;
  };
  mother: {
    fullName: string;
    gender: string;
    birthDate: string;
  };
  children: Array<{
    fullName: string;
    gender: string;
    birthDate: string;
  }>;
}

export default function FamilyWizard({ familyId, onComplete }: FamilyWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<WizardStep>({
    father: { fullName: '', gender: 'male', birthDate: '' },
    mother: { fullName: '', gender: 'female', birthDate: '' },
    children: []
  });

  const steps = [
    { title: 'Data Ayah', description: 'Masukkan informasi ayah keluarga' },
    { title: 'Data Ibu', description: 'Masukkan informasi ibu keluarga' },
    { title: 'Tambah Anak', description: 'Tambahkan anak-anak mereka (optional)' },
    { title: 'Ringkasan', description: 'Review dan simpan keluarga baru' }
  ];

  const handleFatherChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      father: { ...prev.father, [field]: value }
    }));
  };

  const handleMotherChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      mother: { ...prev.mother, [field]: value }
    }));
  };

  const handleChildChange = (index: number, field: string, value: string) => {
    const newChildren = [...formData.children];
    newChildren[index] = { ...newChildren[index], [field]: value };
    setFormData(prev => ({ ...prev, children: newChildren }));
  };

  const addChild = () => {
    setFormData(prev => ({
      ...prev,
      children: [...prev.children, { fullName: '', gender: 'male', birthDate: '' }]
    }));
  };

  const removeChild = (index: number) => {
    setFormData(prev => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index)
    }));
  };

  const validateStep = () => {
    if (currentStep === 0 && !formData.father.fullName.trim()) {
      setError('Nama ayah tidak boleh kosong');
      return false;
    }
    if (currentStep === 1 && !formData.mother.fullName.trim()) {
      setError('Nama ibu tidak boleh kosong');
      return false;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Step 1: Create father member
      const fatherRes = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData.father,
          familyId,
          isAlive: true
        })
      });

      if (!fatherRes.ok) throw new Error('Gagal membuat data ayah');
      const father = await fatherRes.json();

      // Step 2: Create mother member
      const motherRes = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData.mother,
          familyId,
          isAlive: true
        })
      });

      if (!motherRes.ok) throw new Error('Gagal membuat data ibu');
      const mother = await motherRes.json();

      // Step 3: Create marriage relationship
      const marriageRes = await fetch('/api/relationships/marriages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spouseAId: father.id,
          spouseBId: mother.id,
          marriageDate: new Date().toISOString().split('T')[0]
        })
      });

      if (!marriageRes.ok) throw new Error('Gagal membuat hubungan pernikahan');
      const marriage = await marriageRes.json();

      // Step 4: Create children
      const childrenIds: string[] = [];
      for (const child of formData.children) {
        const childRes = await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...child,
            familyId,
            isAlive: true
          })
        });

        if (!childRes.ok) throw new Error('Gagal membuat data anak');
        const childMember = await childRes.json();
        childrenIds.push(childMember.id);

        // Create parent-child relationships
        await fetch('/api/relationships/parent-child', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            parentId: father.id,
            childId: childMember.id,
            parentRole: 'father'
          })
        });

        await fetch('/api/relationships/parent-child', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            parentId: mother.id,
            childId: childMember.id,
            parentRole: 'mother'
          })
        });
      }

      // Step 5: Create family unit
      const unitRes = await fetch('/api/family-units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyId,
          fatherId: father.id,
          motherId: mother.id,
          marriageId: marriage.id,
          childrenIds
        })
      });

      if (!unitRes.ok) throw new Error('Gagal membuat unit keluarga');

      // Success! Redirect or callback
      if (onComplete) {
        onComplete();
      } else {
        router.push('/family-units');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`flex-1 text-center ${idx <= currentStep ? 'opacity-100' : 'opacity-50'}`}
            >
              <div
                className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center font-bold ${
                  idx <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {idx + 1}
              </div>
              <p className="text-sm font-semibold">{step.title}</p>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h2>
        <p className="text-gray-600 mb-6">{steps[currentStep].description}</p>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Step 0: Father Info */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nama Lengkap Ayah *</label>
              <input
                type="text"
                value={formData.father.fullName}
                onChange={(e) => handleFatherChange('fullName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Nama ayah..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Jenis Kelamin</label>
                <select
                  value={formData.father.gender}
                  onChange={(e) => handleFatherChange('gender', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="male">Laki-laki</option>
                  <option value="female">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tanggal Lahir</label>
                <input
                  type="date"
                  value={formData.father.birthDate}
                  onChange={(e) => handleFatherChange('birthDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Mother Info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nama Lengkap Ibu *</label>
              <input
                type="text"
                value={formData.mother.fullName}
                onChange={(e) => handleMotherChange('fullName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Nama ibu..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Jenis Kelamin</label>
                <select
                  value={formData.mother.gender}
                  onChange={(e) => handleMotherChange('gender', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="female">Perempuan</option>
                  <option value="male">Laki-laki</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tanggal Lahir</label>
                <input
                  type="date"
                  value={formData.mother.birthDate}
                  onChange={(e) => handleMotherChange('birthDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Children */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Tambahkan anak-anak dari pasangan ini. Ini bersifat opsional.
            </p>
            {formData.children.map((child, idx) => (
              <div key={idx} className="p-4 border border-gray-300 rounded bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold">Anak #{idx + 1}</h4>
                  <button
                    onClick={() => removeChild(idx)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Hapus
                  </button>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Nama lengkap"
                    value={child.fullName}
                    onChange={(e) => handleChildChange(idx, 'fullName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={child.gender}
                      onChange={(e) => handleChildChange(idx, 'gender', e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="male">Laki-laki</option>
                      <option value="female">Perempuan</option>
                    </select>
                    <input
                      type="date"
                      value={child.birthDate}
                      onChange={(e) => handleChildChange(idx, 'birthDate', e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addChild}
              className="w-full px-4 py-2 border-2 border-dashed border-blue-600 text-blue-600 rounded hover:bg-blue-50 font-medium"
            >
              + Tambah Anak Lain
            </button>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border border-gray-300 rounded p-4 bg-gray-50">
              <h4 className="font-semibold mb-3 text-lg">Pasangan Inti</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ayah</p>
                  <p className="font-semibold">{formData.father.fullName}</p>
                  {formData.father.birthDate && (
                    <p className="text-sm text-gray-600">
                      {new Date(formData.father.birthDate).toLocaleDateString('id-ID')}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ibu</p>
                  <p className="font-semibold">{formData.mother.fullName}</p>
                  {formData.mother.birthDate && (
                    <p className="text-sm text-gray-600">
                      {new Date(formData.mother.birthDate).toLocaleDateString('id-ID')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {formData.children.length > 0 && (
              <div className="border border-gray-300 rounded p-4 bg-gray-50">
                <h4 className="font-semibold mb-3 text-lg">Anak-anak ({formData.children.length})</h4>
                <div className="space-y-2">
                  {formData.children.map((child, idx) => (
                    <div key={idx} className="text-sm">
                      <p className="font-medium">{child.fullName}</p>
                      {child.birthDate && (
                        <p className="text-gray-600">
                          {new Date(child.birthDate).toLocaleDateString('id-ID')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                ✓ Data sudah siap disimpan. Klik tombol "Simpan Keluarga" untuk membuat unit keluarga baru.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-4">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0 || loading}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          ← Sebelumnya
        </button>

        {currentStep < steps.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Selanjutnya →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Menyimpan...' : '✓ Simpan Keluarga'}
          </button>
        )}
      </div>
    </div>
  );
}
