import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                             from '@acx-ui/feature-toggle'
import { AaaUrls, EthernetPortProfileUrls, FirmwareUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                           from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { dummyRadiusServiceList, ethernetPortProfileList, initLanData, mockDefaultTunkEthertnetPortProfile, mockedApModelFamilies, selectedSinglePortModel, selectedSinglePortModelCaps, selectedTrunkPortCaps, trunkWithPortBasedName } from './__tests__/fixtures'

import { LanPortSettings } from '.'

jest.mock('../ApCompatibility', () => ({
  ...jest.requireActual('../ApCompatibility'),
  ApCompatibilityToolTip: () => <div data-testid={'ApCompatibilityToolTip'} />,
  ApCompatibilityDrawer: () => <div data-testid={'ApCompatibilityDrawer'} />
}))

const venueId='mock-venue-id'

const selectedModelCaps = {
  canSupportPoeMode: true,
  canSupportPoeOut: false,
  model: 'R650',
  lanPorts: [{
    defaultType: 'TRUNK',
    type: 'TRUNK',
    untagId: 1,
    vlanMembers: '1-4094',
    portId: '1',
    enabled: true,
    id: '1'
  }, {
    defaultType: 'TRUNK',
    type: 'TRUNK',
    untagId: 1,
    vlanMembers: '1-4094',
    portId: '2',
    enabled: true,
    id: '2'
  }]
}

const selectedPortCaps = {
  defaultType: 'TRUNK',
  id: '1',
  isPoeOutPort: false,
  isPoePort: false,
  supportDisable: true,
  trunkPortOnly: false,
  untagId: 1,
  vlanMembers: '1-4094'
}

const selectedModel = {
  lanPorts: [{
    type: 'TRUNK',
    untagId: 1,
    vlanMembers: '1-4094',
    portId: '1',
    enabled: true
  }, {
    type: 'TRUNK',
    untagId: 1,
    vlanMembers: '1-4094',
    portId: '2',
    enabled: true
  }],
  model: 'R650',
  poeMode: 'Auto',
  useVenueSettings: false
}

const params = {
  tenantId: 'tenant-id'
}

const lanData = [{
  type: 'TRUNK',
  untagId: 1,
  vlanMembers: '1-4094',
  portId: '2',
  enabled: true
}]

beforeEach(() => {
  mockServer.use(
    rest.post(FirmwareUrlsInfo.getApModelFamilies.url,
      (_, res, ctx) => {
        return res(ctx.json(mockedApModelFamilies))
      }
    )
  )
})


describe('LanPortSettings', () => {
  it('should render correctly', async () => {
    render(<Provider>
      <Form initialValues={{ lan: lanData }}>
        <LanPortSettings
          index={0}
          readOnly={false}
          selectedPortCaps={selectedPortCaps}
          selectedModel={selectedModel}
          setSelectedPortCaps={jest.fn()}
          selectedModelCaps={selectedModelCaps}
          isDhcpEnabled={false}
          useVenueSettings={false}
        />
      </Form>
    </Provider>, {
      route: { params, path: '/:tenantId' }
    })

    await screen.findByText('Enable port')

    expect(screen.getByLabelText(/VLAN untag ID/)).toHaveValue('1')
    expect(screen.getByLabelText(/VLAN member/)).toHaveValue('1-4094')
    expect(screen.getByLabelText(/VLAN untag ID/)).toBeDisabled()
    expect(screen.getByLabelText(/VLAN member/)).toBeDisabled()
    const toolips = await screen.findAllByTestId('QuestionMarkCircleOutlined')
    fireEvent.mouseEnter(toolips[1])
    expect(screen.queryByTestId('tooltip-button')).toBeNull()

    fireEvent.mouseDown(screen.getByLabelText(/Port type/))
    await userEvent.click(screen.getAllByText('GENERAL')[1])
    fireEvent.change(screen.getByLabelText(/VLAN untag ID/), { target: { value: 2 } })
    fireEvent.change(screen.getByLabelText(/VLAN member/), { target: { value: '1-10' } })
  })

  it('should render read-only mode correctly', async () => {
    render(<Provider>
      <Form initialValues={{ lan: lanData }}>
        <LanPortSettings
          index={0}
          readOnly={true}
          selectedPortCaps={selectedPortCaps}
          selectedModel={selectedModel}
          setSelectedPortCaps={jest.fn()}
          selectedModelCaps={selectedModelCaps}
          isDhcpEnabled={true}
          useVenueSettings={false}
        />
      </Form>
    </Provider>, {
      route: { params, path: '/:tenantId' }
    })

    await screen.findByText(/The following LAN Port settings can’t work because DHCP is enabled/)
    expect(screen.getByLabelText(/Port type/)).toBeDisabled()
    expect(screen.getByLabelText(/VLAN untag ID/)).toBeDisabled()
    expect(screen.getByLabelText(/VLAN member/)).toBeDisabled()
  })

  it('should render correctly with trunk port untagged vlan toggle', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff !== Features.ETHERNET_PORT_PROFILE_TOGGLE)

    render(<Provider>
      <Form initialValues={{ lan: lanData }}>
        <LanPortSettings
          index={0}
          selectedPortCaps={selectedPortCaps}
          selectedModel={selectedModel}
          setSelectedPortCaps={jest.fn()}
          selectedModelCaps={selectedModelCaps}
          isTrunkPortUntaggedVlanEnabled={true}
          useVenueSettings={false}
        />
      </Form>
    </Provider>, {
      route: { params, path: '/:tenantId' }
    })

    expect(screen.getByLabelText(/Port type/)).toBeEnabled()
    expect(screen.getByLabelText(/VLAN untag ID/)).toBeEnabled()
    expect(screen.getByLabelText(/VLAN member/)).toBeDisabled()

    fireEvent.change(screen.getByLabelText(/VLAN untag ID/), { target: { value: 2 } })
    expect(screen.getByLabelText(/VLAN member/).value).toBe('1-4094')

    const toolips = await screen.findAllByTestId('QuestionMarkCircleOutlined')
    fireEvent.mouseEnter(toolips[1])
    expect(await screen.findByTestId('ApCompatibilityToolTip')).not.toBeNull()
  })

  it('should render read-only mode correctly with trunk port untagged vlan toggle', async () => {
    render(<Provider>
      <Form initialValues={{ lan: lanData }}>
        <LanPortSettings
          index={0}
          readOnly={true}
          selectedPortCaps={selectedPortCaps}
          selectedModel={selectedModel}
          setSelectedPortCaps={jest.fn()}
          selectedModelCaps={selectedModelCaps}
          isDhcpEnabled={true}
          isTrunkPortUntaggedVlanEnabled={true}
          useVenueSettings={false}
        />
      </Form>
    </Provider>, {
      route: { params, path: '/:tenantId' }
    })

    await screen.findByText(/The following LAN Port settings can’t work because DHCP is enabled/)
    expect(screen.getByLabelText(/Port type/)).toBeDisabled()
    expect(screen.getByLabelText(/VLAN untag ID/)).toBeDisabled()
    expect(screen.getByLabelText(/VLAN member/)).toBeDisabled()
  })
})

describe('LanPortSettings - Ethernet Port Profile', () => {

  beforeEach(() => {
    mockServer.use(
      rest.post(
        EthernetPortProfileUrls.getEthernetPortProfileViewDataList.url,
        (_, res, ctx) => res(ctx.json({
          data: ethernetPortProfileList
        }))
      ),
      rest.get(
        EthernetPortProfileUrls.getEthernetPortOverwritesByApPortId.url,
        (_, res, ctx) => res(ctx.json({
          data: {
            enabled: true,
            overwriteUntagId: 1,
            overwriteVlanMembers: '1-4094'
          }
        }))
      ),
      rest.get(
        EthernetPortProfileUrls.getEthernetPortProfile.url,
        (_, res, ctx) => res(ctx.json({
          data: mockDefaultTunkEthertnetPortProfile
        }))
      ),
      rest.post(AaaUrls.getAAAPolicyViewModelList.url,
        (_, res, ctx) => {
          return res(ctx.json(dummyRadiusServiceList))
        }
      )
    )
  })

  afterEach(() => {
    mockServer.resetHandlers()
  })

  it('AP Level - should render with ethernet port profile correctly', async () => {
    jest.mocked(useIsSplitOn).mockImplementation((ff) => {
      return ff === Features.ETHERNET_PORT_PROFILE_TOGGLE
    })

    const apParams = {
      tenantId: 'tenant-id',
      serialNumber: '123456789042'
    }

    render(<Provider>
      <Form initialValues={{ lan: lanData }}>
        <LanPortSettings
          index={0}
          readOnly={false}
          selectedPortCaps={selectedPortCaps}
          selectedModel={selectedModel}
          setSelectedPortCaps={jest.fn()}
          selectedModelCaps={selectedModelCaps}
          isDhcpEnabled={false}
          isTrunkPortUntaggedVlanEnabled={true}
          useVenueSettings={false}
          serialNumber={apParams.serialNumber}
          venueId={venueId}
        />
      </Form>
    </Provider>, {
      route: { params: apParams, path: '/:tenantId/t/devices/wifi/:serialNumber/edit/networking' }
    })

    expect(screen.getByLabelText(/Ethernet Port Profile/)).toBeInTheDocument()
    expect(screen.getByText('Port Type')).toBeInTheDocument()
    expect(screen.getByText('VLAN Untag ID')).toBeInTheDocument()
    expect(screen.getByText('VLAN Members')).toBeInTheDocument()
    expect(screen.getByText('802.1X')).toBeInTheDocument()

    const untagIdReloadBtn = screen.getByRole('button',
      { name: 'VLAN Untag ID (Default)' })
    expect(untagIdReloadBtn).toBeVisible()
    await userEvent.click(untagIdReloadBtn)

    const checkBtn = screen.getByRole('button', { name: 'check' })
    expect(checkBtn).toBeVisible()
    await userEvent.click(checkBtn)
  })

  it('AP Level - Single port AP model should filter out Port-Based ethernet port', async () => {
    jest.mocked(useIsSplitOn).mockImplementation((ff) => {
      return ff === Features.ETHERNET_PORT_PROFILE_TOGGLE
    })

    const apParams = {
      tenantId: 'tenant-id',
      serialNumber: '123456789042'
    }

    render(<Provider>
      <Form initialValues={{ lan: initLanData }}>
        <LanPortSettings
          index={0}
          readOnly={false}
          selectedPortCaps={selectedTrunkPortCaps}
          selectedModel={selectedSinglePortModel}
          setSelectedPortCaps={jest.fn()}
          selectedModelCaps={selectedSinglePortModelCaps}
          isDhcpEnabled={false}
          isTrunkPortUntaggedVlanEnabled={true}
          useVenueSettings={false}
          serialNumber={apParams.serialNumber}
          venueId={venueId}
        />
      </Form>
    </Provider>, {
      route: { params: apParams, path: '/:tenantId/t/devices/wifi/:serialNumber/edit/networking' }
    })

    expect(screen.getByLabelText(/Ethernet Port Profile/)).toBeInTheDocument()
    const ethernetPortProfileCombo = screen.getByRole('combobox', { name: 'Ethernet Port Profile' })
    await userEvent.click(ethernetPortProfileCombo)

    expect((await screen.findAllByText('Default Trunk'))[0]).toBeInTheDocument()
    expect(screen.queryByText(trunkWithPortBasedName)).not.toBeInTheDocument()

  })
})
