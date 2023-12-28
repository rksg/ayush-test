import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  CommonUrlsInfo,
  DpskUrls,
  ServiceType,
  DpskDetailsTabKey,
  getServiceDetailsLink,
  getServiceRoutePath,
  ServiceOperation
} from '@acx-ui/rc/utils'
import { To, useTenantLink } from '@acx-ui/react-router-dom'
import { Provider }          from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen
} from '@acx-ui/test-utils'

import {
  mockedNetworks,
  mockedDpsk,
  mockedDpskPassphraseList,
  mockedTenantId,
  mockedServiceId,
  mockedCloudpathDpsk
} from './__tests__/fixtures'
import DpskDetails from './DpskDetails'

const mockedUseNavigate = jest.fn()

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (to: To) => to
}))

describe('DpskDetails', () => {
  const paramsForOverviewTab = {
    tenantId: mockedTenantId,
    serviceId: mockedServiceId,
    activeTab: DpskDetailsTabKey.OVERVIEW
  }
  // eslint-disable-next-line max-len
  const detailPath = '/:tenantId/t/' + getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.DETAIL })

  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (req, res, ctx) => res(ctx.json({ ...mockedNetworks }))
      ),
      rest.get(
        DpskUrls.getDpsk.url,
        (req, res, ctx) => res(ctx.json({ ...mockedDpsk }))
      ),
      rest.post(
        DpskUrls.getEnhancedPassphraseList.url,
        (req, res, ctx) => res(ctx.json({ ...mockedDpskPassphraseList }))
      )
    )
  })

  it('should render the Passphrase Management tab', async () => {
    const passphraseTabParams = {
      ...paramsForOverviewTab,
      activeTab: DpskDetailsTabKey.PASSPHRASE_MGMT
    }

    render(
      <Provider>
        <DpskDetails />
      </Provider>, {
        route: {
          params: passphraseTabParams,
          path: detailPath
        }
      }
    )

    // eslint-disable-next-line max-len
    expect(await screen.findByRole('tabpanel', { name: 'Passphrases (1 Active)' })).toBeInTheDocument()
  })

  it('should render breadcrumb correctly', async () => {
    const passphraseTabParams = {
      ...paramsForOverviewTab,
      activeTab: DpskDetailsTabKey.PASSPHRASE_MGMT
    }

    render(
      <Provider>
        <DpskDetails />
      </Provider>, {
        route: {
          params: passphraseTabParams,
          path: detailPath
        }
      }
    )

    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'DPSK'
    })).toBeVisible()
  })

  it('should navigate to the Passphrase Management tab', async () => {
    const { result: passphraseTabPath } = renderHook(() => {
      return useTenantLink(getServiceDetailsLink({
        type: ServiceType.DPSK,
        oper: ServiceOperation.DETAIL,
        serviceId: mockedServiceId,
        activeTab: DpskDetailsTabKey.PASSPHRASE_MGMT
      }))
    })

    render(
      <Provider>
        <DpskDetails />
      </Provider>, {
        route: { params: paramsForOverviewTab, path: detailPath }
      }
    )

    await userEvent.click(await screen.findByRole('tab', { name: 'Passphrases (1 Active)' }))
    expect(mockedUseNavigate).toHaveBeenCalledWith(passphraseTabPath.current)
  })

  it('should navigate to the edit page', async () => {
    const editLink = `/${paramsForOverviewTab.tenantId}/t/` + getServiceDetailsLink({
      type: ServiceType.DPSK,
      oper: ServiceOperation.EDIT,
      serviceId: paramsForOverviewTab.serviceId
    })

    render(
      <Provider>
        <DpskDetails />
      </Provider>, {
        route: { params: paramsForOverviewTab, path: detailPath }
      }
    )

    // eslint-disable-next-line max-len
    expect(await screen.findByRole('link', { name: 'Configure' })).toHaveAttribute('href', editLink)
  })

  it('should render the overview page with cloudpath settings', async () => {
    mockServer.use(
      rest.get(
        DpskUrls.getDpsk.url,
        (req, res, ctx) => res(ctx.json({ ...mockedCloudpathDpsk }))
      )
    )

    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    render(
      <Provider>
        <DpskDetails />
      </Provider>, {
        route: {
          params: paramsForOverviewTab,
          path: detailPath
        }
      }
    )

    expect(await screen.findByText('ACCEPT')).toBeVisible()
  })
})
