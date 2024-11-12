import { useEffect } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Drawer }                    from '@acx-ui/components'
import { useAddEdgeClusterMutation } from '@acx-ui/rc/services'

import { EdgeClusterCommonForm, EdgeClusterCommonFormData } from '../EdgeFormItem/EdgeClusterCommonForm'

interface AddClusterDrawerProps {
  venueId?: string
  visible: boolean
  setVisible: (visible: boolean) => void
}

export const AddClusterDrawer = (props: AddClusterDrawerProps) => {
  const { venueId, visible, setVisible } = props
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const [addEdgeCluster] = useAddEdgeClusterMutation()

  useEffect(() => {
    let disabledFields
    if(venueId) {
      disabledFields = ['venue']
    }
    form.setFieldsValue({
      venueId,
      disabledFields
    })
  }, [venueId, visible])

  const handleClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const handleSave = async () => {
    form.submit()
  }

  const handleFinish = async (data: EdgeClusterCommonFormData) => {
    try {
      const params = { venueId: data.venueId }
      await addEdgeCluster({ params, payload: data }).unwrap()
      handleClose()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const drawerContent = <Form
    layout='vertical'
    form={form}
    onFinish={handleFinish}
  >
    <EdgeClusterCommonForm />
  </Form>

  const footer = (
    <Drawer.FormFooter
      buttonLabel={{
        save: $t({ defaultMessage: 'Add' })
      }}
      onCancel={handleClose}
      onSave={handleSave}
    />
  )

  return (
    <Drawer
      title={$t({ defaultMessage: 'Add Cluster' })}
      visible={visible}
      onClose={handleClose}
      children={drawerContent}
      footer={footer}
    />
  )
}
