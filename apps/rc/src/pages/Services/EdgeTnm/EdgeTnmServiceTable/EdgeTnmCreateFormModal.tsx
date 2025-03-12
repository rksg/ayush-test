import { Modal, Form, Select } from 'antd'
import { useIntl }             from 'react-intl'

import { useVenuesListQuery, useGetEdgeClusterListQuery, useAddEdgeTnmServiceMutation } from '@acx-ui/rc/services'
import { EdgeTnmCreateFormData }                                                        from '@acx-ui/rc/utils'

const venueOptionsDefaultPayload = {
  fields: [ 'name', 'id', 'edges' ],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

const clusterDataDefaultPayload = {
  fields: ['name', 'clusterId', 'venueId'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}


interface EdgeTnmCreateFormModalProps {
  visible: boolean
  setVisible: (v: boolean) => void
  editMode?: boolean
}

export const EdgeTnmCreateFormModal = (props: EdgeTnmCreateFormModalProps) => {
  const { $t } = useIntl()
  const { visible, setVisible } = props

  const [addEdgeTnmService, { isLoading: isCreating }] = useAddEdgeTnmServiceMutation()

  const [ form ] = Form.useForm()
  const venueId = Form.useWatch('venueId', form)

  const {
    venueOptions, isVenueOptsLoading
  } = useVenuesListQuery(
    {
      payload: venueOptionsDefaultPayload
    }, {
      skip: !visible,
      selectFromResult: ({ data, isLoading }) => {
        return {
          venueOptions: data?.data.filter(item => (item.edges ?? 0) > 0)
            .map(item => ({ label: item.name, value: item.id })),
          isVenueOptsLoading: isLoading
        }
      }
    })

  const { clusterOptions, isClusterOptsLoading } = useGetEdgeClusterListQuery(
    { payload: clusterDataDefaultPayload },
    {
      skip: !visible || !venueId,
      selectFromResult: ({ data, isLoading }) => {
        return {
          clusterOptions: data?.data
            .map(item => ({ label: item.name, value: item.clusterId })),
          isClusterOptsLoading: isLoading
        }
      }
    })

  const handleFinish = async (formValues: EdgeTnmCreateFormData) => {
    try {
      await addEdgeTnmService({ params: {
        venueId: formValues.venueId,
        edgeClusterId: formValues.edgeClusterId
      } }).unwrap()

      setVisible(false)
    } catch(err) {
      // eslint-disable-next-line no-console
      console.log(err)
    }
  }

  return <Modal
    title={$t({ defaultMessage: 'Select Cluster' })}
    width={500}
    visible={visible}
    mask
    destroyOnClose
    maskClosable={false}
    onOk={() => {form.submit()}}
    okText={$t({ defaultMessage: 'Add' })}
    onCancel={() => setVisible(false)}
  >
    <Form form={form} onFinish={handleFinish} disabled={isCreating}>
      <Form.Item
        name='venueId'
        label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
        rules={[{
          required: true,
          message: $t({ defaultMessage: 'Please select a <VenueSingular></VenueSingular>' })
        }]}
        children={
          <Select
            loading={isVenueOptsLoading}
            placeholder={$t({ defaultMessage: 'Select...' })}
            options={venueOptions}
            disabled={props.editMode}
          />
        }
      />
      <Form.Item
        name='edgeClusterId'
        label={$t({ defaultMessage: 'Cluster' })}
        rules={[{
          required: true,
          message: $t({ defaultMessage: 'Please select Cluster' })
        }]}
        children={
          <Select
            loading={isClusterOptsLoading}
            placeholder={$t({ defaultMessage: 'Select...' })}
            options={clusterOptions}
            disabled={props.editMode}
          />
        }
      />
    </Form>
  </Modal>
}