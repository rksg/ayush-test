import { Card as AntCard, Space, Tooltip } from 'antd'

import * as UI from './styledComponents'

import type { CardProps as AntCardProps } from 'antd'


export interface EdgeClusterTypeCardProps extends Pick<AntCardProps, 'children'> {
  className?: string
  title: string
  icon: JSX.Element
  showSelected?: boolean
  warningTooltip?: string
  onClick?: () => void
}

export const EdgeClusterTypeCard = ({
  className,
  title,
  icon,
  showSelected = false,
  warningTooltip
}: EdgeClusterTypeCardProps) => {

  return (
    <UI.Wrapper
      className={className}
      showSelected={showSelected}
      hasWarning={Boolean(warningTooltip)}
    >
      <AntCard
        bordered={false}
        extra={
          showSelected ? <UI.CheckMarkIcon /> : null
        }
        actions={warningTooltip
          ? [<Tooltip title={warningTooltip}>
            <UI.InformationSolidIcon />
          </Tooltip>]
          : undefined}
      >
        <Space size={5} direction='vertical' align='center'>
          <UI.IconWrapper children={icon} />
          <UI.Title children={title} />
        </Space>
      </AntCard>
    </UI.Wrapper>
  )
}