import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                                                                           from '@acx-ui/feature-toggle'
import { ipSecApi }                                                                                         from '@acx-ui/rc/services'
import { PolicyOperation, PolicyType, IpsecUrls, getPolicyDetailsLink, getPolicyRoutePath, CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Path }                                                                                             from '@acx-ui/react-router-dom'
import { Provider, store }                                                                                  from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within }                                                      from '@acx-ui/test-utils'

import { mockedVenueQueryData, mockIpSecTable } from '../__tests__/fixtures'

import IpsecTable from '.'

const mockedUsedNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: '/ecc2d7cf9d2342fdb31ae0e24958fcac/t',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))

const tablePath = '/:tenantId/t/' + getPolicyRoutePath({
  type: PolicyType.IPSEC,
  oper: PolicyOperation.LIST
})
const policyId = '380043b71ed7411d8e95a41af65d0f50'
const params = {
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
}

describe('IpsecTable', () => {
  jest.mocked(useIsSplitOn)
    .mockImplementation(ff => ff === Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE)

  const mockedSingleDeleteApi = jest.fn()

  beforeEach(async () => {
    store.dispatch(ipSecApi.util.resetApiState())
    mockedSingleDeleteApi.mockClear()

    mockServer.use(
      rest.post(
        IpsecUrls.getIpsecViewDataList.url,
        (_, res, ctx) => res(ctx.json(mockIpSecTable))
      ),
      rest.delete(
        IpsecUrls.deleteIpsec.url,
        (_, res, ctx) => {
          mockedSingleDeleteApi()
          return res(ctx.status(202))
        }
      ),
      rest.post(
        CommonUrlsInfo.getVenues.url,
        (_, res, ctx) => res(ctx.json(mockedVenueQueryData))
      )
    )
  })

  it('should render Breadcrumb and IpsecTable correctly', async () => {
    render(
      <Provider>
        <IpsecTable />
      </Provider>,
      { route: { params, path: tablePath } }
    )
    expect(screen.getByText('IPsec (0)')).toBeInTheDocument()
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(await screen.findByRole('link', { name: 'Policies & Profiles' })).toBeVisible()
    expect(await screen.findByText('IPsec (4)')).toBeInTheDocument()
    const rows = await screen.findAllByRole('row', { name: /ipsecProfileName/i })
    expect(rows).toHaveLength(4)
  })

  it('should navigate to IpSecDetail Page correctly', async () => {
    render(
      <Provider>
        <IpsecTable />
      </Provider>,
      { route: { params, path: tablePath } }
    )

    const ipsecProfileLink = await screen.findByRole('link',
      { name: 'ipsecProfileName4' }) as HTMLAnchorElement
    expect(ipsecProfileLink.href).toContain(`/${params.tenantId}/t/${getPolicyDetailsLink({
      type: PolicyType.IPSEC,
      oper: PolicyOperation.DETAIL,
      policyId: policyId
    })}`)
  })

  it('should delete selected row - single', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <IpsecTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findByRole('row', { name: /ipsecProfileName4/i })
    await user.click(within(row).getByRole('checkbox'))

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    await(within(dialog).findByText('Delete "ipsecProfileName4"?'))

    await user.click(within(dialog).getByRole('button', { name: 'Delete Profile' }))
    await waitFor(() => {
      expect(mockedSingleDeleteApi).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(dialog).not.toBeVisible()
    })
  })

  it('should delete selected row - multiple', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <IpsecTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findAllByRole('row', { name: /ipsecProfileName/i })
    await user.click(within(row[1]).getByRole('checkbox'))
    await user.click(within(row[3]).getByRole('checkbox'))
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    await within(dialog).findByText('Delete "2 Profiles"?')

    await user.click(within(dialog).getByRole('button', { name: 'Delete Profiles' }))
    await waitFor(() => {
      expect(mockedSingleDeleteApi).toBeCalledTimes(2)
    })
    await waitFor(() => {
      expect(dialog).not.toBeVisible()
    })
  })

  it('should delete to show error - single', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <IpsecTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findByRole('row', { name: /ipsecProfileName1/i })
    await user.click(within(row).getByRole('checkbox'))

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    // eslint-disable-next-line max-len
    await(within(dialog).findByText('You are unable to delete this record due to its usage in Network with Venue,AP LAN Port with Venue,Venue LAN Port'))
    await user.click(screen.getByRole('button', { name: 'OK' }))
  })
})