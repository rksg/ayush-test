import { storiesOf } from '@storybook/react'
import { Form, Row } from 'antd'

import { TimeDropdown, TimeDropdownTypes } from '.'

storiesOf('TimeDropdown', module)
  .add('Daily', () => <Form.Item style={{ width: '30%' }}>
    <Row align='middle' justify='center'>
      <TimeDropdown type={TimeDropdownTypes.Daily} name='daily' />
    </Row>
  </Form.Item>)
  .add('Weekly', () => <Form.Item style={{ width: '30%' }}>
    <Row align='middle' justify='center'>
      <TimeDropdown type={TimeDropdownTypes.Weekly} name='weekly' />
    </Row>
  </Form.Item>)
  .add('Monthly', () => <Form.Item style={{ width: '30%' }}>
    <Row align='middle' justify='center'>
      <TimeDropdown type={TimeDropdownTypes.Monthly} name='monthly' />
    </Row>
  </Form.Item>)

export {}
