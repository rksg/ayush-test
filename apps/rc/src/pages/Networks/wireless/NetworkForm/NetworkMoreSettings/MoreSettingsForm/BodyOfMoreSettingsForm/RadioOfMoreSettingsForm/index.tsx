import React from 'react'

import {
  Form,
  FormInstance,
  Switch
} from 'antd'
import { useIntl } from 'react-intl'

import {
  NetworkSaveData,
  WlanSecurityEnum
} from '@acx-ui/rc/utils'

import { LoadControlForm } from '../../../LoadControlForm'
import DataRateControl     from '../../../MoreSettingsForm/BodyOfMoreSettingsForm/RadioOfMoreSettingsForm/DataRateControl'
import * as UI             from '../../../styledComponents'


enum BssMinRateEnum {
    VALUE_NONE = 'default',
    VALUE_1 = '1',
    VALUE_2 = '2',
    VALUE_5_5 = '5.5',
    VALUE_12 = '12',
    VALUE_24 = '24'
}

enum MgmtTxRateEnum {
    VALUE_1 = '1',
    VALUE_2 = '2',
    VALUE_5_5 = '5.5',
    VALUE_6 = '6',
    VALUE_9 = '9',
    VALUE_11 = '11',
    VALUE_12 = '12',
    VALUE_18 = '18',
    VALUE_24 = '24'
}

interface Props {
    data: NetworkSaveData | null
    networkWPASecuredList: WlanSecurityEnum[]
    wlanData: NetworkSaveData | null
    form: FormInstance
    bssMinimumPhyRate: string
    enableOfdmOnly: boolean
    enableFastRoaming: boolean
    enableAirtimeDecongestion: boolean
    enableJoinRSSIThreshold: boolean
    enableTransientClientManagement: boolean
    enableOce: boolean
    enableBSSPriority: boolean
}
function RadioOfMoreSettingsForm (props: Props) {
  const { $t } = useIntl()
  const onOfdmChange = function (checked: boolean) {
    if (checked) {
      if (!(
        props.bssMinimumPhyRate === BssMinRateEnum.VALUE_12 ||
              props.bssMinimumPhyRate === BssMinRateEnum.VALUE_24)) {
        props.form.setFieldsValue({
          bssMinimumPhyRate: BssMinRateEnum.VALUE_NONE,
          managementFrameMinimumPhyRate: MgmtTxRateEnum.VALUE_6
        })
      }
    }
  }


  return (
    <>
      <UI.FieldLabel width='250px'>
        {$t({ defaultMessage: 'Hide SSID' })}
        <Form.Item
          name={['wlan', 'advancedCustomization', 'hideSsid']}
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch />}
        />
      </UI.FieldLabel>
      <div style={{ marginTop: '28px' }}>
        <LoadControlForm />
      </div>
      <div style={{ marginTop: '34px' }}>
        <DataRateControl
          bssMinimumPhyRate={props.bssMinimumPhyRate}
          enableOfdmOnly={props.enableOfdmOnly}
          form={props.form}/>
      </div>

      <UI.FieldLabel width='250px'>
        {$t({ defaultMessage: 'Enable OFDM only (disable 802.11b)' })}
        <Form.Item
          name={['enableOfdmOnly']}
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={true}
          children={
            <Switch
              data-testid='enableOfdmOnly'
              onChange={onOfdmChange}
            ></Switch>
          }
        />
      </UI.FieldLabel>
    </>
  )
}

export default RadioOfMoreSettingsForm
