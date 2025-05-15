import { useState } from 'react'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features }                                                                         from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                                                            from '@acx-ui/rc/components'
import { EdgePortConfigFixtures, EdgeSubInterfaceFixtures, EdgeSubInterface, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                                         from '@acx-ui/store'
import {
  act,
  fireEvent,
  mockServer,
  render,
  renderHook,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import SubInterfaceDrawer from './SubInterfaceDrawer'

const { mockEdgePortConfig } = EdgePortConfigFixtures
const { mockEdgeSubInterfaces } = EdgeSubInterfaceFixtures

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

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useIsEdgeFeatureReady: jest.fn()
}))

const mockedPortsConfig = mockEdgePortConfig.ports[0]
const mockedData = mockEdgeSubInterfaces.content[0] as EdgeSubInterface
const mockedHandleAddFn = jest.fn()
const mockedHandleUpdateFn = jest.fn()

describe('EditEdge ports - sub-interface', () => {
  let params: { tenantId: string, serialNumber: string, activeTab?: string, activeSubTab?: string }
  const mockedSetVisible = jest.fn()

  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000',
      activeTab: 'ports',
      activeSubTab: 'sub-interface'
    }

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.addSubInterfaces.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.patch(
        EdgeUrlsInfo.updateSubInterfaces.url,
        (req, res, ctx) => res(ctx.status(202))
      )
    )
  })

  it('Add a DHCP sub-interface', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SubInterfaceDrawer
          mac={mockedPortsConfig.mac}
          visible={true}
          setVisible={mockedSetVisible}
          data={undefined}
          handleAdd={mockedHandleAddFn}
          handleUpdate={mockedHandleUpdateFn}
        />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    const vlanInput = await screen.findByRole('spinbutton', { name: 'VLAN' })
    fireEvent.change(vlanInput, { target: { value: '2' } })
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => {
      expect(mockedHandleAddFn).toBeCalledWith({
        enabled: true,
        ipMode: 'DHCP',
        mac: '00:0c:29:b6:ad:04',
        name: '',
        portType: 'LAN',
        vlan: 2
      })
    })
  })

  it('Add a STATIC sub-interface', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SubInterfaceDrawer
          mac={mockedPortsConfig.mac}
          visible={true}
          setVisible={mockedSetVisible}
          data={undefined}
          handleAdd={mockedHandleAddFn}
          handleUpdate={mockedHandleUpdateFn}
        />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    await user.click(await screen.findByRole('combobox', { name: 'IP Assignment Type' }))
    await user.click(await screen.findByText('Static IP'))
    const ipInput = await screen.findByRole('textbox', { name: 'IP Address' })
    fireEvent.change(ipInput, { target: { value: '1.1.1.1' } })
    const subnetInput = await screen.findByRole('textbox', { name: 'Subnet Mask' })
    fireEvent.change(subnetInput, { target: { value: '255.255.255.0' } })
    const vlanInput = await screen.findByRole('spinbutton', { name: 'VLAN' })
    fireEvent.change(vlanInput, { target: { value: '2' } })
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => {
      expect(mockedHandleAddFn).toBeCalledWith({
        enabled: true,
        ip: '1.1.1.1',
        ipMode: 'STATIC',
        mac: '00:0c:29:b6:ad:04',
        name: '',
        portType: 'LAN',
        subnet: '255.255.255.0',
        vlan: 2
      })
    })
  })

  it('Edit a sub-interface', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SubInterfaceDrawer
          mac={mockedPortsConfig.mac}
          visible={true}
          setVisible={mockedSetVisible}
          data={mockedData}
          handleAdd={mockedHandleAddFn}
          handleUpdate={mockedHandleUpdateFn}
        />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    const vlanInput = await screen.findByRole('spinbutton', { name: 'VLAN' })
    fireEvent.change(vlanInput, { target: { value: '999' } })
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => {
      expect(mockedHandleUpdateFn).toBeCalledWith({
        enabled: true,
        gateway: '',
        id: 'fa663fd2-3057-44d9-ba25-9b45c93069cd',
        ipMode: 'DHCP',
        mac: '00:0c:29:b6:ad:04',
        name: 'local0',
        natEnabled: false,
        portType: 'LAN',
        vlan: 999
      })
    })
  })

  it('reset form when dialog closed', async () => {
    const { result } = renderHook(() => {
      const [visible, setVisible] = useState(true)
      return { visible, setVisible }
    })

    const MockedComponent = () => (<Provider>
      <SubInterfaceDrawer
        mac={mockedPortsConfig.mac}
        visible={result.current.visible}
        setVisible={result.current.setVisible}
        data={undefined}
        handleAdd={mockedHandleAddFn}
        handleUpdate={mockedHandleUpdateFn}
      />

    </Provider>)

    const { rerender }= render(
      <MockedComponent />, {
        route: {
          params,
          path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'

        }
      })

    const vlanInput = await screen.findByRole('spinbutton', { name: 'VLAN' })
    fireEvent.change(vlanInput, { target: { value: '2' } })
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    rerender(<MockedComponent />)
    await act(async () => {
      result.current.setVisible(true)
    })
    rerender(<MockedComponent />)
    expect(screen.queryByRole('spinbutton', { name: 'VLAN' })).toHaveAttribute('value', '')
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
      render(
        <Provider>
          <SubInterfaceDrawer
            mac={mockedPortsConfig.mac}
            visible={true}
            setVisible={mockedSetVisible}
            data={undefined}
            handleAdd={mockedHandleAddFn}
            handleUpdate={mockedHandleUpdateFn}
          />
        </Provider>, {
          route: {
            params,
            path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
          }
        })

      expect(screen.getByRole('checkbox', { name: 'Core port' })).toBeVisible()
      expect(screen.getByRole('checkbox', { name: 'Access port' })).toBeVisible()
    })

    it('should show gateway field when access port is checked', async () => {
      render(
        <Provider>
          <SubInterfaceDrawer
            mac={mockedPortsConfig.mac}
            visible={true}
            setVisible={mockedSetVisible}
            data={undefined}
            handleAdd={mockedHandleAddFn}
            handleUpdate={mockedHandleUpdateFn}
          />
        </Provider>, {
          route: {
            params,
            path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
          }
        })

      await userEvent.click(screen.getByRole('checkbox', { name: 'Access port' }))
      await userEvent.click(await screen.findByRole('combobox', { name: 'IP Assignment Type' }))
      await userEvent.click(await screen.findByText('Static IP'))
      expect(await screen.findByRole('textbox', { name: 'Gateway' })).toBeVisible()
    })
  })
})
