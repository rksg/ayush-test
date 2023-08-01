import { useState } from 'react'

import userEvent             from '@testing-library/user-event'
import { DefaultOptionType } from 'antd/lib/select'
import { rest }              from 'msw'
import { act }               from 'react-dom/test-utils'

import { switchApi } from '@acx-ui/rc/services'
import {
  SwitchUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store }                                           from '@acx-ui/store'
import { fireEvent, mockServer, render, renderHook, screen, within } from '@acx-ui/test-utils'

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

    fireEvent.click(await screen.findByRole('button', { name: 'Add Rule' }))
    const dialog = await screen.findAllByRole('dialog')
    fireEvent.click(await within(dialog[1]).findByRole('button', { name: 'Cancel' }))

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

    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.change(aclNameInput, { target: { value: '11' } })
    })

    await userEvent.click(await screen.findByRole('radio', { name: 'Extended' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Add Rule' }))

    const dialog = await screen.findAllByRole('dialog')
    const sequenceInput = await within(dialog[1]).findByLabelText('Sequence')
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.change(sequenceInput, { target: { value: '11' } })
    })

    const specSubnet = await within(dialog[1]).findAllByRole('radio', { name: 'Specific Subnet' })
    await userEvent.click(specSubnet[0])
    await userEvent.click(specSubnet[1])

    const specInput = await within(dialog[1]).findAllByPlaceholderText('e.g 1.1.1.1/24')

    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.change(specInput[0], { target: { value: '1.1.1.1/24' } })
      fireEvent.change(specInput[1], { target: { value: '2.2.2.2/24' } })
    })

    const protocolCombo = await within(dialog[1]).findByRole('combobox', { name: 'Protocol' })
    await userEvent.click(protocolCombo)
    await userEvent.click(await within(dialog[1]).findByText('TCP'))

    const srcPortInput = await within(dialog[1]).findByLabelText('Source Port')

    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.change(srcPortInput, { target: { value: '123' } })
    })

    const destPortInput = await within(dialog[1]).findByLabelText('Destination Port')

    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.change(destPortInput, { target: { value: '234' } })
    })

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
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.change(aclNameInput, { target: { value: '111' } })
    })

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      const extRadio = await screen.findByRole('radio', { name: 'Extended' })
      fireEvent.click(extRadio)
    })

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
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.click(okButton)
      fireEvent.click(saveButton)
      drawerVisible.current.setVisible(false)
    })
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
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.change(aclNameInput, { target: { value: '11' } })
    })

    await userEvent.click(await screen.findByRole('radio', { name: 'Standard' }))

    await userEvent.click(await screen.findByRole('button', { name: 'Add Rule' }) )

    const dialog = await screen.findAllByRole('dialog')

    const sequenceInput = await within(dialog[1]).findByLabelText('Sequence')
    // eslint-disable-next-line testing-library/no-unnecessary-act
    act(() => {
      fireEvent.change(sequenceInput, { target: { value: '11' } })
    })

    await userEvent.click(await within(dialog[1]).findByRole('button', { name: 'OK' }))

    const row = await screen.findByRole('row', { name: /11/ })
    await userEvent.click(await within(row).findByRole('radio'))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }) )

    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
  })
})
