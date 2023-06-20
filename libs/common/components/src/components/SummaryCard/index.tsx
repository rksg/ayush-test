import { Space, Typography } from 'antd'
import toArray               from 'rc-util/lib/Children/toArray'
import styled                from 'styled-components'

import { Card }             from '../Card'
import { GridCol, GridRow } from '../Grid'
import { Loader }           from '../Loader'

import * as UI from './styledComponents'

interface SummaryCardoProps {
  data?: {
    title?: unknown
    content?: unknown
    custom?: unknown // custom is for custom item. If there is custom property, the title and content will not work.
    visible?: boolean
    colSpan?: number // Have to line up with the antd grid system.
  }[]
  colPerRow?: 1|2|3|4|6|8|12|24
  className?: string
  isLoading?: boolean
  isFetching?: boolean
}

export const SummaryCard = (props: React.PropsWithChildren<SummaryCardoProps>) => {
  return <SummaryCardBase {...props} />
}

const SummaryCardBase = (props: React.PropsWithChildren<SummaryCardoProps>) => {
  const{ isLoading = false, isFetching = false } = props
  return (
    <Card>
      <Loader states={[{ isLoading, isFetching }]} >
        <UI.InfoMargin children={<SummaryCardContent {...props} />} />
      </Loader>
    </Card>
  )
}

const SummaryCardContent = ({
  data, colPerRow = 8, children
}: React.PropsWithChildren<SummaryCardoProps>) => {
  const childrens = toArray(children)

  return (
    childrens.length > 0 ?
      <>{children}</> :
      <GridRow>
        {
          data?.map((item, index) => {
            const { visible = true } = item
            return (
              visible &&
              <GridCol col={{ span: item?.colSpan || 24/colPerRow }} key={index}>
                {
                  item.custom ?
                    (typeof item.custom === 'function' ? item.custom() : item.custom) :
                    <SummaryCardItem title={item?.title} content={item?.content} />
                }
              </GridCol>
            )
          })
        }
      </GridRow>
  )
}

const SummaryCardItem = styled((
  { title, content, className }: { title?:unknown, content?: unknown, className?: string }
) => (
  <Space className={className} direction='vertical' size={6}>
    {
      Boolean(title) && <Typography.Text className='title'>
        {typeof title === 'function' ? title() : title}
      </Typography.Text>
    }
    {
      Boolean(content) && <Typography.Text className='content'>
        {typeof content === 'function' ? content() : content}
      </Typography.Text>
    }
  </Space>
))`${UI.textStyle}`

SummaryCard.Item = SummaryCardItem