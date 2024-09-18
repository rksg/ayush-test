/* eslint-disable max-len */

import { Row, Col }                  from 'antd'
import { useIntl, FormattedMessage } from 'react-intl'

import { StepsForm, useStepFormContext } from '@acx-ui/components'

import { richTextFormatValues } from '../../common/richTextFormatValues'
import { ScheduleTiming }       from '../../common/ScheduleTiming'
import { Intent }               from '../../useIntentDetailsQuery'

export function Summary () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<Intent>()
  const isEnabled = form.getFieldValue('preferences').enable
  return <Row gutter={20}>
    <Col span={16}>
      <StepsForm.Title children={$t({ defaultMessage: 'Summary' })} />

      {isEnabled
        ? <ScheduleTiming.FieldSummary />
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
