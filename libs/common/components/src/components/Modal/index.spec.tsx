import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

import { Modal } from '.'

describe('Modal', () => {

  it('should match snapshot', async () => {
    const handleCancel = jest.fn()
    const handleConfirm = jest.fn()
    const footer = [
      <button key='cancel' onClick={handleCancel}>
        Cancel
      </button>,
      <button key='confirm' onClick={handleConfirm}>
        Confirm
      </button>
    ]
    const { asFragment } = render(<Modal
      title='Basic Modal'
      closable={false}
      footer={footer}
    />)
    expect(asFragment()).toMatchSnapshot()
  })
})
