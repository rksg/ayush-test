
import { waitForElementToBeRemoved, within } from '@testing-library/react'
import userEvent                             from '@testing-library/user-event'
import _                                     from 'lodash'

import { ACLDirection, StatefulAcl } from '@acx-ui/rc/utils'
import { Provider }                  from '@acx-ui/store'
import {
  render,
  screen } from '@acx-ui/test-utils'

import { mockedDefaultValue }         from '../../../__tests__/fixtures'
import { StatefulACLRuleDialogProps } from '../StatefulACLRuleDialog'

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
  return { ...components, Select }
})

const mockedEmptyInbound = {
  name: 'Inbound ACL',
  description: '',
  direction: 'INBOUND'
} as StatefulAcl

const mockedSetFieldValue = jest.fn()
const mockedGetFieldValue = jest.fn()
const mockedGetRuleSubmitData = jest.fn()
const { click } = userEvent

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  useStepFormContext: () => ({
    form: {
      getFieldValue: mockedGetFieldValue.mockReturnValue(mockedDefaultValue),
      setFieldValue: mockedSetFieldValue
    }
  })
}))

jest.mock('../StatefulACLRuleDialog', () => ({
  ...jest.requireActual('../StatefulACLRuleDialog'),
  StatefulACLRuleDialog: (props: StatefulACLRuleDialogProps) => {
    const submitData = mockedGetRuleSubmitData()
    return props.visible && <div data-testid='rc-StatefulACLRuleDialog'>
      <button onClick={() => {
        props.onSubmit(submitData, props.editMode)
        props.setVisible(false)
      }}>Submit</button>
    </div>
  }
}))

describe('Stateful ACL config drawer', () => {
  beforeEach(() => {
    mockedGetFieldValue.mockReset()
    mockedSetFieldValue.mockReset()
    mockedGetRuleSubmitData.mockReset()
  })

  it('should correctly handle delete', async () => {
    const mockedData = _.cloneDeep(mockedDefaultValue[1]) as StatefulAcl
    mockedData.rules.splice(3, 0, {
      priority: 4,
      accessAction: 'ALLOW',
      protocolType: 'CUSTOM',
      protocolValue: 20,
      sourceAddressType: 'IP_ADDRESS',
      sourceAddress: '1.2.3.4',
      destinationAddressType: 'ANY_IP_ADDRESS',
      destinationPort: '3100'
    }, {
      priority: 5,
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
    })
    mockedData.rules[mockedData.rules.length - 1].priority = mockedData.rules.length

    render(<StatefulACLConfigDrawer
      visible={true}
      setVisible={jest.fn()}
      editData={mockedData}
    />)

    expect(await screen.findByText('Stateful ACL Settings')).toBeVisible()

    // check rules
    await screen.findByRole('row', { name: /Custom/ })
    const igmpRow = await screen.findByRole('row', { name: /IGMP/ })
    await click(await within(igmpRow).findByRole('checkbox'))

    // delete tcp rule
    await click(await screen.findByRole('button', { name: 'Delete' }))
    const dialogTitle = await screen.findByText('Delete "5"?')
    await click(await screen.findByRole('button', { name: 'Delete Rule' }))
    await waitForElementToBeRemoved(dialogTitle)

    // submit
    await click(screen.getByRole('button', { name: 'Add' }))

    const inboundData = mockedDefaultValue.filter(o => o.direction === ACLDirection.INBOUND)[0]
    expect(mockedSetFieldValue).toBeCalledWith('statefulAcls', [inboundData, {
      name: 'Outbound ACL',
      direction: 'OUTBOUND',
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
        accessAction: 'ALLOW',
        protocolType: 'CUSTOM',
        protocolValue: 20,
        sourceAddressType: 'IP_ADDRESS',
        sourceAddress: '1.2.3.4',
        destinationAddressType: 'ANY_IP_ADDRESS',
        destinationPort: '3100'
      }, {
        priority: 5,
        description: 'Default rule',
        accessAction: 'INSPECT',
        protocolType: 'ANY',
        sourceAddressType: 'ANY_IP_ADDRESS',
        destinationAddressType: 'ANY_IP_ADDRESS'
      }]
    }])
  })
  describe('handleStatefulACLRuleSubmit', () => {
    it('should correctly handle add rule', async () => {
      mockedGetRuleSubmitData.mockReturnValue({
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
      })

      render(
        <Provider>
          <StatefulACLConfigDrawer
            visible={true}
            setVisible={jest.fn()}
            editData={mockedEmptyInbound}
          />
        </Provider>)

      expect(await screen.findByText('Stateful ACL Settings')).toBeVisible()

      await click(screen.getByRole('button', { name: 'Add Rule' }))
      await screen.findByTestId('rc-StatefulACLRuleDialog')
      await click(await screen.findByRole('button', { name: 'Submit' }))

      // submit
      await click(screen.getByRole('button', { name: 'Add' }))

      const outboundData = mockedDefaultValue.filter(o => o.direction === ACLDirection.OUTBOUND)[0]
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

    it('should correctly handle edit', async () => {
      const mockedData = _.cloneDeep(mockedDefaultValue[1]) as StatefulAcl
      mockedData.rules.splice(3, 0, {
        priority: 4,
        accessAction: 'BLOCK',
        protocolType: 'ICMP',
        sourceAddressType: 'IP_ADDRESS',
        sourceAddress: '10.12.0.1',
        destinationAddressType: 'ANY_IP_ADDRESS',
        destinationPort: '200'
      })
      mockedData.rules[mockedData.rules.length - 1].priority = mockedData.rules.length
      mockedGetRuleSubmitData.mockReturnValue({
        priority: 4,
        accessAction: 'BLOCK',
        protocolType: 'ICMP',
        sourceAddressType: 'IP_ADDRESS',
        sourceAddress: '10.12.0.1',
        destinationAddressType: 'ANY_IP_ADDRESS',
        destinationPort: '200'
      })

      render(<StatefulACLConfigDrawer
        visible={true}
        setVisible={jest.fn()}
        editData={mockedData}
      />)

      expect(await screen.findByText('Stateful ACL Settings')).toBeVisible()

      // check rules
      const icmpRow = await screen.findByRole('row', { name: /ICMP/ })
      await click(await within(icmpRow).findByRole('checkbox'))

      // edit ICMP rule
      await click(await screen.findByRole('button', { name: 'Edit' }))
      await screen.findByTestId('rc-StatefulACLRuleDialog')
      await click(await screen.findByRole('button', { name: 'Submit' }))

      // submit
      await click(screen.getByRole('button', { name: 'Add' }))

      const inboundData = mockedDefaultValue.filter(o => o.direction === ACLDirection.INBOUND)[0]
      expect(mockedSetFieldValue).toBeCalledWith('statefulAcls', [inboundData, {
        name: 'Outbound ACL',
        direction: 'OUTBOUND',
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
          accessAction: 'BLOCK',
          protocolType: 'ICMP',
          sourceAddressType: 'IP_ADDRESS',
          sourceAddress: '10.12.0.1',
          destinationAddressType: 'ANY_IP_ADDRESS',
          destinationPort: '200'
        }, {
          priority: 5,
          description: 'Default rule',
          accessAction: 'INSPECT',
          protocolType: 'ANY',
          sourceAddressType: 'ANY_IP_ADDRESS',
          destinationAddressType: 'ANY_IP_ADDRESS'
        }]
      }])
    })

    it('when the submit data use an absent priority in edit mode', async () => {
      const mockedData = _.cloneDeep(mockedDefaultValue[0]) as StatefulAcl
      mockedData.rules.splice(0, 0, {
        priority: 1,
        accessAction: 'ALLOW',
        protocolType: 'IGMP',
        sourceAddressType: 'IP_ADDRESS',
        sourceAddress: '10.12.0.1',
        destinationAddressType: 'ANY_IP_ADDRESS',
        destinationPort: '200'
      })
      mockedData.rules[mockedData.rules.length - 1].priority = mockedData.rules.length

      mockedGetRuleSubmitData.mockReturnValue({
        priority: 100,
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
      })

      render(
        <Provider>
          <StatefulACLConfigDrawer
            visible={true}
            setVisible={jest.fn()}
            editData={mockedData}
          />
        </Provider>)

      expect(await screen.findByText('Stateful ACL Settings')).toBeVisible()
      const icmpRow = await screen.findByRole('row', { name: /IGMP/ })
      await click(await within(icmpRow).findByRole('checkbox'))

      // edit ICMP rule
      await click(await screen.findByRole('button', { name: 'Edit' }))
      await screen.findByTestId('rc-StatefulACLRuleDialog')
      await click(await screen.findByRole('button', { name: 'Submit' }))

      // submit
      await click(screen.getByRole('button', { name: 'Add' }))

      const outboundData = mockedDefaultValue.filter(o => o.direction === ACLDirection.OUTBOUND)[0]
      expect(mockedSetFieldValue).toBeCalledWith('statefulAcls', [{
        name: 'Inbound ACL',
        direction: 'INBOUND',
        rules: [{
          priority: 1,
          accessAction: 'ALLOW',
          protocolType: 'IGMP',
          sourceAddressType: 'IP_ADDRESS',
          sourceAddress: '10.12.0.1',
          destinationAddressType: 'ANY_IP_ADDRESS',
          destinationPort: '200'
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
  })
})
