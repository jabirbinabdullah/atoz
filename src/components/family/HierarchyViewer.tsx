'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface FamilyMember {
  id: string;
  fullName: string;
  isAlive: boolean;
  level: number;
}

interface HierarchyViewerProps {
  familyUnitId: string;
}

export default function HierarchyViewer({ familyUnitId }: HierarchyViewerProps) {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set([0]));

  const loadHierarchy = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/family-units/${familyUnitId}`);

      if (!response.ok) throw new Error('Failed to load family unit');

      const data = await response.json();
      const hierarchy = buildHierarchy(data, 0);
      setMembers(hierarchy);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load hierarchy');
    } finally {
      setLoading(false);
    }
  };

  const buildHierarchy = (unit: any, level: number): FamilyMember[] => {
    const result: FamilyMember[] = [];

    // Add father
    if (unit.father) {
      result.push({
        id: unit.father.id,
        fullName: unit.father.fullName,
        isAlive: unit.father.isAlive,
        level
      });
    }

    // Add mother
    if (unit.mother) {
      result.push({
        id: unit.mother.id,
        fullName: unit.mother.fullName,
        isAlive: unit.mother.isAlive,
        level
      });
    }

    // Add children
    unit.children?.forEach((child: any) => {
      result.push({
        id: child.member.id,
        fullName: child.member.fullName,
        isAlive: child.member.isAlive,
        level: level + 1
      });
    });

    // Add child units recursively
    unit.childUnits?.forEach((childUnit: any) => {
      const childMembers = buildHierarchy(childUnit, level + 1);
      result.push(...childMembers);
    });

    return result;
  };

  const toggleLevel = (level: number) => {
    const newExpanded = new Set(expandedLevels);
    if (newExpanded.has(level)) {
      newExpanded.delete(level);
    } else {
      newExpanded.add(level);
    }
    setExpandedLevels(newExpanded);
  };

  const filteredMembers = members.filter(m => expandedLevels.has(m.level) || m.level === 0);

  useEffect(() => {
    loadHierarchy();
  }, [familyUnitId]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={loadHierarchy}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {loading ? '⟳ Memuat...' : '↻ Refresh Hierarki'}
        </button>

        <button
          onClick={() => setExpandedLevels(new Set(Array.from({ length: 10 }, (_, i) => i)))}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
        >
          ⊞ Expand Semua
        </button>

        <button
          onClick={() => setExpandedLevels(new Set([0]))}
          className="px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 font-medium"
        >
          ⊟ Collapse Semua
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Member List */}
      {!loading && members.length > 0 ? (
        <div className="space-y-2 p-6 bg-gray-50 border border-gray-300 rounded-lg max-h-96 overflow-y-auto">
          {filteredMembers.map((member, idx) => (
            <div key={`${member.id}-${idx}`} className="space-y-1">
              <div
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded transition"
                style={{ marginLeft: `${member.level * 24}px` }}
              >
                <span className="text-gray-500 font-mono text-sm">
                  {member.level > 0 ? '├─' : '●'}
                </span>

                <Link
                  href={`/members/${member.id}`}
                  className="flex-1 font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {member.fullName}
                </Link>

                <span className={`text-xs px-2 py-1 rounded ${member.isAlive ? 'bg-green-100 text-green-700' : 'bg-gray-300 text-gray-700'}`}>
                  {member.isAlive ? '✓ Hidup' : '✝ Meninggal'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : !loading ? (
        <div className="p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded text-center text-gray-600">
          Tidak ada anggota dalam hierarki ini
        </div>
      ) : null}

      {/* Legend */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
        <h4 className="font-semibold text-blue-900 mb-2">Legenda:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-semibold">✓</span>
            <span>Anggota yang masih hidup</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 font-semibold">✝</span>
            <span>Anggota yang meninggal (Alm)</span>
          </div>
          <div className="flex items-center gap-2">
            <span>●</span>
            <span>Generasi pertama (root)</span>
          </div>
          <div className="flex items-center gap-2">
            <span>├─</span>
            <span>Generasi berikutnya (anak, cucu, dll)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
