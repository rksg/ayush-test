import { useContext } from 'react'

import { Tabs }    from 'antd'
import { useIntl } from 'react-intl'

import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { VenueEditContext, EditContext } from '../index'

import { GeneralSettingForm } from './GeneralSettingForm'

const { TabPane } = Tabs

export function SwitchConfigTab () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(`/venues/${params.venueId}/edit/switch/`)
  const { editContextData, setEditContextData } = useContext(VenueEditContext)

  const onTabChange = (tab: string) => {
    const activeSubTab = params?.activeSubTab as keyof EditContext['tempData']
    setEditContextData({
      ...editContextData,
      tabKey: activeSubTab,
      newData: undefined,
      oldData: undefined,
      tempData: {
        ...editContextData.tempData,
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
      general: $t({ defaultMessage: 'General' }),
      aaa: $t({ defaultMessage: 'AAA' }),
      history: $t({ defaultMessage: 'Configuration History' }),
      interfaces: $t({ defaultMessage: 'Routed Interfaces' }),
      settings: $t({ defaultMessage: 'Advanced Settings' })
    }

    const title = tabTitle[tabkey as keyof typeof tabTitle]
    return editContextData?.isDirty && params?.activeSubTab === tabkey
      ? `${title} *` : title
  }

  return (
    <Tabs
      onChange={onTabChange}
      defaultActiveKey='radio'
      activeKey={params.activeSubTab}
      type='card'
    >
      <TabPane tab={tabTitleMap('general')} key='general'>
        <GeneralSettingForm />
      </TabPane>
      <TabPane tab={tabTitleMap('aaa')} key='aaa'>
        {$t({ defaultMessage: 'AAA' })}
      </TabPane>
      <TabPane tab={tabTitleMap('history')} key='history'>
        {$t({ defaultMessage: 'Configuration History' })}
      </TabPane>
      <TabPane tab={tabTitleMap('interfaces')} key='interfaces'>
        {$t({ defaultMessage: 'Routed Interfaces' })}
      </TabPane>
    </Tabs>
  )
}