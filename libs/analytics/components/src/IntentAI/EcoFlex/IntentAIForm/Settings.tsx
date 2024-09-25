import { Row, Col } from 'antd'
import { useIntl }  from 'react-intl'

import { StepsForm, useStepFormContext } from '@acx-ui/components'

import { ScheduleTiming } from '../../common/ScheduleTiming'
import { Intent }         from '../../useIntentDetailsQuery'

import { APsSelection } from './APSelection'
export function Settings () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<Intent>()
  const isEnabled = form.getFieldValue('preferences').enable
  return <Row gutter={20}>
    <Col span={15}>
      <StepsForm.Title children={$t({ defaultMessage: 'Settings' })} />
      <ScheduleTiming disabled={!isEnabled} />
      <APsSelection />
    </Col>

  </Row>
}
