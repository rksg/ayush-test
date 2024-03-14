import { Card, Descriptions } from '@acx-ui/components'

import * as UI from './styledComponents'

import type { CompatibilityNodeError, SingleNodeDetailsField } from '../types'

interface SingleNodeDetailsProps<RecordType> {
  title: string,
  fields: SingleNodeDetailsField<RecordType>[],
  data: CompatibilityNodeError<RecordType>['errors']
}

export const SingleNodeDetails = <RecordType,>
  (props: SingleNodeDetailsProps<RecordType>) => {
  const { title, fields, data } = props

  return <UI.StyledCard>
    <Card title={title}>
      <Descriptions>
        {fields.map((item) => {
          return <Descriptions.Item
            key={item.key}
            label={item.title}
            children={item.render(data)}
          />
        })}
      </Descriptions>
    </Card>
  </UI.StyledCard>
}