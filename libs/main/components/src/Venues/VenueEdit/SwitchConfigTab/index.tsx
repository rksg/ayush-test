import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { Tabs }                         from '@acx-ui/components'
import { usePathBasedOnConfigTemplate } from '@acx-ui/config-template/utils'
import { useConfigTemplate }            from '@acx-ui/rc/utils'
import { useNavigate, useParams }       from '@acx-ui/react-router-dom'
import { SwitchVeTable }                from '@acx-ui/switch/components'
import { SwitchConfigHistoryTable }     from '@acx-ui/switch/components'

import { VenueEditContext, EditContext } from '../index'

import { GeneralSettingForm } from './GeneralSettingForm'
import { SwitchAAATab }       from './SwitchAAATab/SwitchAAATab'

const { TabPane } = Tabs

export function SwitchConfigTab () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const { isTemplate } = useConfigTemplate()
  const basePath = usePathBasedOnConfigTemplate(`/venues/${params.venueId}/edit/switch/`)
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
        <SwitchAAATab />
      </TabPane>
      {!isTemplate && <>
        <TabPane
          tab={tabTitleMap('history')}
          key='history'
        >
          <SwitchConfigHistoryTable isVenueLevel={true} />
        </TabPane>
        <TabPane
          tab={tabTitleMap('interfaces')}
          key='interfaces'
        >
          <SwitchVeTable isVenueLevel={true} />
        </TabPane>
      </>}
    </Tabs>
  )
}
