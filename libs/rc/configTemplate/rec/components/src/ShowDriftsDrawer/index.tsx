import { useEffect, useState } from 'react'

import { Checkbox, Col, Divider, List, Row, Select, Space } from 'antd'
import { CheckboxChangeEvent }                              from 'antd/lib/checkbox'
import { useIntl }                                          from 'react-intl'

import {
  Button,
  Drawer,
  Loader
} from '@acx-ui/components'
import { ConfigTemplatePageUI, DriftComparisonSet, DriftInstance }                                                                                    from '@acx-ui/main/components'
import { useQueryDriftInstancesQuery, usePatchDriftReportByInstanceMutation, useGetDriftReportByInstanceQuery, useLazyGetDriftReportByInstanceQuery } from '@acx-ui/rc/services'
import { ConfigTemplate, ConfigTemplateType, ConfigTemplateUrlsInfo }                                                                                 from '@acx-ui/rc/utils'
import { hasAllowedOperations }                                                                                                                       from '@acx-ui/user'
import { getOpsApi }                                                                                                                                  from '@acx-ui/utils'

const MAX_SYNC_VENUES = 10

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
  const { data: driftInstances = [], isLoading: isDriftInstancesLoading } = useQueryDriftInstancesQuery({
    params: { templateId: selectedTemplate.id! },
    payload: { type: selectedTemplate.type }
  })

  const { data: driftReport, isLoading: isDriftReportLoading } = useGetDriftReportByInstanceQuery({
    params: {
      templateId: selectedTemplate.id!,
      instanceId: driftInstances[0]?.id
    }
  }, {
    skip: selectedTemplate.type === ConfigTemplateType.VENUE || driftInstances.length === 0
  })

  useEffect(() => {
    if (selectedTemplate.type !== ConfigTemplateType.VENUE && driftInstances.length > 0) {
      setSelectedInstances(driftInstances.map(i => i.id))
    }
  }, [selectedTemplate.type, driftInstances])

  // eslint-disable-next-line max-len
  const [ getVenueDriftReport, { isLoading: isVenueDriftReportLoading } ] = useLazyGetDriftReportByInstanceQuery()

  const [ patchDriftReport ] = usePatchDriftReportByInstanceMutation()

  const hasReachedTheMaxRecord = (): boolean => {
    return selectedInstances.length >= MAX_SYNC_VENUES
  }

  const onClose = () => {
    setVisible(false)
  }

  const onSync = async () => {
    try {
      await patchDriftReport({
        payload: {
          templateId: selectedTemplate.id!,
          instanceIds: selectedInstances
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
    return driftInstances.map(i => i.id).slice(0, MAX_SYNC_VENUES)
  }

  const footer = <div>
    { hasAllowedOperations([getOpsApi(ConfigTemplateUrlsInfo.patchDriftReportByInstance)]) &&
      <Button
        disabled={selectedInstances.length === 0}
        onClick={onSync}
        type='primary'
      >
        <span>{$t({ defaultMessage: 'Sync' })}</span>
      </Button>
    }
    <Button onClick={() => onClose()}>
      {$t({ defaultMessage: 'Cancel' })}
    </Button>
  </div>

  return (
    <Drawer
      title={$t({ defaultMessage: 'Drifts Report' })}
      visible={true}
      onClose={onClose}
      footer={footer}
      destroyOnClose={true}
      width={650}
    >
      <Space direction='vertical' size='small'>
        {/* eslint-disable-next-line max-len */}
        <p>{ $t({ defaultMessage: 'During sync all configurations in the selected template overwrite the corresponding configuration in the associated instances.' }) }</p>
        {selectedTemplate.type === ConfigTemplateType.VENUE && <>
          <Toolbar
            venueOptions={driftInstances}
            onSyncAllChange={onSyncAllChange}
            onInstanceFilterSelect={onInstanceFilterSelect}
          />
          <SelectedVenuesIndicator selectedCount={selectedInstances.length} />
        </>}
        <Divider style={{ margin: '8px 0 0 0' }} />
      </Space>
      <Loader states={[{ isLoading: isDriftInstancesLoading || isDriftReportLoading }]}>
        {selectedTemplate.type === ConfigTemplateType.VENUE
          ? <List
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
                  getDriftReport={(params: { templateId: string; instanceId: string }) => {
                    return getVenueDriftReport({ params })
                  }}
                  isLoading={isVenueDriftReportLoading}
                />
              </List.Item>
            )}
          />
          : driftReport?.map((set, index) => <DriftComparisonSet key={index} {...set} />)
        }
      </Loader>
    </Drawer>
  )
}

interface ToolbarProps {
  venueOptions: Array<{ name: string, id: string }>
  onSyncAllChange: (e: CheckboxChangeEvent) => void
  onInstanceFilterSelect: (value: string | undefined) => void
}

function Toolbar (props: ToolbarProps) {
  const { venueOptions, onSyncAllChange, onInstanceFilterSelect } = props
  const { $t } = useIntl()

  return <Row justify='space-between' align='middle'>
    <Col span={12}>
      <Checkbox onChange={onSyncAllChange}>
        {$t({ defaultMessage: 'Sync all drifts for all <venuePlural></venuePlural>' })}
      </Checkbox>
    </Col>
    <Col span={12} style={{ textAlign: 'right' }}>
      <Select
        style={{ minWidth: 200, textAlign: 'left' }}
        placeholder={$t({ defaultMessage: 'All <VenuePlural></VenuePlural>' })}
        allowClear
        showSearch
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        onChange={onInstanceFilterSelect}
        options={venueOptions.map(i => ({ label: i.name, value: i.id }))}
      />
    </Col>
  </Row>
}

export function SelectedVenuesIndicator (props: { selectedCount: number }) {
  const { selectedCount } = props
  const { $t } = useIntl()

  if (selectedCount === 0) return null

  return <ConfigTemplatePageUI.SelectedInstancesIndicator>
    { $t({ defaultMessage: '{num} selected' }, { num: selectedCount }) }
  </ConfigTemplatePageUI.SelectedInstancesIndicator>
}
