import { useEffect } from 'react'

import { Checkbox, Form, Space, Switch } from 'antd'
import TextArea                          from 'antd/lib/input/TextArea'
import _                                 from 'lodash'
import { useIntl }                       from 'react-intl'

import { Drawer, Select, StepsForm, showActionModal } from '@acx-ui/components'
import { Features, useIsSplitOn }                     from '@acx-ui/feature-toggle'
import {
  useGetEdgeSdLanViewDataListQuery
} from '@acx-ui/rc/services'
import {
  EdgeIpModeEnum,
  EdgeLag,
  EdgeLagLacpModeEnum,
  EdgeLagTimeoutEnum,
  EdgeLagTypeEnum,
  EdgePort,
  EdgePortTypeEnum,
  EdgeSerialNumber,
  convertEdgePortsConfigToApiPayload,
  getEdgePortDisplayName,
  getEdgePortTypeOptions
} from '@acx-ui/rc/utils'

import { getEnabledCorePortInfo } from '../EdgeFormItem/EdgePortsGeneralBase/utils'
import { EdgePortCommonForm }     from '../EdgeFormItem/PortCommonForm'

interface LagDrawerProps {
  clusterId: string
  serialNumber?: EdgeSerialNumber
  visible: boolean
  setVisible: (visible: boolean) => void
  data?: EdgeLag
  portList?: EdgePort[]
  existedLagList?: EdgeLag[]
  onAdd: (serialNumber: string, data: EdgeLag) => Promise<void>
  onEdit: (serialNumber: string, data: EdgeLag) => Promise<void>
}

const defaultFormValues = {
  lagType: EdgeLagTypeEnum.LACP,
  lacpMode: EdgeLagLacpModeEnum.ACTIVE,
  lacpTimeout: EdgeLagTimeoutEnum.SHORT,
  portType: EdgePortTypeEnum.WAN,
  corePortEnabled: false,
  ipMode: EdgeIpModeEnum.DHCP,
  natEnabled: false,
  lagEnabled: true,
  lagMembers: []
} as Partial<EdgeLag>

export const LagDrawer = (props: LagDrawerProps) => {

  const {
    clusterId = '',
    serialNumber = '',
    visible,
    setVisible,
    data,
    portList,
    existedLagList, onAdd, onEdit
  } = props
  const isEditMode = data?.id !== undefined
  const { $t } = useIntl()
  const isEdgeSdLanReady = useIsSplitOn(Features.EDGES_SD_LAN_TOGGLE)
  const isEdgeSdLanHaReady = useIsSplitOn(Features.EDGES_SD_LAN_HA_TOGGLE)
  const portTypeOptions = getEdgePortTypeOptions($t)
    .filter(item => item.value !== EdgePortTypeEnum.UNCONFIGURED)
  const [form] = Form.useForm()
  const lagEnabled = Form.useWatch('lagEnabled', form) as boolean

  const getEdgeSdLanPayload = {
    filters: isEdgeSdLanHaReady
      ? { edgeClusterId: [clusterId] }
      : { edgeId: [serialNumber] },
    fields: ['id', (isEdgeSdLanHaReady?'edgeClusterId':'edgeId')]
  }
  const { edgeSdLanData }
    = useGetEdgeSdLanViewDataListQuery(
      { payload: getEdgeSdLanPayload },
      {
        skip: (isEdgeSdLanReady && !Boolean(serialNumber))
        || (isEdgeSdLanHaReady && !Boolean(clusterId)),
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
      const corePortInfo = getEnabledCorePortInfo(portList ?? [], existedLagList ?? [])
      const hasCorePortEnabled = !!corePortInfo.key
      let defaultPortType = defaultFormValues.portType
      if (hasCorePortEnabled && !corePortInfo.isExistingCorePortInLagMember) {
        defaultPortType = EdgePortTypeEnum.LAN
      }

      form.setFieldsValue({
        ...defaultFormValues,
        portType: defaultPortType,
        ...data
      })
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
      const payload = convertEdgePortsConfigToApiPayload(formData) as EdgeLag

      if(data) {
        await onEdit(serialNumber, payload)
        handleClose()
      } else {
        const portConfig = formData.lagMembers.length > 0
          ? portList?.find(item => (formData.lagMembers as EdgeLag['lagMembers'])
            .filter(member => member.portId === item.id)[0])
          : undefined

        if (portConfig?.portType === EdgePortTypeEnum.WAN ||
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
              await onAdd(serialNumber, payload)
              handleClose()
            }
          })
        } else {
          await onAdd(serialNumber, payload)
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
    } else if(changedValues.lagEnabled !== undefined) {
      const currentMembers = form.getFieldValue('lagMembers') as EdgeLag['lagMembers'] ?? []

      if(changedValues.lagEnabled) {
        form.setFieldValue('lagMembers', currentMembers.map(item => ({
          ...item,
          portEnabled: true
        })))
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
            form.setFieldValue('lagMembers', currentMembers.map(item => ({
              ...item,
              portEnabled: false
            })))
          },
          onCancel: () => {
            form.setFieldValue('lagEnabled', true)
          }
        })
      }
    }
  }

  const handlePortTypeChange = (changedValue: EdgePortTypeEnum | undefined) => {
    if (changedValue === EdgePortTypeEnum.LAN || changedValue === EdgePortTypeEnum.CLUSTER) {
      form.setFieldValue('ipMode', EdgeIpModeEnum.STATIC)
    }
  }

  const handleLagMemberChange = (portId: string, enabled: boolean) => {
    const currentMembers = form.getFieldValue('lagMembers') as EdgeLag['lagMembers'] ?? []
    let updated = _.cloneDeep(currentMembers)

    if(enabled) {
      updated.push({ portId, portEnabled: lagEnabled })
    } else {
      _.remove(updated, item => item.portId === portId)
    }

    form.setFieldValue('lagMembers', updated)
  }

  const handlePortEnabled = (portId: string, enabled: boolean) => {
    const currentMembers = form.getFieldValue('lagMembers') as EdgeLag['lagMembers'] ?? []
    const updated = _.cloneDeep(currentMembers)
    updated.forEach(item => {
      if (item.portId === portId)
        item.portEnabled = enabled
    })
    form.setFieldValue('lagMembers', updated)
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
          children={
            <Select
              options={getUseableLagOptions(existedLagList)}
              disabled={isEditMode}
              placeholder=''
            />
          }
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
      label={$t({ defaultMessage: 'Select LAG members:' })}
      shouldUpdate={(prev, cur) => {
        return prev.lagMembers !== cur.lagMembers
      }}
    >
      {({ getFieldValue }) => {
        const lagMembers = getFieldValue('lagMembers') as EdgeLag['lagMembers']

        return <Checkbox.Group value={lagMembers?.map(item => item.portId)}>
          <Space direction='vertical'>
            {
              getUseableLagMembers(portList)?.map((item: EdgePort) =>
                (
                  <Space key={`${item.id}_space`} size={30}>
                    <Checkbox
                      key={`${item.id}_checkbox`}
                      value={item.id}
                      children={getEdgePortDisplayName(item)}
                      onChange={(e) => handleLagMemberChange(item.id, e.target.checked)}
                    />
                    {
                      lagMembers?.some(id => id.portId === item.id) &&
                    <StepsForm.FieldLabel width='100px'>
                      <div style={{ margin: 'auto' }}>{$t({ defaultMessage: 'Port Enabled' })}</div>
                      <Form.Item
                        children={<Switch
                          // eslint-disable-next-line max-len
                          checked={lagMembers.find(member => member.portId === item.id)?.portEnabled ?? false}
                          onChange={(checked) => handlePortEnabled(item.id, checked)}
                          disabled={!lagEnabled}
                        />}
                        noStyle
                      />
                    </StepsForm.FieldLabel>
                    }
                  </Space>
                ))
            }
          </Space>
        </Checkbox.Group>
      }}
    </Form.Item>


    <Form.Item
      noStyle
      shouldUpdate={(prev, cur) => forceUpdateCondition(prev, cur)}
    >
      {({ getFieldsValue }) => {
        const allValues = getFieldsValue(true) as EdgeLag

        return <EdgePortCommonForm
          formRef={form}
          fieldHeadPath={[]}
          portsDataRootPath={[]}
          formListItemKey=''
          portsData={portList ?? []}
          lagData={getMergedLagData(existedLagList, allValues)}
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
        || _.get(prev, 'lagMembers') !== _.get(cur, 'lagMembers')
        || _.get(prev, 'lagEnabled') !== _.get(cur, 'lagEnabled')
        || _.get(prev, 'ipMode') !== _.get(cur, 'ipMode')
}

// Merge changed lag data and current lag data form api
const getMergedLagData = (lagData: EdgeLag[] | undefined, changedLag: EdgeLag) => {
  let updatedLagData
  if (lagData) {
    updatedLagData = _.cloneDeep(lagData)
    const targetIdx = lagData.findIndex(item => item.id === changedLag.id)
    if (targetIdx !== -1) {
      updatedLagData[targetIdx] = changedLag
    } else {
      updatedLagData.push(changedLag)
    }
  } else {
    updatedLagData = [changedLag]
  }
  return updatedLagData
}