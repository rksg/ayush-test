import { useEffect } from 'react'

import { Form, Select, Input } from 'antd'
import { useIntl }             from 'react-intl'

import { Drawer }                                                                                          from '@acx-ui/components'
import { useVenuesListQuery, useGetEdgeClusterListQuery, useAddEdgeOltMutation, useUpdateEdgeOltMutation } from '@acx-ui/rc/services'
import { EdgeNokiaOltData, EdgeNokiaOltCreateFormData, networkWifiIpRegExp }                               from '@acx-ui/rc/utils'

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
  editData?: EdgeNokiaOltData
}

export const NokiaOltFormDrawer = (props: NokiaOltCreateFormDrawerProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, editData } = props
  const isEditMode = !!editData

  const [addOlt, { isLoading: isCreating }] = useAddEdgeOltMutation()
  const [updateOlt, { isLoading: isUpdating }] = useUpdateEdgeOltMutation()

  const [ form ] = Form.useForm()

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
      skip: !visible,
      selectFromResult: ({ data, isLoading }) => {
        return {
          clusterOptions: data?.data
            .map(item => ({ label: item.name, value: item.clusterId, venueId: item.venueId })),
          isClusterOptsLoading: isLoading
        }
      }
    })

  const handleFinish = async (formValues: EdgeNokiaOltCreateFormData) => {
    try {
      await (isEditMode ? updateOlt : addOlt)({
        params: {
          venueId: formValues.venueId,
          edgeClusterId: formValues.edgeClusterId,
          ...(isEditMode ? { oltId: editData?.serialNumber } : {})
        },
        payload: {
          name: formValues.name,
          ip: formValues.ip
        } }).unwrap()

      handleClose()
    } catch(err) {
      // eslint-disable-next-line no-console
      console.log(err)
    }
  }

  const handleClose = () => {
    setVisible(false)
  }

  useEffect(() => {
    if (visible) {
      form.resetFields()
    }
  }, [ visible ])

  const drawerFooter = <Drawer.FormFooter
    buttonLabel={{
      save: isEditMode
        ? $t({ defaultMessage: 'Save' })
        : $t({ defaultMessage: 'Add' })
    }}
    onCancel={handleClose}
    onSave={async () => form.submit()}
  />

  return <Drawer
    title={isEditMode
      ? $t({ defaultMessage: 'Edit Device' })
      : $t({ defaultMessage: 'Add Device' })}
    visible={visible}
    onClose={handleClose}
    destroyOnClose={true}
    width={500}
    footer={drawerFooter}
  >
    <Form form={form}
      initialValues={editData}
      onFinish={handleFinish}
      disabled={isCreating || isUpdating}
    >
      {/*<Form.Item
        name='name'
        label={$t({ defaultMessage: 'Device Name' })}
        rules={[{
          required: true,
          message: $t({ defaultMessage: 'Please input device name' })
        }]}
        children={<Input />}
      />
      */}
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
            disabled={isEditMode}
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
                options={venueId ? clusterOptions?.filter(item => item.venueId === venueId) : []}
                disabled={!venueId || isEditMode}
              />
            }
          />
        }}
      </Form.Item>
      <Form.Item
        name='ip'
        label={$t({ defaultMessage: 'IP Address' })}
        rules={[{
          required: true,
          message: $t({ defaultMessage: 'Please input IP address' })
        }, { validator: async (_, value) => {
          return networkWifiIpRegExp(value)
        } }]}
        children={<Input disabled={isEditMode} />}
      />
    </Form>
  </Drawer>
}