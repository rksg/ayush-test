import { useState } from 'react'

import { Checkbox, Col, Divider, List, Row, Select, Space } from 'antd'
import { CheckboxChangeEvent }                              from 'antd/lib/checkbox'
import { useIntl }                                          from 'react-intl'

import {
  Button,
  Drawer,
  Loader
} from '@acx-ui/components'
import { useGetDriftInstancesQuery, usePatchDriftReportMutation }     from '@acx-ui/rc/services'
import { ConfigTemplate, ConfigTemplateType, ConfigTemplateUrlsInfo } from '@acx-ui/rc/utils'
import { hasAllowedOperations }                                       from '@acx-ui/user'
import { getOpsApi }                                                  from '@acx-ui/utils'

import { MAX_SYNC_EC_TENANTS }      from '../../constants'
import { CustomerFirmwareReminder } from '../CustomerFirmwareReminder'
import { useEcFilters }             from '../templateUtils'

import { DriftInstance } from './DriftInstance'
import * as UI           from './styledComponents'

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
    { hasAllowedOperations([getOpsApi(ConfigTemplateUrlsInfo.patchDriftReport)]) && <Button
      disabled={selectedInstances.length === 0}
      onClick={onSync}
      type='primary'
    >
      <span>{$t({ defaultMessage: 'Sync' })}</span>
    </Button>}
    <Button onClick={() => onClose()}>
      {$t({ defaultMessage: 'Cancel' })}
    </Button>
  </div>

  return (
    <Drawer
      title={$t({ defaultMessage: 'Customer Drifts Report' })}
      visible={true}
      onClose={onClose}
      footer={footer}
      destroyOnClose={true}
      width={650}
    >
      <Space direction='vertical' size='small'>
        {/* eslint-disable-next-line max-len */}
        <p>{ $t({ defaultMessage: 'During sync all configurations in the selected template overwrite the corresponding configuration in the associated customers.' }) }</p>
        { selectedTemplate.type === ConfigTemplateType.VENUE && <CustomerFirmwareReminder /> }
        <Toolbar
          customerOptions={driftInstances}
          onSyncAllChange={onSyncAllChange}
          onInstanceFilterSelect={onInstanceFilterSelect}
        />
        <SelectedCustomersIndicator selectedCount={selectedInstances.length} />
        <Divider style={{ margin: '8px 0 0 0' }} />
      </Space>
      <Loader states={[{ isLoading: isDriftInstancesLoading }]}>
        <List
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
  onSyncAllChange: (e: CheckboxChangeEvent) => void
  onInstanceFilterSelect: (value: string | undefined) => void
}

function Toolbar (props: ToolbarProps) {
  const { customerOptions, onSyncAllChange, onInstanceFilterSelect } = props
  const { $t } = useIntl()

  return <Row justify='space-between' align='middle'>
    <Col span={12}>
      <Checkbox onChange={onSyncAllChange}>
        {$t({ defaultMessage: 'Sync all drifts for all customers' })}
      </Checkbox>
    </Col>
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
