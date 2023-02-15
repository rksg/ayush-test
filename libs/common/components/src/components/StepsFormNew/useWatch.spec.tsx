import { useEffect } from 'react'

import userEvent       from '@testing-library/user-event'
import { Form, Input } from 'antd'

import { render, screen } from '@acx-ui/test-utils'

import { useWatch } from './useWatch'

describe('useWatch', () => {
  const Component = ({ callback, value }: { value?: string, callback: jest.Mock }) => {
    const [form] = Form.useForm()
    const name = 'field'
    const result = useWatch(name, form)
    const initialValues = value ? { [name]: value } : undefined

    useEffect(() => callback(result), [callback, result])

    return <Form {...{ form, initialValues }}>
      <Form.Item name={name} children={<Input />} />
    </Form>
  }

  it('returns watch value', async () => {
    const callback = jest.fn()
    render(<Component {...{ callback }} />)

    expect(callback).toHaveBeenCalledWith(undefined)

    const input = await screen.findByRole('textbox')
    const value = 'value'
    await userEvent.type(input, value)

    expect(input).toHaveValue(value)
    expect(callback).toHaveBeenCalledWith(value)
  })
})
