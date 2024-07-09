import { useContext } from 'react'

import userEvent  from '@testing-library/user-event'
import { Button } from 'antd'

import { EPDG, QosPriorityEnum, WifiCallingActionTypes } from '@acx-ui/rc/utils'
import { render, screen }                                from '@acx-ui/test-utils'

import WifiCallingFormContext from './WifiCallingFormContext'

const serviceName = 'test'
const description = ''
const profileName = ''
const qosPriority: QosPriorityEnum = QosPriorityEnum.WIFICALLING_PRI_VOICE
const tags: string[] = []
const ePDG: EPDG[] = []
const networkIds: string[] = []
const networksName: string[] = []
const epdgs: EPDG[] = []

const initState = {
  serviceName,
  profileName,
  ePDG,
  qosPriority,
  tags,
  description,
  networkIds,
  networksName,
  epdgs
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
  it('should render wifiCallingFormContext successfully', async () => {
    const mockDispatch = jest.fn()

    render(
      <WifiCallingFormContext.Provider value={{ state: initState, dispatch: mockDispatch }}>
        <TestComponent />
      </WifiCallingFormContext.Provider>
    )

    const addButton = screen.getByText('add ePDG')
    await userEvent.click(addButton)

    expect(mockDispatch).toHaveBeenCalledWith({
      type: WifiCallingActionTypes.ADD_EPDG,
      payload: {
        domain: 'aaa.bbb.ccc',
        ip: '10.10.10.10.'
      }
    })
  })
})
