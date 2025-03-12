import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { AupAction }                  from '@acx-ui/rc/utils'
import { WorkflowUrls }               from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { AupPreview } from './AupPreview'


const getFileUrl = jest.fn()

describe('AUP Preview', () => {

  beforeEach(() => {
    mockServer.use(rest.get(WorkflowUrls.getFile.url, (req, res, ctx) => {
      getFileUrl()
      return res(ctx.json({ url: '7c1a1cb9-548c-446e-b4dc-07d498759d9b-text.docs' }))
    }))
  })

  afterEach(() => mockServer.resetHandlers())


  afterAll(() => mockServer.close())


  it('should render AUP preview for file option', async () => {
    const expectedTitle = 'Test Title'
    const expectedHtml = 'Test message html'
    render(<Provider><AupPreview
      data={{
        title: expectedTitle,
        messageHtml: expectedHtml,
        useAupFile: true,
        aupFileLocation: '7c1a1cb9-548c-446e-b4dc-07d498759d9b-text.docs'
      } as AupAction}
    /></Provider>)

    expect(screen.getByText(expectedTitle)).toBeInTheDocument()
    expect(screen.getByText(expectedHtml)).toBeInTheDocument()
    expect(await screen.findByRole('checkbox')).not.toBeChecked()
  })

  it('should render AUP preview for aup text', async () => {
    const expectedTitle = 'Test Title'
    const expectedHtml = 'Test message html'
    render(<Provider><AupPreview
      data={{
        title: expectedTitle,
        messageHtml: expectedHtml,
        useAupFile: false,
        aupPlainText: 'all is well'
      } as AupAction}
    /></Provider>)

    expect(screen.getByText(expectedTitle)).toBeInTheDocument()
    expect(screen.getByText(expectedHtml)).toBeInTheDocument()
    expect(await screen.findByRole('checkbox')).not.toBeChecked()
    expect(screen.getByText('Terms & Conditions')).toBeInTheDocument()
    const terms = screen.getByText('Terms & Conditions')
    userEvent.click(terms)
    expect(await screen.findByText('all is well')).toBeVisible()
    expect(await screen.findByText('Close')).toBeVisible()
    const closeButton = screen.getByText('Close')
    userEvent.click(closeButton)
  })
})
