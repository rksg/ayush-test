
import { useIntl } from 'react-intl'

import { Tabs } from '@acx-ui/components'

import { Layer2AccessControl } from './Layer2AccessControl'


const AccessControlTabs = () => {
  const { $t } = useIntl()

  return (
    <Tabs type='card' activeKey='layer2'>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Layer 2' })}
        key='layer2' />
    </Tabs>
  )
}

const tabs = {
  layer2: () => <Layer2AccessControl />
}

export function SwitchAccessControl () {
  const Tab = tabs['layer2' as keyof typeof tabs]

  return (
    <>
      <AccessControlTabs />
      { Tab && <Tab /> }
    </>
  )
}
