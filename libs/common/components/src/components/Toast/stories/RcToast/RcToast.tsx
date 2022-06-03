import { useState } from 'react'

import { message } from 'antd'

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import {
  showTxToast,
  ToastMessage,
  Transaction,
  TxStatus,
  CountdownNode
} from '@acx-ui/rc/utils'

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

const infoToast = (count: number, setCount: Function) => {
  const TOAST_KEY = 'countdown_case'
  const displayToast = (countdown: number, timeout: ReturnType<typeof setInterval>) => {
    const msg: ToastMessage = {
      severity: 'info',
      summary: 'AP LEDs Blink ... ',
      life: 30 * 1000,
      sticky: false,
      closable: false,
      data: {
        apSerialNumber: 1234
      }
    }
    showToast({
      type: msg.severity,
      content: msg.summary,
      key: TOAST_KEY,
      extraContent: <CountdownNode n={countdown} />,
      onClose: () => {
        setCount(countdown--)
        clearInterval(timeout)
        countInterval = setInterval(() => {
          setCount(countdown--)
          if (countdown <= 0) {
            clearInterval(countInterval)
            setCount(SECONDS)
          }
        }, 1000)
      }
    })
  }
  let countdown = count
  let timeout: ReturnType<typeof setInterval>
  let countInterval: ReturnType<typeof setInterval>
  setTimeout(() => {
    displayToast(countdown, timeout)
    setCount(countdown--)
    timeout = setInterval(() => {
      displayToast(countdown, timeout)
      setCount(countdown--)
      if (countdown <= 0) {
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
  const mockData: Transaction = { ...mockdata,
    status: TxStatus.FAIL,
    requestId: '456',
    descriptionTemplate: 'Network "@@networkName" was not added'
  }
  showTxToast(mockData)
}
