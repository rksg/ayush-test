import { useEffect, useState } from 'react'

import { Checkbox, Col, Row }  from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { useIntl }             from 'react-intl'

import { Collapse, Loader }                 from '@acx-ui/components'
import { CollapseActive, CollapseInactive } from '@acx-ui/icons'

import { mockedDriftResponse }                        from './__tests__/fixtures'
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
  const [ trigger, { isLoading } ] = useLazyGetDriftData()
  const [ checked, setChecked ] = useState(selected)
  const [ driftData, setDriftData ] = useState<DriftComparisonSetData[]>([])

  const onCheckboxChange = (checked: boolean) => {
    setChecked(checked)
    updateSelection(instanceId, checked)
  }

  const onCollapseChange = (key: string | string[]) => {
    if (!key || key.length === 0) return

    trigger(instanceId).then(data => setDriftData(data))
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
      <Loader states={[{ isLoading }]}>
        {driftData.map((set, index) => <DriftComparisonSet key={index} {...set} />)}
      </Loader>
    </Collapse.Panel>
  </UI.DriftInstanceCollapse>
}

// eslint-disable-next-line max-len
function useLazyGetDriftData (): [ (instanceId: string) => Promise<DriftComparisonSetData[]>, { isLoading: boolean } ] {
  const [ isLoading, setIsLoading ] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const trigger = (instanceId: string) => {
    setIsLoading(true)

    return new Promise<DriftComparisonSetData[]>(resolve => {
      setTimeout(() => {
        setIsLoading(false)
        resolve(transformDriftResponse(mockedDriftResponse))
      }, 1500)
    })
  }

  return [ trigger, { isLoading } ]
}
