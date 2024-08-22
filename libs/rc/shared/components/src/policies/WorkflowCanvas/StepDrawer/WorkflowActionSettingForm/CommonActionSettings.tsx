import { useMemo } from 'react'

import { Form, Input }  from 'antd'
import { v4 as uuidv4 } from 'uuid'

import { ActionType } from '@acx-ui/rc/utils'

export interface commonActionProps {
  actionType:ActionType
}

export function CommonActionSettings (props:commonActionProps) {

  const { actionType } = props

  const nameInitialValue = useMemo(() => {
    return actionType + '-' + uuidv4()
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
