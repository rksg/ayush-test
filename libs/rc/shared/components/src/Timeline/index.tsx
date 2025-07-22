import React, { useState } from 'react'

import { Timeline as AntTimeline, Descriptions } from 'antd'
import { defineMessage, useIntl }                from 'react-intl'

import { StatusIcon }                        from '@acx-ui/components'
import { DateFormatEnum, formatter }         from '@acx-ui/formatter'
import { PlusSquareSolid, MinusSquareSolid } from '@acx-ui/icons'
import { TimelineStatus, StatusIconProps }   from '@acx-ui/types'


import { ActivityApCompatibilityTable } from '../ApCompatibility'

import {
  ItemWrapper,
  ContentWrapper,
  DescriptionWrapper,
  StatusWrapper,
  ExpanderWrapper,
  WithExpanderWrapper,
  Wrapper,
  Step
} from './styledComponents'

const statusMap = {
  SUCCESS: defineMessage({ defaultMessage: 'Success' }),
  PENDING: defineMessage({ defaultMessage: 'Pending' }),
  INPROGRESS: defineMessage({ defaultMessage: 'In progress' }),
  FAIL: defineMessage({ defaultMessage: 'Failed' })
}

const StatusComp = (props: StatusIconProps) => {
  const { $t } = useIntl()
  return <StatusWrapper status={props.status}>
    <StatusIcon status={props.status}/>
    {$t(statusMap[props.status])}
    <DescriptionWrapper>
      {props.description ?? ''}
    </DescriptionWrapper>
  </StatusWrapper>
}

export interface TimelineItem {
  id: string,
  status: TimelineStatus,
  startDatetime: string,
  endDatetime: string,
  description: string,
  children?: React.ReactElement
  error?: string
  type?: TimelineType,
  contentChildren?: React.ReactElement
}

interface TimelineProps {
  requestId: string
  items: TimelineItem[]
  status: TimelineStatus
}

enum TimelineType {
  PREVIOUS = 'previous',
  CURRENT = 'current',
  FUTURE = 'future'
}

export const Timeline = (props: TimelineProps) => {
  const { $t } = useIntl()
  const [ expand, setExpand ] = useState<Record<string, boolean>>({})
  const [ statusDescription, setStatusDescription ] = useState<string>('')

  const currentStep = props.items.findIndex(item => !item.endDatetime)
  const modifiedProps = props.items.map((item, index) => {
    if(currentStep && (index < currentStep || currentStep === -1)){
      return ({ ...item, type: TimelineType.PREVIOUS })
    }
    if((currentStep && index === currentStep) || currentStep === 0){
      return ({ ...item, type: TimelineType.CURRENT })
    }
    return ({ ...item, type: TimelineType.FUTURE })
  })

  const StartDot = (item: TimelineItem, index: number) => (
    <AntTimeline.Item
      key={`timeline-start-${index}`}
      dot={<Step $state={item.type!} />}>
      { item.type === TimelineType.FUTURE
        ? '--'
        : formatter(DateFormatEnum.DateTimeFormatWithSeconds)(item.startDatetime)
      }
    </AntTimeline.Item>
  )

  const EndDot = (item: TimelineItem, index: number) => {
    const isShowCheckApCompatibilities = item.status === 'SUCCESS'
      && item.id === 'CheckApCompatibilities'
    return (
      <AntTimeline.Item
        key={`timeline-end-${index}`}
        dot={<Step $state={item.type === TimelineType.PREVIOUS
          ? TimelineType.PREVIOUS : TimelineType.FUTURE} />}>
        <ItemWrapper>
          { item.type === TimelineType.PREVIOUS
            ? formatter(DateFormatEnum.DateTimeFormatWithSeconds)(item.endDatetime)
            : '--'
          }
          <ContentWrapper>
            <WithExpanderWrapper>
              <div>
                <StatusComp
                  status={item.status}
                  description={isShowCheckApCompatibilities? statusDescription:''}/>
                <DescriptionWrapper
                >{item.description}</DescriptionWrapper>
                { expand[`${item.startDatetime}-${item.endDatetime}`] ? item.children : null}
                {isShowCheckApCompatibilities ? (
                  <ActivityApCompatibilityTable
                    requestId={props.requestId}
                    updateActivityDesc={setStatusDescription} />)
                  : null}
              </div>
              <ExpanderWrapper onClick={()=> {
                const key = `${item.startDatetime}-${item.endDatetime}`
                setExpand({ ...expand, [key]: !expand[key] })
              }}>
                {item.children
                  ? expand[`${item.startDatetime}-${item.endDatetime}`]
                    ? <MinusSquareSolid/> : <PlusSquareSolid/>
                  : null}
              </ExpanderWrapper>
            </WithExpanderWrapper>
          </ContentWrapper>
        </ItemWrapper>
      </AntTimeline.Item>
    )}

  return <Wrapper>
    <Descriptions>
      <Descriptions.Item label={$t({ defaultMessage: 'Current Status' })}>
        {$t(statusMap[props.status])}
      </Descriptions.Item>
    </Descriptions>
    <AntTimeline>
      {modifiedProps.length > 1
        ? modifiedProps
          .filter(item => !(item.status === 'SUCCESS' &&
              /Update Switch .* Port Status/.test(item.description)))
          .map((item, index) => [
            StartDot(item, index),
            EndDot(item, index)
          ])
        : modifiedProps.map((item, index) => [
          StartDot(item, index),
          EndDot(item, index)
        ])}
    </AntTimeline>
  </Wrapper>
}