/* eslint-disable max-len */
import { Row, Col, Form }            from 'antd'
import { useIntl, FormattedMessage } from 'react-intl'

import { StepsForm, useStepFormContext } from '@acx-ui/components'

import { richTextFormatValues }    from '../../common/richTextFormatValues'
import { ScheduleTiming }          from '../../common/ScheduleTiming'
import { IntentDetail }            from '../../useIntentDetailsQuery'
import { CustomizeKPIGrid }        from '../CustomizeKPIGrid'
import { useIntentAIEcoFlexQuery } from '../services'

import { usePriorityItems } from './Priority'

export const Summary:React.FC<{ kpiQuery:ReturnType<typeof useIntentAIEcoFlexQuery> }> = (props) => {
  const { $t } = useIntl()
  const priority = usePriorityItems()
  const { form } = useStepFormContext<IntentDetail>()
  const isEnabled = form.getFieldValue('preferences').enable
  const enableExcludedHours = form.getFieldValue('preferences').enableExcludedHours
  const enableExcludedAPs = form.getFieldValue('preferences').enableExcludedAPs
  const enablePriority = form.getFieldValue('preferences').enable

  return <Row gutter={20}>
    <Col span={16}>
      <StepsForm.Title children={$t({ defaultMessage: 'Summary' })} />

      {isEnabled
        ? <>
          <Form.Item
            label={$t({ defaultMessage: 'Selected Intent Priority' })}
            children={
              <>
                <StepsForm.Subtitle children={`${priority.find((item) => item.value === enablePriority)?.children}:`} />
                <StepsForm.TextContent children={priority.find((item) => item.value === enablePriority)?.columns[1]} />
              </>
            }
          />
          <Form.Item
            label={$t({ defaultMessage: 'Projection' })}
            children={<CustomizeKPIGrid kpiQuery={props.kpiQuery} isDetail={false} />}
          />
          <ScheduleTiming.FieldSummary />
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
