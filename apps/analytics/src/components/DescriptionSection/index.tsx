import React from 'react'

import { Descriptions } from 'antd'

import { Row } from './styledComponents'

export interface DescriptionRowProps {
  label: string
  title: string
  children: React.ReactNode | string
  onClick: () => void
}

export const DescriptionRow: React.FC<DescriptionRowProps> = (props) => {
  return <Row
    title={props.title || ((typeof props.children === 'string') ? props.children : undefined)}
    onClick={props.onClick}
  >
    {props.children}
  </Row>
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