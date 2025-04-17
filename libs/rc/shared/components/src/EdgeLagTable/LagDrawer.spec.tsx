import userEvent from '@testing-library/user-event'
import _         from 'lodash'

import { Features }                                                                                                                                                                 from '@acx-ui/feature-toggle'
import { EdgeIpModeEnum, EdgeLag, EdgeLagFixtures, EdgeLagLacpModeEnum, EdgeLagTimeoutEnum, EdgeLagTypeEnum, EdgePort, EdgePortConfigFixtures, EdgePortTypeEnum, VirtualIpSetting } from '@acx-ui/rc/utils'
import { Provider }                                                                                                                                                                 from '@acx-ui/store'
import {
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'


import { useIsEdgeFeatureReady } from '../useEdgeActions'

import { LagDrawer } from './LagDrawer'

const { mockEdgePortConfig } = EdgePortConfigFixtures
const { mockedEdgeLagList } = EdgeLagFixtures
const { click } = userEvent
const mockEdgeCorePortPortConfig = _.cloneDeep(mockEdgePortConfig.ports)
mockEdgeCorePortPortConfig.splice(0, 1)

type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  value: string,
  options?: Array<{ label: string, value: unknown }>
  loading?: boolean
  dropdownClassName?: string
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ loading, children, onChange, value, options,
    dropdownClassName, ...props }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)} value={value}>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      {children ? <><option value={undefined}></option>{children}</> : null}
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

jest.mock('../EdgeSdLan/useEdgeSdLanActions', () => ({
  ...jest.requireActual('../EdgeSdLan/useEdgeSdLanActions'),
  useGetEdgeSdLanByEdgeOrClusterId: () => ({
    edgeSdLanData: undefined
  })
}))
jest.mock('../useEdgeActions', () => ({
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

describe('Edge LAG table drawer', () => {
  it('should correctly render', async () => {
    render(
      <Provider>
        <LagDrawer
          clusterId='test-cluster'
          serialNumber='test-edge'
          visible={true}
          setVisible={() => {}}
          data={mockedEdgeLagList.content[0] as EdgeLag}
          portList={mockEdgeCorePortPortConfig as EdgePort[]}
          existedLagList={mockedEdgeLagList.content as EdgeLag[]}
          onAdd={async () => {}}
          onEdit={async () => {}}
        />
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    await checkLoaded()
  })

  it('should correctly reset core port enabled when the core port member unselected', async () => {
    render(
      <Provider>
        <LagDrawer
          clusterId='test-cluster'
          serialNumber='test-edge'
          visible={true}
          setVisible={() => {}}
          portList={mockEdgeCorePortPortConfig as EdgePort[]}
          onAdd={async () => {}}
          onEdit={async () => {}}
        />
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    await screen.findByText('Add LAG')
    // eslint-disable-next-line max-len
    const corePortEnabled = await screen.findByRole('checkbox', { name: /Use this LAG as Core LAG/ })
    expect(corePortEnabled).toBeDisabled()
    const port2 = screen.getByRole('checkbox', { name: 'Port2' })
    await click(port2)
    expect(corePortEnabled).not.toBeDisabled()
    // enable core port
    await click(corePortEnabled)
    expect(corePortEnabled).toBeChecked()

    // remove unselect memebers
    await click(port2)
    expect(corePortEnabled).not.toBeChecked()
    expect(corePortEnabled).toBeDisabled()
  })

  it('should close when clicking cancel button', async () => {
    const setVisibleSpy = jest.fn()
    render(
      <Provider>
        <LagDrawer
          clusterId='test-cluster'
          serialNumber='test-edge'
          visible={true}
          setVisible={setVisibleSpy}
          portList={mockEdgeCorePortPortConfig as EdgePort[]}
          onAdd={async () => {}}
          onEdit={async () => {}}
        />
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(setVisibleSpy).toHaveBeenCalledWith(false)
  })

  it('should submit successfully', async () => {
    const setVisibleSpy = jest.fn()
    const onAddSpy = jest.fn()
    render(
      <Provider>
        <LagDrawer
          clusterId='test-cluster'
          serialNumber='test-edge'
          visible={true}
          setVisible={setVisibleSpy}
          portList={mockEdgeCorePortPortConfig as EdgePort[]}
          onAdd={onAddSpy}
          onEdit={async () => {}}
        />
      </Provider>, { route: { params: { tenantId: 't-id' } } })
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: '' }),
      '0'
    )
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Port Type' }),
      'LAN'
    )
    await userEvent.type(
      screen.getByRole('textbox', { name: 'IP Address' }),
      '1.2.3.4'
    )
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Subnet Mask' }),
      '255.255.255.0'
    )
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(onAddSpy).toHaveBeenCalledWith(
      'test-edge',
      {
        corePortEnabled: false,
        id: '0',
        ip: '1.2.3.4',
        ipMode: EdgeIpModeEnum.STATIC,
        lacpMode: EdgeLagLacpModeEnum.ACTIVE,
        lacpTimeout: EdgeLagTimeoutEnum.SHORT,
        lagEnabled: true,
        lagMembers: [],
        lagType: EdgeLagTypeEnum.LACP,
        natEnabled: false,
        portType: EdgePortTypeEnum.LAN,
        subnet: '255.255.255.0'
      })
    expect(setVisibleSpy).toHaveBeenCalledWith(false)
  })

  it('should edit successfully', async () => {
    const setVisibleSpy = jest.fn()
    const onEditSpy = jest.fn()
    render(
      <Provider>
        <LagDrawer
          clusterId='test-cluster'
          serialNumber='test-edge'
          visible={true}
          data={mockedEdgeLagList.content[1]}
          setVisible={setVisibleSpy}
          portList={mockEdgeCorePortPortConfig as EdgePort[]}
          onAdd={async () => {}}
          onEdit={onEditSpy}
        />
      </Provider>, { route: { params: { tenantId: 't-id' } } })
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(onEditSpy).toHaveBeenCalledWith('test-edge',
      {
        ...mockedEdgeLagList.content[1],
        gateway: '',
        natEnabled: false
      })
    expect(setVisibleSpy).toHaveBeenCalledWith(false)
  })

  it('should pop up warning when disabling lag', async () => {
    const setVisibleSpy = jest.fn()
    const onEditSpy = jest.fn()
    render(
      <Provider>
        <LagDrawer
          clusterId='test-cluster'
          serialNumber='test-edge'
          visible={true}
          data={mockedEdgeLagList.content[1]}
          setVisible={setVisibleSpy}
          portList={mockEdgeCorePortPortConfig as EdgePort[]}
          onAdd={async () => {}}
          onEdit={onEditSpy}
        />
      </Provider>, { route: { params: { tenantId: 't-id' } } })
    await userEvent.click(screen.getByRole('switch', { name: 'LAG Enabled LAG Enabled' }))
    await waitFor(() => expect(screen.getAllByRole('dialog').length).toBe(2))
    const warningDialog = screen.getAllByRole('dialog')[1]
    expect(within(warningDialog).getByText('Warning')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(warningDialog).toHaveTextContent('Modify this options may cause the Edge lost connection')
    await userEvent.click(within(warningDialog).getByRole('button', { name: 'Disable' }))
    await waitFor(() => expect(warningDialog).not.toBeVisible())
  })

  it('should disable portType dropdown when the interface set as a VRRP interface', async () => {
    const setVisibleSpy = jest.fn()
    const onEditSpy = jest.fn()
    render(
      <Provider>
        <LagDrawer
          clusterId='test-cluster'
          serialNumber='test-edge'
          visible={true}
          data={mockedEdgeLagList.content[1]}
          setVisible={setVisibleSpy}
          portList={mockEdgeCorePortPortConfig as EdgePort[]}
          vipConfig={[{
            ports: [{
              serialNumber: 'test-edge',
              portName: 'lag2'
            }]
          }] as VirtualIpSetting[]}
          onAdd={async () => {}}
          onEdit={onEditSpy}
        />
      </Provider>, { route: { params: { tenantId: 't-id' } } })
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Port Type' })).toBeDisabled()
    )
  })

  it('different speed port should be disable when an port checked', async () => {
    const mockEdgeLag = _.cloneDeep(mockedEdgeLagList.content[0])
    mockEdgeLag.lagMembers = []
    const mockEdgePortConfigDifferentMaxSpeed = _.cloneDeep(mockEdgePortConfig.ports)
    mockEdgePortConfigDifferentMaxSpeed[0].maxSpeedCapa = 100.111
    mockEdgePortConfigDifferentMaxSpeed[1].maxSpeedCapa = 222.222
    render(
      <Provider>
        <LagDrawer
          clusterId='test-cluster'
          serialNumber='test-edge'
          visible={true}
          setVisible={() => {}}
          data={mockEdgeLag as EdgeLag}
          portList={mockEdgePortConfigDifferentMaxSpeed as EdgePort[]}
          existedLagList={[]}
          onAdd={async () => {}}
          onEdit={async () => {}}
        />
      </Provider>, { route: { params: { tenantId: 't-id' } } })
    const portCheckboxes = screen.getAllByRole('checkbox', { name: /Port/i })
    expect(portCheckboxes)
      .toHaveLength(mockEdgePortConfigDifferentMaxSpeed.length)
    let ifName = mockEdgePortConfigDifferentMaxSpeed[0].interfaceName
    let portName = ifName.charAt(0).toUpperCase() + ifName.slice(1)
    let portCheckBox = screen.getAllByRole('checkbox', { name: portName })[0]
    await userEvent.click(portCheckBox)
    expect(portCheckBox).toBeEnabled()

    ifName = mockEdgePortConfigDifferentMaxSpeed[1].interfaceName
    portName = ifName.charAt(0).toUpperCase() + ifName.slice(1)
    portCheckBox = screen.getAllByRole('checkbox', { name: portName })[0]
    expect(portCheckBox).toBeDisabled()

    ifName = mockEdgePortConfigDifferentMaxSpeed[2].interfaceName
    portName = ifName.charAt(0).toUpperCase() + ifName.slice(1)
    portCheckBox = screen.getAllByRole('checkbox', { name: portName })[0]
    expect(portCheckBox).toBeDisabled()

    ifName = mockEdgePortConfigDifferentMaxSpeed[3].interfaceName
    portName = ifName.charAt(0).toUpperCase() + ifName.slice(1)
    portCheckBox = screen.getAllByRole('checkbox', { name: portName })[0]
    expect(portCheckBox).toBeDisabled()
  })

  it('should be able to change 2 physical WAN to physical WAN + LAG WAN', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsEdgeFeatureReady).mockImplementation(ff => ff === Features.EDGE_DUAL_WAN_TOGGLE)

    const mock2WanPorts = _.cloneDeep(mockEdgePortConfig.ports)
    mock2WanPorts[0].portType = EdgePortTypeEnum.WAN

    const setVisibleSpy = jest.fn()
    const onAddSpy = jest.fn()
    render(
      <Provider>
        <LagDrawer
          clusterId='test-cluster'
          serialNumber='test-edge'
          visible={true}
          setVisible={setVisibleSpy}
          portList={mock2WanPorts as EdgePort[]}
          onAdd={onAddSpy}
          onEdit={async () => {}}
        />
      </Provider>, { route: { params: { tenantId: 't-id' } } })
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: '' }),
      '1'
    )
    await userEvent.click(screen.getByRole('checkbox', { name: 'Port2' }))
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Port Type' }),
      'WAN'
    )
    await userEvent.click(await screen.findByRole('radio', { name: 'Static/Manual' }))
    await userEvent.type(
      screen.getByRole('textbox', { name: 'IP Address' }),
      '10.12.3.4'
    )
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Subnet Mask' }),
      '255.255.255.0'
    )
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Gateway' }),
      '10.12.3.127'
    )

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await screen.findByText('Existing Port Configuration Clean-up')
    await userEvent.click(screen.getByRole('button', { name: 'Replace with LAG settings' }))
    expect(onAddSpy).toHaveBeenCalledWith(
      'test-edge',
      {
        corePortEnabled: false,
        id: '1',
        ip: '10.12.3.4',
        gateway: '10.12.3.127',
        ipMode: EdgeIpModeEnum.STATIC,
        lacpMode: EdgeLagLacpModeEnum.ACTIVE,
        lacpTimeout: EdgeLagTimeoutEnum.SHORT,
        lagEnabled: true,
        lagMembers: [{
          portId: mock2WanPorts[1].id,
          portEnabled: true
        }],
        lagType: EdgeLagTypeEnum.LACP,
        natEnabled: false,
        portType: EdgePortTypeEnum.WAN,
        subnet: '255.255.255.0'
      })
    expect(setVisibleSpy).toHaveBeenCalledWith(false)
  })

  // eslint-disable-next-line max-len
  it('should be able to add LAN Lag when there is already a core port configured', async () => {
    const setVisibleSpy = jest.fn()
    const onAddSpy = jest.fn()

    render(
      <Provider>
        <LagDrawer
          clusterId='test-cluster'
          serialNumber='test-edge'
          visible={true}
          setVisible={setVisibleSpy}
          portList={mockEdgeCorePortPortConfig as EdgePort[]}
          onAdd={onAddSpy}
          onEdit={async () => {}}
        />
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    await screen.findByText('Add LAG')
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: '' }),
      '2'
    )
    // eslint-disable-next-line max-len
    const corePortEnabled = await screen.findByRole('checkbox', { name: /Use this LAG as Core LAG/ })
    const port3 = screen.getByRole('checkbox', { name: 'Port3' })
    await click(port3)
    expect(corePortEnabled).toBeDisabled()

    await userEvent.type(
      screen.getByRole('textbox', { name: 'IP Address' }),
      '12.12.12.11'
    )
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Subnet Mask' }),
      '255.255.255.0'
    )

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    await screen.findByText('Existing Port Configuration Clean-up')
    await userEvent.click(screen.getByRole('button', { name: 'Replace with LAG settings' }))
    expect(onAddSpy).toHaveBeenCalledWith(
      'test-edge',
      {
        corePortEnabled: false,
        id: '2',
        ip: '12.12.12.11',
        ipMode: EdgeIpModeEnum.STATIC,
        lacpMode: EdgeLagLacpModeEnum.ACTIVE,
        lacpTimeout: EdgeLagTimeoutEnum.SHORT,
        lagEnabled: true,
        lagMembers: [{
          portId: mockEdgeCorePortPortConfig[1].id,
          portEnabled: true
        }],
        lagType: EdgeLagTypeEnum.LACP,
        natEnabled: false,
        portType: EdgePortTypeEnum.LAN,
        subnet: '255.255.255.0'
      })
    expect(setVisibleSpy).toHaveBeenCalledWith(false)
  })
})

const checkLoaded = async (): Promise<void> => {
  await screen.findByText('Edit LAG')
  const portTypeSelect = screen.getByRole('combobox', { name: 'Port Type' })
  const wanPortType = await screen.findByRole('option', { name: 'WAN' })
  expect(wanPortType).toBeDisabled()
  expect(portTypeSelect).toHaveValue('WAN')
  const dhcp = await screen.findByRole('radio', { name: 'DHCP' })
  expect(dhcp).toBeChecked()
}