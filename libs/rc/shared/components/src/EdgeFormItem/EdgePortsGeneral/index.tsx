import { ReactNode, useEffect, useRef, useState } from 'react'

import { Form, FormInstance }  from 'antd'
import { StoreValue }          from 'antd/lib/form/interface'
import { flatMap, isEqual }    from 'lodash'
import _                       from 'lodash'
import { ValidateErrorEntity } from 'rc-field-form/es/interface'
import { useIntl }             from 'react-intl'

import { Loader, NoData, StepsForm, Tabs, Tooltip }                      from '@acx-ui/components'
import { Features, useIsSplitOn }                                        from '@acx-ui/feature-toggle'
import { useGetEdgeSdLanViewDataListQuery, useUpdatePortConfigMutation } from '@acx-ui/rc/services'
import { EdgeIpModeEnum, EdgePortTypeEnum, EdgePortWithStatus }          from '@acx-ui/rc/utils'
import { useParams }                                                     from '@acx-ui/react-router-dom'

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
  data.forEach((item, index) => {
    const innerPortFormID = getInnerPortFormID(index)
    tabs.push({
      label: $t({ defaultMessage: 'Port {index}' }, { index: index + 1 }),
      value: innerPortFormID,
      content: <Form.List name={innerPortFormID}>
        {(fields) => fields.map(
          ({ key }) => <PortConfigForm
            formListKey={key}
            key={`${innerPortFormID}_${key}`}
            index={index}
            isEdgeSdLanRun={isEdgeSdLanRun}
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
      const index = Number(changedPortName.toString().split('_')[1])
      if (changedField['portType']) {
        handlePortTypeChange(changedPortName, changedField['portType'], index)
      }

      if (!_.isUndefined(changedField['enabled'])) {
        handlePortEnabledChange(changedPortName, changedField['enabled'], index)
      }

      if (!_.isUndefined(changedField['corePortEnabled'])) {
        handleCorePortChange(changedPortName, changedField['corePortEnabled'], index)
      }

      let hasError = false
      await form.validateFields().catch((error: ValidateErrorEntity) => {
        hasError = error.errorFields.length > 0
      })
      onValuesChange?.(form, hasError)
    }
  }

  const getFieldFullPath = (index: number, fieldName: string) =>
    [getInnerPortFormID(index), 0, fieldName]


  const handlePortTypeChange = (_: string, changedValue: StoreValue,
    index: number) => {
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
      form.setFieldValue(getFieldFullPath(index, 'ipMode'), EdgeIpModeEnum.STATIC)
    } else if (changedValue === EdgePortTypeEnum.WAN) {
      const initialPortType = data[index]?.portType
      if (initialPortType !== EdgePortTypeEnum.WAN) {
        form.setFieldValue(getFieldFullPath(index, 'natEnabled'), true)
      }
    }
  }

  const handleFinish = async () => {
    const formData = flatMap(form.getFieldsValue(true)) as EdgePortWithStatus[]

    formData.forEach(item => {
      // LAN port is not allowed to configure NAT enable
      if (item.portType === EdgePortTypeEnum.LAN && item.natEnabled)
        item.natEnabled = false


      if (item.gateway
        && item.portType === EdgePortTypeEnum.LAN
        && item.corePortEnabled === false) {
        // should clear all non core port LAN port's gateway.
        item.gateway = ''
        // prevent LAN port from using DHCP
        // when it had been core port before but not a core port now.
        item.ipMode = EdgeIpModeEnum.STATIC
      }
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