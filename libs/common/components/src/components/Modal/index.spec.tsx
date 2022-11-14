import '@testing-library/jest-dom'

import { render, screen, fireEvent } from '@acx-ui/test-utils'

import { Modal } from '.'

jest.mock('@acx-ui/icons', ()=> ({
  CloseSymbol: () => <div data-testid='close-symbol'/>
}), { virtual: true })

describe('Modal', () => {
  const handleCancel = jest.fn()
  const handleConfirm = jest.fn()
  const content = <>
    <p>Some contents...</p>
    <p>Some contents...</p>
    <p>Some contents...</p>
  </>
  const footer = [
    <button key='cancel' onClick={handleCancel}>
      CustomFooterCancel
    </button>,
    <button key='confirm' onClick={handleConfirm}>
      CustomFooterConfirm
    </button>
  ]
  it('should render custom footer', async () => {
    render(<Modal
      title='Basic Modal'
      closable={false}
      footer={footer}
      visible={true}
      children={content}
      data-testid={'basic-modal'}
    />)
    const modalComponent = screen.getByTestId('basic-modal')
    expect(modalComponent).toMatchSnapshot()
  })

  it('should render without custom footer', async () => {
    render(<Modal
      title='Long Modal Title'
      okText='Add'
      onCancel={handleCancel}
      onOk={handleConfirm}
      subTitle='Subtitle Description'
      visible={true}
      children={content}
    />)
    const closeButton = screen.getByRole('button', { name: /close/i })
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    const addButton = screen.getByRole('button', { name: /add/i })

    await screen.findByText('Long Modal Title')
    await screen.findByText('Subtitle Description')

    fireEvent.click(closeButton)
    expect(handleCancel).toBeCalled()

    fireEvent.click(cancelButton)
    expect(handleCancel).toBeCalled()

    fireEvent.click(addButton)
    expect(handleConfirm).toBeCalled()
  })
})
