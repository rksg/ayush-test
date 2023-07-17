import React from 'react'

import { Form, Space, Switch } from 'antd'
import { useIntl }             from 'react-intl'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import * as UI          from '../../../../../NetworkMoreSettings/styledComponents'
import VLANPoolInstance from '../../../../../VLANPoolInstance'

import VLANIdWithDynamicVLAN from '.'


interface VLANPoolProps {
    enableVxLan: boolean
    enableVlanPooling: boolean
    isPortalDefaultVLANId: boolean
    showDynamicWlan: boolean
}

export default function VLANPool ({
  enableVxLan,
  enableVlanPooling,
  showDynamicWlan,
  isPortalDefaultVLANId
}: VLANPoolProps) {
  const { $t } = useIntl()

  return (
    <>
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
      {!enableVlanPooling &&
                      <VLANIdWithDynamicVLAN
                        enableVxLan={enableVxLan}
                        isPortalDefaultVLANId={isPortalDefaultVLANId}
                        showDynamicWlan={showDynamicWlan}
                        enableVlanPooling={enableVlanPooling}
                      />
      }
      {enableVxLan &&
                      <Space size={1}>
                        <UI.InfoIcon/>
                        <UI.Description>
                          {$t({
                            // eslint-disable-next-line max-len
                            defaultMessage: 'Not able to modify when the network enables network segmentation service'
                          })}
                        </UI.Description>
                      </Space>
      }
      {enableVlanPooling &&
                      <div style={{ display: 'grid', gridTemplateColumns: '190px auto' }}>
                        <VLANPoolInstance/>
                      </div>
      }
    </>
  )
}
