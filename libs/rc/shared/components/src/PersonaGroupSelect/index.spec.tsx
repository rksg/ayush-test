import { screen } from '@testing-library/react'
import userEvent  from '@testing-library/user-event'
import { rest }   from 'msw'

import { NewPersonaBaseUrl }  from '@acx-ui/rc/utils'
import { Provider }           from '@acx-ui/store'
import { mockServer, render } from '@acx-ui/test-utils'

import { personaGroupList } from './__tests__/fixtures'

import { PersonaGroupSelect } from './index'


describe('Persona Group selector', () => {
  beforeEach( async () => {
    mockServer.use(
      rest.get(
        NewPersonaBaseUrl,
        (req, res, ctx) => res(ctx.json(personaGroupList))
      )
    )
  })

  it('should render Persona Group selector',async () => {
    render(<Provider><PersonaGroupSelect /></Provider>)

    const selector = await screen.findByRole('combobox')
    await userEvent.click(selector)
    await screen.findByText(personaGroupList.content[0].name)
  })

  it('should render Persona Group selector without assigned group',async () => {
    render(<Provider><PersonaGroupSelect filterProperty whiteList={['other-group-id']}/></Provider>)

    const selector = await screen.findByRole('combobox')
    await userEvent.click(selector)

    // this group has bound with Venue, so it would not show
    expect(screen.queryByText(personaGroupList.content[1].name)).not.toBeInTheDocument()
  })
})
