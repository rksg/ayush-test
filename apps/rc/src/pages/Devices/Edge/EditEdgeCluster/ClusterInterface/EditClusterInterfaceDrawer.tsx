import { useEffect } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Drawer }                          from '@acx-ui/components'
import { EdgeClusterInterfaceSettingForm } from '@acx-ui/rc/components'
import {
  EdgePortInfo
} from '@acx-ui/rc/utils'

import { ClusterInterfaceTableType } from '.'

interface EditClusterInterfaceDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  handleFinish: (data: ClusterInterfaceTableType) => void
  interfaceList?: EdgePortInfo[]
  editData?: ClusterInterfaceTableType
  allNodeData?: ClusterInterfaceTableType[]
}

export const EditClusterInterfaceDrawer = (props: EditClusterInterfaceDrawerProps) => {
  const {
    visible, setVisible, handleFinish: finish, interfaceList, editData,
    allNodeData
  } = props
  const { $t } = useIntl()
  const [form] = Form.useForm()

  useEffect(() => {
    if (visible){
      form.setFieldsValue({
        ...editData,
        ip: editData?.ip?.split('/')[0]
      })
    }
  }, [editData])

  const handleClose = () => {
    setVisible(false)
  }

  const handleFinish = () => {
    finish(form.getFieldsValue(true))
    setVisible(false)
  }

  const handleSave = async () => {
    form.submit()
  }

  const drawerContent = (
    <Form
      form={form}
      onFinish={handleFinish}
      layout='vertical'
    >
      <EdgeClusterInterfaceSettingForm
        form={form}
        interfaceList={interfaceList}
        currentNodetData={editData}
        allNodeData={allNodeData}
      />
    </Form>
  )

  const footer = (
    <Drawer.FormFooter
      buttonLabel={{
        save: $t({ defaultMessage: 'OK' })
      }}
      onCancel={handleClose}
      onSave={handleSave}
    />
  )

  return (
    <Drawer
      title={$t(
        { defaultMessage: 'Select Cluster Interface: {nodeName}' },
        { nodeName: editData?.nodeName }
      )}
      visible={visible}
      onClose={handleClose}
      children={drawerContent}
      footer={footer}
      width={'400px'}
    />
  )
}
