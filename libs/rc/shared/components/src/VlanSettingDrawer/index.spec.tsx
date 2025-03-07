import '@testing-library/jest-dom'
import userEvent        from '@testing-library/user-event'
import { IntlProvider } from 'react-intl'

import { render, screen, fireEvent, within } from '@acx-ui/test-utils'

import { VlanSettingDrawer, checkVlanRange } from '.'

jest.mock('./VlanPortsSetting/VlanPortsModal', () => ({
  VlanPortsModal: () => <div data-testid='VlanPortsModal' />
}))

describe('VlanSettingDrawer', () => {
  const vlans = [{
    arpInspection: false,
    id: '545d08c0e7894501846455233ad60cc5',
    igmpSnooping: 'none',
    ipv4DhcpSnooping: false,
    spanningTreePriority: 32768,
    spanningTreeProtocol: 'none',
    switchFamilyModels: [{
      id: '9874453239bc479fac68bc050d0cf729',
      model: 'ICX7550-24P',
      slots: [
        { slotNumber: 1, enable: true },
        { slotNumber: 3, enable: true, option: '2X40G' },
        { slotNumber: 2, enable: true, option: '2X40G' }
      ],
      taggedPorts: '',
      untaggedPorts: ''
    }],
    vlanId: 2,
    vlanName: 'vlan-01'
  }, {
    arpInspection: false,
    id: '1af3d29b5dcc46a5a20a651fda55e2df',
    igmpSnooping: 'none',
    ipv4DhcpSnooping: false,
    spanningTreePriority: 32768,
    spanningTreeProtocol: 'none',
    switchFamilyModels: [{
      id: '9874453239bc479fac68bc050d0cf729',
      model: 'ICX7850-48F',
      slots: [
        { slotNumber: 1, enable: true },
        { slotNumber: 3, enable: true, option: '2X40G' },
        { slotNumber: 2, enable: true, option: '2X40G' }
      ],
      taggedPorts: '1/2/2',
      untaggedPorts: '1/1/20,1/3/2'
    }],
    vlanId: 3,
    vlanName: 'vlan-02'
  }]

  it('should render correctly', async () => {
    render(<IntlProvider locale='en'>
      <VlanSettingDrawer
        editMode={false}
        visible={true}
        setVisible={jest.fn()}
        vlan={{}}
        setVlan={jest.fn()}
        vlansList={[]}
      />
    </IntlProvider>)
    expect(screen.getByText('Add VLAN')).toBeDefined()
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
  })

  it('should handle error correctly', async () => {
    render(<IntlProvider locale='en'>
      <VlanSettingDrawer
        editMode={false}
        visible={true}
        setVisible={jest.fn()}
        vlan={{}}
        setVlan={jest.fn()}
        vlansList={[]}
      />
    </IntlProvider>)
    expect(screen.getByText('Add VLAN')).toBeDefined()
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
  })

  it('should add Vlan correctly', async () => {
    render(<IntlProvider locale='en'>
      <VlanSettingDrawer
        editMode={false}
        visible={true}
        setVisible={jest.fn()}
        vlan={{}}
        setVlan={jest.fn()}
        vlansList={[]}
      />
    </IntlProvider>)
    expect(screen.getByText('Add VLAN')).toBeDefined()
    const vIdInput = await screen.findByLabelText('VLAN ID')
    fireEvent.change(vIdInput, { target: { value: '1' } })

    const IGMPSnooping = await screen.findByLabelText('IGMP Snooping')
    fireEvent.mouseDown(IGMPSnooping)
    fireEvent.click(await screen.findByText('Active'))

    // TODO
    // fireEvent.mouseDown(IGMPSnooping)
    // fireEvent.click(await screen.findByLabelText('NONE'))

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
  })

  it('should render edit mode correctly', async () => {
    render(<IntlProvider locale='en'>
      <VlanSettingDrawer
        editMode={true}
        visible={true}
        setVisible={jest.fn()}
        vlan={vlans[0]}
        setVlan={jest.fn()}
        vlansList={[vlans[1]]}
      />
    </IntlProvider>)
    expect(screen.getByText('Edit VLAN')).toBeDefined()
  })

  it('should edit model correctly', async () => {
    render(<IntlProvider locale='en'>
      <VlanSettingDrawer
        editMode={true}
        visible={true}
        setVisible={jest.fn()}
        vlan={vlans[1]}
        setVlan={jest.fn()}
        vlansList={[]}
      />
    </IntlProvider>)
    expect(screen.getByText('Edit VLAN')).toBeDefined()

    const IGMPSnooping = await screen.findByLabelText('IGMP Snooping')
    fireEvent.mouseDown(IGMPSnooping)
    fireEvent.click(await screen.findByText('Passive'))

    const row = await screen.findByRole('row', { name: /ICX7850-48F/i })
    fireEvent.click(await within(row).findByRole('radio'))
    fireEvent.click(await screen.findByRole('button', { name: /Edit/i }))
    expect(await screen.findByTestId('VlanPortsModal')).toBeVisible()
  })


  it('should delete and add model correctly', async () => {
    render(<IntlProvider locale='en'>
      <VlanSettingDrawer
        editMode={true}
        visible={true}
        setVisible={jest.fn()}
        vlan={vlans[1]}
        setVlan={jest.fn()}
        vlansList={[]}
      />
    </IntlProvider>)
    expect(screen.getByText('Edit VLAN')).toBeDefined()
    const row = await screen.findByRole('row', { name: /ICX7850-48F/i })
    fireEvent.click(await within(row).findByRole('radio'))
    fireEvent.click(await screen.findByRole('button', { name: /Delete/i }))

    await screen.findByText(/Delete "ICX7850-48F"?/i)
    fireEvent.click(await screen.findByRole('button', { name: /Delete Model/i }))

    fireEvent.click(await screen.findByRole('button', { name: /Add Model/i }))
    expect(await screen.findByTestId('VlanPortsModal')).toBeVisible()
  })

  it('should render correctly in switch level', async () => {
    const applyVlan =jest.fn()
    render(<IntlProvider locale='en'>
      <VlanSettingDrawer
        editMode={false}
        visible={true}
        setVisible={jest.fn()}
        vlan={{}}
        setVlan={jest.fn()}
        vlansList={[]}
        switchFamilyModel='ICX7150-C08P'
        enablePortModelConfigure={true}
        setVlan={applyVlan}
        vlansList={[]}
      />
    </IntlProvider>)
    expect(screen.getByText('Add VLAN')).toBeDefined()
    expect(await screen.findByText('Add Ports')).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
  })
})

describe('checkVlanRange', () => {
  it('should render correctly', () => {
    expect(checkVlanRange('20')).toStrictEqual({
      isIncludeOriginal: true, isLengthValid: true,isValidRange: true, isVlanDuplicate: false,
      vlans: ['20']
    })
    expect(checkVlanRange('1-5, 10, 11-12')).toStrictEqual({
      isIncludeOriginal: true, isLengthValid: true, isValidRange: true, isVlanDuplicate: false,
      vlans: ['1', '2', '3', '4', '5', '10', '11', '12']
    })
    expect(checkVlanRange('1-20,22,30-100')).toStrictEqual({
      isIncludeOriginal: true, isLengthValid: true, isValidRange: true, isVlanDuplicate: false,
      vlans: expect.arrayContaining(['22', '98', '99', '100'])
    })
    expect(checkVlanRange('1-20, 22, 30-100')).toStrictEqual({
      isIncludeOriginal: true, isLengthValid: true, isValidRange: true, isVlanDuplicate: false,
      vlans: expect.any(Array)
    })
    expect(checkVlanRange('1-10, 10-15')).toStrictEqual({
      isIncludeOriginal: true, isLengthValid: true, isValidRange: true, isVlanDuplicate: true,
      vlans: expect.any(Array)
    })
    expect(checkVlanRange('1-10, 100-1000000000')).toStrictEqual({
      isIncludeOriginal: true, isLengthValid: true, isValidRange: false, isVlanDuplicate: false,
      vlans: expect.any(Array)
    })
    expect(checkVlanRange('20-30', '20')).toStrictEqual({
      isIncludeOriginal: true, isLengthValid: true, isValidRange: true, isVlanDuplicate: false,
      vlans: expect.any(Array)
    })
    expect(checkVlanRange('1, 10,25-30, 20', '20')).toStrictEqual({
      isIncludeOriginal: true, isLengthValid: true, isValidRange: true, isVlanDuplicate: false,
      vlans: expect.any(Array)
    })
    expect(checkVlanRange('25-30', '20')).toStrictEqual({
      isIncludeOriginal: false, isLengthValid: true, isValidRange: true, isVlanDuplicate: false,
      vlans: ['25', '26', '27', '28', '29', '30']
    })
    expect(checkVlanRange('1-1025')).toStrictEqual({
      isIncludeOriginal: true, isLengthValid: false, isValidRange: true, isVlanDuplicate: false,
      vlans: expect.any(Array)
    })
    expect(checkVlanRange('100-200, 1000-2000')).toStrictEqual({
      isIncludeOriginal: true, isLengthValid: false, isValidRange: true, isVlanDuplicate: false,
      vlans: expect.any(Array)
    })
  })
})