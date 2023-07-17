import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }     from '@acx-ui/store'
import {
  fireEvent,
  mockServer, render,
  screen
} from '@acx-ui/test-utils'

import { EdgeEditContext }                                    from '../..'
import { mockEdgePortConfig, mockEdgePortConfigWithStatusIp } from '../../../../__tests__/fixtures'

import PortsGeneral from '.'

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

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const defaultContextData = {
  activeSubTab: {
    key: 'ports-general',
    title: 'Ports General'
  },
  formControl: {
    isDirty: false,
    hasError: false,
    applyFn: jest.fn()
  },
  setActiveSubTab: jest.fn(),
  setFormControl: jest.fn()
}

describe('EditEdge ports - ports general', () => {
  let params: { tenantId: string, serialNumber: string, activeTab?: string, activeSubTab?: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000',
      activeTab: 'ports',
      activeSubTab: 'ports-general'
    }

    mockServer.use(
      rest.get(
        EdgeUrlsInfo.getPortConfig.url,
        (req, res, ctx) => res(ctx.json(mockEdgePortConfig))
      ),
      rest.patch(
        EdgeUrlsInfo.updatePortConfig.url,
        (req, res, ctx) => res(ctx.status(202))
      )
    )
  })

  it('should update successfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeEditContext.Provider
          value={defaultContextData}
        >
          <PortsGeneral data={mockEdgePortConfigWithStatusIp.ports} />
        </EdgeEditContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    const ipInput = await screen.findByRole('textbox', { name: 'IP Address' })
    fireEvent.change(ipInput, { target: { value: '1.1.1.1' } })
    const subnetInput = await screen.findByRole('textbox', { name: 'Subnet Mask' })
    fireEvent.change(subnetInput, { target: { value: '255.255.255.0' } })
    const gatewayInput = await screen.findByRole('textbox', { name: 'Gateway' })
    fireEvent.change(gatewayInput, { target: { value: '1.1.1.1' } })
    await user.click(await screen.findByRole('button', { name: 'Apply Ports General' }))
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
        <EdgeEditContext.Provider
          value={defaultContextData}
        >
          <PortsGeneral data={mockEdgePortConfigWithStatusIp.ports} />
        </EdgeEditContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    const ipInput = await screen.findByRole('textbox', { name: 'IP Address' })
    fireEvent.change(ipInput, { target: { value: '' } })
    const subnetInput = await screen.findByRole('textbox', { name: 'Subnet Mask' })
    fireEvent.change(subnetInput, { target: { value: '' } })
    const gatewayInput = await screen.findByRole('textbox', { name: 'Gateway' })
    fireEvent.change(gatewayInput, { target: { value: '' } })
    await user.click(await screen.findByRole('button', { name: 'Apply Ports General' }))
    await screen.findByText('Please enter IP Address')
    await screen.findByText('Please enter Subnet Mask')
    await screen.findByText('Please enter Gateway')
  })

  it('should be blocked by validation 2', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeEditContext.Provider
          value={defaultContextData}
        >
          <PortsGeneral data={mockEdgePortConfigWithStatusIp.ports} />
        </EdgeEditContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    await user.click(await screen.findByRole('switch', { name: 'Port Enabled' }))
    await user.click(await screen.findByRole('radio', { name: 'Port 2' }))
    const ipInput = await screen.findByRole('textbox', { name: 'IP Address' })
    fireEvent.change(ipInput, { target: { value: '1.2.3' } })
    const subnetInput = await screen.findByRole('textbox', { name: 'Subnet Mask' })
    fireEvent.change(subnetInput, { target: { value: '2.2.2' } })
    await user.click(await screen.findByRole('radio', { name: 'Port 3' }))
    await user.click(await screen.findByRole('button', { name: 'Apply Ports General' }))
    await screen.findByText('Please enter a valid IP address')
    await screen.findByText('Please enter a valid subnet mask')
  })

  it('cancel and go back to edge list', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeEditContext.Provider
          value={defaultContextData}
        >
          <PortsGeneral data={mockEdgePortConfigWithStatusIp.ports} />
        </EdgeEditContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/edge`,
      hash: '',
      search: ''
    })
  })

  it('set port type to unconfigured', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeEditContext.Provider
          value={defaultContextData}
        >
          <PortsGeneral data={mockEdgePortConfigWithStatusIp.ports} />
        </EdgeEditContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    await user.click(await screen.findByRole('radio', { name: 'Port 5' }))
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
        <EdgeEditContext.Provider
          value={defaultContextData}
        >
          <PortsGeneral data={mockEdgePortConfigWithStatusIp.ports} />
        </EdgeEditContext.Provider>
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
        <EdgeEditContext.Provider
          value={defaultContextData}
        >
          <PortsGeneral data={mockEdgePortConfigWithStatusIp.ports} />
        </EdgeEditContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    await user.click(await screen.findByRole('radio', { name: 'Port 2' }))
    const portTypeSelect = await screen.findByRole('combobox', { name: 'Port Type' })
    await user.click(portTypeSelect)
    await user.click((await screen.findAllByText('WAN'))[1])
    const ipModeRadio = await screen.findByRole('radio', { name: 'Static/Manual' })
    await user.click(ipModeRadio)
    await screen.findByRole('textbox', { name: 'IP Address' })
    screen.getByRole('textbox', { name: 'Subnet Mask' })
    screen.getByRole('textbox', { name: 'Gateway' })
  })

  it('switch port tab', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeEditContext.Provider
          value={defaultContextData}
        >
          <PortsGeneral data={mockEdgePortConfigWithStatusIp.ports} />
        </EdgeEditContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    await user.click(await screen.findByRole('radio', { name: 'Port 2' }))
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('local0')
    await user.click(await screen.findByRole('radio', { name: 'Port 3' }))
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('port1')
    await user.click(await screen.findByRole('radio', { name: 'Port 4' }))
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('tap0')
    await user.click(await screen.findByRole('radio', { name: 'Port 5' }))
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('port2')
  })

  it('should show no data string when ports data is empty', async () => {
    render(
      <Provider>
        <EdgeEditContext.Provider
          value={defaultContextData}
        >
          <PortsGeneral data={[]} />
        </EdgeEditContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    expect(screen.getByText('No data to display')).toBeVisible()
  })
})

describe('EditEdge ports - ports general  api fail', () => {
  let params: { tenantId: string, serialNumber: string, activeTab?: string, activeSubTab?: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000',
      activeTab: 'ports',
      activeSubTab: 'ports-general'
    }

    mockServer.use(
      rest.get(
        EdgeUrlsInfo.getPortConfig.url,
        (req, res, ctx) => res(ctx.json(mockEdgePortConfig))
      ),
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
        <EdgeEditContext.Provider
          value={defaultContextData}
        >
          <PortsGeneral data={mockEdgePortConfigWithStatusIp.ports} />
        </EdgeEditContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    const ipInput = await screen.findByRole('textbox', { name: 'IP Address' })
    fireEvent.change(ipInput, { target: { value: '1.1.1.1' } })
    const subnetInput = await screen.findByRole('textbox', { name: 'Subnet Mask' })
    fireEvent.change(subnetInput, { target: { value: '255.255.255.0' } })
    const gatewayInput = await screen.findByRole('textbox', { name: 'Gateway' })
    fireEvent.change(gatewayInput, { target: { value: '1.1.1.1' } })
    await user.click(await screen.findByRole('button', { name: 'Apply Ports General' }))
    // TODO
    // await screen.findAllByText('Server Error')
  })
})