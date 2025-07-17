import { message }      from 'antd'
import { ArgsProps }    from 'antd/lib/message'
import { v4 as uuidv4 } from 'uuid'

const durationMap:{ [index:string]: number } = {
  info: 0,
  success: 7,
  error: 0
}

export type ToastType = 'info' | 'success' | 'error'

export interface ToastProps extends ArgsProps {
  type: ToastType
  extraContent?: React.ReactNode
  closable?: boolean
  link?: { text?: string, onClick: Function }
}

export const showToast = (config: ToastProps): string | number => {
  const key = config.key || uuidv4()
  message.open({
    className: `toast-${config.type}`,
    key,
    // eslint-disable-next-line react/jsx-no-useless-fragment
    icon: <></>,
    duration: durationMap[config.type],
    ...config
  })
  return key
}
