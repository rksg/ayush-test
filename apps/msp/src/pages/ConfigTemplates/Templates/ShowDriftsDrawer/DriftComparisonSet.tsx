import React from 'react'

import { useIntl } from 'react-intl'

import { Collapse, Tooltip }                                                   from '@acx-ui/components'
import { MinusSquareOutlined, PlusSquareOutlined, QuestionMarkCircleOutlined } from '@acx-ui/icons'
import {  ConfigTemplateDriftSet }                                             from '@acx-ui/rc/utils'

import { DriftComparison }           from './DriftComparison'
import * as UI                       from './styledComponents'
import { filterDriftRecordIdByName } from './utils'

export function DriftComparisonSet (props: ConfigTemplateDriftSet) {
  const { diffName, diffData } = props
  const isUnknown = diffName.startsWith('?')

  const header = isUnknown
    ? <UnknownTooltip children={<UI.BoldLabel>{diffName}</UI.BoldLabel>} />
    : <UI.BoldLabel>{diffName}</UI.BoldLabel>

  return <UI.DriftSetCollapse
    ghost
    expandIconPosition='start'
    expandIcon={({ isActive }) => {
      return isUnknown
        ? <UnknownTooltip children={<QuestionMarkCircleOutlined />} />
        : isActive ? <MinusSquareOutlined /> : <PlusSquareOutlined />
    }}
  >
    <Collapse.Panel
      key={diffName}
      collapsible={isUnknown ? 'disabled' : 'header'}
      header={header}
    >
      {filterDriftRecordIdByName(diffData).map((item, index) => {
        return <div key={index} style={{ marginLeft: '12px' }}>
          <DriftComparison {...item} />
        </div>
      })}
    </Collapse.Panel>
  </UI.DriftSetCollapse>
}


function UnknownTooltip (props: React.PropsWithChildren<unknown>) {
  const { children } = props
  const { $t } = useIntl()
  return <Tooltip title={$t({ defaultMessage: 'Drifts are not available' })}>
    {children}
  </Tooltip>
}
