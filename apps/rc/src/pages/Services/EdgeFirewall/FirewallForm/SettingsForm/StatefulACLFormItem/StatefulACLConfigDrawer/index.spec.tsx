/* eslint-disable max-len */
import { useState } from 'react'

import { renderHook, within } from '@testing-library/react'
import userEvent              from '@testing-library/user-event'
import { Form }               from 'antd'

import { StepsForm }                 from '@acx-ui/components'
import { ACLDirection, StatefulAcl } from '@acx-ui/rc/utils'
import { Provider }                  from '@acx-ui/store'
import {
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { defaultStatefulACLs } from '..'

import { StatefulACLConfigDrawer } from './'

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({
    children,
    showSearch, // remove and left unassigned to prevent warning
    mode,
    ...props
  }: React.PropsWithChildren<{
    showSearch: boolean,
    mode: string,
    onChange?: (value: string) => void }>) => {

    return (<select {...props}
      multiple={mode==='tags' || mode==='multiple'}
      onChange={(e) => {
        props.onChange?.(e.target.value)}
      }>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      <option value={undefined}></option>
      {children}
    </select>)
  }
  Select.Option = 'option'
  Select.OptGroup = 'optgroup'
  return { ...components, Select }
})

const mockedEmptyInbound = {
  name: 'Inbound ACL',
  description: '',
  direction: 'INBOUND'
} as StatefulAcl
const mockedEmptyOutbound = {
  name: 'Outbound ACL',
  description: '',
  direction: 'OUTBOUND'
} as StatefulAcl
const mockedSetFieldValue = jest.fn()
const { click, type, selectOptions } = userEvent

describe('Stateful ACL config drawer', () => {
  beforeEach(() => {
    mockedSetFieldValue.mockReset()
  })

  it('should correctly render', async () => {
    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      // this is used as mocked statefulAcls data in step form context
      form.setFieldValue('statefulAcls', defaultStatefulACLs)
      jest.spyOn(form, 'setFieldValue').mockImplementation(mockedSetFieldValue)
      return form
    })
    const { result: visibleRef } = renderHook(() => {
      const [ visible, setVisible ] = useState(true)
      return { visible, setVisible }
    })

    render(
      <Provider>
        <StepsForm
          form={stepFormRef.current}
        >
          <StatefulACLConfigDrawer
            visible={visibleRef.current.visible}
            setVisible={visibleRef.current.setVisible}
            editData={mockedEmptyInbound}
          />
        </StepsForm>
      </Provider>)

    expect(await screen.findByText('Stateful ACL Settings')).toBeVisible()

    // add acl rule
    const addRuleBtn = screen.getByRole('button', { name: 'Add Rule' })
    await click(addRuleBtn)
    const dialogs = screen.queryAllByRole('dialog')
    const dialog = dialogs.filter(elem => elem.classList.contains('ant-modal'))[0]

    expect(within(dialog).queryByText(/Inspect/)).toBeNull()
    await click(await within(dialog).findByText(/Allow/))
    await selectOptions(
      await within(dialog).findByRole('combobox', { name: 'Protocol Type' }),
      'Custom')
    await type(within(dialog).getByRole('spinbutton', { name: 'Protocol Value' }), '20')
    const src = await screen.findByRole('group', { name: 'Source' })
    await click(await within(src).findByRole('radio', { name: 'IP Address' }))
    await type(within(src).getAllByRole('textbox')
      .filter(ele => ele.id === 'sourceAddress')[0], '1.2.3.4')
    let destination = await screen.findByRole('group', { name: 'Destination' })
    await click(await within(destination).findByRole('radio', { name: 'Any IP Address' }))
    await type(within(destination).getByRole('textbox', { name: 'Port' }), '3100')
    await click(within(dialog).getByRole('button', { name: 'Add' }))
    const customRow = await screen.findByRole('row', { name: /Custom/ })
    expect(within(customRow).queryByText(/(20)/)).toBeValid()

    // edit added rule
    await click(await within(customRow).findByRole('checkbox'))
    await click(await screen.findByRole('button', { name: 'Edit' }))
    destination = await screen.findByRole('group', { name: 'Destination' })
    await click(await within(destination).findByRole('radio', { name: 'IP Address' }))
    await type(within(destination).getAllByRole('textbox')
      .filter(ele => ele.id === 'destinationAddress')[0], '10.2.3.4')
    await click(within(dialog).getByRole('button', { name: 'Add' }))

    // submit
    await click(screen.getByRole('button', { name: 'Add' }))

    const outboundData = defaultStatefulACLs.filter(o => o.direction === ACLDirection.OUTBOUND)[0]
    expect(mockedSetFieldValue).toBeCalledWith('statefulAcls', [{
      name: 'Inbound ACL',
      direction: 'INBOUND',
      description: '',
      rules: [{
        priority: 1,
        description: undefined,
        accessAction: 'ALLOW',
        protocolType: 'CUSTOM',
        protocolValue: 20,
        sourceAddressType: 'IP_ADDRESS',
        sourceAddress: '1.2.3.4',
        sourcePort: undefined,
        destinationAddressType: 'IP_ADDRESS',
        destinationAddress: '10.2.3.4',
        destinationPort: '3100'
      }, {
        priority: 2,
        description: 'Default rule',
        accessAction: 'BLOCK',
        protocolType: 'ANY',
        protocolValue: 0,
        sourceAddressType: 'ANY_IP_ADDRESS',
        destinationAddressType: 'ANY_IP_ADDRESS'
      }]
    }, outboundData])
  })

  it('should correctly handle delete', async () => {
    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      // this is used as mocked statefulAcls data in step form context
      form.setFieldValue('statefulAcls', defaultStatefulACLs)
      jest.spyOn(form, 'setFieldValue').mockImplementation(mockedSetFieldValue)
      return form
    })
    const { result: visibleRef } = renderHook(() => {
      const [ visible, setVisible ] = useState(true)
      return { visible, setVisible }
    })

    render(
      <Provider>
        <StepsForm
          form={stepFormRef.current}
        >
          <StatefulACLConfigDrawer
            visible={visibleRef.current.visible}
            setVisible={visibleRef.current.setVisible}
            editData={mockedEmptyOutbound}
          />
        </StepsForm>
      </Provider>)

    expect(await screen.findByText('Stateful ACL Settings')).toBeVisible()

    // add acl rule
    const addRuleBtn = screen.getByRole('button', { name: 'Add Rule' })
    await click(addRuleBtn)
    const dialogs = screen.queryAllByRole('dialog')
    const dialog = dialogs.filter(elem => elem.classList.contains('ant-modal'))[0]

    expect(within(dialog).getByText(/Inspect/)).not.toBeNull()
    await click(await within(dialog).findByText(/Block/))
    await selectOptions(
      await within(dialog).findByRole('combobox', { name: 'Protocol Type' }),
      'IGMP')
    let src = await screen.findByRole('group', { name: 'Source' })
    await click(await within(src).findByRole('radio', { name: 'Subnet Address' }))
    await type(within(src).getByPlaceholderText('Network address'), '1.2.3.4')
    await type(within(src).getByPlaceholderText('Mask'), '255.255.0.0')
    let destination = await screen.findByRole('group', { name: 'Destination' })
    await click(await within(destination).findByRole('radio', { name: 'Subnet Address' }))
    await type(within(destination).getByPlaceholderText('Network address'), '10.12.3.4')
    await type(within(destination).getByPlaceholderText('Mask'), '255.255.255.0')
    await click(await within(dialog).findByRole('checkbox', { name: 'Add another rule' }))
    await click(within(dialog).getByRole('button', { name: 'Add' }))

    // add another rule
    await click(await within(dialog).findByText(/Inspect/))
    await selectOptions(
      await within(dialog).findByRole('combobox', { name: 'Protocol Type' }),
      'TCP')
    src = await screen.findByRole('group', { name: 'Source' })
    await click(await within(src).findByRole('radio', { name: 'Any IP Address' }))
    destination = await screen.findByRole('group', { name: 'Destination' })
    await click(await within(destination).findByRole('radio', { name: 'IP Address' }))
    await type(within(destination).getAllByRole('textbox')
      .filter(ele => ele.id === 'destinationAddress')[0], '10.25.1.1')
    // uncheck add another
    await click(await within(dialog).findByRole('checkbox', { name: 'Add another rule' }))
    await click(within(dialog).getByRole('button', { name: 'Add' }))

    // check added rules
    await screen.findByRole('row', { name: /IGMP/ })
    const tcpRows = await screen.findAllByRole('row', { name: /TCP/ })
    const tcpRow = tcpRows.filter((row) => row.textContent?.includes('10.25.1.1'))[0]

    // delete tcp rule
    await click(await within(tcpRow).findByRole('checkbox'))
    await click(await screen.findByRole('button', { name: 'Delete' }))
    await screen.findByText('Delete "5"?')
    await click(await screen.findByRole('button', { name: 'Delete Rule' }))
    await waitFor(() => {
      expect(dialog).not.toBeVisible()
    })

    // submit
    await click(screen.getByRole('button', { name: 'Add' }))

    const inboundData = defaultStatefulACLs.filter(o => o.direction === ACLDirection.INBOUND)[0]
    expect(mockedSetFieldValue).toBeCalledWith('statefulAcls', [inboundData, {
      name: 'Outbound ACL',
      direction: 'OUTBOUND',
      description: '',
      rules: [{
        priority: 1,
        description: 'Cloud mgmt. (Default)',
        accessAction: 'INSPECT',
        protocolType: 'ANY',
        sourceAddressType: 'ANY_IP_ADDRESS',
        destinationAddressType: 'IP_ADDRESS',
        destinationAddress: 'RuckusOne IP'
      },{
        priority: 2,
        description: 'Cloud mgmt.(https) (Default)',
        accessAction: 'INSPECT',
        protocolType: 'TCP',
        sourceAddressType: 'ANY_IP_ADDRESS',
        destinationAddressType: 'ANY_IP_ADDRESS',
        destinationPort: 443
      },{
        priority: 3,
        description: 'Cloud mgmt.(ntp) (Default)',
        accessAction: 'INSPECT',
        protocolType: 'UDP',
        sourceAddressType: 'ANY_IP_ADDRESS',
        destinationAddressType: 'ANY_IP_ADDRESS',
        destinationPort: 123
      },{
        priority: 4,
        description: undefined,
        accessAction: 'BLOCK',
        protocolType: 'IGMP',
        sourceAddressType: 'SUBNET_ADDRESS',
        sourceAddress: '1.2.3.4',
        sourceAddressMask: '255.255.0.0',
        sourcePort: undefined,
        destinationAddressType: 'SUBNET_ADDRESS',
        destinationAddress: '10.12.3.4',
        destinationAddressMask: '255.255.255.0',
        destinationPort: undefined
      }, {
        priority: 5,
        description: 'Default rule',
        accessAction: 'INSPECT',
        protocolType: 'ANY',
        sourceAddressType: 'ANY_IP_ADDRESS',
        destinationAddressType: 'ANY_IP_ADDRESS'
      }]
    }])
  }, 30000)
})
