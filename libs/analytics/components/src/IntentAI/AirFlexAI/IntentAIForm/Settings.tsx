import { Row, Col, Typography }   from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { StepsForm } from '@acx-ui/components'

import * as SideNotes from './SideNotes'
import WlanSelection from './WlanSelection'
import { ScheduleTiming } from '../../common/ScheduleTiming'

export function Settings () {
  const { $t } = useIntl()

  return <Row gutter={20}>
    <Col span={15}>
      <StepsForm.Title children={$t({ defaultMessage: 'Settings' })} />
      <ScheduleTiming />
      <WlanSelection />
    </Col>
    
  </Row>
}
