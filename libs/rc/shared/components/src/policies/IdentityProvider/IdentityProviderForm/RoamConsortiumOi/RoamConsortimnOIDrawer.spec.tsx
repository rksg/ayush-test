import { useReducer } from 'react'

import userEvent from '@testing-library/user-event'

import { render, renderHook, screen } from '@acx-ui/test-utils'

import { editDataWithROIs, newEmptyData }           from '../../__tests__/fixtures'
import IdentityProviderFormContext, { mainReducer } from '../IdentityProviderFormContext'

import RoamConsortiumOiDrawer from './RoamConsortiumOiDrawer'


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

describe('RoamConsortiumOIDrawer Component', () => {
  const mockSetVisible = jest.fn()

  beforeEach(() => {
    mockSetVisible.mockClear()
  })

  it('Render RoamConsortiumOIDrawer component with create mode successfully', async () => {
    const { renderElement } = renderInitState(
      <RoamConsortiumOiDrawer
        visible={true}
        setVisible={mockSetVisible}
        editIndex={-1} />
    )
    render(renderElement)

    const title = await screen.findByText('Add Roaming Consortium OI')
    expect(title).toBeVisible()

    const nameInput = await screen.findByRole('textbox', { name: /OI name/ })
    expect(nameInput).toBeVisible()

    let oidInputs = await screen.findAllByTestId('oid')
    expect(oidInputs.length).toBe(3)
    await userEvent.type(nameInput, 'test_OI')

    const combobox = await screen.findByRole('combobox')
    await userEvent.click(combobox)
    await userEvent.click(await screen.findByText('5 hex'))

    oidInputs = await screen.findAllByTestId('oid')
    expect(oidInputs.length).toBe(5)

    const addBtn = await screen.findByRole('button', { name: 'Add' })
    await userEvent.click(addBtn)

    await screen.findByText('Please enter 5 valid hex')

    for (let i=0; i<oidInputs.length; i++) {
      await userEvent.type( oidInputs[i], '11')
    }

    await userEvent.click(addBtn)
    expect(mockSetVisible).toBeCalledWith(false)
  })

  it('Render RoamConsortiumOIDrawer component with edit mode successfully', async () => {
    const { renderElement } = renderInitState(
      (<RoamConsortiumOiDrawer
        visible={true}
        setVisible={mockSetVisible}
        editIndex={0} />), editDataWithROIs
    )
    render(renderElement)

    const title = await screen.findByText('Edit Roaming Consortium OI')
    expect(title).toBeVisible()

    const nameInput = await screen.findByRole('textbox', { name: /OI name/ })
    expect(nameInput).toBeVisible()
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'roi2')

    let oidInputs = await screen.findAllByTestId('oid')
    expect(oidInputs.length).toBe(5)

    await screen.findByText('The Name already exists')

    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'roi123')

    const saveBtn = await screen.findByRole('button', { name: 'Save' })
    await userEvent.click(saveBtn)
    expect(mockSetVisible).toBeCalledWith(false)
  })
})
