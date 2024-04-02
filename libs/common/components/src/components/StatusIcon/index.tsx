import { StatusIconProps } from '@acx-ui/types'

import {
  SuccessIcon,
  FailIcon,
  PendingsIcon,
  InProgressIcon
} from './styledComponents'

export const StatusIcon = (props: StatusIconProps) => {
  switch(props.status) {
    case 'SUCCESS':
      return <SuccessIcon />
    case 'PENDING':
      return <PendingsIcon />
    case 'INPROGRESS':
      return <InProgressIcon />
    case 'FAIL':
      return <FailIcon />
  }
}
