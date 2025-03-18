
import { useContext, useState } from 'react'

import { Form, FormInstance }  from 'antd'
import { StoreValue }          from 'antd/lib/form/interface'
import { flatMap, isEqual }    from 'lodash'
import { ValidateErrorEntity } from 'rc-field-form/es/interface'
import { useIntl }             from 'react-intl'

import { Loader, NoData, StepsForm } from '@acx-ui/components'
import {
  EdgePortConfigFormType,
  EdgePortsGeneralBase,
  EdgeEditContext,
  getFieldFullPath,
  transformApiDataToFormListData,
  useGetEdgeSdLanByEdgeOrClusterId
} from '@acx-ui/rc/components'
import { useUpdatePortConfigMutation } from '@acx-ui/rc/services'
import {
  EdgeIpModeEnum,
  EdgePortTypeEnum,
  EdgePortWithStatus,
  EdgeUrlsInfo,
  convertEdgePortsConfigToApiPayload } from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { hasPermission }                         from '@acx-ui/user'
import { getOpsApi }                             from '@acx-ui/utils'

import { ClusterNavigateWarning } from '../ClusterNavigateWarning'
import { EditEdgeDataContext }    from '../EditEdgeDataProvider'

const Ports = () => {
  const { serialNumber } = useParams()
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToEdgeList = useTenantLink('/devices/edge')
  const [form] = Form.useForm<EdgePortConfigFormType>()
  const [activeTab, setActiveTab] = useState<string>()
  const editEdgeContext = useContext(EdgeEditContext.EditContext)
  const {
    clusterInfo, portData, portStatus,
    lagData, isFetching, isCluster, clusterConfig
  } = useContext(EditEdgeDataContext)
  const [updatePortConfig] = useUpdatePortConfigMutation()

  const {
    edgeSdLanData,
    isLoading: isEdgeSdLanLoading,
    isFetching: isEdgeSdLanFetching
  } = useGetEdgeSdLanByEdgeOrClusterId(clusterInfo?.clusterId)

  const handleFormChange = async (changedValues: Object) => {
    // due to form.List, must use the trailling 0
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
      formData[idx] = convertEdgePortsConfigToApiPayload(item) as EdgePortWithStatus
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

  return <Loader states={[{
    isLoading: isEdgeSdLanLoading,
    isFetching: isFetching || isEdgeSdLanFetching
  }]}>
    {
      isCluster && <ClusterNavigateWarning />
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
          disabled={isCluster}
        >
          <StepsForm.StepForm onFinishFailed={handleFinishFailed}>
            <EdgePortsGeneralBase
              statusData={portStatus}
              lagData={lagData}
              isEdgeSdLanRun={!!edgeSdLanData}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              isCluster={isCluster}
              vipConfig={clusterConfig?.virtualIpSettings?.virtualIps}
            />
          </StepsForm.StepForm>
        </StepsForm>
        : <NoData />
    }
  </Loader>
}

export default Ports