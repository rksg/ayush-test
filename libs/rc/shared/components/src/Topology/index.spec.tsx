import '@testing-library/jest-dom'
import { rest } from 'msw'

import { venueApi }                                                                                                               from '@acx-ui/rc/services'
import { CommonUrlsInfo, ConnectionStates, ConnectionStatus, DeviceStates, DeviceTypes, ShowTopologyFloorplanOn, SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                                                                        from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitForElementToBeRemoved }                                                       from '@acx-ui/test-utils'

import { TopologyGraph } from '.'

jest.mock('@acx-ui/analytics/components', () => ({
  useIncidentsBySeverityQuery: () => ([])
}))

const fields = [
  'deviceType',
  'venueName',
  'serialNumber',
  'switchMac',
  'name',
  'tenantId',
  'apMac',
  'model',
  'syncDataStartTime',
  'customerName',
  'deviceStatus'
]

const graphData = {
  fields,
  totalCount: 1,
  page: null,
  data: [
    {
      edges: [{
        source: 'C0:C5:20:7E:A5:01',
        target: '5C:DF:89:2A:AF:01',
        from: 'C0:C5:20:7E:A5:01',
        to: '5C:DF:89:2A:AF:01',
        connectionType: 'Wired',
        connectionStatus: ConnectionStatus.Good,
        connectionStates: ConnectionStates.Regular
      },
      {
        source: 'D0:D5:40:8E:5E:02',
        target: '5C:DF:89:2A:AF:02',
        from: 'D0:D5:40:8E:5E:02',
        to: '5C:DF:89:2A:AF:02',
        connectionType: 'Wired',
        connectionStatus: ConnectionStatus.Good,
        connectionStates: ConnectionStates.Regular,
        poeEnabled: true,
        linkSpeed: '1 Gb/s',
        poeUsed: 28,
        poeTotal: 29,
        connectedPort: '1/1/1'
      },
      {
        source: 'C0:C5:20:7E:A5:01',
        target: '5C:DF:89:2A:AF:05',
        from: 'C0:C5:20:7E:A5:01',
        to: '5C:DF:89:2A:AF:05',
        connectionType: 'Wired',
        connectionStatus: ConnectionStatus.Degraded,
        connectionStates: ConnectionStates.Regular,
        poeEnabled: true,
        linkSpeed: '1 Gb/s',
        poeUsed: 28,
        poeTotal: 29,
        connectedPort: '1/1/1'
      },
      {
        source: '5C:DF:89:2A:AF:04',
        target: '5C:DF:89:2A:AF:06',
        from: '5C:DF:89:2A:AF:04',
        to: '5C:DF:89:2A:AF:06',
        connectionType: 'Wired',
        connectionStatus: ConnectionStatus.Unknown,
        connectionStates: ConnectionStates.Regular,
        poeEnabled: false,
        linkSpeed: '1 Gb/s',
        poeUsed: 28,
        poeTotal: 29,
        connectedPort: '1/1/1'
      },{
        source: '5C:DF:89:2A:AF:05',
        target: '5C:DF:89:2A:AF:07',
        from: '5C:DF:89:2A:AF:05',
        to: '5C:DF:89:2A:AF:07',
        connectionType: 'Wired',
        connectionStatus: ConnectionStatus.Unknown,
        connectionStates: ConnectionStates.Regular,
        poeEnabled: true,
        linkSpeed: '1 Gb/s',
        poeUsed: 28,
        poeTotal: 29,
        connectedPort: '1/1/1'
      },{
        source: '5C:DF:89:2A:AF:07',
        target: '5C:DF:89:2A:AF:08',
        from: '5C:DF:89:2A:AF:07',
        to: '5C:DF:89:2A:AF:08',
        connectionType: 'Wired',
        connectionStatus: ConnectionStatus.Degraded,
        connectionStates: ConnectionStates.Regular,
        poeEnabled: true,
        linkSpeed: '1 Gb/s',
        poeUsed: 28,
        poeTotal: 29,
        connectedPort: '1/1/1'
      }],
      nodes: [
        {
          type: DeviceTypes.Ap,
          category: 'Ap',
          name: 'Ap001',
          mac: '5C:DF:89:2A:AF:01',
          serial: '534689211601',
          id: '5C:DF:89:2A:AF:01',
          states: DeviceStates.Regular,
          childCount: 0
        },
        {
          type: DeviceTypes.Ap,
          category: 'Ap',
          name: '',
          mac: '',
          serial: '534689211602',
          id: '5C:DF:89:2A:AF:02',
          states: DeviceStates.Regular,
          childCount: 0
        },
        {
          type: DeviceTypes.Switch,
          category: 'Switch',
          name: '',
          mac: 'D0:D5:40:8E:5E:02',
          serial: 'D0D5408E5E02',
          id: 'D0:D5:40:8E:5E:02',
          states: DeviceStates.Regular,
          childCount: 1,
          cloudPort: '1/2/1'
        },
        {
          type: DeviceTypes.Switch,
          category: 'Switch',
          name: 'Switch001',
          mac: 'C0:C5:20:7E:A5:01',
          serial: 'D0D5408E5E02',
          id: 'C0:C5:20:7E:A5:01',
          states: DeviceStates.Regular,
          childCount: 3
        },
        {
          type: DeviceTypes.Ap,
          category: 'Ap',
          name: 'Ap003',
          mac: '5C:DF:89:2A:AF:03',
          serial: '534689211603',
          id: '5C:DF:89:2A:AF:03',
          states: DeviceStates.Regular,
          childCount: 0
        },
        {
          type: DeviceTypes.Ap,
          category: 'Ap',
          name: 'Ap004',
          mac: '5C:DF:89:2A:AF:04',
          serial: '534689211603',
          id: '5C:DF:89:2A:AF:04',
          states: DeviceStates.Regular,
          childCount: 0
        },
        {
          type: DeviceTypes.ApMeshRoot,
          category: 'Ap',
          name: 'Ap005',
          mac: '5C:DF:89:2A:AF:05',
          serial: '534689211603',
          id: '5C:DF:89:2A:AF:05',
          states: DeviceStates.Regular,
          childCount: 0
        },
        {
          type: DeviceTypes.Ap,
          category: 'Ap',
          name: '',
          mac: '',
          serial: '534689211603',
          id: '5C:DF:89:2A:AF:06',
          states: DeviceStates.Regular,
          childCount: 0
        },
        {
          type: DeviceTypes.ApMesh,
          category: 'Ap',
          name: 'Ap007',
          mac: '5C:DF:89:2A:AF:07',
          serial: '534689211603',
          id: '5C:DF:89:2A:AF:07',
          states: DeviceStates.Regular,
          childCount: 0
        },
        {
          type: DeviceTypes.ApWired,
          category: 'Ap',
          name: 'Ap007',
          mac: '5C:DF:89:2A:AF:08',
          serial: '534689211603',
          id: '5C:DF:89:2A:AF:08',
          states: DeviceStates.Hover,
          childCount: 0
        },
        {
          type: DeviceTypes.ApMeshRoot,
          category: 'Ap',
          name: 'Ap008',
          mac: '5C:DF:89:2A:AF:09',
          serial: '534689211603',
          id: '5C:DF:89:2A:AF:09',
          states: DeviceStates.Hover,
          childCount: 0
        },
        {
          type: 'any-device' as DeviceTypes,
          category: 'Ap',
          name: 'Ap008',
          mac: '5C:DF:89:2A:AF:10',
          serial: '534689211603',
          id: '5C:DF:89:2A:AF:10',
          states: DeviceStates.Hover,
          childCount: 0
        },
        {
          type: DeviceTypes.SwitchStack,
          category: 'SwitchStack',
          name: 'Switch003',
          mac: 'D0:D5:40:8E:5E:03',
          serial: 'D0D5408E5E03',
          id: 'D0:D5:40:8E:5E:03',
          states: DeviceStates.Regular,
          childCount: 1
        }
      ]
    }
  ]
}

const scaleData = { ...graphData }

const mock = {
  inverse: () => mock,
  multiply: () => mock,
  translate: () => ({ e: 0, f: 0 })
}

Object.defineProperty(global.SVGElement.prototype, 'getScreenCTM', {
  writable: true,
  value: jest.fn().mockReturnValue(mock)
})
const value = jest.fn()
Object.defineProperty(global.SVGElement.prototype, 'getBBox', {
  writable: true,
  value: value
})
value.mockReturnValue({ x: 0, y: 0, width: 0, height: 0 })

Object.defineProperty(global.SVGElement.prototype, 'getComputedTextLength', {
  writable: true,
  value: jest.fn().mockReturnValue(0)
})

Object.defineProperty(global.SVGElement.prototype, 'createSVGMatrix', {
  writable: true,
  value: jest.fn().mockReturnValue({
    x: 10,
    y: 10,
    inverse: () => {},
    multiply: () => {}
  })
})

Object.defineProperty(global.SVGElement.prototype, 'width', {
  writable: true,
  value: {
    baseVal: {
      value: 10
    }
  }
})

Object.defineProperty(global.SVGElement.prototype, 'height', {
  writable: true,
  value: {
    baseVal: {
      value: 10
    }
  }
})

const editStackDetail = {
  suspendingDeployTime: '',
  stackMemberOrder: 'FEK4124R28X',
  isStack: true,
  rearModule: 'none',
  deviceStatus: 'OPERATIONAL',
  syncedSwitchConfig: true,
  sendedHostname: true,
  switchMac: '',
  venueId: '5c05180d54d84e609a4d653a3a8332d1',
  model: 'ICX7150-C12P',
  id: 'FEK4124R28X',
  floorplanId: '117c43124ed24069b127c50a49a0db36',
  deviceType: 'DVCNWTYPE_SWITCH',
  serialNumber: 'FEK4124R28X',
  xPercent: 69.75138092041016,
  yPercent: 12.195121765136719,
  portsStatus: {},
  stackMember: false,
  cliApplied: false,
  stackMembers: [
    { model: 'ICX7150-C12P', id: 'FEK4124R28X' },
    { model: 'ICX7150-C12P', id: 'FEK4224R17X' }
  ],
  poeUsage: {},
  venueName: 'My-Venue',
  isIpFullContentParsed: false,
  ipFullContentParsed: true,
  formStacking: true,
  name: '',
  tenantId: 'fe892a451d7a486bbb3aee929d2dfcd1',
  activeSerial: 'FEK4124R28X'
}

describe('Topology', () => {
  beforeEach(() => store.dispatch(venueApi.util.resetApiState()))

  it('should render correctly', async () => {
    const params = {
      tenantId: 'fe892a451d7a486bbb3aee929d2dfcd1',
      venueId: '7231da344778480d88f37f0cca1c534f'
    }
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getTopology.url,
        (req, res, ctx) => {return res(ctx.json(graphData))}),
      rest.get(SwitchUrlsInfo.getSwitchDetailHeader.url,
        (_, res, ctx) => res(ctx.json(editStackDetail))),
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json({ data: [{ apMac: '11:22:33:44:55:66' }], totalCount: 0 })))
    )

    const { asFragment } = await render(<Provider>
      <TopologyGraph showTopologyOn={ShowTopologyFloorplanOn.VENUE_OVERVIEW}/></Provider>,{
      route: { params }
    })

    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))


    await screen.findByTestId('topologyGraph')

    const switchDevices = await screen.findAllByTestId('Switch')

    expect(switchDevices.length).toBe(2)

    const ApDevices = await screen.findAllByTestId('AccessPointWifi')

    expect(ApDevices.length).toBe(5)

    // show tooltip on node click
    fireEvent.click(ApDevices[0])

    const apCard = await screen.findByTestId('nodeTooltip')
    expect(apCard).not.toBeNull()

    // hide tooltip on close
    fireEvent.click(screen.getByTestId(/CloseSymbol/i))
    expect(apCard).not.toBeInTheDocument()

    fireEvent.click(switchDevices[0])
    expect(await screen.findByTestId('nodeTooltip')).not.toBeNull()
    fireEvent.click(screen.getByTestId(/CloseSymbol/i))

    // show tooltip on edge click
    const allPaths = await screen.findAllByTestId('topologyEdge')
    fireEvent.click(allPaths[0])
    const edgeCard = await screen.findByTestId('edgeTooltip')
    expect(edgeCard).not.toBeNull()

    // hide tooltip on close
    fireEvent.click(screen.getByTestId(/CloseSymbol/i))
    expect(edgeCard).not.toBeInTheDocument()

    // to cover name || mac comdition
    fireEvent.click(allPaths[1])

    // to cover poeEnabled false
    fireEvent.click(allPaths[3])

    const switchStackDevice = await screen.findByTestId('StackDevice')

    fireEvent.click(switchStackDevice)
    expect(await screen.findByTestId('nodeTooltip')).not.toBeNull()

    // no tooltip on cloud connection edge click

    fireEvent.click(allPaths[8])
    expect(edgeCard).not.toBeInTheDocument()


    // no tooltip on cloud node click

    const cloud = await screen.findByTestId('CloudSolid')
    fireEvent.click(cloud)
    expect(apCard).not.toBeInTheDocument()


    const zoomIn = await screen.findByTestId('graph-zoom-in')

    fireEvent.click(zoomIn)

    const zoomOut = await screen.findByTestId('graph-zoom-out')

    fireEvent.click(zoomOut)

    const zoomFit = await screen.findByTestId('graph-zoom-fit')

    fireEvent.click(zoomFit)

    expect(asFragment()).toMatchSnapshot()
  })

  it('scale data should render', async () => {
    const params = {
      tenantId: 'fe892a451d7a486bbb3aee929d2dfcd1',
      venueId: '7231da344778480d88f37f0cca1c534f'
    }

    for (let i=0; i<100; i++) {
      scaleData.data[0].nodes.push({
        type: DeviceTypes.Ap,
        category: 'Ap',
        name: 'ApName',
        mac: '5C:DF:89:2A:AF:06' + i,
        serial: '534689211603',
        id: '5C:DF:89:2A:AF:06' + i,
        states: DeviceStates.Regular,
        childCount: 0
      })
    }
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getTopology.url,
        (req, res, ctx) => { return res(ctx.json(scaleData)) })
    )
    const { asFragment } = await render(<Provider>
      <TopologyGraph showTopologyOn={ShowTopologyFloorplanOn.VENUE_OVERVIEW} /></Provider>,{
      route: { params }
    })

    const ApDevices = await screen.findAllByTestId('AccessPointWifi')

    expect(ApDevices.length).toBe(105)

    expect(asFragment()).toMatchSnapshot()
  })

  it('should render topology on AP overview', async () => {
    const params = {
      tenantId: 'fe892a451d7a486bbb3aee929d2dfcd1',
      venueId: '7231da344778480d88f37f0cca1c534f'
    }
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getTopology.url,
        (req, res, ctx) => {
          return res(ctx.json(graphData))
        }
      )
    )

    const { asFragment } = await render(<Provider>
      <TopologyGraph
        showTopologyOn={ShowTopologyFloorplanOn.AP_OVERVIEW}
        venueId={params.venueId}
        deviceMac='5C:DF:89:2A:AF:01' /></Provider>,{
      route: { params }
    })

    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    await screen.findByTestId('topologyGraph')

    await screen.findAllByTestId('AccessPointWifi')

    expect(asFragment()).toMatchSnapshot()

  })
})
