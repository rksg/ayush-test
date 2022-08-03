import '@testing-library/jest-dom'

import { screen, fireEvent } from '@testing-library/react'

import { showActionModal, convertToJSON } from '.'

jest.mock('@acx-ui/icons', ()=>({
  ExpandSquareUp: () => <div data-testid='expand-square-up'/>,
  ExpandSquareDown: () => <div data-testid='expand-square-down'/>
}), { virtual: true })

Object.assign(navigator, {
  clipboard: {
    writeText: () => { }
  }
})

describe('Action Modal', () => {
  let dialog
  const onOk = jest.fn()
  const onOk2 = jest.fn()
  const onCancel = jest.fn()
  jest.spyOn(navigator.clipboard, 'writeText')

  afterEach(async () => dialog.remove())

  it('should open Info modal', async () => {
    showActionModal({
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
    showActionModal({
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
      showActionModal({
        type: 'error',
        title: 'Something went wrong',
        content: 'Some descriptions',
        customContent: {
          action: 'SHOW_ERRORS',
          errorDetails: mockErrorDetails
        }
      })
      dialog = await screen.findByRole('dialog')
    })

    it('should open Error modal with details', async () => {
      await screen.findByText('Something went wrong')
      await screen.findByText('Some descriptions')

      const okButton = await screen.findByText('OK')
      fireEvent.click(okButton)
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
    showActionModal({
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
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: 'Network',
          entityValue: 'Network 01'
        },
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
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: 'Networks',
          numOfEntities: 2
        },
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
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: 'Network',
          entityValue: 'Network 01',
          confirmationText: 'Delete'
        },
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

  it('should open Warning modal', async () => {
    showActionModal({
      type: 'warning',
      title: 'This is a warning message',
      content: 'Some warning descriptions'
    })

    dialog = await screen.findByRole('dialog')
    const okButton = await screen.findByText('OK')
    await screen.findByText('This is a warning message')
    await screen.findByText('Some warning descriptions')
    expect(dialog).toHaveClass('ant-modal-confirm-warning')

    fireEvent.click(okButton)
    expect(onOk).toBeCalled()
  })

  it('should open Warning modal with custom buttons', async () => {
    showActionModal({
      type: 'warning',
      width: 600,
      title: 'This is a warning message',
      content: 'Some warning descriptions',
      customContent: {
        action: 'CUSTOM_BUTTONS',
        buttons: [{
          text: 'cancel',
          type: 'link',
          key: 'cancel',
          handler: onCancel
        }, {
          text: 'Action 1',
          type: 'primary',
          key: 'action1',
          handler: onOk
        }, {
          text: 'Action 2',
          type: 'primary',
          key: 'action2',
          handler: onOk2
        }]
      }
    })

    dialog = await screen.findByRole('dialog')
    const cancelButton = await screen.findByText('cancel')
    const actionButton1 = await screen.findByText('Action 1')
    const actionButton2 = await screen.findByText('Action 2')
    await screen.findByText('This is a warning message')
    await screen.findByText('Some warning descriptions')
    expect(dialog).toHaveClass('ant-modal-confirm-warning')

    fireEvent.click(cancelButton)
    fireEvent.click(actionButton1)
    fireEvent.click(actionButton2)
    expect(onCancel).toBeCalled()
    expect(onOk).toBeCalled()
    expect(onOk2).toBeCalled()
  })
})