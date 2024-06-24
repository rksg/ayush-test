import React, { useState } from 'react'

import { Row, Col, Radio, Space }                   from 'antd'
import { get }                                      from 'lodash'
import { useIntl, FormattedMessage, defineMessage } from 'react-intl'

import { PageHeader, StepsForm, Loader } from '@acx-ui/components'
import { Features, useIsSplitOn }        from '@acx-ui/feature-toggle'
import { useParams }                     from '@acx-ui/react-router-dom'

import { statusTrailMsgs }                                           from './config'
import { mapping, demoLink, guideLink }                              from './mapping'
import { useRecommendationCodeQuery, useRecommendationDetailsQuery } from './services'
import * as UI                                                       from './styledComponents'

export function IntentAIDrivenRRM () {
  const { $t } = useIntl()
  const [ radio, setRadio ] = useState(0)
  const params = useParams()
  const id = get(params, 'id', undefined) as string
  const isCrrmPartialEnabled = [
    useIsSplitOn(Features.RUCKUS_AI_CRRM_PARTIAL),
    useIsSplitOn(Features.CRRM_PARTIAL)
  ].some(Boolean)
  const codeQuery = useRecommendationCodeQuery({ id }, { skip: !Boolean(id) })
  const detailsQuery = useRecommendationDetailsQuery(
    { ...codeQuery.data!, isCrrmPartialEnabled },
    { skip: !Boolean(codeQuery.data?.code) }
  )
  const details = detailsQuery.data!
  const values = {
    p: (text: string) => <UI.Para>{text}</UI.Para>,
    b: (text: string) => <UI.Bold>{text}</UI.Bold>,
    br: () => <br />
  }

  // eslint-disable-next-line max-len
  const calendarText = defineMessage({ defaultMessage: 'This recommendation will be applied at the chosen time whenever there is a need to change the channel plan. Schedule a time during off-hours when the number of WiFi clients is at the minimum.' })

  return (
    <Loader states={[detailsQuery]}>
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
            {$t({ defaultMessage: 'Intent: ' })} {mapping.intent} | {$t({ defaultMessage: 'Zone: ' })} {details?.sliceValue}
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
                    {$t({ defaultMessage: 'Zone:' })} {details?.sliceValue}
                  </UI.ContentText>
                  <UI.ContentText>
                    {$t({ defaultMessage: 'Status:' })} {details?.status}
                    {$t({ defaultMessage: 'Status:' })} {$t(statusTrailMsgs[details?.status])}
                  </UI.ContentText>
                  <UI.ContentText>
                    {$t({ defaultMessage: 'Last update:' })} {details?.updatedAt}
                  </UI.ContentText>
                </UI.Content>
                <UI.Content>
                  <UI.Subtitle>
                    {$t({ defaultMessage:
                      'Wireless network design involves balancing different priorities:' })}
                  </UI.Subtitle>
                  <b>
                    <FormattedMessage
                      {...mapping.clientDensity.title}
                      values={{ ...values }}
                    />
                  </b>
                  <FormattedMessage
                    {...mapping.clientDensity.content}
                    values={{ ...values }}
                  />
                  <b>
                    <FormattedMessage
                      {...mapping.clientThroughput.title}
                      values={{ ...values }}
                    />
                  </b>
                  <FormattedMessage
                    {...mapping.clientThroughput.content}
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
                    {$t({ defaultMessage: 'Benefits' })}
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

        <StepsForm.StepForm title='Intent priority'>
          <Row gutter={20}>
            <Col span={15}>
              <UI.Wrapper>
                <UI.Title>{$t({ defaultMessage: 'Intent priority' })}</UI.Title>
                <UI.Content>
                  <UI.Subtitle>
                    {$t({ defaultMessage: 'What\'s more important to you for this network?' })}
                  </UI.Subtitle>
                </UI.Content>
                <UI.Content>
                  <Radio.Group onChange={(e) => setRadio(e.target.value)} defaultValue={radio}>
                    <Space direction={'vertical'}>
                      <Radio value={0}>
                        <FormattedMessage
                          {...mapping.clientDensity.title}
                          values={{ ...values }}
                        />
                      </Radio>
                      <Radio value={1}>
                        <FormattedMessage
                          {...mapping.clientThroughput.title}
                          values={{ ...values }}
                        />
                      </Radio>
                    </Space>
                  </Radio.Group>
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
                      {...mapping.sideNotes.tradeoff}
                      values={{ ...values }}
                    />
                  </UI.SideNoteContent>
                </UI.SideNote>
              </UI.Wrapper>
            </Col>
          </Row>
        </StepsForm.StepForm>

        <StepsForm.StepForm title='Settings'>
          <Row gutter={20}>
            <Col span={15}>
              <UI.Wrapper>
                <UI.Title>{$t({ defaultMessage: 'Settings' })}</UI.Title>
                <UI.Content>
                  {$t(calendarText)}
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
                  </UI.SideNoteContent>
                </UI.SideNote>
              </UI.Wrapper>
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    </Loader>
  )
}
