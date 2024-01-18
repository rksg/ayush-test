import { useContext, useEffect, useState } from 'react'

import { Checkbox, Form, Select, Space, Switch } from 'antd'
import TextArea                                  from 'antd/lib/input/TextArea'
import _                                         from 'lodash'
import { useIntl }                               from 'react-intl'

import { Drawer, StepsForm, showActionModal }                                                from '@acx-ui/components'
import { Features, useIsSplitOn }                                                            from '@acx-ui/feature-toggle'
import { useAddEdgeLagMutation, useGetEdgeSdLanViewDataListQuery, useUpdateEdgeLagMutation } from '@acx-ui/rc/services'
import {
  EdgeIpModeEnum,
  EdgeLag,
  EdgeLagLacpModeEnum,
  EdgeLagTimeoutEnum,
  EdgeLagTypeEnum,
  EdgePort,
  EdgePortTypeEnum,
  convertEdgePortsConfigToApiPayload,
  getEdgePortDisplayName,
  getEdgePortTypeOptions
} from '@acx-ui/rc/utils'

import { EdgePortCommonForm }                             from '../../PortCommonForm'
import { EdgePortsDataContext, EdgePortsDataContextType } from '../PortDataProvider'

interface LagDrawerProps {
  serialNumber: string
  visible: boolean
  setVisible: (visible: boolean) => void
  data?: EdgeLag
  portList?: EdgePort[]
  existedLagList?: EdgeLag[]
}

const defaultFormValues = {
  lagType: EdgeLagTypeEnum.LACP,
  lacpMode: EdgeLagLacpModeEnum.ACTIVE,
  lacpTimeout: EdgeLagTimeoutEnum.SHORT,
  portType: EdgePortTypeEnum.WAN,
  corePortEnabled: false,
  ipMode: EdgeIpModeEnum.DHCP,
  natEnabled: false,
  lagEnabled: false
} as Partial<EdgeLag>

export const LagDrawer = (props: LagDrawerProps) => {

  const { serialNumber, visible, setVisible, data, portList, existedLagList } = props
  const isEditMode = data?.id !== undefined
  const { $t } = useIntl()
  const isEdgeSdLanReady = useIsSplitOn(Features.EDGES_SD_LAN_TOGGLE)
  const portTypeOptions = getEdgePortTypeOptions($t)
    .filter(item => item.value !== EdgePortTypeEnum.UNCONFIGURED)
  const [form] = Form.useForm()
  const [enabledPorts, setEnabledPorts] = useState<string[]>()
  const lagMembers = Form.useWatch('lagMembers', form) as string[]
  const lagEnabled = Form.useWatch('lagEnabled', form) as string[]

  const [addEdgeLag] = useAddEdgeLagMutation()
  const [updateEdgeLag] = useUpdateEdgeLagMutation()
  const portsData = useContext(EdgePortsDataContext)
  const portData = portsData.portData

  const getEdgeSdLanPayload = {
    filters: { edgeId: [serialNumber] },
    fields: ['id', 'edgeId', 'corePortMac']
  }
  const { edgeSdLanData }
    = useGetEdgeSdLanViewDataListQuery(
      { payload: getEdgeSdLanPayload },
      {
        skip: !isEdgeSdLanReady,
        selectFromResult: ({ data, isLoading }) => ({
          edgeSdLanData: data?.data?.[0],
          isLoading
        })
      }
    )

  const isEdgeSdLanRun = !!edgeSdLanData

  useEffect(() => {
    if(visible) {
      form.resetFields()
      form.setFieldsValue({
        ...defaultFormValues,
        ...data,
        lagMembers: data?.lagMembers.map(item => item.portId)
      })
      setEnabledPorts(data?.lagMembers.filter(item => item.portEnabled)
        .map(item => item.portId))
    }
  }, [visible, form, data])

  const lagNameOptions = [
    { label: 0,value: 0 },
    { label: 1,value: 1 },
    { label: 2,value: 2 },
    { label: 3,value: 3 }
  ]

  const lagTypeOptions = [
    {
      label: $t({ defaultMessage: 'LACP (Dynamic)' }),
      value: EdgeLagTypeEnum.LACP
    }
  ]

  const modeOptions = [
    {
      label: $t({ defaultMessage: 'Active' }),
      value: EdgeLagLacpModeEnum.ACTIVE
    },
    {
      label: $t({ defaultMessage: 'Passive' }),
      value: EdgeLagLacpModeEnum.PASSIVE
    }
  ]

  const timeoutOptions = [
    {
      label: $t({ defaultMessage: 'Short' }),
      value: EdgeLagTimeoutEnum.SHORT
    },
    {
      label: $t({ defaultMessage: 'Long' }),
      value: EdgeLagTimeoutEnum.LONG
    }
  ]

  const getTitle = () => {
    return $t({ defaultMessage: '{operation} LAG' },
      { operation: data ? $t({ defaultMessage: 'Edit' }) :
        $t({ defaultMessage: 'Add' }) })
  }

  const handleClose = () => {
    setVisible(false)
  }

  const handleSave = async () => {
    form.submit()
  }

  const handleFinish = async () => {
    try {
      const formData = form.getFieldsValue(true)
      // exclude id first, then add it when need
      const { id, ...otherFormData } = formData
      const payload = {
        ...convertEdgePortsConfigToApiPayload(otherFormData),
        lagMembers: formData.lagMembers?.map((item: string) => ({
          portId: item,
          portEnabled: enabledPorts?.includes(item) ?? false
        })) ?? []
      }

      const requestPayload = {
        params: { serialNumber, lagId: id.toString() },
        payload: payload
      }

      if(data) {
        await updateEdgeLag(requestPayload).unwrap()
        handleClose()
      } else {
        requestPayload.payload.id = id

        const portConfig = portList?.find(item => formData.lagMembers?.includes(item.id))
        if(portConfig?.portType === EdgePortTypeEnum.WAN ||
          portConfig?.portType === EdgePortTypeEnum.LAN) {
          showActionModal({
            type: 'confirm',
            title: $t({ defaultMessage: 'Existing Port Configuration Clean-up' }),
            content: $t({
              defaultMessage: `Existing configurations have been detected on the selected ports.
              Please be aware that, to integrate them into the LAG,
              we will replace the current configurations with LAG settings.
              Are you sure you want to proceed?`
            }),
            okText: $t({ defaultMessage: 'Replace with LAG settings' }),
            onOk: async () => {
              await addEdgeLag(requestPayload).unwrap()
              handleClose()
            }
          })
        } else {
          await addEdgeLag(requestPayload).unwrap()
          handleClose()
        }
      }
    } catch (error) {
      // TODO error message not be defined
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleFormChange = async (changedValues: Partial<EdgeLag>) => {
    if (changedValues.portType) {
      handlePortTypeChange(changedValues['portType'])
    }else if(changedValues.lagEnabled !== undefined) {
      if(changedValues.lagEnabled) {
        setEnabledPorts(lagMembers)
      } else {
        showActionModal({
          type: 'confirm',
          title: $t({ defaultMessage: 'Warning' }),
          content: $t({
            defaultMessage: `Modify this options may cause the Edge lost
            connection with the controller`
          }),
          okText: $t({ defaultMessage: 'Disable' }),
          onOk: () => {
            setEnabledPorts([])
          },
          onCancel: () => {
            form.setFieldValue('lagEnabled', true)
          }
        })
      }
    } else if (changedValues.lagMembers) {
      if(lagEnabled) {
        setEnabledPorts(changedValues.lagMembers as unknown as string[])
      }
    }
  }

  const handlePortTypeChange = (changedValue: EdgePortTypeEnum | undefined) => {
    if (changedValue === EdgePortTypeEnum.LAN) {
      form.setFieldValue('ipMode', EdgeIpModeEnum.STATIC)
    }
  }

  const handlePortEnabled = (portId: string, enabled: boolean) => {
    if(enabled) {
      setEnabledPorts([...(enabledPorts ?? []), portId])
    } else {
      setEnabledPorts(enabledPorts?.filter(item => item !== portId))
    }
  }

  const getUseableLagOptions = (existedLagList?: EdgeLag[]) => {
    return lagNameOptions.filter(option =>
      !existedLagList?.some(existedLag =>
        existedLag.id === option.value &&
        existedLag.id !== data?.id)) // keep the edit mode data as a selection
  }

  const getUseableLagMembers = (portList?: EdgePort[]) => {
    return portList?.filter(port =>
      !existedLagList?.some(exsistedLag =>
        exsistedLag.lagMembers?.some(existedLagMember =>
          existedLagMember.portId === port.id &&
          !data?.lagMembers.some(editLagMember =>
            editLagMember.portId === port.id)))) // keep the edit mode data as a selection
  }

  const drawerContent = <Form
    layout='vertical'
    form={form}
    onFinish={handleFinish}
    onValuesChange={handleFormChange}
  >
    <Form.Item
      label={$t({ defaultMessage: 'LAG Name' })}
    >
      <Space>
        <span>LAG</span>
        <Form.Item
          name='id'
          rules={[{
            required: true,
            message: $t({ defaultMessage: 'Please select a LAG Name' })
          }]}
          children={<Select options={getUseableLagOptions(existedLagList)} disabled={isEditMode} />}
          noStyle
          hasFeedback
        />
      </Space>
    </Form.Item>
    <Form.Item
      name='description'
      label={$t({ defaultMessage: 'Description' })}
      rules={[
        { max: 63 }
      ]}
      children={<TextArea />}
    />
    <Form.Item
      name='lagType'
      label={$t({ defaultMessage: 'LAG Type' })}
      rules={[{ required: true }]}
      children={<Select options={lagTypeOptions} disabled />}
    />
    <Form.Item
      name='lacpMode'
      label={$t({ defaultMessage: 'Mode' })}
      rules={[{ required: true }]}
      children={<Select options={modeOptions} />}
    />
    <Form.Item
      name='lacpTimeout'
      label={$t({ defaultMessage: 'Timeout' })}
      rules={[{ required: true }]}
      children={<Select options={timeoutOptions} />}
    />
    <Form.Item
      name='lagMembers'
      label={$t({ defaultMessage: 'Select LAG members:' })}
      children={<Checkbox.Group>
        {
          <Space direction='vertical'>
            {
              getUseableLagMembers(portList)?.map((item) =>
                (
                  <Space key={`${item.id}_space`} size={30}>
                    <Checkbox
                      key={`${item.id}_checkbox`}
                      value={item.id}
                      children={getEdgePortDisplayName(item)}
                    />
                    {
                      lagMembers?.some(id => id === item.id) &&
                    <StepsForm.FieldLabel width='100px'>
                      <div style={{ margin: 'auto' }}>{$t({ defaultMessage: 'Port Enabled' })}</div>
                      <Form.Item
                        children={<Switch
                          checked={enabledPorts?.includes(item.id)}
                          onChange={(checked) => handlePortEnabled(item.id, checked)}
                        />}
                        noStyle
                      />
                    </StepsForm.FieldLabel>
                    }
                  </Space>
                ))
            }
          </Space>
        }
      </Checkbox.Group>}
    />

    <Form.Item
      noStyle
      shouldUpdate={(prev, cur) => forceUpdateCondition(prev, cur)}
    >
      {({ getFieldsValue }) => {
        const allValues = getFieldsValue(true) as EdgeLag

        return <EdgePortCommonForm
          formRef={form}
          portsData={portData as EdgePort[]}
          lagData={getMergedLagData(portsData, allValues)}
          isEdgeSdLanRun={isEdgeSdLanRun}
          isListForm={false}
          formFieldsProps={{
            portType: {
              options: portTypeOptions
            },
            corePortEnabled: {
              title: $t({ defaultMessage: 'Use this LAG as Core LAG' })
            },
            enabled: {
              name: 'lagEnabled',
              title: $t({ defaultMessage: 'LAG Enabled' })
            }
          }}
        />
      }}
    </Form.Item>
  </Form>

  const footer = (
    <Drawer.FormFooter
      buttonLabel={{
        save: !!data ? $t({ defaultMessage: 'Apply' }) : $t({ defaultMessage: 'Add' })
      }}
      onCancel={handleClose}
      onSave={handleSave}
    />
  )

  return (
    <Drawer
      title={getTitle()}
      visible={visible}
      onClose={handleClose}
      children={drawerContent}
      footer={footer}
    />
  )
}

const forceUpdateCondition = (prev:unknown, cur: unknown) => {
  return _.get(prev, 'corePortEnabled') !== _.get(cur, 'corePortEnabled')
        || _.get(prev, 'portType') !== _.get(cur, 'portType')
        || _.get(prev, 'lagEnabled') !== _.get(cur, 'lagEnabled')
        || _.get(prev, 'ipMode') !== _.get(cur, 'ipMode')
}

// Merge changed lag data and current lag data form api
const getMergedLagData = (portsData: EdgePortsDataContextType, changedLag: EdgeLag) => {
  let lagData
  if (portsData.lagData) {
    lagData = _.cloneDeep(portsData.lagData)
    const targetIdx = lagData.findIndex(item => item.id === changedLag.id)
    if (targetIdx !== -1) {
      lagData[targetIdx] = changedLag
    } else {
      lagData.push(changedLag)
    }
  }
  return lagData
}
