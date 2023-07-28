import { useReducer, useState } from 'react'

import { userEvent }             from '@storybook/testing-library'
import { fireEvent, renderHook, waitFor } from '@testing-library/react'

import { EPDG, QosPriorityEnum } from '@acx-ui/rc/utils'
import { render, screen }        from '@acx-ui/test-utils'

import WifiCallingFormContext, { mainReducer } from '../WifiCallingFormContext'

import WifiCallingDrawer from './WifiCallingDrawer'

const serviceName = 'serviceNameId1'
const description = 'description1'
const profileName = 'profileName1'
const qosPriority: QosPriorityEnum = QosPriorityEnum.WIFICALLING_PRI_VOICE
const tags: string[] = ['tag1', 'tag2', 'tag3']
const ePDG: EPDG[] = [{
  domain: 'init.aaa.com',
  ip: '10.10.10.10'
}]
const networkIds: string[] = []
const networksName: string[] = []
const epdgs: EPDG[] = [{
  domain: 'init.aaa.com',
  ip: '10.10.10.10'
}]

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

const TestComponent = (props: { isEditMode: boolean, serviceIndex: number | undefined }) => {
  const { isEditMode, serviceIndex } = props
  const [visibleAdd, setVisibleAdd] = useState(true)

  return <WifiCallingDrawer
    visible={visibleAdd}
    setVisible={setVisibleAdd}
    isEditMode={isEditMode}
    serviceName={'serviceNameId1'}
    serviceIndex={serviceIndex}
  />
}

describe('WifiCallingDrawer', () => {
  it('should render drawer successfully (add)', async () => {

    const { renderElement } = renderInitState(
      <TestComponent isEditMode={false} serviceIndex={undefined} />
    )
    render(renderElement)

    await screen.findByText('Add ePDG')

    await userEvent.type(screen.getByRole('textbox', {
      name: /domain name/i
    }), 'a.b.com.tw')

    let saveButton = screen.getByText('Save')
    expect(saveButton).toBeTruthy()
    let cancelButton = screen.getByText('Cancel')
    expect(cancelButton).toBeTruthy()

    fireEvent.click(saveButton)
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })

  })

  it('should cancel the drawer successfully', async () => {

    const { renderElement } = renderInitState(
      <TestComponent isEditMode={false} serviceIndex={undefined} />
    )
    render(renderElement)

    let saveButton = screen.getByText('Save')
    expect(saveButton).toBeTruthy()
    let cancelButton = screen.getByText('Cancel')
    expect(cancelButton).toBeTruthy()

    fireEvent.click(cancelButton)
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('should render drawer successfully (edit)', async () => {

    const { renderElement } = renderInitState(<TestComponent isEditMode={true} serviceIndex={0}/>)
    render(renderElement)

    await screen.findByText('Edit ePDG')
    await screen.findByDisplayValue('init.aaa.com')

    await userEvent.type(screen.getByRole('textbox', {
      name: /domain name/i
    }), '.tw')

    let saveButton = screen.getByText('Save')
    expect(saveButton).toBeTruthy()
    let cancelButton = screen.getByText('Cancel')
    expect(cancelButton).toBeTruthy()

    fireEvent.click(saveButton)
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })
})
