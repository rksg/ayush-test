import React, { useState } from 'react'

import { Card as AntCard, Space } from 'antd'

import { SelectionControl } from '../SelectionControl'

import * as UI from './styledComponents'

import type { SelectionControlOptionProps } from '../SelectionControl'
import type {
  CardProps as AntCardProps,
  RadioChangeEvent as AntRadioChangeEvent
} from 'antd'


export interface CardProps extends Pick<AntCardProps, 'children'> {
  title?: string
  subTitle?: string
  tabs?: Array<SelectionControlOptionProps & { component: React.ReactNode }>
  defaultTab?: string
  onTabChange?: (e: AntRadioChangeEvent) => void
  onExpandClick?: () => void
  onMoreClick?: () => void
}

export const Card = function Card ({ title, subTitle, tabs, ...props }: CardProps) {
  const [selectedTab, setSelectedTab] = useState(props.defaultTab)
  const wrapperProps = {
    hasTitle: Boolean(title),
    hasSubTitle: Boolean(subTitle),
    hasTabs: Boolean(tabs)
  }
  return (
    <UI.Wrapper {...wrapperProps}>
      <AntCard
        bordered={false}
        title={
          <UI.HeaderContainer {...wrapperProps}>
            <UI.TitleWrapper children={title} />
            {tabs ? (
              <UI.SelectionControlWrapper
                children={
                  <SelectionControl
                    size={'small'}
                    options={tabs}
                    defaultValue={props.defaultTab}
                    onChange={(e) => {
                      setSelectedTab(e.target.value)
                      props.onTabChange && props.onTabChange(e)
                    }}
                  />
                }
              />
            ) : <div />}
            {subTitle ? (
              <UI.SubTitleWrapper children={subTitle} />
            ) : null}
          </UI.HeaderContainer>
        }
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
        {tabs
          ? tabs.find(({ value }) => value === selectedTab)?.component
          : props.children}
      </AntCard>
    </UI.Wrapper>
  )
}
