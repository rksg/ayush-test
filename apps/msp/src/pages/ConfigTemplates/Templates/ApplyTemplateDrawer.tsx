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
import { useMspCustomerListQuery } from '@acx-ui/msp/services'
import {
  MSPUtils,
  MspEc
} from '@acx-ui/msp/utils'
import { useApplyConfigTemplateMutation } from '@acx-ui/rc/services'
import {
  ConfigTemplate,
  useTableQuery
} from '@acx-ui/rc/utils'
import { hasAccess } from '@acx-ui/user'

import * as UI          from './styledComponents'
import { useEcFilters } from './templateUtils'


interface ApplyTemplateDrawerProps {
  setVisible: (visible: boolean) => void
  selectedTemplates: ConfigTemplate[]
}

export const ApplyTemplateDrawer = (props: ApplyTemplateDrawerProps) => {
  const { $t } = useIntl()
  const { setVisible, selectedTemplates } = props
  const ecFilters = useEcFilters()
  const [ selectedRows, setSelectedRows ] = useState<MspEc[]>([])
  const [ confirmationDrawerVisible, setConfirmationDrawerVisible ] = useState(false)
  const [ applyConfigTemplate ] = useApplyConfigTemplateMutation()
  const mspUtils = MSPUtils()

  const ecNames = useMemo(() => selectedRows.map(r => r.name), [selectedRows])
  const templateNames = useMemo(() => selectedTemplates.map(t => t.name), [selectedTemplates])

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
    setConfirmationDrawerVisible(false)
    setVisible(false)
  }

  const onApply = async () => {
    const allRequests = selectedRows.map(ec => {
      return applyConfigTemplate({
        params: { templateId: selectedTemplates[0].id, tenantId: ec.id },
        payload: {}
      }).unwrap()
    })

    try {
      await Promise.all(allRequests)
      onClose()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
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

  const content = <Space direction='vertical'>
    <p>{ $t({ defaultMessage: 'Apply selected templates to the customers below' }) }</p>
    <Loader states={[tableQuery]}>
      <Table<MspEc>
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
        settingsId='msp-apply-template-table'
        rowKey='id'
        enableApiFilter={true}
        rowSelection={hasAccess() && {
          type: 'checkbox',
          onChange (selectedRowKeys, selRows) {
            setSelectedRows(selRows)
          }
        }}
      />
    </Loader>
  </Space>

  const footer = <div>
    <Button
      disabled={selectedRows.length === 0}
      onClick={() => setConfirmationDrawerVisible(true)}
      type='primary'
    >
      {$t({ defaultMessage: 'Next' })}
    </Button>
    <Button onClick={() => onClose()}>
      {$t({ defaultMessage: 'Cancel' })}
    </Button>
  </div>

  return (
    <>
      <Drawer
        title={$t({ defaultMessage: 'Apply Templates - Brand Properties' })}
        visible={true}
        onClose={onClose}
        footer={footer}
        destroyOnClose={true}
        width={700}
      >
        {content}
      </Drawer>
      {confirmationDrawerVisible &&
      <ApplyTemplateConfirmationDrawer
        ecNames={ecNames}
        templateNames={templateNames}
        onBack={() => setConfirmationDrawerVisible(false)}
        onApply={onApply}
        onCancel={onClose}
      />}
    </>
  )
}

interface ApplyTemplateConfirmationDrawerProps {
  ecNames: string[]
  templateNames: string[]
  onBack: () => void
  onApply: () => void
  onCancel: () => void
}

function ApplyTemplateConfirmationDrawer (props: ApplyTemplateConfirmationDrawerProps) {
  const { ecNames, templateNames, onBack, onApply, onCancel } = props
  const { $t } = useIntl()

  const content =
    <Space direction='vertical'>
      {/* eslint-disable-next-line max-len */}
      <p>{ $t({ defaultMessage: 'Selected Configuration Templates will apply to the tenants listed below. During the process all configurations in these templates overwrite the corresponding configuration in the associated <venuePlural></venuePlural>.' }) }</p>
      <p>{ $t({ defaultMessage: 'Are you sure you want to continue?' }) }</p>
      <UI.EcListContainer>{ ecNames.map(name => <li key={name}>{name}</li>) }</UI.EcListContainer>
      {/* eslint-disable-next-line max-len */}
      <UI.TemplateListContainer>{ templateNames.map(name => <li key={name}>- {name}</li>) }</UI.TemplateListContainer>
    </Space>

  const footer =<div>
    <Button onClick={onBack}>
      {$t({ defaultMessage: 'Back' })}
    </Button>
    <Button onClick={onApply} type='primary'>
      {$t({ defaultMessage: 'Apply Template' })}
    </Button>
    <Button onClick={onCancel}>
      {$t({ defaultMessage: 'Cancel' })}
    </Button>
  </div>

  return (
    <Drawer
      title={$t({ defaultMessage: 'Apply Templates - Confirmation' })}
      visible={true}
      onClose={onCancel}
      footer={footer}
      destroyOnClose={true}
      width={700}
    >
      {content}
    </Drawer>
  )
}
