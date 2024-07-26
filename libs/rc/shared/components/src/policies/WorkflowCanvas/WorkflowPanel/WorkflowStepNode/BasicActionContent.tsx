import { ReactElement } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import * as UI from './styledComponents'

interface BasicActionContentProps {
  icon: ReactElement,
  title: string,
  content?: string | ReactElement
}

export default function BasicActionContent (props: BasicActionContentProps) {
  const { icon, title, content } = props
  const { $t } = useIntl()

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
        {content ?
          <UI.Popover
            content={content}
            trigger='hover'
            overlayInnerStyle={{ backgroundColor: 'var(--acx-primary-black)' }}
            color='var(--acx-primary-black)'
          >
            {$t({ defaultMessage: 'Details' })}
          </UI.Popover>
          : ''}
      </Space>
    </Space>
  )
}
