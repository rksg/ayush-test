import { Row, Col, Typography }   from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { StepsForm } from '@acx-ui/components'

import WlanSelection from './WlanSelection'

export function Settings () {
  const { $t } = useIntl()
  const calendarText = defineMessage({ defaultMessage: `This recommendation will be
    applied at the chosen time whenever there is a need to change the channel plan.
    Schedule a time during off-hours when the number of WiFi clients is at the minimum.`
  })

  return <Row gutter={20}>
    <Col span={15}>
      <StepsForm.Title children={$t({ defaultMessage: 'Settings' })} />
      <StepsForm.TextContent>
        <Typography.Paragraph>
          {$t(calendarText)}
        </Typography.Paragraph>
      </StepsForm.TextContent>
      <WlanSelection />
    </Col>
    <Col span={7} offset={2}>
      {/* <SideNotes.Settings /> */}
    </Col>
  </Row>
}
