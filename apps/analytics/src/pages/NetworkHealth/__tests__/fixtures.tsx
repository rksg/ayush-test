
import { useState } from 'react'

import { Form, Input } from 'antd'

import { createStepsFormContext } from '@acx-ui/components'
import { Provider }               from '@acx-ui/store'
import { render, screen, within } from '@acx-ui/test-utils'

import { stages }        from '../contents'
import {
  Band,
  ClientType,
  TestType,
  NetworkPaths,
  NetworkHealthFormDto
} from '../types'

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

export const fetchServiceGuardTest = {
  serviceGuardTest: {
    id: 1,
    createdAt: '2023-02-03T11:00:00.000Z',
    previousTest: null,
    spec: {
      id: 'specId',
      name: 'name',
      type: 'on-demand',
      clientType: 'virtual-client',
      apsCount: 0
    },
    config: {
      authenticationMethod: 'WPA2_PERSONAL',
      radio: '2.4',
      speedTestEnabled: true,
      tracerouteAddress: 'google.com',
      pingAddress: 'google.com',
      dnsServer: '1.1.1.1',
      wlanName: 'Wifi Name',
      wlanUsername: 'my-user-name'
    },
    summary: {
      apsErrorCount: 0,
      apsFailureCount: 0,
      apsPendingCount: 0,
      apsSuccessCount: 0,
      apsTestedCount: 0,
      ...Object.keys(stages).reduce((acc, stage) => ({
        ...acc,
        [`${stage}Error`]: 0,
        [`${stage}Failure`]: 0,
        [`${stage}NA`]: 0,
        [`${stage}Pending`]: 0,
        [`${stage}Success`]: 2
      }), {})
    },
    wlanAuthSettings: {
      wpaVersion: 'WPA2'
    }
  }
}

export const fetchServiceGuardRelatedTests = {
  serviceGuardTest: {
    spec: {
      id: 'specId',
      tests: {
        items: [
          {
            id: 2,
            createdAt: '2023-02-15T00:00:00.000Z',
            summary: { apsErrorCount: 0, apsFailureCount: 0, apsSuccessCount: 0, apsTestedCount: 0 }
          },
          {
            id: 1,
            createdAt: '2023-02-14T00:00:00.000Z',
            summary: { apsErrorCount: 0, apsFailureCount: 0, apsSuccessCount: 0, apsTestedCount: 0 }
          }
        ]
      }
    }
  }
}

export const runServiceGuardTest = {
  runServiceGuardTest: {
    spec: {
      id: 'spec-id',
      clientType: ClientType.VirtualWirelessClient,
      type: TestType.OnDemand,
      name: 'Test Name',
      apsCount: 0,
      userId: 'userId',
      schedule: null,
      tests: {
        items: [{
          id: 3,
          createdAt: '2023-02-16T00:00:00.000Z',
          summary: { apsTestedCount: 0, apsSuccessCount: 0, apsPendingCount: 0 }
        }]
      }
    },
    userErrors: null
  }
}
const Context = createStepsFormContext()

export const withinField = () => within(screen.getByTestId('field'))

export const renderForm = (
  field: JSX.Element,
  options: {
    initialValues?: Partial<NetworkHealthFormDto>,
    editMode?: boolean,
    valuesToUpdate?: Partial<NetworkHealthFormDto>,
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
      {Object.keys(valuesToUpdate).map(key => <Form.Item
        key={key}
        name={key}
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
