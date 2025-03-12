import { useContext } from 'react'

import { useIntl }                from 'react-intl'
import { useParams, useNavigate } from 'react-router-dom'

import { Tabs }                                   from '@acx-ui/components'
import { Features, useIsSplitOn }                 from '@acx-ui/feature-toggle'
import { isRouter, isFirmwareVersionAbove10010f } from '@acx-ui/rc/utils'
import { useTenantLink }                          from '@acx-ui/react-router-dom'

import { SwitchDetailsContext } from '..'

import { SwitchCableTestForm }  from './switchCableTestForm'
import { SwitchIpRouteForm }    from './switchIpRouteForm'
import { SwitchMacAddressForm } from './switchMacAddressForm'
import { SwitchPingForm }       from './switchPingForm'
import { SwitchTraceRouteForm } from './switchTraceRouteForm'


const { TabPane } = Tabs

export function SwitchTroubleshootingTab () {
  const { $t } = useIntl()
  const { switchId, serialNumber, activeSubTab } = useParams()
  const navigate = useNavigate()
  // eslint-disable-next-line max-len
  const basePath = useTenantLink(`/devices/switch/${switchId}/${serialNumber}/details/troubleshooting/`)
  const isSwitchCliEnabled = useIsSplitOn(Features.SWITCH_CLI_MODE)
  const isCableTestEnabled = useIsSplitOn(Features.SWITCH_CABLE_TEST)

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  const {
    switchDetailsContextData
  } = useContext(SwitchDetailsContext)

  const isSupportRouter = switchDetailsContextData.switchDetailHeader?.switchType ?
    isRouter(switchDetailsContextData.switchDetailHeader.switchType) : false

  return (
    <Tabs
      destroyInactiveTabPane={true}
      onChange={onTabChange}
      defaultActiveKey='ping'
      activeKey={activeSubTab}
      type='card'
    >
      <TabPane tab={$t({ defaultMessage: 'Ping' })} key='ping'>
        <SwitchPingForm/>
      </TabPane>
      <TabPane tab={$t({ defaultMessage: 'Trace Route' })} key='traceroute'>
        <SwitchTraceRouteForm/>
      </TabPane>
      {
        isSupportRouter &&
        <TabPane tab={$t({ defaultMessage: 'IP Route' })} key='ipRoute'>
          <SwitchIpRouteForm />
        </TabPane>
      }
      {
        isFirmwareVersionAbove10010f(switchDetailsContextData.switchDetailHeader?.firmware)
          && isSwitchCliEnabled
          && <TabPane tab={$t({ defaultMessage: 'MAC Address Table' })} key='macTable'>
            <SwitchMacAddressForm />
          </TabPane>
      }
      {
        isFirmwareVersionAbove10010f(switchDetailsContextData.switchDetailHeader?.firmware)
          && isCableTestEnabled
          && <TabPane tab={$t({ defaultMessage: 'Cable Test' })} key='cableTest'>
            <SwitchCableTestForm/>
          </TabPane>
      }
    </Tabs>
  )
}
