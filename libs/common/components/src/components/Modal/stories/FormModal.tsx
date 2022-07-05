import { Button } from '../../Button';
import { Modal } from '..'

export function FormModal () {
  const footer = [
    <Button key="cancel">
      Cancel
    </Button>,
    <Button key="add" type="primary">
      Add
    </Button>
  ]
  const content = <>
    <p>Some contents...</p>
    <p>Some contents...</p>
    <p>Some contents...</p>
  </>

  return (
    <Modal title="Form Modal" visible={true} footer={footer} mask={false}>
      {content}
    </Modal>
  )  
}
