import { ReactNode } from 'react'

import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'

import { cleanup, render, screen, fireEvent } from '@acx-ui/test-utils'

import NoData from '.'

describe('SearchResults - NoData', () => {

  const LocationDisplay = () => {
    const location = useLocation()
    return <div data-testid='location-display'>{location.pathname}</div>
  }

  const Wrapper = ({ children }: { children?: ReactNode }) => {
    return <MemoryRouter initialEntries={['/t/accb1231/dragons']}>
      <Routes>
        <Route
          path='*'
          element={children}
        />
      </Routes>
    </MemoryRouter>

  }

  afterEach(() => cleanup())

  it('should render point header', async () => {
    render(<NoData />, { wrapper: Wrapper, route: false })

    expect(await screen.findByText(
      /Check for typos or use a different search term/i
    )).toBeInTheDocument()
  })

  it ('should route correctly for Venues', async () => {
    render(<><NoData /><LocationDisplay /></>, { wrapper: Wrapper, route: false })

    const venuesLink = await screen.findByText('Venues')
    fireEvent.click(venuesLink)
    expect(screen.getByTestId('location-display')).toHaveTextContent('/venues')
  })

  it ('should route correctly for Dashboard', async () => {
    render(<><NoData /><LocationDisplay /></>, { wrapper: Wrapper, route: false })

    const venuesLink = await screen.findByText('Dashboard')
    fireEvent.click(venuesLink)
    expect(screen.getByTestId('location-display')).toHaveTextContent('/dashboard')
  })

  it ('should route correctly for Networks', async () => {
    render(<><NoData /><LocationDisplay /></>, { wrapper: Wrapper, route: false })

    const venuesLink = await screen.findByText('Networks')
    fireEvent.click(venuesLink)
    expect(screen.getByTestId('location-display')).toHaveTextContent('/networks')
  })
})