import { Space }            from 'antd'
import { FormattedMessage } from 'react-intl'
import { useIntl }          from 'react-intl'

import {
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
  const values = {
    p: (text: string) => <p>{text}</p>,
    ol: (text: string) => <ol>{text}</ol>,
    li: (text: string) => <li>{text}</li>
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
            <FormattedMessage {...rootCauses} values={values} />
          </GridCol>
          <GridCol col={{ span: 12 }}>
            <UI.Subtitle>{$t({ defaultMessage: 'Recommended Action' })}</UI.Subtitle>
            <FormattedMessage {...recommendations} values={values} />
          </GridCol>
        </GridRow>
      </UI.Wrapper>
    </Card>
  )
}
