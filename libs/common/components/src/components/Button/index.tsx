import { useCallback, useRef } from 'react'

import { ButtonProps as AntButtonProps, TooltipProps } from 'antd'

import { RbacOpsIds, ScopeKeys } from '@acx-ui/types'

import { Tooltip } from '../Tooltip'

import * as UI from './styledComponents'

export interface ButtonProps extends Omit<AntButtonProps, 'type'> {
  type?: 'default' | 'primary' | 'link'
  scopeKey?: ScopeKeys
  rbacOpsIds?: RbacOpsIds
}

export function Button ({ type = 'default', scopeKey, rbacOpsIds, ...props }: ButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const handleOnMouseUp = useCallback(() => {
    ref.current?.blur()
  }, [])
  return (
    <UI.Button
      ref={ref}
      type={type as AntButtonProps['type']}
      onMouseUp={handleOnMouseUp}
      {...props}
    />
  )
}


export function DisabledButton (props: ButtonProps & {
  tooltipPlacement?: TooltipProps['placement']
  title?: TooltipProps['title']
}) {
  const { tooltipPlacement, title, ...buttonProps } = props
  const button = <span style={{ cursor: 'not-allowed' }}>
    <Button
      disabled
      {...buttonProps}
      style={{ ...props.style, pointerEvents: 'none' }}
    />
  </span>

  if (!title) return button

  return <Tooltip
    placement={tooltipPlacement || 'top'}
    title={title}
    children={button}
  />
}
