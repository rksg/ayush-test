import React from 'react'

import { render } from '@testing-library/react'

import {
  DataConnectorAuditLog,
  DataConnectorContent,
  ConnectorForm,
  CloudStorageForm
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

describe('Lazy-Loaded DataConnector Components', () => {
  it('should render DataConnectorAuditLog correctly', () => {
    const { container } = render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <DataConnectorAuditLog />
      </React.Suspense>
    )
    expect(container).toBeInTheDocument()
  })

  it('should render DataConnectorContent correctly', () => {
    const { container } = render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <DataConnectorContent />
      </React.Suspense>
    )
    expect(container).toBeInTheDocument()
  })

  it('should render DataConnectorForm correctly', () => {
    const { container } = render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <ConnectorForm />
      </React.Suspense>
    )
    expect(container).toBeInTheDocument()
  })
  it('should render DataConnectorCloudStorage correctly', () => {
    const { container } = render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <CloudStorageForm />
      </React.Suspense>
    )
    expect(container).toBeInTheDocument()
  })

})