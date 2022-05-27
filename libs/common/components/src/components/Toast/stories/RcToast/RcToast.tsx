import { useState } from 'react'

import { message } from 'antd'

import { showTxToast, rcToastTemplate } from '@acx-ui/rc/utils'

import { showToast } from '../../index'

import { mockdata } from './mockData'

export function RcToast () {
  const [count, setCount] = useState(SECONDS)
  return (
    <>
    RC Toast:
      <button onClick={()=>{infoToast(count, setCount)}}>Info</button>
      <button onClick={successToast}>Success</button>
      <button onClick={errorToast}>Error</button>
    </>
  )
}

const SECONDS = 30

const infoToast = (count:any, setCount:any) => {
  const TOAST_KEY = 'countdown_case'
  const displayToast = (countdown:number, timeout:any) => {
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
    showToast({ 
      type: 'info',
      key: TOAST_KEY,
      content: rcToastTemplate(msg, countdown) 
    }, 
    () => { 
      setCount(countdown--)
      clearInterval(timeout) 
      countInterval = setInterval(() => {
        setCount(countdown--)
        if (countdown === 0) {
          clearInterval(countInterval)
          setCount(SECONDS)
        }
      }, 1000)
    })
  }
  let countdown = count
  let timeout:any
  let countInterval:any
  setTimeout(() => {
    displayToast(countdown, timeout)
    setCount(countdown--)
    timeout = setInterval(() => {
      displayToast(countdown, timeout)
      setCount(countdown--)
      if (countdown === 0) {
        clearInterval(timeout)
        message.destroy(TOAST_KEY)
        setCount(SECONDS)
      }
    }, 1000)
  })
}

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