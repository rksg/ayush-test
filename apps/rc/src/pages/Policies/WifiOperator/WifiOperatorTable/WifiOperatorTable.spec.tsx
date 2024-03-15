
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { networkApi, policyApi }                                                                                   from '@acx-ui/rc/services'
import { CommonUrlsInfo, PolicyOperation, PolicyType, WifiOperatorUrls, getPolicyDetailsLink, getPolicyRoutePath } from '@acx-ui/rc/utils'
import { Path }                                                                                                    from '@acx-ui/react-router-dom'
import { Provider, store }                                                                                         from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within }                                                             from '@acx-ui/test-utils'

import WifiOperatorTable from './WifiOperatorTable'

const mockedNetworkResult = {
  totalCount: 3,
  page: 1,
  data: [{
    id: '1',
    name: 'My Network1'
  },{
    id: '2',
    name: 'My Network2'
  },{
    id: '3',
    name: 'My Network3'
  }]
}

const mockTableResult = {
  totalCount: 2,
  data: [{
    id: '70ea860d29d34c218de1b42268b563dc',
    name: 'Wi-Fi Operator 1',
    domainNames: [
      'rks.com',
      '*.rk.com'
    ],
    friendlyNames: [
      {
        name: 'dd',
        language: 'DUT'
      },
      {
        name: 'eng',
        language: 'ENG'
      }
    ],
    friendlyNameCount: 2,
    networkCount: 0
  },
  {
    id: '459634b1f202427ca82599012f02f49b',
    name: 'Wi-Fi Operator 2',
    domainNames: [
      'aad.com'
    ],
    friendlyNames: [
      {
        name: 'chin',
        language: 'CHI'
      },
      {
        name: 'jjj',
        language: 'JPN'
      }
    ],
    friendlyNameCount: 2,
    networkCount: 0
  }]
}

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

describe('WifiOperatorTable', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  // eslint-disable-next-line max-len
  const tablePath = '/:tenantId/t/' + getPolicyRoutePath({ type: PolicyType.WIFI_OPERATOR, oper: PolicyOperation.LIST })

  beforeEach(async () => {
    store.dispatch(policyApi.util.resetApiState())
    store.dispatch(networkApi.util.resetApiState())
    mockServer.use(
      rest.post(
        WifiOperatorUrls.getWifiOperatorList.url,
        (req, res, ctx) => res(ctx.json(mockTableResult))
      ),
      rest.post(
        CommonUrlsInfo.getWifiNetworksList.url,
        (req, res, ctx) => res(ctx.json(mockedNetworkResult))
      )
    )
  })

  it('should render table', async () => {
    render(
      <Provider>
        <WifiOperatorTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const targetName = mockTableResult.data[0].name
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('button', { name: /Add Wi-Fi Operator/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: new RegExp(targetName) })).toBeVisible()
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <WifiOperatorTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
  })

  it('should delete selected row', async () => {
    const deleteFn = jest.fn()

    mockServer.use(
      rest.delete(
        WifiOperatorUrls.deleteWifiOperator.url,
        (req, res, ctx) => {
          deleteFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        }
      )
    )

    render(
      <Provider>
        <WifiOperatorTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const target = mockTableResult.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('radio'))

    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))

    const dialog = await screen.findByRole('dialog')
    expect(await screen.findByText('Delete "' + target.name + '"?')).toBeVisible()

    // eslint-disable-next-line max-len
    await userEvent.click(await screen.findByRole('button', { name: /Delete Policy/i }))

    await waitFor(() => expect(dialog).not.toBeVisible())
    await waitFor(() => {
      expect(deleteFn).toHaveBeenCalled()
    })
  })

  it('should navigate to the Edit view', async () => {
    render(
      <Provider>
        <WifiOperatorTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const target = mockTableResult.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('radio'))

    await userEvent.click(screen.getByRole('button', { name: /Edit/ }))

    const editPath = getPolicyDetailsLink({
      type: PolicyType.WIFI_OPERATOR,
      oper: PolicyOperation.EDIT,
      policyId: target.id
    })

    expect(mockedUseNavigate).toHaveBeenCalledWith({
      ...mockedTenantPath,
      pathname: `${mockedTenantPath.pathname}/${editPath}`
    })
  })
})