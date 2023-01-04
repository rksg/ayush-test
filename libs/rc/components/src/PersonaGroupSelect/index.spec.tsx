import { screen } from '@testing-library/react'
import userEvent  from '@testing-library/user-event'
import { rest }   from 'msw'

import { PersonaGroupSelect }                        from '@acx-ui/rc/components'
import { NewTableResult, PersonaGroup, PersonaUrls } from '@acx-ui/rc/utils'
import { Provider }                                  from '@acx-ui/store'
import { mockServer, render }                        from '@acx-ui/test-utils'


const mockPersonaGroupList: NewTableResult<PersonaGroup> = {
  totalPages: 1,
  sort: [],
  page: 0,
  totalElements: 1,
  size: 10,
  content: [
    {
      id: 'persona-group-id-1',
      name: 'persona-group-name-1'
    }
  ]
}


describe('Persona Group selector', () => {
  beforeEach( async () => {
    mockServer.use(
      rest.get(
        PersonaUrls.getPersonaGroupList.url,
        (req, res, ctx) => res(ctx.json(mockPersonaGroupList))
      )
    )
  })

  it('should render Persona Group selector',async () => {
    render(<Provider><PersonaGroupSelect /></Provider>)

    const selector = await screen.findByRole('combobox')
    await userEvent.click(selector)
    await screen.findByTitle(mockPersonaGroupList.content[0].name)
  })
})
