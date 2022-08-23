import { Tabs }    from 'antd'
import { useIntl } from 'react-intl'

const { TabPane } = Tabs

export function SwitchConfigTab () {
  const { $t } = useIntl()
  return (
    <Tabs defaultActiveKey='general' type='card'>
      <TabPane tab={$t({ defaultMessage: 'General' })} key='general'>
				General
      </TabPane>
      <TabPane tab={$t({ defaultMessage: 'AAA' })} key='aaa'>
				AAA
      </TabPane>
      <TabPane tab={$t({ defaultMessage: 'Configuration History' })} key='history'>
				Configuration History
      </TabPane>
      <TabPane tab={$t({ defaultMessage: 'Routed Interfaces' })} key='interfaces'>
				Routed Interfaces
      </TabPane>
    </Tabs>
  )
}