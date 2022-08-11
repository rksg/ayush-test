import { Row, Typography }  from 'antd'
import { FormattedMessage } from 'react-intl'

import { getRootCauseAndRecommendations } from '@acx-ui/analytics/utils'
import { Incident }                       from '@acx-ui/analytics/utils'
import { Subtitle }                       from '@acx-ui/components'
import { BulbOutlined }                   from '@acx-ui/icons'

import * as UI from './styledComponents'

export const Insights = (props: Incident) => {
  const [{ rootCauses, recommendations }] = getRootCauseAndRecommendations(
    props.code, props.metadata.rootCauseChecks)
  const values = {
    p: (text: string) => <p>{text}</p>,
    ol: (text: string) => <ol>{text}</ol>,
    li: (text: string) => <li>{text}</li>,
    br: <br/>
  }
  return (
    <UI.InsightComponent>
      <UI.InsightHeader>
        <BulbOutlined />
        <UI.InsightTitle>
          <Typography.Title level={3}>Insights</Typography.Title>
        </UI.InsightTitle>
      </UI.InsightHeader>
      <Row>
        <UI.LeftInsightDetails span={12}>
          <Subtitle level={4}>Root Cause Analysis</Subtitle>
          <FormattedMessage 
            {...rootCauses}
            values={values}
          />
        </UI.LeftInsightDetails>
        <UI.RightInsightDetails span={12}>
          <Subtitle level={4}>Recommended Action</Subtitle>
          <FormattedMessage
            {...recommendations}
            values={values}
          />
        </UI.RightInsightDetails>
      </Row>
    </UI.InsightComponent>
  )
}
