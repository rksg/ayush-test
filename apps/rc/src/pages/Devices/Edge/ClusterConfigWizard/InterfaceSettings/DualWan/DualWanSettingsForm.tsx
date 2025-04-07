import { Col, Form, Row, Select } from 'antd'
import { useIntl }                from 'react-intl'

import { getDualWanModeString } from '@acx-ui/edge/components'
import { EdgeMultiWanModeEnum } from '@acx-ui/rc/utils'

import { WanPriorityTable } from './WanPriorityTable'

export interface DualWanSettingsFormProps {
  nodeNameMapping: Record<string, string>
}
// eslint-disable-next-line max-len
export const DualWanSettingsForm = ({ nodeNameMapping }: DualWanSettingsFormProps) => {
  const { $t } = useIntl()

  return <>
    <Row>
      <Col span={6}>
        <Form.Item
          name={['multiWanSettings', 'mode']}
          label={$t({ defaultMessage: 'Dual-WAN Mode' })}
          rules={[{
            required: true
          }]}
        >
          <Select
            disabled
            children={
              Object.keys(EdgeMultiWanModeEnum).map((key) => {
                return <Select.Option key={key} value={key}>
                  {getDualWanModeString(key as EdgeMultiWanModeEnum)}
                </Select.Option>
              })}
          />
        </Form.Item>
      </Col>
    </Row>
    <Row>
      <Col span={20}>
        <Form.Item
          name={['multiWanSettings', 'wanMembers']}
          label={$t({ defaultMessage: 'WAN Links Management' })}
          rules={[{
            required: true
          }]}
          valuePropName='data'
        >
          <WanPriorityTable nodeNameMapping={nodeNameMapping} />
        </Form.Item>
      </Col>
    </Row>
  </>
}