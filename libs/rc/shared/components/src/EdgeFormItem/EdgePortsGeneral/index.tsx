import { ReactNode, useEffect, useRef, useState } from 'react'

import { Form, FormInstance }  from 'antd'
import { StoreValue }          from 'antd/lib/form/interface'
import { flatMap, isEqual }    from 'lodash'
import { ValidateErrorEntity } from 'rc-field-form/es/interface'
import { useIntl }             from 'react-intl'

import { Loader, NoData, StepsForm, Tabs }                      from '@acx-ui/components'
import { useUpdatePortConfigMutation }                          from '@acx-ui/rc/services'
import { EdgeIpModeEnum, EdgePortTypeEnum, EdgePortWithStatus } from '@acx-ui/rc/utils'
import { useParams }                                            from '@acx-ui/react-router-dom'

import { PortConfigForm } from './PortConfigForm'

export interface EdgePortConfigFormType {
  [portId: string]: EdgePortWithStatus[]
}

interface TabData {
  label: string
  value: string
  content: ReactNode
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
  const [form] = Form.useForm(props.form)
  const [currentTab, setCurrentTab] = useState<string>('port_0')
  const [updatePortConfig, { isLoading: isPortConfigUpdating }] = useUpdatePortConfigMutation()
  const dataRef = useRef<EdgePortWithStatus[] | undefined>(undefined)

  let tabs = [] as TabData[]
  let formData = {} as EdgePortConfigFormType
  data.forEach((item, index) => {
    tabs.push({
      label: $t({ defaultMessage: 'Port {index}' }, { index: index + 1 }),
      value: `port_${index}`,
      content: <Form.List name={`port_${index}`}>
        {(fields) => fields.map(
          ({ key }) => <PortConfigForm
            formListKey={key}
            key={`port_${index}_${key}`}
            index={index}
          />
        )}
      </Form.List>
    })
    formData[`port_${index}`] = [item]
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

  const handleTabChange = (value: string) => {
    setCurrentTab(value)
  }

  const handleFormChange = async (changedValues: Object) => {
    const changedField = Object.values(changedValues)?.[0]?.[0]
    if(changedField) {
      if (changedField['portType']) {
        const changedPortName = Object.keys(changedValues)?.[0]
        const index = Number(changedPortName.toString().split('_')[1])
        handlePortTypeChange(changedPortName, changedField['portType'], index)
      }

      let hasError = false
      await form.validateFields().catch((error: ValidateErrorEntity) => {
        hasError = error.errorFields.length > 0
      })
      onValuesChange?.(form, hasError)
    }
  }

  const handlePortTypeChange = (changedPortName: string, changedValue: StoreValue,
    index: number) => {
    if (changedValue === EdgePortTypeEnum.LAN) {
      form.setFieldValue([changedPortName, 0, 'ipMode'], EdgeIpModeEnum.STATIC)
    } else if (changedValue === EdgePortTypeEnum.WAN) {
      const initialPortType = data[index]?.portType
      if (initialPortType !== EdgePortTypeEnum.WAN) {
        form.setFieldValue([changedPortName, 0, 'natEnabled'], true)
      }
    }
  }

  const handleFinish = async () => {
    const formData = flatMap(form.getFieldsValue(true))

    try {
      await updatePortConfig({
        params: { serialNumber: edgeId ?? params.serialNumber },
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
        isLoading: false,
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
                    tab={item.label}
                    key={item.value}
                    children={item.content} />
                )
              }
            </Tabs>
          </StepsForm.StepForm>
        </StepsForm>
      </Loader>
      : <NoData />
  )
}