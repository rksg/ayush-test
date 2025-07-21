import { Form } from 'antd'

import { OltForm }                    from '@acx-ui/edge/components'
import { useAddEdgeOltMutation }      from '@acx-ui/rc/services'
import { EdgeNokiaOltCreateFormData } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'


export const AddOltForm = () => {
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/optical/')
  const [form] = Form.useForm()

  const [addOlt] = useAddEdgeOltMutation()
  // const [updateOlt, { isLoading: isUpdating }] = useUpdateEdgeOltMutation()

  const onFinish = async (data: EdgeNokiaOltCreateFormData) => {
    try {
      await addOlt({
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
    <OltForm
      form={form}
      editMode={false}
      onFinish={onFinish}
    />
  )
}

export default AddOltForm