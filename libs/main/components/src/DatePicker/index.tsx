import {
  DatePickerProps as AntDatePickerProps
} from 'antd'

import { DatePicker as RCDatePicker } from '@acx-ui/components'
import {
  useUserProfileContext
} from '@acx-ui/user'

export const DatePicker = (props: AntDatePickerProps) => {
  const { data: userProfile } = useUserProfileContext()
  const dateFormat = userProfile?.dateFormat.toUpperCase()
  return <RCDatePicker
    {...props}
    format={props.format ? props.format : dateFormat}
  />
}