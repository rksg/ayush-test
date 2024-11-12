import { Collapse }                                          from '@acx-ui/components'
import { MinusSquareOutlined, PlusSquareOutlined }           from '@acx-ui/icons'
import { ConfigTemplateDriftRecord, ConfigTemplateDriftSet } from '@acx-ui/rc/utils'

import { DriftComparison } from './DriftComparison'
import * as UI             from './styledComponents'

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

// eslint-disable-next-line max-len
export function filterDriftRecordIdByName (input: ConfigTemplateDriftRecord[]): ConfigTemplateDriftRecord[] {
  return input.filter((record: ConfigTemplateDriftRecord) => {
    if (record.path.endsWith('Id')) {
      const isNameRecordExisted = input.some((item: ConfigTemplateDriftRecord) => {
        return item.path === `${record.path}Name`
      })
      return !isNameRecordExisted
    } else if (/Id\/\d+$/.test(record.path)) {
      const isNameRecordExisted = input.some((item: ConfigTemplateDriftRecord) => {
        return item.path === record.path.replace(/(Id)\/(\d+)$/, (match, p1, p2) => `IdName/${p2}`)
      })

      return !isNameRecordExisted
    }

    return true
  })
}
