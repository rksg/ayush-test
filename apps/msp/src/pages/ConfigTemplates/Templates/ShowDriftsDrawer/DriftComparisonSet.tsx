import { Collapse }                                from '@acx-ui/components'
import { MinusSquareOutlined, PlusSquareOutlined } from '@acx-ui/icons'
import {  ConfigTemplateDriftSet }                 from '@acx-ui/rc/utils'

import { DriftComparison }           from './DriftComparison'
import * as UI                       from './styledComponents'
import { filterDriftRecordIdByName } from './utils'

export function DriftComparisonSet (props: ConfigTemplateDriftSet) {
  const { diffName, diffData } = props

  return <UI.DriftSetCollapse
    ghost
    expandIconPosition='start'
    expandIcon={({ isActive }) => isActive ? <MinusSquareOutlined /> : <PlusSquareOutlined />}
  >
    <Collapse.Panel header={<UI.BoldLabel>{diffName}</UI.BoldLabel>} key={diffName}>
      {filterDriftRecordIdByName(diffData).map((item, index) => {
        return <div key={index} style={{ marginLeft: '12px' }}>
          <DriftComparison {...item} />
        </div>
      })}
    </Collapse.Panel>
  </UI.DriftSetCollapse>
}
