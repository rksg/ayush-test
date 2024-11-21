import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { configTemplateApi }                                              from '@acx-ui/rc/services'
import { ConfigTemplateDriftSet, ConfigTemplateUrlsInfo }                 from '@acx-ui/rc/utils'
import { Provider, store }                                                from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { mockedDriftResponse }               from './__tests__/fixtures'
import { DriftInstance, DriftInstanceProps } from './DriftInstance'


jest.mock('./DriftComparisonSet', () => ({
  DriftComparisonSet: ({ diffName }: ConfigTemplateDriftSet) => <div>{diffName}</div>
}))

describe('DriftInstance Component', () => {
  const mockUpdateSelection = jest.fn()
  const defaultProps: DriftInstanceProps = {
    templateId: '12345',
    instanceName: 'Test Instance',
    instanceId: '12345',
    updateSelection: mockUpdateSelection
  }

  beforeEach(() => {
    jest.clearAllMocks()

    store.dispatch(configTemplateApi.util.resetApiState())

    mockServer.use(
      rest.get(
        ConfigTemplateUrlsInfo.getDriftReport.url,
        (req, res, ctx) => res(ctx.json(mockedDriftResponse))
      )
    )
  })

  it('renders the checkbox with the correct initial checked state', async () => {
    const { rerender } = render(<Provider><DriftInstance {...defaultProps} /></Provider>)

    expect(await screen.findByRole('checkbox')).not.toBeChecked()

    rerender(<Provider><DriftInstance {...defaultProps} selected={true} /></Provider>)
    await waitFor(() => expect(screen.getByRole('checkbox')).toBeChecked())
  })

  it('calls updateSelection when checkbox is clicked', async () => {
    render(<Provider><DriftInstance {...defaultProps} /></Provider>)

    const checkbox = await screen.findByRole('checkbox')
    await userEvent.click(checkbox)

    expect(mockUpdateSelection).toHaveBeenCalledWith('12345', true)

    // Uncheck the checkbox
    await userEvent.click(checkbox)
    expect(mockUpdateSelection).toHaveBeenCalledWith('12345', false)
  })

  it('triggers data loading when collapse is expanded', async () => {
    render(<Provider><DriftInstance {...defaultProps} /></Provider>)

    await userEvent.click(await screen.findByText(new RegExp(defaultProps.instanceName)))

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(await screen.findByText(mockedDriftResponse[0].diffName)).toBeInTheDocument()
  })

  it('disables the checkbox when disabled prop is true', () => {
    render(<Provider><DriftInstance {...defaultProps} disalbed={true} /></Provider>)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeDisabled()
  })

  it('should not disable the checkbox when disabled and selected prop are true', () => {
    render(<Provider><DriftInstance {...defaultProps} selected={true} disalbed={true} /></Provider>)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeDisabled()
  })
})
