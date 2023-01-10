import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { Tabs, Tooltip }                         from '@acx-ui/components'
import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { notAvailableMsg }                       from '@acx-ui/utils'

import { ApEditContext } from '../index'

import { DirectedMulticast } from './DirectedMulticast'
import { LanPorts }          from './LanPorts'
import { RadioSettings }     from './RadioTab/RadioSettings'

const { TabPane } = Tabs

export function ApSettingsTab () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/wifi/${params.serialNumber}/edit/settings/`)
  const { editContextData, setEditContextData } = useContext(ApEditContext)
  const releaseTag = useIsSplitOn(Features.DEVICES)
  const supportDirectedMulticast = useIsSplitOn(Features.DIRECTED_MULTICAST)

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
      <TabPane disabled={!releaseTag}
        tab={<Tooltip title={$t(notAvailableMsg)}>
          {tabTitleMap('proxy')}</Tooltip>}
        key='proxy'>
        {$t({ defaultMessage: 'mDNS Proxy' })}
      </TabPane>
      {supportDirectedMulticast &&
        <TabPane tab={tabTitleMap('multicast')} key='multicast'>
          <DirectedMulticast />
        </TabPane>
      }
    </Tabs>
  )
}
