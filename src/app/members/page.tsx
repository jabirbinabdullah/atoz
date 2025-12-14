import React, { useEffect, useState } from 'react'

type Member = {
  id: string
  fullName: string
  gender?: string | null
  birthDate?: string | null
  address?: string | null
  occupation?: string | null
  phone?: string | null
  email?: string | null
  isAlive: boolean
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [fullName, setFullName] = useState('')
  const [gender, setGender] = useState('')
  const [isAlive, setIsAlive] = useState('all')
  const [address, setAddress] = useState('')
  const [occupation, setOccupation] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const load = async () => {
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (gender) params.set('gender', gender)
    if (isAlive !== 'all') params.set('isAlive', String(isAlive === 'true'))
    const res = await fetch(`/api/members?${params.toString()}`)
    const data = await res.json()
    setMembers(data)
  }

  useEffect(() => {
    load()
  }, [])

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) return
    setLoading(true)
    await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, gender, address, occupation, phone, email }),
    })
    setFullName('')
    setGender('')
    setAddress('')
    setOccupation('')
    setPhone('')
    setEmail('')
    setLoading(false)
    await load()
  }

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Members</h1>

      <section className="grid gap-3 md:grid-cols-4 items-end">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-1">Cari nama</label>
          <input
            className="w-full border p-2 rounded"
            placeholder="Cari nama"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Gender</label>
          <select
            className="w-full border p-2 rounded"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">Semua</option>
            <option value="male">Laki-laki</option>
            <option value="female">Perempuan</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Status</label>
          <select
            className="w-full border p-2 rounded"
            value={isAlive}
            onChange={(e) => setIsAlive(e.target.value)}
          >
            <option value="all">Semua</option>
            <option value="true">Hidup</option>
            <option value="false">Wafat</option>
          </select>
        </div>
        <div className="md:col-span-4">
          <button
            className="px-4 py-2 bg-gray-800 text-white rounded"
            onClick={load}
          >
            Terapkan filter
          </button>
        </div>
      </section>

      <form onSubmit={addMember} className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 border p-4 rounded">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-1">Nama lengkap</label>
          <input
            className="w-full border p-2 rounded"
            placeholder="Nama lengkap"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Gender</label>
          <select
            className="w-full border p-2 rounded"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">Pilih</option>
            <option value="male">Laki-laki</option>
            <option value="female">Perempuan</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Alamat</label>
          <input className="w-full border p-2 rounded" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Pekerjaan</label>
          <input className="w-full border p-2 rounded" value={occupation} onChange={(e) => setOccupation(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Telepon</label>
          <input className="w-full border p-2 rounded" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Email</label>
          <input className="w-full border p-2 rounded" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="md:col-span-3 flex justify-end">
          <button className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>
            {loading ? 'Menambah...' : 'Tambah anggota'}
          </button>
        </div>
      </form>

      <ul className="divide-y border rounded">
        {members.map((m) => (
          <li key={m.id} className="p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{m.fullName}</span>
              <span className="text-sm text-gray-500">{m.isAlive ? 'Hidup' : 'Wafat'}</span>
            </div>
            <div className="text-sm text-gray-600 flex flex-wrap gap-4">
              {m.gender && <span>Gender: {m.gender}</span>}
              {m.address && <span>Alamat: {m.address}</span>}
              {m.occupation && <span>Pekerjaan: {m.occupation}</span>}
              {m.phone && <span>Tel: {m.phone}</span>}
              {m.email && <span>Email: {m.email}</span>}
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
