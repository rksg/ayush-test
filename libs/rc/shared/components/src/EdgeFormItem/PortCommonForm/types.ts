import { FormItemProps } from 'antd'

import { EdgeInterface, EdgePortTypeEnum } from '@acx-ui/rc/utils'

export interface formFieldsPropsType {
  [key: string]: FormItemProps & {
    title?: string
    options?: {
      label: string,
      value: EdgePortTypeEnum
    }[]
    disabled?: boolean,
    // eslint-disable-next-line max-len
    customValidator?: (currentInterfaceData: EdgeInterface, interfaceList?: EdgeInterface[]) => Promise<string | void>
  }
}