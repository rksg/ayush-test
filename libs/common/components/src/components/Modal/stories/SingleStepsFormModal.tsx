import { useState } from 'react'

import { Form, Input, Row, Col } from 'antd'

import { Button }           from '../../Button'
import { Modal, ModalType } from '../../Modal'
import { StepsForm }        from '../../StepsForm'
import { showToast }        from '../../Toast'

function wait (ms: number) { return new Promise(resolve => setTimeout(resolve, ms)) }

export function SingleStepsFormModal () {
  const [visible, setVisible] = useState(false)

  return (
    <>
      <Button onClick={() => setVisible(true)}>
        SingleStepsFormModal
      </Button>
      <Modal
        title={'title'}
        visible={visible}
        type={ModalType.ModalStepsForm}
      >
        <StepsForm
          onCancel={() => {
            showToast({ type: 'info', content: 'Cancel' })
            setVisible(false)
          }}
          onFinish={async () => {
            await wait(1000) // mimic external service call
            showToast({ type: 'success', content: 'Submitted' }) // show notification to indicate submission successful
            setVisible(false)
          }}
          buttonLabel={{ submit: 'Add' }}
        >
          <StepsForm.StepForm>
            <Row gutter={20}>
              <Col span={8}>
                <Form.Item name='field1' label='Field 1'>
                  <Input />
                </Form.Item>
                <Form.Item name='field2' label='Field 2'>
                  <Input />
                </Form.Item>
                <Form.Item name='field3' label='Field 3'>
                  <Input />
                </Form.Item>
                <Form.Item name='field4' label='Field 4'>
                  <Input />
                </Form.Item>
                <Form.Item name='field5' label='Field 5'>
                  <Input />
                </Form.Item>
                <Form.Item name='field6' label='Field 6'>
                  <Input />
                </Form.Item>
                <Form.Item name='field7' label='Field 7'>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </StepsForm.StepForm>
        </StepsForm>
      </Modal>
    </>
  )
}
