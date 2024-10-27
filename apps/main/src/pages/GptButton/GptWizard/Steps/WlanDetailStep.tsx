import React, { useState, useEffect } from 'react'
import { ProFormSelect, ProFormText } from '@ant-design/pro-form'
import { Divider } from 'antd'
import { useIntl } from 'react-intl'
import { NetworkTypeEnum, networkTypes } from '@acx-ui/rc/utils'
import * as UI from './styledComponents'

type NetworkConfig = {
  'Purpose': string;
  'SSID Name': string;
  'SSID Objective': string;
  'SSID Type': NetworkTypeEnum;
  'id': string;
}

export function WlanDetailStep(props: { payload: string }) {
  const { $t } = useIntl()
  const data = props.payload ? JSON.parse(props.payload) as NetworkConfig[] : []

  const [ssidTypes, setSsidTypes] = useState<NetworkTypeEnum[]>(data.map(item => item['SSID Type']))

  useEffect(() => {
    if (data.length > 0) {
      setSsidTypes(data.map(item => item['SSID Type']));
    }
  }, [props.payload])

  const networkOptions = [
    { value: NetworkTypeEnum.OPEN, label: $t(networkTypes[NetworkTypeEnum.OPEN]) },
    { value: NetworkTypeEnum.PSK, label: $t(networkTypes[NetworkTypeEnum.PSK]) },
    { value: NetworkTypeEnum.DPSK, label: $t(networkTypes[NetworkTypeEnum.DPSK]) },
    { value: NetworkTypeEnum.AAA, label: $t(networkTypes[NetworkTypeEnum.AAA]) },
    { value: NetworkTypeEnum.CAPTIVEPORTAL, label: $t(networkTypes[NetworkTypeEnum.CAPTIVEPORTAL]) }
  ]

  const handleSsidTypeChange = (index: number, value: NetworkTypeEnum) => {
    setSsidTypes((prevSsidTypes) => {
      const updatedSsidTypes = [...prevSsidTypes]
      updatedSsidTypes[index] = value
      return updatedSsidTypes
    })
  }

  return (
    <UI.Container>
      <UI.Header>
        <UI.Title>{$t({ defaultMessage: 'Recommended Network Configuration' })}</UI.Title>
        <UI.Description>
          {$t({ defaultMessage: 'Based on your selection, below is the list of SSIDs and their recommended respective configurations.' })}
        </UI.Description>
      </UI.Header>

      {data.map((item, index) => (
        <React.Fragment key={index}>
          <UI.VlanContainer>
            <UI.CheckboxContainer>
              <UI.CheckboxIndexLabel>{index + 1}</UI.CheckboxIndexLabel>
            </UI.CheckboxContainer>
            <UI.VlanDetails>
              <div style={{ width: '200px' }}>
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
                  allowClear={false}
                  fieldProps={{
                    onChange: (value) => handleSsidTypeChange(index, value)
                  }}
                />
              </div>
              <UI.PurposeContainer>
                <UI.PurposeHeader>
                  {networkOptions.find(option => option.value === ssidTypes[index])?.label || ''}
                </UI.PurposeHeader>
              </UI.PurposeContainer>
            </UI.VlanDetails>
          </UI.VlanContainer>
          <Divider dashed />
        </React.Fragment>
      ))}
    </UI.Container>
  )
}
