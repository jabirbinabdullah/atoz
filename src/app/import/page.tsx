'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ImportGenealogy from '@/components/family/ImportGenealogy';

export default function ImportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
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
                Import Bagan Silsilah
              </h1>
              <p className="text-gray-600">
                Import silsilah keluarga lengkap dari format tree text
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

        {/* Main Content */}
        {familyId ? (
          <ImportGenealogy
            familyId={familyId}
            onComplete={() => router.push('/family-units')}
          />
        ) : (
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800">
              Tidak dapat menemukan family. Silakan refresh halaman atau hubungi administrator.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
