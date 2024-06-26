import React from 'react'

import { Row, Col }                  from 'antd'
import { useIntl, FormattedMessage } from 'react-intl'

import { StepsForm, useStepFormContext } from '@acx-ui/components'

import { mapping, steps }         from '../constants'
import { EnhancedRecommendation } from '../services'
import * as UI                    from '../styledComponents'

export function Summary () {
  const { $t } = useIntl()
  const { form } = useStepFormContext<EnhancedRecommendation>()
  const title: React.ReactNode = $t(steps.summary)

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
            {/* <UI.SideNoteSubtitle>
              <FormattedMessage
                {...(radio === 0
                  ? mapping.clientDensity.title : mapping.clientThroughput.title)}
                values={{ ...values }}
              />
            </UI.SideNoteSubtitle>
            <UI.SideNoteContent>
              <FormattedMessage
                {...(radio === 0
                  ? mapping.clientDensity.content : mapping.clientThroughput.content)}
                values={{ ...values }}
              />
            </UI.SideNoteContent> */}
          </UI.SideNote>
        </UI.Wrapper>
      </Col>
    </Row>
  </>



}