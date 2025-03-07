import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import _         from 'lodash'
import { rest }  from 'msw'

import { Features, useIsSplitOn }            from '@acx-ui/feature-toggle'
import { ethernetPortProfileApi, policyApi } from '@acx-ui/rc/services'
import {
  AaaUrls,
  EthernetPortProfileUrls,
  ClientIsolationUrls,
  SoftGreUrls,
  LanPortsUrls } from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { dummyRadiusServiceList, ethernetPortProfileList, initLanData, mockDefaultTunkEthertnetPortProfile, portOverwrite, selectedApModel, selectedApModelCaps, selectedSinglePortModel, selectedSinglePortModelCaps, selectedTrunkPortCaps, trunkWithPortBasedName } from './__tests__/fixtures'

import { LanPortSettings } from '.'

jest.mock('../ApCompatibility', () => ({
  ...jest.requireActual('../ApCompatibility'),
  ApCompatibilityToolTip: () => <div data-testid={'ApCompatibilityToolTip'} />,
  ApCompatibilityDrawer: () => <div data-testid={'ApCompatibilityDrawer'} />
}))

type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
  loading?: boolean
  dropdownClassName?: string
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ loading, children, onChange, options,
    dropdownClassName, ...props }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)} value=''>
      {children ? children : null}
      {options?.map((option) => (
        <option
          key={`option-${option.value}`}
          value={option.value as string}>
          {option.label}
        </option>
      ))}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})

export const mockSoftgreViewModel = {
  fields: null,
  totalCount: 0,
  page: 1,
  data: [
    {
      id: '668898664044402d800cf1ab7e7a6d04',
      name: 'SoftGre1',
      description: '',
      primaryGatewayAddress: '1.1.1.1',
      secondaryGatewayAddress: '1.1.1.2',
      mtuType: 'AUTO',
      keepAliveInterval: 10,
      keepAliveRetryTimes: 5,
      disassociateClientEnabled: false,
      activations: [

      ],
      venueActivations: [
        {
          venueId: 'bad700975bbb42c1b8c7e5cdb764dfb6',
          apModel: 'H320',
          portId: 1,
          apSerialNumbers: [

          ]
        }
      ]
    }
  ]
}

export const mockClientIsolationViewModel = {
  fields: null,
  totalCount: 2,
  page: 1,
  data: [
    {
      id: 'b566e720d85749439534788f174f1732',
      name: 'client-isolation-2',
      description: '',
      clientEntries: [
        '11:11:11:11:11:11'
      ],
      activations: []
    },
    {
      id: '79e201950d6a41a68350f1a3d7e2857d',
      name: 'client_isolation',
      description: '',
      clientEntries: [
        '11:22:33:44:55:66'
      ],
      activations: []
    }
  ]
}

export const mockDHCP82OptionSetting = {
  softGreEnabled: true,
  softGreSettings: {
    dhcpOption82Enabled: true,
    dhcpOption82Settings: {
      subOption1Enabled: true,
      subOption1Format: 'SUBOPT1_ESSID',
      subOption2Enabled: false,
      subOption150Enabled: true,
      subOption151Enabled: false,
      macFormat: 'NODELIMITER'
    }
  },
  enabled: true
}

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
  vlanMembers: '1-4094',
  vni: 1
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

describe('Ethernet Port Profile', () => {
  const venueId = '123'
  const apSerial = '123456789042'

  beforeEach(() => {
    store.dispatch(policyApi.util.resetApiState())
    store.dispatch(ethernetPortProfileApi.util.resetApiState())

    mockServer.use(
      rest.post(
        EthernetPortProfileUrls.getEthernetPortProfileViewDataList.url,
        (_, res, ctx) => res(ctx.json({
          data: ethernetPortProfileList
        }))
      ),
      rest.get(
        LanPortsUrls.getApLanPortSettings.url,
        (_, res, ctx) => res(ctx.json(portOverwrite))
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

  it('AP Level - should render with ethernet port profile correctly', async () => {
    jest.mocked(useIsSplitOn).mockImplementation((ff) => {
      return ff === Features.ETHERNET_PORT_PROFILE_TOGGLE
    })

    const apParams = {
      tenantId: 'tenant-id',
      serialNumber: apSerial
    }

    render(<Provider>
      <Form initialValues={{ lan: initLanData }}>
        <LanPortSettings
          index={0}
          readOnly={false}
          selectedPortCaps={selectedTrunkPortCaps}
          selectedModel={selectedApModel}
          setSelectedPortCaps={jest.fn()}
          selectedModelCaps={selectedApModelCaps}
          isDhcpEnabled={false}
          isTrunkPortUntaggedVlanEnabled={false}
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

  it.skip('AP Level - Single port has vni cannot modify', async () => {
    jest.mocked(useIsSplitOn).mockImplementation((ff) => {
      return ff === Features.ETHERNET_PORT_PROFILE_TOGGLE
    })

    const apParams = {
      tenantId: 'tenant-id',
      serialNumber: '123456789042'
    }

    const lanDataHasVni = _.cloneDeep(lanData)
    lanDataHasVni[0].vni = 8196

    render(<Provider>
      <Form initialValues={{ lan: lanDataHasVni }}>
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

    expect(screen.queryByLabelText(/Ethernet Port Profile/)).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: 'Ethernet Port Profile' }))
      .not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Profile Details' }))
      .not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'add Profile' }))
      .not.toBeInTheDocument()
  })

  it('the ethernetport profile with vni should be removed from the dropdown', async () => {
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
    const options = await screen.findAllByRole('option')
    expect(options.length).toBe(2)
    expect(options[0].innerHTML).toBe('Default Trunk')
    expect(options[1].innerHTML).toBe('trunk Profile 1')
  })
})
describe('LanPortSettings -  SoftGre Profile Profile', ()=> {
  const venueId = 'bad700975bbb42c1b8c7e5cdb764dfb6'
  const portId = '1'
  const apModel = 'H320'
  const serialNumber = '123456'
  beforeEach(() => {
    mockServer.use(
      rest.post(
        EthernetPortProfileUrls.getEthernetPortProfileViewDataList.url,
        (_, res, ctx) => res(ctx.json({
          data: ethernetPortProfileList
        }))
      ),
      rest.get(
        LanPortsUrls.getApLanPortSettings.url,
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
      ),
      rest.get(
        SoftGreUrls.getSoftGreProfileConfigurationOnVenue.url
          .replace(':venueId' ,venueId)
          .replace(':portId' ,portId)
          .replace(':apModel' ,apModel)
        , (req, res, ctx) => {
          return res(ctx.json(mockDHCP82OptionSetting))
        }),
      rest.get(
        SoftGreUrls.getSoftGreProfileConfigurationOnAP.url
          .replace(':venueId' ,venueId)
          .replace(':portId' ,portId)
          .replace(':serialNumber' ,serialNumber)
        , (req, res, ctx) => {
          return res(ctx.json(mockDHCP82OptionSetting))
        }),
      rest.post(SoftGreUrls.getSoftGreViewDataList.url, (req, res, ctx) => {
        return res(ctx.json(mockSoftgreViewModel))
      }),
      rest.post(AaaUrls.queryAAAPolicyList.url,
        (_, res, ctx) => {
          return res(ctx.json(dummyRadiusServiceList))
        }
      ),
      rest.post(ClientIsolationUrls.queryClientIsolation.url,
        (_, res, ctx) => {
          return res(ctx.json(mockClientIsolationViewModel))
        }
      )
    )
  })
  it('Venue Level', async () => {
    jest.mocked(useIsSplitOn).mockImplementation((ff) => {
      return (ff === Features.ETHERNET_PORT_PROFILE_TOGGLE ||
        ff === Features.WIFI_ETHERNET_SOFTGRE_TOGGLE ||
        ff === Features.WIFI_ETHERNET_DHCP_OPTION_82_TOGGLE)
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

    expect(screen.getByText(/Enable SoftGRE Tunnel/)).toBeInTheDocument()
    await userEvent.click(screen.getByTestId('softgre-tunnel-switch'))
    expect(screen.getByLabelText(/SoftGRE Profile/)).toBeInTheDocument()
    expect(screen.getByTestId('enable-softgre-tunnel-banner')).toBeInTheDocument()
    expect(screen.getByTestId('softgre-profile-select')).toBeInTheDocument()
    expect(screen.getByLabelText(/SoftGRE Profile/)).toBeInTheDocument()

    expect(screen.getByText(/DHCP Option 82/)).toBeInTheDocument()
    await userEvent.click(screen.getByTestId('dhcpoption82-switch-toggle'))
    expect(screen.getByTestId('dhcpOption82SubOption1-switch')).toBeInTheDocument()
    await userEvent.click(screen.getAllByText('Apply')[0])
    expect(screen.getByTestId('dhcp82toption-icon')).toBeInTheDocument()
  })
  it('Venue Level with IPSec', async () => {
    jest.mocked(useIsSplitOn).mockImplementation((ff) => {
      return (ff === Features.ETHERNET_PORT_PROFILE_TOGGLE ||
        ff === Features.WIFI_ETHERNET_SOFTGRE_TOGGLE ||
        ff === Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE ||
        ff === Features.WIFI_ETHERNET_DHCP_OPTION_82_TOGGLE)
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

    expect(screen.getByText(/Enable SoftGRE Tunnel/)).toBeInTheDocument()
    await userEvent.click(screen.getByTestId('softgre-tunnel-switch'))

    expect(screen.getByTestId(/enable-ipsec-banner/)).toBeInTheDocument()
    await userEvent.click(screen.getByTestId('ipsec-switch'))
    expect(screen.getByTestId('ipsec-profile-select')).toBeInTheDocument()
    expect(screen.getByLabelText(/IPsec Profile/)).toBeInTheDocument()
  })
  it('AP Level - should render read-only mode correctly with DHCP service enalbed', async () => {
    jest.mocked(useIsSplitOn).mockImplementation((ff) => {
      return ff === Features.ETHERNET_PORT_PROFILE_TOGGLE ||
        ff === Features.RBAC_SERVICE_POLICY_TOGGLE ||
        ff === Features.WIFI_ETHERNET_SOFTGRE_TOGGLE ||
        ff === Features.WIFI_ETHERNET_CLIENT_ISOLATION_TOGGLE
    })
    const apParams = {
      tenantId: 'tenant-id',
      serialNumber: '123456789042'
    }

    render(<Provider>
      <Form initialValues={{ lan: initLanData }}>
        <LanPortSettings
          index={0}
          readOnly={true}
          selectedPortCaps={selectedTrunkPortCaps}
          selectedModel={selectedSinglePortModel}
          setSelectedPortCaps={jest.fn()}
          selectedModelCaps={selectedSinglePortModelCaps}
          isDhcpEnabled={true}
          isTrunkPortUntaggedVlanEnabled={true}
          useVenueSettings={false}
          serialNumber={apParams.serialNumber}
          venueId={venueId}
        />
      </Form>
    </Provider>, {
      route: { params: apParams, path: '/:tenantId/t/devices/wifi/:serialNumber/edit/networking' }
    })

    await screen.findByText(/The following LAN Port settings can’t work because DHCP is enabled/)
    expect(screen.queryByRole('button', { name: /Override the VLAN Untag ID/ }))
      .not.toBeInTheDocument()
    expect(screen.getByTestId('softgre-tunnel-switch')).toBeDisabled()
    expect(screen.getByTestId('client-isolation-switch')).toBeDisabled()
  })
})

describe('SoftGre Profile - Handle for R370 model', ()=> {
  beforeEach(() => {
    mockServer.resetHandlers()
    mockServer.use(
      rest.post(
        EthernetPortProfileUrls.getEthernetPortProfileViewDataList.url,
        (_, res, ctx) => res(ctx.json({
          data: ethernetPortProfileList
        }))
      ),
      rest.get(
        LanPortsUrls.getApLanPortSettings.url,
        (_, res, ctx) => res(ctx.json(portOverwrite))
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

  afterAll(() => mockServer.close())

  it('Venue Level - should not render SoftGre Tunnel when model is R370', async () => {
    jest.mocked(useIsSplitOn).mockImplementation((ff) => {
      return (ff === Features.ETHERNET_PORT_PROFILE_TOGGLE ||
        ff === Features.WIFI_ETHERNET_SOFTGRE_TOGGLE ||
        ff === Features.WIFI_R370_TOGGLE ||
        ff === Features.WIFI_ETHERNET_DHCP_OPTION_82_TOGGLE)
    })

    const venueParams = {
      tenantId: 'tenant-id',
      venueId: '123'
    }

    const selectedApModelCaps = {
      model: 'R370',
      supportSoftGre: false
    }

    render(<Provider>
      <Form initialValues={{ lan: initLanData }}>
        <LanPortSettings
          index={0}
          readOnly={false}
          selectedPortCaps={selectedTrunkPortCaps}
          selectedModel={selectedSinglePortModel}
          setSelectedPortCaps={jest.fn()}
          selectedModelCaps={selectedApModelCaps}
          isDhcpEnabled={false}
          isTrunkPortUntaggedVlanEnabled={true}
          useVenueSettings={false}
          venueId={venueParams.venueId}
        />
      </Form>
    </Provider>, {
      route: { params: venueParams, path: '/:tenantId/t/venues/:venueId/edit/wifi/networking' }
    })

    expect(screen.queryByText(/Enable SoftGRE Tunnel/)).not.toBeInTheDocument()
  })

  it('Venue Level - should render SoftGre Tunnel when model is not R370', async () => {
    jest.mocked(useIsSplitOn).mockImplementation((ff) => {
      return (ff === Features.ETHERNET_PORT_PROFILE_TOGGLE ||
        ff === Features.WIFI_ETHERNET_SOFTGRE_TOGGLE ||
        ff === Features.WIFI_R370_TOGGLE ||
        ff === Features.WIFI_ETHERNET_DHCP_OPTION_82_TOGGLE)
    })

    const venueParams = {
      tenantId: 'tenant-id',
      venueId: '123'
    }

    const selectedApModelCaps = {
      model: 'R500'
    }

    render(<Provider>
      <Form initialValues={{ lan: initLanData }}>
        <LanPortSettings
          index={0}
          readOnly={false}
          selectedPortCaps={selectedTrunkPortCaps}
          selectedModel={selectedSinglePortModel}
          setSelectedPortCaps={jest.fn()}
          selectedModelCaps={selectedApModelCaps}
          isDhcpEnabled={false}
          isTrunkPortUntaggedVlanEnabled={true}
          useVenueSettings={false}
          venueId={venueParams.venueId}
        />
      </Form>
    </Provider>, {
      route: { params: venueParams, path: '/:tenantId/t/venues/:venueId/edit/wifi/networking' }
    })

    expect(screen.getByText(/Enable SoftGRE Tunnel/)).toBeInTheDocument()
  })

  it('AP Level - should not render SoftGre Tunnel when model is R370', async () => {
    jest.mocked(useIsSplitOn).mockImplementation((ff) => {
      return (ff === Features.ETHERNET_PORT_PROFILE_TOGGLE ||
        ff === Features.WIFI_R370_TOGGLE ||
        ff === Features.WIFI_ETHERNET_SOFTGRE_TOGGLE)
    })

    const apParams = {
      tenantId: 'tenant-id',
      venueId: '123',
      serialNumber: '123456789042'
    }

    const selectedApModelCaps = {
      model: 'R370',
      supportSoftGre: false
    }

    render(<Provider>
      <Form initialValues={{ lan: initLanData }}>
        <LanPortSettings
          index={0}
          readOnly={false}
          selectedPortCaps={selectedTrunkPortCaps}
          selectedModel={selectedSinglePortModel}
          setSelectedPortCaps={jest.fn()}
          selectedModelCaps={selectedApModelCaps}
          isDhcpEnabled={false}
          isTrunkPortUntaggedVlanEnabled={true}
          useVenueSettings={false}
          serialNumber={apParams.serialNumber}
          venueId={apParams.venueId}
        />
      </Form>
    </Provider>, {
      route: { params: apParams, path: '/:tenantId/t/devices/wifi/:serialNumber/edit/networking' }
    })

    expect(screen.queryByText(/Enable SoftGRE Tunnel/)).not.toBeInTheDocument()
  })
})
