import { Card as AntCard, Space, Spin, Tooltip } from 'antd'

import * as UI from './styledComponents'

import type { CardProps as AntCardProps } from 'antd'

export interface EdgeClusterTypeCardProps extends Pick<AntCardProps, 'children'> {
  className?: string
  id: string
  title: string
  icon: JSX.Element
  showSelected?: boolean
  disabled?: boolean
  warningTooltip?: string
  onClick?: (id: string) => void
}

export const EdgeClusterTypeCard = ({
  className,
  id,
  title,
  icon,
  showSelected = false,
  disabled = false,
  warningTooltip,
  onClick
}: EdgeClusterTypeCardProps) => {
  const handleClick = () => {
    onClick?.(id)
  }

  return (
    <Spin spinning={disabled} indicator={<></>}>
      <UI.Wrapper
        className={className}
        showSelected={showSelected}
        disabled={disabled}
        hasWarning={Boolean(warningTooltip)}
        onClick={disabled ? undefined : handleClick}
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
    </Spin>
  )
}