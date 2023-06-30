import '@testing-library/jest-dom'

import { render, screen, fireEvent } from '@acx-ui/test-utils'

import { StartSubscriptionModal } from '.'

describe('StartSubscriptionModal', () => {
  it('should render successfully for active', async () => {
    render(<StartSubscriptionModal
      setStartDate={jest.fn()}
      isActive={true}
      visible={true}
      setVisible={jest.fn()}
    />)
    const startButton = screen.getByRole('button', { name: 'Start Subscription' })
    const cancelButton = screen.getByRole('button', { name: 'Cancel' })

    expect(screen.getByText('This will stop the Trial Mode and start utilizing paid')).toBeVisible()
    expect(startButton).toBeEnabled()
    expect(cancelButton).toBeEnabled()
  })
  it('should render successfully for inactive', async () => {
    render(<StartSubscriptionModal
      setStartDate={jest.fn()}
      isActive={false}
      visible={true}
      setVisible={jest.fn()}
    />)
    const startButton = screen.getByRole('button', { name: 'Start Subscription' })
    const cancelButton = screen.getByRole('button', { name: 'Cancel' })

    expect(screen.getByText('This will start utilizing paid Subscription.')).toBeVisible()
    expect(startButton).toBeEnabled()
    expect(cancelButton).toBeEnabled()
  })
  it('should handle subscription start', async () => {
    const mockedCloseDialog = jest.fn()
    const mockedSetStartDate = jest.fn()
    render(<StartSubscriptionModal
      setStartDate={mockedSetStartDate}
      isActive={false}
      visible={true}
      setVisible={mockedCloseDialog}
    />)
    const startButton = screen.getByRole('button', { name: 'Start Subscription' })
    fireEvent.click(startButton)

    expect(mockedSetStartDate).toHaveBeenCalledTimes(1)
    expect(mockedCloseDialog).toHaveBeenLastCalledWith(false)
  })
  it('cancel should close dialog', async () => {
    const mockedCloseDialog = jest.fn()
    const mockedSetStartDate = jest.fn()
    render(<StartSubscriptionModal
      setStartDate={mockedSetStartDate}
      isActive={false}
      visible={true}
      setVisible={mockedCloseDialog}
    />)
    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    fireEvent.click(cancelButton)

    expect(mockedSetStartDate).not.toHaveBeenCalled()
    expect(mockedCloseDialog).toHaveBeenLastCalledWith(false)
  })
})
