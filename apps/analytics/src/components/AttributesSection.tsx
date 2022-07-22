import React from 'react'

import { Descriptions } from 'antd'

export interface AttributeRowProps {
  label: string
  title: string
  children: React.ReactNode | string
  onClick: () => void
}

export const AttributeRow: React.FC<AttributeRowProps> = (props) => {
  return <div
    title={props.title || ((typeof props.children === 'string') ? props.children : undefined)}
    onClick={props.onClick}
  >
    {props.children}
  </div>
}

export const AttributesSection: React.FC<{
  fields: AttributeRowProps[], column?: number
}> = props => {
  return <Descriptions column={props.column || 1} layout='vertical'>
    {props.fields.map((field, key) =>
      <Descriptions.Item key={key} label={field.label}>
        <AttributeRow {...field}/>
      </Descriptions.Item>)}
  </Descriptions>
}