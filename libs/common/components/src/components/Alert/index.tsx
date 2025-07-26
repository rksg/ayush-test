import { InformationSolid } from '@acx-ui/icons'

import { AlertStyle } from './styledComponents'

import type { AlertProps as AntdAlertProps } from 'antd'

export interface AlertProps extends Omit<AntdAlertProps, 'type'> {
  type?: 'success' | 'info' | 'warning' | 'error' | 'primary'
}

export const Alert = (props: AlertProps) => {
  const { type, ...restProps } = props
  // Map our custom 'primary' type to 'info' for Antd, but keep our custom className
  const antdType = type === 'primary' ? 'info' : type
  const className = [props.className, type === 'primary' ? 'ant-alert-primary' : '']
    .filter(Boolean)
    .join(' ')

  return <AlertStyle
    {...restProps}
    type={antdType}
    className={className}
    icon={props.showIcon && (type === 'info' || type === 'primary') ?
      <InformationSolid /> : undefined}
  />
}
