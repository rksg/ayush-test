import React, { useState, useEffect, useCallback } from 'react'

import ProForm, { ProFormInstance, ProFormSelect, ProFormText } from '@ant-design/pro-form'
import { Divider }                                              from 'antd'
import _                                                        from 'lodash'
import { useIntl }                                              from 'react-intl'

import { Modal, ModalType }         from '@acx-ui/components'
import { NetworkForm }              from '@acx-ui/rc/components'
import {
  useCreateOnboardConfigsMutation,
  useUpdateOnboardConfigsMutation
} from '@acx-ui/rc/services'
import { NetworkSaveData, NetworkTypeEnum, networkTypes } from '@acx-ui/rc/utils'

import { willRegenerateAlert } from '../../ruckusAi.utils'

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
  showAlert: boolean,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formInstance: ProFormInstance<any> | undefined,
  isRegenWlan: boolean,
  setIsRegenWlan: (isRegen: boolean) => void,
}) {
  const { $t } = useIntl()
  const { formInstance } = props
  const initialData = JSON.parse(props.payload || '[]') as NetworkConfig[]
  const [data, setData] = useState<NetworkConfig[]>([])

  const [modalType, setModalType] = useState<NetworkTypeEnum>(NetworkTypeEnum.OPEN)
  const [modalId, setModalId] = useState('')
  const [modalName, setModalName] = useState('')

  const [configuredFlags, setConfiguredFlags] = useState<Map<string, boolean>>(new Map())
  const [ssidTypes, setSsidTypes] = useState<Map<string, NetworkTypeEnum>>(new Map())
  const [networkModalVisible, setNetworkModalVisible] = useState(false)
  const [configuredIndex, setConfiguredIndex] = useState<number>(0)

  useEffect(() => {
    if (props.isRegenWlan || _.isEmpty(data)) {
      formInstance?.resetFields()
      formInstance?.setFieldsValue({ data: initialData })
      setData(initialData)
      setSsidTypes(new Map(initialData.map(item => [item.id, item['SSID Type']])))
      setConfigFlags()
      props.setIsRegenWlan(false)
    } else {

      let newData = [] as NetworkConfig[]
      initialData.forEach((item) => {
        const originDatas = formInstance?.getFieldsValue().data || data
        const findData = originDatas.find((d: { id: string }) => d.id === item.id)
        if (findData) {
          newData.push({ ...findData, 'SSID Name': item['SSID Name'] })
        } else {
          newData.push(item)
        }
      })

      setData(newData)
      formInstance?.setFieldsValue({ data: newData })
      setSsidTypes(new Map(newData.map(item => [item.id, item['SSID Type']])))

    }

  }, [props.payload])

  const setConfigFlags = function () {
    const newSsidTypes = new Map(initialData.map(item => [item.id, item['SSID Type']]))
    const diffIndices = data
      .map((item, index) => (ssidTypes.get(item.id) !== newSsidTypes.get(item.id) ? index : -1))
      .filter(index => index !== -1)

    const updatedFlags = new Map(configuredFlags)
    diffIndices.forEach(index => {
      updatedFlags.set(data[index].id, false)
    })

    setConfiguredFlags(updatedFlags)
  }

  const networkOptions = [
    { value: NetworkTypeEnum.OPEN, label: $t(networkTypes[NetworkTypeEnum.OPEN]) },
    { value: NetworkTypeEnum.PSK, label: $t(networkTypes[NetworkTypeEnum.PSK]) },
    { value: NetworkTypeEnum.DPSK, label: $t(networkTypes[NetworkTypeEnum.DPSK]) },
    { value: NetworkTypeEnum.AAA, label: $t(networkTypes[NetworkTypeEnum.AAA]) },
    { value: NetworkTypeEnum.CAPTIVEPORTAL, label: $t(networkTypes[NetworkTypeEnum.CAPTIVEPORTAL]) }
  ]

  const handleSsidTypeChange = (id: string, value: NetworkTypeEnum) => {
    setSsidTypes((prevSsidTypes) => {
      const updatedSsidTypes = new Map(prevSsidTypes)
      updatedSsidTypes.set(id, value)
      return updatedSsidTypes
    })

    setConfiguredFlags((prevConfiguredFlags) => {
      const updatedConfiguredFlags = new Map(prevConfiguredFlags)
      updatedConfiguredFlags.set(id, false)
      return updatedConfiguredFlags
    })

    formInstance?.setFields([{ name: `configuredFlag-${id}`, errors: [] }])
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
      const updatedConfiguredFlags = new Map(prevConfiguredFlags)
      updatedConfiguredFlags.set(modalId, true)
      return updatedConfiguredFlags
    })
  }, [modalId, modalName, modalType, configuredIndex, props.sessionId])

  useEffect(()=>{
    configuredFlags.forEach((flag, id) => {
      if (flag) {
        formInstance?.validateFields([`configuredFlag-${id}`])
      }
    })
  },[configuredFlags])

  const getNetworkForm = <NetworkForm
    isRuckusAiMode={true}
    modalMode={true}
    gptEditId={configuredFlags.get(modalId) ? `${modalId}?type=${modalType}` : ''}
    modalCallBack={handleModalCallback}
    createType={modalType}
  />

  const getModalActionText = () => {
    const isEdit = configuredFlags.get(modalId)
    return isEdit ? $t({ defaultMessage: 'Edit' }) :
      $t({ defaultMessage: 'Add' })
  }

  return (
    <UI.Container>
      <UI.Header>
        <UI.Title>{$t({ defaultMessage: 'Recommended Network Configuration' })}</UI.Title>
        <UI.Description>
          {// eslint-disable-next-line max-len
            $t({ defaultMessage: 'Based on your selection, below is the list of SSIDs and their recommended respective configurations.' })}
        </UI.Description>
      </UI.Header>
      {props.showAlert && <div style={{ margin: '-25px 0px 10px 0px' }}>
        {willRegenerateAlert($t)}
      </div>}

      {data.map((item, index) => (
        <React.Fragment key={item.id}>
          <UI.StepItemContainer>
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
                  label={$t({ defaultMessage: 'Type' })}
                  name={['data', index, 'SSID Type']}
                  initialValue={item['SSID Type']}
                  options={networkOptions}
                  allowClear={false}
                  fieldProps={{
                    onChange: (value) => handleSsidTypeChange(item.id, value)
                  }}
                />
              </div>
              <UI.ConfigurationContainer
                data-testid={`wlan-configuration-${index}`}
                onClick={() => {
                  setModalId(item['id'])
                  setModalName(item['SSID Name'])
                  setModalType(ssidTypes.get(item.id) || NetworkTypeEnum.OPEN)
                  setNetworkModalVisible(true)
                  setConfiguredIndex(index)
                }}>

                <UI.ConfigurationHeader>
                  <div>
                    {networkOptions.find(
                      option => option.value === ssidTypes.get(item.id))?.label || ''}
                        &nbsp;
                    {$t({ defaultMessage: 'Configurations' })}
                    {ssidTypes.get(item.id) !== NetworkTypeEnum.OPEN &&
                          <UI.RequiredIcon />}
                  </div>

                  <div style={{ display: 'flex' }}>
                    {configuredFlags.get(item.id) ?
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
                name={`configuredFlag-${item.id}`}
                rules={[{
                  validator: () => {
                    if (!configuredFlags.get(item.id) &&
                      ssidTypes.get(item.id) !== NetworkTypeEnum.OPEN) {
                      return Promise.reject(new Error($t({
                        // eslint-disable-next-line max-len
                        defaultMessage: 'This configuration is not yet set. Please complete it to ensure proper functionality.'
                      })))
                    }
                    return Promise.resolve()
                  }
                }]}>
                <ProFormText hidden />
              </ProForm.Item>
            </UI.VlanDetails>
          </UI.StepItemContainer>
          {index < data.length - 1 && <Divider />}
        </React.Fragment>
      ))}

      {networkModalVisible &&
        <Modal
          // eslint-disable-next-line max-len
          title={`${getModalActionText()} ${networkOptions.find(option => option.value === modalType)?.label}`}
          type={ModalType.ModalStepsForm}
          visible={networkModalVisible}
          mask={true}
          children={getNetworkForm}
          destroyOnClose
        />
      }
    </UI.Container>
  )
}
