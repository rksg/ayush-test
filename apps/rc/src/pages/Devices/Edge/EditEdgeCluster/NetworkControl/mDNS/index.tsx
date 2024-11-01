import { Col, Form, Row, Space, Switch } from 'antd'
import { useIntl }                       from 'react-intl'

import { StepsForm }               from '@acx-ui/components'
import { ApCompatibilityToolTip }  from '@acx-ui/rc/components'
import { IncompatibilityFeatures } from '@acx-ui/rc/utils'

import EdgeMdnsProfileSelectionForm from './EdgeMdnsProfileSelectionForm'

export const MdnsProxyFormItem = (props: {
  setEdgeFeatureName: (feature: IncompatibilityFeatures) => void
}) => {
  const { $t } = useIntl()
  const { setEdgeFeatureName } = props

  return <Row gutter={20}>
    <Col span={7}>
      <StepsForm.FieldLabel width='50%'>
        <Space>
          {$t({ defaultMessage: 'mDNS Proxy' })}
          <ApCompatibilityToolTip
            title=''
            visible
            onClick={() => setEdgeFeatureName(IncompatibilityFeatures.EDGE_MDNS_PROXY)}
          />
        </Space>
        <Space>
          <Form.Item
            name='edgeMdnsSwitch'
            valuePropName='checked'
          >
            <Switch />
          </Form.Item>
        </Space>
      </StepsForm.FieldLabel>
      <Form.Item dependencies={['edgeMdnsSwitch']}>
        {({ getFieldValue }) => {
          return getFieldValue('edgeMdnsSwitch') && <EdgeMdnsProfileSelectionForm />
        }}
      </Form.Item>
    </Col>
  </Row>
}