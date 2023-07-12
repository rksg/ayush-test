import React from 'react'

import { Form, InputNumber, Space, Switch } from 'antd'
import { useIntl }                          from 'react-intl'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { validationMessages }     from '@acx-ui/utils'

import VLANPoolInstance from '../../../VLANPoolInstance'
import * as UI          from '../../styledComponents'


interface VLANOfNetworkMoreSettingsFormProps {
  enableVlanPooling: boolean
  enableVxLan: boolean
  isPortalDefaultVLANId: boolean
  showDynamicWlan: boolean
}

function VLANOfNetworkMoreSettingsForm (
  { enableVlanPooling,
    enableVxLan,
    isPortalDefaultVLANId,
    showDynamicWlan
  }: VLANOfNetworkMoreSettingsFormProps) {
  const { $t } = useIntl()

  return (
    <>
      <VLANPooling enableVxLan={enableVxLan}/>
      {!enableVlanPooling &&
              <VLANIdWithDynamicVLAN
                enableVxLan={enableVxLan}
                isPortalDefaultVLANId={isPortalDefaultVLANId}
                showDynamicWlan={showDynamicWlan}
              />
      }

      {enableVxLan &&
        <Space size={1}>
          <UI.InfoIcon/>
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
          <VLANPoolInstance/>
        </div>
      }

      <UI.FieldLabel width='250px'>
        {$t({ defaultMessage: 'Proxy ARP:' })}
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

interface VLANPoolingProps {
    enableVxLan: boolean
}
function VLANPooling ({ enableVxLan }: VLANPoolingProps) {
  const { $t } = useIntl()

  return (
    <UI.FieldLabel width='250px'>
      {$t({ defaultMessage: 'VLAN Pooling:' })}
      <Form.Item
        name='enableVlanPooling'
        style={{ marginBottom: '10px' }}
        valuePropName='checked'
        initialValue={false}
        children={<Switch disabled={!useIsSplitOn(Features.POLICIES) || enableVxLan}/>}
      />
    </UI.FieldLabel>
  )
}

interface VLANIdWithDynamicVLANProps {
    enableVxLan: boolean,
    isPortalDefaultVLANId: boolean,
    showDynamicWlan: boolean
}

function VLANIdWithDynamicVLAN (
  {
    enableVxLan,
    isPortalDefaultVLANId,
    showDynamicWlan
  }: VLANIdWithDynamicVLANProps) {
  const { $t } = useIntl()

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', marginBottom: '10px' }}>
        <Form.Item
          name={['wlan', 'vlanId']}
          label={$t({ defaultMessage: 'VLAN ID' })}
          initialValue={1}
          rules={[
            { required: true }, {
              type: 'number', max: 4094, min: 1,
              message: $t(validationMessages.vlanRange)
            }]}
          style={{ marginBottom: '10px' }}
          children={
            <InputNumber
              style={{ width: '80px' }}
              disabled={isPortalDefaultVLANId || enableVxLan}/>
          }
        />
      </div>
      <div>
        {showDynamicWlan && <DynamicVLAN enableVxLan={enableVxLan}/>}
      </div>
    </>
  )
}

interface DynamicVLANProps {
    enableVxLan: boolean
}
function DynamicVLAN ({ enableVxLan }: DynamicVLANProps) {
  const { $t } = useIntl()

  return (
    <UI.FieldLabel width='250px'>
      {$t({ defaultMessage: 'Dynamic VLAN' })}
      <Form.Item
        name={['wlan', 'advancedCustomization', 'dynamicVlan']}
        style={{ marginBottom: '10px' }}
        valuePropName='checked'
        initialValue={true}
        children={<Switch disabled={enableVxLan}/>}
      />
    </UI.FieldLabel>
  )
}

export default VLANOfNetworkMoreSettingsForm
