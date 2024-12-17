import { Row, Col, Typography, Form } from 'antd'
import Checkbox                       from 'antd/lib/checkbox'
import { useIntl }                    from 'react-intl'

import { StepsForm, useStepFormContext } from '@acx-ui/components'

import { ScheduleTiming } from '../../common/ScheduleTiming'
import { ScheduleWeekly } from '../../common/ScheduleWeekly'
import { IntentDetail }   from '../../useIntentDetailsQuery'

import { APsSelection } from './APSelection'
const { Paragraph } = Typography

export function Settings () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<IntentDetail>()
  const enableExcludedHours = Form.useWatch(['preferences', 'enableExcludedHours'])
  const enableExcludedAPs = Form.useWatch(['preferences', 'enableExcludedAPs'])
  const isEnabled = form.getFieldValue('preferences').enable
  const excludedHours = form.getFieldValue('preferences').excludedHours

  const content = {
    // eslint-disable-next-line max-len
    description: $t({ defaultMessage: 'You may direct RUCKUS AI to exclude certain time slots and/or specific APs from being moved to reduced power mode.' }),
    // eslint-disable-next-line max-len
    option1: $t({ defaultMessage: 'Do not apply EcoFlex during the following time slots of the week' }),
    option2: $t({ defaultMessage: 'Do not apply EcoFlex to the following APs' })
  }

  return <Row gutter={20}>
    <Col span={15}>
      <StepsForm.Title children={$t({ defaultMessage: 'Settings' })} />
      <ScheduleTiming disabled={!isEnabled} />

      <StepsForm.Subtitle children={$t({ defaultMessage: 'Optional' })} />
      <Paragraph><span>{content.description}</span></Paragraph>
      <Form.Item
        name={['preferences','enableExcludedHours']}
        valuePropName='checked'>
        <Checkbox
          children={content.option1}
          disabled={!isEnabled}
        />
      </Form.Item>
      {enableExcludedHours && <ScheduleWeekly
        form={form}
        excludedHours={excludedHours}
        readonly={!isEnabled}
      />}
      <Form.Item
        name={['preferences','enableExcludedAPs']}
        valuePropName='checked'>
        <Checkbox
          children={content.option2}
          disabled={!isEnabled}
        />
      </Form.Item>
      {enableExcludedAPs && <APsSelection isDisabled={!isEnabled}/>}
    </Col>

  </Row>
}
