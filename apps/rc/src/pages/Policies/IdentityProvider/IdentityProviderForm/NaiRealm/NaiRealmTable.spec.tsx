import { useReducer } from 'react'

import userEvent from '@testing-library/user-event'

import { render, renderHook, screen } from '@acx-ui/test-utils'

import { editDataWithRealms, newEmptyData }         from '../../__tests__/fixtures'
import IdentityProviderFormContext, { mainReducer } from '../IdentityProviderFormContext'

import NaiRealmTable from './NaiRealmTable'

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

describe('NaiRealmTable Component', () => {
  it('Render NaiRealmTable component successfully', async () => {
    const { renderElement } = renderInitState(
      <NaiRealmTable />
    )
    render(renderElement)

    // Table header
    expect(await screen.findByText('Realm Name')).toBeVisible()
    expect(await screen.findByText('Encoding')).toBeVisible()
    expect(await screen.findByText('EAP Method')).toBeVisible()

    // Add Realm link
    expect(await screen.findByText('Add Realm')).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Add Realm' }))

    // open drawer
    expect(await screen.findByText('Add another Realm')).toBeInTheDocument()
  })

  it('Render NaiRealmTable component with data successfully', async () => {
    const { renderElement } = renderInitState(
      (<NaiRealmTable />), editDataWithRealms
    )
    render(renderElement)

    // delete realm1 data
    const realm1 = await screen.findByText('r1')
    expect(realm1).toBeVisible()
    expect(await screen.findByText('RFC-4282')).toBeVisible()
    expect(await screen.findByText('2')).toBeVisible()
    await userEvent.click(realm1)

    let editButton = screen.getByText('Edit')
    expect(editButton).toBeInTheDocument()
    let deleteButton = screen.getByText('Delete')
    expect(deleteButton).toBeInTheDocument()
    await userEvent.click(deleteButton)
    expect(editButton).not.toBeInTheDocument()

    // edit realm2 data
    const realm2 = await screen.findByText('r2')
    expect(realm2).toBeVisible()
    expect(await screen.findByText('UTF-8')).toBeVisible()
    expect(await screen.findByText('2')).toBeVisible()
    await userEvent.click(realm2)

    editButton = screen.getByText('Edit')
    expect(editButton).toBeInTheDocument()
    deleteButton = screen.getByText('Delete')
    expect(deleteButton).toBeInTheDocument()
    await userEvent.click(editButton)
    expect(editButton).not.toBeInTheDocument()

    expect(await screen.findByText('Edit Realm')).toBeInTheDocument()
  })
})