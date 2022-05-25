import { message } from 'antd'
import { useState } from 'react'
import { showTxToast, showInfoToast, rcToastTemplate } from '@acx-ui/rc/utils'
import { mockdata } from './mockData'

const SECONDS = 5
const TOAST_KEY = 'info_key'

const showToast = (test:number, timeout:any) => {
  const msg = {
    severity: 'info',
    summary: 'AP LEDs Blink ... ',
    life: 30 * 1000,
    sticky: false,
    closable: false,
    data: {
      apSerialNumber: 1234,
      countdown: true
    }
  }
  showInfoToast(TOAST_KEY, rcToastTemplate(msg, test), () => { clearInterval(timeout) })
}

const infoToast = (count:any, setCount:any) => {
  let test = count
  let timeout:any
  setTimeout(() => {
    showToast(test, timeout)
    setCount(test--)
    timeout = setInterval(() => {
      showToast(test, timeout)
      setCount(test--)
      if (test === 0) {
        clearInterval(timeout)
        message.destroy(TOAST_KEY)
        setCount(SECONDS)
      }
    }, 1000)
  })
}


export function RcToast () {
  const [count, setCount] = useState(SECONDS)
  const successToast = () => {
    const mockData = mockdata
    showTxToast(mockData)
  }
  const errorToast = () => {
    const mockData = { ...mockdata, 
      status: 'FAIL',
      requestId: '456',
      descriptionTemplate: 'Network "@@networkName" was not added'
    }
    showTxToast(mockData)
  }
  return (
    <>
    Toast:
    <button onClick={()=>{infoToast(count, setCount)}}>Info</button>
    <button onClick={successToast}>Success</button>
    <button onClick={errorToast}>Error</button>
    </>
  )
}