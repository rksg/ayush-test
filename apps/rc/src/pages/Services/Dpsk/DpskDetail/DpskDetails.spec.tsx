import { rest }    from 'msw'
import { useIntl } from 'react-intl'

import { CommonUrlsInfo, DpskUrls, ServiceType } from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen
} from '@acx-ui/test-utils'

import { DpskDetailsTabKey, getServiceDetailsLink, getServiceRoutePath, ServiceOperation } from '../../serviceRouteUtils'

import { mockedNetworks, mockedDpsk } from './__tests__/fixtures'
import { dpskTabNameMapping }         from './contentsMap'
import DpskDetails                    from './DpskDetails'

describe('DpskDetails', () => {
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742',
    serviceId: '4b76b1952c80401b8500b00d68106576',
    activeTab: DpskDetailsTabKey.OVERVIEW
  }
  // eslint-disable-next-line max-len
  const detailPath = '/:tenantId/' + getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.DETAIL })

  mockServer.use(
    rest.post(
      CommonUrlsInfo.getVMNetworksList.url,
      (req, res, ctx) => res(ctx.json(mockedNetworks))
    ),
    rest.get(
      DpskUrls.getDpsk.url,
      (req, res, ctx) => res(ctx.json(mockedDpsk))
    )
  )

  it('should render the detail view', () => {
    const { asFragment } = render(
      <Provider>
        <DpskDetails />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it('should render the Passphrase Management tab', async () => {
    const { result: passphraseMgmtTabName } = renderHook(() => {
      return useIntl().$t(dpskTabNameMapping[DpskDetailsTabKey.PASSPHRASE_MGMT])
    })

    const passphraseTabParams = {
      ...params,
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

    const targetTab = await screen.findByRole('tabpanel', { name: passphraseMgmtTabName.current })
    expect(targetTab).toBeInTheDocument()
  })

  it('should navigate to the edit page', async () => {
    const editLink = `/t/${params.tenantId}/` + getServiceDetailsLink({
      type: ServiceType.DPSK,
      oper: ServiceOperation.EDIT,
      serviceId: params.serviceId
    })

    render(
      <Provider>
        <DpskDetails />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )

    // eslint-disable-next-line max-len
    expect(await screen.findByRole('link', { name: 'Configure' })).toHaveAttribute('href', editLink)
  })
})
