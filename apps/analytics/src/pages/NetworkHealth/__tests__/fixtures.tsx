import { useState } from 'react'

import { Form, Input } from 'antd'
import flat            from 'flat'

import { createStepsFormContext }             from '@acx-ui/components'
import { Provider }                           from '@acx-ui/store'
import { render, screen, within, renderHook } from '@acx-ui/test-utils'
import { defaultNetworkPath }                 from '@acx-ui/utils'

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
      ...Object.keys(stages).reduce((acc, stage) => {
        return {
          ...acc,
          [`${stage}Error`]: 0,
          [`${stage}Failure`]: 0,
          [`${stage}NA`]: 0,
          [`${stage}Pending`]: 0,
          [`${stage}Success`]: 0
        }
      },{})
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

export const mockNetworkHierarchy = {
  network: {
    hierarchyNode: {
      name: 'Network',
      type: 'network',
      path: defaultNetworkPath,
      children: [{
        id: 'id1',
        type: 'zone',
        name: 'Venue 1',
        path: [...defaultNetworkPath, { type: 'zone', name: 'Venue 1' }],
        aps: [
          { name: 'AP 1', mac: '00:00:00:00:00:01' },
          { name: 'AP 2', mac: '00:00:00:00:00:02' }
        ]
      }, {
        id: 'id2',
        type: 'zone',
        name: 'Venue 2',
        path: [...defaultNetworkPath, { type: 'zone', name: 'Venue 2' }],
        aps: [
          { name: 'AP 3', mac: '00:00:00:00:00:03' },
          { name: 'AP 4', mac: '00:00:00:00:00:04' },
          { name: 'AP 5', mac: '00:00:00:00:00:05' }
        ]
      }]
    }
  }
}

export const fetchAllServiceGuardSpecs = {
  allServiceGuardSpecs: [
    {
      id: 'spec-id',
      name: 'test-1',
      type: TestType.OnDemand,
      apsCount: 0,
      userId: 'user-id',
      clientType: ClientType.VirtualClient,
      schedule: null,
      tests: { items: [] }
    },
    {
      id: 'spec-id-finished',
      name: 'test-2',
      type: TestType.Scheduled,
      apsCount: 2,
      userId: 'user-id-other',
      clientType: ClientType.VirtualWirelessClient,
      schedule: { nextExecutionTime: '2023-02-24T16:00:00.000Z' },
      tests: { items: [
        { id: 1,
          createdAt: '2023-02-24T07:34:33.336Z',
          summary: { apsTestedCount: 2, apsSuccessCount: 2, apsPendingCount: 0 }
        }
      ] }
    },
    {
      id: 'spec-id-ongoing',
      name: 'test-2',
      type: TestType.Scheduled,
      apsCount: 2,
      userId: 'user-id',
      clientType: ClientType.VirtualClient,
      schedule: null,
      tests: { items: [
        { id: 2,
          createdAt: '2023-02-24T07:34:33.336Z',
          summary: { apsTestedCount: 2, apsSuccessCount: 1, apsPendingCount: 1 }
        }
      ] }
    }
  ]
}

export const runServiceGuardTest = {
  runServiceGuardTest: {
    spec: {
      id: 'spec-id',
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

export const deleteNetworkHealth = {
  deleteServiceGuardSpec: {
    deletedSpecId: 'spec-id',
    userErrors: null
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
