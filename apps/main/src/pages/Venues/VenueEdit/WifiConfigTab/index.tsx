import { useContext } from 'react'

import { Tabs }    from 'antd'
import { useIntl } from 'react-intl'

import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { VenueEditContext, AdvancedSettingContext } from '../index'

import { AdvancedSettingForm } from './AdvancedSettingForm'

const { TabPane } = Tabs

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
        [activeSubTab]: editContextData.editData
      }
    })
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  const isDirty = (tabkey: string) => {
    return editContextData.isDirty && params?.activeSubTab === tabkey ? ' *' : ''
  }

  return (
    <Tabs
      onChange={onTabChange}
      defaultActiveKey='radio'
      activeKey={params.activeSubTab}
      type='card'
    >
      <TabPane
        tab={`${$t({ defaultMessage: 'Radio' })}${isDirty('radio')}`}
        key='radio'
      >
        {$t({ defaultMessage: 'Radio' })}
      </TabPane>
      <TabPane
        tab={`${$t({ defaultMessage: 'Networking' })}${isDirty('networking')}`}
        key='networking'
      >
        {$t({ defaultMessage: 'Networking' })}
      </TabPane>
      <TabPane
        tab={`${$t({ defaultMessage: 'Security' })}${isDirty('security')}`}
        key='security'
      >
        {$t({ defaultMessage: 'Security' })}
      </TabPane>
      <TabPane
        tab={`${$t({ defaultMessage: 'External Servers' })}${isDirty('servers')}`}
        key='servers'
      >
        {$t({ defaultMessage: 'External Servers' })}
      </TabPane>
      <Tabs.TabPane
        tab={`${$t({ defaultMessage: 'Advanced Settings' })}${isDirty('settings')}`}
        key='settings'
      >
        <AdvancedSettingForm />
      </Tabs.TabPane>
    </Tabs>
  )
}