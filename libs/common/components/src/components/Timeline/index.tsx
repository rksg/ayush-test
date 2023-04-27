import React, { useState } from 'react'

import { Timeline as AntTimeline, Descriptions } from 'antd'
import { defineMessage, useIntl }                from 'react-intl'

import { DateFormatEnum, formatter }         from '@acx-ui/formatter'
import { PlusSquareSolid, MinusSquareSolid } from '@acx-ui/icons'
import { TimelineStatus }                    from '@acx-ui/types'

import {
  ItemWrapper,
  ContentWrapper,
  DescriptionWrapper,
  StatusWrapper,
  ExpanderWrapper,
  WithExpanderWrapper,
  Wrapper,
  Step,
  SuccessIcon,
  FailIcon,
  PendingsIcon,
  InProgressIcon
} from './styledComponents'

interface StatusIconProps { status: TimelineStatus}

export const StatusIcon = (props: StatusIconProps) => {
  switch(props.status) {
    case 'SUCCESS':
      return <SuccessIcon />
    case 'PENDING':
      return <PendingsIcon />
    case 'INPROGRESS':
      return <InProgressIcon />
    case 'FAIL':
      return <FailIcon />
  }
}

const statusMap = {
  SUCCESS: defineMessage({ defaultMessage: 'Success' }),
  PENDING: defineMessage({ defaultMessage: 'Pending' }),
  INPROGRESS: defineMessage({ defaultMessage: 'In progress' }),
  FAIL: defineMessage({ defaultMessage: 'Failed' })
}

const StatusComp = (props: StatusIconProps) => {
  const { $t } = useIntl()
  return <StatusWrapper status={props.status}>
    <StatusIcon status={props.status}/>{$t(statusMap[props.status])}
  </StatusWrapper>
}

export interface TimelineItem {
  status: TimelineStatus,
  startDatetime: string,
  endDatetime: string,
  description: string,
  children?: React.ReactElement
  error?: string
  type?: TimelineType
}

interface TimelineProps {
  items: TimelineItem[]
  status?: TimelineStatus
}

enum TimelineType {
  PREVIOUS = 'previous',
  CURRENT = 'current',
  FUTURE = 'future'
}

const Timeline = (props: TimelineProps) => {
  const { $t } = useIntl()
  const [ expand, setExpand ] = useState<Record<string, boolean>>({})

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

  const EndDot = (item: TimelineItem, index: number) => (
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
              <StatusComp status={item.status}/>
              <DescriptionWrapper
              >{item.description}</DescriptionWrapper>
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
          { expand[`${item.startDatetime}-${item.endDatetime}`] ? item.children : null}
        </ContentWrapper>
      </ItemWrapper>
    </AntTimeline.Item>
  )

  return <Wrapper>
    <Descriptions>
      <Descriptions.Item label={$t({ defaultMessage: 'Current Status' })}>
        {$t(statusMap[props.status!])}
      </Descriptions.Item>
    </Descriptions>
    <AntTimeline>
      {modifiedProps.map((item, index)=>[
        StartDot(item, index),
        EndDot(item, index)
      ])}
    </AntTimeline>
  </Wrapper>
}

export { Timeline }
