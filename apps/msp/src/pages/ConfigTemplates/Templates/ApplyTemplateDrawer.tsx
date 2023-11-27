import { useMemo, useState } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import {
  Button,
  Drawer,
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  useMspCustomerListQuery
} from '@acx-ui/msp/services'
import {
  MSPUtils,
  MspEc
} from '@acx-ui/msp/utils'
import {
  useTableQuery
} from '@acx-ui/rc/utils'
import { RolesEnum }                                  from '@acx-ui/types'
import { hasAccess, hasRoles, useUserProfileContext } from '@acx-ui/user'
import { AccountType, isDelegationMode }              from '@acx-ui/utils'


interface ApplyTemplateDrawerProps {
  setVisible: (visible: boolean) => void
  templateIds: string[]
}

export const ApplyTemplateDrawer = (props: ApplyTemplateDrawerProps) => {
  const { $t } = useIntl()
  const { setVisible } = props
  const ecFilters = useEcFilters()
  const [ selectedRows, setSelectedRows ] = useState<MspEc[]>([])
  const mspUtils = MSPUtils()

  const mspPayload = {
    filters: ecFilters,
    fields: [
      'check-all',
      'id',
      'name',
      'tenantType',
      'status',
      'streetAddress'
    ]
  }

  const tableQuery = useTableQuery({
    useQuery: useMspCustomerListQuery,
    defaultPayload: mspPayload,
    search: {
      searchTargetFields: ['name'],
      searchString: ''
    }
  })

  const onClose = () => {
    setVisible(false)
    setSelectedRows([])
  }

  const columns: TableProps<MspEc>['columns'] = [
    {
      title: $t({ defaultMessage: 'Customers' }),
      dataIndex: 'name',
      key: 'name',
      searchable: true,
      sorter: true,
      defaultSortOrder: 'ascend'
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      render: function (_, row) {
        return $t({ defaultMessage: '{status}' }, { status: mspUtils.getStatus(row) })
      }
    },
    {
      title: $t({ defaultMessage: 'Address' }),
      dataIndex: 'streetAddress',
      key: 'streetAddress',
      sorter: true
    }
  ]

  const content =
    <Space direction='vertical'>
      <p>{ $t({ defaultMessage: 'Apply selected templates to the customers below' }) }</p>
      <Loader states={[tableQuery]}>
        <Table<MspEc>
          columns={columns}
          dataSource={tableQuery.data?.data}
          rowKey='id'
          rowSelection={hasAccess() && {
            type: 'checkbox',
            onChange (selectedRowKeys, selRows) {
              setSelectedRows(selRows)
            }
          }}
        />
      </Loader>
    </Space>

  const footer =<div>
    <Button
      disabled={selectedRows.length === 0}
      onClick={() => {}}
      type='primary'
    >
      {$t({ defaultMessage: 'Next' })}
    </Button>
    <Button onClick={() => { setVisible(false) }}>
      {$t({ defaultMessage: 'Cancel' })}
    </Button>
  </div>

  return (
    <Drawer
      title={$t({ defaultMessage: 'Apply Templates - RUCKUS End Customers' })}
      visible={true}
      onClose={onClose}
      footer={footer}
      destroyOnClose={true}
      width={700}
    >
      {content}
    </Drawer>
  )
}


function useEcFilters () {
  const { data: userProfile } = useUserProfileContext()
  const isPrimeAdmin = hasRoles([RolesEnum.PRIME_ADMIN])
  const isSupportToMspDashboardAllowed =
    useIsSplitOn(Features.SUPPORT_DELEGATE_MSP_DASHBOARD_TOGGLE) && isDelegationMode()

  const ecFilters = useMemo(() => {
    return isPrimeAdmin || isSupportToMspDashboardAllowed
      ? { tenantType: [AccountType.MSP_EC] }
      : { mspAdmins: [userProfile?.adminId], tenantType: [AccountType.MSP_EC] }
  }, [isPrimeAdmin, isSupportToMspDashboardAllowed])

  return ecFilters
}
