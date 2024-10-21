import { useState } from 'react'

import userEvent from '@testing-library/user-event'

import { EdgeSubInterfaceFixtures, SubInterface } from '@acx-ui/rc/utils'
import { Provider }                               from '@acx-ui/store'
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import SubInterfaceDrawer from './SubInterfaceDrawer'

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

const mockedData = mockEdgeSubInterfaces.content[0] as SubInterface
const mockedHandleAddFn = jest.fn()
const mockedHandleUpdateFn = jest.fn()

describe('EditEdge ports - sub-interface', () => {
  const mockedSetVisible = jest.fn()

  it('Add a DHCP sub-interface', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SubInterfaceDrawer
          visible={true}
          setVisible={mockedSetVisible}
          data={undefined}
          handleAdd={mockedHandleAddFn}
          handleUpdate={mockedHandleUpdateFn}
          allSubInterfaceVlans={[]}
        />
      </Provider>)
    const vlanInput = await screen.findByRole('spinbutton', { name: 'VLAN' })
    fireEvent.change(vlanInput, { target: { value: '2' } })
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => {
      expect(mockedHandleAddFn).toBeCalledWith(expect.objectContaining({
        ipMode: 'DHCP',
        portType: 'LAN',
        vlan: 2
      }))
    })
  })

  it('Add a DHCP sub-interface with duplicate vlan', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SubInterfaceDrawer
          visible={true}
          setVisible={mockedSetVisible}
          data={undefined}
          handleAdd={mockedHandleAddFn}
          handleUpdate={mockedHandleUpdateFn}
          allSubInterfaceVlans={[
            { id: 'fa663fd2-3057-44d9-ba25-9b45c93069cd', vlan: 2 }
          ]}
        />
      </Provider>)
    const vlanInput = await screen.findByRole('spinbutton', { name: 'VLAN' })
    fireEvent.change(vlanInput, { target: { value: '2' } })
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => {
      expect(screen.getByText('VLAN should be unique')).toBeInTheDocument()
    })
  })

  it('Add a STATIC sub-interface', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SubInterfaceDrawer
          visible={true}
          setVisible={mockedSetVisible}
          data={undefined}
          handleAdd={mockedHandleAddFn}
          handleUpdate={mockedHandleUpdateFn}
          allSubInterfaceVlans={[]}
        />
      </Provider>)
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
      expect(mockedHandleAddFn).toBeCalledWith(expect.objectContaining({
        ip: '1.1.1.1',
        ipMode: 'STATIC',
        portType: 'LAN',
        subnet: '255.255.255.0',
        vlan: 2
      }))
    })
  })

  it('Edit a sub-interface', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SubInterfaceDrawer
          visible={true}
          setVisible={mockedSetVisible}
          data={mockedData}
          handleAdd={mockedHandleAddFn}
          handleUpdate={mockedHandleUpdateFn}
          allSubInterfaceVlans={[]}
        />
      </Provider>)
    const vlanInput = await screen.findByRole('spinbutton', { name: 'VLAN' })
    fireEvent.change(vlanInput, { target: { value: '999' } })
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => {
      expect(mockedHandleUpdateFn).toBeCalledWith(expect.objectContaining({
        id: 'fa663fd2-3057-44d9-ba25-9b45c93069cd',
        ipMode: 'DHCP',
        portType: 'LAN',
        vlan: 999
      }))
    })
  })

  it('Edit a sub-interface with duplicatae vlan', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SubInterfaceDrawer
          visible={true}
          setVisible={mockedSetVisible}
          data={mockedData}
          handleAdd={mockedHandleAddFn}
          handleUpdate={mockedHandleUpdateFn}
          allSubInterfaceVlans={[
            { id: 'fe04bc40-e1bb-4dd4-af9a-a218576f1f63', vlan: 1 },
            { id: 'fa663fd2-3057-44d9-ba25-9b45c93069cd', vlan: 2 }
          ]}
        />
      </Provider>)
    const vlanInput = await screen.findByRole('spinbutton', { name: 'VLAN' })
    fireEvent.change(vlanInput, { target: { value: '1' } })
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => {
      expect(screen.getByText('VLAN should be unique')).toBeInTheDocument()
    })
  })

  it('reset form when dialog closed', async () => {
    const { result } = renderHook(() => {
      const [visible, setVisible] = useState(true)
      return { visible, setVisible }
    })

    const MockedComponent = () => (<Provider>
      <SubInterfaceDrawer
        visible={result.current.visible}
        setVisible={result.current.setVisible}
        data={undefined}
        handleAdd={mockedHandleAddFn}
        handleUpdate={mockedHandleUpdateFn}
        allSubInterfaceVlans={[]}
      />

    </Provider>)

    const { rerender }= render(
      <MockedComponent />)

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
