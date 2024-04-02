import userEvent             from '@testing-library/user-event'
import { Modal as AntModal } from 'antd'

import { render, screen } from '@acx-ui/test-utils'

import RevokeForm from './RevokeForm'

describe('RevokeForm', () => {
  it('should validate the form correctly', async () => {
    const modal = AntModal.confirm({})
    render(<RevokeForm modal={modal} onFinish={jest.fn()} />)

    const reasonInput = screen.getByLabelText('Type the reason to revoke')
    expect(reasonInput).toBeInTheDocument()
    await userEvent.type(reasonInput, 'r')
    await userEvent.type(reasonInput, '{backspace}')
    await userEvent.tab()
    expect(reasonInput).toHaveValue('')
    expect(await screen.findByText('Reason is required')).toBeVisible()
  })
})
