import { useContext } from 'react'

import { FormInstance }     from 'antd'
import { flatMap, isEqual } from 'lodash'
import { useIntl }          from 'react-intl'

import { EdgePortsGeneral, EdgePortConfigFormType } from '@acx-ui/rc/components'
import { EdgePortWithStatus }                       from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }               from '@acx-ui/react-router-dom'

import { EdgeEditContext } from '../..'

interface PortsGeneralProps {
  data: EdgePortWithStatus[]
}

const PortsGeneral = (props: PortsGeneralProps) => {
  const { data } = props
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToEdgeList = useTenantLink('/devices/edge')
  const editEdgeContext = useContext(EdgeEditContext)

  const handleFormChange = (form: FormInstance<EdgePortConfigFormType>, hasError: boolean) => {
    const formData = flatMap(form.getFieldsValue(true))

    editEdgeContext.setActiveSubTab({
      key: 'ports-general',
      title: $t({ defaultMessage: 'Ports General' })
    })

    editEdgeContext.setFormControl({
      ...editEdgeContext.formControl,
      isDirty: !isEqual(data, formData),
      hasError,
      discardFn: () => form.resetFields,
      applyFn: () => handleFinish
    })
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
    data={data}
    onValuesChange={handleFormChange}
    onFinish={handleFinish}
    onCancel={handleCancel}
  />
}

export default PortsGeneral