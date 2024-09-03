/* eslint-disable max-len */

import { Col, Row, Typography } from 'antd'
import { useIntl }              from 'react-intl'

import { StepsForm } from '@acx-ui/components'

import { Icon }         from '../../common/IntentIcon'
import { IntroSummary } from '../../common/IntroSummary'
import { aiFeatures }   from '../../config'

import * as SideNotes from './SideNotes'

const { Paragraph } = Typography

export function Introduction (
) {
  const { $t } = useIntl()
  const title1 = $t({ defaultMessage: 'Reduce Management traffic in dense network' })
  const para1 = $t({ defaultMessage: ' Use intelligent probe responses to minimize unnecessary traffic, reducing congestion and improving overall performance by prioritizing essential communications in environments with many devices.' })
  const title2 = $t({ defaultMessage: 'Standard Management traffic in a sparse network' })
  const para2 = $t({ defaultMessage: 'Maintain regular probe responses to ensure reliable connectivity and network stability, as the lower device density doesn\'t typically cause congestion or performance issues, allowing for standard management traffic without adverse effects.' })
  return <Row gutter={20}>
    <Col span={15}>
      <StepsForm.Title children={$t({ defaultMessage: 'Introduction' })} />
      <IntroSummary />
      <StepsForm.TextContent>
        <StepsForm.Subtitle>
          {$t({ defaultMessage: 'Network Intent plays a crucial role in wireless network design' })}
        </StepsForm.Subtitle>
        <Paragraph>
          <b>{title1}:</b> <span>{para1}</span>
        </Paragraph>
        <Paragraph>
          <b>{title2}:</b> <span>{para2}</span>
        </Paragraph>
      </StepsForm.TextContent>
    </Col>
    <Col span={7} offset={2}>
      <SideNotes.Introduction />
    </Col>
  </Row>
}
