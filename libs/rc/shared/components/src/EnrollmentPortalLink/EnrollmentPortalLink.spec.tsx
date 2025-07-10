import userEvent from '@testing-library/user-event'

import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { EnrollmentPortalLink } from '.'


jest.mock('@acx-ui/feature-toggle', () => ({
  ...jest.requireActual('@acx-ui/feature-toggle'),
  useIsSplitOn: jest.fn()
}))

describe('Enrollment Portal Link', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should render correctly when workFlowQrCodeGenerate is false', async () => {
    (useIsSplitOn as jest.Mock).mockReturnValue(false)

    const copyFn = jest.fn()
    Object.assign(navigator, {
      clipboard: {
        writeText: copyFn
      }
    })

    render(
      <Provider>
        <EnrollmentPortalLink url='test-url' />
      </Provider>
    )

    expect(await screen.findByRole('link', { name: 'test-url' })).toBeInTheDocument()
    await userEvent.click(await screen.findByRole('button'))
    expect(await screen.findByRole('tooltip', { name: /URL Copied/ })).toBeInTheDocument()
    expect(copyFn).toHaveBeenCalledWith('test-url')
  })

  it('should render correctly when workFlowQrCodeGenerate is true', async () => {
    (useIsSplitOn as jest.Mock).mockReturnValue(true)

    const copyFn = jest.fn()
    Object.assign(navigator, {
      clipboard: {
        writeText: copyFn
      }
    })

    render(
      <Provider>
        <EnrollmentPortalLink url='test-url' />
      </Provider>
    )

    const buttons = await screen.findAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(3) // Copy, Open, QR
    await userEvent.click(buttons[0]) // Copy button
    expect(await screen.findByRole('tooltip', { name: /URL Copied/ })).toBeInTheDocument()
    expect(copyFn).toHaveBeenCalledWith('test-url')
  })
})
