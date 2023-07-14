import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Drawer, LayoutUI, Loader, Table, TableProps } from '@acx-ui/components'
import { CaretDownSolid }                              from '@acx-ui/icons'
import {
  useMspCustomerListDropdownQuery,
  useIntegratorCustomerListDropdownQuery,
  useVarCustomerListDropdownQuery,
  useSupportCustomerListDropdownQuery,
  useDelegateToMspEcPath
} from '@acx-ui/msp/services'
import { MspEc, VarCustomer } from '@acx-ui/msp/utils'
import {
  useGetTenantDetailsQuery
} from '@acx-ui/rc/services'
import { useTableQuery }                   from '@acx-ui/rc/utils'
import { Link, useParams  }                from '@acx-ui/react-router-dom'
import { useUserProfileContext }           from '@acx-ui/user'
import { AccountType, getJwtTokenPayload } from '@acx-ui/utils'

import * as UI from './styledComponents'

enum DelegationType {
  MSP_EC = 'MSP_EC',
  VAR_REC = 'VAR_REC',
  SUPPORT_REC = 'SUPPORT_REC',
  SUPPORT_MSP_EC = 'SUPPORT_MSP_EC',
  MSP_INTEGRATOR = 'MSP_INTEGRATOR',
  INTEGRATER_MSPEC = 'INTEGRATER_MSPEC'
}

export function MspEcDropdownList () {
  const { $t } = useIntl()

  const [customerName, setCustomerName] = useState('')
  const [visible, setVisible] = useState(false)
  const [delegationType, setDelegationType] = useState('')

  const params = useParams()
  const { data: tenantDetail } = useGetTenantDetailsQuery({ params })
  const { delegateToMspEcPath } = useDelegateToMspEcPath()

  // user profile for tenant from jwt token
  const { data: userProfile } = useUserProfileContext()

  useEffect(()=>{
    if (tenantDetail && userProfile) {
      UpdateDelegationType(tenantDetail?.tenantType, userProfile?.support)
    }
    if (tenantDetail?.name) {
      setCustomerName(() => tenantDetail?.name)
    }
  }, [tenantDetail, userProfile])

  function UpdateDelegationType (tenantType?: string, support?: boolean) {
    if (support === true) {
      if (tenantType === AccountType.MSP_EC
        || tenantType === AccountType.MSP_INSTALLER
        || tenantType === AccountType.MSP_INTEGRATOR)
        setDelegationType(DelegationType.SUPPORT_MSP_EC)
      else
        setDelegationType(DelegationType.SUPPORT_REC)
    } else {
      if (tenantType === AccountType.MSP_EC) {
        if (getJwtTokenPayload().tenantType === AccountType.MSP_INTEGRATOR ||
            getJwtTokenPayload().tenantType === AccountType.MSP_INSTALLER)
          setDelegationType(DelegationType.INTEGRATER_MSPEC)
        else
          setDelegationType(DelegationType.MSP_EC)
      }
      else if ( tenantType === AccountType.MSP_INSTALLER ||
                tenantType === AccountType.MSP_INTEGRATOR)
        setDelegationType(DelegationType.MSP_INTEGRATOR)
      else
        setDelegationType(DelegationType.VAR_REC)
    }
  }

  const mspEcPayload = {
    searchString: '',
    filters: {
      mspAdmins: [userProfile?.adminId],
      tenantType: [AccountType.MSP_EC] },
    fields: [
      'id',
      'name',
      'tenantType',
      'status',
      'streetAddress'
    ],
    searchTargetFields: ['name']
  }

  const integratorMspEcPayload = {
    searchString: '',
    filters: {
      // mspAdmins: [userProfile.adminId],
      mspTenantId: [''],
      tenantType: [AccountType.MSP_INSTALLER, AccountType.MSP_INTEGRATOR] },
    fields: [
      'id',
      'name',
      'tenantType',
      'status',
      'streetAddress'
    ],
    searchTargetFields: ['name']
  }

  const integratorPayload = {
    searchString: '',
    filters: {
      mspAdmins: [userProfile?.adminId],
      tenantType: [AccountType.MSP_INSTALLER, AccountType.MSP_INTEGRATOR] },
    fields: [
      'id',
      'name',
      'tenantType',
      'status',
      'streetAddress'
    ],
    searchTargetFields: ['name']
  }

  const varPayload = {
    searchString: '',
    fields: [
      'tenantName',
      'tenantEmail',
      'id'],
    searchTargetFields: ['tenantName', 'tenantEmail'],
    filters: {
      status: ['DELEGATION_STATUS_ACCEPTED'],
      delegationType: ['DELEGATION_TYPE_VAR'],
      isValid: [true]
    }
  }

  const supportPayload = {
    searchString: '',
    fields: [
      'tenantName',
      'tenantEmail',
      'id'],
    searchTargetFields: ['tenantName', 'tenantEmail'],
    filters: {
      status: ['DELEGATION_STATUS_ACCEPTED'],
      delegationType: ['DELEGATION_TYPE_SUPPORT'],
      isValid: [true]
    }
  }

  const supportEcPayload = {
    searchString: '',
    fields: [
      'id',
      'name',
      'tenantType',
      'status',
      'streetAddress'
    ],
    searchTargetFields: ['name'],
    filters: {
      includeExpired: [false]
    }
  }

  const customerColumns: TableProps<MspEc>['columns'] = [
    {
      title: $t({ defaultMessage: 'Customers' }),
      dataIndex: 'name',
      key: 'name',
      searchable: true,
      disable: true,
      defaultSortOrder: 'ascend',
      onCell: (data) => {
        return (data.status === 'Active') ? {
          onClick: () => {
            setVisible(false)
            delegateToMspEcPath(data.id)
          }
        } : {}
      },
      render: function (data, row) {
        const to = `/${row.id}/t`
        return (
          (row.status === 'Active') ? <Link to={to}>{data}</Link> : data
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      key: 'status'
    },
    {
      title: $t({ defaultMessage: 'Tenant Id' }),
      dataIndex: 'id',
      key: 'id',
      show: false
    }
  ]

  const supportColumns: TableProps<VarCustomer>['columns'] = [
    {
      title: $t({ defaultMessage: 'Customers' }),
      dataIndex: 'tenantName',
      key: 'tenantName',
      searchable: true,
      disable: true,
      defaultSortOrder: 'ascend',
      onCell: (data) => {
        return {
          onClick: () => {
            setVisible(false)
            delegateToMspEcPath(data.tenantId)
          }
        }
      },
      render: function (data, row) {
        const to = `/${row.tenantId}/t`
        return (
          <Link to={to}>{data}</Link>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Tenant Id' }),
      dataIndex: 'id',
      key: 'id',
      show: false
    }
  ]

  const tableQueryMspEc = useTableQuery({
    useQuery: useMspCustomerListDropdownQuery,
    apiParams: { tenantId: getJwtTokenPayload().tenantId },
    defaultPayload: mspEcPayload,
    search: {
      searchTargetFields: mspEcPayload.searchTargetFields as string[]
    },
    option: { skip: delegationType !== DelegationType.MSP_EC }
  })

  const tableQueryIntegratorMspEc = useTableQuery({
    useQuery: useIntegratorCustomerListDropdownQuery,
    apiParams: { tenantId: getJwtTokenPayload().tenantId },
    defaultPayload: integratorMspEcPayload,
    search: {
      searchTargetFields: integratorMspEcPayload.searchTargetFields as string[]
    },
    option: { skip: delegationType !== DelegationType.INTEGRATER_MSPEC }
  })

  useEffect(()=>{
    if (tenantDetail?.mspEc?.parentMspId) {
      tableQueryIntegratorMspEc.setPayload({
        ...tableQueryIntegratorMspEc.payload,
        filters: {
          // mspAdmins: [userProfile.adminId],
          ...{ mspTenantId: [ tenantDetail?.mspEc?.parentMspId ] },
          tenantType: [AccountType.MSP_INSTALLER, AccountType.MSP_INTEGRATOR]
        }
      })
    }
  },[tenantDetail])

  const tableQueryIntegrator = useTableQuery({
    useQuery: useMspCustomerListDropdownQuery,
    apiParams: { tenantId: getJwtTokenPayload().tenantId },
    defaultPayload: integratorPayload,
    search: {
      searchTargetFields: integratorPayload.searchTargetFields as string[]
    },
    option: { skip: delegationType !== DelegationType.MSP_INTEGRATOR }
  })

  const tableQueryVarRec = useTableQuery({
    useQuery: useVarCustomerListDropdownQuery,
    apiParams: { tenantId: getJwtTokenPayload().tenantId },
    defaultPayload: varPayload,
    search: {
      searchTargetFields: varPayload.searchTargetFields as string[]
    },
    option: { skip: delegationType !== DelegationType.VAR_REC }
  })

  const tableQuerySupportEc = useTableQuery({
    useQuery: useSupportCustomerListDropdownQuery,
    apiParams: { tenantId: getJwtTokenPayload().tenantId },
    defaultPayload: supportEcPayload,
    search: {
      searchTargetFields: supportEcPayload.searchTargetFields as string[]
    },
    option: { skip: delegationType !== DelegationType.SUPPORT_MSP_EC }
  })

  const tableQuerySupport = useTableQuery({
    useQuery: useVarCustomerListDropdownQuery,
    apiParams: { tenantId: getJwtTokenPayload().tenantId },
    defaultPayload: supportPayload,
    search: {
      searchTargetFields: supportPayload.searchTargetFields as string[]
    },
    option: { skip: delegationType !== DelegationType.SUPPORT_REC }
  })

  const onClose = () => {
    setVisible(false)
  }

  const ContentMspEc = () => {
    return <Loader states={[tableQueryMspEc]}>

      <Table
        settingsId='msp-ec-dropdown-table'
        columns={customerColumns}
        dataSource={tableQueryMspEc.data?.data.filter(mspEc => mspEc.id !== params.tenantId)}
        pagination={tableQueryMspEc.pagination}
        onChange={tableQueryMspEc.handleTableChange}
        onFilterChange={tableQueryMspEc.handleFilterChange}
        rowKey='id'
      />
    </Loader>
  }

  const ContentIntegratorMspEc = () => {
    return <Loader states={[tableQueryIntegratorMspEc]}>

      <Table
        settingsId='integrator-mspec-dropdown-table'
        columns={customerColumns}
        dataSource={tableQueryIntegratorMspEc.data?.data.filter(mspEc =>
          mspEc.id !== params.tenantId)}
        pagination={tableQueryIntegratorMspEc.pagination}
        onChange={tableQueryIntegratorMspEc.handleTableChange}
        onFilterChange={tableQueryIntegratorMspEc.handleFilterChange}
        rowKey='id'
      />
    </Loader>
  }

  const ContentIntegrator = () => {
    return <Loader states={[tableQueryIntegrator]}>

      <Table
        settingsId='integrator-dropdown-table'
        columns={customerColumns}
        dataSource={tableQueryIntegrator.data?.data.filter(mspEc => mspEc.id !== params.tenantId)}
        pagination={tableQueryIntegrator.pagination}
        onChange={tableQueryIntegrator.handleTableChange}
        onFilterChange={tableQueryIntegrator.handleFilterChange}
        rowKey='id'
      />
    </Loader>
  }

  const ContentVar = () => {
    return <Loader states={[tableQueryVarRec]}>

      <Table
        settingsId='var-dropdown-table'
        columns={supportColumns}
        dataSource={tableQueryVarRec.data?.data.filter(cus => cus.tenantId !== params.tenantId)}
        pagination={tableQueryVarRec.pagination}
        onChange={tableQueryVarRec.handleTableChange}
        onFilterChange={tableQueryVarRec.handleFilterChange}
        rowKey='id'
      />
    </Loader>
  }

  const ContentSupport = () => {
    return <Loader states={[tableQuerySupport]}>

      <Table
        columns={supportColumns}
        dataSource={tableQuerySupport.data?.data.filter(cus => cus.tenantId !== params.tenantId)}
        pagination={tableQuerySupport.pagination}
        onChange={tableQuerySupport.handleTableChange}
        onFilterChange={tableQuerySupport.handleFilterChange}
        rowKey='id'
      />
    </Loader>
  }

  const ContentSupportEc = () => {
    return <Loader states={[tableQuerySupportEc]}>

      <Table
        settingsId='support-ec-dropdown-table'
        columns={customerColumns}
        dataSource={tableQuerySupportEc.data?.data.filter(mspEc => mspEc.id !== params.tenantId)}
        pagination={tableQuerySupportEc.pagination}
        onChange={tableQuerySupportEc.handleTableChange}
        onFilterChange={tableQuerySupportEc.handleFilterChange}
        rowKey='id'
      />
    </Loader>
  }

  let contentx = ContentMspEc()
  let colWidth = 420
  if (delegationType === DelegationType.SUPPORT_REC) {
    colWidth = 360
    contentx = ContentSupport()
  } else if (delegationType === DelegationType.SUPPORT_MSP_EC) {
    contentx = ContentSupportEc()
  } else if (delegationType === DelegationType.VAR_REC) {
    colWidth = 360
    contentx = ContentVar()
  } else if (delegationType === DelegationType.MSP_INTEGRATOR) {
    contentx = ContentIntegrator()
  } else if (delegationType === DelegationType.INTEGRATER_MSPEC) {
    contentx = ContentIntegratorMspEc()
  }

  return (
    <>
      <UI.CompanyNameDropdown onClick={()=>setVisible(true)}>
        <LayoutUI.CompanyName>{customerName}</LayoutUI.CompanyName>
        <LayoutUI.Icon
          children={<CaretDownSolid />}
        />
      </UI.CompanyNameDropdown>
      <Drawer
        width={colWidth}
        title={$t({ defaultMessage: 'Change Customer' })}
        visible={visible}
        onClose={onClose}
        children={contentx}
      />
    </>
  )
}
