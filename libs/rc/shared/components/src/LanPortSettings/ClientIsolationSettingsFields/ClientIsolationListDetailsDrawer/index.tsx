import { Form, Table, TableProps } from 'antd'
import { useIntl }                 from 'react-intl'

import { Drawer }                                        from '@acx-ui/components'
import { Features, useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { useGetClientIsolationQuery }                    from '@acx-ui/rc/services'
import { ClientIsolationClient, transformDisplayNumber } from '@acx-ui/rc/utils'
import { useParams }                                     from '@acx-ui/react-router-dom'

interface ClientIsolationAllowListDetailsDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  clientIsolationPropfileId: string
}

// eslint-disable-next-line max-len
const ClientIsolationAllowListDetailsDrawer = (props: ClientIsolationAllowListDetailsDrawerProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const { visible, setVisible, clientIsolationPropfileId: clientIsolationProfileId } = props
  const enableServicePolicyRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)

  const onClose = () => {
    setVisible(false)
  }

  const { data: clientIsolationData } = useGetClientIsolationQuery({
    params: {
      tenantId: params.tenantId,
      policyId: clientIsolationProfileId
    },
    enableRbac: enableServicePolicyRbac
  }, {
    skip: !clientIsolationProfileId
  })

  const columns: TableProps<ClientIsolationClient>['columns'] = [
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'mac',
      key: 'mac'
    },
    {
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'description',
      key: 'description'
    }
  ]

  const content = (
    <Form
      labelCol={{ span: 9 }}
      labelAlign='left'
    >
      <Form.Item
        label={$t({ defaultMessage: 'Description' })}
        children={clientIsolationData?.description}
      />
      <Form.Item
        label={$t(
          { defaultMessage: 'Client Entries ({count})' },
          { count: transformDisplayNumber(clientIsolationData?.allowlist?.length) }
        )}
      />
      <Table<ClientIsolationClient>
        rowKey='mac'
        columns={columns}
        dataSource={clientIsolationData?.allowlist}
      />
    </Form>
  )

  return (
    <Drawer
      title={$t(
        { defaultMessage: 'Client Isolation Details: {name}' },
        { name: clientIsolationData?.name }
      )}
      visible={visible}
      onClose={onClose}
      children={content}
      width={'480px'}
    />
  )
}

export default ClientIsolationAllowListDetailsDrawer