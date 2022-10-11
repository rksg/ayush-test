import '@testing-library/jest-dom'

import { Modal } from 'antd'


import { render, screen, fireEvent } from '@acx-ui/test-utils'

describe('ResendInviteModal', () => {
  it('should render Resend Invitaion successfully', async () => {
    const handleCancel = jest.fn()
    const handleConfirm = jest.fn()

    render(<Modal
      okText='Resend Invitation'
      onCancel={handleCancel}
      onOk={handleConfirm}
      visible={true}
    />)
    const resendButton = screen.getByRole('button', { name: /Resend Invitation/i })
    const cancelButton = screen.getByRole('button', { name: /cancel/i })

    fireEvent.click(resendButton)
    expect(handleConfirm).toBeCalled()

    fireEvent.click(cancelButton)
    expect(handleCancel).toBeCalled()

  })
})

