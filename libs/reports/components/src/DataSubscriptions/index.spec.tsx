import React from 'react'

import { render } from '@testing-library/react'

import {
  DataSubscriptionsAuditLog,
  DataSubscriptionsContent,
  DataSubscriptionsForm,
  DataSubscriptionsCloudStorage
} from '.'

const bannerTestId = 'banner-test'
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  Banner: () => <div data-testid={bannerTestId} />
}))

jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

const mockUseLocationValue = {
  pathname: '/services/list',
  search: '',
  hash: '',
  state: null
}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: jest.fn().mockImplementation(() => mockUseLocationValue)
}))

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useRaiR1HelpPageLink: () => ''
}))

describe('Lazy-Loaded DataSubscriptions Components', () => {
  it('should render DataSubscriptionsAuditLog correctly', () => {
    const { container } = render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <DataSubscriptionsAuditLog />
      </React.Suspense>
    )
    expect(container).toBeInTheDocument()
  })

  it('should render DataSubscriptionsContent correctly', () => {
    const { container } = render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <DataSubscriptionsContent />
      </React.Suspense>
    )
    expect(container).toBeInTheDocument()
  })

  it('should render DataSubscriptionsForm correctly', () => {
    const { container } = render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <DataSubscriptionsForm />
      </React.Suspense>
    )
    expect(container).toBeInTheDocument()
  })
  it('should render DataSubscriptionsCloudStorage correctly', () => {
    const { container } = render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <DataSubscriptionsCloudStorage />
      </React.Suspense>
    )
    expect(container).toBeInTheDocument()
  })

})