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

export const AttributesSection: React.FC<{ fields: AttributeRowProps[] }> = props => {
  return <Descriptions>
    {props.fields.map(field =>
      <Descriptions.Item label={field.label}>{field.children}</Descriptions.Item>)}
  </Descriptions>
}