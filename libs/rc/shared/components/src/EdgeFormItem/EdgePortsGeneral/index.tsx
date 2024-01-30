import { ReactNode, useContext, useEffect, useRef, useState } from 'react'

import { Form, FormInstance }  from 'antd'
import { StoreValue }          from 'antd/lib/form/interface'
import { flatMap, isEqual }    from 'lodash'
import { ValidateErrorEntity } from 'rc-field-form/es/interface'
import { useIntl }             from 'react-intl'

import { Loader, NoData, StepsForm, Tabs, Tooltip }                                                                         from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                                           from '@acx-ui/feature-toggle'
import { useGetEdgeSdLanViewDataListQuery, useUpdatePortConfigMutation }                                                    from '@acx-ui/rc/services'
import { convertEdgePortsConfigToApiPayload, EdgeIpModeEnum, EdgePortTypeEnum, EdgePortWithStatus, getEdgePortDisplayName } from '@acx-ui/rc/utils'
import { useParams }                                                                                                        from '@acx-ui/react-router-dom'

import { EdgePortsDataContext } from '../PortsForm/PortDataProvider'

import { PortConfigForm }     from './PortConfigForm'
import { getInnerPortFormID } from './utils'

export interface EdgePortConfigFormType {
  [portId: string]: EdgePortWithStatus[]
}

interface TabData {
  label: string
  value: string
  content: ReactNode
  isLagPort?: boolean
}

interface PortsGeneralProps {
  data: EdgePortWithStatus[]
  form?: FormInstance<EdgePortConfigFormType>;
  onValuesChange?: (form: FormInstance<EdgePortConfigFormType>, hasError: boolean) => void
  onFinish?: () => void
  onCancel?: () => void
  buttonLabel?: {
    submit?: string;
    cancel?: string;
  }
  edgeId?: string;
}

export const EdgePortsGeneral = (props: PortsGeneralProps) => {
  const { data, onValuesChange, onFinish, onCancel, buttonLabel, edgeId } = props
  const { $t } = useIntl()
  const params = useParams()
  const isEdgeSdLanReady = useIsSplitOn(Features.EDGES_SD_LAN_TOGGLE)
  const [form] = Form.useForm(props.form)
  const [currentTab, setCurrentTab] = useState<string>('')
  const portsData = useContext(EdgePortsDataContext)
  const lagData = portsData.lagData
  const [updatePortConfig, { isLoading: isPortConfigUpdating }] = useUpdatePortConfigMutation()
  const dataRef = useRef<EdgePortWithStatus[] | undefined>(undefined)
  const edgeSN = edgeId ?? params.serialNumber

  const getEdgeSdLanPayload = {
    filters: { edgeId: [edgeSN] },
    fields: ['id', 'edgeId', 'corePortMac']
  }
  const { edgeSdLanData, isLoading: isEdgeSdLanLoading }
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

  let unLagPort = ''
  let tabs = [] as TabData[]
  let formData = {} as EdgePortConfigFormType
  data.forEach((item) => {
    const innerPortFormID = getInnerPortFormID(item.id)
    tabs.push({
      label: getEdgePortDisplayName(item),
      value: innerPortFormID,
      content: <Form.List name={innerPortFormID}>
        {(fields) => fields.map(
          ({ key }) => <PortConfigForm
            formListKey={key}
            key={`${innerPortFormID}_${key}`}
            id={item.id}
            isEdgeSdLanRun={isEdgeSdLanRun}
            lagData={lagData}
          />
        )}
      </Form.List>,
      isLagPort: item.isLagPort
    })
    if(!unLagPort && !item.isLagPort) {
      unLagPort = innerPortFormID
    }
    formData[innerPortFormID] = [item]
  })

  useEffect(() => {
    if(!dataRef.current) {
      dataRef.current = data
      return
    }
    if(!isEqual(dataRef.current, data)) {
      dataRef.current = data
      form.resetFields()
    }
  }, [data])

  useEffect(() => {
    setCurrentTab(unLagPort)
  }, [unLagPort])

  const handleTabChange = (value: string) => {
    setCurrentTab(value)
  }

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
      onValuesChange?.(form, hasError)
    }
  }

  const getFieldFullPath = (id: string, fieldName: string) =>
    [getInnerPortFormID(id), 0, fieldName]


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
      const initialPortType = data.find(port => port.id === id)?.portType
      if (initialPortType !== EdgePortTypeEnum.WAN) {
        form.setFieldValue(getFieldFullPath(id, 'natEnabled'), true)
      }
    }
  }

  const handleFinish = async () => {
    const formData = flatMap(form.getFieldsValue(true)) as EdgePortWithStatus[]
    formData.forEach((item, idx) => {
      formData[idx] = convertEdgePortsConfigToApiPayload(item) as EdgePortWithStatus
    })

    try {
      await updatePortConfig({
        params: { serialNumber: edgeSN },
        payload: { ports: formData } }).unwrap()
      onFinish?.()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleFinishFailed = (errorInfo: ValidateErrorEntity) => {
    const firstErrorTab = errorInfo.errorFields?.[0].name?.[0].toString()
    if(firstErrorTab) {
      setCurrentTab(firstErrorTab)
    }
  }

  return (
    data.length > 0 ?
      <Loader states={[{
        isLoading: isEdgeSdLanLoading,
        isFetching: isPortConfigUpdating
      }]}>
        <StepsForm
          form={form}
          initialValues={formData}
          onFinish={handleFinish}
          onCancel={onCancel}
          onValuesChange={handleFormChange}
          buttonLabel={buttonLabel ?? { submit: $t({ defaultMessage: 'Apply Ports General' }) }}
        >
          <StepsForm.StepForm onFinishFailed={handleFinishFailed}>
            <Tabs activeKey={currentTab} onChange={handleTabChange} type='third'>
              {
                tabs.map(item =>
                  <Tabs.TabPane
                    tab={
                      item.isLagPort ?
                        <Tooltip title={$t({ defaultMessage: `This port is a LAG member 
                          and cannot be configured independently.` })}>
                          {item.label}
                        </Tooltip> :
                        item.label
                    }
                    key={item.value}
                    children={item.content}
                    disabled={item.isLagPort} />
                )
              }
            </Tabs>
          </StepsForm.StepForm>
        </StepsForm>
      </Loader>
      : <NoData />
  )
}