import { useReducer } from 'react'

import userEvent from '@testing-library/user-event'

import { render, renderHook, screen } from '@acx-ui/test-utils'

import { editDataWithRealms, newEmptyData }         from '../../__tests__/fixtures'
import IdentityProviderFormContext, { mainReducer } from '../IdentityProviderFormContext'

import NaiRealmDrawer from './NaiRealmDrawer'

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

jest.mock('./EapTable', () => ({
  ...jest.requireActual('./EapTable'),
  __esModule: true,
  default: () => <div data-testid={'eap-table'} children={'mocEapTable'} />
}))

describe('NaiRealmDrawer Component', () => {
  const mockSetVisible = jest.fn()

  beforeEach(() => {
    mockSetVisible.mockClear()
  })

  it('Render NaiRealmDrawer component with create mode successfully', async () => {
    const { renderElement } = renderInitState(
      <NaiRealmDrawer
        visible={true}
        setVisible={mockSetVisible}
        editIndex={-1} />
    )
    render(renderElement)

    const title = await screen.findByText('Add Realm')
    expect(title).toBeVisible()

    const nameInput = await screen.findByRole('textbox', { name: /Realm Name/ })
    expect(nameInput).toBeVisible()
    await userEvent.type(nameInput, 'realm 1')

    const encodeingInput = await screen.findByRole('combobox', { name: /Encoding/ })
    await userEvent.click(encodeingInput)
    await userEvent.click(await screen.findByText('UTF-8'))

    expect(screen.getByTestId('eap-table')).toBeInTheDocument()

    const addBtn = await screen.findByRole('button', { name: 'Add' })
    await userEvent.click(addBtn)
    expect(mockSetVisible).toBeCalledWith(false)
  })

  it('Render NaiRealmDrawer component with edit mode successfully', async () => {
    const { renderElement } = renderInitState(
      (<NaiRealmDrawer
        visible={true}
        setVisible={mockSetVisible}
        editIndex={0} />
      ), editDataWithRealms
    )
    render(renderElement)

    const title = await screen.findByText('Edit Realm')
    expect(title).toBeVisible()

    const nameInput = await screen.findByRole('textbox', { name: /Realm Name/ })
    expect(nameInput).toBeVisible()
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'r2')
    await screen.findByText('The Realm Name already exists')

    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'r2-1')


    const saveBtn = await screen.findByRole('button', { name: 'Save' })
    await userEvent.click(saveBtn)
    expect(mockSetVisible).toBeCalledWith(false)
  })
})