import React, { useContext, useReducer } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent          from '@testing-library/user-event'

import HspContext, { HspContextType, HspActionTypes } from './HspContext'
import { hspReducer }                                 from './HspReducer'

const initialState: HspContextType = { isHsp: false }

const TestComponent: React.FC = () => {
  const { state, dispatch } = useContext(HspContext)

  const toggleHsp = () => {
    dispatch({
      type: HspActionTypes.IS_HSP,
      payload: { isHsp: !state.isHsp }
    })
  }

  const toggleNonHsp = () => {
    dispatch({
      type: 'anything' as HspActionTypes,
      payload: { isHsp: !state.isHsp }
    })
  }

  return (
    <div>
      <p>{`isHsp: ${state.isHsp}`}</p>
      <button onClick={toggleHsp}>Toggle isHsp</button>
      <button onClick={toggleNonHsp}>Toggle isHsp</button>
    </div>
  )
}

describe('HspContext Tests', () => {

  const TestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(hspReducer, initialState)
    return (
      <HspContext.Provider value={{ state, dispatch }}>
        {children}
      </HspContext.Provider>
    )
  }

  it('should render with initial state from context', () => {
    render(
      <TestProvider>
        <TestComponent />
      </TestProvider>
    )
    expect(screen.getByText('isHsp: false')).toBeInTheDocument()
  })

  it('should toggle isHsp state when button is clicked', async () => {
    render(
      <TestProvider>
        <TestComponent />
      </TestProvider>
    )

    const button = screen.getAllByText('Toggle isHsp')[0]
    await userEvent.click(button)
    expect(screen.getByText('isHsp: true')).toBeInTheDocument()

    await userEvent.click(button)
    expect(await screen.findByText('isHsp: false')).toBeInTheDocument()

    const button1 = screen.getAllByText('Toggle isHsp')[1]
    await userEvent.click(button1)
    expect(await screen.findByText('isHsp: false')).toBeInTheDocument()
  })
})
