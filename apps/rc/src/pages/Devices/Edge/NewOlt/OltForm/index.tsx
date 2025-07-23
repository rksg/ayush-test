import { Form } from 'antd'

import { useAddEdgeOltMutation, useUpdateEdgeOltMutation } from '@acx-ui/rc/services'
import { EdgeNokiaOltCreateFormData }                      from '@acx-ui/rc/utils'
import { useParams, useNavigate, useTenantLink }           from '@acx-ui/react-router-dom'

import { OltForm as OltFormComponent } from './OltForm'

const OltForm = () => {
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/optical/')
  const [form] = Form.useForm()
  const { action } = useParams()
  const editMode = action === 'edit'

  const [addOlt] = useAddEdgeOltMutation()
  const [updateOlt] = useUpdateEdgeOltMutation()

  const onFinish = async (data: EdgeNokiaOltCreateFormData) => {
    try {
      await (editMode ? updateOlt : addOlt)({
        // params: {
        //   venueId: formValues.venueId,
        //   edgeClusterId: formValues.edgeClusterId,
        //   ...(isEditMode ? { oltId: editData?.serialNumber } : {})
        // },
        // payload: {
        //   name: formValues.name,
        //   ip: formValues.ip
        // }
        payload: data
      }).unwrap()
      navigate(`${basePath.pathname}`)

    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error)
    }
  }

  return (
    <OltFormComponent
      form={form}
      editMode={editMode}
      onFinish={onFinish}
    />
  )
}

export default OltForm