import { Space, Typography } from 'antd'
import styled                from 'styled-components'

import { Card, GridCol, GridRow } from '@acx-ui/components'

import * as UI from './styledComponents'

interface BasicInfoProps {
  data: {
    title?: unknown
    content?: unknown
    visible?: boolean
    colSpan?: number
  }[]
  colPerRow?: number
  disabledMargin?: boolean
  className?: string
}

export const ServiceInfo = styled((props: BasicInfoProps) => {
  const{ disabledMargin } = props
  return (
    <Card>
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
    {
      data.map((item, index) => {
        const { visible = true } = item
        return (
          visible &&
            <GridCol col={{ span: item?.colSpan || 24/colPerRow }} key={index}>
              <Space direction='vertical' size={10}>
                {
                  Boolean(item.title) && <Typography.Text className='text-color'>
                    {typeof item.title === 'function' ? item.title() : item.title}
                  </Typography.Text>
                }
                {
                  Boolean(item.content) && <Typography.Text className='text-wrap'>
                    {typeof item.content === 'function' ? item.content() : item.content}
                  </Typography.Text>
                }
              </Space>
            </GridCol>
        )
      })
    }
  </GridRow>
)