import { Space, Typography } from 'antd'
import styled                from 'styled-components'

import { Card, GridCol, GridRow } from '@acx-ui/components'

import * as UI from './styledComponents'

interface BasicInfoProps {
  data: {
    title: string | Function | JSX.Element,
    content: undefined | number | string | Function | JSX.Element
  }[]
  colPerRow?: number
  disabledMargin?: boolean
  className?: string
}

export const ServiceInfo = styled((props: BasicInfoProps) => {
  const{ disabledMargin } = props
  return (
    <Card type='solid-bg'>
      {
        disabledMargin ?
          <Content {...props} />
          :
          <UI.InfoMargin children={<Content {...props} />} />
      }
    </Card>
  )
})`${UI.textStyle}`

const Content = ({ data, colPerRow = 8, className }: BasicInfoProps) => (
  <GridRow className={className}>
    {data.map((item, index) =>
      (<GridCol col={{ span: 24/colPerRow }} key={index}>
        <Space direction='vertical' size={10}>
          <Typography.Text>
            {typeof item.title === 'function' ? item.title() : item.title}
          </Typography.Text>
          <Typography.Text className='text-color'>
            {typeof item.content === 'function' ? item.content() : item.content}
          </Typography.Text>
        </Space>
      </GridCol>)
    )}
  </GridRow>
)