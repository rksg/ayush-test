
import { Row, Col } from 'antd'
import { useIntl }  from 'react-intl'

import { StepsForm } from '@acx-ui/components'

import { useIntentContext } from '../../IntentContext'

export function Summary (
) {
  const { $t } = useIntl()
  useIntentContext()

  return <Row gutter={20}>
    <Col span={16}>
      <StepsForm.Title children={$t({ defaultMessage: 'Summary' })} />
      <StepsForm.Subtitle>
        {$t({ defaultMessage: 'Schedule' })}
      </StepsForm.Subtitle>
    </Col>
    <Col span={7} offset={1}>
      {/* <SideNotes.Summary /> */}
    </Col>
  </Row>
}
