import React from 'react'

import { ProFormSelect, ProFormText } from '@ant-design/pro-form'
import { Divider }                    from 'antd'
import { useIntl }                    from 'react-intl'

import { NetworkTypeEnum, networkTypes } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

type NetworkConfig = {
  'Purpose': string;
  'SSID Name': string;
  'SSID Objective': string;
  'SSID Type': boolean;
  'id': string;
}

export function WlanDetailStep (props: { payload: string }) {
  const { $t } = useIntl()
  const data = props.payload ? JSON.parse(props.payload) as NetworkConfig[] : []

  const networkOptions = [
    {
      value: NetworkTypeEnum.OPEN,
      label: $t(networkTypes[NetworkTypeEnum.OPEN])
    }, {
      value: NetworkTypeEnum.PSK,
      label: $t(networkTypes[NetworkTypeEnum.PSK])
    }, {
      value: NetworkTypeEnum.DPSK,
      label: $t(networkTypes[NetworkTypeEnum.DPSK])
    }, {
      value: NetworkTypeEnum.AAA,
      label: $t(networkTypes[NetworkTypeEnum.AAA])
    }, {
      value: NetworkTypeEnum.CAPTIVEPORTAL,
      label: $t(networkTypes[NetworkTypeEnum.CAPTIVEPORTAL])
    }
  ]

  return (
    <UI.Container>
      <UI.Header>
        <UI.Title>{$t({ defaultMessage: 'Recommended SSID' })}</UI.Title>
        <UI.Description>
          {// eslint-disable-next-line max-len
            $t({ defaultMessage: 'Based on your selection, below is the list of SSIDs and their recommended respective configurations.' })}
        </UI.Description>
      </UI.Header>

      {data.map((item, index) => (
        <React.Fragment key={index}>
          <UI.VlanContainer>
            <UI.CheckboxContainer>
              <UI.CheckboxIndexLabel>{index + 1}</UI.CheckboxIndexLabel>
            </UI.CheckboxContainer>
            <UI.VlanDetails>
              <ProFormText
                name={['data', index, 'id']}
                initialValue={item['id']}
                hidden
              />
              <ProFormText
                name={['data', index, 'Purpose']}
                initialValue={item['Purpose']}
                hidden
              />
              <ProFormText
                name={['data', index, 'SSID Objective']}
                initialValue={item['SSID Objective']}
                hidden
              />
              <ProFormText
                label={$t({ defaultMessage: 'Network name' })}
                name={['data', index, 'SSID Name']}
                initialValue={item['SSID Name']}
              />
              <ProFormSelect
                label={$t({ defaultMessage: 'Network Type' })}
                name={['data', index, 'SSID Type']}
                initialValue={item['SSID Type']}
                options={networkOptions}
              />
            </UI.VlanDetails>
            <Divider dashed />
          </UI.VlanContainer>
        </React.Fragment>
      ))}
    </UI.Container>
  )
}
