import { Collapse }                                from '@acx-ui/components'
import { MinusSquareOutlined, PlusSquareOutlined } from '@acx-ui/icons'

import { DriftComparison, DriftComparisonData } from './DriftComparison'
import * as UI                                  from './styledComponents'

export interface DriftComparisonSetData {
  category: string
  driftItems: DriftComparisonData[]
}

export function DriftComparisonSet (props: DriftComparisonSetData) {
  const { category, driftItems } = props

  return <UI.DriftSetCollapse
    ghost
    expandIconPosition='start'
    expandIcon={({ isActive }) => isActive ? <MinusSquareOutlined /> : <PlusSquareOutlined />}
  >
    <Collapse.Panel header={<span style={{ fontWeight: '600' }}>{category}</span>} key={category}>
      {driftItems.map((item, index) => {
        return <div key={index} style={{ marginLeft: '12px' }}>
          <DriftComparison {...item} />
        </div>
      })}
    </Collapse.Panel>
  </UI.DriftSetCollapse>
}
