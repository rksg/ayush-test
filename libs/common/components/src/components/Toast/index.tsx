import { CloseOutlined } from '@ant-design/icons'
import { message }       from 'antd'
import { ArgsProps }     from 'antd/lib/message'
import { v4 as uuidv4 }  from 'uuid'

import { Toast, CloseButton } from './styledComponents'


const classNameMap:{ [index:string]: string } = {
  info: 'toast-info',
  success: 'toast-success',
  error: 'toast-error'
}

const durationMap:{ [index:string]: number } = {
  info: 0,
  success: 7,
  error: 0
}

const defaultLinkText:{ [index:string]: string} = {
  success: 'View',
  error: 'Technical Details'
}

const commonTemplate = (config: ArgsProps & 
  { link?: { text?: string, onClick: Function }, isCustomContent?: boolean }) => {
  return (
    <div className='toast-style'>
      <label>{config.content}</label>
      {
        config.link && (
          <button className='toast-link' onClick={()=>{config.link?.onClick()}}>
            {config.link.text || defaultLinkText[config.type]}
          </button>
        )
      }
    </div>
  )
}

export const showToast = (config: ArgsProps & 
  { link?: { text?: string, onClick: Function }, isCustomContent?: boolean }) => {
  const key = config.key || uuidv4()
  const content = config.isCustomContent ? config.content : commonTemplate(config)
  message.open({
    className: classNameMap[config.type],
    key,
    icon: <></>,
    duration: durationMap[config.type],
    ...config,
    content: toastContainer(key, content, config.onClose)
  })
}

const toastContainer = (key:string | number, content:any, onClose?:Function) => {
  return (
    <Toast>
      {content}
      <CloseButton onClick={() => {
        message.destroy(key)
        if(onClose) onClose()
      }}><CloseOutlined /></CloseButton>
    </Toast>
  )
}