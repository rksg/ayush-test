import React from 'react'

import { Row, Col, Typography, Space }              from 'antd'
import { useIntl, FormattedMessage, defineMessage } from 'react-intl'

import { Descriptions, StepsForm, useStepFormContext } from '@acx-ui/components'
import { DateFormatEnum, formatter }                   from '@acx-ui/formatter'
import { LinkDocumentIcon, LinkVideoIcon }             from '@acx-ui/icons'

import * as config                from '../config'
import { states }                 from '../config'
import { EnhancedRecommendation } from '../services'
import * as UI                    from '../styledComponents'


export function Introduction () {
  const { $t } = useIntl()
  const { initialValues } = useStepFormContext<EnhancedRecommendation>()
  const { status, sliceValue, updatedAt } = initialValues!

  const values = {
    p: (text: string) => <p>{text}</p>,
    b: (text: string) => <b>{text}</b>
  }

  return <Row gutter={20}>
    <Col span={15}>
      <StepsForm.Title children={$t(config.steps.title.introduction)} />
      <Descriptions noSpace>
        <Descriptions.Item
          label={$t({ defaultMessage: 'Intent' })}
          children={$t(config.intentTypeMap.aiDrivenRRM.intent)}
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Category' })}
          children={$t(config.intentTypeMap.aiDrivenRRM.category)}
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Zone' })}
          children={sliceValue}
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Status' })}
          children={$t(config.statusTrailMsgs[status as keyof typeof states ])}
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Last update' })}
          children={formatter(DateFormatEnum.DateTimeFormat)(updatedAt)}
        />
      </Descriptions>
      <StepsForm.Subtitle>
        {$t({ defaultMessage: 'Network Intent plays a crucial role in wireless network design' })}
      </StepsForm.Subtitle>
      <StepsForm.TextContent>
        <FormattedMessage
          {...config.steps.clientDensity.introduction}
          values={{ ...values }}
        />
        <FormattedMessage
          {...config.steps.clientThroughput.introduction}
          values={{ ...values }}
        />
        <Typography.Paragraph>
          <b>{$t({ defaultMessage: 'High number of clients in a dense network:' })}</b>
          {/* eslint-disable-next-line max-len */}
          <span>{$t({ defaultMessage: 'High client density network requires low interfering channels which fosters improved throughput, lower latency, better signal quality, stable connections, enhanced user experience, longer battery life, efficient spectrum utilization, optimized channel usage, and reduced congestion, leading to higher data rates, higher SNR, consistent performance, and balanced network load.' })}</span>
        </Typography.Paragraph>
        <Typography.Paragraph>
          <b>{$t({ defaultMessage: 'High client throughput in sparse network:' })}</b>
          {/* eslint-disable-next-line max-len */}
          <span>{$t({ defaultMessage: 'In sparse networks with high client throughput, moderate interference is manageable due to optimized resource allocation, minimal competition for bandwidth, and strong signal strength. This allows for stable connections and satisfactory performance, outweighing drawbacks of interference.' })}</span>
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
            {$t(config.steps.sideNotes.introduction)}
          </Typography.Paragraph>
        </StepsForm.TextContent>
        <StepsForm.Subtitle>
          {$t({ defaultMessage: 'Resources:' })}
        </StepsForm.Subtitle>
        <StepsForm.TextContent>
          <Typography.Paragraph>
            <a href={config.steps.link.demoLink} target='_blank' rel='noreferrer'>
              <Space>
                <LinkVideoIcon />
                {$t(defineMessage({ defaultMessage: 'RUCKUS AI - AI-Driven RRM Demo' }))}
              </Space>
            </a>
            <a href={config.steps.link.guideLink} target='_blank' rel='noreferrer'>
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
}
