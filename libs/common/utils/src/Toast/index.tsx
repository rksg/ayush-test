import { message }      from 'antd'
import { ArgsProps }    from 'antd/lib/message'
import { v4 as uuidv4 } from 'uuid'



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
    duration: 7,
    ...config
  })
  return key
}

