import '@testing-library/jest-dom'

import { Col, Form, Input, Row } from 'antd'

import { render, screen, fireEvent, waitFor } from '@acx-ui/test-utils'

import { Modal, ModalType } from '../Modal'
import { StepsForm }        from '../StepsForm'

describe('Modal', () => {
  const handleCancel = jest.fn()
  const handleConfirm = jest.fn()
  const content = <>
    <p>Some contents...</p>
    <p>Some contents...</p>
    <p>Some contents...</p>
  </>
  const footer = [
    <button key='cancel' onClick={handleCancel}>
      CustomFooterCancel
    </button>,
    <button key='confirm' onClick={handleConfirm}>
      CustomFooterConfirm
    </button>
  ]
  it('should render custom footer', async () => {
    render(<Modal
      title='Basic Modal'
      closable={false}
      footer={footer}
      visible={true}
      children={content}
      data-testid={'basic-modal'}
    />)
    const modalComponent = screen.getByTestId('basic-modal')
    expect(modalComponent).toMatchSnapshot()
  })

  it('should render without custom footer', async () => {
    render(<Modal
      title='Long Modal Title'
      okText='Add'
      onCancel={handleCancel}
      onOk={handleConfirm}
      subTitle='Subtitle Description'
      visible={true}
      children={content}
    />)
    const closeButton = screen.getByRole('button', { name: /close/i })
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    const addButton = screen.getByRole('button', { name: /add/i })

    await screen.findByText('Long Modal Title')
    await screen.findByText('Subtitle Description')

    fireEvent.click(closeButton)
    expect(handleCancel).toBeCalled()

    fireEvent.click(cancelButton)
    expect(handleCancel).toBeCalled()

    fireEvent.click(addButton)
    expect(handleConfirm).toBeCalled()
  })

  it('should render with StepsForm', () => {
    render(
      <Modal
        type={ModalType.ModalStepsForm}
        title={'modal title'}
        visible={true}
      >
        <StepsForm>
          <StepsForm.StepForm>
            <Row gutter={20}>
              <Col span={8}>
                <Form.Item name='field' label='Field'>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </StepsForm.StepForm>
        </StepsForm>
      </Modal>
    )
    expect(screen.getByText('modal title')).toBeVisible()
    expect(screen.getByText('Field')).toBeVisible()
  })

  it('should render multi steps', async () => {
    render(
      <Modal
        type={ModalType.ModalStepsForm}
        title={'modal title'}
        visible={true}
      >
        <StepsForm>
          <StepsForm.StepForm title='Step 1'>
            <Row gutter={20}>
              <Col span={10}>
                <StepsForm.Title children='Step 1' />
                <Form.Item name='field1' label='Field 1'>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </StepsForm.StepForm>
          <StepsForm.StepForm title='Step 2'>
            <Row gutter={20}>
              <Col span={10}>
                <StepsForm.Title children='Step 2' />
                <Form.Item name='field2' label='Field 2'>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </StepsForm.StepForm>
        </StepsForm>
      </Modal>
    )
    expect(screen.getByText('modal title')).toBeVisible()
    screen.getAllByText('Step 1').map(comp=>expect(comp).toBeVisible())
    expect(screen.getByText('Field 1')).toBeVisible()

    fireEvent.click(await screen.findByText('Next'))

    await waitFor(async () => {
      screen.getAllByText('Step 2').map(comp=>expect(comp).toBeVisible())
      expect(screen.getByText('Field 2')).toBeVisible()
    })
  })
})
