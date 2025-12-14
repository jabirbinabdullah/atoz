'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import FamilyWizard from '@/components/family/FamilyWizard';
import FamilyUnitsList from '@/components/family/FamilyUnitsList';

export default function FamilyUnitsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showWizard, setShowWizard] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    } else if (status === 'authenticated' && session?.user) {
      loadUserFamily();
    }
  }, [status, session, router]);

  const loadUserFamily = async () => {
    try {
      setLoading(true);
      // Get or create user's family (assuming user has one family)
      // For now, we'll use the first/default family or create one
      const response = await fetch('/api/families');
      if (response.ok) {
        const families = await response.json();
        if (Array.isArray(families) && families.length > 0) {
          setFamilyId(families[0].id);
        } else {
          // Create default family for user
          const createRes = await fetch('/api/families', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: `Keluarga ${session?.user?.name || 'Saya'}`
            })
          });
          if (createRes.ok) {
            const newFamily = await createRes.json();
            setFamilyId(newFamily.id);
          }
        }
      }
    } catch (err) {
      console.error('Error loading family:', err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Susunan Keluarga
              </h1>
              <p className="text-gray-600">
                Kelola unit keluarga inti Anda (pasangan + anak-anak)
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50 font-medium"
            >
              ← Kembali ke Dashboard
            </Link>
          </div>
        </div>

        {/* Main Content */}
        {showWizard && familyId ? (
          <div className="mb-8">
            <button
              onClick={() => setShowWizard(false)}
              className="mb-6 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50"
            >
              ← Batal
            </button>
            <FamilyWizard
              familyId={familyId}
              onComplete={() => {
                setShowWizard(false);
                setRefreshKey(prev => prev + 1);
              }}
            />
          </div>
        ) : (
          <>
            {/* Quick Action */}
            <div className="mb-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-blue-900 mb-2">
                    Mulai Membangun Silsilah Anda
                  </h2>
                  <p className="text-blue-800">
                    Buat unit keluarga pertama dengan memasukkan data orangtua dan anak-anak mereka.
                  </p>
                </div>
                {familyId && (
                  <div className="flex gap-3 ml-4">
                    <Link
                      href="/import"
                      className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 font-bold whitespace-nowrap"
                    >
                      📥 Import Bagan
                    </Link>
                    <button
                      onClick={() => setShowWizard(true)}
                      className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold whitespace-nowrap"
                    >
                      + Buat Keluarga Baru
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Family Units List */}
            {familyId && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Unit Keluarga Inti</h2>
                <FamilyUnitsList key={refreshKey} familyId={familyId} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
