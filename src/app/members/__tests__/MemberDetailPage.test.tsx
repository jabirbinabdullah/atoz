import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import MemberDetailPage from '../[id]/page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock window.alert and window.confirm
global.alert = jest.fn()
global.confirm = jest.fn()

describe('MemberDetailPage', () => {
  const mockRouter = {
    push: jest.fn(),
  }

  const mockMember = {
    id: 'mem123',
    fullName: 'John Doe',
    gender: 'male',
    birthDate: '1950-01-15T00:00:00Z',
    deathDate: null,
    birthPlace: 'Jakarta',
    address: 'Jl. Sudirman No. 1',
    occupation: 'Engineer',
    phone: '+62812345678',
    email: 'john@example.com',
    photoUrl: null,
    notes: 'Founder of the family',
    isAlive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-12-14T00:00:00Z',
    parents: [
      {
        id: 'rel1',
        parentRole: 'father',
        parent: {
          id: 'parent1',
          fullName: 'Grandfather',
          gender: 'male',
          birthDate: '1920-01-01T00:00:00Z',
        },
      },
    ],
    children: [
      {
        id: 'rel2',
        child: {
          id: 'child1',
          fullName: 'Son',
          gender: 'male',
          birthDate: '1975-06-15T00:00:00Z',
        },
      },
    ],
    marriagesA: [
      {
        id: 'mar1',
        marriageDate: '1970-12-25T00:00:00Z',
        divorceDate: null,
        notes: 'Happy marriage',
        spouseB: {
          id: 'spouse1',
          fullName: 'Wife',
          gender: 'female',
        },
      },
    ],
    marriagesB: [],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    global.fetch = jest.fn()
  })

  it('shows loading state initially', async () => {
    ;(global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<MemberDetailPage params={{ id: 'mem123' }} />)

    expect(screen.getByText('Memuat...')).toBeInTheDocument()
  })

  it('displays member details after loading', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMember,
    })

    render(<MemberDetailPage params={{ id: 'mem123' }} />)

    await waitFor(() => {
      expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument()
    })

    expect(screen.getByText(/Laki-laki/)).toBeInTheDocument()
    expect(screen.getByText(/Hidup/)).toBeInTheDocument()
    expect(screen.getByText('Jakarta')).toBeInTheDocument()
    expect(screen.getByText('Jl. Sudirman No. 1')).toBeInTheDocument()
    expect(screen.getByText('Engineer')).toBeInTheDocument()
    expect(screen.getByText('+62812345678')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('Founder of the family')).toBeInTheDocument()
  })

  it('displays parent relationships', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMember,
    })

    render(<MemberDetailPage params={{ id: 'mem123' }} />)

    await waitFor(() => {
      expect(screen.getByText('Orang Tua')).toBeInTheDocument()
    })

    expect(screen.getByText('Grandfather')).toBeInTheDocument()
    expect(screen.getByText(/Ayah/)).toBeInTheDocument()
  })

  it('displays children relationships', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMember,
    })

    render(<MemberDetailPage params={{ id: 'mem123' }} />)

    await waitFor(() => {
      expect(screen.getByText('Anak')).toBeInTheDocument()
    })

    expect(screen.getByText('Son')).toBeInTheDocument()
  })

  it('displays marriage relationships', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMember,
    })

    render(<MemberDetailPage params={{ id: 'mem123' }} />)

    await waitFor(() => {
      expect(screen.getByText('Pernikahan')).toBeInTheDocument()
    })

    expect(screen.getByText('Wife')).toBeInTheDocument()
    expect(screen.getByText(/Menikah:/)).toBeInTheDocument()
    expect(screen.getByText('Happy marriage')).toBeInTheDocument()
  })

  it('shows error when member not found', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    })

    render(<MemberDetailPage params={{ id: 'missing' }} />)

    await waitFor(() => {
      expect(screen.getByText('Anggota tidak ditemukan')).toBeInTheDocument()
    })

    expect(screen.getByText(/Kembali ke daftar/)).toBeInTheDocument()
  })

  it('redirects to signin when unauthorized', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
    })

    render(<MemberDetailPage params={{ id: 'mem123' }} />)

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/auth/signin')
    })
  })

  it('enters edit mode when edit button clicked', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMember,
    })

    render(<MemberDetailPage params={{ id: 'mem123' }} />)

    await waitFor(() => {
      expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument()
    })

    const editButton = screen.getByRole('button', { name: /edit/i })
    await userEvent.click(editButton)

    expect(screen.getByText('Edit Anggota')).toBeInTheDocument()
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /simpan/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /batal/i })).toBeInTheDocument()
  })

  it('cancels edit mode when cancel button clicked', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMember,
    })

    render(<MemberDetailPage params={{ id: 'mem123' }} />)

    await waitFor(() => {
      expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument()
    })

    // Enter edit mode
    const editButton = screen.getByRole('button', { name: /edit/i })
    await userEvent.click(editButton)

    expect(screen.getByText('Edit Anggota')).toBeInTheDocument()

    // Cancel edit
    const cancelButton = screen.getByRole('button', { name: /batal/i })
    await userEvent.click(cancelButton)

    expect(screen.queryByText('Edit Anggota')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
  })

  it('saves changes when save button clicked', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockMember,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockMember, fullName: 'John Doe Updated' }),
      })

    render(<MemberDetailPage params={{ id: 'mem123' }} />)

    await waitFor(() => {
      expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument()
    })

    // Enter edit mode
    const editButton = screen.getByRole('button', { name: /edit/i })
    await userEvent.click(editButton)

    // Change name
    const nameInput = screen.getByDisplayValue('John Doe')
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'John Doe Updated')

    // Save
    const saveButton = screen.getByRole('button', { name: /simpan/i })
    await userEvent.click(saveButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/members/mem123',
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        })
      )
    })

    expect(global.alert).toHaveBeenCalledWith('Berhasil diperbarui')
  })

  it('shows error alert when save fails', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockMember,
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Save failed' }),
      })

    render(<MemberDetailPage params={{ id: 'mem123' }} />)

    await waitFor(() => {
      expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument()
    })

    // Enter edit mode and save
    const editButton = screen.getByRole('button', { name: /edit/i })
    await userEvent.click(editButton)

    const saveButton = screen.getByRole('button', { name: /simpan/i })
    await userEvent.click(saveButton)

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Save failed')
    })
  })

  it('confirms before deleting member', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMember,
    })

    ;(global.confirm as jest.Mock).mockReturnValue(false) // User cancels

    render(<MemberDetailPage params={{ id: 'mem123' }} />)

    await waitFor(() => {
      expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument()
    })

    const deleteButton = screen.getByRole('button', { name: /hapus/i })
    await userEvent.click(deleteButton)

    expect(global.confirm).toHaveBeenCalledWith(
      'Yakin ingin menghapus anggota ini? Semua relasi akan terhapus.'
    )
    expect(global.fetch).toHaveBeenCalledTimes(1) // Only initial fetch, no delete
  })

  it('deletes member when confirmed', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockMember,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true }),
      })

    ;(global.confirm as jest.Mock).mockReturnValue(true) // User confirms

    render(<MemberDetailPage params={{ id: 'mem123' }} />)

    await waitFor(() => {
      expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument()
    })

    const deleteButton = screen.getByRole('button', { name: /hapus/i })
    await userEvent.click(deleteButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/members/mem123', {
        method: 'DELETE',
      })
    })

    expect(global.alert).toHaveBeenCalledWith('Berhasil dihapus')
    expect(mockRouter.push).toHaveBeenCalledWith('/members')
  })

  it('shows error alert when delete fails', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockMember,
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Delete failed' }),
      })

    ;(global.confirm as jest.Mock).mockReturnValue(true)

    render(<MemberDetailPage params={{ id: 'mem123' }} />)

    await waitFor(() => {
      expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument()
    })

    const deleteButton = screen.getByRole('button', { name: /hapus/i })
    await userEvent.click(deleteButton)

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Delete failed')
    })

    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  it('renders breadcrumb navigation', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMember,
    })

    render(<MemberDetailPage params={{ id: 'mem123' }} />)

    await waitFor(() => {
      expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument()
    })

    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /anggota/i })).toBeInTheDocument()
  })

  it('renders links to related members', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMember,
    })

    render(<MemberDetailPage params={{ id: 'mem123' }} />)

    await waitFor(() => {
      expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument()
    })

    const parentLink = screen.getByRole('link', { name: /grandfather/i })
    expect(parentLink).toHaveAttribute('href', '/members/parent1')

    const childLink = screen.getByRole('link', { name: /son/i })
    expect(childLink).toHaveAttribute('href', '/members/child1')

    const spouseLink = screen.getByRole('link', { name: /wife/i })
    expect(spouseLink).toHaveAttribute('href', '/members/spouse1')
  })

  it('updates status field when changed in edit mode', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMember,
    })

    render(<MemberDetailPage params={{ id: 'mem123' }} />)

    await waitFor(() => {
      expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument()
    })

    // Enter edit mode
    const editButton = screen.getByRole('button', { name: /edit/i })
    await userEvent.click(editButton)

    // Find status select - it's the select that has option with value="true"
    const selects = screen.getAllByRole('combobox')
    const statusSelect = selects.find((select) => {
      const options = Array.from(select.querySelectorAll('option'))
      return options.some(
        (option) =>
          option.getAttribute('value') === 'true' &&
          option.textContent === 'Hidup'
      )
    })

    expect(statusSelect).toBeDefined()
    if (statusSelect) {
      await userEvent.selectOptions(statusSelect, 'false')
      expect(statusSelect).toHaveValue('false')
    }
  })

  it('handles deceased member display', async () => {
    const deceasedMember = {
      ...mockMember,
      isAlive: false,
      deathDate: '2020-06-15T00:00:00Z',
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => deceasedMember,
    })

    render(<MemberDetailPage params={{ id: 'mem123' }} />)

    await waitFor(() => {
      expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument()
    })

    // Check that deceased status is displayed
    expect(screen.getAllByText(/Wafat/)[0]).toBeInTheDocument()
    expect(screen.getByText(/Tanggal Wafat/)).toBeInTheDocument()
  })
})
