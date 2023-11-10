import userEvent from '@testing-library/user-event'
import _         from 'lodash'
import { rest }  from 'msw'

import { useIsSplitOn }                                from '@acx-ui/feature-toggle'
import { EdgeCentralizedForwardingUrls, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                    from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { mockedCorePortLostEdgeCFDataList, mockedEdgeCFDataList, mockEdgePortConfigWithStatusIp } from '../__tests__/fixtures'

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

describe('EditEdge ports - ports general', () => {
  let params: { tenantId: string, serialNumber: string, activeTab?: string, activeSubTab?: string }
  const mockedUpdateReq = jest.fn()
  const mockedGetCFReq = jest.fn()

  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000',
      activeTab: 'ports',
      activeSubTab: 'ports-general'
    }
    mockedUpdateReq.mockClear()
    mockedGetCFReq.mockClear()

    // CF flag is off
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    mockServer.use(
      rest.patch(
        EdgeUrlsInfo.updatePortConfig.url,
        (req, res, ctx) => {
          mockedUpdateReq(req.body)
          return res(ctx.status(202))
        }
      ),
      rest.post(
        EdgeCentralizedForwardingUrls.getEdgeCentralizedForwardingViewDataList.url,
        (_, res, ctx) => {
          mockedGetCFReq()
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should update successfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgePortsGeneral data={mockEdgePortConfigWithStatusIp.ports} />
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
    expect(mockedGetCFReq).not.toBeCalled()
    await user.click(await screen.findByRole('button', { name: 'Apply Ports General' }))

    const expectedResult = _.cloneDeep(mockEdgePortConfigWithStatusIp)
    expectedResult.ports[0].ip = '1.1.1.1'
    expectedResult.ports[0].subnet = '255.255.255.0'
    expectedResult.ports[0].gateway = '1.1.1.1'
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
        <EdgePortsGeneral data={mockEdgePortConfigWithStatusIp.ports} />
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
        <EdgePortsGeneral data={mockEdgePortConfigWithStatusIp.ports} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    await user.click(await screen.findByRole('switch', { name: 'Port Enabled' }))
    await user.click(await screen.findByRole('tab', { name: 'Port 2' }))
    const ipInput = await screen.findByRole('textbox', { name: 'IP Address' })
    await userEvent.clear(ipInput)
    await userEvent.type(ipInput, '1.2.3')
    const subnetInput = await screen.findByRole('textbox', { name: 'Subnet Mask' })
    await userEvent.clear(subnetInput)
    await userEvent.type(subnetInput, '2.2.2')
    await user.click(await screen.findByRole('tab', { name: 'Port 3' }))
    await user.click(await screen.findByRole('button', { name: 'Apply Ports General' }))
    await screen.findByText('Please enter a valid IP address')
    await screen.findByText('Please enter a valid subnet mask')
  })

  it('Broadcast and IPs above 224.0.0.0 should be blocked', async () => {
    render(
      <Provider>
        <EdgePortsGeneral data={mockEdgePortConfigWithStatusIp.ports} />
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
        <EdgePortsGeneral data={mockEdgePortConfigWithStatusIp.ports} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })

    await user.click(await screen.findByRole('switch', { name: 'Port Enabled' }))
    await user.click(await screen.findByRole('tab', { name: 'Port 2' }))
    const ipInput1 = await screen.findByRole('textbox', { name: 'IP Address' })
    await userEvent.clear(ipInput1)
    await userEvent.type(ipInput1, '1.1.1.1')
    await user.click(await screen.findByRole('tab', { name: 'Port 5' }))
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
        <EdgePortsGeneral data={mockEdgePortConfigWithStatusIp.ports} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })

    await user.click(await screen.findByRole('tab', { name: 'Port 5' }))
    const portEnabled = await screen.findByRole('switch', { name: 'Port Enabled' })
    const portTypeSelect = await screen.findByRole('combobox', { name: 'Port Type' })
    await user.click(portTypeSelect)
    await user.click(await screen.findByText('Select port type..'))
    expect(portEnabled).not.toBeVisible()
  })

  it('set port type to LAN', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgePortsGeneral data={mockEdgePortConfigWithStatusIp.ports} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })

    await user.click(await screen.findByRole('combobox', { name: 'Port Type' }))
    await user.click(await screen.findByText('LAN'))
    await screen.findByRole('textbox', { name: 'IP Address' })
    screen.getByRole('textbox', { name: 'Subnet Mask' })
  })

  it('set port type to WAN with ip mode STATIC', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgePortsGeneral data={mockEdgePortConfigWithStatusIp.ports} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })

    await user.click(await screen.findByRole('tab', { name: 'Port 2' }))
    const portTypeSelect = await screen.findByRole('combobox', { name: 'Port Type' })
    await user.click(portTypeSelect)
    await user.click((await screen.findAllByText('WAN'))[2])
    const ipModeRadio = await screen.findByRole('radio', { name: 'Static/Manual' })
    await user.click(ipModeRadio)
    await screen.findByRole('textbox', { name: 'IP Address' })
    screen.getByRole('textbox', { name: 'Subnet Mask' })
    screen.getByRole('textbox', { name: 'Gateway' })
  })

  it('change port type to WAN and undo the change', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgePortsGeneral data={mockEdgePortConfigWithStatusIp.ports} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })

    const portTypeSelect = await screen.findByRole('combobox', { name: 'Port Type' })
    await user.click(portTypeSelect)
    await user.click(await screen.findByText('LAN'))
    await user.click(portTypeSelect)
    await user.click((await screen.findAllByText('WAN'))[1])
    const nat = await screen.findByRole('switch',
      { name: /Use NAT Service/ })
    expect(nat).not.toBeChecked()
  })

  it('switch port tab', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgePortsGeneral data={mockEdgePortConfigWithStatusIp.ports} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })

    await user.click(await screen.findByRole('tab', { name: 'Port 2' }))
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('local0')
    await user.click(await screen.findByRole('tab', { name: 'Port 3' }))
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('port1')
    await user.click(await screen.findByRole('tab', { name: 'Port 4' }))
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('tap0')
    await user.click(await screen.findByRole('tab', { name: 'Port 5' }))
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
})

describe('EditEdge ports - ports general api fail', () => {
  let params: { tenantId: string, serialNumber: string, activeTab?: string, activeSubTab?: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000',
      activeTab: 'ports',
      activeSubTab: 'ports-general'
    }

    jest.mocked(useIsSplitOn).mockReturnValue(false)

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
        <EdgePortsGeneral data={mockEdgePortConfigWithStatusIp.ports} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    const ipInput = await screen.findByRole('textbox', { name: 'IP Address' })
    await userEvent.type(ipInput, '1.1.1.1')
    const subnetInput = await screen.findByRole('textbox', { name: 'Subnet Mask' })
    await userEvent.type(subnetInput, '255.255.255.0')
    const gatewayInput = await screen.findByRole('textbox', { name: 'Gateway' })
    await userEvent.type(gatewayInput, '1.1.1.1')
    await user.click(await screen.findByRole('button', { name: 'Apply Ports General' }))
    // TODO
    // await screen.findAllByText('Server Error')
  })
})

describe('EditEdge ports - CF ready', () => {
  let params: { tenantId: string, serialNumber: string, activeTab?: string, activeSubTab?: string }
  const mockedGetCFReq = jest.fn()
  const mockedUpdateReq = jest.fn()

  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000',
      activeTab: 'ports',
      activeSubTab: 'ports-general'
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
        EdgeCentralizedForwardingUrls.getEdgeCentralizedForwardingViewDataList.url,
        (_, res, ctx) => {
          mockedGetCFReq()
          return res(ctx.status(202))
        }
      )
    )
  })

  it('display reminder when port type changed', async () => {
    const user = userEvent.setup()
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
      expect(mockedGetCFReq).toBeCalled()
    })
    await user.click(await screen.findByRole('combobox', { name: 'Port Type' }))
    await user.click(await screen.findByText('LAN'))
    const dialog = await screen.findByRole('dialog')
    await within(dialog).findByText(/Please make sure that you are choosing the correct port type/i)
    await screen.findByRole('textbox', { name: 'IP Address' })
    screen.getByRole('textbox', { name: 'Subnet Mask' })
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
      expect(mockedGetCFReq).toBeCalled()
    })
    const corePortInput = await screen.findByRole('checkbox',
      { name: /Use this port as Core Port/ })
    expect(corePortInput).toBeChecked()
    expect(corePortInput).not.toBeDisabled()

    await userEvent.click(await screen.findByRole('tab', { name: 'Port 2' }))
    const port2CorePort = await screen.findByRole('checkbox',
      { name: /Use this port as Core Port/ })
    expect(port2CorePort).not.toBeChecked()
    expect(port2CorePort).toBeDisabled()
  })

  it('should disable NAT when core port is changed into enabled', async () => {
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
      expect(mockedGetCFReq).toBeCalled()
    })
    const corePortInput = await screen.findByRole('checkbox',
      { name: /Use this port as Core Port/ })

    // uncheck current core port
    await userEvent.click(corePortInput)

    await userEvent.click(await screen.findByRole('tab', { name: 'Port 6' }))
    const port6CorePort = await screen.findByRole('checkbox',
      { name: /Use this port as Core Port/ })
    expect(port6CorePort).not.toBeChecked()
    expect(port6CorePort).not.toBeDisabled()
    await userEvent.click(port6CorePort)
    const port5nat = await screen.findByRole('switch',
      { name: /Use NAT Service/ })
    expect(port5nat).not.toBeChecked()
  })
  it('should grey-out all core port checkbox when CF is running and wll set', async () => {
    mockServer.use(
      rest.post(
        EdgeCentralizedForwardingUrls.getEdgeCentralizedForwardingViewDataList.url,
        (_, res, ctx) => {
          mockedGetCFReq()
          return res(ctx.json({ data: mockedEdgeCFDataList }))
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

    await waitFor(() => {
      expect(mockedGetCFReq).toBeCalled()
    })
    const corePortInput = await screen.findByRole('checkbox',
      { name: /Use this port as Core Port/ })
    expect(corePortInput).toBeChecked()
    await waitFor(() => {
      expect(corePortInput).toBeDisabled()
    })

    await userEvent.click(await screen.findByRole('tab', { name: 'Port 2' }))
    const port2CorePort = await screen.findByRole('checkbox',
      { name: /Use this port as Core Port/ })
    expect(port2CorePort).not.toBeChecked()
    expect(port2CorePort).toBeDisabled()
  })
  it('should allow user config another core port when core port is missing from CF', async () => {
    const emptyCorePortConfig = _.cloneDeep(mockEdgePortConfigWithStatusIp)
    emptyCorePortConfig.ports.splice(0, 1)
    mockServer.use(
      rest.post(
        EdgeCentralizedForwardingUrls.getEdgeCentralizedForwardingViewDataList.url,
        (_, res, ctx) => {
          mockedGetCFReq()
          return res(ctx.json({ data: mockedCorePortLostEdgeCFDataList }))
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
      expect(mockedGetCFReq).toBeCalled()
    })
    const corePortInput = await screen.findByRole('checkbox',
      { name: /Use this port as Core Port/ })
    expect(corePortInput).not.toBeChecked()
    expect(corePortInput).not.toBeDisabled()

    await userEvent.click(await screen.findByRole('tab', { name: 'Port 2' }))
    const port2CorePort = await screen.findByRole('checkbox',
      { name: /Use this port as Core Port/ })
    expect(port2CorePort).not.toBeChecked()
    expect(port2CorePort).not.toBeDisabled()
  })
})