'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface FamilyUnit {
  id: string;
  father?: { id: string; fullName: string };
  mother?: { id: string; fullName: string };
  children: Array<{ member: { id: string; fullName: string } }>;
  _count?: { childUnits: number };
}

interface FamilyUnitsListProps {
  familyId: string;
}

export default function FamilyUnitsList({ familyId }: FamilyUnitsListProps) {
  const [units, setUnits] = useState<FamilyUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUnits();
  }, [familyId]);

  const loadUnits = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/family-units?familyId=${familyId}`);
      if (!response.ok) throw new Error('Gagal memuat unit keluarga');
      const data = await response.json();
      setUnits(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Memuat unit keluarga...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        <p>Belum ada unit keluarga. Mulai dengan membuat keluarga inti.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {units.map((unit) => (
        <Link key={unit.id} href={`/family-units/${unit.id}`}>
          <div className="p-4 border border-gray-200 rounded hover:shadow-lg transition cursor-pointer bg-white">
            <div className="mb-3">
              <h3 className="text-lg font-bold">
                {unit.father?.fullName || 'N/A'} & {unit.mother?.fullName || 'N/A'}
              </h3>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              {unit.children.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-700">
                    Anak-anak ({unit.children.length}):
                  </p>
                  <div className="ml-4 space-y-1">
                    {unit.children.map((child) => (
                      <p key={child.member.id}>• {child.member.fullName}</p>
                    ))}
                  </div>
                </div>
              )}

              {unit._count && unit._count.childUnits > 0 && (
                <p className="text-blue-600 font-medium">
                  {unit._count.childUnits} keluarga terhubung melalui pernikahan anak
                </p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
