import React from 'react'

import { Row, Col } from 'antd'
import { useIntl }  from 'react-intl'

import { useStepFormContext } from '@acx-ui/components'

import * as constants             from '../constants'
import { EnhancedRecommendation } from '../services'
import * as UI                    from '../styledComponents'

import { IntentType, Priority } from './priority'

export function Settings () {
  const { $t } = useIntl()
  const title: React.ReactNode = $t(constants.steps.settings)
  const { form } = useStepFormContext<EnhancedRecommendation>()
  const intentType = form.getFieldValue(Priority.fieldName)

  return <Row gutter={20}>
    <Col span={15}>
      <UI.Wrapper>
        <UI.Title>{title}</UI.Title>
        <UI.Content>
          {$t(constants.content.calendarText)}
        </UI.Content>
      </UI.Wrapper>
    </Col>

    <Col span={7} offset={2}>
      <UI.Wrapper>
        <UI.SideNote>
          <UI.SideNoteHeader>
            <UI.SideNoteTitle>
              {$t(constants.content.sideNotes.title)}
            </UI.SideNoteTitle>
          </UI.SideNoteHeader>
          <UI.SideNoteSubtitle>
            {$t(constants.content[intentType as IntentType]?.title)}
          </UI.SideNoteSubtitle>
          <UI.SideNoteContent>
            {$t(constants.content[intentType as IntentType]?.content)}
          </UI.SideNoteContent>
        </UI.SideNote>
      </UI.Wrapper>
    </Col>
  </Row>
}
