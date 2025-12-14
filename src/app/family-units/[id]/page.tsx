'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface FamilyUnit {
  id: string;
  father?: { id: string; fullName: string; gender?: string; birthDate?: string };
  mother?: { id: string; fullName: string; gender?: string; birthDate?: string };
  marriage?: { id: string; marriageDate?: string };
  children: Array<{ member: { id: string; fullName: string; birthDate?: string } }>;
  parentUnit?: { father?: { fullName: string }; mother?: { fullName: string } };
  childUnits: Array<{ id: string; father?: { fullName: string }; mother?: { fullName: string } }>;
}

export default function FamilyUnitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [familyUnit, setFamilyUnit] = useState<FamilyUnit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const resolveParams = async () => {
      const { id } = await params;
      setResolvedParams({ id });
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (resolvedParams) {
      loadFamilyUnit();
    }
  }, [resolvedParams]);

  const loadFamilyUnit = async () => {
    try {
      if (!resolvedParams?.id) return;
      setLoading(true);
      const response = await fetch(`/api/family-units/${resolvedParams.id}`);
      if (!response.ok) throw new Error('Gagal memuat unit keluarga');
      const data = await response.json();
      setFamilyUnit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!familyUnit || !confirm('Apakah Anda yakin ingin menghapus unit keluarga ini?')) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/family-units/${familyUnit.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Gagal menghapus unit keluarga');

      router.push('/family-units');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Memuat...</p>
      </div>
    );
  }

  if (error || !familyUnit) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/family-units"
            className="mb-6 inline-block px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50"
          >
            ← Kembali
          </Link>
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error || 'Unit keluarga tidak ditemukan'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/family-units"
            className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50"
          >
            ← Kembali ke Daftar
          </Link>
          {session?.user && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 font-medium"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus Unit'}
            </button>
          )}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Pasangan Inti */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-6">Pasangan Inti</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Father */}
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-bold text-blue-900 mb-4">Ayah</h3>
                {familyUnit.father ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-blue-700">Nama Lengkap</p>
                      <Link
                        href={`/members/${familyUnit.father.id}`}
                        className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                      >
                        {familyUnit.father.fullName}
                      </Link>
                    </div>
                    {familyUnit.father.birthDate && (
                      <div>
                        <p className="text-sm text-blue-700">Tanggal Lahir</p>
                        <p className="font-medium">
                          {new Date(familyUnit.father.birthDate).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-blue-700">Belum ada data</p>
                )}
              </div>

              {/* Mother */}
              <div className="p-6 bg-pink-50 border border-pink-200 rounded-lg">
                <h3 className="text-lg font-bold text-pink-900 mb-4">Ibu</h3>
                {familyUnit.mother ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-pink-700">Nama Lengkap</p>
                      <Link
                        href={`/members/${familyUnit.mother.id}`}
                        className="text-lg font-semibold text-pink-600 hover:text-pink-800"
                      >
                        {familyUnit.mother.fullName}
                      </Link>
                    </div>
                    {familyUnit.mother.birthDate && (
                      <div>
                        <p className="text-sm text-pink-700">Tanggal Lahir</p>
                        <p className="font-medium">
                          {new Date(familyUnit.mother.birthDate).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-pink-700">Belum ada data</p>
                )}
              </div>
            </div>

            {familyUnit.marriage && (
              <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded">
                <p className="text-sm text-purple-700">
                  💒 Menikah pada{' '}
                  {familyUnit.marriage.marriageDate
                    ? new Date(familyUnit.marriage.marriageDate).toLocaleDateString('id-ID')
                    : 'Tanggal tidak diketahui'}
                </p>
              </div>
            )}
          </div>

          {/* Children */}
          {familyUnit.children.length > 0 && (
            <div className="mb-8 p-6 border border-gray-300 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Anak-anak ({familyUnit.children.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {familyUnit.children.map((child) => (
                  <Link
                    key={child.member.id}
                    href={`/members/${child.member.id}`}
                    className="p-4 border border-gray-200 rounded hover:shadow-lg transition"
                  >
                    <p className="font-semibold text-gray-900">{child.member.fullName}</p>
                    {child.member.birthDate && (
                      <p className="text-sm text-gray-600">
                        {new Date(child.member.birthDate).toLocaleDateString('id-ID')}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Parent Unit Info */}
          {familyUnit.parentUnit && (
            <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-bold mb-2 text-yellow-900">Berasal dari Unit Keluarga:</h3>
              <p className="text-yellow-800">
                {familyUnit.parentUnit.father?.fullName || ''}{' '}
                {familyUnit.parentUnit.mother?.fullName ? `& ${familyUnit.parentUnit.mother.fullName}` : ''}
              </p>
            </div>
          )}

          {/* Connected Family Units */}
          {familyUnit.childUnits.length > 0 && (
            <div className="p-6 border border-gray-300 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">
                Keluarga Terhubung ({familyUnit.childUnits.length})
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Keluarga yang terbentuk ketika anak menikah:
              </p>
              <div className="space-y-3">
                {familyUnit.childUnits.map((unit) => (
                  <Link
                    key={unit.id}
                    href={`/family-units/${unit.id}`}
                    className="block p-4 border border-gray-200 rounded hover:shadow-lg transition"
                  >
                    <p className="font-semibold text-gray-900">
                      {unit.father?.fullName || 'N/A'} & {unit.mother?.fullName || 'N/A'}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
