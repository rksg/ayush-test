import { useReducer } from 'react'

import userEvent from '@testing-library/user-event'

import { render, renderHook, screen } from '@acx-ui/test-utils'

import { editDataWithPlmns, newEmptyData }          from '../../__tests__/fixtures'
import IdentityProviderFormContext, { mainReducer } from '../IdentityProviderFormContext'

import PlmnTable from './PlmnTable'


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

describe('PlmnTable Component', () => {
  it('Render PlmnTable component successfully', async () => {
    const { renderElement } = renderInitState(
      <PlmnTable />
    )
    render(renderElement)

    expect(await screen.findByText('Mobile Country Code (MCC)')).toBeVisible()
    expect(await screen.findByText('Mobile Network Code (MNC)')).toBeVisible()

    expect(await screen.findByText('Add PLMN')).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Add PLMN' }))

    expect(await screen.findByText('Add another PLMN')).toBeInTheDocument()
  })

  it('Render PlmnTable component with data successfully', async () => {
    const { renderElement } = renderInitState(
      (<PlmnTable />), editDataWithPlmns
    )
    render(renderElement)

    // delete plmn1 data
    const plam1 = await screen.findByText('001')
    expect(plam1).toBeVisible()
    expect(await screen.findByText('005')).toBeVisible()
    await userEvent.click(plam1)
    let editButton = screen.getByText('Edit')
    expect(editButton).toBeInTheDocument()
    let deleteButton = screen.getByText('Delete')
    expect(deleteButton).toBeInTheDocument()
    await userEvent.click(deleteButton)
    expect(editButton).not.toBeInTheDocument()

    // edit plmn2 data
    const plmn2 = await screen.findByText('002')
    expect(plmn2).toBeVisible()
    expect(await screen.findByText('01')).toBeVisible()
    await userEvent.click(plmn2)
    editButton = screen.getByText('Edit')
    expect(editButton).toBeInTheDocument()
    deleteButton = screen.getByText('Delete')
    expect(deleteButton).toBeInTheDocument()
    await userEvent.click(editButton)
    expect(editButton).not.toBeInTheDocument()
    expect(await screen.findByText('Edit PLMN')).toBeInTheDocument()
  })
})