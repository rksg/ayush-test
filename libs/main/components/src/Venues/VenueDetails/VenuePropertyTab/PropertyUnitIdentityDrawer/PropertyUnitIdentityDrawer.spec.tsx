import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { PersonaUrls, PropertyUrlsInfo }       from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { mockedUnitLinkedIdentity, mockPersonaList, replacePagination } from '../../../__tests__/fixtures'

import { PropertyUnitIdentityDrawer } from './PropertyUnitIdentityDrawer'


const unitId = 'c59f537f-2257-4fa6-934b-69f787e686fb'
const groupId = 'persona-group-id-1'
const venueId = 'd09fc32049ae4f25adbd5d0d334fc283'
const personaListQuery = jest.fn()
const addUnitIdentity = jest.fn()

describe('Property Unit Identity Drawer', () => {

  beforeEach(() => {
    return mockServer.use(
      rest.post(replacePagination(PersonaUrls.searchPersonaList.url),
        (req, res, ctx) => {
          personaListQuery()
          return res(ctx.json(mockPersonaList))
        }),
      rest.put(PropertyUrlsInfo.addUnitLinkedIdentity.url,
        (req, res, ctx) => {
          addUnitIdentity()
          return res(ctx.json(mockedUnitLinkedIdentity))
        })
    )
  })

  it('Render unit identity drawer', async () => {
    render(<Provider><PropertyUnitIdentityDrawer visible={true}
      onClose={() => {}}
      groupId={groupId}
      venueId={venueId}
      unitId={unitId} /></Provider>)
    await waitFor(() => (expect(personaListQuery).toBeCalled()))
    expect(await screen.findByText('Add Identity Association')).toBeInTheDocument()
    expect(await screen.findByRole('cell', { name: 'persona-name-1' })).toBeInTheDocument()
    expect(await screen.findByRole('cell', { name: 'persona1@mail.com' })).toBeInTheDocument()
    expect(await screen.findByRole('cell', { name: 'Active' })).toBeInTheDocument()
    expect(await screen.findByRole('cell', { name: '12' })).toBeInTheDocument()
    expect(await screen.findByRole('cell', { name: 'persona-name-2' })).toBeInTheDocument()
    expect(await screen.findByRole('cell', { name: 'persona2@mail.com' })).toBeInTheDocument()
    expect(await screen.findByRole('cell', { name: 'Blocked' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Add' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('Add multiple identities to unit from identity drawer', async () => {
    render(<Provider><PropertyUnitIdentityDrawer visible={true}
      onClose={() => { }}
      groupId={groupId}
      venueId={venueId}
      unitId={unitId} /></Provider>)
    await waitFor(() => (expect(personaListQuery).toBeCalled()))
    const persona1Row = await screen.findByRole('cell', { name: 'persona-name-1' })
    const persona2Row = await screen.findByRole('cell', { name: 'persona-name-2' })
    const addButton = await screen.findByRole('button', { name: 'Add' })
    await userEvent.click(persona1Row)
    await userEvent.click(persona2Row)
    await userEvent.click(addButton)
    await waitFor(() => (expect(addUnitIdentity).toBeCalledTimes(2)))
  })

})