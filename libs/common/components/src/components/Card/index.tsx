import React from 'react'

import { Card as AntCard, Space } from 'antd'

import * as UI from './styledComponents'

import type { CardProps as AntCardProps } from 'antd'

export type CardTypes = 'default' | 'no-border' | 'solid-bg'

export interface CardProps extends Pick<AntCardProps, 'children'> {
  type?: CardTypes
  title?: string
  subTitle?: string
  onExpandClick?: () => void
  onMoreClick?: () => void
  isIncidentChart?: boolean
}

function Card ({
  type = 'default',
  title,
  subTitle,
  isIncidentChart,
  ...props
}: CardProps) {
  const wrapperProps = {
    type,
    hasTitle: Boolean(title),
    isChart: Boolean(isIncidentChart)
  }
  return (
    <UI.Wrapper {...wrapperProps}>
      <AntCard
        bordered={false}
        title={<>
          <UI.Title children={title} />
          {subTitle ? (
            <UI.SubTitle children={subTitle} />
          ) : null}
        </>}
        extra={
          <Space>
            { props.onExpandClick ? <UI.Button
              key={'expand-btn'}
              title={'Expand'}
              icon={<UI.ArrowOutIcon />}
              onClick={props.onExpandClick}
            /> : null }
            { props.onMoreClick ? <UI.Button
              key={'more-btn'}
              title={'More'}
              icon={<UI.MoreVerticalIcon />}
              onClick={props.onMoreClick}
            /> : null }
          </Space>
        }
      >
        {props.children}
      </AntCard>
    </UI.Wrapper>
  )
}

Card.Title = UI.Title

export { Card }
