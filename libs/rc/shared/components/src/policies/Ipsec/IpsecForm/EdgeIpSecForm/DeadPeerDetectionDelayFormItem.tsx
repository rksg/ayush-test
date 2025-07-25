import { Form, Checkbox, Space, InputNumber } from 'antd'
import { useIntl }                            from 'react-intl'

import { GridRow, GridCol, Tooltip } from '@acx-ui/components'

import { messageMapping } from '../messageMapping'

export const DeadPeerDetectionDelayFormItem = () => {
  const { $t } = useIntl()

  return <GridRow style={{ height: '60px' }}>
    <GridCol col={{ span: 12 }}>
      <Form.Item
        name={['advancedOption', 'dpdDelayEnabled']}
        valuePropName='checked'
        children={
          <>
            <Checkbox
              children={
                <div style={{ color: 'var(--acx-neutrals-60)' }}>
                  {$t({ defaultMessage: 'Dead Peer Detection Delay' })}
                </div>
              } />
            <Tooltip.Question
              title={$t(messageMapping.connection_dead_peer_detection_delay_tooltip)}
              placement='bottom' />
          </>
        }
      />
    </GridCol>
    <GridCol col={{ span: 12 }}>
      <Form.Item
        dependencies={['advancedOption', 'dpdDelayEnabled']}
      >
        {({ getFieldValue }) => {
          const delayEnabled = getFieldValue(['advancedOption', 'dpdDelayEnabled'])
          return delayEnabled && <Form.Item
            children={
              <Space>
                <Form.Item
                  name={['advancedOption','dpdDelay']}
                  rules={[
                    { required: true },
                    { type: 'number', transform: Number, min: 1, max: 65536 }
                  ]}
                  children={<InputNumber />} />
                <span> {$t({ defaultMessage: 'second(s)' })} </span>
              </Space>
            }
          />
        }}
      </Form.Item>
    </GridCol>
  </GridRow>
}