import userEvent from '@testing-library/user-event'
import _         from 'lodash'
import { rest }  from 'msw'

import { useIsSplitOn }                                                                                                                     from '@acx-ui/feature-toggle'
import { EdgeIpModeEnum, EdgePortConfigFixtures, EdgePortTypeEnum, EdgeSdLanFixtures, EdgeSdLanUrls, EdgeUrlsInfo, getEdgePortDisplayName } from '@acx-ui/rc/utils'
import { Provider }                                                                                                                         from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { EdgePortTabEnum } from '../PortsForm'

import { EdgePortsGeneral } from './'

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

const {
  mockEdgePortConfigWithStatusIp,
  mockEdgeOnlyLanPortConfig,
  mockEdgePortConfigWithStatusIpWithoutCorePort,
  mockEdgePortConfig
} = EdgePortConfigFixtures
const { mockedCorePortLostEdgeSdLanDataList, mockedSdLanDataList } = EdgeSdLanFixtures

describe('EditEdge ports - ports general and SD-LAN off', () => {
  let params: { tenantId: string, serialNumber: string, activeTab?: string, activeSubTab?: string }
  const mockedUpdateReq = jest.fn()
  const mockedGetSdLanReq = jest.fn()

  beforeEach(() => {
    // SD-LAN flag is off
    jest.mocked(useIsSplitOn).mockReturnValue(false)
  })

  describe('WAN port exist and no core port configured', () => {
    beforeEach(() => {
      params = {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
        serialNumber: '000000000000',
        activeTab: 'ports',
        activeSubTab: EdgePortTabEnum.PORTS_GENERAL
      }
      mockedUpdateReq.mockClear()
      mockedGetSdLanReq.mockClear()

      mockServer.use(
        rest.patch(
          EdgeUrlsInfo.updatePortConfig.url,
          (req, res, ctx) => {
            mockedUpdateReq(req.body)
            return res(ctx.status(202))
          }
        ),
        rest.post(
          EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
          (_, res, ctx) => {
            mockedGetSdLanReq()
            return res(ctx.status(202))
          }
        )
      )
    })

    it ('IP status on each port tab should be displayed correctly', async () => {
      render(
        <Provider>
          <EdgePortsGeneral data={mockEdgePortConfigWithStatusIpWithoutCorePort.ports} />
        </Provider>, {
          route: {
            params,
            path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
          }
        })

      for (let i = 0; i < mockEdgePortConfig.ports.length; ++i) {
        await userEvent.click(await screen.findByRole('tab',
          { name: getEdgePortDisplayName(mockEdgePortConfig.ports[i]) }))
        const expectedIp = mockEdgePortConfigWithStatusIpWithoutCorePort.ports[i]?.statusIp || 'N/A'
        await screen.findByText(
          'IP Address: ' + expectedIp + ' | ' +
            'MAC Address: ' + mockEdgePortConfig.ports[i].mac)

      }
    })

    it('should update successfully', async () => {
      const user = userEvent.setup()
      render(
        <Provider>
          <EdgePortsGeneral data={mockEdgePortConfigWithStatusIpWithoutCorePort.ports} />
        </Provider>, {
          route: {
            params,
            path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
          }
        })

      const ipInput = await screen.findByRole('textbox', { name: 'IP Address' })
      await userEvent.clear(ipInput)
      await userEvent.type(ipInput, '1.1.1.1')
      const subnetInput = await screen.findByRole('textbox', { name: 'Subnet Mask' })
      await userEvent.clear(subnetInput)
      await userEvent.type(subnetInput, '255.255.255.0')
      const gatewayInput = await screen.findByRole('textbox', { name: 'Gateway' })
      await userEvent.clear(gatewayInput)
      await userEvent.type(gatewayInput, '1.1.1.1')
      expect(mockedGetSdLanReq).not.toBeCalled()
      await user.click(await screen.findByRole('button', { name: 'Apply Ports General' }))

      const expectedResult = _.cloneDeep(mockEdgePortConfigWithStatusIpWithoutCorePort)
      expectedResult.ports[0].ip = '1.1.1.1'
      expectedResult.ports[0].subnet = '255.255.255.0'
      expectedResult.ports[0].gateway = '1.1.1.1'
      expectedResult.ports[4].natEnabled = false
      await waitFor(() => expect(mockedUpdateReq).toBeCalledWith(expectedResult))
    })

    // it('should active ports general successfully', async () => {
    //   render(
    //     <Provider>
    //       <EdgeEditContext.Provider
    //         value={defaultContextData}
    //       >
    //         <PortsGeneral data={mockEdgePortConfigWithStatusIp.ports} />
    //       </EdgeEditContext.Provider>
    //     </Provider>, {
    //       route: {
    //         params,
    //         path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
    //       }
    //     })
    //   await screen.findByRole('radio', { name: 'Port 1' })
    //   screen.getByRole('radio', { name: 'Port 2' })
    //   screen.getByRole('radio', { name: 'Port 3' })
    //   screen.getByRole('radio', { name: 'Port 4' })
    //   screen.getByRole('radio', { name: 'Port 5' })
    // })

    it('should be blocked by validation 1', async () => {
      const user = userEvent.setup()
      render(
        <Provider>
          <EdgePortsGeneral data={mockEdgePortConfigWithStatusIpWithoutCorePort.ports} />
        </Provider>, {
          route: {
            params,
            path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
          }
        })
      const ipInput = await screen.findByRole('textbox', { name: 'IP Address' })
      await userEvent.clear(ipInput)
      const subnetInput = await screen.findByRole('textbox', { name: 'Subnet Mask' })
      await userEvent.clear(subnetInput)
      const gatewayInput = await screen.findByRole('textbox', { name: 'Gateway' })
      await userEvent.clear(gatewayInput)
      await user.click(await screen.findByRole('button', { name: 'Apply Ports General' }))
      await screen.findByText('Please enter IP Address')
      await screen.findByText('Please enter Subnet Mask')
      await screen.findByText('Please enter Gateway')
    })

    it('should be blocked by validation 2', async () => {
      const user = userEvent.setup()
      render(
        <Provider>
          <EdgePortsGeneral data={mockEdgePortConfigWithStatusIpWithoutCorePort.ports} />
        </Provider>, {
          route: {
            params,
            path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
          }
        })
      await user.click(await screen.findByRole('switch', { name: 'Port Enabled' }))
      await user.click(await screen.findByRole('tab', { name: 'Port2' }))
      const ipInput = await screen.findByRole('textbox', { name: 'IP Address' })
      await userEvent.clear(ipInput)
      await userEvent.type(ipInput, '1.2.3')
      const subnetInput = await screen.findByRole('textbox', { name: 'Subnet Mask' })
      await userEvent.clear(subnetInput)
      await userEvent.type(subnetInput, '2.2.2')
      await user.click(await screen.findByRole('tab', { name: 'Port3' }))
      await user.click(await screen.findByRole('button', { name: 'Apply Ports General' }))
      await screen.findByText('Please enter a valid IP address')
      await screen.findByText('Please enter a valid subnet mask')
    })

    it('Broadcast and IPs above 224.0.0.0 should be blocked', async () => {
      render(
        <Provider>
          <EdgePortsGeneral data={mockEdgePortConfigWithStatusIpWithoutCorePort.ports} />
        </Provider>, {
          route: {
            params,
            path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
          }
        })

      const subnetInput = await screen.findByRole('textbox', { name: 'Subnet Mask' })
      await userEvent.clear(subnetInput)
      await userEvent.type(subnetInput, '255.255.192.0')
      const ipInput = await screen.findByRole('textbox', { name: 'IP Address' })

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
      const user = userEvent.setup()
      render(
        <Provider>
          <EdgePortsGeneral data={mockEdgePortConfigWithStatusIpWithoutCorePort.ports} />
        </Provider>, {
          route: {
            params,
            path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
          }
        })

      await user.click(await screen.findByRole('switch', { name: 'Port Enabled' }))
      await user.click(await screen.findByRole('tab', { name: 'Port2' }))
      const ipInput1 = await screen.findByRole('textbox', { name: 'IP Address' })
      await userEvent.clear(ipInput1)
      await userEvent.type(ipInput1, '1.1.1.1')
      await user.click(await screen.findByRole('tab', { name: 'Port5' }))
      const ipInput2 = await screen.findByRole('textbox', { name: 'IP Address' })
      await userEvent.clear(ipInput2)
      await userEvent.type(ipInput2, '1.1.1.1')
      await user.click(await screen.findByRole('button', { name: 'Apply Ports General' }))
      await screen.findAllByText('The ports have overlapping subnets')
    })

    it('set port type to unconfigured', async () => {
      const user = userEvent.setup()
      render(
        <Provider>
          <EdgePortsGeneral data={mockEdgePortConfigWithStatusIpWithoutCorePort.ports} />
        </Provider>, {
          route: {
            params,
            path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
          }
        })

      await user.click(await screen.findByRole('tab', { name: 'Port5' }))
      const portEnabled = await screen.findByRole('switch', { name: 'Port Enabled' })
      const portTypeSelect = await screen.findByRole('combobox', { name: 'Port Type' })
      await userEvent.selectOptions(portTypeSelect,
        await screen.findByRole('option', { name: 'Select port type..' }))
      expect(portEnabled).not.toBeVisible()
    })

    it('set port type to LAN', async () => {
      const user = userEvent.setup()
      render(
        <Provider>
          <EdgePortsGeneral data={mockEdgePortConfigWithStatusIpWithoutCorePort.ports} />
        </Provider>, {
          route: {
            params,
            path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
          }
        })

      await user.selectOptions(await screen.findByRole('combobox', { name: 'Port Type' }),
        await screen.findByRole('option', { name: 'LAN' }))
      await screen.findByRole('textbox', { name: 'IP Address' })
      screen.getByRole('textbox', { name: 'Subnet Mask' })
    })

    it('set port type to WAN with ip mode STATIC', async () => {
      const user = userEvent.setup()
      render(
        <Provider>
          <EdgePortsGeneral data={mockEdgePortConfigWithStatusIpWithoutCorePort.ports} />
        </Provider>, {
          route: {
            params,
            path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
          }
        })

      await user.click(await screen.findByRole('tab', { name: 'Port2' }))
      const portTypeSelect = await screen.findByRole('combobox', { name: 'Port Type' })
      await user.selectOptions(portTypeSelect,
        await screen.findByRole('option', { name: 'WAN' }))
      const ipModeRadio = await screen.findByRole('radio', { name: 'Static/Manual' })
      await user.click(ipModeRadio)
      await screen.findByRole('textbox', { name: 'IP Address' })
      screen.getByRole('textbox', { name: 'Subnet Mask' })
      screen.getByRole('textbox', { name: 'Gateway' })
    })

    it('change port type to LAN and undo the change', async () => {
      const user = userEvent.setup()
      render(
        <Provider>
          <EdgePortsGeneral data={mockEdgePortConfigWithStatusIpWithoutCorePort.ports} />
        </Provider>, {
          route: {
            params,
            path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
          }
        })

      const portTypeSelect = await screen.findByRole('combobox', { name: 'Port Type' })
      await user.selectOptions(portTypeSelect,
        await screen.findByRole('option', { name: 'LAN' }))
      await user.selectOptions(portTypeSelect,
        await screen.findByRole('option', { name: 'WAN' }))
      expect(await screen.findByRole('switch',
        { name: /Use NAT Service/ })).not.toBeChecked()
    })

    it('switch port tab', async () => {
      const user = userEvent.setup()
      render(
        <Provider>
          <EdgePortsGeneral data={mockEdgePortConfigWithStatusIpWithoutCorePort.ports} />
        </Provider>, {
          route: {
            params,
            path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
          }
        })

      await user.click(await screen.findByRole('tab', { name: 'Port2' }))
      expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('local0')
      await user.click(await screen.findByRole('tab', { name: 'Port3' }))
      expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('port1')
      await user.click(await screen.findByRole('tab', { name: 'Port4' }))
      expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('tap0')
      await user.click(await screen.findByRole('tab', { name: 'Port5' }))
      expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('port2')
    })

    it('should show no data string when ports data is empty', async () => {
      render(
        <Provider>
          <EdgePortsGeneral data={[]} />
        </Provider>, {
          route: {
            params,
            path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
          }
        })

      expect(screen.getByText('No data to display')).toBeVisible()
    })

    it('cannot set LAN core port while a valid WAN port exist', async () => {
      render(
        <Provider>
          <EdgePortsGeneral data={mockEdgePortConfigWithStatusIpWithoutCorePort.ports} />
        </Provider>, {
          route: {
            params,
            path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
          }
        })

      await screen.findByText(/00:0c:29:b6:ad:04/i)

      await userEvent.click(await screen.findByRole('tab', { name: 'Port2' }))
      const corePortCheckbox = await screen.findByRole('checkbox',
        { name: /Use this port as Core Port/ })
      expect(corePortCheckbox).toBeDisabled()
      let gw = screen.queryByRole('textbox', { name: 'Gateway' })
      expect(gw).toBeNull()
    })

    it('should be able to use DHCP for LAN core port', async () => {
      render(
        <Provider>
          <EdgePortsGeneral data={mockEdgePortConfigWithStatusIpWithoutCorePort.ports} />
        </Provider>, {
          route: {
            params,
            path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
          }
        })

      await screen.findByText(/00:0c:29:b6:ad:04/i)
      // disabled WAN port
      await userEvent.click(await screen.findByRole('switch', { name: 'Port Enabled' }))

      await userEvent.click(await screen.findByRole('tab', { name: 'Port2' }))
      const corePortCheckbox = await screen.findByRole('checkbox',
        { name: /Use this port as Core Port/ })
      expect(corePortCheckbox).not.toBeDisabled()
      expect(corePortCheckbox).not.toBeChecked()
      await userEvent.click(corePortCheckbox)
      await userEvent.click(await screen.findByRole('radio', { name: 'DHCP' }))

      await userEvent.click(await screen.findByRole('button', { name: 'Apply Ports General' }))
      const expectedResult = _.cloneDeep(mockEdgePortConfigWithStatusIpWithoutCorePort)
      expectedResult.ports[0].enabled = false
      expectedResult.ports[1].corePortEnabled = true
      expectedResult.ports[1].ipMode = EdgeIpModeEnum.DHCP
      expectedResult.ports[4].natEnabled = false
      await waitFor(() => expect(mockedUpdateReq).toBeCalledWith(expectedResult))
    })

    // eslint-disable-next-line max-len
    it('should clear gateway when it had been WAN port before but it is LAN port now.', async () => {
      render(
        <Provider>
          <EdgePortsGeneral data={mockEdgePortConfigWithStatusIpWithoutCorePort.ports} />
        </Provider>, {
          route: {
            params,
            path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
          }
        })

      await screen.findByText(/00:0c:29:b6:ad:04/i)
      const gw = screen.queryByRole('textbox', { name: 'Gateway' })
      // change WAN into LAN
      await userEvent.selectOptions(await screen.findByRole('combobox', { name: 'Port Type' }),
        await screen.findByRole('option', { name: 'LAN' }))
      await waitFor(() => expect(gw).not.toBeVisible())

      await userEvent.click(await screen.findByRole('button', { name: 'Apply Ports General' }))
      const expectedResult = _.cloneDeep(mockEdgePortConfigWithStatusIpWithoutCorePort)
      expectedResult.ports[0].portType = EdgePortTypeEnum.LAN
      expectedResult.ports[0].gateway = ''
      expectedResult.ports[4].natEnabled = false
      await waitFor(() => expect(mockedUpdateReq).toBeCalledWith(expectedResult))
    })
  })

  describe('EditEdge ports - ports general api fail', () => {
    const consoleLogFn = jest.fn()
    jest.spyOn(console, 'log').mockImplementationOnce(consoleLogFn)

    beforeEach(() => {
      params = {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
        serialNumber: '000000000000',
        activeTab: 'ports',
        activeSubTab: EdgePortTabEnum.PORTS_GENERAL
      }

      mockServer.use(
        rest.patch(
          EdgeUrlsInfo.updatePortConfig.url,
          (req, res, ctx) => res(ctx.status(500))
        )
      )
    })

    it('should update failed', async () => {
      const user = userEvent.setup()
      render(
        <Provider>
          <EdgePortsGeneral data={mockEdgePortConfigWithStatusIpWithoutCorePort.ports} />
        </Provider>, {
          route: {
            params,
            path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
          }
        })
      const ipInput = await screen.findByRole('textbox', { name: 'IP Address' })
      await userEvent.clear(ipInput)
      await userEvent.type(ipInput, '1.1.1.1')
      const subnetInput = await screen.findByRole('textbox', { name: 'Subnet Mask' })
      await userEvent.clear(subnetInput)
      await userEvent.type(subnetInput, '255.255.255.0')
      const gatewayInput = await screen.findByRole('textbox', { name: 'Gateway' })
      await userEvent.clear(gatewayInput)
      await userEvent.type(gatewayInput, '1.1.1.1')
      await user.click(await screen.findByRole('button', { name: 'Apply Ports General' }))
      await waitFor(() => expect(consoleLogFn).toBeCalled())
    })
  })
})

describe('EditEdge ports - SD-LAN ready', () => {
  let params: { tenantId: string, serialNumber: string, activeTab?: string, activeSubTab?: string }
  const mockedGetSdLanReq = jest.fn()
  const mockedUpdateReq = jest.fn()

  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000',
      activeTab: 'ports',
      activeSubTab: EdgePortTabEnum.PORTS_GENERAL
    }

    jest.mocked(useIsSplitOn).mockReturnValue(true)

    mockServer.use(
      rest.patch(
        EdgeUrlsInfo.updatePortConfig.url,
        (req, res, ctx) => {
          mockedUpdateReq(req.body)
          return res(ctx.status(202))
        }
      ),
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => {
          mockedGetSdLanReq()
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should correctly display core port info', async () => {
    render(
      <Provider>
        <EdgePortsGeneral data={mockEdgePortConfigWithStatusIp.ports} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })

    await waitFor(() => {
      expect(mockedGetSdLanReq).toBeCalled()
    })

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

  it('should gateway still being to its origin data', async () => {
    render(
      <Provider>
        <EdgePortsGeneral data={mockEdgeOnlyLanPortConfig.ports} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })

    await screen.findByText(/00:00:00:00:00:00/i)
    let gw = await screen.findByRole('textbox', { name: 'Gateway' })
    expect(gw).toHaveValue('2.2.2.2')
    expect(gw).not.toBeDisabled()

    // unselect port 1
    const corePortCheckbox = await screen.findByRole('checkbox',
      { name: /Use this port as Core Port/ })
    await userEvent.click(corePortCheckbox)
    expect(screen.queryByRole('textbox', { name: 'Gateway' })).toBeNull()

    // select port 1 as core port again
    await userEvent.click(corePortCheckbox)
    await waitFor(() => expect(corePortCheckbox).toBeChecked())
    gw = await screen.findByRole('textbox', { name: 'Gateway' })
    expect(gw).toHaveValue('2.2.2.2')
    expect(gw).not.toBeDisabled()

    await userEvent.click(await screen.findByRole('button', { name: 'Apply Ports General' }))
    const expectedResult = _.cloneDeep(mockEdgeOnlyLanPortConfig)
    // we should correct wrong data
    expectedResult.ports[3].natEnabled = false
    await waitFor(() => expect(mockedUpdateReq).toBeCalledWith(expectedResult))
  })

  it('should grey-out all LAN core port checkbox when SD-LAN is running and wll set', async () => {
    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => {
          mockedGetSdLanReq()
          return res(ctx.json({ data: mockedSdLanDataList }))
        }
      )
    )

    render(
      <Provider>
        <EdgePortsGeneral data={mockEdgePortConfigWithStatusIp.ports} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })

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
    const emptyCorePortConfig = _.cloneDeep(mockEdgePortConfigWithStatusIp)
    emptyCorePortConfig.ports.splice(1, 1)
    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => {
          mockedGetSdLanReq()
          return res(ctx.json({ data: mockedCorePortLostEdgeSdLanDataList }))
        }
      )
    )
    render(
      <Provider>
        <EdgePortsGeneral data={emptyCorePortConfig.ports} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })

    await waitFor(() => {
      expect(mockedGetSdLanReq).toBeCalled()
    })

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
    render(
      <Provider>
        <EdgePortsGeneral data={mockEdgePortConfigWithStatusIp.ports} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    await userEvent.click(await screen.findByRole('tab', { name: 'Port2' }))
    expect(await screen.findByRole('combobox', { name: 'Port Type' })).not.toBeDisabled()
    expect(await screen.findByRole('option', { name: 'WAN' })).toBeDisabled()
  })

  it('port type shoud NOT be grey-out when port is unconfigured', async () => {
    const mockEdgePortConfigPartialUnconfig = _.cloneDeep(mockEdgePortConfigWithStatusIp)
    mockEdgePortConfigPartialUnconfig.ports[4].portType = EdgePortTypeEnum.UNCONFIGURED

    render(
      <Provider>
        <EdgePortsGeneral data={mockEdgePortConfigPartialUnconfig.ports} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    await userEvent.click(await screen.findByRole('tab', { name: 'Port5' }))
    expect(await screen.findByRole('combobox', { name: 'Port Type' })).not.toBeDisabled()
  })

  it('should clear gateway after core port unselected', async () => {
    render(
      <Provider>
        <EdgePortsGeneral edgeId='mocked_edge' data={mockEdgePortConfigWithStatusIp.ports} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/services/edgeSdLan/create'
        }
      })

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

    await userEvent.click(await screen.findByRole('button', { name: 'Apply Ports General' }))
    const expectedResult = _.cloneDeep(mockEdgePortConfigWithStatusIp)
    expectedResult.ports[0].enabled = false
    expectedResult.ports[1].corePortEnabled = false
    expectedResult.ports[1].gateway = ''
    expectedResult.ports[4].natEnabled = false
    await waitFor(() => expect(mockedUpdateReq).toBeCalledWith(expectedResult))
  })

  it('should forbid WAN port changed into enable when LAN core port exist', async () => {
    render(
      <Provider>
        <EdgePortsGeneral data={mockEdgePortConfigWithStatusIpWithoutCorePort.ports} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })

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