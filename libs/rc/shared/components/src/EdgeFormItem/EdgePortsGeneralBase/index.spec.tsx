import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import _         from 'lodash'

import { Features }        from '@acx-ui/feature-toggle'
import {
  ClusterNetworkSettings,
  EdgePortConfigFixtures,
  EdgePortInfo,
  EdgePortTypeEnum,
  VirtualIpSetting,
  getEdgePortDisplayName
} from '@acx-ui/rc/utils'
import {
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'


import { useIsEdgeFeatureReady } from '../../useEdgeActions'

import { transformApiDataToFormListData } from './utils'

import { EdgePortsGeneralBase } from '.'

jest.mock('@acx-ui/utils', () => {
  const reactIntl = jest.requireActual('react-intl')
  const intl = reactIntl.createIntl({
    locale: 'en'
  })
  return {
    ...jest.requireActual('@acx-ui/utils'),
    getIntl: () => intl
  }
})

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ children, onChange, ...props }: React.PropsWithChildren<{
    onChange?: (value: string) => void,
  }>) => {
    return (
      <select onChange={(e) => onChange?.(e.target.value)} value='' {...props}>
        {children ? children : null}
      </select>
    )
  }
  Select.Option = 'option'
  return { ...components, Select }
})

jest.mock('../../useEdgeActions', () => ({
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

const {
  mockEdgePortConfigWithStatusIpWithoutCorePort,
  mockEdgePortConfig,
  mockPortInfo
} = EdgePortConfigFixtures
// eslint-disable-next-line max-len
const formEdgePortConfig = transformApiDataToFormListData(mockEdgePortConfig.ports)
// eslint-disable-next-line max-len
const formPortConfigWithStatusIpWithoutCorePort = transformApiDataToFormListData(mockEdgePortConfigWithStatusIpWithoutCorePort.ports)

const mockedOnTabChange = jest.fn()

const mockedProps = {
  statusData: mockPortInfo as EdgePortInfo[],
  isEdgeSdLanRun: false,
  activeTab: '',
  onTabChange: mockedOnTabChange,
  fieldHeadPath: []
}

describe('EditEdge ports - ports general', () => {

  describe('WAN port exist and no core port configured', () => {
    beforeEach(() => {})

    const MockedComponent = (props: { vipConfig?: ClusterNetworkSettings['virtualIpSettings'] })=>
      <Form initialValues={formPortConfigWithStatusIpWithoutCorePort}>
        <EdgePortsGeneralBase {...mockedProps} {...props} />
        <button data-testid='rc-submit'>Submit</button>
      </Form>

    it ('IP status on each port tab should be displayed correctly', async () => {
      render(<MockedComponent />)

      for (let i = 0; i < mockEdgePortConfig.ports.length; ++i) {
        await userEvent.click(await screen.findByRole('tab',
          { name: getEdgePortDisplayName(mockEdgePortConfig.ports[i]) }))
        const expectedIp = mockedProps.statusData[i]?.ip || 'N/A'
        await screen.findByText(
          'IP Address: ' + expectedIp + ' | ' +
            'MAC Address: ' + mockEdgePortConfig.ports[i].mac)

      }
    })

    it('should display successfully', async () => {
      render(<MockedComponent />)

      const ipInput = await screen.findByRole('textbox', { name: 'IP Address' })
      await userEvent.clear(ipInput)
      await userEvent.type(ipInput, '1.1.1.1')
      const subnetInput = await screen.findByRole('textbox', { name: 'Subnet Mask' })
      await userEvent.clear(subnetInput)
      await userEvent.type(subnetInput, '255.255.255.0')
      const gatewayInput = await screen.findByRole('textbox', { name: 'Gateway' })
      await userEvent.clear(gatewayInput)
      await userEvent.type(gatewayInput, '1.1.1.1')

    })

    it('should be blocked by validation 1', async () => {
      render(<MockedComponent />)

      const ipInput = await screen.findByRole('textbox', { name: 'IP Address' })
      await userEvent.clear(ipInput)
      const subnetInput = await screen.findByRole('textbox', { name: 'Subnet Mask' })
      await userEvent.clear(subnetInput)
      const gatewayInput = await screen.findByRole('textbox', { name: 'Gateway' })
      await userEvent.clear(gatewayInput)
      await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
      await screen.findByText('Please enter IP Address')
      await screen.findByText('Please enter Subnet Mask')
      await screen.findByText('Please enter Gateway')
    })

    it('should be blocked by validation 2', async () => {
      render(<MockedComponent />)

      await userEvent.click(await screen.findByRole('switch', { name: 'Port Enabled' }))
      await userEvent.click(await screen.findByRole('tab', { name: 'Port2' }))
      const ipInput = await screen.findByRole('textbox', { name: 'IP Address' })
      await userEvent.clear(ipInput)
      await userEvent.type(ipInput, '1.2.3')
      const subnetInput = await screen.findByRole('textbox', { name: 'Subnet Mask' })
      await userEvent.clear(subnetInput)
      await userEvent.type(subnetInput, '2.2.2')
      await userEvent.click(await screen.findByRole('tab', { name: 'Port3' }))
      await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
      await screen.findByText('Please enter a valid IP address')
      await screen.findByText('Please enter a valid subnet mask')
    })

    it('Should validate whether gateway is in the subnet correctly', async () => {
      render(<MockedComponent />)

      const ipInput = await screen.findByRole('textbox', { name: 'IP Address' })
      await userEvent.clear(ipInput)
      await userEvent.type(ipInput, '10.10.10.10')

      const subnetInput = await screen.findByRole('textbox', { name: 'Subnet Mask' })
      await userEvent.clear(subnetInput)
      await userEvent.type(subnetInput, '255.255.255.0')

      const gatewayInput = await screen.findByRole('textbox', { name: 'Gateway' })

      // Enter gateway not in the same subnet
      await userEvent.clear(gatewayInput)
      await userEvent.type(gatewayInput, '10.10.11.10')
      await screen.findByText('Gateway must be in the same subnet as the IP address.')

      // Enter gateway in the same subnet
      await userEvent.clear(gatewayInput)
      await userEvent.type(gatewayInput, '10.10.10.11')
      expect(screen.queryByText('Gateway must be in the same subnet as the IP address.')).toBeNull()
    })

    it('Broadcast and IPs above 224.0.0.0 should be blocked', async () => {
      render(<MockedComponent />)

      const subnetInput = screen.getByRole('textbox', { name: 'Subnet Mask' })
      await userEvent.clear(subnetInput)
      await userEvent.type(subnetInput, '255.255.192.0')
      const ipInput = screen.getByRole('textbox', { name: 'IP Address' })

      // Multicast IP
      await userEvent.clear(ipInput)
      await userEvent.type(ipInput, '224.0.0.0')
      await screen.findByText('Please enter a valid IP address')

      // Broadcast IP
      await userEvent.clear(ipInput)
      await userEvent.type(ipInput, '192.168.63.255')
      await screen.findByText('Can not be a broadcast address')

      // Class-E IP
      await userEvent.clear(ipInput)
      await userEvent.type(ipInput, '240.0.0.0')
      await screen.findByText('Please enter a valid IP address')

      // Below multicast IP
      await userEvent.clear(ipInput)
      await userEvent.type(ipInput, '192.168.62.255')
      expect(screen.queryByText('Please enter a valid IP address')).toBeNull()
    })

    it('should be blocked by overlapped subnet check', async () => {
      render(<MockedComponent />)

      await userEvent.click(screen.getByRole('switch', { name: 'Port Enabled' }))
      await userEvent.click(screen.getByRole('tab', { name: 'Port2' }))
      const ipInput1 = screen.getByRole('textbox', { name: 'IP Address' })
      await userEvent.clear(ipInput1)
      await userEvent.type(ipInput1, '1.1.1.1')
      await userEvent.click(screen.getByRole('tab', { name: 'Port5' }))
      const ipInput2 = screen.getByRole('textbox', { name: 'IP Address' })
      await userEvent.clear(ipInput2)
      await userEvent.type(ipInput2, '1.1.1.1')
      await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
      await screen.findAllByText('The ports have overlapping subnets')
    })

    it('set port type to unconfigured', async () => {
      render(<MockedComponent />)

      await userEvent.click(screen.getByRole('tab', { name: 'Port5' }))
      const portEnabled = screen.getByRole('switch', { name: 'Port Enabled' })
      const portTypeSelect = screen.getByRole('combobox', { name: 'Port Type' })
      await userEvent.selectOptions(portTypeSelect,
        await screen.findByRole('option', { name: 'Select port type..' }))
      expect(portEnabled).not.toBeVisible()
    })

    it('set port type to LAN', async () => {
      render(<MockedComponent />)

      await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Port Type' }),
        await screen.findByRole('option', { name: 'LAN' }))
      screen.getByRole('textbox', { name: 'IP Address' })
      screen.getByRole('textbox', { name: 'Subnet Mask' })
    })

    it('set port type to WAN with ip mode STATIC', async () => {
      render(<MockedComponent />)

      await userEvent.click(screen.getByRole('tab', { name: 'Port2' }))
      const portTypeSelect = screen.getByRole('combobox', { name: 'Port Type' })
      await userEvent.selectOptions(portTypeSelect,
        await screen.findByRole('option', { name: 'WAN' }))
      const ipModeRadio = await screen.findByRole('radio', { name: 'Static/Manual' })
      await userEvent.click(ipModeRadio)
      await screen.findByRole('textbox', { name: 'IP Address' })
      screen.getByRole('textbox', { name: 'Subnet Mask' })
      screen.getByRole('textbox', { name: 'Gateway' })
    })

    it('change port type to LAN and undo the change', async () => {
      render(<MockedComponent />)

      const portTypeSelect = await screen.findByRole('combobox', { name: 'Port Type' })
      await userEvent.selectOptions(portTypeSelect,
        await screen.findByRole('option', { name: 'LAN' }))
      await userEvent.selectOptions(portTypeSelect,
        await screen.findByRole('option', { name: 'WAN' }))
      expect(await screen.findByRole('switch',
        { name: /Use NAT Service/ })).not.toBeChecked()
    })

    it('switch port tab', async () => {
      render(<MockedComponent />)

      await userEvent.click(await screen.findByRole('tab', { name: 'Port2' }))
      expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('local0')
      await userEvent.click(await screen.findByRole('tab', { name: 'Port3' }))
      expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('port1')
      await userEvent.click(await screen.findByRole('tab', { name: 'Port4' }))
      expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('tap0')
      await userEvent.click(await screen.findByRole('tab', { name: 'Port5' }))
      expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('port2')
    })

    it('should show no data string when ports data is empty', async () => {
      render(<Form initialValues={{}}>
        <EdgePortsGeneralBase {...mockedProps} />
      </Form>)
      expect(screen.queryAllByRole('tab').length).toBe(0)
    })

    it('should show IP is N/A and MAC empty when port status data is undefined', async () => {
      render(<Form initialValues={formPortConfigWithStatusIpWithoutCorePort}>
        <EdgePortsGeneralBase {...mockedProps} statusData={undefined} />
        <button data-testid='rc-submit'>Submit</button>
      </Form>)

      for (let i = 0; i < mockEdgePortConfig.ports.length; ++i) {
        await userEvent.click(await screen.findByRole('tab',
          { name: getEdgePortDisplayName(mockEdgePortConfig.ports[i]) }))
        const activePane = screen.getByRole('tabpanel', { hidden: false })
        await within(activePane).findByText('IP Address: N/A | MAC Address:')
      }
    })

    it('cannot set LAN core port while a valid WAN port exist', async () => {
      render(<MockedComponent />)

      await screen.findByText(/00:0c:29:b6:ad:04/i)
      await userEvent.click(await screen.findByRole('tab', { name: 'Port2' }))
      const corePortCheckbox = await screen.findByRole('checkbox',
        { name: /Use this port as Core Port/ })
      expect(corePortCheckbox).toBeDisabled()
      let gw = screen.queryByRole('textbox', { name: 'Gateway' })
      expect(gw).toBeNull()
    })

    it('should be able to use DHCP for LAN core port', async () => {
      render(<MockedComponent />)

      await screen.findByText(/00:0c:29:b6:ad:04/i)
      // disabled WAN port
      await userEvent.click(screen.getByRole('switch', { name: 'Port Enabled' }))

      await userEvent.click(screen.getByRole('tab', { name: 'Port2' }))
      const corePortCheckbox = await screen.findByRole('checkbox',
        { name: /Use this port as Core Port/ })
      expect(corePortCheckbox).not.toBeDisabled()
      expect(corePortCheckbox).not.toBeChecked()
      await userEvent.click(corePortCheckbox)
      await userEvent.click(await screen.findByRole('radio', { name: 'DHCP' }))
    })

    it('should be able to use DHCP for CLUSTER port type', async () => {
      render(<MockedComponent />)

      await screen.findByText(/00:0c:29:b6:ad:04/i)
      const portTypeSelect = await screen.findByRole('combobox', { name: 'Port Type' })
      await userEvent.selectOptions(portTypeSelect,
        await screen.findByRole('option', { name: 'Cluster' }))
      expect(await screen.findByRole('radio', { name: 'DHCP' })).toBeVisible()
    })

    it('should not be able to configure gateway for CLUSTER port type', async () => {
      render(<MockedComponent />)

      await screen.findByText(/00:0c:29:b6:ad:04/i)
      const portTypeSelect = await screen.findByRole('combobox', { name: 'Port Type' })
      await userEvent.selectOptions(portTypeSelect,
        await screen.findByRole('option', { name: 'Cluster' }))
      const staticIpMode = await screen.findByRole('radio', { name: 'Static/Manual' })
      expect(staticIpMode).toBeVisible()
      await userEvent.click(staticIpMode)
      await screen.findByRole('textbox', { name: 'IP Address' })
      expect(screen.queryByRole('textbox', { name: 'Gateway' })).toBeNull()
    })

    // eslint-disable-next-line max-len
    it('should clear gateway when it had been WAN port before but it is LAN port now.', async () => {
      render(<MockedComponent />)

      await screen.findByText(/00:0c:29:b6:ad:04/i)
      const gw = screen.queryByRole('textbox', { name: 'Gateway' })
      // change WAN into LAN
      await userEvent.selectOptions(await screen.findByRole('combobox', { name: 'Port Type' }),
        await screen.findByRole('option', { name: 'LAN' }))
      await waitFor(() => expect(gw).not.toBeVisible())
    })

    it('should disable portType dropdown when the interface set as a VRRP interface', async () => {
      render(<MockedComponent vipConfig={[{
        ports: [{
          serialNumber: 'serialNumber-1',
          portName: 'port2'
        }]
      }] as VirtualIpSetting[]} />)

      await userEvent.click(screen.getByRole('tab', { name: 'Port2' }))
      expect(await screen.findByRole('combobox', { name: 'Port Type' })).toBeDisabled()
    })

    describe('Core Access', () => {
      beforeEach(() => {
        // eslint-disable-next-line max-len
        jest.mocked(useIsEdgeFeatureReady).mockImplementation(ff => ff === Features.EDGE_CORE_ACCESS_SEPARATION_TOGGLE)
      })

      afterEach(() => {
        jest.mocked(useIsEdgeFeatureReady).mockReset()
      })

      it('should show core port and access port fields when FF is on', async () => {
        render(<MockedComponent />)

        await screen.findByText(/00:0c:29:b6:ad:04/i)
        // disabled WAN port
        await userEvent.click(screen.getByRole('switch', { name: 'Port Enabled' }))

        await userEvent.click(screen.getByRole('tab', { name: 'Port2' }))

        expect(screen.getByRole('checkbox', { name: 'Core port' })).toBeVisible()
        expect(screen.getByRole('checkbox', { name: 'Access port' })).toBeVisible()
      })
    })
  })
})

describe('EditEdge ports', () => {
  const MockedComponentTestSDLAN = ({ initVals, otherProps }:
    { initVals?: unknown, otherProps?:unknown })=> {

    return <Form initialValues={initVals ?? formEdgePortConfig}>
      <EdgePortsGeneralBase {...mockedProps} {...(otherProps ?? {})} />
      <button data-testid='rc-submit'>Submit</button>
    </Form>
  }

  beforeEach(() => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsEdgeFeatureReady).mockReturnValue(false)
  })

  afterEach(() => {
    jest.mocked(useIsEdgeFeatureReady).mockReset()
  })

  it('should correctly display core port info', async () => {
    render(<MockedComponentTestSDLAN />)

    // should be hidden when port type is WAN.
    await screen.findByText(/00:0c:29:b6:ad:04/i)
    expect(screen.queryByRole('checkbox', { name: /Use this port as Core Port/ })).toBeNull()

    await userEvent.click(await screen.findByRole('tab', { name: 'Port2' }))
    const port2CorePort = await screen.findByRole('checkbox',
      { name: /Use this port as Core Port/ })
    expect(port2CorePort).toBeChecked()
    // should be able to unset core port when WAN port exist.
    expect(port2CorePort).not.toBeDisabled()
    expect(await screen.findByRole('textbox', { name: 'Gateway' })).not.toBeDisabled()
  })

  it('should grey-out all LAN core port checkbox when SD-LAN is running and wll set', async () => {
    render(<MockedComponentTestSDLAN otherProps={{ isEdgeSdLanRun: true }} />)

    await userEvent.click(await screen.findByRole('tab', { name: 'Port2' }))
    const port2CorePort = await screen.findByRole('checkbox',
      { name: /Use this port as Core Port/ })
    expect(port2CorePort).toBeChecked()
    await waitFor(() => {
      expect(port2CorePort).toBeDisabled()
    })
    await screen.findByRole('textbox', { name: 'Gateway' })

    await userEvent.click(await screen.findByRole('tab', { name: 'Port3' }))
    const port3CorePort = await screen.findByRole('checkbox',
      { name: /Use this port as Core Port/ })
    expect(port3CorePort).not.toBeChecked()
    expect(port3CorePort).toBeDisabled()

    // should render LAN port gateway only when it is core port
    const port3GW = screen.queryByRole('textbox', { name: 'Gateway' })
    expect(port3GW).toBeNull()
  })

  // eslint-disable-next-line max-len
  it('should allow user config another core port when core port is missing from SD-LAN', async () => {
    const emptyCorePortConfig = _.cloneDeep(formEdgePortConfig)
    delete emptyCorePortConfig['port2']
    render(<MockedComponentTestSDLAN initVals={emptyCorePortConfig} />)

    // core port should be hidden when port type is WAN.
    await screen.findByText(/00:0c:29:b6:ad:04/i)
    expect(screen.queryByRole('checkbox', { name: /Use this port as Core Port/ })).toBeNull()

    await userEvent.click(await screen.findByRole('tab', { name: 'Port3' }))
    await screen.findByText(/00:0c:29:b6:ad:0e/i)
    let port2CorePort = await screen.findByRole('checkbox',
      { name: /Use this port as Core Port/ })
    expect(port2CorePort).not.toBeChecked()
    expect(port2CorePort).toBeDisabled()

    // disable WAN port
    await userEvent.click(await screen.findByRole('tab', { name: 'Port1' }))
    await userEvent.click(await screen.findByRole('switch', { name: 'Port Enabled' }))

    // make port 2 being core port
    await userEvent.click(await screen.findByRole('tab', { name: 'Port3' }))
    port2CorePort = await screen.findByRole('checkbox',
      { name: /Use this port as Core Port/ })
    expect(port2CorePort).not.toBeChecked()
    expect(port2CorePort).not.toBeDisabled()
    await userEvent.click(port2CorePort)
    await waitFor(() => expect(port2CorePort).toBeChecked())
  })

  it('port type WAN option shoud be correctly grey-out when core port enabled', async () => {
    render(<MockedComponentTestSDLAN />)

    await userEvent.click(await screen.findByRole('tab', { name: 'Port2' }))
    expect(await screen.findByRole('combobox', { name: 'Port Type' })).not.toBeDisabled()
    expect(await screen.findByRole('option', { name: 'WAN' })).toBeDisabled()
  })

  it('port type shoud NOT be grey-out when port is unconfigured', async () => {
    const mockEdgePortConfigPartialUnconfig = _.cloneDeep(formEdgePortConfig)
    mockEdgePortConfigPartialUnconfig['port5'][0].portType = EdgePortTypeEnum.UNCONFIGURED
    render(<MockedComponentTestSDLAN initVals={mockEdgePortConfigPartialUnconfig}/>)

    await userEvent.click(await screen.findByRole('tab', { name: 'Port5' }))
    expect(await screen.findByRole('combobox', { name: 'Port Type' })).not.toBeDisabled()
  })

  it('should clear gateway after core port unselected', async () => {
    render(<MockedComponentTestSDLAN />)

    await screen.findByText(/00:0c:29:b6:ad:04/i)
    // disabled WAN port
    await userEvent.click(await screen.findByRole('switch', { name: 'Port Enabled' }))

    await userEvent.click(await screen.findByRole('tab', { name: 'Port2' }))
    const port2CorePort = await screen.findByRole('checkbox',
      { name: /Use this port as Core Port/ })
    const gw = await screen.findByRole('textbox', { name: 'Gateway' })
    expect(gw).not.toBeDisabled()

    // unselect core port
    await userEvent.click(port2CorePort)
    expect(port2CorePort).not.toBeChecked()
    await waitFor(() => expect(gw).not.toBeVisible())
  })

  it('should forbid WAN port changed into enable when LAN core port exist', async () => {
    render(<MockedComponentTestSDLAN
      initVals={formPortConfigWithStatusIpWithoutCorePort}
    />)

    await screen.findByText(/00:0c:29:b6:ad:04/i)
    // disabled WAN port
    await userEvent.click(await screen.findByRole('switch', { name: 'Port Enabled' }))

    // select port2 as core port
    await userEvent.click(await screen.findByRole('tab', { name: 'Port2' }))
    const port2CorePort = await screen.findByRole('checkbox',
      { name: /Use this port as Core Port/ })
    expect(port2CorePort).not.toBeDisabled()
    await userEvent.click(port2CorePort)
    let gw = await screen.findByRole('textbox', { name: 'Gateway' })
    expect(gw).not.toBeDisabled()
    expect(gw).toHaveAttribute('value', '')
    await userEvent.type(gw, '2.2.2.2')

    // try to enable WAN port again
    await userEvent.click(await screen.findByRole('tab', { name: 'Port1' }))
    expect(await screen.findByRole('switch', { name: 'Port Enabled' })).toBeDisabled()
  })
})