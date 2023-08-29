import { useContext } from 'react'

import { useIntl }                from 'react-intl'
import { useParams, useNavigate } from 'react-router-dom'

import { Tabs }          from '@acx-ui/components'
import { isRouter }      from '@acx-ui/rc/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'

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

    return false //Currently, ICX does not support Troubleshooting Mac Address feature

    // Switch troubleshooting only support switch version >= SPS09010g
    // 1.  If the version number is 09010, The last English number must be greater than or equal to "g"
    // 2.  Or the version number is grater than 09010

    // const switchVersionReg = /^(?:[A-Z]{3,})?(?<major>\d{4,})(?<minor>[a-z]*)(?:_b(?<build>\d+))?$/
    // const firmwareGroups =
    //   switchDetailsContextData.switchDetailHeader?.firmware?.match(switchVersionReg)?.groups
    // if (firmwareGroups?.major === '09010' && firmwareGroups?.minor) {
    //   return firmwareGroups.minor.charAt(0) >= 'g'
    // } else {
    //   return ((firmwareGroups?.major || '0') > '09010')
    // }
  }

  return (
    <Tabs
      destroyInactiveTabPane={true}
      onChange={onTabChange}
      defaultActiveKey='ping'
      activeKey={activeSubTab}
      type='second'
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
        isSupportMacAddress() &&
        <TabPane tab={$t({ defaultMessage: 'MAC Address Table' })} key='macTable'>
          <SwitchMacAddressForm />
        </TabPane>
      }
    </Tabs>
  )
}
