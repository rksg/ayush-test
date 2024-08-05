import { storiesOf } from '@storybook/react'
import { Form, Row } from 'antd'

import { TimeDropdown, TimeDropdownTypes } from '.'

storiesOf('TimeDropdown', module)
  .add('Daily - Without disabled time', () => <Form.Item style={{ width: '30%' }}>
    <Row align='middle' justify='center'>
      <TimeDropdown type={TimeDropdownTypes.Daily} name='daily' />
    </Row>
  </Form.Item>)
  .add('Daily - With disabled time', () => <Form.Item style={{ width: '30%' }}>
    <Row align='middle' justify='center' style={{ marginTop: '40px' }}>
      <p>10:00 - 15:00</p>
      <TimeDropdown type={TimeDropdownTypes.Daily}
        name='daily'
        disabledDateTime={
          { disabledStrictlyBefore: '10',
            disabledStrictlyAfter: '15' }
        }/>
    </Row>
    <Row align='middle' justify='center' style={{ marginTop: '40px' }}>
      <p>10:00~</p>
      <TimeDropdown type={TimeDropdownTypes.Daily}
        name='daily'
        disabledDateTime={
          { disabledStrictlyBefore: '10' }
        }/>
    </Row>
    <Row align='middle' justify='center' style={{ marginTop: '40px' }}>
      <p>~15:00</p>
      <TimeDropdown type={TimeDropdownTypes.Daily}
        name='daily'
        disabledDateTime={
          { disabledStrictlyAfter: '15' }
        }/>
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
