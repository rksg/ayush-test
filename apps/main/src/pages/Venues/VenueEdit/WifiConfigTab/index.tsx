import { Tabs }    from 'antd'
import { useIntl } from 'react-intl'

import { RadioTab } from './tabs/RadioTab'

const { TabPane } = Tabs

export function WifiConfigTab () {
  const { $t } = useIntl()
  return (
    <Tabs defaultActiveKey='radio' type='card'>
      <TabPane tab={$t({ defaultMessage: 'Radio' })} key='radio'>
        <RadioTab />
      </TabPane>
      <TabPane tab={$t({ defaultMessage: 'Networking' })} key='networking'>
        {$t({ defaultMessage: 'Networking' })}
      </TabPane>
      <TabPane tab={$t({ defaultMessage: 'Security' })} key='security'>
        {$t({ defaultMessage: 'Security' })}
      </TabPane>
      <TabPane tab={$t({ defaultMessage: 'External Servers' })} key='servers'>
        {$t({ defaultMessage: 'External Servers' })}
      </TabPane>
      <TabPane tab={$t({ defaultMessage: 'Advanced Settings' })} key='settings'>
        {$t({ defaultMessage: 'Advanced Settings' })}
      </TabPane>
    </Tabs>
  )
}