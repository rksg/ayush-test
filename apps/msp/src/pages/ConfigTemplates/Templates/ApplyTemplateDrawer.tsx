import { useContext, useState } from 'react'

import { Divider, Space } from 'antd'
import { useIntl }        from 'react-intl'

import { Button, Drawer, Loader, Table, TableProps }         from '@acx-ui/components'
import { Features, useIsSplitOn }                            from '@acx-ui/feature-toggle'
import { useMspCustomerListQuery }                           from '@acx-ui/msp/services'
import { MSPUtils, MspEc }                                   from '@acx-ui/msp/utils'
import { useApplyConfigTemplateMutation }                    from '@acx-ui/rc/services'
import { ConfigTemplate, ConfigTemplateType, useTableQuery } from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess }                         from '@acx-ui/user'
import { AccountType }                                       from '@acx-ui/utils'

import HspContext                                                                         from '../../../HspContext'
import { MAX_APPLICABLE_EC_TENANTS }                                                      from '../constants'
import { ConfigTemplateOverrideModal }                                                    from '../Overrides'
import { overrideDisplayViewMap }                                                         from '../Overrides/contentsMap'
import { OverrideValuesPerMspEcType, transformOverrideValues, useConfigTemplateOverride } from '../Overrides/utils'

import { CustomerFirmwareReminder } from './CustomerFirmwareReminder'
import * as UI                      from './styledComponents'
import { useEcFilters }             from './templateUtils'


const mspUtils = MSPUtils()

interface ApplyTemplateDrawerProps {
  setVisible: (visible: boolean) => void
  selectedTemplate: ConfigTemplate
}

export const ApplyTemplateDrawer = (props: ApplyTemplateDrawerProps) => {
  const { $t } = useIntl()
  const { setVisible, selectedTemplate } = props
  const ecFilters = useEcFilters()
  const [ selectedRows, setSelectedRows ] = useState<MspEc[]>([])
  const [ confirmationDrawerVisible, setConfirmationDrawerVisible ] = useState(false)
  const [ applyConfigTemplate ] = useApplyConfigTemplateMutation()
  const {
    overrideModalVisible,
    overrideValues,
    setOverrideModalVisible,
    isOverridable,
    createOverrideModalProps
  } = useConfigTemplateOverride(selectedTemplate, selectedRows)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const { state: hspState } = useContext(HspContext)

  const tableQuery = useTableQuery({
    useQuery: useMspCustomerListQuery,
    defaultPayload: {
      filters: ecFilters,
      fields: ['id', 'name', 'status', 'streetAddress', 'tenantType']
    },
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
      const overrideValue = overrideValues?.[ec.id]

      return applyConfigTemplate({
        params: { templateId: selectedTemplate.id, tenantId: ec.id },
        payload: transformOverrideValues(overrideValue),
        enableRbac: isConfigTemplateRbacEnabled
      }).unwrap()
    })

    try {
      await Promise.all(allRequests)
      onClose()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const hasReachedTheMaxRecord = (): boolean => {
    return selectedRows.length >= MAX_APPLICABLE_EC_TENANTS
  }

  const isRecordDisabledAtMax = (mspEcId: string): boolean => {
    return hasReachedTheMaxRecord() && !selectedRows.find(row => row.id === mspEcId)
  }

  const isRecordApplied = (mspEcId: string): boolean => {
    return (selectedTemplate.appliedOnTenants ?? []).includes(mspEcId)
  }

  const isRecordDisabled = (mspEcId: string): boolean => {
    return isRecordDisabledAtMax(mspEcId) || isRecordApplied(mspEcId)
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
      width: 70,
      key: 'status',
      sorter: true,
      render: function (_, row) {
        return $t(mspUtils.getStatus(row))
      }
    },
    {
      title: $t({ defaultMessage: 'Address' }),
      dataIndex: 'streetAddress',
      key: 'streetAddress',
      sorter: true
    },
    ...(hspState.isHsp ? [{
      title: $t({ defaultMessage: 'Account Type' }),
      dataIndex: 'tenantType',
      key: 'tenantType',
      sorter: false,
      render: function (_: React.ReactNode, row: MspEc) {
        return row.tenantType === AccountType.MSP_REC
          ? $t({ defaultMessage: 'Brand Properties' })
          : $t({ defaultMessage: 'MSP Customers' })
      }
    }] : []),
    ...(isOverridable(selectedTemplate) ? [{
      title: $t({ defaultMessage: 'Template Override Value' }),
      dataIndex: 'overrideValue',
      key: 'overrideValue',
      sorter: false,
      render: function (_: React.ReactNode, row: MspEc) {
        const View = overrideDisplayViewMap[selectedTemplate.type]
        const entity = overrideValues?.[row.id]

        return (View && entity) ? <View entity={entity} /> : null
      }
    }] : [])
  ]

  const rowActions: TableProps<MspEc>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Override Template' }),
      visible: isOverridable(selectedTemplate),
      onClick: (rows: MspEc[]) => {
        setSelectedRows(rows)
        setOverrideModalVisible(true)
      }
    }
  ]

  const content = <Space direction='vertical'>
    <p>{ $t({ defaultMessage: 'Apply selected templates to the customers below' }) }</p>
    { hasReachedTheMaxRecord() &&
      <UI.Warning>{
        // eslint-disable-next-line max-len
        $t({ defaultMessage: 'You have reached the maximum number of applicable customers (maximum: {maximum}).' }, { maximum: MAX_APPLICABLE_EC_TENANTS })
      }
      </UI.Warning>
    }
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
        rowActions={filterByAccess(rowActions)}
        rowSelection={hasAccess() && {
          hideSelectAll: true,
          type: 'checkbox',
          onChange (selectedRowKeys, selRows) {
            setSelectedRows(selRows)
          },
          getCheckboxProps: (record: MspEc) => ({
            disabled: isRecordDisabled(record.id)
          })
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
        title={$t({ defaultMessage: 'Apply Templates - Customers' })}
        visible={true}
        onClose={onClose}
        footer={footer}
        destroyOnClose={true}
        width={250 + (columns.length * 150)}
      >
        {content}
      </Drawer>
      {confirmationDrawerVisible &&
        <ApplyTemplateConfirmationDrawer
          targetMspEcs={selectedRows}
          selectedTemplate={selectedTemplate}
          overrideValues={overrideValues}
          onBack={() => setConfirmationDrawerVisible(false)}
          onApply={onApply}
          onCancel={onClose}
        />
      }
      {overrideModalVisible &&
        <ConfigTemplateOverrideModal {...createOverrideModalProps()} />
      }
    </>
  )
}

interface ApplyTemplateConfirmationDrawerProps {
  targetMspEcs: MspEc[]
  selectedTemplate: ConfigTemplate
  overrideValues: OverrideValuesPerMspEcType | undefined
  onBack: () => void
  onApply: () => void
  onCancel: () => void
}

export function ApplyTemplateConfirmationDrawer (props: ApplyTemplateConfirmationDrawerProps) {
  const { targetMspEcs, selectedTemplate, onBack, onApply, onCancel } = props
  const { $t } = useIntl()
  const [loading, setLoading ] = useState(false)

  const content =
    <Space direction='vertical'>
      {/* eslint-disable-next-line max-len */}
      <p>{ $t({ defaultMessage: 'Selected Configuration Templates will apply to the tenants listed below. During the process all configurations in these templates overwrite the corresponding configuration in the associated <venuePlural></venuePlural>.' }) }</p>
      { selectedTemplate.type === ConfigTemplateType.VENUE && <CustomerFirmwareReminder /> }
      <p>{ $t({ defaultMessage: 'Are you sure you want to continue?' }) }</p>
      <AppliedMspEcListView
        targetMspEcs={targetMspEcs}
        templateType={selectedTemplate.type}
        overrideValues={props.overrideValues}
      />
      <Divider />
      <UI.TemplateListContainer>
        <li key={selectedTemplate.name}>- {selectedTemplate.name}</li>
      </UI.TemplateListContainer>
    </Space>

  const footer =<div>
    <Button onClick={onBack}>
      {$t({ defaultMessage: 'Back' })}
    </Button>
    <Button
      onClick={async () => {
        setLoading(true)
        try {
          await onApply()
        } finally {
          setLoading(false)
        }
      }}
      loading={loading}
      type='primary'>
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

interface AppliedMspEcListProps {
  targetMspEcs: MspEc[]
  templateType: ConfigTemplateType
  overrideValues: OverrideValuesPerMspEcType | undefined
}
function AppliedMspEcListView (props: AppliedMspEcListProps) {
  const { targetMspEcs, templateType, overrideValues } = props
  const OverrideDisplayView = overrideDisplayViewMap[templateType]

  return <Space direction='vertical'>
    {targetMspEcs.map(mspEc => {
      const overrideEntity = overrideValues?.[mspEc.id]
      const hasOverrideDisplayView = !!OverrideDisplayView && !!overrideEntity

      return <Space direction='vertical' key={mspEc.id}>
        <span style={{ fontWeight: 'bold' }}>{mspEc.name}</span>
        {hasOverrideDisplayView &&
          <div style={{ marginLeft: '12px' }}><OverrideDisplayView entity={overrideEntity} /></div>
        }
      </Space>
    })}
  </Space>
}
