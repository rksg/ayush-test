import { ReactNode } from 'react'

import { List, Space, Popover } from 'antd'

export interface ListWithIconProps {
    data: {icon: ReactNode, title: string, popoverContent?: ReactNode}[],
    header?: ReactNode
    footer?: ReactNode,
    pageSize?: number,
    isPaginate?: boolean
}
  
export function ListWithIcon (props:ListWithIconProps){
  const { data, header, footer, pageSize, isPaginate } = props
  return (
    <List
      header={header}
      footer={footer}
      itemLayout='vertical'
      bordered
      dataSource={data}
      renderItem={item => (
        <List.Item>
          <Popover 
            content={item.popoverContent} 
            placement='right' 
            title={item.popoverContent ? item.title : ''}
            trigger='hover'>
            <Space>
              {item.icon}
              {item.title}
            </Space>
          </Popover>
        </List.Item>
      )}
      pagination={isPaginate ? {
        pageSize: pageSize || 3,
        size: 'small'
      }:false}
    />
  )
}