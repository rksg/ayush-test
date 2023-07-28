import { useState } from 'react'

import userEvent from '@testing-library/user-event'

import { switchApi } from '@acx-ui/rc/services'
import {
  Acl } from '@acx-ui/rc/utils'
import { Provider, store }                               from '@acx-ui/store'
import { fireEvent, render, renderHook, screen, within } from '@acx-ui/test-utils'

import { ACLSettingDrawer } from '.'

jest.mock('antd', () => {
  const antd = jest.requireActual('antd')

  // @ts-ignore
  const Select = ({ children, onChange, ...otherProps }) => {
    return (
      <select
        role='combobox'
        onChange={e => onChange(e.target.value)}
        {...otherProps}>
        {children}
      </select>
    )
  }

  // @ts-ignore
  Select.Option = ({ children, ...otherProps }) => {
    return <option {...otherProps}>{children}</option>
  }

  return { ...antd, Select }
})

describe('ACLSettingDrawer', () => {
  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
  })

  it('should close drawer', async () => {
    const { result: drawerVisible } = renderHook(() => {
      const [ visible, setVisible ] = useState(true)
      const [ editMode, setEditMode ] = useState(false)
      const [ drawerFormRule, setDrawerFormRule ] = useState<Acl>()
      const [ aclsTable, setAclsTable ] = useState<Acl[]>([])
      return { visible, setVisible, editMode, setEditMode,
        aclsTable, setAclsTable, drawerFormRule, setDrawerFormRule }
    })

    render(<Provider>
      <ACLSettingDrawer
        editMode={drawerVisible.current.editMode}
        visible={drawerVisible.current.visible}
        setVisible={drawerVisible.current.setVisible}
        rule={drawerVisible.current.drawerFormRule}
        setRule={drawerVisible.current.setDrawerFormRule}
        aclsTable={drawerVisible.current.aclsTable}
      /></Provider>
    )

    fireEvent.click(await screen.findByRole('button', { name: 'Add Rule' }))
    const dialog = await screen.findAllByRole('dialog')
    fireEvent.click(await within(dialog[1]).findByRole('button', { name: 'Cancel' }))

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))

    expect(drawerVisible.current.visible).toEqual(false)
  })

  it.skip('should add acl correctly', async () => {
    const user = userEvent.setup()
    const { result: drawerVisible } = renderHook(() => {
      const [ visible, setVisible ] = useState(true)
      const [ editMode, setEditMode ] = useState(false)
      const [ drawerFormRule, setDrawerFormRule ] = useState<Acl>()
      const [ aclsTable, setAclsTable ] = useState<Acl[]>([])
      return { visible, setVisible, editMode, setEditMode,
        aclsTable, setAclsTable, drawerFormRule, setDrawerFormRule }
    })

    render(<Provider>
      <ACLSettingDrawer
        editMode={drawerVisible.current.editMode}
        visible={drawerVisible.current.visible}
        setVisible={drawerVisible.current.setVisible}
        rule={drawerVisible.current.drawerFormRule}
        setRule={drawerVisible.current.setDrawerFormRule}
        aclsTable={drawerVisible.current.aclsTable}
      /></Provider>
    )

    const aclNameInput = await screen.findByLabelText('ACL Name')

    fireEvent.change(aclNameInput, { target: { value: '11' } })

    fireEvent.click(await screen.findByRole('radio', { name: 'Extended' }))

    fireEvent.click(await screen.findByRole('button', { name: 'Add Rule' }))

    const dialog = await screen.findAllByRole('dialog')
    const sequenceInput = await within(dialog[1]).findByLabelText('Sequence')
    fireEvent.change(sequenceInput, { target: { value: '11' } })

    const specSubnet = await within(dialog[1]).findAllByRole('radio', { name: 'Specific Subnet' })
    await user.click(specSubnet[0])
    await user.click(specSubnet[1])

    const specInput = await within(dialog[1]).findAllByPlaceholderText('e.g 1.1.1.1/24')
    fireEvent.change(specInput[0], { target: { value: '1.1.1.1/24' } })
    fireEvent.change(specInput[1], { target: { value: '2.2.2.2/24' } })

    const protocolCombo = await within(dialog[1]).findByRole('combobox', { name: 'Protocol' })
    await user.click(protocolCombo)
    await user.click(await within(dialog[1]).findByText('TCP'))

    const srcPortInput = await within(dialog[1]).findByLabelText('Source Port')
    fireEvent.change(srcPortInput, { target: { value: '123' } })

    const destPortInput = await within(dialog[1]).findByLabelText('Destination Port')
    fireEvent.change(destPortInput, { target: { value: '234' } })

    fireEvent.click(await within(dialog[1]).findByRole('button', { name: 'OK' }))

    fireEvent.click(await screen.findByRole('button', { name: 'Add' }))
  })

  it.skip('should render protocol option correctly', async () => {
    const user = userEvent.setup()
    const { result: drawerVisible } = renderHook(() => {
      const [ visible, setVisible ] = useState(true)
      const [ editMode, setEditMode ] = useState(false)
      const [ drawerFormRule, setDrawerFormRule ] = useState<Acl>()
      const [ aclsTable, setAclsTable ] = useState<Acl[]>([])
      return { visible, setVisible, editMode, setEditMode,
        aclsTable, setAclsTable, drawerFormRule, setDrawerFormRule }
    })

    render(<Provider>
      <ACLSettingDrawer
        editMode={drawerVisible.current.editMode}
        visible={drawerVisible.current.visible}
        setVisible={drawerVisible.current.setVisible}
        rule={drawerVisible.current.drawerFormRule}
        setRule={drawerVisible.current.setDrawerFormRule}
        aclsTable={drawerVisible.current.aclsTable}
      /></Provider>
    )

    fireEvent.click(await screen.findByRole('radio', { name: 'Extended' }))

    const row = await screen.findByRole('row', { name: /65000/ })
    fireEvent.click(await within(row).findByRole('radio'))
    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }) )

    const dialog = await screen.findAllByRole('dialog')
    const protocolCombo = await within(dialog[1]).findByRole('combobox', { name: 'Protocol' })
    await user.click(protocolCombo)
    await user.click(await within(dialog[1]).findByText('TCP'))

    await user.click(protocolCombo)
    await user.click(await within(dialog[1]).findByText('IP'))

    fireEvent.click(await within(dialog[1]).findByRole('button', { name: 'OK' }))

    fireEvent.click(await screen.findByRole('button', { name: 'Add' }))
    drawerVisible.current.setVisible(false)
  })

  it('should delete rule correctly', async () => {
    const { result: drawerVisible } = renderHook(() => {
      const [ visible, setVisible ] = useState(true)
      const [ editMode, setEditMode ] = useState(false)
      const [ drawerFormRule, setDrawerFormRule ] = useState<Acl>()
      const [ aclsTable, setAclsTable ] = useState<Acl[]>([])
      return { visible, setVisible, editMode, setEditMode,
        aclsTable, setAclsTable, drawerFormRule, setDrawerFormRule }
    })

    render(<Provider>
      <ACLSettingDrawer
        editMode={drawerVisible.current.editMode}
        visible={drawerVisible.current.visible}
        setVisible={drawerVisible.current.setVisible}
        rule={drawerVisible.current.drawerFormRule}
        setRule={drawerVisible.current.setDrawerFormRule}
        aclsTable={drawerVisible.current.aclsTable}
      /></Provider>
    )

    fireEvent.click(await screen.findByRole('radio', { name: 'Standard' }))

    fireEvent.click(await screen.findByRole('button', { name: 'Add Rule' }) )

    const dialog = await screen.findAllByRole('dialog')

    const sequenceInput = await within(dialog[1]).findByLabelText('Sequence')
    fireEvent.change(sequenceInput, { target: { value: '11' } })

    fireEvent.click(await within(dialog[1]).findByRole('button', { name: 'OK' }))

    const row = await screen.findByRole('row', { name: /11/ })
    fireEvent.click(await within(row).findByRole('radio'))
    fireEvent.click(await screen.findByRole('button', { name: 'Delete' }) )

    fireEvent.click(await screen.findByRole('button', { name: 'Add' }))
  })
})
