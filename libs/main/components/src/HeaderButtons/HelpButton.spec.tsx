import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }               from '@acx-ui/feature-toggle'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import HelpButton                    from './HelpButton'
import { getMappingURL, getDocsURL } from './HelpButton/HelpPage'

const params = { tenantId: 'a27e3eb0bd164e01ae731da8d976d3b1' }

describe('HelpButton', () => {
  it('should render HelpButton correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(getMappingURL(), (_, res, ctx) =>
        res(ctx.json({
          '/t/*/dashboard': 'GUID-A338E06B-7FD9-4492-B1B2-D43841D704F1.html'
        }))
      ),
      rest.get(getDocsURL()+':docID', (_, res, ctx) =>
        res(ctx.text('<p class="shortdesc">Dashboard test</p>'))
      ))
    render(<Provider>
      <HelpButton/>
    </Provider>, { route: { params } })
    const helpBtn = screen.getByRole('button')
    await userEvent.click(helpBtn)
    await userEvent.click(screen.getByRole('menuitem', { name: 'Firewall ACL Inputs' }))
    await userEvent.click(helpBtn)
    await userEvent.click(screen.getByRole('menuitem', { name: 'Help for this page' }))
  })

  it('should render HelpButton disabled correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    mockServer.use(
      rest.get(getMappingURL(), (_, res, ctx) =>
        res(ctx.json({
          't/*/dashboard': 'GUID-A338E06B-7FD9-4492-B1B2-D43841D704F1.html'
        }))
      ),
      rest.get(getDocsURL()+':docID', (_, res, ctx) =>
        res(ctx.text('<p class="shortdesc">Dashboard test</p>'))
      ))
    render(<Provider>
      <HelpButton/>
    </Provider>, { route: { params } })
    expect(screen.getByRole('button')).toBeVisible()
  })
})
