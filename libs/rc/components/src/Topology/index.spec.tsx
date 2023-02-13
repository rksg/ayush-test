import '@testing-library/jest-dom'
import { rest }         from 'msw'
import { IntlProvider } from 'react-intl'

import { ApDeviceStatusEnum, CommonUrlsInfo, ConnectionStates, ConnectionStatus, DeviceStates, DeviceStatus, DeviceTypes, SwitchStatusEnum } from '@acx-ui/rc/utils'
import { Provider }                                                                      from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitForElementToBeRemoved }              from '@acx-ui/test-utils'

import { TopologyGraph } from '.'
import { getDeviceColor, getPathColor, switchStatus } from './utils'


const graphData = {
  fields: ['deviceType',
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
  ],
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
          childCount: 1
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
          type: 'any-device',
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
          category: 'Switch',
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


describe('Topology', () => {
  let params: { tenantId: string, venueId: string }
  beforeEach(() => {
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getTopology.url,
        (req, res, ctx) => res(ctx.json(graphData))
      )
    )
    params = {
      tenantId: 'fe892a451d7a486bbb3aee929d2dfcd1',
      venueId: '7231da344778480d88f37f0cca1c534f'
    }
  })
  it('should render correctly', async () => {


    const { asFragment } = await render(<Provider><IntlProvider locale='en'>
      <TopologyGraph /></IntlProvider></Provider>,{
      route: { params }
    })

    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))


    await screen.findByTestId('topologyGraph')

    const switchDevices = await screen.findAllByTestId('TopologySwitchSolid')

    expect(switchDevices.length).toBe(2)

    const ApDevices = await screen.findAllByTestId('TopologyAPIcon')

    expect(ApDevices.length).toBe(5)

    // show tooltip on node mouseover
    fireEvent.mouseOver(ApDevices[0])

    const apCard = await screen.findByTestId('nodeTooltip')
    await new Promise((resolve) => setTimeout(resolve, 500))
    expect(apCard).not.toBeNull()

    // hide tooltip on mouseout
    fireEvent.mouseOut(ApDevices[0])
    await new Promise((resolve) => setTimeout(resolve, 500))
    expect(apCard).not.toBeInTheDocument()

    fireEvent.mouseOver(switchDevices[0])
    await new Promise((resolve) => setTimeout(resolve, 500))
    expect(await screen.findByTestId('nodeTooltip')).not.toBeNull()
    fireEvent.mouseOut(ApDevices[0])

    // show tooltip on edge mouseover
    const allPaths = await screen.findAllByTestId('topologyEdge')
    fireEvent.mouseOver(allPaths[0])
    const edgeCard = await screen.findByTestId('edgeTooltip')
    expect(edgeCard).not.toBeNull()

    // hide tooltip on mouseout
    fireEvent.mouseOut(allPaths[0])
    expect(edgeCard).not.toBeInTheDocument()

    // to cover name || mac comdition
    fireEvent.mouseOver(allPaths[1])

    // to cover poeEnabled false
    fireEvent.mouseOver(allPaths[3])

    // fireEvent.mouseOver(allPaths[2])

    // no tooltip on cloud connection edge mouseover

    fireEvent.mouseOver(allPaths[8])
    expect(edgeCard).not.toBeInTheDocument()


    // no tooltip on cloud node mouseover

    const cloud = await screen.findByTestId('CloudIconSolid')
    fireEvent.mouseOver(cloud)
    expect(apCard).not.toBeInTheDocument()


    const zoomIn = await screen.findByTestId('graph-zoom-in')

    fireEvent.click(zoomIn)

    const zoomOut = await screen.findByTestId('graph-zoom-out')

    fireEvent.click(zoomOut)

    const zoomFit = await screen.findByTestId('graph-zoom-fit')

    fireEvent.click(zoomFit)

    const zoomOriginal = await screen.findByTestId('graph-zoom-original')

    fireEvent.click(zoomOriginal)

    expect(asFragment()).toMatchSnapshot()
  })

  it('test getDeviceColor', async () => {
    expect(getDeviceColor(DeviceStatus.Degraded)).toBe('var(--acx-semantics-yellow-40)')
    expect(getDeviceColor(ApDeviceStatusEnum.REBOOTING)).toBe('var(--acx-semantics-yellow-40)')
    expect(getDeviceColor(ApDeviceStatusEnum.HEARTBEAT_LOST)).toBe('var(--acx-semantics-yellow-40)')

    expect(getDeviceColor(ApDeviceStatusEnum.FIRMWARE_UPDATE_FAILED))
      .toBe('var(--acx-semantics-red-70)')
    expect(getDeviceColor(ApDeviceStatusEnum.CONFIGURATION_UPDATE_FAILED))
      .toBe('var(--acx-semantics-red-70)')
    expect(getDeviceColor(ApDeviceStatusEnum.DISCONNECTED_FROM_CLOUD))
      .toBe('var(--acx-semantics-red-70)')

    expect(getDeviceColor(DeviceStatus.Unknown)).toBe('var(--acx-neutrals-50)')
    expect(getDeviceColor(ApDeviceStatusEnum.NEVER_CONTACTED_CLOUD)).toBe('var(--acx-neutrals-50)')
    expect(getDeviceColor(ApDeviceStatusEnum.INITIALIZING)).toBe('var(--acx-neutrals-50)')
    expect(getDeviceColor(ApDeviceStatusEnum.OFFLINE)).toBe('var(--acx-neutrals-50)')
    expect(getDeviceColor(SwitchStatusEnum.INITIALIZING)).toBe('var(--acx-neutrals-50)')
    expect(getDeviceColor(SwitchStatusEnum.NEVER_CONTACTED_CLOUD)).toBe('var(--acx-neutrals-50)')
    expect(getDeviceColor(SwitchStatusEnum.DISCONNECTED)).toBe('var(--acx-neutrals-50)')
  })

  it('test switchStatus', async () => {
    expect(switchStatus(SwitchStatusEnum.OPERATIONAL)).toBe('Operational')
    expect(switchStatus(SwitchStatusEnum.DISCONNECTED)).toBe('Requires Attention')
    expect(switchStatus(SwitchStatusEnum.NEVER_CONTACTED_CLOUD)).toBe('Never contacted cloud')
    expect(switchStatus(SwitchStatusEnum.INITIALIZING)).toBe('Initializing')
    expect(switchStatus(SwitchStatusEnum.APPLYING_FIRMWARE)).toBe('Firmware updating')
    expect(switchStatus(SwitchStatusEnum.STACK_MEMBER_NEVER_CONTACTED))
      .toBe('Never contacted Active Switch')

    expect(getPathColor('any-status' as ConnectionStatus)).toBe('var(--acx-neutrals-50)')
  })
})
