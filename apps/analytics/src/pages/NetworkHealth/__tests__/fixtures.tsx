import { useState } from 'react'

import { Form, Input } from 'antd'
import flat            from 'flat'

import { createStepsFormContext }             from '@acx-ui/components'
import { Provider }                           from '@acx-ui/store'
import { render, screen, within, renderHook } from '@acx-ui/test-utils'

import {
  Band,
  ClientType,
  TestType,
  NetworkPaths
} from '../types'
import { NetworkHealthFormDto } from '../types'

export const serviceGuardSpecNames = {
  allServiceGuardSpecs: [
    { name: 'Spec 1' },
    { name: 'Spec 2' },
    { name: 'Spec 3' },
    { name: 'Spec 4' }
  ]
}

export const fetchServiceGuardSpec = {
  serviceGuardSpec: {
    id: 'spec-id',
    clientType: ClientType.VirtualWirelessClient,
    type: TestType.OnDemand,
    name: 'Test Name',
    configs: [{
      authenticationMethod: 'WPA3_PERSONAL',
      dnsServer: '10.10.10.10',
      pingAddress: '10.10.10.10',
      radio: Band.Band6,
      tracerouteAddress: '10.10.10.10',
      wlanName: 'WLAN Name',
      wlanPassword: '12345',
      wlanUsername: 'user',
      networkPaths: {
        networkNodes: [[
          { type: 'zone', name: 'VENUE' },
          { type: 'apMac', list: ['00:00:00:00:00:00'] }
        ]] as NetworkPaths
      }
    }]
  }
}

const Context = createStepsFormContext()

export const withinField = () => within(screen.getByTestId('field'))

export const renderForm = (
  field: JSX.Element,
  options: {
    initialValues?: Partial<Omit<NetworkHealthFormDto, 'configs'>> & {
      configs?: Partial<NetworkHealthFormDto['configs'][0]>[]
    },
    editMode?: boolean,
    valuesToUpdate?: Partial<Omit<NetworkHealthFormDto, 'configs'>> & {
      configs?: Partial<NetworkHealthFormDto['configs'][0]>[]
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
      {/* TODO: might be a source of bug for the StepsFormNew when previous page rely on useWatch to update another value */}
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

export const renderFormHook = () => {
  const { result: { current: form } } = renderHook(() => {
    const [form] = Form.useForm()
    return form
  })
  return { form, formRender: render(<Form form={form} data-testid='form' />) }
}
