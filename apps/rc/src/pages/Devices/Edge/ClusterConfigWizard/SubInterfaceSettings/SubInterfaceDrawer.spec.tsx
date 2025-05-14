import { useState } from 'react'

import userEvent     from '@testing-library/user-event'
import { UserEvent } from '@testing-library/user-event/dist/types/setup/setup'
import { Form }      from 'antd'

import { StepsForm }                                            from '@acx-ui/components'
import { Features }                                             from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                                from '@acx-ui/rc/components'
import { EdgePortInfo, EdgeSubInterfaceFixtures, SubInterface } from '@acx-ui/rc/utils'
import { Provider }                                             from '@acx-ui/store'
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { mockSubInterfaceSettingsFormType } from '../__tests__/fixtures'

import SubInterfaceDrawer               from './SubInterfaceDrawer'
import { SubInterfaceSettingsFormType } from './types'

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
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

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
          serialNumber='edge-id'
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
          serialNumber='edge-id'
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
    const { result: formRef } = renderHook(() => Form.useForm<SubInterfaceSettingsFormType>()[0])
    render(
      <StepsForm
        form={formRef.current}
        initialValues={mockSubInterfaceSettingsFormType}
        buttonLabel={{ submit: 'mockSubmitButtonLabel' }}
      >
        <StepsForm.StepForm>
          <SubInterfaceDrawer
            serialNumber='96000076DCCAA42E87785B549A64997E72'
            visible={true}
            setVisible={mockedSetVisible}
            data={undefined}
            handleAdd={mockedHandleAddFn}
            handleUpdate={mockedHandleUpdateFn}
            allSubInterfaceVlans={[]}
          />
        </StepsForm.StepForm>
      </StepsForm>)
    const user = userEvent.setup()
    await user.click(await screen.findByRole('combobox', { name: 'IP Assignment Type' }))
    await user.click(await screen.findByText('Static IP'))
    const ipInput = await screen.findByRole('textbox', { name: 'IP Address' })
    fireEvent.change(ipInput, { target: { value: '2.1.1.1' } })
    const subnetInput = await screen.findByRole('textbox', { name: 'Subnet Mask' })
    fireEvent.change(subnetInput, { target: { value: '255.0.0.0' } })
    const vlanInput = await screen.findByRole('spinbutton', { name: 'VLAN' })
    fireEvent.change(vlanInput, { target: { value: '1024' } })
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => {
      expect(mockedHandleAddFn).toBeCalledWith(expect.objectContaining({
        ip: '2.1.1.1',
        ipMode: 'STATIC',
        portType: 'LAN',
        subnet: '255.0.0.0',
        vlan: 1024
      }))
    })
  })

  it('Add a STATIC sub-interface with duplicate subnet range', async () => {
    const { result: formRef } = renderHook(() => Form.useForm<SubInterfaceSettingsFormType>()[0])
    render(
      <StepsForm form={formRef.current} initialValues={mockSubInterfaceSettingsFormType}>
        <StepsForm.StepForm>
          <SubInterfaceDrawer
            serialNumber='96000076DCCAA42E87785B549A64997E72'
            visible={true}
            setVisible={mockedSetVisible}
            data={undefined}
            handleAdd={mockedHandleAddFn}
            handleUpdate={mockedHandleUpdateFn}
            allSubInterfaceVlans={[]}
          />
        </StepsForm.StepForm>
      </StepsForm>)

    const user = userEvent.setup()
    await user.click(await screen.findByRole('combobox', { name: 'IP Assignment Type' }))
    await user.click(await screen.findByText('Static IP'))
    inputStaticIp(user, '1.1.5.2', '255.255.255.0')

    await waitFor(() => {
      expect(screen.getByText('The ports have overlapping subnets')).toBeInTheDocument()
    })
  })

  it('Add a STATIC sub-interface with duplicate subnet range with physical port', async () => {
    render(
      <StepsForm initialValues={mockSubInterfaceSettingsFormType}>
        <StepsForm.StepForm>
          <SubInterfaceDrawer
            serialNumber='96000076DCCAA42E87785B549A64997E72'
            visible={true}
            setVisible={mockedSetVisible}
            data={undefined}
            handleAdd={mockedHandleAddFn}
            handleUpdate={mockedHandleUpdateFn}
            allSubInterfaceVlans={[]}
            allInterface={[{
              ipMode: 'STATIC',
              ip: '2.3.4.5',
              subnet: '255.255.255.0'
            }] as unknown as EdgePortInfo[]}
          />
        </StepsForm.StepForm>
      </StepsForm>)

    const user = userEvent.setup()
    await user.click(await screen.findByRole('combobox', { name: 'IP Assignment Type' }))
    await user.click(await screen.findByText('Static IP'))
    inputStaticIp(user, '2.3.4.5', '255.255.255.0')

    await waitFor(() => {
      expect(screen.getByText('The ports have overlapping subnets')).toBeInTheDocument()
    })
  })

  it('Edit a STATIC sub-interface with duplicate subnet range', async () => {
    const { result: formRef } = renderHook(() => Form.useForm<SubInterfaceSettingsFormType>()[0])
    const editEdgeId = '96000076DCCAA42E87785B549A64997E72'
    const editPortId = '29445906-158a-4535-8e1e-5d4852d064c6'
    const editSubInterface = mockSubInterfaceSettingsFormType
      .portSubInterfaces[editEdgeId][editPortId][0]

    render(
      <StepsForm form={formRef.current} initialValues={mockSubInterfaceSettingsFormType}>
        <StepsForm.StepForm>
          <SubInterfaceDrawer
            serialNumber='96000076DCCAA42E87785B549A64997E72'
            visible={true}
            setVisible={mockedSetVisible}
            data={editSubInterface}
            handleAdd={mockedHandleAddFn}
            handleUpdate={mockedHandleUpdateFn}
            allSubInterfaceVlans={[]}
          />
        </StepsForm.StepForm>
      </StepsForm>)

    const user = userEvent.setup()
    inputStaticIp(user, '1.1.3.2', '255.255.255.0')

    await waitFor(() => {
      expect(screen.getByText('The ports have overlapping subnets')).toBeInTheDocument()
    })
  })

  it('Edit a sub-interface', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SubInterfaceDrawer
          serialNumber='edge-id'
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

  it('Edit a sub-interface with duplicate vlan', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SubInterfaceDrawer
          serialNumber='edge-id'
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
        serialNumber='edge-id'
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
            serialNumber='edge-id'
            visible={true}
            setVisible={mockedSetVisible}
            data={undefined}
            handleAdd={mockedHandleAddFn}
            handleUpdate={mockedHandleUpdateFn}
            allSubInterfaceVlans={[]}
          />
        </Provider>
      )

      expect(screen.getByRole('checkbox', { name: 'Core port' })).toBeVisible()
      expect(screen.getByRole('checkbox', { name: 'Access port' })).toBeVisible()
    })
  })
})

const inputStaticIp = async (user: UserEvent, ip: string, mask: string) => {
  const ipInput = await screen.findByRole('textbox', { name: 'IP Address' })
  fireEvent.change(ipInput, { target: { value: ip } })
  const subnetInput = await screen.findByRole('textbox', { name: 'Subnet Mask' })
  fireEvent.change(subnetInput, { target: { value: mask } })
}