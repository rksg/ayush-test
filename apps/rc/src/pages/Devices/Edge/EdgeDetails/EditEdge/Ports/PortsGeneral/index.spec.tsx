import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeIpModeEnum, EdgePortTypeEnum, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                       from '@acx-ui/store'
import {
  fireEvent,
  mockServer, render,
  screen
} from '@acx-ui/test-utils'

import { PortsContext }       from '..'
import { mockEdgePortConfig } from '../../../../__tests__/fixtures'

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

const setPorts: jest.Mock = jest.fn()

const mockContextValue = {
  ports: mockEdgePortConfig.ports,
  setPorts
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

  it('should active ports general successfully', async () => {
    render(
      <Provider>
        <PortsContext.Provider value={mockContextValue} >
          <PortsGeneral />
        </PortsContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    await screen.findByRole('radio', { name: 'Port 1' })
    screen.getByRole('radio', { name: 'Port 2' })
    screen.getByRole('radio', { name: 'Port 3' })
    screen.getByRole('radio', { name: 'Port 4' })
    screen.getByRole('radio', { name: 'Port 5' })
  })

  it('should update successfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <PortsContext.Provider value={mockContextValue} >
          <PortsGeneral />
        </PortsContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
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

  it('should block by validation', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <PortsContext.Provider value={mockContextValue} >
          <PortsGeneral />
        </PortsContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    await user.click(await screen.findByRole('button', { name: 'Apply Ports General' }))
    await screen.findByText('Please enter IP Address')
    await screen.findByText('Please enter Subnet Mask')
    await screen.findByText('Please enter Gateway')
  })

  it('cancel and go back to edge list', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <PortsContext.Provider value={mockContextValue} >
          <PortsGeneral />
        </PortsContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/devices/edge/list`,
      hash: '',
      search: ''
    })
  })

  it('set port type to unconfigured', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <PortsContext.Provider value={mockContextValue} >
          <PortsGeneral />
        </PortsContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    await user.click(await screen.findByRole('radio', { name: 'Port 5' }))
    const portTypeSelect = await screen.findByRole('combobox', { name: 'Port Type' })
    await user.click(portTypeSelect)
    await user.click(await screen.findByText('Select port type..'))
    const newData = [...mockContextValue.ports]
    newData[4] = { ...mockContextValue.ports[4], portType: EdgePortTypeEnum.UNCONFIGURED }
    expect(setPorts).toBeCalledWith(newData)
  })

  it('set port type to LAN', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <PortsContext.Provider value={mockContextValue} >
          <PortsGeneral />
        </PortsContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    await user.click(await screen.findByRole('combobox', { name: 'Port Type' }))
    await user.click(await screen.findByText('LAN'))
    const newData = [...mockContextValue.ports]
    newData[0] = {
      ...mockContextValue.ports[0],
      portType: EdgePortTypeEnum.LAN,
      ipMode: EdgeIpModeEnum.STATIC
    }
    expect(setPorts).toBeCalledWith(newData)
  })

  it('set port type to WAN with ip mode STATIC', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <PortsContext.Provider value={mockContextValue} >
          <PortsGeneral />
        </PortsContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    await user.click(await screen.findByRole('radio', { name: 'Port 2' }))
    const ipModeRadio = await screen.findByRole('radio', { name: 'Static/Manual' })
    await user.click(ipModeRadio)
    const newData = [...mockContextValue.ports]
    newData[1] = {
      ...mockContextValue.ports[1],
      ipMode: EdgeIpModeEnum.STATIC
    }
    expect(setPorts).toBeCalledWith(newData)
  })

  it('switch port tab', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <PortsContext.Provider value={mockContextValue} >
          <PortsGeneral />
        </PortsContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    await user.click(await screen.findByRole('radio', { name: 'Port 2' }))
    expect(screen.getByRole('textbox', { name: 'Port Name' })).toHaveValue('local0')
    await user.click(await screen.findByRole('radio', { name: 'Port 3' }))
    expect(screen.getByRole('textbox', { name: 'Port Name' })).toHaveValue('port1')
    await user.click(await screen.findByRole('radio', { name: 'Port 4' }))
    expect(screen.getByRole('textbox', { name: 'Port Name' })).toHaveValue('tap0')
    await user.click(await screen.findByRole('radio', { name: 'Port 5' }))
    expect(screen.getByRole('textbox', { name: 'Port Name' })).toHaveValue('port2')
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
        <PortsContext.Provider value={mockContextValue} >
          <PortsGeneral />
        </PortsContext.Provider>
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    const ipInput = await screen.findByRole('textbox', { name: 'IP Address' })
    fireEvent.change(ipInput, { target: { value: '1.1.1.1' } })
    const subnetInput = await screen.findByRole('textbox', { name: 'Subnet Mask' })
    fireEvent.change(subnetInput, { target: { value: '255.255.255.0' } })
    const gatewayInput = await screen.findByRole('textbox', { name: 'Gateway' })
    fireEvent.change(gatewayInput, { target: { value: '1.1.1.1' } })
    await user.click(await screen.findByRole('button', { name: 'Apply Ports General' }))
    await screen.findAllByText('An error occurred')
  })
})