import { useEffect, useState } from 'react'

import { Checkbox, Col, Row }  from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { useIntl }             from 'react-intl'

import { Collapse, Loader }                 from '@acx-ui/components'
import { CollapseActive, CollapseInactive } from '@acx-ui/icons'
import { useLazyGetDriftDataQuery }         from '@acx-ui/rc/services'

import { DriftComparisonSet, DriftComparisonSetData } from './DriftComparisonSet'
import * as UI                                        from './styledComponents'
import { transformDriftResponse }                     from './utils'



export interface DriftInstanceProps {
  instanceName: string
  instanceId: string
  updateSelection: (id: string, selected: boolean) => void
  selected?: boolean
  disalbed?: boolean
}

export function DriftInstance (props: DriftInstanceProps) {
  const { $t } = useIntl()
  const { instanceName, instanceId, selected = false, updateSelection, disalbed = false } = props
  const [ getDriftData, { isLoading: isLoadingDriftData } ] = useLazyGetDriftDataQuery()
  const [ checked, setChecked ] = useState(selected)
  const [ driftData, setDriftData ] = useState<DriftComparisonSetData[]>([])

  const onCheckboxChange = (checked: boolean) => {
    setChecked(checked)
    updateSelection(instanceId, checked)
  }

  const onCollapseChange = (key: string | string[]) => {
    if (!key || key.length === 0) return

    getDriftData({ params: { instanceId } }).then(result => {
      setDriftData(transformDriftResponse(result.data))
    })
  }

  useEffect(() => {
    onCheckboxChange(selected)
  }, [selected])

  const header = <div style={{
    backgroundColor: '#F2F2F2', padding: '8px 30px 8px 16px', width: '100%',
    display: 'inline-flex', alignItems: 'center',
    borderTop: '1px solid #D7D7D7',
    borderBottom: '1px solid #D7D7D7'
  }}>
    <Checkbox
      style={{ flex: '0 0 26px' }}
      onChange={(e: CheckboxChangeEvent) => onCheckboxChange(e.target.checked)}
      onClick={(e) => e.stopPropagation()}
      checked={checked}
      disabled={!checked && disalbed}
    />
    <Row style={{ flex: '1 1 auto' }}>
      <Col span={12}>
        {$t({ defaultMessage: 'Configurations in Template' })}
      </Col>
      <Col span={12}>
        {$t({ defaultMessage: 'Configurations in {instanceName}' }, { instanceName })}
      </Col>
    </Row>
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
