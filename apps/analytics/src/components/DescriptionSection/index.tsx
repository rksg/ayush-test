import React from 'react'

import { Tooltip } from 'antd'

import { Descriptions, TextContent } from './styledComponents'

export interface DescriptionRowProps {
  label: string
  tooltip?: string
  children: React.ReactNode
  onClick?: () => void
}

export const DescriptionRow: React.FC<DescriptionRowProps> = (props) => {
  let textContent = <TextContent
    title={!props.tooltip && typeof props.children === 'string' ? props.children : undefined}
    onClick={props.onClick}
  >
    {props.children}
  </TextContent>
  if (props.tooltip) { textContent = <Tooltip title={props.tooltip}>{textContent}</Tooltip> }
  return textContent
}

export const DescriptionSection: React.FC<{
  fields: DescriptionRowProps[], column?: number
}> = props => {
  return <Descriptions column={props.column || 1} layout='vertical'>
    {props.fields.map((field, key) =>
      <Descriptions.Item key={key} label={field.label}>
        <DescriptionRow {...field}/>
      </Descriptions.Item>)}
  </Descriptions>
}
