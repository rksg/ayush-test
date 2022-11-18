import * as UI from '../../../Networks/NetworkForm/NetworkMoreSettings/styledComponents';
import { Form, Switch } from 'antd';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import Layer2Drawer from './Layer2Drawer';
import { Button, StepsFormInstance } from '@acx-ui/components';
import { AccessControlProfile } from '@acx-ui/rc/utils';
import Layer3Drawer from './Layer3Drawer';
const { useWatch } = Form

const AccessControlComponent = () => {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
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

  console.log(form.getFieldValue('enableLayer2'))
  console.log(form.getFieldValue('accessControlComponent'))

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

          {enableLayer3 && <Layer3Drawer />}
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
            children={<Switch
              onChange={function (checked: boolean) {
                if (!checked) {
                  // form.setFieldValue(['wlan', 'advancedCustomization', 'devicePolicyId'], null)
                }
              }} />}
          />

          {enableDeviceOs && <>
            {$t({ defaultMessage: 'Change' })}
          </>}
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
            children={<Switch
              onChange={function (checked: boolean) {
                if (!checked) {
                  console.log(checked)
                  // form.setFieldValue(
                  //   ['wlan', 'advancedCustomization', 'userDownlinkRateLimiting'], 0)
                  // form.setFieldValue(
                  //   ['wlan', 'advancedCustomization', 'userUplinkRateLimiting'], 0)
                }
              }} />}
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
            children={<Switch
              onChange={function (checked: boolean) {
                if (!checked) {
                  console.log(checked)
                  // form.setFieldValue(
                  //   ['wlan', 'advancedCustomization', 'userDownlinkRateLimiting'], 0)
                  // form.setFieldValue(
                  //   ['wlan', 'advancedCustomization', 'userUplinkRateLimiting'], 0)
                }
              }} />}
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
