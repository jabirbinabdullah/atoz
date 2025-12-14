import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MembersPage from '../page'

describe('MembersPage', () => {
  const fetchMock = jest.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    // @ts-expect-error - assign test fetch mock
    global.fetch = fetchMock
  })

  it('lists members and adds a new one', async () => {
    fetchMock
      .mockResolvedValueOnce({ json: async () => [{ id: '1', fullName: 'Alice', isAlive: true }] })
      .mockResolvedValueOnce({ json: async () => ({}) })
      .mockResolvedValueOnce({
        json: async () => [
          { id: '1', fullName: 'Alice', isAlive: true },
          { id: '2', fullName: 'Bob', isAlive: true },
        ],
      })

    render(<MembersPage />)

    await screen.findByText('Alice')

    const input = screen.getByPlaceholderText('Nama lengkap')
    await userEvent.type(input, 'Bob')

    await userEvent.click(screen.getByRole('button', { name: /tambah anggota/i }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3))
    await screen.findByText('Bob')
  })
})
