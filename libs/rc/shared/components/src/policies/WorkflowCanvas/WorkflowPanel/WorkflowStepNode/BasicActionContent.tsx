import { ReactElement } from 'react'

import { Space } from 'antd'

import * as UI from './styledComponents'

interface BasicActionContentProps {
  icon: ReactElement,
  title: string,
  content?: string | ReactElement
}

export default function BasicActionContent (props: BasicActionContentProps) {
  const { icon, title, content } = props

  return (
    <Space
      direction={'horizontal'}
      align={'start'}
      size={12}
    >
      <UI.ActionTypeIcon>
        {icon}
      </UI.ActionTypeIcon>
      <Space direction={'vertical'}
        align={'start'}
        size={4}>
        <div>{title}</div>
        <div>{content}</div>
      </Space>
    </Space>
  )
}
