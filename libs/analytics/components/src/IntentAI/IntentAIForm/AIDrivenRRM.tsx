import { Row, Col, Typography, Space } from 'antd'
import { useIntl, defineMessage }      from 'react-intl'

import { useLayoutContext, PageHeader, StepsForm, Descriptions } from '@acx-ui/components'
import { LinkDocumentIcon, LinkVideoIcon }                       from '@acx-ui/icons'

import { mapping, demoLink, guideLink } from './mapping'
import * as UI                          from './styledComponents'

export function AIDrivenRRM () {
  const { $t } = useIntl()
  const breadcrumb = [
    { text: $t({ defaultMessage: 'AI Assurance' }) },
    { text: $t({ defaultMessage: 'AI Analytics' }) },
    {
      text: $t({ defaultMessage: 'IntentAI' }),
      link: '/analytics/intentAI'
    }
  ]
  const { pageHeaderY } = useLayoutContext()

  return (
    <>
      <PageHeader
        breadcrumb={breadcrumb}
        titlePrefix={<UI.AIDrivenRRMIcon />}
        title={$t({ defaultMessage: 'AI-Driven RRM' })}
        subTitle={[
          {
            label: $t({ defaultMessage: 'Intent' }),
            value: [mapping.intent]
          },
          {
            label: $t({ defaultMessage: 'Zone' }),
            value: [mapping.zone]
          }
        ]}
      />
      <StepsForm buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}>

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
              <UI.SideNotes $pageHeaderY={pageHeaderY}>
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
              <UI.SideNotes $pageHeaderY={pageHeaderY}>
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
              <UI.SideNotes $pageHeaderY={pageHeaderY}>
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
    </>
  )
}
