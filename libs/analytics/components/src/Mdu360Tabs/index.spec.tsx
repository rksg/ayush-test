import React from 'react'

import { render } from '@testing-library/react'

import { Mdu360Tabs } from '.'

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

describe('Lazy-Loaded Mdu360Tabs Components', () => {
  it('should render Mdu360Tabs correctly', () => {
    const { container } = render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <Mdu360Tabs startDate='2025-01-01' endDate='2025-01-31' />
      </React.Suspense>
    )
    expect(container).toBeInTheDocument()
  })
})