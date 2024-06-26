import React from 'react'

import { Row, Col, Radio, Space, Form } from 'antd'
import { useIntl, defineMessage }       from 'react-intl'

import * as constants from '../constants'
import * as UI        from '../styledComponents'

const name = 'intentType' as const
const label = defineMessage({ defaultMessage: 'Intent Type' })

export enum IntentType {
  DENSITY = 'clientDensity',
  THROUGHPUT = 'clientThroughput'
}

export function Priority () {
  const { $t } = useIntl()
  const title: React.ReactNode = $t(constants.steps.priority)

  return <Row gutter={20}>
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
          >
            <Radio.Group>
              <Space direction='vertical'>
                <Radio value={IntentType.DENSITY}>
                  {$t(constants.content.clientDensity.title)}
                </Radio>
                <Radio value={IntentType.THROUGHPUT}>
                  {$t(constants.content.clientThroughput.title)}
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
              {$t(constants.content.sideNotes.title)}
            </UI.SideNoteTitle>
          </UI.SideNoteHeader>
          <UI.SideNoteSubtitle>
            {$t({ defaultMessage: 'Potential trade-off' })}
          </UI.SideNoteSubtitle>
          <UI.SideNoteContent>
            {$t(constants.content.sideNotes.tradeoff)}
          </UI.SideNoteContent>
        </UI.SideNote>
      </UI.Wrapper>
    </Col>
  </Row>
}

Priority.fieldName = name
Priority.label = label
