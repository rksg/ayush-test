import { ReactNode } from 'react'

import { Card, Descriptions } from '@acx-ui/components'

import * as UI from './styledComponents'

export interface SingleNodeDetailsField {
  title: string,
  key: string,
  render: () => ReactNode
}

interface SingleNodeDetailsProps {
  title: string,
  fields: SingleNodeDetailsField[]
}

export const SingleNodeDetails = (props: SingleNodeDetailsProps) => {
  const { title, fields } = props

  return <UI.StyledCard>
    <Card title={title}>
      <Descriptions>
        {fields.map((item) => {
          return <Descriptions.Item
            key={item.key}
            label={item.title}
            children={item.render()}
          />
        })}
      </Descriptions>
    </Card>
  </UI.StyledCard>
}