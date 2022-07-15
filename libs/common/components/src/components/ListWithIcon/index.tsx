import { ReactNode, FC } from 'react'

import { List, Space, Popover } from 'antd'

type Trigger = 'hover' | 'focus' | 'click' | 'contextMenu'
export interface ListWithIconProps {
    data: { icon: ReactNode, title: string, popoverContent?: ReactNode }[]
    header?: ReactNode
    footer?: ReactNode
    pageSize?: number
    isPaginate?: boolean
    showPopoverTitle?: boolean
    isSimplePagination?: boolean
    popoverTrigger?: Trigger | Array<Trigger>
}

export const ListWithIcon: FC<ListWithIconProps> = (props) => {
  const { data,
    header,
    footer,
    pageSize,
    isPaginate,
    showPopoverTitle,
    isSimplePagination,
    popoverTrigger
  } = props
  return (
    <List
      header={header}
      footer={footer}
      itemLayout='vertical'
      bordered
      dataSource={data}
      renderItem={item => (
        <Popover
          content={item.popoverContent}
          placement='right'
          title={showPopoverTitle && item.popoverContent ? item.title : ''}
          trigger={popoverTrigger}>
          <List.Item>
            <Space>
              {item.icon}
              <div className='ListWithIcon-item-title'>
                {item.title}
              </div>
            </Space>
          </List.Item>
        </Popover>

      )}
      pagination={isPaginate && data.length > (pageSize as number) ? {
        pageSize: pageSize,
        size: 'small',
        simple: isSimplePagination
      }:false}
    />
  )
}

ListWithIcon.defaultProps = {
  pageSize: 3,
  isPaginate: false,
  showPopoverTitle: false,
  isSimplePagination: false,
  popoverTrigger: 'hover'
}
