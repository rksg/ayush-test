import { useState } from 'react'

import userEvent   from '@testing-library/user-event'
import { act }     from 'react-dom/test-utils'
import { useIntl } from 'react-intl'

import { MdnsProxyForwardingRule, MdnsProxyForwardingRuleTypeEnum } from '@acx-ui/rc/utils'
import { render, renderHook, screen }                               from '@acx-ui/test-utils'


import { mdnsProxyForwardingRuleTypeLabelMapping as ruleTypeLabelMapping } from '../../contentsMap'

import { MdnsProxyForwardingRuleDrawer } from './MdnsProxyForwardingRuleDrawer'


describe('MdnsProxyForwardingRuleDrawer', () => {
  it('should render the form', () => {
    const { asFragment } = render(
      <MdnsProxyForwardingRuleDrawer
        editMode={false}
        visible={true}
        setVisible={jest.fn()}
        setRule={jest.fn()}
      />
    )

    expect(asFragment()).toMatchSnapshot()
  })

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

  it('should not close drawer if Add another rule is checked', async () => {
    const { result: drawerVisible } = renderHook(() => {
      const [ visible, setVisible ] = useState(true)
      return { visible, setVisible }
    })

    const ruleToAdd: MdnsProxyForwardingRule = {
      type: MdnsProxyForwardingRuleTypeEnum.AIRPLAY,
      fromVlan: 1,
      toVlan: 2
    }

    const setRule = jest.fn()

    const { result: fakeRuleTypeLabel } = renderHook(() => {
      return useIntl().$t(ruleTypeLabelMapping[ruleToAdd.type])
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

    await userEvent.click(await screen.findByRole('combobox', { name: 'Type' }))
    await userEvent.click(screen.getByText(fakeRuleTypeLabel.current))

    // eslint-disable-next-line max-len
    await userEvent.type(screen.getByRole('spinbutton', { name: /From VLAN/i }), ruleToAdd.fromVlan.toString())
    // eslint-disable-next-line max-len
    await userEvent.type(screen.getByRole('spinbutton', { name: /To VLAN/i }), ruleToAdd.toVlan.toString())

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Add' }))
      expect(setRule).toHaveBeenCalledWith({
        type: ruleToAdd.type,
        fromVlan: ruleToAdd.fromVlan,
        toVlan: ruleToAdd.toVlan
      })
    })

    expect(drawerVisible.current.visible).toEqual(true)
  })
})
