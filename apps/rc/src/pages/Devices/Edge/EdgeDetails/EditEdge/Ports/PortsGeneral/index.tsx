import { ReactNode, useContext, useEffect, useRef, useState } from 'react'

import { Form }                from 'antd'
import { StoreValue }          from 'antd/lib/form/interface'
import { flatMap, isEqual }    from 'lodash'
import { ValidateErrorEntity } from 'rc-field-form/es/interface'
import { useIntl }             from 'react-intl'

import { Loader, NoData, StepsForm, Tabs }       from '@acx-ui/components'
import { useUpdatePortConfigMutation }           from '@acx-ui/rc/services'
import { EdgeIpModeEnum, EdgePortTypeEnum }      from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { EdgeEditContext } from '../..'

import { EdgePortWithStatus, PortConfigForm } from './PortConfigForm'

export interface PortConfigFormType {
  [key: string]: EdgePortWithStatus[]
}

interface PortsGeneralProps {
  data: EdgePortWithStatus[]
}

interface TabData {
  label: string
  value: string
  content: ReactNode
}

const PortsGeneral = (props: PortsGeneralProps) => {
  const { data } = props
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const linkToEdgeList = useTenantLink('/devices/edge')
  const [currentTab, setCurrentTab] = useState<string>('port_0')
  const [form] = Form.useForm<PortConfigFormType>()
  const [updatePortConfig, { isLoading: isPortConfigUpdating }] = useUpdatePortConfigMutation()
  const editEdgeContext = useContext(EdgeEditContext)
  const dataRef = useRef<EdgePortWithStatus[] | undefined>(undefined)

  let tabs = [] as TabData[]
  let formData = {} as PortConfigFormType
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

      editEdgeContext.setActiveSubTab({
        key: 'ports-general',
        title: $t({ defaultMessage: 'Ports General' })
      })

      const formData = flatMap(form.getFieldsValue(true))
      let hasError = false
      await form.validateFields().catch((error: ValidateErrorEntity) => {
        hasError = error.errorFields.length > 0
      })
      editEdgeContext.setFormControl({
        ...editEdgeContext.formControl,
        isDirty: !isEqual(data, formData),
        hasError,
        discardFn: () => form.resetFields(),
        applyFn: () => handleFinish()
      })
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
      await updatePortConfig({ params: params, payload: { ports: formData } }).unwrap()
      editEdgeContext.setFormControl({
        ...editEdgeContext.formControl,
        isDirty: false
      })
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
          onCancel={() => navigate(linkToEdgeList)}
          onValuesChange={handleFormChange}
          buttonLabel={{ submit: $t({ defaultMessage: 'Apply Ports General' }) }}
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

export default PortsGeneral
