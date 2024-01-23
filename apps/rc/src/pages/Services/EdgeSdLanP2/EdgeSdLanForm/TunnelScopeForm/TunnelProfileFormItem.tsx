import { Col, Form, Row, Select } from 'antd'
import { useIntl }                from 'react-intl'

import { TunnelProfileAddModal }                 from '@acx-ui/rc/components'
import { TunnelProfileFormType, TunnelTypeEnum } from '@acx-ui/rc/utils'

interface TunnelProfileFormItemProps {
  options: { label: string, value: string }[]
  isLoading: boolean
  onChange: (val: string) => void
}

export const TunnelProfileFormItem = (props: TunnelProfileFormItemProps) => {
  const { options, isLoading, onChange } = props
  const { $t } = useIntl()

  const formInitValues = {
    type: TunnelTypeEnum.VLAN_VXLAN,
    disabledFields: ['type']
  }

  return <Row align='middle' gutter={9}>
    <Col span={10}>
      <Form.Item
        name='tunnelProfileId'
        label={$t({ defaultMessage: 'Tunnel Profile (AP- Cluster tunnel)' })}
        rules={[{
          required: true
        }]}
      >
        <Select
          loading={isLoading}
          options={options}
          placeholder={$t({ defaultMessage: 'Select ...' })}
          onChange={onChange}
        />
      </Form.Item>
    </Col>
    <Col span={3}>
      <TunnelProfileAddModal initialValues={formInitValues as TunnelProfileFormType} />
    </Col>
  </Row>
}