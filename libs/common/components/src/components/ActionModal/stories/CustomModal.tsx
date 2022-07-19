import { showActionModal } from '..'

export function CustomActionModal () {
  return (
    <>
      Custom Action Modal:
      <button onClick={ConfirmDeleteModal}>Confirm Delete</button>
      <button onClick={ConfirmDeleteWithValidation}>Confirm Delete With Validation</button>
      <button onClick={ErrorDetailModal}>Error With Details</button>
      <button onClick={CustomFootersModal}>Warning With Custom Footers</button>
    </>
  )
}

const ConfirmDeleteModal = () => {
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
}

const ConfirmDeleteWithValidation = () => {
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
}

const mockErrorDetails = {
  headers: {
    normalizedNames: {},
    lazyUpdate: false
  },
  status: 500,
  statusText: 'Internal Server Error',
  url: 'http://test/api/viewmodel/xx/switch/xx',
  ok: false,
  name: 'HttpErrorResponse',
  message: 'Http failure response for URL: 500 Internal Server Error',
  error: 'org.json.JSONException: JSONArray[0] not found.'
}

const ErrorDetailModal = () => {
  showActionModal({
    type: 'error',
    title: 'Something went wrong',
    content: 'Some descriptions',
    customContent: {
      action: 'CUSTOM_FOOTERS',
      errorDetails: mockErrorDetails
    }
  })
}

const CustomFootersModal = () => {
  showActionModal({
    type: 'warning',
    width: 600,
    title: 'Server Configuration Conflict',
    content: 'Some descriptions',
    customContent: {
      action: 'CUSTOM_FOOTERS',
      footers: [{
        text: 'cancel',
        type: 'link',
        key: 'cancel',
        handler () {}
      }, {
        text: 'Use existing server configuration',
        type: 'primary',
        key: 'existing',
        handler () {}
      }, {
        text: 'Override the conflicting server configuration',
        type: 'primary',
        key: 'override',
        handler () {}
      }]
    }
  })
}