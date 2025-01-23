import { Form, Select } from 'antd'
import { useIntl }      from 'react-intl'

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


interface NokiaOltCreateFormDrawerProps {
  visible: boolean
  setVisible: (v: boolean) => void
  editMode?: boolean
}

export const NokiaOltCreateFormDrawer = (props: NokiaOltCreateFormDrawerProps) => {
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

  const handleClose = () => {
    setVisible(false)
  }

  return <Drawer
    title={$t({ defaultMessage: 'Add Device' })}
    visible={visible}
    onClose={handleClose}
    destroyOnClose={true}
    width={500}
  >
    <Form form={form} onFinish={handleFinish} disabled={isCreating}>
      <Form.Item
        name='name'
        label={$t({ defaultMessage: 'Device Name' })}
        rules={[{
          required: true,
          message: $t({ defaultMessage: 'Please input device name' })
        }]}
        children={<Input />}
      />
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
            placeholder={$t({ defaultMessage: 'Select <venueSingular></venueSingular>...' })}
            options={venueOptions}
            disabled={props.editMode}
          />
        }
      />
      <Form.Item noStyle dependencies={['venueId']}>
        {({ getFieldValue }) => {
          const venueId = getFieldValue('venueId')

          return <Form.Item
            name='edgeClusterId'
            label={$t({ defaultMessage: 'RUCKUS Edge' })}
            rules={[{
              required: true,
              message: $t({ defaultMessage: 'Please select RUCKUS Edge' })
            }]}
            children={
              <Select
                loading={isClusterOptsLoading}
                placeholder={$t({ defaultMessage: 'Select RUCKUS Edge...' })}
                options={clusterOptions}
                disabled={!venueId || props.editMode}
              />
            }
          />
        }}
      </Form.Item>
      <Form.Item
        name='ipAddress'
        label={$t({ defaultMessage: 'IP Address' })}
        rules={[{
          required: true,
          message: $t({ defaultMessage: 'Please input IP address' })
        }, { validator: async (_, value) => {
          return networkWifiIpRegExp(value)
        } }]}
        children={<Input />}
      />
    </Form>
  </Drawer>
}