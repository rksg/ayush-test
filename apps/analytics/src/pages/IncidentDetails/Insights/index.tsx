import { Row, Typography }  from 'antd'
import { FormattedMessage } from 'react-intl'

import { getRootCauseAndRecommendations } from '@acx-ui/analytics/utils'
import { Subtitle }                       from '@acx-ui/components'
import { BulbOutlined }                   from '@acx-ui/icons'

import * as UI                  from '../syledComponents'
import { IncidentDetailsProps } from '../types'


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
  const rootCauseProps = {
    id: props.id,
    defaultMessage: rootCauses
  }
  const recommendationProps = {
    id: props.id,
    defaultMessage: recommendations
  }
  return (
    <UI.InsightComponent>
      <div>
        <Typography.Title level={3}>Insights</Typography.Title>
        <BulbOutlined />
      </div>
      <Row>
        <UI.InsightDetails span={8}>
          <Subtitle level={5}>Root Cause Analysis</Subtitle>
          <FormattedMessage {...rootCauseProps}/>
        </UI.InsightDetails>
        <UI.InsightDetails span={8}>
          <Subtitle level={5}>Recommended Action</Subtitle>
          <FormattedMessage {...recommendationProps}/>
        </UI.InsightDetails>
      </Row>
    </UI.InsightComponent>
  )
}
