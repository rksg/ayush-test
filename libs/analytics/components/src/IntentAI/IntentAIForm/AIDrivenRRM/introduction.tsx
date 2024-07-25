/* eslint-disable max-len */
import React from 'react'

import { ComponentStory }              from '@storybook/react'
import { Row, Col, Typography, Space } from 'antd'
import { scalePow }                    from 'd3'
import ReactECharts                    from 'echarts-for-react'
import { useIntl, defineMessage }      from 'react-intl'

import { Descriptions, Graph, StepsForm, useLayoutContext, useStepFormContext, ProcessedCloudRRMGraph } from '@acx-ui/components'
import { get }                                                                                          from '@acx-ui/config'
import { DateFormatEnum, formatter }                                                                    from '@acx-ui/formatter'
import { LinkDocumentIcon, LinkVideoIcon }                                                              from '@acx-ui/icons'

import { CompareSlider, CompareSliderProps } from '../../../CompareSlider'
import { states }                            from '../config'
import { EnhancedRecommendation }            from '../services'
import * as UI                               from '../styledComponents'

import { steps, crrmIntent, statusTrailMsgs } from '.'

const zoomScale = scalePow()
  .exponent(0.01)
  .domain([3, 10, 20, 30, 63, 125, 250, 375, 500, 750])
  .range([1.75, 0.6, 0.4, 0.35, 0.2, 0.15, 0.11, 0.09, 0.075, 0.06])

export const ComponentOne = () => {
  return (
    <div data-testid='custom-component-one'
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        justifyContent: 'start'
      }}>
      <img
        // eslint-disable-next-line max-len
        src='https://raw.githubusercontent.com/nerdyman/stuff/main/libs/react-compare-slider/demo-images/seattle-space-needle-1.jpg'
        alt='ImageOne'
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  )
}

export const ComponentTwo = () => {
  return (
    <div data-testid='custom-component-two'
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        justifyContent: 'end'
      }}>
      <img
        // eslint-disable-next-line max-len
        src='https://raw.githubusercontent.com/nerdyman/stuff/main/libs/react-compare-slider/demo-images/seattle-space-needle-2.jpg'
        alt='ImageTwo'
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  )
}

const GraphBefore = (
  { crrmData, setUrlBefore }:
  { crrmData: ProcessedCloudRRMGraph[], setUrlBefore: (url: string) => void }) => {
  const connectChart = (chart: ReactECharts | null) => {
    if (chart) {
      const instance = chart.getEchartsInstance()
      instance.group = 'graphGroup'
      const url = instance.getDataURL()
      setUrlBefore(url)
    }
  }
  return (
    <div data-testid='custom-component-one'
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        justifyContent: 'start'
      }}>
      {crrmData[0] && <Graph
        chartRef={connectChart}
        title='Current'
        data={crrmData[0]}
        zoomScale={zoomScale}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: 1100
        }}
      />}
    </div>
  )
}

const GraphAfter = (
  { crrmData, setUrlAfter }:
  { crrmData: ProcessedCloudRRMGraph[], setUrlAfter: (url: string) => void }) => {
  const connectChart = (chart: ReactECharts | null) => {
    if (chart) {
      const instance = chart.getEchartsInstance()
      instance.group = 'graphGroup'
      const url = instance.getDataURL()
      setUrlAfter(url)
    }
  }
  return (
    <div data-testid='custom-component-two'
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        justifyContent: 'end'
      }}>
      {crrmData[1] && <Graph
        chartRef={connectChart}
        title='Forecast'
        data={crrmData[1]}
        zoomScale={zoomScale}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: 1100
        }}
      />}
    </div>
  )
}

const Template: ComponentStory<typeof CompareSlider> = (props: CompareSliderProps) => {
  return (
    <CompareSlider {...props} />
  )
}

export const TwoComponents = Template.bind({})
TwoComponents.args = {
  style: {
    width: '270px',
    height: '178px'
  },
  itemOne: <ComponentOne />,
  itemTwo: <ComponentTwo />,
  disabled: false,
  portrait: false,
  boundsPadding: 0,
  position: 50,
  changePositionOnHover: false,
  keyboardIncrement: 0,
  onlyHandleDraggable: false
}

export function Introduction (
  { urlBefore, urlAfter, setUrlBefore, setUrlAfter, crrmData }:
  { urlBefore: string, urlAfter: string, setUrlBefore: (url: string) => void, setUrlAfter: (url: string) => void, crrmData: ProcessedCloudRRMGraph[] }) {
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

  const sideNotes = {
    title: defineMessage({ defaultMessage: 'Side Notes' }),
    subtitle: defineMessage({ defaultMessage: 'Benefits' }),
    text: defineMessage({ defaultMessage: `Low interference fosters improved throughput, lower 
      latency, better signal quality, stable connections, enhanced user experience, longer battery 
      life, efficient spectrum utilization, optimized channel usage, and reduced congestion, leading 
      to higher data rates, higher SNR, consistent performance, and balanced network load.` })
  }

  const sliderProps = {
    style: {
      width: '270px',
      height: '178px'
    },
    itemOne: <GraphBefore crrmData={crrmData} setUrlBefore={setUrlBefore} />,
    itemTwo: <GraphAfter crrmData={crrmData} setUrlAfter={setUrlAfter} />
  }

  const imageBefore = <img src={urlBefore} alt='before'/>
  const imageAfter = <img src={urlAfter} alt='after'/>

  const newSliderProps = {
    style: {
      width: '270px',
      height: '178px'
    },
    itemOne: imageBefore,
    itemTwo: imageAfter,
    disabled: false,
    portrait: false,
    boundsPadding: 0,
    position: 50,
    changePositionOnHover: false,
    keyboardIncrement: 0,
    onlyHandleDraggable: false
  }

  return <Row gutter={20}>
    <Col span={15}>
      <StepsForm.Title children={$t(steps.title.introduction)} />
      <Descriptions noSpace>
        <Descriptions.Item
          label={$t({ defaultMessage: 'Intent' })}
          children={$t(steps.intent)}
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Category' })}
          children={$t(steps.category)}
        />
        <Descriptions.Item
          label={get('IS_MLISA_SA')
            ? $t({ defaultMessage: 'Zone' })
            : $t({ defaultMessage: '<VenueSingular></VenueSingular>' })
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
      <StepsForm.TextContent>
        <div>twocomponents</div>
        <TwoComponents />
        <div>compareslider</div>
        <CompareSlider props={sliderProps}/>
        <div>newcompareslider</div>
        <CompareSlider props={newSliderProps} />
        <div>img</div>
        {imageBefore}
        {imageAfter}
        <div>componenteonetwo</div>
        {/* hide the graph, only rendering the graph image for the slider */}
        <div hidden>
          <GraphBefore crrmData={crrmData} setUrlBefore={setUrlBefore} />
          <GraphAfter crrmData={crrmData} setUrlAfter={setUrlAfter} />
        </div>
      </StepsForm.TextContent>
    </Col>
    <Col span={7} offset={2}>
      <UI.SideNotes $pageHeaderY={pageHeaderY}>
        <Typography.Title level={4}>
          {$t(sideNotes.title)}
        </Typography.Title>
        <StepsForm.Subtitle>
          {$t(sideNotes.subtitle)}
        </StepsForm.Subtitle>
        <StepsForm.TextContent>
          <Typography.Paragraph>
            {$t(sideNotes.text)}
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
