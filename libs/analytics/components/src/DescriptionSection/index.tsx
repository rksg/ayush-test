import React from 'react'

import { Popover }                             from 'antd'
import { TooltipPlacement }                    from 'antd/es/tooltip'
import { FormattedMessage, MessageDescriptor } from 'react-intl'

import { Tooltip } from '@acx-ui/components'

import { Descriptions, TextContent, PopoverWrapper, PopoverGlobalStyle } from './styledComponents'

import type { Props as FormattedMessageProps } from 'react-intl/lib/src/components/message'

export interface DescriptionRowProps {
  label: string
  tooltip?: string
  popover?: string
  children: React.ReactNode
  onClick?: () => void
  tooltipPlacement?: TooltipPlacement
  formattedTooltip?: MessageDescriptor
  tooltipValues?: FormattedMessageProps['values']
}

export const DescriptionRow: React.FC<Omit<DescriptionRowProps, 'label'>> = (props) => {
  let textContent = <TextContent onClick={props.onClick}>{props.children}</TextContent>
  if (props.tooltip || props.formattedTooltip) {
    textContent = <Tooltip
      title={props.formattedTooltip
        ? <FormattedMessage
          {...props.formattedTooltip}
          values={props.tooltipValues}
        />
        : props.tooltip as React.ReactNode}
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
