import { Checkbox, Col, Row, Space, Typography } from 'antd'
import { useIntl }                               from 'react-intl'

import { Card }             from '@acx-ui/components'
import { AupActionContext } from '@acx-ui/rc/utils'



export default function AupActionPreview (props: AupActionContext) {
  const { $t } = useIntl()
  const { title, messageHtml } = props

  return (
    <Row gutter={20} style={{ padding: '20px' }}>
      <Col span={24}>
        <Card>
          <Space align={'center'} direction={'vertical'}>
            <Typography.Title level={3}>{title}</Typography.Title>
            <Typography.Text>
              <div dangerouslySetInnerHTML={{ __html: messageHtml }}/>
            </Typography.Text>
            <Checkbox>
              {$t({ defaultMessage: 'I agree to the Terms & Conditions' })}
            </Checkbox>
          </Space>
        </Card>
      </Col>
    </Row>
  )
}
