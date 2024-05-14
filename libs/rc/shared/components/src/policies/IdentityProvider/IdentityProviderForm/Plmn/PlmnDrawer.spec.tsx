import { useReducer } from 'react'

import userEvent from '@testing-library/user-event'

import { render, renderHook, screen } from '@acx-ui/test-utils'

import { editDataWithPlmns, newEmptyData }          from '../../__tests__/fixtures'
import IdentityProviderFormContext, { mainReducer } from '../IdentityProviderFormContext'

import PlmnDrawer from './PlmnDrawer'



const renderInitState = (children: JSX.Element, initState=newEmptyData) => {
  const { result } = renderHook(() => useReducer(mainReducer, initState ))
  const [state, dispatch] = result.current

  const renderElement = <IdentityProviderFormContext.Provider value={{ state, dispatch }}>
    {children}
  </IdentityProviderFormContext.Provider>

  return {
    state, dispatch, renderElement
  }
}

describe('PlmnDrawer Component', () => {
  const mockSetVisible = jest.fn()

  beforeEach(() => {
    mockSetVisible.mockClear()
  })

  it('Render PlmnDrawer component with create mode successfully', async () => {
    const { renderElement } = renderInitState(
      <PlmnDrawer
        visible={true}
        setVisible={mockSetVisible}
        editIndex={-1} />
    )
    render(renderElement)

    const title = await screen.findByText('Add PLMN')
    expect(title).toBeVisible()

    const mccInput = await screen.findByRole('textbox', { name: /Mobile Country Code / })
    expect(mccInput).toBeVisible()
    await userEvent.type(mccInput, '22')
    expect(await screen.findByText('This field must be exactly 3 digits long')).toBeVisible()
    await userEvent.type(mccInput, '2')

    const mncInput = await screen.findByRole('textbox', { name: /Mobile Network Code / })
    expect(mncInput).toBeVisible()
    await userEvent.type(mncInput, '0')
    expect(await screen.findByText('This field must be 2 or 3 digits long')).toBeVisible()
    await userEvent.type(mncInput, '077')

    const addBtn = await screen.findByRole('button', { name: 'Add' })
    await userEvent.click(addBtn)
    expect(mockSetVisible).toBeCalledWith(false)
  })

  it('Render PlmnDrawer component with edit mode successfully', async () => {
    const { renderElement } = renderInitState(
      (<PlmnDrawer
        visible={true}
        setVisible={mockSetVisible}
        editIndex={0} />), editDataWithPlmns
    )
    render(renderElement)

    const title = await screen.findByText('Edit PLMN')
    expect(title).toBeVisible()

    const mccInput = await screen.findByRole('textbox', { name: /Mobile Country Code / })
    expect(mccInput).toHaveValue('001')

    const mncInput = await screen.findByRole('textbox', { name: /Mobile Network Code / })
    expect(mncInput).toHaveValue('005')

    await userEvent.clear(mncInput)
    await userEvent.type(mncInput, '123')

    const saveBtn = await screen.findByRole('button', { name: 'Save' })
    await userEvent.click(saveBtn)
    expect(mockSetVisible).toBeCalledWith(false)
  })
})
