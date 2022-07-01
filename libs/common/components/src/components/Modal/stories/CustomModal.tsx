import { showModal } from '..'

export function CustomModal () {
  return (
    <>
      Custom Modal:
      <button onClick={ConfirmDeleteNotification}>Confirm Delete</button>
      <button onClick={ConfirmDeleteWithValidation}>Confirm Delete With Validation</button>
      <button onClick={ErrorDetailNotification}>Error with details</button>
    </>
  )
}

const ConfirmDeleteNotification = () => {
  showModal({
    type: 'confirm',
    action: 'DELETE',
    entityName: 'Network',
    entityValue: 'Network 01',
    onOk () {},
    onCancel () {}
  })
}

const ConfirmDeleteWithValidation = () => {
  showModal({
    type: 'confirm',
    action: 'DELETE',
    entityName: 'Network',
    entityValue: 'Network 01',
    confirmationText: 'Delete',
    onOk () {},
    onCancel () {}
  })
}

const mockErrorDetails = {
  headers: {
    normalizedNames: {},
    lazyUpdate: null
  },
  status: 500,
  statusText: 'Internal Server Error',
  url: 'http://test/api/viewmodel/xx/switch/xx',
  ok: false,
  name: 'HttpErrorResponse',
  message: 'Http failure response for URL: 500 Internal Server Error',
  error: 'org.json.JSONException: JSONArray[0] not found.'
}

const ErrorDetailNotification = () => {
  showModal({
    type: 'error',
    action: 'SHOW_ERRORS',
    title: 'Something went wrong',
    content: 'Some descriptions',
    errorDetails: mockErrorDetails
  })
}
