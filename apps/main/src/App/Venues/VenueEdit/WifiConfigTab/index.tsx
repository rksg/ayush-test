import { Tabs }    from 'antd'
import { useIntl } from 'react-intl'

const { TabPane } = Tabs

export function WifiConfigTab () {
  const { $t } = useIntl()
  return (
    <Tabs defaultActiveKey='radio' type='card'>
      <TabPane tab={$t({ defaultMessage: 'Radio' })} key='radio'>
        Radio
      </TabPane>
      <TabPane tab={$t({ defaultMessage: 'Networking' })} key='networking'>
        Networking
      </TabPane>
      <TabPane tab={$t({ defaultMessage: 'Security' })} key='security'>
        Security
      </TabPane>
      <TabPane tab={$t({ defaultMessage: 'External Servers' })} key='servers'>
        External Servers
      </TabPane>
      <TabPane tab={$t({ defaultMessage: 'Advanced Settings' })} key='settings'>
        Advanced Settings
      </TabPane>
    </Tabs>
  )
}