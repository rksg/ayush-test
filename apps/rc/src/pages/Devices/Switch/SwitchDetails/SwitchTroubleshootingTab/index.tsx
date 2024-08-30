import { useContext } from 'react'

import { useIntl }                from 'react-intl'
import { useParams, useNavigate } from 'react-router-dom'

import { Tabs }                   from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { isRouter, isVerGEVer }   from '@acx-ui/rc/utils'
import { useTenantLink }          from '@acx-ui/react-router-dom'

import { SwitchDetailsContext } from '..'

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



  const isSupportMacAddress = function () {
    if(switchDetailsContextData.switchDetailHeader?.firmware){
      const fwVersion = switchDetailsContextData.switchDetailHeader?.firmware
      /*
      Only support the firmware versions listed below:
      1. > 10010f < 10020
      2. > 10020b
      */
      return isVerGEVer(fwVersion, '10010f', false) &&
      (!isVerGEVer(fwVersion, '10020', false) || isVerGEVer(fwVersion, '10020b', false))
    }else{
      return false
    }
  }

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
        isSupportMacAddress() && isSwitchCliEnabled &&
        <TabPane tab={$t({ defaultMessage: 'MAC Address Table' })} key='macTable'>
          <SwitchMacAddressForm />
        </TabPane>
      }
    </Tabs>
  )
}
