import { CloseOutlined }         from '@ant-design/icons'
import { message }               from 'antd'
import { ArgsProps, NoticeType } from 'antd/lib/message'
import { v4 as uuidv4 }          from 'uuid'

import { Toast, CloseButton } from './styledComponents'


const classNameMap:{ [key in NoticeType]: string } = {
  info: 'toast-info',
  success: 'toast-success',
  error: 'toast-error',
  warning: '',
  loading: ''
}

export const showToast = (config: ArgsProps, callback?:Function) => {
  const key = config.key || uuidv4()
  message.open({
    className: classNameMap[config.type],
    key,
    icon: <></>,
    duration: 0,
    ...config,
    content: toastContainer(key, config.content, callback)
  })
}

const toastContainer = (key:string | number, content:any, callback?:Function) => {
  return (
    <Toast>
      {content}
      <CloseButton onClick={() => {
        message.destroy(key)
        if(callback) callback()
      }}><CloseOutlined /></CloseButton>
    </Toast>
  )
}