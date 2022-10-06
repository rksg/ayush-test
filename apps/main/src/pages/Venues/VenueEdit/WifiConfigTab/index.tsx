import { useContext } from 'react'

import { Tabs }    from 'antd'
import { useIntl } from 'react-intl'

import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { VenueEditContext, AdvancedSettingContext } from '../index'

import { AdvancedSettingForm } from './AdvancedTab/AdvancedSettingForm'
import { RadioTab }            from './RadioTab/RadioTab'

export function WifiConfigTab () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(`/venues/${params.venueId}/edit/wifi/`)
  const { editContextData, setEditContextData } = useContext(VenueEditContext)

  const onTabChange = (tab: string) => {
    const activeSubTab = params?.activeSubTab as keyof AdvancedSettingContext['tempData']
    setEditContextData({
      ...editContextData,
      tabKey: activeSubTab,
      tempData: {
        [activeSubTab]: editContextData.newData
      }
    })
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  const tabTitleMap = (tabkey: string) => {
    const tabTitle = {
      radio: $t({ defaultMessage: 'Radio' }),
      networking: $t({ defaultMessage: 'Networking' }),
      security: $t({ defaultMessage: 'Security' }),
      servers: $t({ defaultMessage: 'External Servers' }),
      settings: $t({ defaultMessage: 'Advanced Settings' })
    }

    const title = tabTitle[tabkey as keyof typeof tabTitle]
    return editContextData.isDirty && params?.activeSubTab === tabkey
      ? `${title} *` : title
  }

  return (
    <Tabs
      onChange={onTabChange}
      defaultActiveKey='radio'
      activeKey={params.activeSubTab}
      type='card'
    >
      <Tabs.TabPane tab={tabTitleMap('radio')} key='radio'>
        <RadioTab />
      </Tabs.TabPane>
      <Tabs.TabPane tab={tabTitleMap('networking')} key='networking'>
        {$t({ defaultMessage: 'Networking' })}
      </Tabs.TabPane>
      <Tabs.TabPane tab={tabTitleMap('security')} key='security'>
        {$t({ defaultMessage: 'Security' })}
      </Tabs.TabPane>
      <Tabs.TabPane tab={tabTitleMap('servers')} key='servers'>
        {$t({ defaultMessage: 'External Servers' })}
      </Tabs.TabPane>
      <Tabs.TabPane tab={tabTitleMap('settings')} key='settings'>
        <AdvancedSettingForm />
      </Tabs.TabPane>
    </Tabs>
  )
}