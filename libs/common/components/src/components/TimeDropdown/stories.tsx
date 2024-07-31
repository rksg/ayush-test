import { storiesOf } from '@storybook/react'
import { Form, Row } from 'antd'

import { TimeDropdown, TimeDropdownTypes } from '.'

storiesOf('TimeDropdown', module)
  .add('Daily', () => <Form><Form.Item style={{ width: '30%' }}>
    <Row align='middle' justify='center'>
      <TimeDropdown type={TimeDropdownTypes.Daily} name='daily' />
    </Row>
  </Form.Item></Form>)
  .add('Weekly', () => <Form><Form.Item style={{ width: '30%' }}>
    <Row align='middle' justify='center'>
      <TimeDropdown type={TimeDropdownTypes.Weekly} name='weekly' />
    </Row>
  </Form.Item></Form>)
  .add('Monthly', () => <Form><Form.Item style={{ width: '30%' }}>
    <Row align='middle' justify='center'>
      <TimeDropdown type={TimeDropdownTypes.Monthly} name='monthly' />
    </Row>
  </Form.Item></Form>)

export {}
