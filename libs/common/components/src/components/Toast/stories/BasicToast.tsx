import {
  Loading3QuartersOutlined
} from '@ant-design/icons'

import { showToast } from '..'

export function BasicToast () {
  return (
    <>
    Basic Toast:
      <button onClick={infoToast}>Info</button>
      <button onClick={successToast}>Success</button>
      <button onClick={errorToast}>Error</button>
      <button onClick={loadingToast}>Loading</button>
    </>
  )
}

const infoToast = () => {
  showToast({
    type: 'info',
    content: 'Action in progress...'
  })
}

const successToast = () => {
  showToast({
    type: 'success',
    content: 'This is a success message',
    link: {
      onClick: () => {alert('Success detail')}
    }
  })
}

const errorToast = () => {
  showToast({
    type: 'error',
    content: 'This is an error message',
    link: {
      text: 'Details',
      onClick: () => {alert('Error detail')}
    }
  })
}

const loadingToast = () => {
  showToast({
    type: 'info',
    duration: 10,
    closable: false,
    extraContent: <div style={{ width: '60px' }}>
      <Loading3QuartersOutlined spin
        style={{ margin: 0, fontSize: '18px' }}/>
    </div>,
    content: 'Preparing log...'
  })
}
