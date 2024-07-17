/* eslint-disable max-len */
import React from 'react'

import { Row, Col, Typography, Space } from 'antd'
import { useIntl, defineMessage }      from 'react-intl'

import { Descriptions, StepsForm, useLayoutContext, useStepFormContext } from '@acx-ui/components'
import { get }                                                           from '@acx-ui/config'
import { DateFormatEnum, formatter }                                     from '@acx-ui/formatter'
import { LinkDocumentIcon, LinkVideoIcon }                               from '@acx-ui/icons'

import { steps, crrmIntent, intentTypeMap, statusTrailMsgs } from '../AIDrivenRRM'
import { states }                                            from '../config'
import { EnhancedRecommendation }                            from '../services'
import * as UI                                               from '../styledComponents'


export function Introduction () {
  const { $t } = useIntl()
  const { initialValues } = useStepFormContext<EnhancedRecommendation>()
  const { pageHeaderY } = useLayoutContext()
  const { status, sliceValue, updatedAt } = initialValues!

  const descriptions = [
    {
      title: crrmIntent.full.title,
      text: crrmIntent.full.content
    },
    {
      title: crrmIntent.partial.title,
      text: crrmIntent.partial.content
    }
  ]
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

  return <Row gutter={20}>
    <Col span={15}>
      <StepsForm.Title children={$t(steps.title.introduction)} />
      <Descriptions noSpace>
        <Descriptions.Item
          label={$t({ defaultMessage: 'Intent' })}
          children={$t(intentTypeMap.aiDrivenRRM.intent)}
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Category' })}
          children={$t(intentTypeMap.aiDrivenRRM.category)}
        />
        <Descriptions.Item
          label={get('IS_MLISA_SA')
            ? $t({ defaultMessage: 'Zone' })
            : $t({ defaultMessage: 'Venue' })
          }
          children={sliceValue}
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Status' })}
          children={$t(statusTrailMsgs[status as keyof typeof states ])}
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
        {
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
          {$t(steps.sideNotes.title)}
        </Typography.Title>
        <StepsForm.Subtitle>
          {$t({ defaultMessage: 'Benefits' })}
        </StepsForm.Subtitle>
        <StepsForm.TextContent>
          <Typography.Paragraph>
            {$t(steps.sideNotes.introduction)}
          </Typography.Paragraph>
        </StepsForm.TextContent>
        <StepsForm.Subtitle>
          {$t({ defaultMessage: 'Resources:' })}
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
}
