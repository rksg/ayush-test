import React from 'react'

import { Form, Switch } from 'antd'
import { useIntl }      from 'react-intl'

import * as UI from '../../../Networks/NetworkForm/NetworkMoreSettings/styledComponents'

// import DeviceOSDrawer from './DeviceOSDrawer'
import Layer2Drawer from './Layer2Drawer'
// import Layer3Drawer   from './Layer3Drawer'
const { useWatch } = Form

const AccessControlComponent = () => {
  const { $t } = useIntl()

  const [
    enableLayer2,
    enableLayer3,
    enableDeviceOs,
    enableApplications,
    enableURLFiltering,
    enableClientRateLimit
  ] = [
    useWatch<boolean>('enableLayer2'),
    useWatch<boolean>('enableLayer3'),
    useWatch<boolean>('enableDeviceOs'),
    useWatch<boolean>('enableApplications'),
    useWatch<boolean>('enableURLFiltering'),
    useWatch<boolean>('enableClientRateLimit')
  ]

  return (
    <>
      <UI.FieldLabel width='175px'>
        {$t({ defaultMessage: 'Layer 2' })}
        <div style={{ display: 'grid', gridTemplateColumns: '50px 190px auto' }}>
          <Form.Item
            name={'enableLayer2'}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />

          {enableLayer2 && <Layer2Drawer />}
        </div>
      </UI.FieldLabel>

      <UI.FieldLabel width='175px'>
        {$t({ defaultMessage: 'Layer 3' })}
        <div style={{ display: 'grid', gridTemplateColumns: '50px 190px auto' }}>
          <Form.Item
            name={'enableLayer3'}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />

          {enableLayer3 && '<Layer3Drawer />'}
        </div>
      </UI.FieldLabel>

      <UI.FieldLabel width='175px'>
        {$t({ defaultMessage: 'Device & OS' })}
        <div style={{ display: 'grid', gridTemplateColumns: '50px 190px auto' }}>
          <Form.Item
            name='enableDeviceOs'
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />

          {enableDeviceOs && '<DeviceOSDrawer />'}
        </div>
      </UI.FieldLabel>

      <UI.FieldLabel width='175px'>
        {$t({ defaultMessage: 'Applications' })}
        <div style={{ display: 'grid', gridTemplateColumns: '50px 190px auto' }}>
          <Form.Item
            name={'enableApplications'}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />

          {enableApplications && <>
            {$t({ defaultMessage: 'Change' })}
          </>}
        </div>
      </UI.FieldLabel>

      <UI.FieldLabel width='175px'>
        {$t({ defaultMessage: 'URL filtering' })}
        <div style={{ display: 'grid', gridTemplateColumns: '50px 190px auto' }}>
          <Form.Item
            name='enableURLFiltering'
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />

          {enableURLFiltering && <>
            {$t({ defaultMessage: 'Change' })}
          </>}
        </div>
      </UI.FieldLabel>

      <UI.FieldLabel width='175px'>
        {$t({ defaultMessage: 'Client Rate Limit' })}
        <div style={{ display: 'grid', gridTemplateColumns: '50px 190px auto' }}>
          <Form.Item
            name='enableClientRateLimit'
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />

          {enableClientRateLimit && <>
            {$t({ defaultMessage: 'Change' })}
          </>}
        </div>
      </UI.FieldLabel>
    </>
  )
}

export default AccessControlComponent
