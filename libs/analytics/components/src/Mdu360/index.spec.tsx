import React from 'react'

import { render } from '@testing-library/react'

import { NetworkOverviewTab, ResidentExperienceTab } from '.'

const mockUseLocationValue = {
  pathname: '/t1/v/mdu360',
  search: '',
  hash: '',
  state: null
}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: jest.fn().mockImplementation(() => mockUseLocationValue)
}))

describe('Lazy-Loaded Mdu360 Components', () => {
  it('should render ResidentExperienceTab correctly', () => {
    const { container } = render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <ResidentExperienceTab startDate='2025-01-01' endDate='2025-01-31' />
      </React.Suspense>
    )
    expect(container).toBeInTheDocument()
  })

  it('should render NetworkOverviewTab correctly', () => {
    const { container } = render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <NetworkOverviewTab startDate='2025-01-01' endDate='2025-01-31' />
      </React.Suspense>
    )
    expect(container).toBeInTheDocument()
  })
})