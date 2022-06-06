import React from 'react'

import * as UI from './styledComponents'

import type { ButtonProps as AntButtonProps } from 'antd'

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
