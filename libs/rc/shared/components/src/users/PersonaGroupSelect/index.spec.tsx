import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { ConfigTemplateContext, IdentityTemplateUrlsInfo, PersonaUrls } from '@acx-ui/rc/utils'
import { Provider }                                                     from '@acx-ui/store'
import { mockServer, render, screen }                                   from '@acx-ui/test-utils'

import { personaGroupList, personaGroupTemplateList } from './__tests__/fixtures'

import { PersonaGroupSelect } from './index'


describe('Persona Group selector', () => {
  beforeEach( async () => {
    mockServer.use(
      rest.post(
        PersonaUrls.searchPersonaGroupList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(personaGroupList))
      ),
      rest.post(
        IdentityTemplateUrlsInfo.queryIdentityGroupTemplates.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(personaGroupTemplateList))
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

  it('should render Persona Group selector with template result',async () => {
    render(<Provider>
      <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
        <PersonaGroupSelect/>
      </ConfigTemplateContext.Provider>
    </Provider>)

    const selector = await screen.findByRole('combobox')
    await userEvent.click(selector)

    await screen.findByText(personaGroupTemplateList.content[0].name)
  })
})
