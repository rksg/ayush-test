import { Col, Form, Input, Row } from 'antd'

import { fireEvent, render, screen, waitFor } from '@acx-ui/test-utils'

import { StepsForm } from '../StepsForm'

import { ModalStepsForm } from '.'

describe('ModalStepsForm', () => {
  it('should render', () => {
    render(
      <ModalStepsForm
        title={'modal title'}
        visible={true}
        data-testid={'modal-steps-form'}
      >
        <StepsForm.StepForm>
          <Row gutter={20}>
            <Col span={8}>
              <Form.Item name='field' label='Field'>
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </StepsForm.StepForm>
      </ModalStepsForm>
    )
    expect(screen.getByText('modal title')).toBeVisible()
    expect(screen.getByText('Field')).toBeVisible()
  })
  it('should render multi steps', async () => {
    render(
      <ModalStepsForm
        title={'modal title'}
        visible={true}
        data-testid={'modal-steps-form'}
      >
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
      </ModalStepsForm>
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
