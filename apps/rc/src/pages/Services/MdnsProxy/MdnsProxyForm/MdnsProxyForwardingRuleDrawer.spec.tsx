import { useState } from 'react'

import userEvent   from '@testing-library/user-event'
import { act }     from 'react-dom/test-utils'
import { useIntl } from 'react-intl'

import { MdnsProxyForwardingRuleTypeEnum } from '@acx-ui/rc/utils'
import { render, renderHook, screen }      from '@acx-ui/test-utils'


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

    const setRule = jest.fn()

    const { result: fakeRuleTypeLabel } = renderHook(() => {
      return useIntl().$t(ruleTypeLabelMapping[MdnsProxyForwardingRuleTypeEnum.AIRPLAY])
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

    await userEvent.type(screen.getByRole('textbox', { name: /From VLAN/i }), '1')
    await userEvent.type(screen.getByRole('textbox', { name: /To VLAN/i }), '2')

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Add' }))
      expect(setRule).toHaveBeenCalled()
    })

    expect(drawerVisible.current.visible).toEqual(true)
  })
})
