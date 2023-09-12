/* eslint-disable max-len */
import { useContext, useState, useEffect } from 'react'

import {
  Form } from 'antd'
import { get }                    from 'lodash'
import { defineMessage, useIntl } from 'react-intl'

import { Button, Tabs }                     from '@acx-ui/components'
import { useIsSplitOn, Features }           from '@acx-ui/feature-toggle'
import { NetworkSaveData, NetworkTypeEnum } from '@acx-ui/rc/utils'

import NetworkFormContext from '../NetworkFormContext'

import { AdvancedTab }       from './AdvancedTab'
import { NetworkControlTab } from './NetworkControlTab'
import { NetworkingTab }     from './NetworkingTab'
import { RadioTab }          from './RadioTab'
import * as UI               from './styledComponents'
import { UserConnectionTab } from './UserConnectionTab'
import { VlanTab }           from './VlanTab'



export function NetworkMoreSettingsForm (props: {
  wlanData: NetworkSaveData | null
}) {
  const { editMode, cloneMode, data } = useContext(NetworkFormContext)
  const form = Form.useFormInstance()
  const wlanData = (editMode) ? props.wlanData : form.getFieldsValue()

  useEffect(() => {
    if ((editMode || cloneMode) && data) {
      form.setFieldsValue({
        wlan: {
          ...data.wlan,
          advancedCustomization: {
            ...data?.wlan?.advancedCustomization,
            vlanPool: get(data, 'wlan.advancedCustomization.vlanPool'),
            enableMulticastRateLimiting: get(data, 'wlan.advancedCustomization.enableMulticastUplinkRateLimiting') ||
            get(data, 'wlan.advancedCustomization.enableMulticastDownlinkRateLimiting') ||
            get(data, 'wlan.advancedCustomization.enableMulticastUplinkRateLimiting6G') ||
            get(data, 'wlan.advancedCustomization.enableMulticastDownlinkRateLimiting6G')
          }
        },
        enableUploadLimit: data.wlan?.advancedCustomization?.userUplinkRateLimiting &&
          data.wlan?.advancedCustomization?.userUplinkRateLimiting > 0,
        enableDownloadLimit: data.wlan?.advancedCustomization?.userDownlinkRateLimiting &&
          data.wlan?.advancedCustomization?.userDownlinkRateLimiting > 0,
        enableOfdmOnly: get(data,
          'wlan.advancedCustomization.radioCustomization.phyTypeConstraint') === 'OFDM',
        enableVlanPooling: get(data, 'wlan.advancedCustomization.vlanPool'),
        managementFrameMinimumPhyRate: get(data,
          'wlan.advancedCustomization.radioCustomization.managementFrameMinimumPhyRate'),
        bssMinimumPhyRate: get(data,
          'wlan.advancedCustomization.radioCustomization.bssMinimumPhyRate')
      })
    }
  }, [data, editMode, cloneMode])
  const { $t } = useIntl()

  /* Please be advised that why we use clone mode as state here
   * usually edit mode will show more setting in step form seperately
   * and clone mode just like usual adding network.
   * But when MoreSettingForm is not rendered (user didn't click
   * the show more button), the copied value in more setting will be
   * ignored.
   * In cause this scenario happen, MoreSettingsForm will auto expand
   * under clone mode, user can collapse manually, it will force React
   * to render MoreSettingsForm.
   * There should be no side effect when adding/editing a network.
   */
  const [enableMoreSettings, setEnabled] = useState(cloneMode)

  if (data && editMode) {
    return <MoreSettingsTabs wlanData={wlanData} />
  } else {
    return <div>
      <Button
        type='link'
        onClick={() => {
          setEnabled(!enableMoreSettings)
        }}
      >
        {enableMoreSettings ?
          $t({ defaultMessage: 'Show less settings' }) :
          $t({ defaultMessage: 'Show more settings' })}
      </Button>
      {enableMoreSettings &&
        <MoreSettingsTabs wlanData={wlanData} />}
    </div>
  }
}

export function MoreSettingsTabs (props: { wlanData: NetworkSaveData | null }) {
  const { $t } = useIntl()
  const { data, editMode } = useContext(NetworkFormContext)
  const form = Form.useFormInstance()
  const wlanData = (editMode) ? props.wlanData : form.getFieldsValue()

  const qosMapSetFlag = useIsSplitOn(Features.WIFI_EDA_QOS_MAP_SET_TOGGLE)
  const qosMirroringFlag = useIsSplitOn(Features.WIFI_EDA_QOS_MIRRORING_TOGGLE)

  const [currentTab, setCurrentTab] = useState('vlan')

  const MoreSettingsTabsInfo = [
    {
      key: 'vlan',
      display: defineMessage({ defaultMessage: 'VLAN' }),
      style: { width: '10px' }
    },
    ...((data?.type === NetworkTypeEnum.CAPTIVEPORTAL)? [{
      key: 'userConnection',
      display: defineMessage({ defaultMessage: 'User Connection' }),
      style: { width: '71px' }
    }] : []),
    {
      key: 'networkControl',
      display: defineMessage({ defaultMessage: 'Network Control' }),
      style: { width: '71px' }
    }, {
      key: 'radio',
      display: defineMessage({ defaultMessage: 'Radio' }),
      style: { width: '11px' }
    }, {
      key: 'networking',
      display: defineMessage({ defaultMessage: 'Networking' }),
      style: { width: '38px' }
    },
    ...((qosMapSetFlag || qosMirroringFlag)? [ {
      key: 'advanced',
      display: defineMessage({ defaultMessage: 'QoS' }),
      style: { width: '37px' }
    }] : [])
  ]

  const onTabChange = (tab: string) => {
    setCurrentTab(tab)
  }

  return (<>
    <Tabs type='third'
      activeKey={currentTab}
      onChange={onTabChange}
    > {MoreSettingsTabsInfo.map(({ key, display, style }) => ( <Tabs.TabPane key={key}
        tab={<UI.TabLable style={style}>{$t(display)}</UI.TabLable>}
      />))}
    </Tabs>

    <div style={{ display: currentTab === 'vlan' ? 'block' : 'none' }}>
      <VlanTab wlanData={wlanData} />
    </div>
    {(data?.type === NetworkTypeEnum.CAPTIVEPORTAL) &&
    <div style={{ display: currentTab === 'userConnection' ? 'block' : 'none' }}>
    }
      <UserConnectionTab />
    </div>
    <div style={{ display: currentTab === 'networkControl' ? 'block' : 'none' }}>
      <NetworkControlTab wlanData={wlanData} />
    </div>
    <div style={{ display: currentTab === 'radio' ? 'block' : 'none' }}>
      <RadioTab />
    </div>
    <div style={{ display: currentTab === 'networking' ? 'block' : 'none' }}>
      <NetworkingTab wlanData={wlanData} />
    </div>
    <div style={{ display: currentTab === 'advanced' ? 'block' : 'none' }}>
      <AdvancedTab />
    </div>
  </>)
}

