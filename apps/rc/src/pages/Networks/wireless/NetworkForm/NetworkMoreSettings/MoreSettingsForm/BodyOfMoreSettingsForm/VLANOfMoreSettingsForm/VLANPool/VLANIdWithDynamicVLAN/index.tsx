
import React from 'react'

import { Form, InputNumber } from 'antd'
import { useIntl }           from 'react-intl'

import { validationMessages } from '@acx-ui/utils'

import DynamicVLAN from './DynamicVLAN'

interface VLANIdWithDynamicVLANProps {
  enableVxLan: boolean;
  isPortalDefaultVLANId: boolean;
  showDynamicWlan: boolean;
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
          data-testid='VLANIdWithDynamicVLAN'
          name={['wlan', 'vlanId']}
          label={$t({ defaultMessage: 'VLAN ID' })}
          initialValue={1}
          rules={[
            { required: true },
            {
              type: 'number', max: 4094, min: 1,
              message: $t(validationMessages.vlanRange)
            }
          ]}
          style={{ marginBottom: '10px' }}
          children={
            <InputNumber
              data-testid='VLANIdWithDynamicVLAN-InputNumber'
              style={{ width: '80px' }}
              disabled={isPortalDefaultVLANId || enableVxLan}
            />
          }
        />
      </div>
      {
        showDynamicWlan &&
              <DynamicVLAN
                data-testid='DynamicVLAN'
                disabledSwitch={enableVxLan}
              />
      }
    </>
  )
}

export default VLANIdWithDynamicVLAN