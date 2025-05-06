/* eslint-disable max-len */
import { Col, Row, Typography } from 'antd'
import { useIntl }              from 'react-intl'

import { StepsForm } from '@acx-ui/components'

import { IntroSummary }            from '../../common/IntroSummary'
import { useIntentContext }        from '../../IntentContext'
import { MetricsGrid }             from '../MetricsGrid'
import { useIntentAIEcoFlexQuery } from '../services'

import * as SideNotes from './SideNotes'

const { Paragraph } = Typography

export const Introduction: React.FC<{
  kpiQuery: ReturnType<typeof useIntentAIEcoFlexQuery>
}> = ({ kpiQuery }) => {
  const { $t } = useIntl()
  const title1 = $t({ defaultMessage: 'Reduction in energy footprint' })
  const para1 = $t({ defaultMessage: 'Enable PowerSave mode for few access points during off-peak hours to conserve energy. This approach may involve some compromises, but overall service quality remains unaffected during these periods.' })
  const title2 = $t({ defaultMessage: 'Operation of the mission critical network' })
  const para2 = $t({ defaultMessage: 'Maintain all access points at normal power continuously to ensure maximum reliability and performance for critical applications, guaranteeing uninterrupted, high-quality connectivity essential for mission-critical operations.' })
  const { isDataRetained: showData } = useIntentContext()

  return <Row gutter={20}>
    <Col span={15}>
      <StepsForm.Title children={$t({ defaultMessage: 'Introduction' })} />
      <IntroSummary />
      <StepsForm.TextContent>
        <StepsForm.Subtitle>
          {$t({ defaultMessage: 'Wireless network design involves balancing different priorities:' })}
        </StepsForm.Subtitle>
        <Paragraph>
          <b>{title1}:</b> <span>{para1}</span>
        </Paragraph>
        <Paragraph>
          <b>{title2}:</b> <span>{para2}</span>
        </Paragraph>
      </StepsForm.TextContent>
      {showData && <MetricsGrid kpiQuery={kpiQuery} />}
    </Col>
    <Col span={7} offset={2}>
      <SideNotes.Introduction />
    </Col>
  </Row>
}
