import { Card as AntCard, Space } from 'antd'

import * as UI from './styledComponents'

import type { CardProps as AntCardProps } from 'antd'

export type CardTypes = 'default' | 'no-border' | 'solid-bg'

export interface CardProps extends Pick<AntCardProps, 'children'> {
  type?: CardTypes
  title?: string | { title?: string, icon: JSX.Element | null }
  subTitle?: string
  onArrowClick?: () => void
  onMoreClick?: () => void
  action?: {
    actionName: string
    onActionClick: () => void
  }
}

function Card ({
  type = 'default',
  subTitle,
  ...props
}: CardProps) {
  const wrapperProps = {
    type,
    hasTitle: Boolean(props.title)
  }
  const { title, icon } = (typeof props.title === 'string'
    ? { title: props.title, icon: null }
    : props.title
  ) || { title: undefined, icon: null }

  return (
    <UI.Wrapper {...wrapperProps}>
      <AntCard
        bordered={false}
        title={<>
          <Space size={4}>
            <UI.Title children={title} />
            {title && icon}
          </Space>
          {subTitle ? (
            <UI.SubTitle children={subTitle} />
          ) : null}
        </>}
        extra={
          <Space>
            { props.onArrowClick ? <UI.Button
              key={'expand-btn'}
              title={'Expand'}
              icon={<UI.ArrowChevronRightIcon />}
              onClick={props.onArrowClick}
            /> : null }
            { props.onMoreClick ? <UI.Button
              key={'more-btn'}
              title={'More'}
              icon={<UI.MoreVerticalIcon />}
              onClick={props.onMoreClick}
            /> : null }
            { props.action ?
              <UI.LinkButton type='link' onClick={props.action.onActionClick}>
                {props.action.actionName}
              </UI.LinkButton> : null }
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
