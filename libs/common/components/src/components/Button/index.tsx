import React from 'react'

import { ButtonProps as AntButtonProps, Tooltip, TooltipProps } from 'antd'
import { useIntl }                                              from 'react-intl'

import { notAvailableMsg } from '@acx-ui/utils'

import * as UI from './styledComponents'

export interface ButtonProps extends Omit<AntButtonProps, 'type'> {
  // `secondary` refers to Primary Orange in design system
  // https://www.figma.com/file/NexKzWX3cfjNzGYzfwrVER/ACX-design-system?node-id=949%3A17349
  type?: 'default' | 'primary' | 'secondary' | 'link'
}

export function Button ({ type = 'default', ...props }: ButtonProps) {
  let customType = null
  if (type === 'secondary') {
    customType = 'secondary'
    type = 'primary'
  }
  return (
    <UI.Button
      type={type as AntButtonProps['type']}
      $customType={customType}
      {...props}
    />
  )
}


export function DisabledButton (
  props: ButtonProps & { tooltipPlacement?: TooltipProps['placement'] }
) {
  // workaround for showing tooltip when button disabled
  // ref: https://github.com/react-component/tooltip/issues/18
  return <Tooltip
    placement={props.tooltipPlacement || 'top'}
    title={useIntl().$t(notAvailableMsg)}>
    <span style={{ cursor: 'not-allowed' }}>
      <Button {...props} disabled style={{ pointerEvents: 'none' }}/>
    </span>
  </Tooltip>
}
