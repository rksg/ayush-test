import { InformationSolid } from '@acx-ui/icons'

import { AlertStyle } from './styledComponents'

import type { AlertProps } from 'antd'

export type { AlertProps }

export const Alert = (props: AlertProps) => <AlertStyle
  {...props}
  icon={props.showIcon && props.type === 'info' ? <InformationSolid /> : undefined}
/>
