import { useState } from 'react'

import { Form, Input } from 'antd'
import flat            from 'flat'

import { Provider } from '@acx-ui/store'

import { EnhancedRecommendation } from '../services'

export const renderForm = (
  field: JSX.Element,
  options: {
    initialValues?: Partial<Omit<EnhancedRecommendation, 'configs'>> & {
      configs?: Partial<EnhancedRecommendation['configs'][0]>[]
    },
    editMode?: boolean,
    valuesToUpdate?: Partial<Omit<EnhancedRecommendation, 'configs'>> & {
      configs?: Partial<EnhancedRecommendation['configs'][0]>[]
    },
    params?: Record<string, string>
  } = {}
) => {
  const Wrapper = (props: React.PropsWithChildren) => {
    const [form] = Form.useForm()
    const [ok, setOk] = useState(false)
    const {
      initialValues = {},
      editMode = false,
      valuesToUpdate = {}
    } = options

    const onFinish = async () => { setOk(true) }
    const onSetValue = () => {
      setOk(false)
      form.setFieldsValue(valuesToUpdate)
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
      {Object.keys(flat({ ...initialValues, ...valuesToUpdate })).map(key => <Form.Item
        key={key}
        name={key.split('.')}
        children={<Input />}
      />)}
      <button type='button' onClick={onSetValue}>Update</button>
      <button type='submit'>Submit</button>
    </Form>
    const value = { form, editMode, initialValues, current: 1 }

    return <Provider>
      <Context.Provider {...{ value, children }} />
    </Provider>
  }

  const route = options.params ? { params: options.params } : undefined
  return render(field, { wrapper: Wrapper, route })
}
