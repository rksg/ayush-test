import { useEffect } from 'react'

import { Modal, Form, Input } from 'antd'
import { useIntl }            from 'react-intl'

import { Select }                                                                                      from '@acx-ui/components'
import { useCreateEdgeTnmHostMutation, useGetEdgeTnmHostGroupListQuery, useUpdateEdgeTnmHostMutation } from '@acx-ui/rc/services'
import {
  EdgeTnmHostFormData,
  EdgeTnmHostSetting,
  edgeTnmHostFormRequestPreProcess,
  generalIpAddressRegExp,
  networkWifiPortRegExp
} from '@acx-ui/rc/utils'

interface TnmHostModalProps {
  serviceId: string
  visible: boolean
  onClose: () => void
  editData: EdgeTnmHostSetting | undefined
}

export const TnmHostModal = (props: TnmHostModalProps) => {
  const { $t } = useIntl()
  const { serviceId, visible, onClose, editData } = props
  const [ form ] = Form.useForm()

  const [addTnmHost, { isLoading: isCreating }] = useCreateEdgeTnmHostMutation()
  const [updateTnmHost, { isLoading: isUpdating }] = useUpdateEdgeTnmHostMutation()

  const { groupOptions, isGroupOptsLoading } = useGetEdgeTnmHostGroupListQuery({
    params: { serviceId }
  }, {
    skip: !serviceId,
    selectFromResult: ({ data, isLoading }) => {
      return {
        groupOptions: data?.map(item => ({ label: item.name, value: item.groupid })),
        isGroupOptsLoading: isLoading
      }
    }
  })

  const handleFinish = async () => {
    const formValues = form.getFieldsValue(true) as EdgeTnmHostFormData

    try {
      await (editData ? updateTnmHost : addTnmHost)({
        params: {
          serviceId,
          hostId: editData ? editData.hostid : undefined
        },
        payload: edgeTnmHostFormRequestPreProcess(formValues)
      }).unwrap()

      onClose()
    } catch(err) {
      // eslint-disable-next-line no-console
      console.log(err)
    }
  }

  useEffect(() => {
    if (visible) {
      form.resetFields()

      if (editData) {
        form.setFieldsValue({
          host: editData.host,
          hostid: editData.hostid,
          groupIds: editData.hostgroups.map(g => g.groupid),
          interface: {
            ...editData.interfaces[0]
          }
        })
      }
    }

  }, [visible, editData])

  return <Modal
    title={editData ? $t({ defaultMessage: 'Edit Host' }) :
      $t({ defaultMessage: 'Create Host' })}
    width={500}
    visible={visible}
    mask
    destroyOnClose
    maskClosable={false}
    onCancel={onClose}
    onOk={() => {form.submit()}}
    okText={editData ? $t({ defaultMessage: 'Apply' }) : $t({ defaultMessage: 'Add' })}
  >
    <Form form={form} onFinish={handleFinish} disabled={isCreating || isUpdating}>
      <Form.Item
        name='host'
        label={$t({ defaultMessage: 'Name' })}
        rules={[{
          required: true,
          message: $t({ defaultMessage: 'Please input name' })
        }]}
        children={<Input />}
      />
      <Form.Item
        name='groupIds'
        label={$t({ defaultMessage: 'Host Group' })}
        rules={[{
          required: true,
          message: $t({ defaultMessage: 'Please select host group' })
        }]}
        children={<Select
          loading={isGroupOptsLoading}
          options={groupOptions}
          mode='multiple'
          showSearch
          showArrow
          allowClear
          optionFilterProp='label'
        />}
      />
      <Form.Item
        name={['interface', 'ip']}
        label={$t({ defaultMessage: 'IP Address' })}
        rules={[
          { required: true },
          { validator: (_, value) => generalIpAddressRegExp(value) }
        ]}
        children={<Input />}
      />
      <Form.Item
        name={['interface', 'port']}
        label={$t({ defaultMessage: 'Port' })}
        rules={[
          { required: true },
          { validator: (_, value) => networkWifiPortRegExp(value) }
        ]}
        children={<Input type='number' />}
      />
    </Form>
  </Modal>
}