import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo }                        from '@acx-ui/rc/utils'
import { generatePath }                          from '@acx-ui/react-router-dom'
import { Provider }                              from '@acx-ui/store'
import { mockServer, render, screen, fireEvent } from '@acx-ui/test-utils'

import { NetworkForm } from './NetworkForm'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})

const successResponse = { requestId: 'request-id' }

describe('NetworkForm', () => {
  it('should create open network successfully', async () => {
    const params = { networkId: 'network-id', tenantId: 'tenant-id' }

    const { asFragment } = render(<Provider><NetworkForm /></Provider>, {
      route: { params },
      store: true
    })

    expect(asFragment()).toMatchSnapshot()

    const formUrl = generatePath(CommonUrlsInfo.addNetworkDeep.url, params)

    mockServer.use(
      rest.post(formUrl, (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json(successResponse)
        )
      })
    )

    const insertInput = screen.getByLabelText('Network Name')
    userEvent.type(
      screen.getByRole('textbox', { name: /Network Name/i }),
      'open network test'
    )

    fireEvent.change(insertInput, { target: { value: 'open network test' } })
    expect(insertInput).toHaveValue('open network test')

    fireEvent.click(screen.getByText('Open Network'))
    fireEvent.click(screen.getByText('Next'))

    await screen.findByRole('heading', { level: 3, name: 'Open Settings' })
    fireEvent.click(screen.getByText('Next'))

    await screen.findByRole('heading', { level: 3, name: 'Venues' })
    fireEvent.click(screen.getByText('Next'))

    await screen.findByRole('heading', { level: 3, name: 'Summary' })
    fireEvent.click(screen.getByText('Finish'))
  })
})