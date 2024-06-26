import React from 'react'

import { Row, Col, Radio, Space, Form }             from 'antd'
import { useIntl, FormattedMessage, defineMessage } from 'react-intl'

import { StepsForm, useStepFormContext } from '@acx-ui/components'

import { mapping, steps }         from '../constants'
import { EnhancedRecommendation } from '../services'
import * as UI                    from '../styledComponents'

const name = 'intentType' as const
const label = defineMessage({ defaultMessage: 'Intent Type' })

export enum IntentType {
  DENSITY = 'density',
  THROUGHPUT = 'throughput'
}

export function Priority () {
  const { $t } = useIntl()
  const { initialValues } = useStepFormContext<EnhancedRecommendation>()
  const title: React.ReactNode = $t(steps.priority)

  const values = {
    p: (text: string) => <UI.Para>{text}</UI.Para>,
    b: (text: string) => <UI.Bold>{text}</UI.Bold>
  }

  return <>
    <StepsForm.StepForm children={title} />
    <Row gutter={20}>
      <Col span={15}>
        <UI.Wrapper>
          <UI.Title>{title}</UI.Title>
          <UI.Content>
            <UI.Subtitle>
              {$t({ defaultMessage: 'What\'s more important to you for this network?' })}
            </UI.Subtitle>
          </UI.Content>
          <UI.Content>
            <Form.Item
              noStyle
              name={name}
              label={$t(label)}
              // initialValue={initialValues?.intentType}
            >
              <Radio.Group>
                <Space direction='vertical'>
                  <Radio value={IntentType.DENSITY}>
                    <FormattedMessage
                      {...mapping.clientDensity.title}
                      values={{ ...values }}
                    />
                  </Radio>
                  <Radio value={IntentType.THROUGHPUT}>
                    <FormattedMessage
                      {...mapping.clientThroughput.title}
                      values={{ ...values }}
                    />
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
          </UI.Content>
        </UI.Wrapper>
      </Col>
      <Col span={7} offset={2}>
        <UI.Wrapper>
          <UI.SideNote>
            <UI.SideNoteHeader>
              <UI.SideNoteTitle>
                {$t({ defaultMessage: 'Side Notes' })}
              </UI.SideNoteTitle>
            </UI.SideNoteHeader>
            <UI.SideNoteSubtitle>
              {$t({ defaultMessage: 'Potential trade-off' })}
            </UI.SideNoteSubtitle>
            <UI.SideNoteContent>
              <FormattedMessage
                {...mapping.sideNotes.tradeoff}
                values={{ ...values }}
              />
            </UI.SideNoteContent>
          </UI.SideNote>
        </UI.Wrapper>
      </Col>
    </Row>
  </>
}

Priority.fieldName = name
Priority.label = label
