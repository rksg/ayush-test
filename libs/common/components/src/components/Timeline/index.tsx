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
  InProgressIcon,
  Dash
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
}

interface TimelineProps {
  items: TimelineItem[]
}

const Timeline = (props: TimelineProps) => {
  const { $t } = useIntl()
  const [ expand, setExpand ] = useState<Record<string, boolean>>({})

  return <Wrapper>
    <Descriptions>
      <Descriptions.Item label={$t({ defaultMessage: 'Current Status' })}>
        {$t(statusMap[props.items[0].status])}
      </Descriptions.Item>
    </Descriptions>
    <AntTimeline>
      {props.items.map((item, index)=>[
        <AntTimeline.Item
          key={`timeline-start-${index}`}
          dot={<Step $state={item.startDatetime ? 'previous' : 'future'} />}>
          {item.startDatetime
            ? formatter(DateFormatEnum.DateTimeFormatWithSeconds)(item.startDatetime)
            : '--'}
        </AntTimeline.Item>,
        <Dash/>,
        <AntTimeline.Item
          key={`timeline-end-${index}`}
          dot={<Step $state={item.endDatetime ? 'previous' : 'future'} />}>
          <ItemWrapper>
            {item.endDatetime
              ? formatter(DateFormatEnum.DateTimeFormatWithSeconds)(item.endDatetime)
              : '--'}
            <ContentWrapper>
              <WithExpanderWrapper>
                <div>
                  <StatusComp status={item.status}/>
                  <DescriptionWrapper>{item.description}</DescriptionWrapper>
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
      ])}
    </AntTimeline>
  </Wrapper>
}

export { Timeline }
