import { ReactElement } from 'react'

import { Popover, Space } from 'antd'

import * as UI from './styledComponents'
import { useIntl } from 'react-intl'

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
          <UI.PopoverWrapper>
            <UI.PopoverGlobalStyle />
            <Popover content={content}
              trigger={'click'}>
              {$t({defaultMessage: 'Details'})}
            </Popover>
          </UI.PopoverWrapper>
          : ''}
      </Space>
    </Space>
  )
}
