import { CloseOutlined } from '@ant-design/icons'
import { message }       from 'antd'
import { ArgsProps }     from 'antd/lib/message'
import { v4 as uuidv4 }  from 'uuid'

import * as UI from './styledComponents'

const durationMap:{ [index:string]: number } = {
  info: 0,
  success: 7,
  error: 0
}

const defaultLinkText:{ [index:string]: string } = {
  info: 'Details',
  success: 'View',
  error: 'Technical Details'
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
    ...config,
    content: toastContent(key, config)
  })
  return key
}

const toastContent = (key: string | number, config: ToastProps) => {
  const { content, extraContent, link, type: toastType, onClose, closable = true } = config
  return (
    <UI.Toast>
      <UI.Content>
        <label>{content}</label>
        { extraContent || null }
        {
          link && (
            <UI.Link onClick={() => link.onClick()}>
              {link.text || defaultLinkText[toastType]}
            </UI.Link>
          )
        }
      </UI.Content>
      { closable && (
        <UI.CloseButton onClick={() => {
          message.destroy(key)
          if (onClose) onClose()
        }}>
          <CloseOutlined />
        </UI.CloseButton>
      )}
    </UI.Toast>
  )
}
