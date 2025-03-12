import { Row, Col } from 'antd'
import { useIntl }  from 'react-intl'

import { StepsForm, useStepFormContext } from '@acx-ui/components'

import { ScheduleTiming } from '../../common/ScheduleTiming'
import { IntentDetail }   from '../../useIntentDetailsQuery'

import WlanSelection from './WlanSelection'

export function Settings () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<IntentDetail>()
  const isEnabled = form.getFieldValue('preferences').enable
  return <Row gutter={20}>
    <Col span={15}>
      <StepsForm.Title children={$t({ defaultMessage: 'Settings' })} />
      <ScheduleTiming disabled={!isEnabled} />
      <WlanSelection disabled={!isEnabled}/>
    </Col>

  </Row>
}
