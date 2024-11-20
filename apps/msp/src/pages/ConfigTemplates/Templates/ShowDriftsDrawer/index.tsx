import { useState } from 'react'

import { Checkbox, Col, List, Row, Select, Space } from 'antd'
import { CheckboxChangeEvent }                     from 'antd/lib/checkbox'
import { useIntl }                                 from 'react-intl'

import {
  Button,
  Drawer,
  Loader,
  Tooltip
} from '@acx-ui/components'
import { useGetDriftInstancesQuery, usePatchDriftReportMutation } from '@acx-ui/rc/services'
import { ConfigTemplate }                                         from '@acx-ui/rc/utils'

import { MAX_SYNC_EC_TENANTS } from '../../constants'
import { useEcFilters }        from '../templateUtils'

import { DriftInstance }    from './DriftInstance'
import * as UI              from './styledComponents'
import { DriftInstanceRow } from './utils'

export interface ShowDriftsDrawerProps {
  setVisible: (visible: boolean) => void
  selectedTemplate: ConfigTemplate
}

export function ShowDriftsDrawer (props: ShowDriftsDrawerProps) {
  const { $t } = useIntl()
  const [ selectedInstances, setSelectedInstances ] = useState<Array<string>>([])
  const [ selectedFilterValue, setSelectedFilterValue ] = useState<string | undefined>()
  const { setVisible, selectedTemplate } = props
  // eslint-disable-next-line max-len
  const { data: driftInstances = [], isLoading: isDriftInstancesLoading } = useGetDriftInstancesQuery({
    params: {
      templateId: selectedTemplate.id!
    },
    payload: {
      filters: { ...useEcFilters() }
    }
  })
  const [ patchDriftReport ] = usePatchDriftReportMutation()

  const hasReachedTheMaxRecord = (): boolean => {
    return selectedInstances.length >= MAX_SYNC_EC_TENANTS
  }

  const onClose = () => {
    setVisible(false)
  }

  const onSync = async () => {
    try {
      await patchDriftReport({
        payload: {
          templateId: selectedTemplate.id!,
          tenantIds: selectedInstances
        }
      }).unwrap()
      onClose()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const onInstanceSelecte = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedInstances([...new Set([...selectedInstances, id])])
    } else {
      setSelectedInstances(selectedInstances.filter((i) => i !== id))
    }
  }

  const onSyncAllChange = (e: CheckboxChangeEvent) => {
    setSelectedInstances(e.target.checked ? getSyncAllInstances() : [])
  }

  const onInstanceFilterSelect = (value: string | undefined) => {
    setSelectedFilterValue(value)
  }

  const getSyncAllInstances = () => {
    return driftInstances.map(i => i.id).slice(0, MAX_SYNC_EC_TENANTS)
  }

  const footer = <div>
    <Button
      disabled={selectedInstances.length === 0}
      onClick={onSync}
      type='primary'
    >
      <span>{$t({ defaultMessage: 'Sync' })}</span>
    </Button>
    <Button onClick={() => onClose()}>
      {$t({ defaultMessage: 'Cancel' })}
    </Button>
  </div>

  return (
    <Drawer
      title={$t({ defaultMessage: 'Show Drifts' })}
      visible={true}
      onClose={onClose}
      footer={footer}
      destroyOnClose={true}
      width={650}
    >
      <Space direction='vertical' size='small' style={{ marginBottom: '6px' }}>
        {/* eslint-disable-next-line max-len */}
        <p>{ $t({ defaultMessage: 'During sync all configurations in the selected template overwrite the corresponding configuration in the associated customers.' }) }</p>
        <Toolbar
          customerOptions={driftInstances}
          onInstanceFilterSelect={onInstanceFilterSelect}
        />
      </Space>
      <Loader states={[{ isLoading: isDriftInstancesLoading }]}>
        <List
          header={<DriftInstanceListHeader
            onSyncAllChange={onSyncAllChange}
            selectedCount={selectedInstances.length}
          />}
          pagination={{ position: 'bottom' }}
          // eslint-disable-next-line max-len
          dataSource={driftInstances.filter(ins => selectedFilterValue ? ins.id === selectedFilterValue : true)}
          renderItem={(instance) => (
            <List.Item style={{ padding: '0' }}>
              <DriftInstance
                templateId={selectedTemplate.id!}
                instanceName={instance.name}
                instanceId={instance.id}
                updateSelection={onInstanceSelecte}
                selected={selectedInstances.includes(instance.id)}
                disalbed={hasReachedTheMaxRecord()}
              />
            </List.Item>
          )}
        />
      </Loader>
    </Drawer>
  )
}

interface ToolbarProps {
  customerOptions: Array<{ name: string, id: string }>
  onInstanceFilterSelect: (value: string | undefined) => void
}

function Toolbar (props: ToolbarProps) {
  const { customerOptions, onInstanceFilterSelect } = props
  const { $t } = useIntl()

  return <Row justify='end' align='middle' style={{ paddingLeft: '16px' }}>
    <Col span={12} style={{ textAlign: 'right' }}>
      <Select
        style={{ minWidth: 200, textAlign: 'left' }}
        placeholder={$t({ defaultMessage: 'All Customers' })}
        allowClear
        showSearch
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        onChange={onInstanceFilterSelect}
        options={customerOptions.map(i => ({ label: i.name, value: i.id }))}
      />
    </Col>
  </Row>
}

export function SelectedCustomersIndicator (props: { selectedCount: number }) {
  const { selectedCount } = props
  const { $t } = useIntl()

  if (selectedCount === 0) return null

  return <UI.SelectedCustomersIndicator>
    { $t({ defaultMessage: '{num} selected' }, { num: selectedCount }) }
  </UI.SelectedCustomersIndicator>
}

function DriftInstanceListHeader (props: {
  onSyncAllChange: (e: CheckboxChangeEvent) => void,
  selectedCount: number
}) {
  const { onSyncAllChange, selectedCount } = props
  const { $t } = useIntl()

  return <Space direction='vertical' style={{ width: '100%' }}>
    <DriftInstanceRow
      head={<Tooltip title={$t({ defaultMessage: 'Select All' })}>
        <Checkbox onChange={onSyncAllChange} />
      </Tooltip>}
      body={<Space direction={'horizontal'} size={6}>
        <span style={{ fontWeight: '600' }}>
          {$t({ defaultMessage: 'Customer Drifts Report' })}
        </span>
        <span style={{ fontStyle: 'italic' }}>
          {$t({ defaultMessage: '(Template -> Customer)' })}
        </span>
      </Space>}
    />
    <SelectedCustomersIndicator selectedCount={selectedCount} />
  </Space>
}


