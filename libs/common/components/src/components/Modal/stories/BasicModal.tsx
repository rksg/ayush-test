import { showModal } from '..'

export function BasicModal () {
  return (
    <>
      Basic Modal:
      <button onClick={InfoNotification}>Info</button>
      <button onClick={ConfirmNotification}>Confirm</button>
      <button onClick={ErrorNotification}>Error</button>
    </>
  )
}

const InfoNotification = () => {
  showModal({
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

const ConfirmNotification = () => {
  showModal({
    type: 'confirm',
    title: 'Please confirm that...',
    content: 'Some descriptions',
    okText: 'Confirm',
    onOk () {},
    onCancel () {}
  })
}

const ErrorNotification = () => {
  showModal({
    type: 'error',
    title: 'Something went wrong',
    content: 'Some descriptions'
  })
}