import { Row, Col, Form, Typography, Space } from 'antd'
import { useIntl, defineMessage }            from 'react-intl'

import {
  useLayoutContext,
  PageHeader,
  StepsForm,
  Descriptions
} from '@acx-ui/components'
import { get }                             from '@acx-ui/config'
import { LinkDocumentIcon, LinkVideoIcon } from '@acx-ui/icons'

import { TradeOff } from '../../TradeOff'

import { mapping } from './mapping'
import * as UI     from './styledComponents'

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

  /* eslint-disable max-len */
  const descriptions = [
    {
      title: defineMessage({ defaultMessage: 'High number of clients in a dense network' }),
      text: defineMessage({ defaultMessage: 'High client density network requires low interfering channels which fosters improved throughput, lower latency, better signal quality, stable connections, enhanced user experience, longer battery life, efficient spectrum utilization, optimized channel usage, and reduced congestion, leading to higher data rates, higher SNR, consistent performance, and balanced network load.' })
    },
    {
      title: defineMessage({ defaultMessage: 'High client throughput in sparse network' }),
      text: defineMessage({ defaultMessage: 'In sparse networks with high client throughput, moderate interference is manageable due to optimized resource allocation, minimal competition for bandwidth, and strong signal strength. This allows for stable connections and satisfactory performance, outweighing drawbacks of interference.' })
    }
  ]
  const priority = [
    {
      key: 'full',
      value: 'full' as const,
      children: $t({ defaultMessage: 'High number of clients in a dense network (Default)' }),
      columns: [
        $t({ defaultMessage: 'Maximize client density - simultaneous connected clients (Default)' }),
        $t({ defaultMessage: 'This is AI-Driven RRM Full Optimization mode, where IntentAI will consider only the channels configured on the Controller, assess the neighbor AP radio channels for each AP radio and build a channel plan for each radio to minimize the interference. While building the channel plan, IntentAI may optionally change the AP Radio Channel Width and Transmit Power to minimize the channel interference.' })
      ]
    },
    {
      key: 'partial',
      value: 'partial' as const,
      children: 'High client throughput in sparse network',
      columns: [
        $t({ defaultMessage: 'High client throughput in sparse network' }),
        $t({ defaultMessage: 'This is AI-Driven RRM Partial Optimization mode, where IntentAI will consider only the channels configured on the Controller, assess the neighbor AP channels for each AP radio and build a channel plan for each AP radio to minimize interference. While building the channel plan, IntentAI will NOT change the AP Radio Channel Width and Transmit Power.' })
      ]
    }
  ]
  const benefits = $t({ defaultMessage: 'Low interference fosters improved throughput, lower latency, better signal quality, stable connections, enhanced user experience, longer battery life, efficient spectrum utilization, optimized channel usage, and reduced congestion, leading to higher data rates, higher SNR, consistent performance, and balanced network load.' })
  const resources = [
    {
      icon: <LinkVideoIcon />,
      label: defineMessage({ defaultMessage: 'RUCKUS AI - AI-Driven RRM Demo' }),
      link: 'https://www.youtube.com/playlist?list=PLySwoo7u9-KJeAI4VY_2ha4r9tjnqE3Zi'
    },
    {
      icon: <LinkDocumentIcon />,
      label: defineMessage({ defaultMessage: 'RUCKUS AI User Guide' }),
      link: 'https://docs.commscope.com/bundle/ruckusai-userguide/page/GUID-5D18D735-6D9A-4847-9C6F-8F5091F9B171.html'
    }
  ]
  const tradeOff = defineMessage({ defaultMessage: 'In the quest for minimizing interference between access points (APs), AI algorithms may opt to narrow channel widths. While this can enhance spectral efficiency and alleviate congestion, it also heightens vulnerability to noise, potentially reducing throughput. Narrow channels limit data capacity, which could lower overall throughput.' })
  /* eslint-enable max-len */

  const { pageHeaderY } = useLayoutContext()
  const choose = get('IS_MLISA_SA')
    ? defineMessage({ defaultMessage: 'What is your primary network intent for Zone: {zone}' })
    : defineMessage({ defaultMessage: 'What is your primary network intent for Venue: {zone}' })

  // TODO:
  // state below should be from the RRM record
  const initialValues = {
    intentPriority: 'full' as typeof priority[number]['value']
  }

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
            label: get('IS_MLISA_SA')
              ? $t({ defaultMessage: 'Zone' })
              : $t({ defaultMessage: 'Venue' }),
            value: [mapping.zone]
          }
        ]}
      />
      <StepsForm {... { initialValues }} buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}>
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
                  label={get('IS_MLISA_SA')
                    ? $t({ defaultMessage: 'Zone' })
                    : $t({ defaultMessage: 'Venue' })
                  }
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
              <StepsForm.TextContent>{
                descriptions.map((item, index) => (
                  <Typography.Paragraph key={`description-${index}`}>
                    <b>{$t(item.title)}:</b> <span>{$t(item.text)}</span>
                  </Typography.Paragraph>
                ))
              }
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
                    {benefits}
                  </Typography.Paragraph>
                </StepsForm.TextContent>
                <StepsForm.Subtitle>
                  {$t({ defaultMessage: 'Resources' })}
                </StepsForm.Subtitle>
                <StepsForm.TextContent>
                  <Typography.Paragraph>{
                    resources.map((item, index) => (<a
                      href={item.link}
                      target='_blank'
                      rel='noreferrer'
                      key={`resources-${index}`}
                    ><Space>{item.icon}{$t(item.label)}</Space></a>))
                  }</Typography.Paragraph>
                </StepsForm.TextContent>
              </UI.SideNotes>
            </Col>
          </Row>
        </StepsForm.StepForm>

        <StepsForm.StepForm title='Intent Priority'>
          <Row gutter={20}>
            <Col span={15}>
              <StepsForm.Title children={$t({ defaultMessage: 'Intent Priority' })} />
              <StepsForm.Subtitle>
                {$t(choose, { zone: mapping.zone })}
              </StepsForm.Subtitle>
              <Form.Item name='intentPriority'>
                <TradeOff
                  radios={priority}
                  headers={[
                    $t({ defaultMessage: 'Intent Priority' }),
                    $t({ defaultMessage: 'IntentAI Scope' })
                  ]} />
              </Form.Item>
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
                    {$t(tradeOff)}
                  </Typography.Paragraph>
                </StepsForm.TextContent>
              </UI.SideNotes>
            </Col>
          </Row>
        </StepsForm.StepForm>

        <StepsForm.StepForm title='Settings'>
          <Row gutter={20}>
            <Col span={15}>
              <StepsForm.Title children={$t({ defaultMessage: 'Settings' })} />
              <StepsForm.TextContent>
                <Typography.Paragraph>{
                  // eslint-disable-next-line max-len
                  $t({ defaultMessage: 'This recommendation will be applied at the chosen time whenever there is a need to change the channel plan. Schedule a time during off-hours when the number of WiFi clients is at the minimum.' })
                }</Typography.Paragraph>
              </StepsForm.TextContent>
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
                  {$t(descriptions[0].title)}
                </StepsForm.Subtitle>
                <StepsForm.TextContent>
                  <Typography.Paragraph>
                    {$t(descriptions[0].text)}
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
