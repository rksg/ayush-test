import React from 'react'

import { Row, Col }                                 from 'antd'
import { useIntl, FormattedMessage, defineMessage } from 'react-intl'

import { useStepFormContext }        from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'

import * as config                from '../config'
import { EnhancedRecommendation } from '../services'
import * as UI                    from '../styledComponents'


export function Introduction () {
  const { $t } = useIntl()
  const { initialValues } = useStepFormContext<EnhancedRecommendation>()
  const title: React.ReactNode = $t(config.steps.title.introduction)
  const status = initialValues?.status!

  const values = {
    p: (text: string) => <UI.Para>{text}</UI.Para>,
    b: (text: string) => <UI.Bold>{text}</UI.Bold>
  }

  return <Row gutter={20}>
    <Col span={15}>
      <UI.Wrapper>
        <UI.Title>{title}</UI.Title>
        <UI.Content>
          <UI.ContentText>
            <span>
              {$t({ defaultMessage: 'Intent:' })}
              <b>&nbsp;{$t({ defaultMessage: 'Client density vs Client throughput' })}</b>
            </span>
          </UI.ContentText>
          <UI.ContentText>
            {$t({ defaultMessage: 'Category: Wi-Fi Client Experience' })}
          </UI.ContentText>
          <UI.ContentText>
            {$t({ defaultMessage: 'Zone:' })} {initialValues?.sliceValue}
          </UI.ContentText>
          <UI.ContentText>
            {$t({ defaultMessage: 'Status:' })} {$t(config.statusTrailMsgs[status])}
          </UI.ContentText>
          <UI.ContentText>
            {$t({ defaultMessage: 'Last update:' })}&nbsp;
            {formatter(DateFormatEnum.DateTimeFormat)(initialValues?.updatedAt)}
          </UI.ContentText>
        </UI.Content>
        <UI.Content>
          <UI.Subtitle>
            {$t({ defaultMessage:
                      'Wireless network design involves balancing different priorities:' })}
          </UI.Subtitle>
          <FormattedMessage
            {...config.steps.clientDensity.introduction}
            values={{ ...values }}
          />
          <FormattedMessage
            {...config.steps.clientThroughput.introduction}
            values={{ ...values }}
          />
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
            {$t({ defaultMessage: 'Benefits' })}
          </UI.SideNoteSubtitle>
          <UI.SideNoteContent>
            {$t(config.steps.sideNotes.introduction)}
          </UI.SideNoteContent>
          <UI.SideNoteSubtitle>
            {$t({ defaultMessage: 'Resources:' })}
          </UI.SideNoteSubtitle>
          <UI.SideNoteContent>
            <UI.Link href={config.steps.link.demoLink} target='_blank'>
              <UI.LinkVideoIcon />
              {$t(defineMessage({ defaultMessage: 'RUCKUS AI - AI-Driven RRM Demo' }))}
            </UI.Link>
            <UI.Link href={config.steps.link.guideLink} target='_blank'>
              <UI.LinkDocumentIcon />
              {$t(defineMessage({ defaultMessage: 'RUCKUS AI User Guide' }))}
            </UI.Link>
          </UI.SideNoteContent>
        </UI.SideNote>
      </UI.Wrapper>
    </Col>
  </Row>
}
