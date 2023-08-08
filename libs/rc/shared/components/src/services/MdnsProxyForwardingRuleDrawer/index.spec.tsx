import { useState } from 'react'

import userEvent   from '@testing-library/user-event'
import { act }     from 'react-dom/test-utils'
import { useIntl } from 'react-intl'

import {
  MdnsProxyForwardingRule,
  BridgeServiceEnum,
  mdnsProxyRuleTypeLabelMapping
} from '@acx-ui/rc/utils'
import { render, renderHook, screen } from '@acx-ui/test-utils'

import { MdnsProxyForwardingRuleDrawer } from '.'

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

describe('MdnsProxyForwardingRuleDrawer', () => {
  it('should close drawer', async () => {
    const { result: drawerVisible } = renderHook(() => {
      const [ visible, setVisible ] = useState(true)
      return { visible, setVisible }
    })

    render(
      <MdnsProxyForwardingRuleDrawer
        editMode={false}
        visible={drawerVisible.current.visible}
        setVisible={drawerVisible.current.setVisible}
        setRule={jest.fn()}
      />
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))

    expect(drawerVisible.current.visible).toEqual(false)
  })

  it.skip('should not close drawer if Add another rule is checked', async () => {
    const { result: drawerVisible } = renderHook(() => {
      const [ visible, setVisible ] = useState(true)
      return { visible, setVisible }
    })

    const ruleToAdd: MdnsProxyForwardingRule = {
      service: BridgeServiceEnum.AIRPLAY,
      fromVlan: 1,
      toVlan: 2
    }

    const setRule = jest.fn()

    const { result: fakeRuleTypeLabel } = renderHook(() => {
      return useIntl().$t(mdnsProxyRuleTypeLabelMapping[ruleToAdd.service])
    })

    render(
      <MdnsProxyForwardingRuleDrawer
        editMode={false}
        visible={drawerVisible.current.visible}
        setVisible={drawerVisible.current.setVisible}
        setRule={setRule}
      />
    )

    await userEvent.click(await screen.findByRole('checkbox', { name: /Add another rule/i }))

    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: 'Type' }),
      await screen.findByRole('option', { name: fakeRuleTypeLabel.current })
    )

    // eslint-disable-next-line max-len
    await userEvent.type(screen.getByRole('spinbutton', { name: /From VLAN/i }), ruleToAdd.fromVlan.toString())
    // eslint-disable-next-line max-len
    await userEvent.type(screen.getByRole('spinbutton', { name: /To VLAN/i }), ruleToAdd.toVlan.toString())

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Add' }))
      expect(setRule).toHaveBeenCalledWith({
        service: ruleToAdd.service,
        fromVlan: ruleToAdd.fromVlan,
        toVlan: ruleToAdd.toVlan
      })
    })

    expect(drawerVisible.current.visible).toEqual(true)
  })

  it('should render the related fields when rule type is OTHER', async () => {
    const { result: fakeRuleTypeLabel } = renderHook(() => {
      return useIntl().$t(mdnsProxyRuleTypeLabelMapping[BridgeServiceEnum.OTHER])
    })

    render(
      <MdnsProxyForwardingRuleDrawer
        editMode={false}
        visible={true}
        setVisible={jest.fn()}
        setRule={jest.fn()}
      />
    )

    await userEvent.selectOptions(
      await screen.findByRole('combobox', { name: 'Type' }),
      await screen.findByRole('option', { name: fakeRuleTypeLabel.current })
    )

    const serviceNameElem = await screen.findByRole('textbox', { name: /Service Name/i })
    expect(serviceNameElem).toBeInTheDocument()

    const protocolElem = await screen.findByRole('combobox', { name: /Transport Protocol/i })
    expect(protocolElem).toBeInTheDocument()
  })
})
