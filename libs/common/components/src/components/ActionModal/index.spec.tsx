import '@testing-library/jest-dom'

import { screen, fireEvent, waitForElementToBeRemoved, waitFor, within } from '@testing-library/react'
import userEvent                                                         from '@testing-library/user-event'
import { Modal }                                                         from 'antd'

import { showActionModal, convertToJSON, isErrorWithMessage } from '.'

jest.mock('@acx-ui/icons', ()=>({
  ExpandSquareUp: () => <div data-testid='expand-square-up'/>,
  ExpandSquareDown: () => <div data-testid='expand-square-down'/>
}), { virtual: true })

Object.assign(navigator, {
  clipboard: {
    writeText: () => { }
  }
})

describe('ActionModal', () => {
  let [onOk, onOk2, onCancel]: jest.Mock[] = []

  beforeEach(() => {
    jest.spyOn(navigator.clipboard, 'writeText');
    [onOk, onOk2, onCancel] = [jest.fn(), jest.fn(), jest.fn()]
  })
  afterEach(() => Modal.destroyAll())

  describe('type = info', () => {
    it('should open Info modal', async () => {
      showActionModal({
        type: 'info',
        title: 'This is a notification message',
        content: 'Some descriptions',
        okText: 'OK',
        onOk: onOk
      })

      await assertModalVisible({
        className: 'ant-modal-confirm-info',
        contents: [
          'This is a notification message',
          'Some descriptions'
        ]
      })
      await assertButtonClicked({
        label: 'OK',
        handler: onOk,
        shouldClose: true
      })
    })
  })

  describe('type = error', () => {
    it('should open Error modal', async () => {
      showActionModal({
        type: 'error',
        title: 'This is a error message',
        content: 'Some error descriptions',
        okText: 'OK',
        onOk: onOk
      })

      await assertModalVisible({
        className: 'ant-modal-confirm-error',
        contents: [
          'This is a error message',
          'Some error descriptions'
        ]
      })
      await assertButtonClicked({
        label: 'OK',
        handler: onOk,
        shouldClose: true
      })
    })

    describe('modal with details', () => {
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

        await assertModalVisible({
          className: 'ant-modal-confirm-error',
          contents: [
            'Something went wrong',
            'Some descriptions'
          ]
        })
      })

      it('handle ok to close', async () => {
        await assertButtonClicked({
          label: 'OK',
          shouldClose: true
        })
      })

      it('should collapse/expand details panel', async () => {
        const collapseBtn = await screen.findByRole('button', { name: 'Technical details' })

        expect(collapseBtn).toHaveAttribute('aria-expanded', 'false')
        expect(await screen.findByTestId('expand-square-down')).toBeVisible()
        fireEvent.click(collapseBtn)
        expect(await screen.findByTestId('expand-square-up')).toBeVisible()

        const pattern = new RegExp(mockErrorDetails.message, 'i')
        expect(await screen.findByText(pattern)).toBeVisible()
        expect(collapseBtn).toHaveAttribute('aria-expanded', 'true')
      })

      it('should copy details content', async () => {
        const collapseBtn = await screen.findByRole('button', { name: 'Technical details' })
        fireEvent.click(collapseBtn)

        const copyBtn = await screen.findByRole('button', { name: 'Copy to clipboard' })
        fireEvent.click(copyBtn)
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(detailsContent)
      })
    })
  })


  describe('type = confirm', () => {
    it('should open, confirm to close', async () => {
      showActionModal({
        type: 'confirm',
        title: 'This is a confirm message',
        content: 'Some confirm descriptions',
        okText: 'Confirm',
        cancelText: 'Cancel',
        onOk
      })

      await assertModalVisible({
        className: 'ant-modal-confirm-confirm',
        contents: [
          'This is a confirm message',
          'Some confirm descriptions'
        ]
      })
      await assertButtonClicked({
        label: 'Confirm',
        handler: onOk,
        shouldClose: true
      })
    })

    it('should open, cancel to close', async () => {
      showActionModal({
        type: 'confirm',
        title: 'This is a confirm message',
        content: 'Some confirm descriptions',
        okText: 'Confirm',
        cancelText: 'Cancel',
        onCancel
      })

      await assertModalVisible({
        className: 'ant-modal-confirm-confirm',
        contents: [
          'This is a confirm message',
          'Some confirm descriptions'
        ]
      })
      await assertButtonClicked({
        label: 'Cancel',
        handler: onCancel,
        shouldClose: true
      })
    })

    describe('custom modal', () => {
      it('should open Confirm delete modal', async () => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: 'Network',
            entityValue: 'Network 01'
          }
        })

        await assertModalVisible({
          className: 'ant-modal-confirm-confirm',
          contents: [
            'Delete "Network 01"?',
            'Are you sure you want to delete this Network?'
          ]
        })

        await assertButtonClicked({
          label: 'Delete Network',
          shouldClose: true
        })
      })

      it('should open Confirm bulk delete modal', async () => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: 'Networks',
            numOfEntities: 2
          }
        })

        await assertModalVisible({
          className: 'ant-modal-confirm-confirm',
          contents: [
            'Delete "2 Networks"?',
            'Are you sure you want to delete these Networks?'
          ]
        })
        await assertButtonClicked({
          label: 'Delete Networks',
          shouldClose: true
        })
      })


      it('should open Confirm delete modal with input validation', async () => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: 'Network',
            entityValue: 'Network 01',
            confirmationText: 'Delete'
          }
        })

        const inputLabel = 'Type the word "Delete" to confirm'
        await assertModalVisible({
          className: 'ant-modal-confirm-confirm',
          contents: [
            'Delete "Network 01"?',
            'Are you sure you want to delete this Network?',
            inputLabel
          ]
        })

        const okButton = await waitFor(async () => {
          const okButton = screen.queryByRole('button', { name: 'Delete Network' })
          expect(okButton).toHaveProperty('disabled', true)
          return okButton
        })

        const textbox = screen.getByRole('textbox', { name: `${inputLabel}:` })
        await userEvent.type(textbox, 'delete')
        await waitFor(() => expect(okButton).not.toHaveProperty('disabled', true))
        await assertButtonClicked({
          label: 'Delete Network',
          shouldClose: true
        })
      })
    })
  })

  describe('type = warning', () => {
    it('should open Warning modal', async () => {
      showActionModal({
        type: 'warning',
        title: 'This is a warning message',
        content: 'Some warning descriptions'
      })

      await assertModalVisible({
        className: 'ant-modal-confirm-warning',
        contents: [
          'This is a warning message',
          'Some warning descriptions'
        ]
      })
      await assertButtonClicked({
        label: 'OK',
        shouldClose: true
      })
    })

    describe('custom modal', () => {
      beforeEach(async () => {
        showActionModal({
          type: 'warning',
          width: 600,
          title: 'This is a warning message',
          content: 'Some warning descriptions',
          customContent: {
            action: 'CUSTOM_BUTTONS',
            buttons: [{
              text: 'Cancel',
              type: 'link',
              key: 'cancel'
            }, {
              text: 'Action 1',
              type: 'primary',
              key: 'action1',
              handler: onOk
            }, {
              text: 'Action 2',
              type: 'primary',
              key: 'action2',
              handler: onOk2,
              closeAfterAction: true
            }]
          }
        })

        await assertModalVisible({
          className: 'ant-modal-confirm-warning',
          contents: [
            'This is a warning message',
            'Some warning descriptions'
          ]
        })
      })

      it('handle cancel', async () => {
        await assertButtonClicked({
          label: 'Cancel',
          shouldClose: true
        })
      })

      it('handle primary', async () => {
        await assertButtonClicked({
          label: 'Action 1',
          handler: onOk,
          shouldClose: false
        })
      })

      it('handle primary with closeAfterAction = true', async () => {
        await assertButtonClicked({
          label: 'Action 2',
          handler: onOk2,
          shouldClose: true
        })
      })
    })
  })
})

async function assertModalVisible (props: {
  className: string
  contents: string[]
}) {
  const dialog = await waitFor(async () => {
    // eslint-disable-next-line testing-library/no-node-access
    const dialog: HTMLElement = document.querySelector(`.${props.className}`)!
    expect(dialog).toHaveClass(props.className)
    return dialog
  })
  const scope = within(dialog)
  for (const content of props.contents) {
    expect(await scope.findByText(content)).toBeVisible()
  }
}

async function assertButtonClicked (props: {
  label: string
  handler?: jest.Mock
  shouldClose?: boolean
}) {
  fireEvent.click(await screen.findByRole('button', { name: props.label }))

  if (props.shouldClose) {
    await waitForElementToBeRemoved(() => screen.queryByRole('dialog'))
  }

  if (props.handler) {
    expect(props.handler).toBeCalled()
  }
}
