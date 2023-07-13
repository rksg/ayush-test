import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  CommonUrlsInfo,
  getServiceDetailsLink,
  getServiceRoutePath,
  PortalUrlsInfo,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { Path }     from '@acx-ui/react-router-dom'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { mockedPortalList, networksResponse } from './__tests__/fixtures'

import PortalTable from '.'

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))

describe('PortalTable', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  // eslint-disable-next-line max-len
  const tablePath = '/:tenantId/t' + getServiceRoutePath({ type: ServiceType.PORTAL, oper: ServiceOperation.LIST })

  beforeEach(async () => {
    mockServer.use(
      rest.post(
        PortalUrlsInfo.getEnhancedPortalProfileList.url,
        (req, res, ctx) => res(ctx.json({ ...mockedPortalList }))
      ),
      rest.post(CommonUrlsInfo.getVMNetworksList.url, (_, res, ctx) =>
        res(ctx.json(networksResponse))
      ),
      rest.get(PortalUrlsInfo.getPortalLang.url,
        (_, res, ctx) => {
          return res(ctx.json({ acceptTermsLink: 'terms & conditions',
            acceptTermsMsg: 'I accept the' }))
        })
    )
  })

  it('should render the table', async () => {
    render(
      <Provider>
        <PortalTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const targetPortal = mockedPortalList.content[0]
    expect(await screen.findByRole('button', { name: /Add Guest Portal/i })).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('row', { name: new RegExp(targetPortal.serviceName) })).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<Provider><PortalTable /></Provider>, {
      route: { params, path: tablePath }
    })
    expect(screen.queryByText('Network Control')).toBeNull()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<Provider><PortalTable /></Provider>, {
      route: { params, path: tablePath }
    })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
  })

  it('should delete selected row', async () => {
    const deleteFn = jest.fn()

    mockServer.use(
      rest.delete(
        PortalUrlsInfo.deletePortal.url,
        (req, res, ctx) => {
          deleteFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        }
      )
    )

    render(
      <Provider>
        <PortalTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const targetPortal = mockedPortalList.content[0]
    const row = await screen.findByRole('row', { name: new RegExp(targetPortal.serviceName) })
    await userEvent.click(within(row).getByRole('radio'))

    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))

    expect(await screen.findByText('Delete "' + targetPortal.serviceName + '"?')).toBeVisible()
    // eslint-disable-next-line max-len
    const deleteServiceButton = await screen.findByRole('button', { name: /Delete Portal Service/i })
    await userEvent.click(deleteServiceButton)

    await waitFor(() => {
      expect(deleteFn).toHaveBeenCalled()
    })
  })

  it('should navigate to the Edit view', async () => {
    render(
      <Provider>
        <PortalTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const targetPortal = mockedPortalList.content[0]
    const row = await screen.findByRole('row', { name: new RegExp(targetPortal.serviceName) })
    await userEvent.click(within(row).getByRole('radio'))

    await userEvent.click(screen.getByRole('button', { name: /Edit/ }))

    const portalEditPath = getServiceDetailsLink({
      type: ServiceType.PORTAL,
      oper: ServiceOperation.EDIT,
      serviceId: targetPortal.id
    })

    expect(mockedUseNavigate).toHaveBeenCalledWith({
      ...mockedTenantPath,
      pathname: `${mockedTenantPath.pathname}/${portalEditPath}`
    })
  })
})
