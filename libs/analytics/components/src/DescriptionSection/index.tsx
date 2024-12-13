import React from 'react'

import { Popover }          from 'antd'
import { TooltipPlacement } from 'antd/es/tooltip'

import { Tooltip } from '@acx-ui/components'

import { Descriptions, TextContent, PopoverWrapper, PopoverGlobalStyle } from './styledComponents'


export interface DescriptionRowProps {
  label: string
  tooltip?: React.ReactNode
  popover?: string
  children: React.ReactNode
  onClick?: () => void
  tooltipPlacement?: TooltipPlacement
}

export const DescriptionRow: React.FC<Omit<DescriptionRowProps, 'label'>> = (props) => {
  let textContent = <TextContent onClick={props.onClick}>{props.children}</TextContent>
  if (props.tooltip) {
    textContent = <Tooltip
      title={props.tooltip}
      dottedUnderline={true}
      placement={props.tooltipPlacement ?? 'top'}
    >
      {textContent}
    </Tooltip> }
  if (props.popover) {
    textContent = (<PopoverWrapper>
      <PopoverGlobalStyle />
      <Popover content={props.popover}
        trigger='hover'>
        {textContent}
      </Popover>
    </PopoverWrapper>)}
  return textContent
}

export const DescriptionSection: React.FC<{
  fields: DescriptionRowProps[], column?: number,
  layout?: 'vertical' | 'horizontal' | undefined
}> = props => {
  return <Descriptions column={props.column || 1} layout={props.layout??'vertical'}>
    {props.fields.map((field, key) =>
      <Descriptions.Item key={key} label={field.label}>
        <DescriptionRow {...field}/>
      </Descriptions.Item>)}
  </Descriptions>
}
