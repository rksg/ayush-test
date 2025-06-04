
import { useContext, useState } from 'react'

import { Form, FormInstance }     from 'antd'
import { StoreValue }             from 'antd/lib/form/interface'
import { flatMap, isEqual }       from 'lodash'
import { ValidateErrorEntity }    from 'rc-field-form/es/interface'
import { defineMessage, useIntl } from 'react-intl'

import { Loader, NoData, StepsForm } from '@acx-ui/components'
import { Features }                  from '@acx-ui/feature-toggle'
import {
  EdgePortConfigFormType,
  EdgePortsGeneralBase,
  EdgeEditContext,
  getFieldFullPath,
  transformApiDataToFormListData,
  useGetEdgeSdLanByEdgeOrClusterId,
  useIsEdgeFeatureReady
} from '@acx-ui/rc/components'
import { useUpdatePortConfigMutation }     from '@acx-ui/rc/services'
import {
  EdgeIpModeEnum,
  EdgePortTypeEnum,
  EdgePortWithStatus,
  EdgeUrlsInfo,
  convertEdgeNetworkIfConfigToApiPayload } from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { hasPermission }                         from '@acx-ui/user'
import { getOpsApi }                             from '@acx-ui/utils'

import { ClusterNavigateWarning } from '../ClusterNavigateWarning'
import { EditEdgeDataContext }    from '../EditEdgeDataProvider'

const Ports = () => {
  const { serialNumber } = useParams()
  const { $t } = useIntl()
  const isEdgeDualWanEnabled = useIsEdgeFeatureReady(Features.EDGE_DUAL_WAN_TOGGLE)
  // eslint-disable-next-line max-len
  const isEdgeCoreAccessSeparationReady = useIsEdgeFeatureReady(Features.EDGE_CORE_ACCESS_SEPARATION_TOGGLE)

  const navigate = useNavigate()
  const linkToEdgeList = useTenantLink('/devices/edge')
  const [form] = Form.useForm<EdgePortConfigFormType>()
  const [activeTab, setActiveTab] = useState<string>()
  const editEdgeContext = useContext(EdgeEditContext.EditContext)
  const {
    clusterInfo, portData, portStatus,
    lagData, isFetching, isClusterFormed, clusterConfig,
    isSupportAccessPort, subInterfaceData
  } = useContext(EditEdgeDataContext)

  const [updatePortConfig] = useUpdatePortConfigMutation()

  const {
    edgeSdLanData,
    isLoading: isEdgeSdLanLoading,
    isFetching: isEdgeSdLanFetching
  } = useGetEdgeSdLanByEdgeOrClusterId(clusterInfo?.clusterId)

  const subInterfaceList = subInterfaceData?.flatMap(item => item.subInterfaces) ?? []

  const handleFormChange = async (changedValues: Object) => {
    // due to form.List, must use the trailing 0
    const changedField = Object.values(changedValues)?.[0]?.[0]
    if(changedField) {
      const changedPortName = Object.keys(changedValues)?.[0]
      const interfaceName = changedPortName.toString()
      if (changedField['portType']) {
        handlePortTypeChange(changedPortName, changedField['portType'], interfaceName)
      }

      let hasError = false
      await form.validateFields().catch((error: ValidateErrorEntity) => {
        hasError = error.errorFields.length > 0
      })
      handleFormChangePostProcess(form, hasError)
    }
  }

  const handleFormChangePostProcess =
  (_: FormInstance<EdgePortConfigFormType>, hasError: boolean) => {
    const formData = flatMap(form.getFieldsValue(true))

    editEdgeContext.setActiveSubTab({
      key: EdgeEditContext.EdgePortTabEnum.PORTS_GENERAL,
      title: $t({ defaultMessage: 'Ports General' })
    })

    editEdgeContext.setFormControl({
      ...editEdgeContext.formControl,
      isDirty: !isEqual(portData, formData),
      hasError,
      discardFn: () => form.resetFields(),
      applyFn: () => handleFinish()
    })
  }

  const handlePortTypeChange = (_: string, changedValue: StoreValue,
    interfaceName: string) => {
    // TODO: need to confirm if we should display this whenever user change port type
    // if (isEdgeSdLanReady && isEdgeSdLanRun) {
    //   showActionModal({
    //     type: 'info',
    //     content: $t({ defaultMessage: `
    //   Please make sure that you are choosing the correct port type.
    //   Wrong port type change may impact the network connection.` })
    //   })
    // }

    if (changedValue === EdgePortTypeEnum.LAN) {
      form.setFieldValue(getFieldFullPath(interfaceName, 'ipMode'), EdgeIpModeEnum.STATIC)
    } else if (changedValue === EdgePortTypeEnum.WAN) {
      const initialPortType = portData.find(port => port.interfaceName === interfaceName)?.portType
      if (initialPortType !== EdgePortTypeEnum.WAN) {
        form.setFieldValue(getFieldFullPath(interfaceName, 'natEnabled'), true)
      }
    }
  }

  const handleFinishPostProcess = async () => {
    editEdgeContext.setFormControl({
      ...editEdgeContext.formControl,
      isDirty: false
    })
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const handleFinish = async () => {
    const formData = flatMap(form.getFieldsValue(true)) as EdgePortWithStatus[]
    formData.forEach((item, idx) => {
      // eslint-disable-next-line max-len
      formData[idx] = convertEdgeNetworkIfConfigToApiPayload(item, isEdgeCoreAccessSeparationReady) as EdgePortWithStatus
    })

    try {
      await updatePortConfig({
        params: {
          venueId: clusterInfo?.venueId,
          edgeClusterId: clusterInfo?.clusterId,
          serialNumber
        },
        payload: { ports: formData } }).unwrap()
      handleFinishPostProcess()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleFinishFailed = (errorInfo: ValidateErrorEntity) => {
    const firstErrorTab = errorInfo.errorFields?.[0].name?.[0].toString()
    if(firstErrorTab !== 'validate') {
      setActiveTab(firstErrorTab)
    }
  }

  const formData = transformApiDataToFormListData(portData)

  const onCancel = () => {
    navigate(linkToEdgeList)
  }

  const hasUpdatePermission = hasPermission({
    rbacOpsIds: [
      getOpsApi(EdgeUrlsInfo.updatePortConfig)
    ] })


  const disabledWholeForm = isClusterFormed || isEdgeDualWanEnabled

  return <Loader states={[{
    isLoading: isEdgeSdLanLoading,
    isFetching: isFetching || isEdgeSdLanFetching
  }]}>
    {
      disabledWholeForm &&
       <ClusterNavigateWarning
         warningMsgDescriptor={isClusterFormed
           ? undefined
           : defineMessage({
             defaultMessage: `Please go to “{redirectLink}” to modify the configurations
                for all nodes in this cluster ({clusterName})` })
         }
       />
    }
    {
      portData.length > 0 ?
        <StepsForm
          form={form}
          initialValues={formData}
          onFinish={handleFinish}
          onCancel={onCancel}
          onValuesChange={handleFormChange}
          buttonLabel={{
            submit: hasUpdatePermission ? $t({ defaultMessage: 'Apply Ports General' }) : '' }}
          disabled={disabledWholeForm}
        >
          <StepsForm.StepForm onFinishFailed={handleFinishFailed}>
            <EdgePortsGeneralBase
              statusData={portStatus}
              lagData={lagData}
              isEdgeSdLanRun={!!edgeSdLanData}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              disabled={disabledWholeForm}
              vipConfig={clusterConfig?.virtualIpSettings?.virtualIps}
              clusterInfo={clusterInfo!}
              isSupportAccessPort={isSupportAccessPort}
              subInterfaceList={subInterfaceList}
            />
          </StepsForm.StepForm>
        </StepsForm>
        : <NoData />
    }
  </Loader>
}

export default Ports