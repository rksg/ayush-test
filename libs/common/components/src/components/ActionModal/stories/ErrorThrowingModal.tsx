import { showActionModal } from '..'

export function ErrorThrowingModal () {
  return (
    <>
      Error throwing modal handler:
      <button onClick={showErrorThrowingModal}>Show Modal</button>
    </>
  )
}

const showErrorThrowingModal = () => {
  showActionModal({
    type: 'warning',
    width: 600,
    title: 'Modal with handler throwing error',
    content: 'Some descriptions',
    customContent: {
      action: 'CUSTOM_BUTTONS',
      buttons: [
        { text: 'cancel', type: 'link', key: 'cancel' },
        { text: 'Throw error', type: 'primary', key: 'throw-error',
          handler () { throw new Error('Error Message from error object') }
        },
        { text: 'Throw unknown error', type: 'primary', key: 'throw-unknown-error',
          handler () { throw 'error' }
        }
      ]
    }
  })
}
