// import React from 'react'

// import { Row, Col } from 'antd'
// import { useIntl }  from 'react-intl'

// import { StepsForm, ProcessedCloudRRMGraph } from '@acx-ui/components'

// import { KpiField }                          from '../../common/KpiField'
// import { useIntentContext }                  from '../../IntentContext'
// import { getGraphKPIs }                      from '../../useIntentDetailsQuery'
// import { dataRetentionText, isDataRetained } from '../../utils'

// import * as SideNotes from './SideNotes'

// export function Summary (
//   { summaryUrlBefore, summaryUrlAfter, crrmData } :
//   { summaryUrlBefore?: string, summaryUrlAfter?: string, crrmData: ProcessedCloudRRMGraph[] }) {
//   const { $t } = useIntl()
//   const { intent, kpis } = useIntentContext()

//   return <Row gutter={20}>
//     <Col span={16}>
//       <StepsForm.Title children={$t({ defaultMessage: 'Summary' })} />
//       <StepsForm.Subtitle>
//         {$t({ defaultMessage: 'Schedule' })}
//       </StepsForm.Subtitle>
//     </Col>
//     <Col span={7} offset={1}>
//       {/* <SideNotes.Summary /> */}
//     </Col>
//   </Row>
// }
