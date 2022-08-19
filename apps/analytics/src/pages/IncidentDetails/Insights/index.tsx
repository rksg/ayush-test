import { Col, Row, Space, Typography } from 'antd'
import { FormattedMessage }            from 'react-intl'
import { useIntl }                     from 'react-intl'

import { getRootCauseAndRecommendations } from '@acx-ui/analytics/utils'
import { Incident }                       from '@acx-ui/analytics/utils'
import { Subtitle }                       from '@acx-ui/components'
import { BulbOutlined }                   from '@acx-ui/icons'

import * as UI from './styledComponents'

export const Insights = ({ incident }: { incident: Incident }) => {
  const { $t } = useIntl()
  const [{ rootCauses, recommendations }] = getRootCauseAndRecommendations(incident)
  const values = {
    p: (text: string) => <p>{text}</p>,
    ol: (text: string) => <ol>{text}</ol>,
    li: (text: string) => <li>{text}</li>,
    br: <br/>
  }
  return (
    <UI.InsightComponent>
      <Space size={10} align='start'>
        <BulbOutlined />
        <Typography.Title level={2}>{$t({ defaultMessage: 'Insights' })}</Typography.Title>
      </Space>
      <Row gutter={25}>
        <Col span={12}>
          <Subtitle level={4}>{$t({ defaultMessage: 'Root Cause Analysis' })}</Subtitle>
          <FormattedMessage
            {...rootCauses}
            values={values}
          />
        </Col>
        <Col span={12}>
          <Subtitle level={4}>{$t({ defaultMessage: 'Recommended Action' })}</Subtitle>
          <FormattedMessage
            {...recommendations}
            values={values}
          />
        </Col>
      </Row>
    </UI.InsightComponent>
  )
}
