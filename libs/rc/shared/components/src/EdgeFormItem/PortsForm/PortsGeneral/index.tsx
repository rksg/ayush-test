import { useContext } from 'react'

import { Form, FormInstance } from 'antd'
import { flatMap, isEqual }   from 'lodash'
import { useIntl }            from 'react-intl'

import { useUpdatePortConfigMutation } from '@acx-ui/rc/services'
import { EdgePortWithStatus }          from '@acx-ui/rc/utils'

import { EdgePortTabEnum }                          from '..'
import { EditContext }                              from '../../EdgeEditContext'
import { EdgePortConfigFormType, EdgePortsGeneral } from '../../EdgePortsGeneral'
import { EdgePortsDataContext }                     from '../PortDataProvider'

interface PortsGeneralProps {
  serialNumber: string
  onCancel: () => void
}

const PortsGeneral = (props: PortsGeneralProps) => {
  const { serialNumber, onCancel } = props
  const { $t } = useIntl()
  const [form] = Form.useForm<EdgePortConfigFormType>()
  const editEdgeContext = useContext(EditContext)
  const portsData = useContext(EdgePortsDataContext)
  const data = portsData.portData as EdgePortWithStatus[]
  const [updatePortConfig] = useUpdatePortConfigMutation()

  const handleFormChange = (_: FormInstance<EdgePortConfigFormType>, hasError: boolean) => {
    const formData = flatMap(form.getFieldsValue(true))

    editEdgeContext.setActiveSubTab({
      key: EdgePortTabEnum.PORTS_GENERAL,
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
    onCancel()
  }

  return <EdgePortsGeneral
    form={form}
    data={data}
    edgeId={serialNumber}
    onValuesChange={handleFormChange}
    onFinish={handleFinish}
    onCancel={handleCancel}
  />
}

export default PortsGeneral