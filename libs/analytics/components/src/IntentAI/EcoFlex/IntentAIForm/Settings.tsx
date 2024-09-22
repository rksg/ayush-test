import { useState } from 'react'

import { Row, Col, Typography }          from 'antd'
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { useIntl }                       from 'react-intl'

import { StepsForm, useStepFormContext } from '@acx-ui/components'

import { ScheduleWeekly } from '../../common/ScheduleWeekly'
import { Intent }         from '../../useIntentDetailsQuery'

const { Paragraph } = Typography

export function Settings () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<Intent>()
  const excludedHours = form.getFieldValue('preferences').excludedHours
  const [checkedSchedule, setCheckedSchedule] = useState(excludedHours??false)

  const content = {
    // eslint-disable-next-line max-len
    description: $t({ defaultMessage: 'You may direct RUCKUS AI to exclude certain time slots and/or specific APs from being moved to reduced power mode.' }),
    // eslint-disable-next-line max-len
    option1: $t({ defaultMessage: 'Do not apply EcoFlexAI during the following time slots of the week' }),
    option2: $t({ defaultMessage: 'Do not apply EcoFlexAI to the following AP Groups / APs' })
  }
  return <Row gutter={20}>
    <Col span={15}>
      <StepsForm.Title children={$t({ defaultMessage: 'Settings' })} />
      <StepsForm.Subtitle children={$t({ defaultMessage: 'Optional' })} />
      <Paragraph><span>{content.description}</span></Paragraph>
      <Checkbox
        onChange={(e: CheckboxChangeEvent) => setCheckedSchedule(e.target.checked)}
        checked={checkedSchedule}
        children={content.option1}
      />
      {checkedSchedule && <ScheduleWeekly form={form} excludedHours={excludedHours}/>}
    </Col>

  </Row>
}
