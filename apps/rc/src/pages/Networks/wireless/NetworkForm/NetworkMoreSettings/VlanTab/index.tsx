import { useContext, useEffect } from 'react'

import { Form, InputNumber, Space, Switch } from 'antd'
import { useIntl }                          from 'react-intl'

import { Features, useIsSplitOn }                                 from '@acx-ui/feature-toggle'
import { GuestNetworkTypeEnum, NetworkSaveData, NetworkTypeEnum } from '@acx-ui/rc/utils'
import { validationMessages }                                     from '@acx-ui/utils'

import NetworkFormContext        from '../../NetworkFormContext'
import { hasVxLanTunnelProfile } from '../../utils'
import VLANPoolInstance          from '../../VLANPoolInstance'
import * as UI                   from '../styledComponents'


const { useWatch } = Form

export function VlanTab (props: { wlanData: NetworkSaveData | null }) {
  const { $t } = useIntl()
  const { data } = useContext(NetworkFormContext)

  const labelWidth = '230px'

  const [
    enableDhcp,
    enableVlanPooling
  ] = [
    useWatch<boolean>('enableDhcp'),
    useWatch<boolean>('enableVlanPooling')
  ]

  const form = Form.useFormInstance()
  const { wlanData } = props

  const supportMacAuthDynamicVlan = useIsSplitOn(Features.WIFI_DYNAMIC_VLAN_TOGGLE)

  const isPortalDefaultVLANId = (data?.enableDhcp||enableDhcp) &&
    data?.type === NetworkTypeEnum.CAPTIVEPORTAL &&
    data.guestPortal?.guestNetworkType !== GuestNetworkTypeEnum.Cloudpath

  useEffect(() => {
    if (isPortalDefaultVLANId) {
      delete data?.wlan?.vlanId
      form.setFieldValue(['wlan', 'vlanId'], 3000)
    }
  }, [isPortalDefaultVLANId, form])


  const showDynamicWlan = data?.type === NetworkTypeEnum.AAA ||
    data?.type === NetworkTypeEnum.DPSK ||
    (supportMacAuthDynamicVlan &&
      ((data?.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.WISPr &&
        data?.wlan?.bypassCPUsingMacAddressAuthentication) ||
      (data?.type === NetworkTypeEnum.OPEN && data.wlan?.macAddressAuthentication)))

  const enableVxLan = hasVxLanTunnelProfile(wlanData)

  return (
    <>
      <UI.FieldLabel width={labelWidth}>
        { $t({ defaultMessage: 'VLAN Pooling' }) }
        <Form.Item
          name='enableVlanPooling'
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch disabled={!useIsSplitOn(Features.POLICIES) || enableVxLan}/>}
        />
      </UI.FieldLabel>

      {!enableVlanPooling && <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr' }}>
        <Form.Item
          name={['wlan', 'vlanId']}
          label={$t({ defaultMessage: 'VLAN ID' })}
          initialValue={1}
          rules={[
            { required: true }, {
              type: 'number', max: 4094, min: 1,
              message: $t(validationMessages.vlanRange)
            }]}
          style={{ marginBottom: '15px' }}
          children={<InputNumber style={{ width: '80px' }}
            disabled={isPortalDefaultVLANId || enableVxLan}/>}
        />
      </div>
      }

      {!enableVlanPooling && showDynamicWlan &&
        <UI.FieldLabel width={labelWidth}>
          {$t({ defaultMessage: 'Dynamic VLAN' })}
          <Form.Item
            data-testid={'DynamicVLAN'}
            name={['wlan', 'advancedCustomization', 'enableAaaVlanOverride']}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={true}
            children={<Switch disabled={enableVxLan} />}
          />
        </UI.FieldLabel>
      }

      {enableVxLan &&
        <Space size={1}>
          <UI.InfoIcon />
          <UI.Description>
            {
              $t({
                defaultMessage: `Not able to modify when the network
                    enables network segmentation service`
              })
            }
          </UI.Description>
        </Space>
      }

      {enableVlanPooling &&
        <div style={{ display: 'grid', gridTemplateColumns: '190px auto' }}>
          <VLANPoolInstance />
        </div>
      }

      <UI.FieldLabel width={labelWidth}>
        { $t({ defaultMessage: 'Proxy ARP' }) }
        <Form.Item
          name={['wlan', 'advancedCustomization', 'proxyARP']}
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch disabled={enableVxLan}/>}
        />
      </UI.FieldLabel>
    </>
  )
}
