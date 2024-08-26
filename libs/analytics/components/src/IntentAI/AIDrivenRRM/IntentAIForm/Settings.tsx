import { Row, Col }                  from 'antd'
import moment                        from 'moment-timezone'
import { FormattedMessage, useIntl } from 'react-intl'

import { StepsForm }                      from '@acx-ui/components'
import { DateTimeDropdown, TimeDropdown } from '@acx-ui/components'

import { useIntentContext }     from '../../IntentContext'
import { Statuses }             from '../../states'
import { richTextFormatValues } from '../common/richTextFormatValues'

import * as SideNotes from './SideNotes'

export const ScheduleTiming = () => {
  const { intent } = useIntentContext()
  const status = intent.status as Statuses
  const name = 'settings'

  if ([Statuses.new, Statuses.scheduled].includes(status)) {
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
  return <Row gutter={20}>
    <Col span={15}>
      <StepsForm.Title children={$t({ defaultMessage: 'Settings' })} />
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
        <ScheduleTiming />
      </StepsForm.TextContent>
    </Col>
    <Col span={7} offset={2}>
      <SideNotes.Settings />
    </Col>
  </Row>
}
