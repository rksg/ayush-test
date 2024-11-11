import React, { useState, useEffect, useCallback } from 'react'

import ProForm, { ProFormInstance, ProFormSelect, ProFormText } from '@ant-design/pro-form'
import { Divider }                                              from 'antd'
import { useIntl }                                              from 'react-intl'

import { Modal, ModalType }         from '@acx-ui/components'
import { NetworkForm }              from '@acx-ui/rc/components'
import {
  useCreateOnboardConfigsMutation,
  useUpdateOnboardConfigsMutation
} from '@acx-ui/rc/services'
import { NetworkSaveData, NetworkTypeEnum, networkTypes } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

type NetworkConfig = {
  'Purpose': string;
  'SSID Name': string;
  'SSID Objective': string;
  'SSID Type': NetworkTypeEnum;
  'id': string;
}

export function WlanDetailStep (props: {
  payload: string, sessionId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formInstance: ProFormInstance<any> | undefined
}) {
  const { $t } = useIntl()
  const { formInstance } = props
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

    formInstance?.setFields([{ name: `configuredFlag-${index}`, errors: [] }])
  }

  const [createOnboardConfigs] = useCreateOnboardConfigsMutation()
  const [updateOnboardConfigs] = useUpdateOnboardConfigsMutation()

  const handleModalCallback = useCallback(async (payload: NetworkSaveData | undefined) => {
    setNetworkModalVisible(false)

    if (!payload) return

    const modifiedPayload = {
      ...payload,
      type: modalType
    }

    const configPayload = {
      name: modalName,
      type: modalType.toUpperCase(),
      content: JSON.stringify(modifiedPayload),
      sessionId: props.sessionId
    }

    if (modalId) {
      await updateOnboardConfigs({
        params: { id: modalId },
        payload: { id: modalId, ...configPayload }
      }).unwrap()
    } else {
      await createOnboardConfigs({ payload: configPayload }).unwrap()
    }

    setConfiguredFlags((prevConfiguredFlags) => {
      const updatedConfiguredFlags = [...prevConfiguredFlags]
      updatedConfiguredFlags[configuredIndex] = true
      return updatedConfiguredFlags
    })


  }, [modalId, modalName, modalType, configuredIndex, props.sessionId])

  useEffect(()=>{
    configuredFlags.forEach((flag, index) => {
      if (flag) {
        formInstance?.validateFields([`configuredFlag-${index}`])
      }
    })
  },[configuredFlags])

  const getNetworkForm = <NetworkForm
    isRuckusAiMode={true}
    modalMode={true}
    gptEditId={configuredFlags[configuredIndex] ? `${modalId}?type=${modalType}` : ''}
    modalCallBack={handleModalCallback}
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
              <UI.ConfigurationContainer
                data-testid={`wlan-configuration-${index}`}
                onClick={() => {
                  setModalId(item['id'])
                  setModalName(item['SSID Name'])
                  setModalType(ssidTypes[index])
                  setNetworkModalVisible(true)
                  setConfiguredIndex(index)
                }}>

                <UI.ConfigurationHeader>
                  <div>
                    {networkOptions.find(
                      option => option.value === ssidTypes[index])?.label || ''}
                        &nbsp;
                    {$t({ defaultMessage: 'Configurations' })}
                    {ssidTypes[index] !== NetworkTypeEnum.OPEN &&
                          <UI.RequiredIcon />}
                  </div>

                  <div style={{ display: 'flex' }}>
                    {configuredFlags[index] ?
                      <UI.ConfiguredButton>
                        <UI.CollapseCircleSolidIcons />
                        <div>{$t({ defaultMessage: 'Configured' })}</div>
                      </UI.ConfiguredButton> :
                      <UI.SetupButton>
                        {$t({ defaultMessage: 'Setup Network' })}
                      </UI.SetupButton>}
                    <UI.ArrowChevronRightIcons />
                  </div>
                </UI.ConfigurationHeader>
              </UI.ConfigurationContainer>

              <ProForm.Item
                style={{
                  height: '40px',
                  marginTop: '-45px',
                  pointerEvents: 'none'
                }}
                name={`configuredFlag-${index}`}
                rules={[{
                  validator: () => {
                    if (!configuredFlags[index]
                       && ssidTypes[index] !== NetworkTypeEnum.OPEN) {
                      return Promise.reject(new Error($t({
                        // eslint-disable-next-line max-len
                        defaultMessage: 'This configuration is not yet set. Please complete it to ensure proper functionality.'
                      })))
                    }
                    return Promise.resolve()
                  }
                }]}
              >
                <ProFormText hidden />
              </ProForm.Item>

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
