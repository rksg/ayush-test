import { useMemo } from 'react'

import { Form, Input } from 'antd'

export interface commonActionProps {
  actionType:string
}

export function CommonActionSettings (props:commonActionProps) {

  const { actionType } = props

  const nameInitialValue = useMemo(() => {
    return actionType + '-' + Math.floor(Math.random() * 10000000)
  }, [actionType])

  return <>
    <Form.Item
      name={'id'}
      noStyle
      children={<Input hidden />}
    />
    <Form.Item
      name={'name'}
      hidden={true}
      initialValue={nameInitialValue}
    >
      <Input />
    </Form.Item>
  </>
}
