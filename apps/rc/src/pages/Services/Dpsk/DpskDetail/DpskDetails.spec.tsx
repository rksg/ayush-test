import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { serviceApi } from '@acx-ui/rc/services'
import {
  DpskUrls,
  ServiceType,
  DpskDetailsTabKey,
  getServiceDetailsLink,
  getServiceRoutePath,
  ServiceOperation
} from '@acx-ui/rc/utils'
import { To, useTenantLink }  from '@acx-ui/react-router-dom'
import { Provider, store }    from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen,
  within,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import {
  mockedDpsk,
  mockedDpskPassphraseList,
  mockedTenantId,
  mockedServiceId
} from './__tests__/fixtures'
import DpskDetails from './DpskDetails'

const mockedUseNavigate = jest.fn()

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (to: To) => to
}))

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  DpskOverview: () => <div>DPSK Overview</div>
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
    store.dispatch(serviceApi.util.resetApiState())
    mockServer.use(
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

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const table = await screen.findByRole('table')
    expect(await within(table).findByRole('row', { name: /DPSK_USER_1/ })).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('tab', { name: 'Passphrases (4 Active)' })).toBeInTheDocument()
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

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const table = await screen.findByRole('table')
    expect(await within(table).findByRole('row', { name: /DPSK_USER_1/ })).toBeVisible()

    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', { name: 'My Services' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'DPSK' })).toBeVisible()
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

    await userEvent.click(await screen.findByRole('tab', { name: 'Passphrases (4 Active)' }))
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
})
