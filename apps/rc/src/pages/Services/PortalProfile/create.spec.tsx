import userEvent from '@testing-library/user-event'

import { render, screen } from '@acx-ui/test-utils'

import CreatePortalProfile from './create'

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useTenantLink: (to: string) => to,
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/rc/components', () => ({
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(true)
}))

jest.mock('@acx-ui/feature-toggle', () => ({
  useIsSplitOn: jest.fn().mockReturnValue(true),
  useIsTierAllowed: jest.fn(),
  Features: {
    NETWORK_SEGMENTATION_SWITCH: 'NETWORK_SEGMENTATION_SWITCH',
    EDGE_PIN_HA_TOGGLE: 'EDGE_PIN_HA_TOGGLE'
  },
  TierFeatures: {
    SERVICE_CATALOG_UPDATED: 'SERVICE_CATALOG_UPDATED'
  }
}))

describe('PortalProfile', () => {
  const params = {
    tenantId: 'tenantId'
  }

  beforeEach(() => {
    mockedUsedNavigate.mockClear()
  })

  it('renders the component correctly', () => {
    render(<CreatePortalProfile />, { route: { params } })

    expect(screen.getByLabelText('Guest Portal')).toBeInTheDocument()
    expect(screen.getByLabelText(
      'PIN (Personal Identity Network) Portal for Switch')).toBeInTheDocument()
  })

  it('should navigate to create page when Next button is clicked', async () => {
    render(<CreatePortalProfile />, { route: { params } })

    await userEvent.click(screen.getByLabelText(
      'PIN (Personal Identity Network) Portal for Switch'))

    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith('services/webAuth/create', {
      state: { from: undefined }
    })
  })

  it('should navigate to select page when Cancel button is clicked', async () => {
    render(<CreatePortalProfile />, { route: { params } })

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/services/select')
  })
})
