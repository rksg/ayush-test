import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import * as featureToggle                    from '@acx-ui/feature-toggle'
import { AccessControlUrls, CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                          from '@acx-ui/store'
import { mockServer, render, screen }        from '@acx-ui/test-utils'
import * as userModule                       from '@acx-ui/user'


import AccessControl from './index'

const mockedUseNavigate = jest.fn()
const mockedTenantPath = { pathname: '/tenant-id/t', search: '', hash: '' }

const mockTableResult = {
  totalCount: 0,
  data: []
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: () => mockedTenantPath,
  useParams: () => ({ activeTab: 'wifi' })
}))

describe('AccessControl', () => {
  const params = { tenantId: 'tenant-id' }
  beforeEach(() => {
    jest.spyOn(userModule, 'hasCrossVenuesPermission').mockReturnValue(true)
    jest.spyOn(userModule, 'filterByAccess').mockImplementation((children) => children)
    mockServer.use(
      rest.post(
        AccessControlUrls.getEnhancedAccessControlProfiles.url,
        (req, res, ctx) => res(ctx.json(mockTableResult))
      ),
      rest.post(
        AccessControlUrls.getAccessControlProfileQueryList.url,
        (_, res, ctx) => res(ctx.json(mockTableResult))
      ),
      rest.post(CommonUrlsInfo.getWifiNetworksList.url,
        (req, res, ctx) => res(ctx.json(mockTableResult))),
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => res(ctx.json(mockTableResult)))
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render with feature toggle enabled', async () => {
    jest.spyOn(featureToggle, 'useIsSplitOn').mockReturnValue(true)

    render(
      <Provider>
        <AccessControl />
      </Provider>, {
        route: { params, path: '/:tenantId/t/policies/select' }
      })

    expect(screen.getByText('Access Control')).toBeInTheDocument()
    expect(screen.getByText('Wi-Fi')).toBeInTheDocument()
    expect(screen.getByText('Switch')).toBeInTheDocument()
    expect(screen.getByText('Add Access Control Set')).toBeInTheDocument()
  })

  it('should render without switch tab when feature toggle is disabled', async () => {
    jest.spyOn(featureToggle, 'useIsSplitOn').mockReturnValue(false)

    render(
      <Provider>
        <AccessControl />
      </Provider>, {
        route: { params, path: '/:tenantId/t/policies/select' }
      })

    expect(screen.getByText('Access Control')).toBeInTheDocument()
    expect(screen.getByText('Add Access Control Set')).toBeInTheDocument()
    expect(screen.queryByText('Switch')).not.toBeInTheDocument()
  })

  it('should navigate when tab is changed', async () => {
    jest.spyOn(featureToggle, 'useIsSplitOn').mockReturnValue(true)

    render(
      <Provider>
        <AccessControl />
      </Provider>, {
        route: { params, path: '/:tenantId/t/policies/select' }
      })

    await userEvent.click(screen.getByText('Switch'))

    expect(mockedUseNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: expect.stringContaining('/switch')
      }),
      { replace: true }
    )
  })

  it('should render correct add button for wifi tab', async () => {
    jest.spyOn(featureToggle, 'useIsSplitOn').mockReturnValue(true)

    render(
      <Provider>
        <AccessControl />
      </Provider>, {
        route: { params, path: '/:tenantId/t/policies/select' }
      })

    const addButton = screen.getByText('Add Access Control Set')
    expect(addButton).toBeInTheDocument()
  })
})