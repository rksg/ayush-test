import { useContext, useState } from 'react'

import { Form, FormInstance }  from 'antd'
import { StoreValue }          from 'antd/lib/form/interface'
import { flatMap, isEqual }    from 'lodash'
import { ValidateErrorEntity } from 'rc-field-form/es/interface'
import { useIntl }             from 'react-intl'

import { Loader, NoData, StepsForm }                                                                from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                   from '@acx-ui/feature-toggle'
import { useGetEdgeSdLanViewDataListQuery, useUpdatePortConfigMutation }                            from '@acx-ui/rc/services'
import { EdgeIpModeEnum, EdgePortTypeEnum, EdgePortWithStatus, convertEdgePortsConfigToApiPayload } from '@acx-ui/rc/utils'

import { EdgePortTabEnum }                                  from '..'
import { EditContext }                                      from '../../EdgeEditContext'
import { EdgePortConfigFormType, EdgePortsGeneralBase }     from '../../EdgePortsGeneralBase'
import { getFieldFullPath, transformApiDataToFormListData } from '../../EdgePortsGeneralBase/utils'
import { EdgePortsDataContext }                             from '../PortDataProvider'

interface PortsGeneralProps {
  serialNumber: string
  onFinish?: (formValues?: EdgePortWithStatus[]) => Promise<void>
  onCancel: () => void
  onValuesChange?: (form: FormInstance<EdgePortConfigFormType>, hasError: boolean) => void
  buttonLabel?: {
    submit?: string;
    cancel?: string;
  }
}

const PortsGeneral = (props: PortsGeneralProps) => {
  const { serialNumber, onCancel, buttonLabel } = props
  const { $t } = useIntl()
  const isEdgeSdLanReady = useIsSplitOn(Features.EDGES_SD_LAN_TOGGLE)
  const [form] = Form.useForm<EdgePortConfigFormType>()
  const [activeTab, setActiveTab] = useState<string|undefined>()
  const editEdgeContext = useContext(EditContext)
  const { portData, portStatus, lagData, isFetching } = useContext(EdgePortsDataContext)
  const [updatePortConfig] = useUpdatePortConfigMutation()

  const { edgeSdLanData, isEdgeSdLanFetching }
    = useGetEdgeSdLanViewDataListQuery(
      { payload: {
        filters: { edgeId: [serialNumber] },
        fields: ['id', 'edgeId', 'corePortMac']
      } },
      {
        skip: !isEdgeSdLanReady,
        selectFromResult: ({ data, isFetching }) => ({
          edgeSdLanData: data?.data?.[0],
          isEdgeSdLanFetching: isFetching
        })
      }
    )

  const handleFormChange = async (changedValues: Object) => {
    const changedField = Object.values(changedValues)?.[0]?.[0]
    if(changedField) {
      const changedPortName = Object.keys(changedValues)?.[0]
      const id = changedPortName.toString().split('_')[1]
      if (changedField['portType']) {
        handlePortTypeChange(changedPortName, changedField['portType'], id)
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
      key: EdgePortTabEnum.PORTS_GENERAL,
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
    id: string) => {
    // TODO: need to confirm if we should display this whenever user change port type
    // if (isEdgeSdLanReady && isEdgeSdLanRun) {
    //   showActionModal({
    //     type: 'info',
    //     content: $t({ defaultMessage: `
    //   Please make sure that you are choosing the correct port type.
    //   Wrong port type change may impact the network connection.` })
    //   })
    // }

    if (changedValue === EdgePortTypeEnum.LAN || changedValue === EdgePortTypeEnum.CLUSTER) {
      form.setFieldValue(getFieldFullPath(id, 'ipMode'), EdgeIpModeEnum.STATIC)
    } else if (changedValue === EdgePortTypeEnum.WAN) {
      const initialPortType = portData.find(port => port.id === id)?.portType
      if (initialPortType !== EdgePortTypeEnum.WAN) {
        form.setFieldValue(getFieldFullPath(id, 'natEnabled'), true)
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
        params: { serialNumber },
        payload: { ports: formData } }).unwrap()
      handleFinishPostProcess()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleFinishFailed = (errorInfo: ValidateErrorEntity) => {
    const firstErrorTab = errorInfo.errorFields?.[0].name?.[0].toString()
    if(firstErrorTab) {
      setActiveTab(firstErrorTab)
    }
  }

  return <Loader states={[{
    isLoading: isFetching || isEdgeSdLanFetching
  }]}>
    {portData.length > 0 ?
      <StepsForm
        form={form}
        initialValues={transformApiDataToFormListData(portData)}
        onFinish={handleFinish}
        onCancel={onCancel}
        onValuesChange={handleFormChange}
        buttonLabel={buttonLabel ?? { submit: $t({ defaultMessage: 'Apply Ports General' }) }}
      >
        <StepsForm.StepForm onFinishFailed={handleFinishFailed}>
          <EdgePortsGeneralBase<EdgePortConfigFormType>
            form={form}
            statusData={portStatus}
            lagData={lagData}
            isEdgeSdLanRun={!!edgeSdLanData}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </StepsForm.StepForm>
      </StepsForm>
      : <NoData />}
  </Loader>
}

export default PortsGeneral