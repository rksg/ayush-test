/* eslint-disable max-len */
import { useState } from 'react'

import { Form, Input } from 'antd'
import flat            from 'flat'

import { createStepsFormContext } from '@acx-ui/components'
import { Provider }               from '@acx-ui/store'
import { render, screen, within } from '@acx-ui/test-utils'

import {
  EnhancedRecommendation
} from '../services'

const Context = createStepsFormContext()

export const withinField = () => within(screen.getByTestId('field'))

export const renderForm = (
  field: JSX.Element,
  options: {
    initialValues?: Partial<Pick<EnhancedRecommendation, 'status' | 'sliceValue' | 'updatedAt'>>
    params?: Record<string, string>
  } = {}
) => {
  const Wrapper = (props: React.PropsWithChildren) => {
    const [form] = Form.useForm()
    const [ok, setOk] = useState(false)
    const {
      initialValues = {}
    } = options
    const editMode = false
    const gotoStep = () => {}

    const onFinish = async () => { setOk(true) }
    const onSetValue = () => {
      setOk(false)
    }
    const onValuesChange = () => setOk(false)
    const formProps = { form, initialValues, onFinish, onValuesChange }

    // eslint-disable-next-line testing-library/no-node-access
    const child = props.children
    const children = <Form {...formProps} data-testid='form'>
      <div data-testid='field'>{child}</div>
      {ok ? <h1>Valid</h1> : null}
      {ok ? <div data-testid='form-values'>{JSON.stringify(form.getFieldsValue(true))}</div> : null}
      {/* TODO: might be a source of bug for the StepsForm when previous page rely on useWatch to update another value */}
      {/* It is required to have fields render in order for useWatch to trigger */}
      {Object.keys(flat({ ...initialValues })).map(key => <Form.Item
        key={key}
        name={key.split('.')}
        children={<Input />}
      />)}
      <button type='button' onClick={onSetValue}>Update</button>
      <button type='submit'>Submit</button>
    </Form>
    const value = { form, editMode, gotoStep, initialValues, current: 1 }

    return <Provider>
      <Context.Provider {...{ value, children }} />
    </Provider>
  }

  const route = options.params ? { params: options.params } : undefined
  return render(field, { wrapper: Wrapper, route })
}
