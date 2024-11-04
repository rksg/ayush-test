import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Drawer, Select }                            from '@acx-ui/components'
import { EdgeMdnsProxySelector, useEdgeMdnsActions } from '@acx-ui/rc/components'
import { useGetEdgeClusterListQuery }                from '@acx-ui/rc/services'


export interface AddMdnsProxyInstanceDrawerProps {
  visible: boolean
  setVisible: (v: boolean) => void
  venueId: string
}

interface AddEdgeMdnsProxyInstanceForm {
  serviceId: string
  edgeClusterId: string
}

const clusterOptionsDefaultPayload = {
  fields: ['name', 'clusterId'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

export default function AddMdnsProxyInstanceDrawer (props: AddMdnsProxyInstanceDrawerProps) {
  const { $t } = useIntl()
  const { visible, setVisible, venueId } = props
  const [ form ] = Form.useForm<AddEdgeMdnsProxyInstanceForm>()
  const { activateEdgeMdnsCluster } = useEdgeMdnsActions()

  const { clusterOptions, isLoading: isClusterOptionsLoading } = useGetEdgeClusterListQuery(
    { payload: {
      ...clusterOptionsDefaultPayload,
      filters: { venueId: [venueId] }
    } },
    {
      selectFromResult: ({ data, isLoading }) => {
        return {
          clusterOptions: data?.data.map(item => ({ label: item.name, value: item.clusterId })),
          isLoading
        }
      }
    })

  const onSave = async (data: AddEdgeMdnsProxyInstanceForm) => {
    try {
      await activateEdgeMdnsCluster(
        data.serviceId,
        venueId,
        data.edgeClusterId ?? ''
      )

      onClose()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const onClose = () => {
    setVisible(false)
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Add Instance' })}
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      width={'450px'}
      footer={
        <Drawer.FormFooter
          showAddAnother={false}
          buttonLabel={({
            save: $t({ defaultMessage: 'Add' })
          })}
          onCancel={onClose}
          onSave={async () => {
            try {
              await form.validateFields()
              await onSave(form.getFieldsValue())
            } catch (error) {
              if (error instanceof Error) throw error
            }
          }}
        />
      }
    >
      <Form<AddEdgeMdnsProxyInstanceForm>
        layout='vertical'
        form={form}
        preserve={false}
      >
        <Form.Item
          name='edgeClusterId'
          label={$t({ defaultMessage: 'Edge Cluster' })}
          rules={[{ required: true }]}
        >
          <Select loading={isClusterOptionsLoading}>
            {clusterOptions?.map(opt => <Select.Option
              key={opt.value}
              value={opt.value}
              children={opt.label}
            />)}
          </Select>
        </Form.Item>
        <EdgeMdnsProxySelector
          formItemProps={{
            name: 'serviceId',
            rules: [{ required: true }]
          }}
        />
      </Form>
    </Drawer>
  )
}