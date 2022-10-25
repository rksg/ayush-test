import { useContext, useReducer } from 'react'

import { fireEvent, renderHook } from '@testing-library/react'
import { Button }                from 'antd'

import { EPDG, QosPriorityEnum, WifiCallingActionTypes } from '@acx-ui/rc/utils'
import { render, screen }                                from '@acx-ui/test-utils'

import WifiCallingFormContext, { mainReducer } from './WifiCallingFormContext'

const serviceName = 'test'
const description = ''
const profileName = ''
const qosPriority: QosPriorityEnum = QosPriorityEnum.WIFICALLING_PRI_VOICE
const tags: string[] = []
const ePDG: EPDG[] = []
const networkIds: string[] = []
const networksName: string[] = []

const initState = {
  serviceName,
  profileName,
  ePDG,
  qosPriority,
  tags,
  description,
  networkIds,
  networksName
}

const renderInitState = (children: JSX.Element) => {


  const { result } = renderHook(() => useReducer(mainReducer, initState))
  const [state, dispatch] = result.current



  const renderElement = <WifiCallingFormContext.Provider value={{ state, dispatch }}>
    {children}
  </WifiCallingFormContext.Provider>

  return {
    state, dispatch, renderElement
  }
}

const TestComponent = () => {
  const { state, dispatch } = useContext(WifiCallingFormContext)
  return (
    <>
      {state.serviceName}
      <Button onClick={() => dispatch({
        type: WifiCallingActionTypes.ADD_EPDG,
        payload: {
          domain: 'aaa.bbb.ccc',
          ip: '10.10.10.10.'
        }
      })}>add ePDG</Button>
    </>
  )
}

describe('WifiCallingFormContext', () => {
  it('should render wifiCallingFormContext successfully', () => {
    const { renderElement } = renderInitState(<TestComponent />)
    render(renderElement)

    expect(screen.getByText('test')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'add ePDG' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'add ePDG' }))
  })
})
