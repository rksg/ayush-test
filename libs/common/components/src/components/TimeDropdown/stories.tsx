import { storiesOf } from '@storybook/react'
import { Form, Row } from 'antd'

import { DayTimeDropdown, DayAndTimeDropdownTypes, TimeDropdown } from '.'

storiesOf('TimeDropdown', module)
  .add('Daily - Without disabled time', () => <Form.Item style={{ width: '30%' }}>
    <Row align='middle' justify='center'>
      <TimeDropdown name='daily' spanLength={24} />
    </Row>
  </Form.Item>)
  .add('Daily - With disabled time', () => <Form.Item style={{ width: '30%' }}>
    <Row align='middle' justify='center' style={{ marginTop: '40px' }}>
      <p>10:00 - 15:00</p>
      <TimeDropdown name='daily'
        spanLength={24}
        disabledDateTime={
          { disabledStrictlyBefore: 10,
            disabledStrictlyAfter: 15 }
        }/>

    </Row>
    <Row align='middle' justify='center' style={{ marginTop: '40px' }}>
      <p>10:00~</p>
      <TimeDropdown name='daily'
        spanLength={24}
        disabledDateTime={
          { disabledStrictlyBefore: 10 }
        }/>
    </Row>
    <Row align='middle' justify='center' style={{ marginTop: '40px' }}>
      <p>~15:00</p>
      <TimeDropdown name='daily'
        spanLength={24}
        disabledDateTime={
          { disabledStrictlyAfter: 15 }
        }/>
    </Row>
  </Form.Item>)
  .add('Weekly', () => <Form><Form.Item style={{ width: '30%' }}>
    <Row align='middle' justify='center'>
      <DayTimeDropdown type={DayAndTimeDropdownTypes.Weekly}
        name='weekly'
        spanLength={11}
      />
    </Row>
  </Form.Item></Form>)
  .add('Monthly', () => <Form><Form.Item style={{ width: '30%' }}>
    <Row align='middle' justify='center'>
      <DayTimeDropdown type={DayAndTimeDropdownTypes.Monthly}
        name='monthly'
        spanLength={11}
      />
    </Row>
  </Form.Item></Form>)

export {}
