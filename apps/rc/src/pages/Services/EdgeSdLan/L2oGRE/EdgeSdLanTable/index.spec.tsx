import userEvent     from '@testing-library/user-event'
import { cloneDeep } from 'lodash'
import { rest }      from 'msw'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { edgeApi, edgeSdLanApi }  from '@acx-ui/rc/services'
import {
  CommonUrlsInfo,
  CountAndNames,
  EdgeCompatibilityFixtures,
  EdgeGeneralFixtures,
  EdgeSdLanFixtures,
  EdgeSdLanUrls,
  EdgeUrlsInfo,
  ServiceOperation,
  ServiceType,
  VenueFixtures,
  getServiceDetailsLink
} from '@acx-ui/rc/utils'
import { Provider, store }                                                        from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'


import { EdgeSdLanTable } from '.'

const { mockEdgeClusterList } = EdgeGeneralFixtures
const { mockVenueList } = VenueFixtures

// prepare mock data
const mockedMvSdLanDataList = cloneDeep(EdgeSdLanFixtures.mockedMvSdLanDataList)
const mockedSdLan1 = mockedMvSdLanDataList[0]
const mockedSdLan2 = mockedMvSdLanDataList[1]
const mockedVenue1 = mockVenueList.data[0]
const mockedVenue2 = mockVenueList.data[1]
const mockedVenue3 = mockVenueList.data[2]

// sdlan 1 : venue1, venu2
mockedSdLan1.tunneledWlans?.forEach((wlan, idx) => {
  if (idx === 0)
    wlan.venueId = mockedVenue1.id
  if (idx === 1) {
    wlan.venueId = mockedVenue2.id
    mockedSdLan1.tunneledGuestWlans![0].venueId = mockedVenue2.id
  }
})

// sdlan 2 : venue3
mockedSdLan2.tunneledWlans?.forEach((wlan, idx) => {
  wlan.venueId = mockedVenue3.id
  if (idx === 0) {
    mockedSdLan2.tunneledGuestWlans![0].venueId = mockedVenue3.id
  }
})

const { mockEdgeSdLanCompatibilities, mockEdgeSdLanApCompatibilites } = EdgeCompatibilityFixtures
const mockedUsedNavigate = jest.fn()
const mockedGetClusterList = jest.fn()
const mockedDeleteReq = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/rc/components', () => {
  const rcComponents = jest.requireActual('@acx-ui/rc/components')
  return {
    EdgeTableCompatibilityWarningTooltip: rcComponents.EdgeTableCompatibilityWarningTooltip,
    EdgeServiceStatusLight: rcComponents.EdgeServiceStatusLight,
    useEdgeSdLansCompatibilityData: rcComponents.useEdgeSdLansCompatibilityData,
    CountAndNamesTooltip: ({ data }:{ data:CountAndNames }) => <>
      <div data-testid='venue-count'>count:{data.count}</div>
      <div data-testid='venue-names'>names:{data.names.join(',')}</div>
    </>
  }
})

const { click } = userEvent

describe('Multi-venue SD-LAN Table', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    store.dispatch(edgeApi.util.resetApiState())
    store.dispatch(edgeSdLanApi.util.resetApiState())

    mockedUsedNavigate.mockReset()
    mockedGetClusterList.mockReset()
    mockedDeleteReq.mockReset()

    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: mockedMvSdLanDataList }))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(mockVenueList))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_req, res, ctx) => {
          mockedGetClusterList()
          return res(ctx.json(mockEdgeClusterList))
        }
      ),
      rest.delete(
        EdgeSdLanUrls.deleteEdgeSdLan.url,
        (_, res, ctx) => {
          mockedDeleteReq()
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should create table successfully', async () => {
    render(
      <Provider>
        <EdgeSdLanTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeMvSdLan/list' }
      }
    )

    const rows = await basicCheck()
    await waitFor(() => expect(mockedGetClusterList).toBeCalled())
    expect(rows.length).toBe(2)
    // eslint-disable-next-line max-len
    expect(rows[0]).toHaveTextContent(new RegExp(`${mockedSdLan1.name}\\s*Poor\\s*Mocked_tunnel-1\\s*${mockedSdLan1.edgeClusterName}\\s*count:2.*`))
    // eslint-disable-next-line max-len
    expect(rows[1]).toHaveTextContent(new RegExp(`${mockedSdLan2.name}\\s*Good\\s*Mocked_tunnel-2\\s*${mockedSdLan2.edgeClusterName}\\s*count:1.*`))
    const fwWarningIcon = screen.queryAllByTestId('WarningTriangleSolid')
    expect(fwWarningIcon.length).toBe(0)
  })

  it('should display venue names when hover', async () => {
    render(
      <Provider>
        <EdgeSdLanTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeMvSdLan/list' }
      }
    )

    await basicCheck()
    const row1 = screen.getByRole('row', { name: new RegExp(`${mockedSdLan1.name}`) })
    const venueNumStr = await within(row1).findByTestId('venue-count')
    expect(venueNumStr.textContent).toBe('count:2')
    const row1Names = within(row1).getByTestId('venue-names')
    // eslint-disable-next-line max-len
    await waitFor(() => expect(row1Names).toHaveTextContent(`${mockedVenue1.name},${mockedVenue2.name}`))

    const row2 = screen.getByRole('row', { name: new RegExp(`${mockedSdLan2.name}`) })
    const row2VenueNumStr = await within(row2).findByTestId('venue-count')
    expect(row2VenueNumStr.textContent).toBe('count:1')
    const row2Names = within(row2).getByTestId('venue-names')
    expect(row2Names).toHaveTextContent(mockedVenue3.name)
  })

  it('should go edit page', async () => {
    render(
      <Provider>
        <EdgeSdLanTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeMvSdLan/list' }
      }
    )

    await basicCheck()
    const row = screen.getByRole('row', { name: new RegExp(`${mockedSdLan1.name}`) })
    await click(within(row).getByRole('checkbox'))
    await click(screen.getByRole('button', { name: 'Edit' }))

    const editPath = getServiceDetailsLink({
      type: ServiceType.EDGE_SD_LAN,
      oper: ServiceOperation.EDIT,
      serviceId: mockedSdLan1.id!
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
        <EdgeSdLanTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeMvSdLan/list' }
      }
    )

    await basicCheck()
    const row = screen.getByRole('row', { name: new RegExp(`${mockedSdLan2.name}`) })
    await click(within(row).getByRole('checkbox'))
    await click(screen.getByRole('button', { name: 'Delete' }))
    const dialogTitle = await screen.findByText(`Delete "${mockedSdLan2.name}"?`)
    await click(screen.getByRole('button', { name: 'Delete SD-LAN' }))
    await waitForElementToBeRemoved(dialogTitle)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(mockedDeleteReq).toBeCalledTimes(1)
  })

  it('should delete multiple selected rows', async () => {
    render(
      <Provider>
        <EdgeSdLanTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeMvSdLan/list' }
      }
    )

    const rows = await basicCheck()
    // eslint-disable-next-line max-len
    expect(within(rows[0]).getByRole('cell', { name: new RegExp(`${mockedSdLan1.name}`) })).toBeVisible()
    await click(within(rows[0]).getByRole('checkbox'))
    // eslint-disable-next-line max-len
    expect(within(rows[1]).getByRole('cell', { name: new RegExp(`${mockedSdLan2.name}`) })).toBeVisible()
    await click(within(rows[1]).getByRole('checkbox'))
    await click(screen.getByRole('button', { name: 'Delete' }))
    const dialogTitle = await screen.findByText('Delete "2 SD-LAN"?')
    await click(screen.getByRole('button', { name: 'Delete SD-LAN' }))
    await waitForElementToBeRemoved(dialogTitle)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(mockedDeleteReq).toBeCalledTimes(2)
  })

  it('should display 0 when tunneledWlans is not found', async () => {
    const cfList = cloneDeep(mockedMvSdLanDataList)
    cfList[0].tunneledWlans = undefined

    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: cfList }))
      ))

    render(
      <Provider>
        <EdgeSdLanTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeMvSdLan/list' }
      }
    )

    await basicCheck()
    const row = screen.getByRole('row', { name: new RegExp(`${mockedSdLan1.name}`) })
    // eslint-disable-next-line max-len
    expect(row).toHaveTextContent(new RegExp(`${mockedSdLan1.name}\\s*Poor\\s*Mocked_tunnel-1\\s*${mockedSdLan1.edgeClusterName}\\s*0`))
  })
  it('should display service health Good if alarm summary is undefined', async () => {
    const cfListNoAlarm = cloneDeep(mockedMvSdLanDataList)
    delete cfListNoAlarm[0].edgeAlarmSummary
    cfListNoAlarm[0].name = 'sdLan_good_health'
    const mockedSdLanDataListReq = jest.fn()

    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => {
          mockedSdLanDataListReq()
          return res(ctx.json({ data: cfListNoAlarm }))
        }
      ))

    render(
      <Provider>
        <EdgeSdLanTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeMvSdLan/list' }
      }
    )

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    // eslint-disable-next-line max-len
    screen.getByRole('row', { name: /sdLan_good_health Good Mocked_tunnel-1 SE_Cluster 0 count:2 .*/ })
  })

  it('should have compatible warning', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)
    const mockedData = cloneDeep(mockedMvSdLanDataList.slice(0, 1))
    mockedData[0].id = mockEdgeSdLanCompatibilities!.compatibilities![0].serviceId
    mockedData[0].name = 'compatible test'

    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: mockedData }))),
      rest.post(
        EdgeUrlsInfo.getSdLanEdgeCompatibilities.url,
        (_, res, ctx) => res(ctx.json(mockEdgeSdLanCompatibilities))),
      rest.post(
        EdgeUrlsInfo.getSdLanApCompatibilities.url,
        (_, res, ctx) => res(ctx.json(mockEdgeSdLanApCompatibilites)))
    )

    render(
      <Provider>
        <EdgeSdLanTable />
      </Provider>, {
        route: { params, path: '/:tenantId/services/edgeMvSdLan/list' }
      }
    )
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    screen.getByRole('columnheader', { name: 'Destination RUCKUS Edge cluster' })
    const row1 = await screen.findByRole('row', { name: new RegExp('compatible test') })
    const fwWarningIcon = await within(row1).findByTestId('WarningTriangleSolid')
    await userEvent.hover(fwWarningIcon)
    expect(await screen.findByRole('tooltip', { hidden: true }))
      .toHaveTextContent('RUCKUS Edges and access points')
  })
})

const basicCheck= async () => {
  const rows = await screen.findAllByRole('row', { name: /Mocked_SDLAN_/i })
  // eslint-disable-next-line max-len
  expect(within(rows[0]).getByRole('cell', { name: new RegExp(`${mockedSdLan1.name}`) })).toBeVisible()
  return rows
}