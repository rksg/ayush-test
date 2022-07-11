import { ReactNode, FC } from 'react'

import { List, Space, Popover } from 'antd'

export interface ListWithIconProps {
    data: {icon: ReactNode, title: string, popoverContent?: ReactNode}[]
    header?: ReactNode
    footer?: ReactNode
    pageSize?: number
    isPaginate?: boolean
    showPopoverTitle?: boolean
}
  
export const ListWithIcon: FC<ListWithIconProps> = (props) => {
  const { data, header, footer, pageSize, isPaginate, showPopoverTitle } = props
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
          trigger='hover'>
          <List.Item>
            <Space>
              {item.icon}
              {item.title}
            </Space>
          </List.Item>
        </Popover>
       
      )}
      pagination={isPaginate && data.length > (pageSize as number) ? {
        pageSize: pageSize,
        size: 'small'
      }:false}
    />
  )
}

ListWithIcon.defaultProps = {
  pageSize: 3,
  isPaginate: false,
  showPopoverTitle: false
}
