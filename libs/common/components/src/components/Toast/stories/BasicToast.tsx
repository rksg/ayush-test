import { showToast } from '..'

export function BasicToast () {
  return (
    <>
    Basic Toast:
      <button onClick={infoToast}>Info</button>
      <button onClick={successToast}>Success</button>
      <button onClick={errorToast}>Error</button>
    </>
  )
}

const infoToast = () => {
  showToast({
    type: 'info',
    content: 'Action in progress...'
  })
}

const successToast = () => {
  showToast({
    type: 'success',
    content: 'This is a success message',
    link: {
      onClick: () => {alert('Success detail')}
    }
  })
}

const errorToast = () => {
  showToast({
    type: 'error',
    content: 'This is an error message',
    link: {
      text: 'Details',
      onClick: () => {alert('Error detail')}
    }
  })
}
