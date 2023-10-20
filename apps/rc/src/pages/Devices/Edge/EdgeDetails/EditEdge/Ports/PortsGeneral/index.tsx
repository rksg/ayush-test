import { useContext } from 'react'

import { Form, FormInstance } from 'antd'
import { flatMap, isEqual }   from 'lodash'
import { useIntl }            from 'react-intl'

import { EdgePortsGeneral, EdgePortConfigFormType } from '@acx-ui/rc/components'
import { useUpdatePortConfigMutation }              from '@acx-ui/rc/services'
import { EdgePortWithStatus }                       from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }    from '@acx-ui/react-router-dom'

import { EdgeEditContext } from '../..'

interface PortsGeneralProps {
  data: EdgePortWithStatus[]
}

const PortsGeneral = (props: PortsGeneralProps) => {
  const { data } = props
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { serialNumber } = useParams()
  const [form] = Form.useForm<EdgePortConfigFormType>()
  const linkToEdgeList = useTenantLink('/devices/edge')
  const editEdgeContext = useContext(EdgeEditContext)
  const [updatePortConfig] = useUpdatePortConfigMutation()

  const handleFormChange = (_: FormInstance<EdgePortConfigFormType>, hasError: boolean) => {
    const formData = flatMap(form.getFieldsValue(true))

    editEdgeContext.setActiveSubTab({
      key: 'ports-general',
      title: $t({ defaultMessage: 'Ports General' })
    })

    editEdgeContext.setFormControl({
      ...editEdgeContext.formControl,
      isDirty: !isEqual(data, formData),
      hasError,
      discardFn: () => form.resetFields(),
      applyFn: () => handleFormContextApply()
    })
  }

  const handleFormContextApply = async () => {
    const formData = flatMap(form.getFieldsValue(true))

    try {
      await updatePortConfig({
        params: { serialNumber },
        payload: { ports: formData } }).unwrap()
      handleFinish()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleFinish = async () => {
    editEdgeContext.setFormControl({
      ...editEdgeContext.formControl,
      isDirty: false
    })
  }

  const handleCancel = async () => {
    navigate(linkToEdgeList)
  }

  return <EdgePortsGeneral
    form={form}
    data={data}
    onValuesChange={handleFormChange}
    onFinish={handleFinish}
    onCancel={handleCancel}
  />
}

export default PortsGeneral