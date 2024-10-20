import { Collapse }                                from '@acx-ui/components'
import { MinusSquareOutlined, PlusSquareOutlined } from '@acx-ui/icons'
import { ConfigTemplateDriftSet }                  from '@acx-ui/rc/utils'

import { DriftComparison } from './DriftComparison'
import * as UI             from './styledComponents'

export function DriftComparisonSet (props: ConfigTemplateDriftSet) {
  const { diffName, diffData } = props

  return <UI.DriftSetCollapse
    ghost
    expandIconPosition='start'
    expandIcon={({ isActive }) => isActive ? <MinusSquareOutlined /> : <PlusSquareOutlined />}
  >
    <Collapse.Panel header={<span style={{ fontWeight: '600' }}>{diffName}</span>} key={diffName}>
      {diffData.map((item, index) => {
        return <div key={index} style={{ marginLeft: '12px' }}>
          <DriftComparison {...item} />
        </div>
      })}
    </Collapse.Panel>
  </UI.DriftSetCollapse>
}
