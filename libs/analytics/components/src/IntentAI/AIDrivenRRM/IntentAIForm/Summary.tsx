
import { Row, Col, Form }                           from 'antd'
import { defineMessage, FormattedMessage, useIntl } from 'react-intl'

import { StepsForm, ProcessedCloudRRMGraph, Tooltip } from '@acx-ui/components'

import { KPIFields }            from '../../common/KPIs'
import { richTextFormatValues } from '../../common/richTextFormatValues'
import { ScheduleTiming }       from '../../common/ScheduleTiming'
import { useIntentContext }     from '../../IntentContext'
import { Statuses }             from '../../states'
import { IntentAIRRMGraph }     from '../RRMGraph'

import * as SideNotes from './SideNotes'

const getRRMGraphTooltip = (status: Statuses) => {
  if (!(status === Statuses.new || status === Statuses.active)) {
    return null
  }

  const text = status === Statuses.new
    ? defineMessage({ defaultMessage: `
      The graph and channel plan are generated based on the <i>default</i> Intent priority.
      `
    })
    : defineMessage({ defaultMessage: `
      The graph and channel plan are generated based on the <i>previously saved</i> Intent priority.
      `
    })
  return {
    title: defineMessage({ defaultMessage: `
      If the Intent priority is changed and applied, the RRM Machine Learning algorithm 
      will re-learn using the updated Intent priority and recent dynamic metrics during 
      the next scheduled daily execution, rebuilding the graph and channel plan accordingly.
      `
    }),
    text: text
  }
}


export function Summary (
  { summaryUrlBefore, summaryUrlAfter, crrmData } :
  { summaryUrlBefore?: string, summaryUrlAfter?: string, crrmData: ProcessedCloudRRMGraph[] }) {
  const { $t } = useIntl()
  const { intent } = useIntentContext()
  const rrmGraphTooltip = getRRMGraphTooltip(intent.status)

  return <Row gutter={20}>
    <Col span={16}>
      <StepsForm.Title children={$t({ defaultMessage: 'Summary' })} />
      <Form.Item label={$t({ defaultMessage: 'Projected interfering links reduction' })}>
        <IntentAIRRMGraph
          crrmData={crrmData}
          summaryUrlBefore={summaryUrlBefore}
          summaryUrlAfter={summaryUrlAfter}
        />
      </Form.Item>
      {rrmGraphTooltip && (<Form.Item>
        <Tooltip
          title={$t(rrmGraphTooltip.title)}
          placement='left'
          dottedUnderline={true}
        >
          ​{<FormattedMessage {...rrmGraphTooltip.text} values={richTextFormatValues} />}
        </Tooltip>
      </Form.Item>)}
      <KPIFields/>
      <ScheduleTiming.FieldSummary />
    </Col>
    <Col span={7} offset={1}>
      <SideNotes.Summary />
    </Col>
  </Row>
}
