import React from 'react'

import { Badge, BadgeProps } from 'antd'
import styled                from 'styled-components/macro'

const RefBadge = React.forwardRef<
  unknown,
  React.PropsWithChildren<BadgeProps>
// There doesn't seems to have ref for Badge...
// eslint-disable-next-line @typescript-eslint/no-unused-vars
>((props, ref) => <Badge {...props} />)

export const NotificationCounter = styled(RefBadge)`
  margin: 8px 6px 0px 0px;
  sup {
    padding: 0 3px;
    font-size: 10px;
  }
`
