import { Tabs }    from 'antd'
import { useIntl } from 'react-intl'

import { AdvancedSettingForm } from './AdvancedSettingForm'

const { TabPane } = Tabs

export function WifiConfigTab () {
  const { $t } = useIntl()
  return (
    <Tabs defaultActiveKey='radio' type='card'>
      <TabPane tab={$t({ defaultMessage: 'Radio' })} key='radio'>
        {$t({ defaultMessage: 'Radio' })}
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
        <AdvancedSettingForm />
      </TabPane>
    </Tabs>
  )
}