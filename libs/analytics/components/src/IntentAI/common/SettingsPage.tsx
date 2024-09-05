import { Row, Col } from 'antd'
import { useIntl }  from 'react-intl'

import { StepsForm } from '@acx-ui/components'

import { ScheduleTiming } from './ScheduleTiming'

export function SettingsPage () {
  const { $t } = useIntl()
  return <Row gutter={20}>
    <Col span={15}>
      <StepsForm.TextContent>
        <StepsForm.Title children={$t({ defaultMessage: 'Settings' })} />
        <ScheduleTiming />
      </StepsForm.TextContent>
    </Col>
    <Col span={7} offset={2} />
  </Row>
}
