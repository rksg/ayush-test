import { Tabs }    from 'antd'
import { useIntl } from 'react-intl'

const { TabPane } = Tabs

export function SwitchConfigTab () {
  const { $t } = useIntl()
  return (
    <Tabs defaultActiveKey='general' type='card'>
      <TabPane tab={$t({ defaultMessage: 'General' })} key='general'>
        {$t({ defaultMessage: 'General' })}
      </TabPane>
      <TabPane tab={$t({ defaultMessage: 'AAA' })} key='aaa'>
        {$t({ defaultMessage: 'AAA' })}
      </TabPane>
      <TabPane tab={$t({ defaultMessage: 'Configuration History' })} key='history'>
        {$t({ defaultMessage: 'Configuration History' })}
      </TabPane>
      <TabPane tab={$t({ defaultMessage: 'Routed Interfaces' })} key='interfaces'>
        {$t({ defaultMessage: 'Routed Interfaces' })}
      </TabPane>
    </Tabs>
  )
}