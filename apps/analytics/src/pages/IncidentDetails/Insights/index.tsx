import { Row, Typography }  from 'antd'
import { FormattedMessage } from 'react-intl'

import { getRootCauseAndRecommendations } from '@acx-ui/analytics/utils'
import { Subtitle }                       from '@acx-ui/components'
import { BulbOutlined }                   from '@acx-ui/icons'

import { IncidentDetailsProps } from '../types'

import * as UI from './styledComponents'

export const incidentDetailsCodeMap = {
  'radius-failure': 'radius',
  'dhcp-failure': 'dhcp',
  'eap-failure': 'eap',
  'auth-failure': 'auth',
  'assoc-failure': 'assoc'
}

export const Insights = (props: IncidentDetailsProps) => {
  const [{ rootCauses, recommendations }] = getRootCauseAndRecommendations(
    props.code, props.metadata.rootCauseChecks)
  const values = {
    p: (text: string) => <p>{text}</p>,
    ol: (text: string) => <ol>{text}</ol>,
    li: (text: string) => <li>{text}</li>,
    br: () => <br></br>
  }
  const rootCauseProps = {
    id: props.id + rootCauses,
    defaultMessage: rootCauses,
    values: values
  }
  const recommendationProps = {
    id: props.id + recommendations,
    defaultMessage: recommendations,
    values: values
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
          <FormattedMessage {...rootCauseProps}/>
        </UI.LeftInsightDetails>
        <UI.RightInsightDetails span={12}>
          <Subtitle level={4}>Recommended Action</Subtitle>
          <FormattedMessage {...recommendationProps}/>
        </UI.RightInsightDetails>
      </Row>
    </UI.InsightComponent>
  )
}
