import { useState } from 'react'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { act }   from 'react-dom/test-utils'

import { EdgeSubInterface, EdgeUrlsInfo }                    from '@acx-ui/rc/utils'
import { Provider }                                          from '@acx-ui/store'
import { fireEvent, mockServer, render, renderHook, screen } from '@acx-ui/test-utils'

import { mockEdgePortConfig, mockEdgeSubInterfaces } from '../../../../__tests__/fixtures'

import SubInterfaceDrawer from './SubInterfaceDrawer'

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

const mockedPortsConfig = mockEdgePortConfig.ports[0]
const mockedData = mockEdgeSubInterfaces.content[0] as EdgeSubInterface

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
})