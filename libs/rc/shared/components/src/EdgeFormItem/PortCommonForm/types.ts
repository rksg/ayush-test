import { FormItemProps } from 'antd'

import { EdgePortTypeEnum } from '@acx-ui/rc/utils'

export interface formFieldsPropsType {
  [key: string]: FormItemProps & {
    title?: string
    options?: {
      label: string,
      value: EdgePortTypeEnum
    }[]
    disabled?: boolean,
  }
}