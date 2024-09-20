import { useEffect, useState } from 'react'

import { Checkbox, Col, List, Row, Select, Space } from 'antd'
import { CheckboxChangeEvent }                     from 'antd/lib/checkbox'
import { useIntl }                                 from 'react-intl'

import {
  Button,
  Drawer
} from '@acx-ui/components'
import { ConfigTemplate } from '@acx-ui/rc/utils'

import { MAX_SYNC_EC_TENANTS } from '../../constants'

import { mockedData }    from './__tests__/fixtures'
import { DriftInstance } from './DriftInstance'

interface ShowDriftsDrawerProps {
  setVisible: (visible: boolean) => void
  selectedTemplate: ConfigTemplate
}

export function ShowDriftsDrawer (props: ShowDriftsDrawerProps) {
  const { $t } = useIntl()
  const [ selectedInstances, setSelectedInstances ] = useState<Array<string>>([])
  const { setVisible } = props
  const { driftInstances = [], applyFilter } = useGetDriftInstances(mockedData.map(i => i.id))

  const hasReachedTheMaxRecord = (): boolean => {
    return selectedInstances.length >= MAX_SYNC_EC_TENANTS
  }

  const onClose = () => {
    setVisible(false)
  }

  const onSync = () => {

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
    applyFilter(value)
  }

  const getSyncAllInstances = () => {
    return driftInstances.map(i => i.id).slice(0, MAX_SYNC_EC_TENANTS)
  }

  // eslint-disable-next-line max-len
  const description = <p>{ $t({ defaultMessage: 'During sync all configurations in the selected template overwrite the corresponding configuration in the associated customers.' }) }</p>

  const toolbar = <Row justify='space-between' align='middle' style={{ paddingLeft: '16px' }}>
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
        onChange={onInstanceFilterSelect}
        options={mockedData.map(i => ({ label: i.name, value: i.id }))}
      />
    </Col>
  </Row>

  const selectedCustomersIndicator = selectedInstances.length > 0
    ? <div style={{
      padding: '6px 20px',
      backgroundColor: 'var(--acx-accents-blue-10)',
      borderRadius: '4px'
    }}>
      { $t({ defaultMessage: '{num} selected' }, { num: selectedInstances.length }) }
    </div>
    : null

  const footer = <div>
    <Button
      disabled={selectedInstances.length === 0}
      onClick={onSync}
      type='primary'
    >
      {$t({ defaultMessage: 'Sync' })}
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
      <Space direction='vertical' size='small'>
        {description}
        {toolbar}
        {selectedCustomersIndicator}
      </Space>
      <List
        split={false}
        pagination={{ position: 'bottom' }}
        dataSource={driftInstances}
        renderItem={(instance) => (
          <List.Item style={{ padding: '0' }}>
            <DriftInstance
              instanceName={instance.name}
              instanceId={instance.id}
              updateSelection={onInstanceSelecte}
              selected={selectedInstances.includes(instance.id)}
              disalbed={hasReachedTheMaxRecord()}
            />
          </List.Item>
        )}
      />
    </Drawer>
  )
}

function useGetDriftInstances (instanceIds: string[]) {
  const [ driftInstances, setDriftInstances ] = useState<Array<{ id: string, name: string }>>()

  const applyFilter = (instanceId: string | undefined) => {
    if (instanceId) {
      setDriftInstances(mockedData.filter(i => i.id === instanceId))
    } else {
      setDriftInstances(mockedData)
    }
  }

  useEffect(() => {
    setTimeout(() => {
      setDriftInstances(
        mockedData
          .filter(i => instanceIds.includes(i.id))
          .map(i => ({ id: i.id, name: i.name }))
      )
    }, 1000)
  }, [])

  return {
    driftInstances,
    applyFilter
  }
}
