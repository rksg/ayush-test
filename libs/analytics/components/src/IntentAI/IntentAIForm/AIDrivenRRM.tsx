import React from 'react'

import { Row, Col, Typography, Space } from 'antd'
import { useIntl, defineMessage }      from 'react-intl'

import { PageHeader, StepsForm, Descriptions, Loader } from '@acx-ui/components'
import { Features, useIsSplitOn }                      from '@acx-ui/feature-toggle'
import { LinkDocumentIcon, LinkVideoIcon }             from '@acx-ui/icons'
import { useParams }                                   from '@acx-ui/react-router-dom'

import * as config                                                         from './config'
import { Introduction }                                                    from './Form/introduction'
import { Priority }                                                        from './Form/priority'
import { Settings }                                                        from './Form/settings'
import { Summary }                                                         from './Form/summary'
import { useRecommendationCodeQuery, useConfigRecommendationDetailsQuery } from './services'
import * as UI                                                             from './styledComponents'

export function AIDrivenRRM () {
  const { $t } = useIntl()
  const params = useParams()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [ _, ...rest ] = params.intentId?.split('-') || []
  const id = rest.join('-')

  const isCrrmPartialEnabled = [
    useIsSplitOn(Features.RUCKUS_AI_CRRM_PARTIAL),
    useIsSplitOn(Features.CRRM_PARTIAL)
  ].some(Boolean)
  const codeQuery = useRecommendationCodeQuery({ id }, { skip: !Boolean(id) })
  const detailsQuery = useConfigRecommendationDetailsQuery(
    { ...codeQuery.data!, isCrrmPartialEnabled },
    { skip: !Boolean(codeQuery.data?.code) }
  )
  const details = detailsQuery.data!
  const breadcrumb = [
    { text: $t({ defaultMessage: 'AI Assurance' }) },
    { text: $t({ defaultMessage: 'AI Analytics' }) },
    {
      text: $t({ defaultMessage: 'IntentAI' }),
      link: '/analytics/intentAI'
    }
  ]

  return (
    <Loader states={[codeQuery, detailsQuery]}>
      <PageHeader
        breadcrumb={breadcrumb}
        titlePrefix={<UI.AIDrivenRRMIcon />}
        title={$t({ defaultMessage: 'AI-Driven RRM' })}
        subTitle={[
          {
            label: $t({ defaultMessage: 'Intent' }),
            // value: $t([config.intentTypeMap[
            //   details?.intentType! as keyof typeof config.intentTypeMap]
            // ] as MessageDescriptor) as unknown as (string | number)[]
            value: [details?.intentType!]
          },
          {
            label: $t({ defaultMessage: 'Zone' }),
            value: [details?.sliceValue]
          }
        ]}
      />
      <StepsForm
        buttonLabel={{
          submit: 'Apply'
        }}
        initialValues={detailsQuery?.data!}
      >
        <StepsForm.StepForm
          title={$t(config.steps.title.introduction)}
          children={<Introduction />}
        />
        <StepsForm.StepForm
          title={$t(config.steps.title.priority)}
          children={<Priority />}
        />
        <StepsForm.StepForm
          title={$t(config.steps.title.settings)}
          children={<Settings />}
        />
        <StepsForm.StepForm
          title={$t(config.steps.title.summary)}
          children={<Summary />}
        />
        <StepsForm.StepForm title={$t({ defaultMessage: 'Introduction' })}>
          <Row gutter={20}>
            <Col span={15}>
              <StepsForm.Title children={$t({ defaultMessage: 'Introduction' })} />
              <Descriptions noSpace>
                <Descriptions.Item
                  label={$t({ defaultMessage: 'Intent' })}
                  children={<b>{mapping.intent}</b>}
                />
                <Descriptions.Item
                  label={$t({ defaultMessage: 'Category' })}
                  children={mapping.category}
                />
                <Descriptions.Item
                  label={$t({ defaultMessage: 'Zone' })}
                  children={mapping.zone}
                />
                <Descriptions.Item
                  label={$t({ defaultMessage: 'Status' })}
                  children={mapping.status}
                />
                <Descriptions.Item
                  label={$t({ defaultMessage: 'Last update' })}
                  children={mapping.lastUpdate}
                />
              </Descriptions>
              <StepsForm.Subtitle>
                {$t({ defaultMessage:
                  'Network Intent plays a crucial role in wireless network design' })}
              </StepsForm.Subtitle>
              <StepsForm.TextContent>
                <Typography.Paragraph>
                  <b>{$t({ defaultMessage: 'High number of clients in a dense network:' })}</b> <span>{$t({ defaultMessage:
                    'High client density network requires low interfering channels which fosters improved throughput, lower latency, better signal quality, stable connections, enhanced user experience, longer battery life, efficient spectrum utilization, optimized channel usage, and reduced congestion, leading to higher data rates, higher SNR, consistent performance, and balanced network load.' })}</span>
                </Typography.Paragraph>
                <Typography.Paragraph>
                  <b>{$t({ defaultMessage: 'High client throughput in sparse network:' })}</b> <span>{$t({ defaultMessage:
                    'In sparse networks with high client throughput, moderate interference is manageable due to optimized resource allocation, minimal competition for bandwidth, and strong signal strength. This allows for stable connections and satisfactory performance, outweighing drawbacks of interference.' })}</span>
                </Typography.Paragraph>
              </StepsForm.TextContent>
            </Col>
            <Col span={7} offset={2}>
              <UI.SideNotes>
                <Typography.Title level={4}>
                  {$t({ defaultMessage: 'Side Notes' })}
                </Typography.Title>
                <StepsForm.Subtitle>
                  {$t({ defaultMessage: 'Benefits' })}
                </StepsForm.Subtitle>
                <StepsForm.TextContent>
                  <Typography.Paragraph>
                    {$t({ defaultMessage: 'Low interference fosters improved throughput, lower latency, better signal quality, stable connections, enhanced user experience, longer battery life, efficient spectrum utilization, optimized channel usage, and reduced congestion, leading to higher data rates, higher SNR, consistent performance, and balanced network load.' })}
                  </Typography.Paragraph>
                </StepsForm.TextContent>
                <StepsForm.Subtitle>
                  {$t({ defaultMessage: 'Resources:' })}
                </StepsForm.Subtitle>
                <StepsForm.TextContent>
                  <Typography.Paragraph>
                    <a href={demoLink} target='_blank' rel='noreferrer'>
                      <Space>
                        <LinkVideoIcon />
                        {$t(defineMessage({ defaultMessage: 'RUCKUS AI - AI-Driven RRM Demo' }))}
                      </Space>
                    </a>
                    <a href={guideLink} target='_blank' rel='noreferrer'>
                      <Space>
                        <LinkDocumentIcon />
                        {$t(defineMessage({ defaultMessage: 'RUCKUS AI User Guide' }))}
                      </Space>
                    </a>
                  </Typography.Paragraph>
                </StepsForm.TextContent>
              </UI.SideNotes>
            </Col>
          </Row>
        </StepsForm.StepForm>

        <StepsForm.StepForm title='Choose priority'>
          <Row gutter={20}>
            <Col span={15}>
              <StepsForm.Title children={$t({ defaultMessage: 'Choose priority' })} />
              <StepsForm.Subtitle>
                {$t(
                  { defaultMessage: 'What is your primary network intent for Zone {zone}' },
                  { zone: mapping.zone }
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
                    {$t({ defaultMessage: 'In the quest for minimizing interference between access points (APs), AI algorithms may opt to narrow channel widths. While this can enhance spectral efficiency and alleviate congestion, it also heightens vulnerability to noise, potentially reducing throughput. Narrow channels limit data capacity, which could lower overall throughput.' })}
                  </Typography.Paragraph>
                </StepsForm.TextContent>
              </UI.SideNotes>
            </Col>
          </Row>
        </StepsForm.StepForm>

        <StepsForm.StepForm title='Summary'>
          <Row gutter={20}>
            <Col span={15}>
              <StepsForm.Title children={$t({ defaultMessage: 'Summary' })} />
            </Col>
            <Col span={7} offset={2}>
              <UI.SideNotes>
                <Typography.Title level={4}>
                  {$t({ defaultMessage: 'Side Notes' })}
                </Typography.Title>
                <StepsForm.Subtitle>
                  {$t({ defaultMessage: 'High number of clients in a dense network' })}
                </StepsForm.Subtitle>
                <StepsForm.TextContent>
                  <Typography.Paragraph>
                    {$t({ defaultMessage: 'High client density network requires low interfering channels which fosters improved throughput, lower latency, better signal quality, stable connections, enhanced user experience, longer battery life, efficient spectrum utilization, optimized channel usage, and reduced congestion, leading to higher data rates, higher SNR, consistent performance, and balanced network load.' })}
                  </Typography.Paragraph>
                </StepsForm.TextContent>
              </UI.SideNotes>
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    </Loader>
  )
}
