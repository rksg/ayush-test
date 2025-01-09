import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { softGreApi }                                                                                         from '@acx-ui/rc/services'
import { CommonUrlsInfo, PolicyOperation, PolicyType, SoftGreUrls, getPolicyDetailsLink, getPolicyRoutePath } from '@acx-ui/rc/utils'
import { Path }                                                                                               from '@acx-ui/react-router-dom'
import { Provider, store }                                                                                    from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within }                                                        from '@acx-ui/test-utils'

import { mockSoftGreTable, mockedVenueName1, mockedVenueName3, mockedVenueName4, mockedVenueQueryData } from '../__tests__/fixtures'

import SoftGreTable from '.'

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
  type: PolicyType.SOFTGRE,
  oper: PolicyOperation.LIST
})
const policyId = '0d89c0f5596c4689900fb7f5f53a0859'
const params = {
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
}

describe('SoftGreTable', () => {
  const mockedSingleDeleteApi = jest.fn()

  beforeEach(async () => {
    store.dispatch(softGreApi.util.resetApiState())
    mockedSingleDeleteApi.mockClear()

    mockServer.use(
      rest.post(
        SoftGreUrls.getSoftGreViewDataList.url,
        (_, res, ctx) => res(ctx.json(mockSoftGreTable))
      ),
      rest.delete(
        SoftGreUrls.deleteSoftGre.url,
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

  it('should render Breadcrumb and SoftGreTable correctly', async () => {
    render(
      <Provider>
        <SoftGreTable />
      </Provider>,
      { route: { params, path: tablePath } }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(await screen.findByRole('link', { name: 'Policies & Profiles' })).toBeVisible()

    const rows = await screen.findAllByRole('row', { name: /softGreProfileName/i })
    expect(rows).toHaveLength(4)
  })

  it('should navigate to SoftGreDetail Page correctly', async () => {
    render(
      <Provider>
        <SoftGreTable />
      </Provider>,
      { route: { params, path: tablePath } }
    )

    const softGreProfileLink = await screen.findByRole('link',
      { name: 'softGreProfileName1' }) as HTMLAnchorElement
    expect(softGreProfileLink.href).toContain(`/${params.tenantId}/t/${getPolicyDetailsLink({
      type: PolicyType.SOFTGRE,
      oper: PolicyOperation.DETAIL,
      policyId: policyId
    })}`)
  })

  it('should navigate to SoftGre Edit Form Page correctly', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SoftGreTable />
      </Provider>,
      { route: { params, path: tablePath } }
    )

    const row = await screen.findByRole('row', { name: /softGreProfileName1/i })
    await user.click(within(row).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/${getPolicyDetailsLink({
        type: PolicyType.SOFTGRE,
        oper: PolicyOperation.EDIT,
        policyId: policyId
      })}`,
      hash: '',
      search: ''
    })
  })

  it('should delete selected row - multiple', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SoftGreTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findAllByRole('row', { name: /softGreProfileName/i })
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

  it('should delete selected row - single', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SoftGreTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findByRole('row', { name: /softGreProfileName2/i })
    await user.click(within(row).getByRole('checkbox'))

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    await(within(dialog).findByText('Delete "softGreProfileName2"?'))

    await user.click(within(dialog).getByRole('button', { name: 'Delete Profile' }))
    await waitFor(() => {
      expect(mockedSingleDeleteApi).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(dialog).not.toBeVisible()
    })
  })

  it('should delete to show error - single', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SoftGreTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findByRole('row', { name: /softGreProfileName1/i })
    await user.click(within(row).getByRole('checkbox'))

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    // eslint-disable-next-line max-len
    await(within(dialog).findByText('You are unable to delete this record due to its usage in Network with Venue,AP LAN Port with Venue,Venue LAN Port'))
    await user.click(screen.getByRole('button', { name: 'OK' }))
  })

  it('should show tooltip when hover over on venues', async () => {
    render(
      <Provider>
        <SoftGreTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row1 = await screen.findByRole('row', { name: /softGreProfileName1/i })
    await userEvent.hover(within(row1).getByText('3'))
    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toHaveTextContent(mockedVenueName1)
    expect(tooltip).toHaveTextContent(mockedVenueName3)
    expect(tooltip).toHaveTextContent(mockedVenueName4)
    const row2 = await screen.findByRole('row', { name: /softGreProfileName2/i })
    await userEvent.hover(within(row2).getByText('0'))
  })
})