import React from 'react'

import { Row, Col, Typography }   from 'antd'
import { useIntl, defineMessage } from 'react-intl'

import { StepsForm, useStepFormContext } from '@acx-ui/components'

import * as config                from '../config'
import { EnhancedRecommendation } from '../services'
import * as UI                    from '../styledComponents'

const name = 'intentType' as const
const label = defineMessage({ defaultMessage: 'Intent Type' })

export enum IntentType {
  DENSITY = 'clientDensity',
  THROUGHPUT = 'clientThroughput'
}

export function Priority () {
  const { $t } = useIntl()
  const { initialValues } = useStepFormContext<EnhancedRecommendation>()

  return <Row gutter={20}>
    <Col span={15}>
      <StepsForm.Title children={$t(config.steps.title.priority)} />
      <StepsForm.Subtitle>
        {$t(
          { defaultMessage: 'What is your primary network intent for Zone {zone}' },
          { zone: initialValues?.sliceValue }
        )}
      </StepsForm.Subtitle>
    </Col>
    <Col span={7} offset={2}>
      <UI.SideNotes>
        <Typography.Title level={4}>
          {$t({ defaultMessage: 'Side Notes' })}
        </Typography.Title>
        <StepsForm.Subtitle>
          {$t({ defaultMessage: 'Potential trade-off?' })}
        </StepsForm.Subtitle>
        <StepsForm.TextContent>
          <Typography.Paragraph>
            {$t(config.steps.sideNotes.tradeoff)}
          </Typography.Paragraph>
        </StepsForm.TextContent>
      </UI.SideNotes>
    </Col>
  </Row>
}

Priority.fieldName = name
Priority.label = label
