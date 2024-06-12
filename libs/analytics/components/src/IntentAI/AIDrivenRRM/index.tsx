
import React from 'react'

import { Row, Col }                  from 'antd'
import { useIntl, FormattedMessage } from 'react-intl'

import { PageHeader, StepsForm, bandwidthMapping, recommendationBandMapping } from '@acx-ui/components'

import { Legend } from '../../Recommendations/RecommendationDetails/Graph/Legend'

import { sampleMapping } from './mapping'
import * as UI           from './styledComponents'

export function IntentAIDrivenRRM () {
  const { $t } = useIntl()
  const code = 'c-crrm-channel5g-auto' // replace with actual code
  const band = recommendationBandMapping[code as keyof typeof recommendationBandMapping]

  const values = {
    p: (text: string) => <UI.Para>{text}</UI.Para>,
    b: (text: string) => <UI.Bold>{text}</UI.Bold>
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'AI-Driven RRM' })}
        subTitle={$t({
          defaultMessage: 'Intent: Throughput vs Client Density | Zone: SPS-Hospitality-BLR' })} // replace with actual data
      />
      <StepsForm
        // onCancel={}
        // onFinish={}
        buttonLabel={{
          submit: 'Apply'
        }}
      >
        <StepsForm.StepForm title='Introduction'>
          <Row gutter={20}>
            <Col span={16}>
              <UI.Wrapper>
                <UI.Title>{$t({ defaultMessage: 'Introduction' })}</UI.Title>
                <UI.Content>
                  <UI.ContentText>
                    {$t({ defaultMessage: 'Intent: ' })}{sampleMapping[code].intent}
                  </UI.ContentText>
                  <UI.ContentText>
                    {$t({ defaultMessage: 'Zone: ' })}{sampleMapping[code].zone}
                  </UI.ContentText>
                  <UI.ContentText>
                    {$t({ defaultMessage: 'Date: ' })}{sampleMapping[code].date}
                  </UI.ContentText>
                </UI.Content>
                <UI.Content>
                  <UI.Subtitle>
                    {$t({ defaultMessage:
                      'Wireless network design involves balancing different priorities:' })}
                  </UI.Subtitle>
                  <FormattedMessage
                    {...sampleMapping[code].maximumThroughput}
                    values={{ ...values }}
                  />
                  <FormattedMessage
                    {...sampleMapping[code].highClientDensity}
                    values={{ ...values }}
                  />
                </UI.Content>
              </UI.Wrapper>
            </Col>
            <Col span={1} />
            <Col span={7}>
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
                      {...sampleMapping[code].sideNotes.introduction}
                      values={{ ...values }}
                    />
                  </UI.SideNoteContent>
                  <UI.SideNoteSubtitle>
                    {$t({ defaultMessage: 'Resources:' })}
                  </UI.SideNoteSubtitle>
                </UI.SideNote>
              </UI.Wrapper>
            </Col>
          </Row>
        </StepsForm.StepForm>

        <StepsForm.StepForm title='Trade-off'>
          <Row gutter={20}>
            <Col span={16}>
              <UI.Wrapper>
                <UI.Title>{$t({ defaultMessage: 'Trade-off' })}</UI.Title>
                <UI.Content>
                  <UI.Subtitle>
                    {$t({ defaultMessage: 'What\'s more important to you for this network?' })}
                  </UI.Subtitle>
                </UI.Content>
              </UI.Wrapper>
            </Col>
            <Col span={1} />
            <Col span={7}>
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
                      {...sampleMapping[code].sideNotes.tradeOff}
                      values={{ ...values }}
                    />
                  </UI.SideNoteContent>
                </UI.SideNote>
              </UI.Wrapper>
            </Col>
          </Row>
        </StepsForm.StepForm>

        <StepsForm.StepForm title='Benefit'>
          <Row gutter={20}>
            <Col span={16}>
              <UI.Wrapper>
                <UI.Title>{$t({ defaultMessage: 'Benefit' })}</UI.Title>
                <UI.Content>
                </UI.Content>
              </UI.Wrapper>
            </Col>
            <Col span={1} />
            <Col span={7}>
              <UI.Wrapper>
                <UI.SideNote>
                  <UI.SideNoteHeader>
                    <UI.SideNoteTitle>
                      {$t({ defaultMessage: 'Side Notes' })}
                    </UI.SideNoteTitle>
                  </UI.SideNoteHeader>
                  <UI.SideNoteContent>
                    <Legend key='crrm-graph-legend' bandwidths={bandwidthMapping[band]}/>
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
