import { Row, Col, Typography, Form }               from 'antd'
import { NamePath }                                 from 'antd/lib/form/interface'
import moment                                       from 'moment-timezone'
import { defineMessage, FormattedMessage, useIntl } from 'react-intl'

import { DateTimeDropdown, StepsForm, TimeDropdown, useLayoutContext, useStepFormContext } from '@acx-ui/components'

import { richTextFormatValues }                              from '../../AIDrivenRRM/common/richTextFormatValues'
import { statuses }                                          from '../../states'
import { EnhancedIntent, getLocalScheduledAt, SettingsType } from '../services'
import * as UI                                               from '../styledComponents'
import { handleScheduledAt }                                 from '../utils'

import { IntentPriority, Priority } from './priority'

import { steps, crrmIntent, isOptimized } from '.'

const name = 'settings' as NamePath
const label = defineMessage({ defaultMessage: 'Settings' })

export const ScheduleTiming = () => {
  const { initialValues } = useStepFormContext<EnhancedIntent>()
  const status = initialValues?.status! as statuses

  if ([statuses.new, statuses.scheduled].includes(status)) {
    return <DateTimeDropdown
      name={name}
      dateLabel={<FormattedMessage defaultMessage='Schedule Date' />}
      timeLabel={<FormattedMessage defaultMessage='Schedule Time' />}
      disabledDate={(date) => date.isBefore(moment().startOf('day'))}
    />
  } else {
    return <TimeDropdown
      name={name}
      label={<FormattedMessage defaultMessage='Schedule Time' />}
    />
  }
}

export function Settings () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<EnhancedIntent>()
  const { pageHeaderY } = useLayoutContext()
  const intentPriority = form.getFieldValue(Priority.fieldName)

  return <Row gutter={20}>
    <Col span={15}>
      <StepsForm.Title children={$t(steps.title.settings)} />
      <StepsForm.TextContent>
        <FormattedMessage
          values={richTextFormatValues}
          /* eslint-disable max-len */
          defaultMessage={`
            <p>
              Choose a start date for IntentAI to begin autonomously managing your network settings and configurations.
            </p>
            <p>
              Additionally, select the time of day when these changes should occur. This time will be used daily by IntentAI to implement any necessary adjustments.
            </p>
            <p>
              It is advisable to select a time during low network usage to minimize disruptions.
            </p>
          `}
          /* eslint-enable */
        />
      </StepsForm.TextContent>
      <ScheduleTiming />
    </Col>
    <Col span={7} offset={2}>
      <UI.SideNotes $pageHeaderY={pageHeaderY}>
        <Typography.Title level={4}>
          {$t({ defaultMessage: 'Side Notes' })}
        </Typography.Title>
        <StepsForm.Subtitle>
          {$t(crrmIntent[isOptimized(intentPriority) as IntentPriority]?.title)}
        </StepsForm.Subtitle>
        <StepsForm.TextContent>
          <Typography.Paragraph>
            {$t(crrmIntent[isOptimized(intentPriority) as IntentPriority]?.content)}
          </Typography.Paragraph>
        </StepsForm.TextContent>
      </UI.SideNotes>
    </Col>
  </Row>
}

Settings.fieldName = name
Settings.label = label
Settings.FieldSummary = function ScheduleFieldSummary () {
  return <Form.Item
    name={name}
    children={<StepsForm.FieldSummary<SettingsType> convert={(value) => {
      const localScheduledAt = getLocalScheduledAt(value!.date!, value!.hour!)
      const newScheduledAt = handleScheduledAt(localScheduledAt)
      return newScheduledAt
    }}/>}
  />
}
