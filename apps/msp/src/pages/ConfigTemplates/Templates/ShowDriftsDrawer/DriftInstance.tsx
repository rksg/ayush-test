import { useEffect, useState } from 'react'

import { Checkbox }            from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'

import { Collapse, Loader }                 from '@acx-ui/components'
import { CollapseActive, CollapseInactive } from '@acx-ui/icons'
import { useLazyGetDriftReportQuery }       from '@acx-ui/rc/services'
import { ConfigTemplateDriftSet }           from '@acx-ui/rc/utils'

import { DriftComparisonSet } from './DriftComparisonSet'
import * as UI                from './styledComponents'

export interface DriftInstanceProps {
  templateId: string
  instanceName: string
  instanceId: string
  updateSelection: (id: string, selected: boolean) => void
  selected?: boolean
  disalbed?: boolean
}

export function DriftInstance (props: DriftInstanceProps) {
  // eslint-disable-next-line max-len
  const { templateId, instanceName, instanceId, selected = false, updateSelection, disalbed = false } = props
  const [ getDriftReport, { isLoading: isLoadingDriftData } ] = useLazyGetDriftReportQuery()
  const [ checked, setChecked ] = useState(selected)
  const [ driftData, setDriftData ] = useState<ConfigTemplateDriftSet[]>([])

  const onCheckboxChange = (checked: boolean) => {
    setChecked(checked)
    updateSelection(instanceId, checked)
  }

  const onCollapseChange = (key: string | string[]) => {
    if (key && key.length > 0) {
      getDriftReport({ params: { templateId, tenantId: instanceId } }).then(result => {
        setDriftData(result.data ?? [])
      })
    }
  }

  useEffect(() => {
    onCheckboxChange(selected)
  }, [selected])

  const header = <div style={{
    display: 'inline-flex', alignItems: 'center', width: '100%', padding: '8px 0'
  }}>
    <div style={{ flex: '0 0 26px' }}>
      <Checkbox
        onChange={(e: CheckboxChangeEvent) => onCheckboxChange(e.target.checked)}
        onClick={(e) => e.stopPropagation()}
        checked={checked}
        disabled={!checked && disalbed}
      />
    </div>
    <div style={{ flex: '1 1 auto' }}>
      <span style={{ fontWeight: 'normal' }}>{instanceName}</span>
    </div>
  </div>

  return <UI.DriftInstanceCollapse
    ghost
    expandIconPosition='end'
    onChange={onCollapseChange}
    expandIcon={({ isActive }) => isActive ? <CollapseActive /> : <CollapseInactive />}
  >
    <Collapse.Panel header={header} key={instanceId}>
      <Loader states={[{ isLoading: isLoadingDriftData }]}>
        {driftData.map((set, index) => <DriftComparisonSet key={index} {...set} />)}
      </Loader>
    </Collapse.Panel>
  </UI.DriftInstanceCollapse>
}
