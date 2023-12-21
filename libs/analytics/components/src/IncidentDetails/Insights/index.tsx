import { Space }            from 'antd'
import { FormattedMessage } from 'react-intl'
import { useIntl }          from 'react-intl'

import {
  productNames,
  getRootCauseAndRecommendations,
  Incident
} from '@acx-ui/analytics/utils'
import {
  Card,
  GridRow,
  GridCol
} from '@acx-ui/components'

import * as UI from './styledComponents'

export const Insights = ({ incident }: { incident: Incident }) => {
  const { $t } = useIntl()
  const [{ rootCauses, recommendations }] = getRootCauseAndRecommendations(incident)
  const { rootCauseText, rootCauseValues } = rootCauses
  const { recommendationsText, recommendationsValues } = recommendations
  const values = {
    ...productNames,
    p: (text: string) => <p>{text}</p>,
    ol: (text: string) => <ol>{text}</ol>,
    li: (text: string) => <li>{text}</li>,
    ul: (text: string) => <ul>{text}</ul>
  }
  return (
    <Card type='solid-bg'>
      <UI.Wrapper>
        <Space align='start' size={6}>
          <UI.BulbOutlinedIcon />
          <UI.Title>{$t({ defaultMessage: 'Insights' })}</UI.Title>
        </Space>
        <GridRow>
          <GridCol col={{ span: 12 }}>
            <UI.Subtitle>{$t({ defaultMessage: 'Root Cause Analysis' })}</UI.Subtitle>
            <FormattedMessage {...rootCauseText} values={{ ...values, ...rootCauseValues }} />
          </GridCol>
          <GridCol col={{ span: 12 }}>
            <UI.Subtitle>{$t({ defaultMessage: 'Recommended Action' })}</UI.Subtitle>
            <FormattedMessage
              {...recommendationsText}
              values={{ ...values, ...recommendationsValues }}
            />
          </GridCol>
        </GridRow>
      </UI.Wrapper>
    </Card>
  )
}
