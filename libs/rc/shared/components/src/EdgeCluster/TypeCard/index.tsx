import { Card as AntCard, Spin, Tooltip } from 'antd'

import { RadioCard } from '@acx-ui/components'

import * as UI from './styledComponents'

import type { CardProps as AntCardProps } from 'antd'

export interface EdgeClusterTypeCardProps extends Pick<AntCardProps, 'children'> {
  className?: string
  id: string
  title: string
  icon: JSX.Element
  disabled?: boolean
  warningTooltip?: string
  onClick?: (id: string) => void
  width?: string
  height?: string
}

export const EdgeClusterTypeCard = ({
  className,
  id,
  title,
  icon,
  disabled = false,
  warningTooltip,
  onClick,
  width,
  height
}: EdgeClusterTypeCardProps) => {
  const handleClick = () => {
    onClick?.(id)
  }

  return (
    <Spin spinning={disabled} indicator={<></>}>
      <UI.Wrapper
        className={className}
        disabled={disabled}
        hasWarning={Boolean(warningTooltip)}
        onClick={disabled ? undefined : handleClick}
        width={width}
        height={height}
      >
        <AntCard
          bordered={false}
          actions={warningTooltip
            ? [<Tooltip title={warningTooltip}>
              <UI.WarningCircleSolidIcon />
            </Tooltip>]
            : undefined}
        >
          <UI.CardBody size={10} direction='vertical' align='center'>
            <UI.IconWrapper children={icon} />
            <UI.Title children={title} />
          </UI.CardBody>
          <RadioCard.Radio value={id} />
        </AntCard>
      </UI.Wrapper>
    </Spin>
  )
}