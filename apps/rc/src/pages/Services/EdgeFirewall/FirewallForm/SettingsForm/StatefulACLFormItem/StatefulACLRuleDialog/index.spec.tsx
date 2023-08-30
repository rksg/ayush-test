import { within } from '@testing-library/react'
import userEvent  from '@testing-library/user-event'

import { ACLDirection, StatefulAclRule } from '@acx-ui/rc/utils'
import {
  render,
  screen } from '@acx-ui/test-utils'

import { StatefulACLRuleDialog, portNumberOrRangeCheck, portRangeCheck } from './'

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

const mockedSubmit = jest.fn()
const { click, type, selectOptions, clear } = userEvent

describe('Stateful ACL rule dialog', () => {
  beforeEach(() => {
    mockedSubmit.mockClear()
  })

  it('should correctly render', async () => {
    render(<StatefulACLRuleDialog
      direction={ACLDirection.INBOUND}
      visible={true}
      setVisible={jest.fn()}
      onSubmit={mockedSubmit}
      editMode={false}
      editData={{} as StatefulAclRule}
    />)

    const allowBtn = await screen.findByText(/Allow/)
    expect(screen.queryByText(/Inspect/)).toBeNull()
    await click(allowBtn)
    await selectOptions(
      await screen.findByRole('combobox', { name: 'Protocol Type' }),
      'Custom')
    await type(screen.getByRole('spinbutton', { name: 'Protocol Value' }), '20')

    // source setting
    const src = await screen.findByRole('group', { name: 'Source' })
    await click(await within(src).findByRole('radio', { name: 'IP Address' }))
    await type(within(src).getAllByRole('textbox')
      .filter(ele => ele.id === 'sourceAddress')[0], '1.2.3.4')

    // destination setting
    let destination = await screen.findByRole('group', { name: 'Destination' })
    await click(await within(destination).findByRole('radio', { name: 'Any IP Address' }))
    await type(within(destination).getByRole('textbox', { name: 'Port' }), '3100')

    await click(screen.getByRole('button', { name: 'Add' }))

    expect(mockedSubmit).toBeCalledWith({
      accessAction: 'ALLOW',
      protocolType: 'CUSTOM',
      protocolValue: 20,
      sourceAddressType: 'IP_ADDRESS',
      sourceAddress: '1.2.3.4',
      destinationAddressType: 'ANY_IP_ADDRESS',
      destinationPort: '3100'
    }, false)
  })

  it('should correctly when edit mode', async () => {
    render(<StatefulACLRuleDialog
      direction={ACLDirection.OUTBOUND}
      visible={true}
      setVisible={jest.fn()}
      onSubmit={mockedSubmit}
      editMode={true}
      editData={{
        priority: 1,
        description: undefined,
        accessAction: 'BLOCK',
        protocolType: 'TCP',
        sourceAddressType: 'IP_ADDRESS',
        sourceAddress: '1.2.3.4',
        sourcePort: undefined,
        destinationAddressType: 'IP_ADDRESS',
        destinationAddress: '10.2.3.4',
        destinationPort: '3200'
      } as StatefulAclRule}
    />)

    await screen.findByText(/Inspect/)
    expect(screen.queryByRole('radio', { name: /Block/ })).toBeChecked()
    expect(await screen.findByRole('combobox', { name: 'Protocol Type' })).toHaveValue('TCP')

    // edit destination setting
    const destination = await screen.findByRole('group', { name: 'Destination' })
    await click(await within(destination).findByRole('radio', { name: 'Subnet Address' }))
    const ipAddrInput = within(destination).getByPlaceholderText('Network address')
    await clear(ipAddrInput)
    await type(ipAddrInput, '10.12.3.5')
    await type(within(destination).getByPlaceholderText('Mask'), '255.255.255.0')

    // submit
    await click(screen.getByRole('button', { name: 'Apply' }))

    expect(mockedSubmit).toBeCalledWith({
      priority: 1,
      description: undefined,
      accessAction: 'BLOCK',
      protocolType: 'TCP',
      sourceAddressType: 'IP_ADDRESS',
      sourceAddress: '1.2.3.4',
      sourcePort: undefined,
      destinationAddressType: 'SUBNET_ADDRESS',
      destinationAddress: '10.12.3.5',
      destinationAddressMask: '255.255.255.0',
      destinationPort: '3200'
    }, true)
  })

  it('should reset form while want to `Add another rule`', async () => {
    render(<StatefulACLRuleDialog
      direction={ACLDirection.OUTBOUND}
      visible={true}
      setVisible={jest.fn()}
      onSubmit={mockedSubmit}
      editMode={false}
      editData={{} as StatefulAclRule}
    />)

    // add the first one
    await click(await screen.findByText(/Inspect/))
    await selectOptions(
      await screen.findByRole('combobox', { name: 'Protocol Type' }),
      'ICMP')

    // source setting
    let src = await screen.findByRole('group', { name: 'Source' })
    await click(await within(src).findByRole('radio', { name: 'Subnet Address' }))
    const ipAddrInput = within(src).getByPlaceholderText('Network address')
    await type(ipAddrInput, '112.110.0.1')
    await type(within(src).getByPlaceholderText('Mask'), '255.255.255.0')
    await type(within(src).getByRole('textbox', { name: 'Port' }), '100')

    // destination setting
    let destination = await screen.findByRole('group', { name: 'Destination' })
    await click(await within(destination).findByRole('radio', { name: 'IP Address' }))
    await type(within(destination).getAllByRole('textbox')
      .filter(ele => ele.id === 'destinationAddress')[0], '112.160.0.1')
    await type(within(destination).getByRole('textbox', { name: 'Port' }), '8080')

    await click(await screen.findByRole('checkbox', { name: 'Add another rule' }))
    await click(screen.getByRole('button', { name: 'Add' }))
    expect(mockedSubmit).toBeCalledWith({
      accessAction: 'INSPECT',
      protocolType: 'ICMP',
      sourceAddressType: 'SUBNET_ADDRESS',
      sourceAddress: '112.110.0.1',
      sourceAddressMask: '255.255.255.0',
      sourcePort: '100',
      destinationAddressType: 'IP_ADDRESS',
      destinationAddress: '112.160.0.1',
      destinationPort: '8080'
    }, false)

    // add the second rule
    expect(screen.queryByRole('radio', { name: /Allow/ })).not.toBeChecked()
    expect(screen.queryByRole('radio', { name: /Block/ })).not.toBeChecked()
    expect(screen.queryByRole('radio', { name: /Inspect/ })).not.toBeChecked()
    expect(await screen.findByRole('combobox', { name: 'Protocol Type' })).toHaveValue('ANY')

    src = await screen.findByRole('group', { name: 'Source' })
    expect(await within(src).findByRole('radio', { name: 'Any IP Address' })).toBeChecked()
    destination = await screen.findByRole('group', { name: 'Destination' })
    expect(await within(destination).findByRole('radio', { name: 'Any IP Address' })).toBeChecked()
  })

  describe('portNumberOrRangeCheck', () => {
    it('should be okay when using empty value', async () => {
      expect(await portNumberOrRangeCheck('')).toBe(undefined)
      expect(await portNumberOrRangeCheck(undefined)).toBe(undefined)
      expect(await portNumberOrRangeCheck(null)).toBe(undefined)
      expect(await portNumberOrRangeCheck(0)).toBe(undefined)
    })

    it('should correctly work', async () => {
      expect(await portNumberOrRangeCheck('10')).toBe(undefined)

      expect(await portNumberOrRangeCheck('10')).toBe(undefined)
      expect(await portNumberOrRangeCheck('10-20')).toBe(undefined)
    })

    it('should return `Invalid port number`', async () => {
      await expect(portNumberOrRangeCheck('-10')).rejects.toBe('Invalid port number')
      await expect(portNumberOrRangeCheck('70000')).rejects.toBe('Invalid port number')
    })

    it('should return `Range should be splitted by -`', async () => {
      await expect(portNumberOrRangeCheck('nonNum')).rejects.toBe('Range should be splitted by -')
    })

    it('should return `Invalid port range`', async () => {
      await expect(portNumberOrRangeCheck('30-10')).rejects.toBe('Invalid port range')
      await expect(portNumberOrRangeCheck('10-10')).rejects.toBe('Invalid port range')
      await expect(portNumberOrRangeCheck('a-10')).rejects.toBe('Invalid port range')
    })
  })

  describe('portRangeCheck', () => {
    it('should be okay when using empty value', async () => {
      expect(await portRangeCheck('')).toBe(undefined)
      expect(await portRangeCheck(undefined)).toBe(undefined)
      expect(await portRangeCheck(null)).toBe(undefined)
      expect(await portRangeCheck(0)).toBe(undefined)
    })

    it('should correctly work', async () => {
      expect(await portRangeCheck('10-20')).toBe(undefined)
    })
    it('should return `Range should be splitted by -`', async () => {
      await expect(portRangeCheck('10')).rejects.toBe('Range should be splitted by -')
      await expect(portRangeCheck('nonNum')).rejects.toBe('Range should be splitted by -')
    })

    it('should return `Invalid port range`', async () => {
      await expect(portRangeCheck('30-10')).rejects.toBe('Invalid port range')
      await expect(portRangeCheck('10-10')).rejects.toBe('Invalid port range')
      await expect(portRangeCheck('a-10')).rejects.toBe('Invalid port range')
    })
  })
})
