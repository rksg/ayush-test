import '@testing-library/jest-dom'

import { screen, fireEvent } from '@testing-library/react'

import { showModal, convertToJSON } from '.'

jest.mock('@acx-ui/icons', ()=>({
  ExpandSquareUp: () => <div data-testid='expand-square-up'/>,
  ExpandSquareDown: () => <div data-testid='expand-square-down'/>
}), { virtual: true })

Object.assign(navigator, {
  clipboard: {
    writeText: () => { }
  }
})

describe('Modal', () => {
  let dialog
  const onOk = jest.fn()
  const onCancel = jest.fn()
  jest.spyOn(navigator.clipboard, 'writeText')

  afterEach(async () => dialog.remove())

  it('should open Info modal', async () => {
    showModal({
      type: 'info',
      title: 'This is a notification message',
      content: 'Some descriptions',
      okText: 'OK',
      onOk: onOk
    })

    dialog = await screen.findByRole('dialog')
    const button = await screen.findByText('OK')
    await screen.findByText('This is a notification message')
    await screen.findByText('Some descriptions')
    expect(dialog).toHaveClass('ant-modal-confirm-info')

    fireEvent.click(button)
    expect(onOk).toBeCalled()
  })

  it('should open Error modal', async () => {
    showModal({
      type: 'error',
      title: 'This is a error message',
      content: 'Some error descriptions',
      okText: 'OK',
      onOk: onOk
    })

    dialog = await screen.findByRole('dialog')
    const button = await screen.findByText('OK')
    await screen.findByText('This is a error message')
    await screen.findByText('Some error descriptions')
    expect(dialog).toHaveClass('ant-modal-confirm-error')

    fireEvent.click(button)
    expect(onOk).toBeCalled()
  })

  describe('Error modal with details', () => {
    const mockErrorDetails = {
      message: 'Some error details'
    }
    const detailsContent = convertToJSON(mockErrorDetails)

    beforeEach(async () => {
      showModal({
        type: 'error',
        action: 'SHOW_ERRORS',
        title: 'Something went wrong',
        content: 'Some descriptions',
        errorDetails: mockErrorDetails
      })
      dialog = await screen.findByRole('dialog')
    })

    it('should open Error modal with details', async () => {
      await screen.findByText('Something went wrong')
      await screen.findByText('Some descriptions')
    })

    it('should collapse/expand details panel', async () => {
      const collapseBtn = await screen.findByRole('button', { expanded: false })
      await screen.findByTestId('expand-square-down')

      await fireEvent.click(collapseBtn)
      await screen.findByTestId('expand-square-up')
      const details = await screen.findByText(/Some error details/i)
      expect(collapseBtn).toHaveAttribute('aria-expanded', 'true')
      expect(details).toBeVisible()
    })

    it('should copy details content', async () => {
      const collapseBtn = await screen.findByRole('button', { expanded: false })
      await fireEvent.click(collapseBtn)

      const copyBtn = await screen.findByText('Copy to clipboard')
      await fireEvent.click(copyBtn)
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(detailsContent)
    })
  })

  it('should open Confirm modal', async () => {
    showModal({
      type: 'confirm',
      title: 'This is a confirm message',
      content: 'Some confirm descriptions',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: onOk,
      onCancel: onCancel
    })

    dialog = await screen.findByRole('dialog')
    const okButton = await screen.findByText('Confirm')
    const cancelButton = await screen.findByText('Cancel')
    await screen.findByText('This is a confirm message')
    await screen.findByText('Some confirm descriptions')
    expect(dialog).toHaveClass('ant-modal-confirm-confirm')

    fireEvent.click(okButton)
    fireEvent.click(cancelButton)
    expect(onOk).toBeCalled()
    expect(onCancel).toBeCalled()
  })
	
  describe('Confirm delete modal', () => {
    it('should open Confirm delete modal', async () => {
      showModal({
        type: 'confirm',
        action: 'DELETE',
        entityName: 'Network',
        entityValue: 'Network 01',
        onOk () {},
        onCancel () {}
      })
	
      dialog = await screen.findByRole('dialog')
      const okButton = await screen.findByText('Delete Network')
      const cancelButton = await screen.findByText('Cancel')
      await screen.findByText('Delete "Network 01"?')
      await screen.findByText('Are you sure you want to delete this Network?')
      expect(dialog).toHaveClass('ant-modal-confirm-confirm')
	
      fireEvent.click(okButton)
      fireEvent.click(cancelButton)
      expect(onOk).toBeCalled()
      expect(onCancel).toBeCalled()
    })

    it('should open Confirm bulk delete modal', async () => {
      showModal({
        type: 'confirm',
        action: 'DELETE',
        entityName: 'Networks',
        multiple: true,
        numOfEntities: 2,
        onOk () {},
        onCancel () {}
      })
	
      dialog = await screen.findByRole('dialog')
      const okButton = await screen.findByText('Delete Networks')
      const cancelButton = await screen.findByText('Cancel')
      await screen.findByText('Delete "2 Networks"?')
      await screen.findByText('Are you sure you want to delete these Networks?')
      expect(dialog).toHaveClass('ant-modal-confirm-confirm')
	
      fireEvent.click(okButton)
      fireEvent.click(cancelButton)
      expect(onOk).toBeCalled()
      expect(onCancel).toBeCalled()
    })

    it('should open Confirm delete modal with input validation', async () => {
      showModal({
        type: 'confirm',
        action: 'DELETE',
        entityName: 'Network',
        entityValue: 'Network 01',
        confirmationText: 'Delete',
        onOk () {},
        onCancel () {}
      })
	
      dialog = await screen.findByRole('dialog')
      const confirmInput = screen.getByLabelText('Type the word "Delete" to confirm')
      const okButton = await screen.findByRole('button', { name: 'Delete Network' })
      await screen.findByText('Delete "Network 01"?')
      await screen.findByText('Are you sure you want to delete this Network?')
      await screen.findByText('Type the word "Delete" to confirm')

      expect(dialog).toHaveClass('ant-modal-confirm-confirm')
      expect(okButton).toHaveProperty('disabled', true)

      await fireEvent.change(confirmInput, { target: { value: 'delete' } })
      expect(confirmInput).toHaveValue('delete')
      fireEvent.click(okButton)
      expect(onOk).toBeCalled()
    })
  })
})