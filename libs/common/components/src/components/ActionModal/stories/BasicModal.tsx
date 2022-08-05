import { showActionModal } from '..'

export function BasicActionModal () {
  return (
    <>
      Basic Action Modal:
      <button onClick={InfoModal}>Info</button>
      <button onClick={ErrorModal}>Error</button>
      <button onClick={ConfirmModal}>Confirm</button>
      <button onClick={WarningModal}>Warning</button>
    </>
  )
}

const InfoModal = () => {
  showActionModal({
    type: 'info',
    title: 'Please note that...',
    content: (
      <div>
        <p>Some descriptions</p>
      </div>
    ),
    onOk () {}
  })
}

const ConfirmModal = () => {
  showActionModal({
    type: 'confirm',
    title: 'Please confirm that...',
    content: 'Some descriptions',
    okText: 'Confirm',
    onOk () {},
    onCancel () {}
  })
}

const ErrorModal = () => {
  showActionModal({
    type: 'error',
    title: 'Something went wrong',
    content: 'Some descriptions'
  })
}

const WarningModal = () => {
  showActionModal({
    type: 'warning',
    title: 'Conflict warning...',
    content: 'Ruckus Cloud needs you to be online, you appear to be offline.'
  })
}