import { useState } from 'react'

import userEvent             from '@testing-library/user-event'
import { DefaultOptionType } from 'antd/lib/select'
import { rest }              from 'msw'

import { switchApi } from '@acx-ui/rc/services'
import {
  SwitchUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store }                                from '@acx-ui/store'
import { mockServer, render, renderHook, screen, within } from '@acx-ui/test-utils'

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
    mockServer.use(
      rest.post(SwitchUrlsInfo.addAcl.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })

  it('should close drawer', async () => {
    const { result: drawerVisible } = renderHook(() => {
      const [ visible, setVisible ] = useState(true)
      const [aclsOptions, setAclsOptions] = useState([] as DefaultOptionType[])
      return { visible, setVisible, aclsOptions, setAclsOptions }
    })

    render(<Provider>
      <ACLSettingDrawer
        visible={drawerVisible.current.visible}
        setVisible={drawerVisible.current.setVisible}
        aclsOptions={drawerVisible.current.aclsOptions}
        setAclsOptions={drawerVisible.current.setAclsOptions}
        profileId={'1'}
      /></Provider>
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Add Rule' }))
    const dialog = await screen.findAllByRole('dialog')
    await userEvent.click(await within(dialog[1]).findByRole('button', { name: 'Cancel' }))

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))

    expect(drawerVisible.current.visible).toEqual(false)
  })

  it('should add acl correctly', async () => {
    const { result: drawerVisible } = renderHook(() => {
      const [ visible, setVisible ] = useState(true)
      const [aclsOptions, setAclsOptions] = useState([] as DefaultOptionType[])
      return { visible, setVisible, aclsOptions, setAclsOptions }
    })

    render(<Provider>
      <ACLSettingDrawer
        visible={drawerVisible.current.visible}
        setVisible={drawerVisible.current.setVisible}
        aclsOptions={drawerVisible.current.aclsOptions}
        setAclsOptions={drawerVisible.current.setAclsOptions}
        profileId={'1'}
      /></Provider>
    )

    const aclNameInput = await screen.findByLabelText('ACL Name')
    await userEvent.type(aclNameInput, '11')

    await userEvent.click(await screen.findByRole('radio', { name: 'Extended' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Add Rule' }))

    const dialog = await screen.findAllByRole('dialog')
    const sequenceInput = await within(dialog[1]).findByLabelText('Sequence')
    await userEvent.type(sequenceInput, '11')

    const specSubnet = await within(dialog[1]).findAllByRole('radio', { name: 'Specific Subnet' })
    await userEvent.click(specSubnet[0])
    await userEvent.click(specSubnet[1])

    const specInput = await within(dialog[1]).findAllByPlaceholderText('e.g 1.1.1.1/24')

    await userEvent.type(specInput[0], '1.1.1.1/24')
    await userEvent.type(specInput[1], '2.2.2.2/24')

    const protocolCombo = await within(dialog[1]).findByRole('combobox', { name: 'Protocol' })
    await userEvent.click(protocolCombo)
    await userEvent.click(await within(dialog[1]).findByText('TCP'))

    const srcPortInput = await within(dialog[1]).findByLabelText('Source Port')

    await userEvent.type(srcPortInput, '123')

    const destPortInput = await within(dialog[1]).findByLabelText('Destination Port')

    await userEvent.type(destPortInput, '234')
    await userEvent.click(await within(dialog[1]).findByRole('button', { name: 'OK' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
  })

  it('should render protocol option correctly', async () => {
    const { result: drawerVisible } = renderHook(() => {
      const [ visible, setVisible ] = useState(true)
      const [aclsOptions, setAclsOptions] = useState([] as DefaultOptionType[])
      return { visible, setVisible, aclsOptions, setAclsOptions }
    })

    render(<Provider>
      <ACLSettingDrawer
        visible={drawerVisible.current.visible}
        setVisible={drawerVisible.current.setVisible}
        aclsOptions={drawerVisible.current.aclsOptions}
        setAclsOptions={drawerVisible.current.setAclsOptions}
        profileId={'1'}
      /></Provider>
    )

    const aclNameInput = await screen.findByLabelText('ACL Name')
    await userEvent.type(aclNameInput, '111')

    const extRadio = await screen.findByRole('radio', { name: 'Extended' })
    await userEvent.click(extRadio)

    const row = await screen.findByRole('row', { name: /65000/ })
    await userEvent.click(await within(row).findByRole('radio'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }) )

    const dialog = await screen.findAllByRole('dialog')
    const protocolCombo = await within(dialog[1]).findByRole('combobox', { name: 'Protocol' })
    await userEvent.click(protocolCombo)
    await userEvent.click(await within(dialog[1]).findByText('TCP'))

    await userEvent.click(protocolCombo)
    await userEvent.click(await within(dialog[1]).findByText('IP'))

    const okButton = await within(dialog[1]).findByRole('button', { name: 'OK' })
    const saveButton = await screen.findByRole('button', { name: 'Save' })
    await userEvent.click(okButton)
    await userEvent.click(saveButton)
  })

  it('should delete rule correctly', async () => {
    const { result: drawerVisible } = renderHook(() => {
      const [ visible, setVisible ] = useState(true)
      const [aclsOptions, setAclsOptions] = useState([] as DefaultOptionType[])
      return { visible, setVisible, aclsOptions, setAclsOptions }
    })

    render(<Provider>
      <ACLSettingDrawer
        visible={drawerVisible.current.visible}
        setVisible={drawerVisible.current.setVisible}
        aclsOptions={drawerVisible.current.aclsOptions}
        setAclsOptions={drawerVisible.current.setAclsOptions}
        profileId={'1'}
      /></Provider>
    )

    const aclNameInput = await screen.findByLabelText('ACL Name')
    await userEvent.type(aclNameInput, '11')

    await userEvent.click(await screen.findByRole('radio', { name: 'Standard' }))

    await userEvent.click(await screen.findByRole('button', { name: 'Add Rule' }) )

    const dialog = await screen.findAllByRole('dialog')

    const sequenceInput = await within(dialog[1]).findByLabelText('Sequence')
    await userEvent.type(sequenceInput, '11')

    await userEvent.click(await within(dialog[1]).findByRole('button', { name: 'OK' }))

    const row = await screen.findByRole('row', { name: /11/ })
    await userEvent.click(await within(row).findByRole('radio'))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }) )

    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
  })
})
