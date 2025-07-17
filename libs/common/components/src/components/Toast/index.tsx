import { CloseOutlined }   from '@ant-design/icons'
import { message }         from 'antd'
import { RawIntlProvider } from 'react-intl'
import { v4 as uuidv4 }    from 'uuid'

import { showToast as showToastRaw, getIntl } from '@acx-ui/utils'
import type { ToastProps }                    from '@acx-ui/utils'

import * as UI from './styledComponents'


const defaultLinkText:{ [index:string]: string } = {
  success: 'View',
  error: 'Technical Details'
}

export const showToast = (config: ToastProps): string | number => {
  const key = config.key || uuidv4()
  showToastRaw({
    key,
    ...config,
    content: <RawIntlProvider value={getIntl()} children={toastContent(key, config)} />
  })
  return key
}

const toastContent = (key: string | number, config: ToastProps) => {
  const { content, extraContent, link, type: toastType, onClose, closable = true } = config
  return (
    <UI.Toast data-testid='toast-content'>
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
