import '@testing-library/jest-dom'

import { Modal } from 'antd'


import { render, screen, fireEvent } from '@acx-ui/test-utils'

describe('StartSubscriptionModal', () => {
  it('should render Start Subscription successfully', async () => {
    const handleCancel = jest.fn()
    const handleOk = jest.fn()

    render(<Modal
      okText='Start Subscription'
      onCancel={handleCancel}
      onOk={handleOk}
      visible={true}
    />)
    const startButton = screen.getByRole('button', { name: /Start Subscription/i })
    const cancelButton = screen.getByRole('button', { name: /cancel/i })

    fireEvent.click(startButton)
    expect(handleOk).toBeCalled()

    fireEvent.click(cancelButton)
    expect(handleCancel).toBeCalled()
  })
})
