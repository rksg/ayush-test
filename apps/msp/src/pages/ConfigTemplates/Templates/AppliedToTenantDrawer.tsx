import { useMemo } from 'react'

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
  MspEc
} from '@acx-ui/msp/utils'
import {
  useTableQuery,
  ConfigTemplate
} from '@acx-ui/rc/utils'
import { RolesEnum }                       from '@acx-ui/types'
import { hasRoles, useUserProfileContext } from '@acx-ui/user'
import { AccountType, isDelegationMode }   from '@acx-ui/utils'


interface ApplyTemplateDrawerProps {
  setVisible: (visible: boolean) => void
  selectedTemplates: ConfigTemplate[]
}

export const AppliedToTenantDrawer = (props: ApplyTemplateDrawerProps) => {
  const { $t } = useIntl()
  const { setVisible, selectedTemplates } = props
  const ecFilters = useEcFilters()

  const mspPayload = {
    filters: {
      ...ecFilters,
      id: [...selectedTemplates[0].ecTenants]
    },
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
      title: $t({ defaultMessage: 'Address' }),
      dataIndex: 'streetAddress',
      key: 'streetAddress',
      sorter: true
    }
  ]

  const content = <Space direction='vertical'>
    <Loader states={[tableQuery]}>
      <Table<MspEc>
        columns={columns}
        dataSource={tableQuery.data?.data}
        rowKey='id'
      />
    </Loader>
  </Space>

  const footer = <div>
    <Button onClick={() => onClose()}>
      {$t({ defaultMessage: 'Cancel' })}
    </Button>
  </div>

  return (
    <Drawer
      title={$t({ defaultMessage: 'Applied to EC tenants' })}
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
