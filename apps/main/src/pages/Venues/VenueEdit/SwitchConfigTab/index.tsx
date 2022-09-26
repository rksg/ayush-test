import { Tabs }    from 'antd'
import { useIntl } from 'react-intl'

import { SwitchAAATab } from './SwitchAAATab/SwitchAAATab'

const { TabPane } = Tabs

export function SwitchConfigTab () {
  const { $t } = useIntl()
  return (
    <Tabs defaultActiveKey='aaa' type='card'>
      <TabPane tab={$t({ defaultMessage: 'General' })} key='general'>
        {$t({ defaultMessage: 'General' })}
      </TabPane>
      <TabPane tab={$t({ defaultMessage: 'AAA' })} key='aaa'>
        <SwitchAAATab />
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