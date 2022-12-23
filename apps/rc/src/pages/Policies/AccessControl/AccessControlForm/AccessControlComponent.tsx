import React from 'react'

import { Form, Switch } from 'antd'
import { useIntl }      from 'react-intl'
import styled           from 'styled-components/macro'

// import DeviceOSDrawer from './DeviceOSDrawer'
import Layer2Drawer from './Layer2Drawer'
import Layer3Drawer from './Layer3Drawer'
// import ApplicationsDrawer from './ApplicationsDrawer'
const { useWatch } = Form

const AccessComponentWrapper = styled.div`
  display: grid;
  grid-template-columns: 50px 190px auto;
`

const FieldLabel = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  line-height: 32px;
  grid-template-columns: ${props => props.width} 1fr;
`

const AccessControlComponent = () => {
  const { $t } = useIntl()

  const [
    enableLayer2,
    enableLayer3,
    enableDeviceOs,
    enableApplications,
    enableClientRateLimit
  ] = [
    useWatch<boolean>('enableLayer2'),
    useWatch<boolean>('enableLayer3'),
    useWatch<boolean>('enableDeviceOs'),
    useWatch<boolean>('enableApplications'),
    useWatch<boolean>('enableClientRateLimit')
  ]

  return (
    <>
      <FieldLabel width='175px'>
        {$t({ defaultMessage: 'Layer 2' })}
        <AccessComponentWrapper>
          <Form.Item
            name={'enableLayer2'}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />

          {enableLayer2 && <Layer2Drawer />}
        </AccessComponentWrapper>
      </FieldLabel>

      <FieldLabel width='175px'>
        {$t({ defaultMessage: 'Layer 3' })}
        <AccessComponentWrapper>
          <Form.Item
            name={'enableLayer3'}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />

          {enableLayer3 && <Layer3Drawer />}
        </AccessComponentWrapper>
      </FieldLabel>

      <FieldLabel width='175px'>
        {$t({ defaultMessage: 'Device & OS' })}
        <AccessComponentWrapper>
          <Form.Item
            name='enableDeviceOs'
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />

          {enableDeviceOs && '<DeviceOSDrawer />'}
        </AccessComponentWrapper>
      </FieldLabel>

      <FieldLabel width='175px'>
        {$t({ defaultMessage: 'Applications' })}
        <AccessComponentWrapper>
          <Form.Item
            name={'enableApplications'}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />

          {enableApplications && '<ApplicationDrawer />'}
        </AccessComponentWrapper>
      </FieldLabel>

      <FieldLabel width='175px'>
        {$t({ defaultMessage: 'Client Rate Limit' })}
        <AccessComponentWrapper>
          <Form.Item
            name='enableClientRateLimit'
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />

          {enableClientRateLimit && '<ClientRateLimitDrawer />'}
        </AccessComponentWrapper>
      </FieldLabel>
    </>
  )
}

export default AccessControlComponent
