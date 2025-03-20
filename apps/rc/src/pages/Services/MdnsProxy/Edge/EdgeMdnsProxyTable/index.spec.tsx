import userEvent     from '@testing-library/user-event'
import { cloneDeep } from 'lodash'
import { rest }      from 'msw'

import { edgeApi }             from '@acx-ui/rc/services'
import {
  ServiceOperation,
  ServiceType,
  getServiceDetailsLink,
  CommonUrlsInfo,
  CountAndNames,
  EdgeMdnsFixtures,
  EdgeMdnsProxyUrls,
  VenueFixtures,
  EdgeUrlsInfo,
  EdgeCompatibilityFixtures
} from '@acx-ui/rc/utils'
import { Provider, store }                                                        from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { EdgeMdnsProxyTable } from '.'

const { mockEdgeMdnsViewDataList } = EdgeMdnsFixtures
const { mockVenueOptions } = VenueFixtures
const { mockEdgeMdnsCompatibilities } = EdgeCompatibilityFixtures

const mockPath = '/:tenantId/services/edgeMdnsProxy/list'

const mockMdns1 = mockEdgeMdnsViewDataList[0]
const mockMdns2 = mockEdgeMdnsViewDataList[1]

const mockedUsedNavigate = jest.fn()
const mockedDeleteReq = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/rc/components', () => {
  const rcComponents = jest.requireActual('@acx-ui/rc/components')
  return {
    ToolTipTableStyle: rcComponents.ToolTipTableStyle,
    useEdgeMdnssCompatibilityData: rcComponents.useEdgeMdnssCompatibilityData,
    MdnsProxyForwardingRulesTable: rcComponents.MdnsProxyForwardingRulesTable,
    EdgeTableCompatibilityWarningTooltip: rcComponents.EdgeTableCompatibilityWarningTooltip,
    CountAndNamesTooltip: ({ data }:{ data:CountAndNames }) => <>
      <div data-testid='venue-count'>count:{data.count}</div>
      <div data-testid='venue-names'>names:{data.names.join(',')}</div>
    </> }
})

const { click } = userEvent

describe('Edge mDNS Proxy Table', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    store.dispatch(edgeApi.util.resetApiState())

    mockedUsedNavigate.mockReset()
    mockedDeleteReq.mockReset()

    mockServer.use(
      rest.post(
        EdgeMdnsProxyUrls.getEdgeMdnsProxyViewDataList.url,
        (_, res, ctx) => res(ctx.json({
          data: mockEdgeMdnsViewDataList
        }))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(mockVenueOptions))
      ),
      rest.delete(
        EdgeMdnsProxyUrls.deleteEdgeMdnsProxy.url,
        (_, res, ctx) => {
          mockedDeleteReq()
          return res(ctx.status(202))
        }),
      rest.post(
        EdgeUrlsInfo.getMdnsEdgeCompatibilities.url,
        (_, res, ctx) => res(ctx.json(mockEdgeMdnsCompatibilities)))
    )
  })

  it('should create table successfully', async () => {
    render(
      <Provider>
        <EdgeMdnsProxyTable />
      </Provider>, {
        route: { params, path: mockPath }
      }
    )

    const rows = await basicCheck()
    expect(rows.length).toBe(2)
    screen.getByRole('row', { name: /edge-mdns-proxy-name-1/i })
    // eslint-disable-next-line max-len
    expect(rows[0]).toHaveTextContent(new RegExp(`${mockMdns1.name}\\s*3\\s*count:2`))
  })

  it('should display venue names when hover', async () => {
    render(
      <Provider>
        <EdgeMdnsProxyTable />
      </Provider>, {
        route: { params, path: mockPath }
      }
    )

    await basicCheck()
    const row1 = screen.getByRole('row', { name: new RegExp(`${mockMdns1.name}`) })
    const venueNumStr = await within(row1).findByTestId('venue-count')
    expect(venueNumStr.textContent).toBe('count:2')
    const row1Names = within(row1).getByTestId('venue-names')
    // eslint-disable-next-line max-len
    await waitFor(() => expect(row1Names).toHaveTextContent(`${mockVenueOptions.data[0].name},${mockVenueOptions.data[2].name}`))
  })

  it('should display rules vlan when hover', async () => {
    render(
      <Provider>
        <EdgeMdnsProxyTable />
      </Provider>, {
        route: { params, path: mockPath }
      }
    )

    await basicCheck()
    const row1 = screen.getByRole('row', { name: new RegExp(`${mockMdns1.name}`) })
    const rulesNumStr = await within(row1).findByText('3')
    await userEvent.hover(rulesNumStr)
    const tooltip = await screen.findByRole('tooltip', { hidden: true })
    within(tooltip).getByRole('row', { name: 'AirPrint 33 66' })
  })

  it('should go edit page', async () => {
    render(
      <Provider>
        <EdgeMdnsProxyTable />
      </Provider>, {
        route: { params, path: mockPath }
      }
    )

    await basicCheck()
    const row = screen.getByRole('row', { name: new RegExp(`${mockMdns1.name}`) })
    await click(within(row).getByRole('checkbox'))
    await click(screen.getByRole('button', { name: 'Edit' }))

    const editPath = getServiceDetailsLink({
      type: ServiceType.EDGE_MDNS_PROXY,
      oper: ServiceOperation.EDIT,
      serviceId: mockMdns1.id!
    })

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/${editPath}`,
      hash: '',
      search: ''
    })
  })

  it('should delete selected row', async () => {
    render(
      <Provider>
        <EdgeMdnsProxyTable />
      </Provider>, {
        route: { params, path: mockPath }
      }
    )

    await basicCheck()
    const row = screen.getByRole('row', { name: new RegExp(`${mockMdns1.name}`) })
    await click(within(row).getByRole('checkbox'))
    await click(screen.getByRole('button', { name: 'Delete' }))
    const dialogTitle = await screen.findByText(`Delete "${mockMdns1.name}"?`)
    await click(screen.getByRole('button', { name: 'Delete Edge mDNS Proxy' }))
    await waitForElementToBeRemoved(dialogTitle)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(mockedDeleteReq).toBeCalledTimes(1)
  })

  it('should delete multiple selected rows', async () => {
    render(
      <Provider>
        <EdgeMdnsProxyTable />
      </Provider>, {
        route: { params, path: mockPath }
      }
    )

    const rows = await basicCheck()
    // eslint-disable-next-line max-len
    expect(within(rows[0]).getByRole('cell', { name: new RegExp(`${mockMdns1.name}`) })).toBeVisible()
    await click(within(rows[0]).getByRole('checkbox'))
    // eslint-disable-next-line max-len
    expect(within(rows[1]).getByRole('cell', { name: new RegExp(`${mockMdns2.name}`) })).toBeVisible()
    await click(within(rows[1]).getByRole('checkbox'))
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
    await click(screen.getByRole('button', { name: 'Delete' }))
    const dialogTitle = await screen.findByText('Delete "2 Edge mDNS Proxy"?')
    await click(screen.getByRole('button', { name: 'Delete Edge mDNS Proxy' }))
    await waitForElementToBeRemoved(dialogTitle)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(mockedDeleteReq).toBeCalledTimes(2)
  })

  it('should display 0 when rule / venueInfo is not provided', async () => {
    const mockList = cloneDeep(mockEdgeMdnsViewDataList)
    mockList[1].name = 'testZero'
    mockList[1].forwardingRules = undefined
    mockList[1].activations = undefined

    mockServer.use(
      rest.post(
        EdgeMdnsProxyUrls.getEdgeMdnsProxyViewDataList.url,
        (_, res, ctx) => res(ctx.json({
          data: mockList
        }))
      ))

    render(
      <Provider>
        <EdgeMdnsProxyTable />
      </Provider>, {
        route: { params, path: mockPath }
      }
    )

    await basicCheck()
    const row = screen.getByRole('row', { name: new RegExp(`${mockList[1].name}`) })
    // eslint-disable-next-line max-len
    expect(row).toHaveTextContent(new RegExp(`${mockList[1].name}\\s*0\\s*0`))
  })

  it('should have compatible warning', async () => {
    const mockList = cloneDeep(mockEdgeMdnsViewDataList)
    mockList[1].id = mockEdgeMdnsCompatibilities.compatibilities[0].serviceId
    mockList[1].name = 'compatible test'

    mockServer.use(
      rest.post(
        EdgeMdnsProxyUrls.getEdgeMdnsProxyViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: mockList })))
    )

    render(
      <Provider>
        <EdgeMdnsProxyTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeMvSdLan/list' }
      }
    )

    await basicCheck()
    const row1 = await screen.findByRole('row', { name: new RegExp('compatible test') })
    const fwWarningIcon = await within(row1).findByTestId('WarningTriangleSolid')
    await userEvent.hover(fwWarningIcon)
    expect(await screen.findByRole('tooltip', { hidden: true }))
      .toHaveTextContent('RUCKUS Edges')
  })
})

const basicCheck= async () => {
  await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
  screen.getByRole('columnheader', { name: 'Forwarding Rules' })
  const rows = await screen.findAllByRole('row', { name: /edge-mdns-proxy-name-/i })
  // eslint-disable-next-line max-len
  expect(within(rows[0]).getByRole('cell', { name: new RegExp(`${mockMdns1.name}`) })).toBeVisible()
  return rows
}