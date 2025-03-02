import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { PersonaUrls, PropertyUrlsInfo }       from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { mockedUnitLinkedIdentity, mockPersonaList, mockPropertyUnitList, replacePagination } from '../../../__tests__/fixtures'

import { PropertyUnitIdentityDrawer } from './PropertyUnitIdentityDrawer'


const unitId = 'c59f537f-2257-4fa6-934b-69f787e686fb'
const groupId = 'persona-group-id-1'
const venueId = 'd09fc32049ae4f25adbd5d0d334fc283'
const personaIds = { content: [
  {
    unitId: 'c59f537f-2257-4fa6-934b-69f787e686fb', personaType: 'LINKED',
    personaId: '05fd5780-28cc-48ca-b119-103992bad806', links: []
  },
  {
    unitId: '8d72d387-ba1f-4955-91fe-1a1e94512cf1', personaType: 'LINKED',
    personaId: '175099a5-5f85-4edd-b4e0-c34c14f77234', links: []
  },
  {
    unitId: '7b3a00dc-fcb0-47a3-a0f3-2e62e2f12703', personaType: 'LINKED',
    personaId: '6b18d46e-1d5b-45d0-81ab-4cfe9aa1793a', links: []
  }
] }
const personaListQuery = jest.fn()
const addUnitIdentity = jest.fn()
const getPropertyIdentities = jest.fn()
const getPropertyUnitList = jest.fn()

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
        }),
      rest.post(PersonaUrls.getPropertyIdentities.url,
        (req, res, ctx) => {
          getPropertyIdentities()
          return res(ctx.json(personaIds))
        }),
      rest.post(
        PropertyUrlsInfo.getPropertyUnitList.url,
        (req, res, ctx) => {
          getPropertyUnitList()
          return res(ctx.json(mockPropertyUnitList))
        }
      )
    )
  })

  it('Render unit identity drawer', async () => {
    render(<Provider><PropertyUnitIdentityDrawer visible={true}
      onClose={() => {}}
      groupId={groupId}
      venueId={venueId}
      unitId={unitId}
      identityCount={0} /></Provider>)
    await waitFor(() => (expect(getPropertyIdentities).toBeCalled()))
    await waitFor(() => (expect(getPropertyUnitList).toBeCalled()))
    await waitFor(() => (expect(personaListQuery).toBeCalled()))
    expect(await screen.findByText('Add Identity Association')).toBeInTheDocument()
    expect(await screen.findByRole('cell', { name: 'persona-name-1' })).toBeInTheDocument()
    expect(await screen.findByRole('cell', { name: 'persona1@mail.com' })).toBeInTheDocument()
    expect(await screen.findByRole('cell', { name: 'Active' })).toBeInTheDocument()
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
      unitId={unitId}
      identityCount={0} /></Provider>)
    await waitFor(() => (expect(getPropertyIdentities).toBeCalled()))
    await waitFor(() => (expect(getPropertyUnitList).toBeCalled()))
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