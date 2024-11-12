import { useReducer } from 'react'

import userEvent from '@testing-library/user-event'

import { render, renderHook, screen } from '@acx-ui/test-utils'

import { editDataWithROIs, newEmptyData }           from '../../__tests__/fixtures'
import IdentityProviderFormContext, { mainReducer } from '../IdentityProviderFormContext'

import RoamConsortiumOiTable from './RoamConsortiumOiTable'


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

describe('RoamConsortiumOiTable Component', () => {
  it('Render RoamConsortiumOITable component successfully', async () => {
    const { renderElement } = renderInitState(
      <RoamConsortiumOiTable />
    )
    render(renderElement)

    expect(await screen.findByText('Name')).toBeVisible()
    expect(await screen.findByText('Organization Id')).toBeVisible()

    expect(await screen.findByText('Add OI')).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: 'Add OI' }))

    expect(await screen.findByText('Add Roaming Consortium OI')).toBeInTheDocument()
  })

  it('Render RoamConsortiumOITable component with data successfully', async () => {
    const { renderElement } = renderInitState(
      (<RoamConsortiumOiTable />), editDataWithROIs
    )
    render(renderElement)

    // delete roi1 data
    const oi1 = await screen.findByText('roi1')
    expect(oi1).toBeVisible()
    expect(await screen.findByText('1a2b3c4d5e')).toBeVisible()
    await userEvent.click(oi1)
    let editButton = screen.getByText('Edit')
    expect(editButton).toBeInTheDocument()
    let deleteButton = screen.getByText('Delete')
    expect(deleteButton).toBeInTheDocument()
    await userEvent.click(deleteButton)
    expect(editButton).not.toBeInTheDocument()

    // edit roi2 data
    const oi2 = await screen.findByText('roi2')
    expect(oi2).toBeVisible()
    expect(await screen.findByText('ffffff')).toBeVisible()
    await userEvent.click(oi2)
    editButton = screen.getByText('Edit')
    expect(editButton).toBeInTheDocument()
    deleteButton = screen.getByText('Delete')
    expect(deleteButton).toBeInTheDocument()
    await userEvent.click(editButton)
    expect(editButton).not.toBeInTheDocument()
    expect(await screen.findByText('Edit Roaming Consortium OI')).toBeInTheDocument()
  })
})