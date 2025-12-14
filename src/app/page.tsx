'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'

interface DashboardStats {
  totalMembers: number
  livingMembers: number
  generations: number
  membersThisMonth: number
}

interface Birthday {
  id: string
  fullName: string
  birthDate: string
  nextBirthday: string
  daysUntil: number
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [birthdays, setBirthdays] = useState<Birthday[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [statsRes, birthdaysRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/birthdays'),
        ])

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }

        if (birthdaysRes.ok) {
          const birthdaysData = await birthdaysRes.json()
          setBirthdays(birthdaysData.birthdays || [])
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  function formatDaysUntil(days: number) {
    if (days === 0) return 'Hari ini!'
    if (days === 1) return 'Besok'
    return `${days} hari lagi`
  }

  function formatBirthDate(dateStr: string) {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🏠 Dashboard Keluarga</h1>
          <p className="text-gray-600 mt-2">Selamat datang di aplikasi silsilah keluarga AtoZ</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Memuat data...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-semibold text-gray-600 mb-1">Total Anggota</div>
                <div className="text-3xl font-bold text-blue-600">
                  {stats?.totalMembers || 0}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-semibold text-gray-600 mb-1">Generasi</div>
                <div className="text-3xl font-bold text-green-600">
                  {stats?.generations || 0}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-semibold text-gray-600 mb-1">Anggota Hidup</div>
                <div className="text-3xl font-bold text-purple-600">
                  {stats?.livingMembers || 0}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-semibold text-gray-600 mb-1">Ditambahkan Bulan Ini</div>
                <div className="text-3xl font-bold text-orange-600">
                  {stats?.membersThisMonth || 0}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Upcoming Birthdays */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">🎂 Ulang Tahun Terdekat</h2>
                </div>
                <div className="p-6">
                  {birthdays.length > 0 ? (
                    <div className="space-y-3">
                      {birthdays.slice(0, 5).map((birthday) => (
                        <Link
                          key={birthday.id}
                          href={`/members/${birthday.id}`}
                          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded border"
                        >
                          <div>
                            <div className="font-semibold text-gray-900">
                              {birthday.fullName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatBirthDate(birthday.nextBirthday)}
                            </div>
                          </div>
                          <div className="text-sm font-semibold text-blue-600">
                            {formatDaysUntil(birthday.daysUntil)}
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      Tidak ada ulang tahun dalam 30 hari ke depan
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">🚀 Aksi Cepat</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-3">
                    <Link
                      href="/members"
                      className="flex items-center justify-between p-4 border rounded hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">👥</div>
                        <div>
                          <div className="font-semibold text-gray-900">Daftar Anggota</div>
                          <div className="text-sm text-gray-600">Lihat semua anggota keluarga</div>
                        </div>
                      </div>
                      <div className="text-gray-400">→</div>
                    </Link>

                    <Link
                      href="/members"
                      className="flex items-center justify-between p-4 border rounded hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">➕</div>
                        <div>
                          <div className="font-semibold text-gray-900">Tambah Anggota</div>
                          <div className="text-sm text-gray-600">Tambahkan anggota keluarga baru</div>
                        </div>
                      </div>
                      <div className="text-gray-400">→</div>
                    </Link>

                    <div className="flex items-center justify-between p-4 border rounded bg-gray-50 opacity-50">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">🌳</div>
                        <div>
                          <div className="font-semibold text-gray-900">Pohon Keluarga</div>
                          <div className="text-sm text-gray-600">Visualisasi pohon keluarga (Coming Soon)</div>
                        </div>
                      </div>
                      <div className="text-gray-400">→</div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded bg-gray-50 opacity-50">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">📊</div>
                        <div>
                          <div className="font-semibold text-gray-900">Laporan</div>
                          <div className="text-sm text-gray-600">Export data keluarga (Coming Soon)</div>
                        </div>
                      </div>
                      <div className="text-gray-400">→</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Klik pada anggota untuk melihat detail dan relasi keluarga</li>
                <li>• Gunakan fitur pencarian untuk menemukan anggota dengan cepat</li>
                <li>• Pastikan mengisi tanggal lahir untuk melihat reminder ulang tahun</li>
              </ul>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
