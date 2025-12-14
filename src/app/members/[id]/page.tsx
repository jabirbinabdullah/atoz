'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Member {
  id: string
  fullName: string
  gender: string | null
  birthDate: string | null
  deathDate: string | null
  birthPlace: string | null
  address: string | null
  occupation: string | null
  phone: string | null
  email: string | null
  photoUrl: string | null
  notes: string | null
  isAlive: boolean
  createdAt: string
  updatedAt: string
  parents?: Array<{
    id: string
    parentRole: string | null
    parent: {
      id: string
      fullName: string
      gender: string | null
      birthDate: string | null
    }
  }>
  children?: Array<{
    id: string
    child: {
      id: string
      fullName: string
      gender: string | null
      birthDate: string | null
    }
  }>
  marriagesA?: Array<{
    id: string
    marriageDate: string | null
    divorceDate: string | null
    notes: string | null
    spouseB: {
      id: string
      fullName: string
      gender: string | null
    }
  }>
  marriagesB?: Array<{
    id: string
    marriageDate: string | null
    divorceDate: string | null
    notes: string | null
    spouseA: {
      id: string
      fullName: string
      gender: string | null
    }
  }>
}

export default function MemberDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Member>>({})

  const fetchMember = useCallback(async () => {
    try {
      const res = await fetch(`/api/members/${params.id}`)
      if (!res.ok) {
        if (res.status === 404) {
          setError('Anggota tidak ditemukan')
        } else if (res.status === 401) {
          router.push('/auth/signin')
          return
        } else {
          setError('Gagal memuat data')
        }
        setLoading(false)
        return
      }
      const data = await res.json()
      setMember(data)
      setFormData(data)
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }, [params.id, router])

  useEffect(() => {
    fetchMember()
  }, [fetchMember])

  async function handleSave() {
    try {
      const res = await fetch(`/api/members/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          gender: formData.gender || null,
          birthDate: formData.birthDate || null,
          deathDate: formData.deathDate || null,
          birthPlace: formData.birthPlace || null,
          address: formData.address || null,
          occupation: formData.occupation || null,
          phone: formData.phone || null,
          email: formData.email || null,
          photoUrl: formData.photoUrl || null,
          notes: formData.notes || null,
          isAlive: formData.isAlive,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Gagal menyimpan')
        return
      }

      const updated = await res.json()
      setMember(updated)
      setIsEditing(false)
      alert('Berhasil diperbarui')
    } catch {
      alert('Terjadi kesalahan')
    }
  }

  async function handleDelete() {
    if (!confirm('Yakin ingin menghapus anggota ini? Semua relasi akan terhapus.')) {
      return
    }

    try {
      const res = await fetch(`/api/members/${params.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Gagal menghapus')
        return
      }

      alert('Berhasil dihapus')
      router.push('/members')
    } catch {
      alert('Terjadi kesalahan')
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <main className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="text-gray-500">Memuat...</div>
        </div>
      </main>
    )
  }

  if (error || !member) {
    return (
      <main className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error || 'Anggota tidak ditemukan'}</div>
          <Link href="/members" className="text-blue-600 hover:underline">
            ← Kembali ke daftar
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600">
        <Link href="/" className="hover:text-gray-900">Home</Link>
        {' / '}
        <Link href="/members" className="hover:text-gray-900">Anggota</Link>
        {' / '}
        <span className="text-gray-900">{member.fullName}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{member.fullName}</h1>
          <div className="mt-2 flex gap-4 text-sm text-gray-600">
            <span>{member.gender === 'male' ? '♂ Laki-laki' : member.gender === 'female' ? '♀ Perempuan' : '-'}</span>
            <span>•</span>
            <span>{member.isAlive ? '✓ Hidup' : '† Wafat'}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit
            </button>
          )}
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Hapus
          </button>
        </div>
      </div>

      {/* Main Content */}
      {!isEditing ? (
        <div className="space-y-6">
          {/* Personal Info */}
          <section className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Informasi Pribadi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Tanggal Lahir" value={formatDate(member.birthDate)} />
              <InfoRow label="Tempat Lahir" value={member.birthPlace || '-'} />
              {!member.isAlive && (
                <InfoRow label="Tanggal Wafat" value={formatDate(member.deathDate)} />
              )}
              <InfoRow label="Alamat" value={member.address || '-'} />
              <InfoRow label="Pekerjaan" value={member.occupation || '-'} />
              <InfoRow label="Telepon" value={member.phone || '-'} />
              <InfoRow label="Email" value={member.email || '-'} />
            </div>
            {member.notes && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm font-semibold text-gray-700 mb-1">Catatan</div>
                <div className="text-gray-600">{member.notes}</div>
              </div>
            )}
          </section>

          {/* Parents */}
          {member.parents && member.parents.length > 0 && (
            <section className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Orang Tua</h2>
              <div className="space-y-2">
                {member.parents.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/members/${rel.parent.id}`}
                    className="block p-3 border rounded hover:bg-gray-50"
                  >
                    <div className="font-semibold">{rel.parent.fullName}</div>
                    <div className="text-sm text-gray-600">
                      {rel.parentRole === 'father' ? 'Ayah' : rel.parentRole === 'mother' ? 'Ibu' : 'Orang Tua'}
                      {' • '}
                      {rel.parent.birthDate && formatDate(rel.parent.birthDate)}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Children */}
          {member.children && member.children.length > 0 && (
            <section className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Anak</h2>
              <div className="space-y-2">
                {member.children.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/members/${rel.child.id}`}
                    className="block p-3 border rounded hover:bg-gray-50"
                  >
                    <div className="font-semibold">{rel.child.fullName}</div>
                    <div className="text-sm text-gray-600">
                      {rel.child.gender === 'male' ? '♂' : rel.child.gender === 'female' ? '♀' : ''}
                      {' '}
                      {rel.child.birthDate && formatDate(rel.child.birthDate)}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Marriages */}
          {((member.marriagesA && member.marriagesA.length > 0) ||
            (member.marriagesB && member.marriagesB.length > 0)) && (
            <section className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Pernikahan</h2>
              <div className="space-y-3">
                {member.marriagesA?.map((marriage) => (
                  <div key={marriage.id} className="p-3 border rounded">
                    <Link
                      href={`/members/${marriage.spouseB.id}`}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      {marriage.spouseB.fullName}
                    </Link>
                    <div className="text-sm text-gray-600 mt-1">
                      {marriage.marriageDate && `Menikah: ${formatDate(marriage.marriageDate)}`}
                      {marriage.divorceDate && ` • Cerai: ${formatDate(marriage.divorceDate)}`}
                    </div>
                    {marriage.notes && <div className="text-sm text-gray-500 mt-1">{marriage.notes}</div>}
                  </div>
                ))}
                {member.marriagesB?.map((marriage) => (
                  <div key={marriage.id} className="p-3 border rounded">
                    <Link
                      href={`/members/${marriage.spouseA.id}`}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      {marriage.spouseA.fullName}
                    </Link>
                    <div className="text-sm text-gray-600 mt-1">
                      {marriage.marriageDate && `Menikah: ${formatDate(marriage.marriageDate)}`}
                      {marriage.divorceDate && ` • Cerai: ${formatDate(marriage.divorceDate)}`}
                    </div>
                    {marriage.notes && <div className="text-sm text-gray-500 mt-1">{marriage.notes}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        // Edit Form
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSave()
          }}
          className="border rounded-lg p-6 space-y-4"
        >
          <h2 className="text-xl font-semibold mb-4">Edit Anggota</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Nama Lengkap *</label>
              <input
                type="text"
                required
                value={formData.fullName || ''}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Gender</label>
              <select
                value={formData.gender || ''}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full border p-2 rounded"
              >
                <option value="">Pilih</option>
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Tanggal Lahir</label>
              <input
                type="date"
                value={formData.birthDate?.split('T')[0] || ''}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Tempat Lahir</label>
              <input
                type="text"
                value={formData.birthPlace || ''}
                onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Status</label>
              <select
                value={formData.isAlive ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, isAlive: e.target.value === 'true' })}
                className="w-full border p-2 rounded"
              >
                <option value="true">Hidup</option>
                <option value="false">Wafat</option>
              </select>
            </div>

            {!formData.isAlive && (
              <div>
                <label className="block text-sm font-semibold mb-1">Tanggal Wafat</label>
                <input
                  type="date"
                  value={formData.deathDate?.split('T')[0] || ''}
                  onChange={(e) => setFormData({ ...formData, deathDate: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-1">Alamat</label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Pekerjaan</label>
              <input
                type="text"
                value={formData.occupation || ''}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Telepon</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Catatan</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <button
              type="button"
              onClick={() => {
                setFormData(member)
                setIsEditing(false)
              }}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Simpan
            </button>
          </div>
        </form>
      )}
    </main>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm font-semibold text-gray-700">{label}</div>
      <div className="text-gray-900">{value}</div>
    </div>
  )
}
