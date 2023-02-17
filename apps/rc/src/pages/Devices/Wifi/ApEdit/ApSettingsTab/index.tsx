import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { Tabs, Tooltip }                          from '@acx-ui/components'
import { Features, useIsSplitOn }                 from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }             from '@acx-ui/icons'
import { useNavigate, useParams, useTenantLink }  from '@acx-ui/react-router-dom'
import { directedMulticastInfo, notAvailableMsg } from '@acx-ui/utils'

import { ApEditContext } from '../index'

import { DirectedMulticast } from './DirectedMulticast'
import { IpSettings }        from './General/IpSettings'
import { LanPorts }          from './LanPorts'
import { MdnsProxyTab }      from './MdnsProxyTab/MdnsProxyTab'
import { RadioSettings }     from './RadioTab/RadioSettings'

const { TabPane } = Tabs

export function ApSettingsTab () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/wifi/${params.serialNumber}/edit/settings/`)
  const { editContextData, setEditContextData } = useContext(ApEditContext)
  const isServicesEnabled = useIsSplitOn(Features.SERVICES)
  const supportDirectedMulticast = useIsSplitOn(Features.DIRECTED_MULTICAST)
  const supportStaticIpSettings = useIsSplitOn(Features.AP_STATIC_IP)

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
      general: $t({ defaultMessage: 'General' }),
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
      defaultActiveKey={supportStaticIpSettings? 'general' : 'radio'}
      activeKey={params.activeSubTab}
      type='card'
    >
      {supportStaticIpSettings &&
        <TabPane tab={tabTitleMap('general')} key='general'>
          <IpSettings />
        </TabPane>
      }
      <TabPane tab={tabTitleMap('radio')} key='radio'>
        <RadioSettings />
      </TabPane>
      <TabPane tab={tabTitleMap('lanPort')} key='lanPort'>
        <LanPorts />
      </TabPane>
      <TabPane disabled={!isServicesEnabled}
        tab={
          <Tooltip title={isServicesEnabled ? '' : $t(notAvailableMsg)}>
            {tabTitleMap('proxy')}
          </Tooltip>
        }
        key='proxy'>
        <MdnsProxyTab />
      </TabPane>
      {supportDirectedMulticast &&
        <TabPane tab={<>
          {tabTitleMap('multicast')}
          <Tooltip title={$t(directedMulticastInfo)} placement='right'>
            <QuestionMarkCircleOutlined
              style={{ marginLeft: '8px', marginBottom: '-3px', height: '16px', width: '16px' }}/>
          </Tooltip>
        </>}
        key='multicast'>
          <DirectedMulticast />
        </TabPane>
      }
    </Tabs>
  )
}
