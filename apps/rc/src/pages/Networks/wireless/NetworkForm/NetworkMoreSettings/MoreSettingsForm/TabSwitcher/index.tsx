import React from 'react'

import { useIntl } from 'react-intl'

import { Tabs } from '@acx-ui/components'

import { RadioLabel } from '../../styledComponents'

interface TabSwitcherProps {
    handleSelectedTabValueChange: (value: string) => void
    defaultValue: string
}

const TabSwitcher = ({ handleSelectedTabValueChange, defaultValue }: TabSwitcherProps) => {
  const { $t } = useIntl()


  return (
    <Tabs
      onChange={handleSelectedTabValueChange}
      activeKey={defaultValue}
      type='third'
    >
      <Tabs.TabPane
        key='VLAN'
        tab={
          <RadioLabel style={{ width: '76px' }}>
            {$t({ defaultMessage: 'VLAN' })}
          </RadioLabel>
        }
      />
      <Tabs.TabPane
        key='Network Control'
        tab={
          <RadioLabel style={{ width: '76px' }}>
            {$t({ defaultMessage: 'Network Control' })}
          </RadioLabel>
        }
      />
      <Tabs.TabPane
        key='Radio'
        tab={
          <RadioLabel style={{ width: '13px' }}>
            {$t({ defaultMessage: 'Radio' })}
          </RadioLabel>
        }
      />
      <Tabs.TabPane
        key='Networking'
        tab={
          <RadioLabel style={{ width: '76px' }}>
            {$t({ defaultMessage: 'Networking' })}
          </RadioLabel>
        }
      />
      <Tabs.TabPane
        key='Radius Options'
        tab={
          <RadioLabel style={{ width: '76px' }}>
            {$t({ defaultMessage: 'Radius Options' })}
          </RadioLabel>
        }
      />
      <Tabs.TabPane
        key='User Connection'
        tab={
          <RadioLabel style={{ width: '76px' }}>
            {$t({ defaultMessage: 'User Connection' })}
          </RadioLabel>
        }
      />
      <Tabs.TabPane
        key='Advanced'
        tab={
          <RadioLabel style={{ width: '57px' }}>
            {$t({ defaultMessage: 'Advanced' })}
          </RadioLabel>
        }
      />
    </Tabs>
  )
}

export default TabSwitcher