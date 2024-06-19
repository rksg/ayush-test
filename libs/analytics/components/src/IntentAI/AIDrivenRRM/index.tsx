import React from 'react'

import { Row, Col }                                 from 'antd'
import { useIntl, FormattedMessage, defineMessage } from 'react-intl'

import { PageHeader, StepsForm } from '@acx-ui/components'

import { mapping, demoLink, guideLink } from './mapping'
import * as UI                          from './styledComponents'

export function IntentAIDrivenRRM () {
  const { $t } = useIntl()
  const values = {
    p: (text: string) => <UI.Para>{text}</UI.Para>,
    b: (text: string) => <UI.Bold>{text}</UI.Bold>,
    br: () => <br />
  }

  return (
    <>
      <PageHeader
        title={<UI.Header>
          <UI.AIDrivenRRMIcon />
          <UI.HeaderTitle>
            {$t({ defaultMessage: 'AI-Driven RRM' })}
          </UI.HeaderTitle>
        </UI.Header>}
        subTitle={
          <>
            {/* eslint-disable-next-line max-len */}
            {$t({ defaultMessage: 'Intent: ' })} {mapping.intent} | {$t({ defaultMessage: 'Zone: ' })} {mapping.zone}
          </>
        }
      />
      <StepsForm
        buttonLabel={{
          submit: 'Apply'
        }}
      >
        <StepsForm.StepForm title='Introduction'>
          <Row gutter={20}>
            <Col span={15}>
              <UI.Wrapper>
                <UI.Title>{$t({ defaultMessage: 'Introduction' })}</UI.Title>
                <UI.Content>
                  <UI.ContentText>
                    <span>
                      {$t({ defaultMessage: 'Intent:' })} <b>{mapping.intent}</b>
                    </span>
                  </UI.ContentText>
                  <UI.ContentText>
                    {$t({ defaultMessage: 'Category:' })} {mapping.category}
                  </UI.ContentText>
                  <UI.ContentText>
                    {$t({ defaultMessage: 'Zone:' })} {mapping.zone}
                  </UI.ContentText>
                  <UI.ContentText>
                    {$t({ defaultMessage: 'Status:' })} {mapping.status}
                  </UI.ContentText>
                  <UI.ContentText>
                    {$t({ defaultMessage: 'Last update:' })} {mapping.lastUpdate}
                  </UI.ContentText>
                </UI.Content>
                <UI.Content>
                  <UI.Subtitle>
                    {$t({ defaultMessage:
                      'Wireless network design involves balancing different priorities:' })}
                  </UI.Subtitle>
                  <FormattedMessage
                    {...mapping.clientDensity.combined}
                    values={{ ...values }}
                  />
                  <FormattedMessage
                    {...mapping.clientThroughput.combined}
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
                      {$t({ defaultMessage: 'Side Notes' })}
                    </UI.SideNoteTitle>
                  </UI.SideNoteHeader>
                  <UI.SideNoteSubtitle>
                    {$t({ defaultMessage: 'Why the recommendation?' })}
                  </UI.SideNoteSubtitle>
                  <UI.SideNoteContent>
                    <FormattedMessage
                      {...mapping.sideNotes.introduction}
                      values={{ ...values }}
                    />
                  </UI.SideNoteContent>
                  <UI.SideNoteSubtitle>
                    {$t({ defaultMessage: 'Resources:' })}
                  </UI.SideNoteSubtitle>
                  <UI.SideNoteContent>
                    <UI.Link href={demoLink} target='_blank'>
                      <UI.LinkVideoIcon />
                      {$t(defineMessage({ defaultMessage: 'RUCKUS AI - AI-Driven RRM Demo' }))}
                    </UI.Link>
                    <UI.Link href={guideLink} target='_blank'>
                      <UI.LinkDocumentIcon />
                      {$t(defineMessage({ defaultMessage: 'RUCKUS AI User Guide' }))}
                    </UI.Link>
                  </UI.SideNoteContent>
                </UI.SideNote>
              </UI.Wrapper>
            </Col>
          </Row>
        </StepsForm.StepForm>

        <StepsForm.StepForm title='Choose priority'>
          <Row gutter={20}>
            <Col span={15}>
              <UI.Wrapper>
                <UI.Title>{$t({ defaultMessage: 'Choose priority' })}</UI.Title>
                <UI.Content>
                  <UI.Subtitle>
                    {$t({ defaultMessage: 'What\'s more important to you for this network?' })}
                  </UI.Subtitle>
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
                    {$t({ defaultMessage: 'Potential trade-off?' })}
                  </UI.SideNoteSubtitle>
                  <UI.SideNoteContent>
                    <FormattedMessage
                      {...mapping.sideNotes.tradeOff}
                      values={{ ...values }}
                    />
                  </UI.SideNoteContent>
                </UI.SideNote>
              </UI.Wrapper>
            </Col>
          </Row>
        </StepsForm.StepForm>

        <StepsForm.StepForm title='Summary'>
          <Row gutter={20}>
            <Col span={15}>
              <UI.Wrapper>
                <UI.Title>{$t({ defaultMessage: 'Summary' })}</UI.Title>
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
                  <UI.SideNoteSubtitle>
                    <FormattedMessage
                      {...mapping.clientDensity.title}
                      values={{ ...values }}
                    />
                  </UI.SideNoteSubtitle>
                  <UI.SideNoteContent>
                    <FormattedMessage
                      {...mapping.clientDensity.content}
                      values={{ ...values }}
                    />
                  </UI.SideNoteContent>
                </UI.SideNote>
              </UI.Wrapper>
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
