
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
      specId: 'specId',
      name: 'name',
      type: 'on-demand',
      clientType: 'virtual-client',
      apsCount: 0
    },
    config: {
      authenticationMethod: 'WPA2_PERSONAL',
      dnsServer: '',
      pingAddress: '',
      radio: '5',
      speedTestEnabled: false,
      tracerouteAddress: '',
      wlanName: 'wlanName',
      wlanUsername: ''
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
    }
  },
  wlanAuthSettings: {
    wpaVersion: 'WPA2'
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

export const mockResultForVirtualClient = ({
  tracerouteAddress,
  speedTestEnabled,
  pingAddress
}: {
  tracerouteAddress: string | null;
  speedTestEnabled: boolean;
  pingAddress: string | null;
}) => {
  return {
    config: {
      authenticationMethod: 'WPA2_PERSONAL',
      pingAddress: pingAddress,
      tracerouteAddress: tracerouteAddress,
      speedTestEnabled: speedTestEnabled
    },
    spec: {
      specId: '6545041f-0316-4fa3-972b-54e6089042c6',
      name: 'susu',
      type: 'on-demand',
      apsCount: 1,
      clientType: 'virtual-client'
    },
    wlanAuthSettings: {
      wpaVersion: null
    },
    aps: {
      total: 2,
      size: 2,
      items: [
        {
          apName: 'R850-151-164-1',
          apMac: 'C8:03:F5:2C:83:A0',
          auth: 'error',
          assoc: 'error',
          eap: 'error',
          radius: 'error',
          dhcp: 'error',
          userAuth: 'error',
          dns: 'error',
          ping: 'error',
          traceroute: 'error',
          speedTest: 'error',
          pingReceive: null,
          pingTotal: null,
          avgPingTime: null,
          error: 'WLAN_CONF_ERROR',
          speedTestFailure: null,
          speedTestServer: null,
          download: null,
          upload: null,
          tracerouteLog: null,
          state: 'error',
          clients: [
            {
              failure: {
                failedMsgId: '10',
                messageIds: [
                  '2',
                  '3',
                  '4',
                  '5',
                  '21',
                  '22',
                  '23',
                  '24',
                  '31',
                  '31',
                  '10'
                ],
                ssid: 'DENSITY-NSS',
                radio: '5',
                reason: 'PROCESSING',
                failureType: 'dhcp'
              }
            }
          ],
          stationAp: null
        },
        {
          apName: 'DEV-AP-610-11-70',
          apMac: 'D8:38:FC:38:4C:C0',
          auth: 'success',
          assoc: 'success',
          eap: 'success',
          radius: 'success',
          dhcp: 'success',
          userAuth: 'success',
          dns: 'success',
          ping: 'success',
          traceroute: 'success',
          speedTest: 'success',
          pingReceive: 0,
          pingTotal: 0,
          avgPingTime: 0,
          error: null,
          speedTestFailure: null,
          speedTestServer: null,
          download: 0,
          upload: 0,
          tracerouteLog: null,
          state: 'success',
          clients: [
            {
              failure: {
                failedMsgId: '10',
                messageIds: [
                  '2',
                  '3',
                  '4',
                  '5',
                  '21',
                  '22',
                  '23',
                  '24',
                  '31',
                  '31',
                  '10'
                ],
                ssid: 'DENSITY-NSS',
                radio: '5',
                reason: 'CCD_REASON_DEAUTH_LEAVING',
                failureType: 'dhcp'
              }
            }
          ],
          stationAp: null
        }
      ]
    }
  }
}
export const mockResultForVirtualWirelessClient = (status : string) => { return {
  config: {
    authenticationMethod: 'WPA2_PERSONAL',
    pingAddress: '8.8.8.8',
    tracerouteAddress: '8.8.8.8',
    speedTestEnabled: true
  },
  spec: {
    specId: '8c60bcf9-5e9d-452f-8bc6-7f9c17697498',
    name: 'su-vw-test',
    type: 'on-demand',
    apsCount: 1,
    clientType: 'virtual-wireless-client'
  },
  wlanAuthSettings: {
    wpaVersion: null
  },
  aps: {
    total: 1,
    size: 1,
    items: [
      {
        apName: 'DEV-AP-11-101',
        apMac: '20:58:69:3B:BC:F0',
        auth: 'success',
        assoc: 'success',
        eap: 'success',
        radius: 'success',
        dhcp: 'success',
        userAuth: 'success',
        dns: 'success',
        ping: status,
        traceroute: status,
        speedTest: status,
        pingReceive: 5,
        pingTotal: 5,
        avgPingTime: 16.235000610351562,
        error: null,
        speedTestFailure: null,
        speedTestServer: 'Bangalore - Nuron ',
        download: 69406.71875,
        upload: 29061.119140625,
        // eslint-disable-next-line max-len
        tracerouteLog: 'traceroute to 8.8.8.8 (8.8.8.8), 15 hops max, 38 byte packets\n 1  192.168.11.254 (192.168.11.254)  4.030 ms  3.657 ms\n 2  102.1.1.2 (102.1.1.2)  2.487 ms  3.716 ms\n 3  105.0.0.254 (105.0.0.254)  2.294 ms  1.482 ms\n 4  10.174.88.1 (10.174.88.1)  2.976 ms  2.381 ms\n 5  10.174.127.17 (10.174.127.17)  5.011 ms  3.312 ms\n 6  10.7.136.30 (10.7.136.30)  2.771 ms  5.932 ms\n 7  134.242.238.225 (134.242.238.225)  2.886 ms  4.134 ms\n 8  *  *\n 9  172.31.232.154 (172.31.232.154)  6.725 ms  4.469 ms\n10  *  *\n11  121.240.1.46 (121.240.1.46)  29.475 ms  56.509 ms\n12  *  *\n13  dns.google (8.8.8.8)  30.036 ms  24.099 ms\n',
        state: 'success',
        clients: [
          {
            failure: null
          }
        ],
        stationAp: {
          name: 'DEV-AP-610-11-70',
          mac: 'D8:38:FC:38:4C:C0',
          snr: 81
        }
      }
    ]
  }
}
}