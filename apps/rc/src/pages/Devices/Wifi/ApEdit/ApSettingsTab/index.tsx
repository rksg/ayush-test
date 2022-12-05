import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { Tabs, Tooltip }                                  from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { ApEditContext } from '../index'

import { LanPorts }      from './LanPorts'
import { RadioSettings } from './RadioTab/RadioSettings'
import { notAvailableMsg } from '@acx-ui/utils'

const { TabPane } = Tabs

export function ApSettingsTab () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/aps/${params.serialNumber}/edit/settings/`)
  const { editContextData, setEditContextData } = useContext(ApEditContext)

  const onTabChange = (tab: string) => {
    setEditContextData && setEditContextData({
      ...editContextData,
      tabTitle: '',
      isDirty: false,
      hasError: false,
      updateChanges: () => {},
      discardChanges: () => {}
    })
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  const tabTitleMap = (tabkey: string) => {
    const tabTitle = {
      radio: $t({ defaultMessage: 'Radio' }),
      lanPort: $t({ defaultMessage: 'LAN Port' }),
      proxy: $t({ defaultMessage: 'mDNS Proxy' }),
      multicast: $t({ defaultMessage: 'Directed Multicast' })
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
      <TabPane tab={tabTitleMap('radio')} key='radio'>
        <RadioSettings />
      </TabPane>
      <TabPane tab={tabTitleMap('lanPort')} key='lanPort'>
        <LanPorts />
      </TabPane>
      <TabPane disabled tab={<Tooltip title={$t(notAvailableMsg)}>
        {tabTitleMap('proxy')}</Tooltip>} key='proxy'>
        {$t({ defaultMessage: 'mDNS Proxy' })}
      </TabPane>
      <TabPane disabled tab={<Tooltip title={$t(notAvailableMsg)}>
        {tabTitleMap('multicast')}</Tooltip>} key='multicast'>
        {$t({ defaultMessage: 'Directed Multicast' })}
      </TabPane>
    </Tabs>
  )
}
