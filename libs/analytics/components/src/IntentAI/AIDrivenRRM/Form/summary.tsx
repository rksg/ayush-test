import React from 'react'

import { Row, Col } from 'antd'
import { useIntl }  from 'react-intl'

import { useStepFormContext } from '@acx-ui/components'

import * as config                from '../config'
import { EnhancedRecommendation } from '../services'
import * as UI                    from '../styledComponents'

import { IntentType, Priority } from './priority'

export function Summary () {
  const { $t } = useIntl()
  const title = $t(config.steps.title.summary)
  const { form } = useStepFormContext<EnhancedRecommendation>()
  const intentType = form.getFieldValue(Priority.fieldName)

  return <Row gutter={20}>
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
              {$t(config.steps.sideNotes.title)}
            </UI.SideNoteTitle>
          </UI.SideNoteHeader>
          <UI.SideNoteSubtitle>
            {$t(config.steps[intentType as IntentType]?.title)}
          </UI.SideNoteSubtitle>
          <UI.SideNoteContent>
            {$t(config.steps[intentType as IntentType]?.content)}
          </UI.SideNoteContent>
        </UI.SideNote>
      </UI.Wrapper>
    </Col>
  </Row>
}
