/* eslint-disable max-len */

import { Row, Col, Form }            from 'antd'
import { useIntl, FormattedMessage } from 'react-intl'

import { StepsForm, useStepFormContext } from '@acx-ui/components'

import { richTextFormatValues }    from '../../common/richTextFormatValues'
import { ScheduleTiming }          from '../../common/ScheduleTiming'
import { IntentDetail }            from '../../useIntentDetailsQuery'
import { ComparisonDonutChart }    from '../ComparisonDonutChart'
import { useIntentAIEcoFlexQuery } from '../ComparisonDonutChart/services'

export const Summary:React.FC<{ kpiQuery:ReturnType<typeof useIntentAIEcoFlexQuery> }> = (props) => {
  const { $t } = useIntl()
  const { form } = useStepFormContext<IntentDetail>()
  const isEnabled = form.getFieldValue('preferences').enable
  const enableExcludedHours = form.getFieldValue('preferences').enableExcludedHours
  const enableExcludedAPs = form.getFieldValue('preferences').enableExcludedAPs

  return <Row gutter={20}>
    <Col span={16}>
      <StepsForm.Title children={$t({ defaultMessage: 'Summary' })} />

      {isEnabled
        ? <><ScheduleTiming.FieldSummary />
          <Form.Item
            label={$t({ defaultMessage: 'Projected energy reduction' })}
            children={<ComparisonDonutChart kpiQuery={props.kpiQuery} />}
          />
          {enableExcludedHours && <Form.Item
            label={$t({ defaultMessage: 'Hours not applied for Energy Saving' })}
          >
            {$t({ defaultMessage: 'PowerSave will not be triggered during specific hours set in the Settings.' })}
          </Form.Item>
          }
          {enableExcludedAPs && <Form.Item
            label={$t({ defaultMessage: 'APs not applied for Energy Saving' })}
          >
            {$t({ defaultMessage: 'PowerSave will not be triggered for the specific APs set in the Settings.' })}
          </Form.Item>
          }
        </>
        : <FormattedMessage
          values={richTextFormatValues}
          defaultMessage={`
              <p>IntentAI will maintain the existing network configuration and will cease automated monitoring of configuration for handling PowerSafe request/response in the network.</p>
              <p>For manual control, you may directly change the network configurations.</p>
              <p>For automated monitoring and control, you can select the "Resume" action, after which IntentAI will resume overseeing the network for this Intent.</p>
          `} />
      }
    </Col>
  </Row>
}
