import React, { useState, useEffect } from 'react'

import { ProFormSelect, ProFormText } from '@ant-design/pro-form'
import { Divider }                    from 'antd'
import { useIntl }                    from 'react-intl'

import { cssStr, Modal, ModalType } from '@acx-ui/components'
import { NetworkForm }              from '@acx-ui/rc/components'
import {
  useCreateOnboardConfigsMutation,
  useUpdateOnboardConfigsMutation
} from '@acx-ui/rc/services'
import { NetworkTypeEnum, networkTypes } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

type NetworkConfig = {
  'Purpose': string;
  'SSID Name': string;
  'SSID Objective': string;
  'SSID Type': NetworkTypeEnum;
  'id': string;
}

export function WlanDetailStep (props: { payload: string, sessionId: string }) {
  const { $t } = useIntl()
  const data = props.payload ? JSON.parse(props.payload) as NetworkConfig[] : []

  const [modalType, setModalType] = useState<NetworkTypeEnum>(NetworkTypeEnum.OPEN)
  const [modalId, setModalId] = useState('')
  const [modalName, setModalName] = useState('')

  const [configuredFlags, setConfiguredFlags] = useState<boolean[]>(Array(data.length).fill(false))
  const [ssidTypes, setSsidTypes] = useState<NetworkTypeEnum[]>(data.map(item => item['SSID Type']))
  const [networkModalVisible, setNetworkModalVisible] = useState(false)
  const [configuredIndex, setConfiguredIndex] = useState<number>(0)

  useEffect(() => {
    if (data.length > 0) {
      setSsidTypes(data.map(item => item['SSID Type']))
      setConfiguredFlags(Array(data.length).fill(false))
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
    setConfiguredFlags((prevConfiguredFlags) => {
      const updatedConfiguredFlags = [...prevConfiguredFlags]
      updatedConfiguredFlags[index] = false
      return updatedConfiguredFlags
    })
  }

  const [createOnboardConfigs] = useCreateOnboardConfigsMutation()
  const [updateOnboardConfigs] = useUpdateOnboardConfigsMutation()

  const getNetworkForm = <NetworkForm
    isGptMode={true}
    modalMode={true}
    gptEditId={configuredFlags[configuredIndex] ? `${modalId}?type=${modalType}` : ''}
    modalCallBack={async (payload) => {
      setNetworkModalVisible(false)
      if (payload) {
        const modifiedPayload = {
          ...payload,
          type: modalType
        }
        if(modalId) {
          await updateOnboardConfigs({
            params: {
              id: modalId
            },
            payload: {
              id: modalId,
              name: modalName,
              type: modalType.toUpperCase(),
              content: JSON.stringify(modifiedPayload),
              sessionId: props.sessionId
            }
          }).unwrap()
        } else {
          await createOnboardConfigs({
            payload: {
              name: modalName,
              type: modalType.toUpperCase(),
              content: JSON.stringify(modifiedPayload),
              sessionId: props.sessionId
            }
          }).unwrap()
        }
        setConfiguredFlags((prevConfiguredFlags) => {
          const updatedConfiguredFlags = [...prevConfiguredFlags]
          updatedConfiguredFlags[configuredIndex] = true
          return updatedConfiguredFlags
        })
      }
    }}
    createType={modalType}
  />

  return (
    <UI.Container>
      <UI.Header>
        <UI.Title>{$t({ defaultMessage: 'Recommended Network Configuration' })}</UI.Title>
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
                  name={['data', index, 'SSID Name']}
                  initialValue={item['SSID Name']}
                  hidden
                />
                <UI.NetworkName>
                  {`${$t({ defaultMessage: 'Network Name:' })} ${data[index]['SSID Name']}`}
                </UI.NetworkName>

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
              <UI.ConfigurationContainer>
                <UI.PurposeHeader
                  onClick={() => {
                    setModalId(item['id'])
                    setModalName(item['SSID Name'])
                    setModalType(ssidTypes[index])
                    setNetworkModalVisible(true)
                    setConfiguredIndex(index)
                  }}>

                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    width: '-webkit-fill-available'
                  }}>
                    <div>
                      {networkOptions.find(
                        option => option.value === ssidTypes[index])?.label || ''}
                      &nbsp;
                      {$t({ defaultMessage: 'Configurations' })}
                      {ssidTypes[index] !== NetworkTypeEnum.OPEN &&
                        <span style={{
                          color: cssStr('--acx-accents-orange-50'),
                          marginLeft: '5px'
                        }} >*</span>}
                    </div>

                    <div style={{ display: 'flex' }}>
                      {configuredFlags[index] ?
                        <div style={{ color: cssStr('--acx-semantics-green-50'), display: 'flex' }}>
                          <UI.CollapseCircleSolidIcons/>
                          <div>{$t({ defaultMessage: 'Configured' })}</div>
                        </div> :
                        <div style={{ color: cssStr('--acx-accents-blue-50') }}>
                          {$t({ defaultMessage: 'Setup Network' })}</div>}
                      <UI.ArrowChevronRightIcons />
                    </div>
                  </div>
                </UI.PurposeHeader>
              </UI.ConfigurationContainer>
            </UI.VlanDetails>
          </UI.VlanContainer>
          <Divider dashed />
        </React.Fragment>
      ))}
      {networkModalVisible &&
        <Modal
          // eslint-disable-next-line max-len
          title={`${$t({ defaultMessage: 'Add' })} ${networkOptions.find(option => option.value === modalType)?.label}`}
          type={ModalType.ModalStepsForm}
          visible={networkModalVisible}
          mask={true}
          children={getNetworkForm}
        />
      }
    </UI.Container>
  )

}
