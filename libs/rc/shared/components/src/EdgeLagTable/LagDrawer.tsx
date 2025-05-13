import { useEffect, useMemo } from 'react'

import { Form, Space }             from 'antd'
import TextArea                    from 'antd/lib/input/TextArea'
import _, { cloneDeep, findIndex } from 'lodash'
import { useIntl }                 from 'react-intl'

import { Drawer, Select, showActionModal } from '@acx-ui/components'
import { Features }                        from '@acx-ui/feature-toggle'
import {
  ClusterNetworkSettings,
  EdgeClusterStatus,
  EdgeIpModeEnum,
  EdgeLag,
  EdgeLagLacpModeEnum,
  EdgeLagTimeoutEnum,
  EdgeLagTypeEnum,
  EdgePort,
  EdgePortTypeEnum,
  EdgeSerialNumber,
  SubInterface,
  convertEdgeNetworkIfConfigToApiPayload,
  getEdgePortTypeOptions,
  isInterfaceInVRRPSetting,
  validateEdgeGateway
} from '@acx-ui/rc/utils'

import { getEnabledCorePortInfo }           from '../EdgeFormItem/EdgePortsGeneralBase/utils'
import { EdgePortCommonForm }               from '../EdgeFormItem/PortCommonForm'
import { useGetEdgeSdLanByEdgeOrClusterId } from '../EdgeSdLan/useEdgeSdLanActions'
import { useIsEdgeFeatureReady }            from '../useEdgeActions'

import { LagMembersComponent } from './LagMembersComponent'

interface LagDrawerProps {
  clusterId: string
  serialNumber?: EdgeSerialNumber
  visible: boolean
  setVisible: (visible: boolean) => void
  data?: EdgeLag
  portList?: EdgePort[]
  existedLagList?: EdgeLag[]
  vipConfig?: ClusterNetworkSettings['virtualIpSettings']
  onAdd: (serialNumber: string, data: EdgeLag) => Promise<void>
  onEdit: (serialNumber: string, data: EdgeLag) => Promise<void>
  subInterfaceList?: SubInterface[]
  isClusterWizard?: boolean
  clusterInfo: EdgeClusterStatus
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
  lagMembers: [],
  natPools: []
} as Partial<EdgeLag>

export const LagDrawer = (props: LagDrawerProps) => {

  const {
    clusterId = '', serialNumber = '', visible, setVisible,
    data, portList = [], existedLagList = [], vipConfig = [],
    onAdd, onEdit, subInterfaceList = [],
    isClusterWizard,
    clusterInfo
  } = props
  const isEditMode = data?.id !== undefined
  const { $t } = useIntl()
  const isEdgeSdLanHaReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE)
  const isDualWanEnabled = useIsEdgeFeatureReady(Features.EDGE_DUAL_WAN_TOGGLE)

  const portTypeOptions = getEdgePortTypeOptions($t)
    .filter(item => item.value !== EdgePortTypeEnum.UNCONFIGURED)
  const [form] = Form.useForm()
  const lagEnabled = Form.useWatch('lagEnabled', form) as boolean

  const {
    edgeSdLanData
  } = useGetEdgeSdLanByEdgeOrClusterId(isEdgeSdLanHaReady ? clusterId : serialNumber)

  const isEdgeSdLanRun = !!edgeSdLanData

  const subnetInfoForValidation = useMemo(() => {
    return [
      ...portList.filter(port => port.enabled && Boolean(port.ip) && Boolean(port.subnet))
        .map(port => ({ ip: port.ip, subnetMask: port.subnet })),
      ...existedLagList.filter(lag => lag.lagEnabled && Boolean(lag.ip) && Boolean(lag.subnet))
        .map(lag => ({ ip: lag.ip ?? '', subnetMask: lag.subnet ?? '' })),
      // eslint-disable-next-line max-len
      ...subInterfaceList.filter(subInterface => Boolean(subInterface.ip) && Boolean(subInterface.subnet))
        .map(subInterface => ({
          ip: subInterface.ip ?? '',
          subnetMask: subInterface.subnet ?? ''
        }))
    ]
  }, [portList, existedLagList, subInterfaceList])

  useEffect(() => {
    if(visible) {
      form.resetFields()
      const corePortInfo = getEnabledCorePortInfo(portList, existedLagList)
      const hasCorePortEnabled = !!corePortInfo.key

      if (hasCorePortEnabled && !corePortInfo.isExistingCorePortInLagMember) {
        form.setFieldsValue({
          ...defaultFormValues,
          portType: EdgePortTypeEnum.LAN,
          ipMode: EdgeIpModeEnum.STATIC,
          ...data
        })
        return
      }

      form.setFieldsValue({
        ...defaultFormValues,
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
      const payload = convertEdgeNetworkIfConfigToApiPayload(formData) as EdgeLag

      if(data) {
        await onEdit(serialNumber, payload)
        handleClose()
      } else {
        const portConfig = formData.lagMembers.length > 0
          ? portList?.find(item => (formData.lagMembers as EdgeLag['lagMembers'])
            .filter(member => member.portId === item.id)[0])
          : undefined

        if (portConfig?.portType && portConfig?.portType !== EdgePortTypeEnum.UNCONFIGURED) {
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
    if (changedValue === EdgePortTypeEnum.LAN) {
      form.setFieldValue('ipMode', EdgeIpModeEnum.STATIC)
    }
  }

  const getUseableLagOptions = (existedLagList?: EdgeLag[]) => {
    return lagNameOptions.filter(option =>
      !existedLagList?.some(existedLag =>
        existedLag.id === option.value &&
        existedLag.id !== data?.id)) // keep the edit mode data as a selection
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
      name='lagMembers'
      label={$t({ defaultMessage: 'Select LAG members:' })}
      shouldUpdate={(prev, cur) => {
        return prev.lagMembers !== cur.lagMembers
      }}
      children={<LagMembersComponent
        data={data}
        portList={portList}
        existedLagList={existedLagList}
        lagEnabled={lagEnabled}/>}
    />

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
          portsData={portList}
          lagData={getMergedLagData(existedLagList, allValues)}
          isEdgeSdLanRun={isEdgeSdLanRun}
          isListForm={false}
          clusterInfo={clusterInfo}
          formFieldsProps={{
            // we should ONLY apply Edge gateway validator on node level edit LAG
            // because user should be able to configure physical port as WAN port + LAN LAG via cluster wizard
            portType: {
              options: portTypeOptions,
              disabled: isInterfaceInVRRPSetting(serialNumber, `lag${data?.id}`, vipConfig),
              rules: isClusterWizard
                ? undefined
                :[{ validator: () => {
                  const dryRunPorts = cloneDeep(portList ?? [])
                  allValues.lagMembers.forEach(member => {
                    const idx = findIndex(dryRunPorts, { id: member.portId })
                    if (idx >= 0) dryRunPorts[idx].portType = EdgePortTypeEnum.UNCONFIGURED
                  })

                  // eslint-disable-next-line max-len
                  return validateEdgeGateway(dryRunPorts, getMergedLagData(existedLagList, allValues) ?? [], isDualWanEnabled)
                } }]
            },
            corePortEnabled: {
              title: $t({ defaultMessage: 'Use this LAG as Core LAG' })
            },
            enabled: {
              name: 'lagEnabled',
              title: $t({ defaultMessage: 'LAG Enabled' })
            }
          }}
          subnetInfoForValidation={subnetInfoForValidation}
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
