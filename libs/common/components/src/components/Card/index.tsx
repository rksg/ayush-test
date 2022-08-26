import React from 'react'

import { Card as AntCard, Space } from 'antd'

import * as UI from './styledComponents'

import type { CardProps as AntCardProps } from 'antd'

export interface CardProps extends Pick<AntCardProps, 'children'> {
  bordered?: boolean
  title?: string
  subTitle?: string
  onExpandClick?: () => void
  onMoreClick?: () => void
}

export const Card = function Card ({
  bordered = true,
  title,
  subTitle,
  ...props
}: CardProps) {
  const wrapperProps = {
    hasBorder: bordered,
    hasTitle: Boolean(title)
  }
  return (
    <UI.Wrapper {...wrapperProps}>
      <AntCard
        bordered={false}
        title={<>
          <UI.TitleWrapper children={title} />
          {subTitle ? (
            <UI.SubTitleWrapper children={subTitle} />
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
