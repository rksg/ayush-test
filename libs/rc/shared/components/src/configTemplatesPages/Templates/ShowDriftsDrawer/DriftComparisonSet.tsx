import React from 'react'

import { useIntl } from 'react-intl'

import { Collapse, Tooltip }                                                                          from '@acx-ui/components'
import { MinusSquareOutlined, PlusSquareOutlined, QuestionMarkCircleOutlined, WarningCircleOutlined } from '@acx-ui/icons'
import { ConfigTemplateDriftSet }                                                                     from '@acx-ui/rc/utils'

import { DriftComparison }           from './DriftComparison'
import * as UI                       from './styledComponents'
import { filterDriftRecordIdByName } from './utils'

export function DriftComparisonSet (props: ConfigTemplateDriftSet) {
  const { diffName, diffData } = props
  const driftSetErrorStatus = getErrorStatusFromDriftSet(props)

  return <UI.DriftSetCollapse
    ghost
    expandIconPosition='start'
    expandIcon={({ isActive }) => <DriftSetCollapseHeaderIcon {...props} isActive={isActive} />}
  >
    <Collapse.Panel
      key={diffName}
      collapsible={driftSetErrorStatus ? 'disabled' : 'header'}
      header={<DriftSetCollapseHeader {...props} />}
    >
      {filterDriftRecordIdByName(diffData).map((item, index) => {
        return <div key={index} style={{ marginLeft: '12px' }}>
          <DriftComparison {...item} />
        </div>
      })}
    </Collapse.Panel>
  </UI.DriftSetCollapse>
}

type DriftSetErrorStatus = 'unknown' | 'failed'

function getErrorStatusFromDriftSet (props: ConfigTemplateDriftSet): DriftSetErrorStatus | null {
  const { diffName, diffData } = props

  if (diffData.some(item => item.path === 'error')) {
    return 'failed'
  }

  if (diffName.startsWith('?')) {
    return 'unknown'
  }
  return null
}

function DriftSetCollapseHeader (props: ConfigTemplateDriftSet) {
  const { diffName } = props
  const diffNameLabel = <UI.BoldLabel>{diffName}</UI.BoldLabel>
  const driftSetErrorStatus = getErrorStatusFromDriftSet(props)

  if (driftSetErrorStatus) {
    return <StatusTooltip status={driftSetErrorStatus}>{diffNameLabel}</StatusTooltip>
  }
  return diffNameLabel
}

function DriftSetCollapseHeaderIcon (props: ConfigTemplateDriftSet & { isActive?: boolean }) {
  const { isActive } = props
  const driftSetErrorStatus = getErrorStatusFromDriftSet(props)

  if (driftSetErrorStatus) {
    const resolvedIcon = driftSetErrorStatus === 'failed'
      ? <WarningCircleOutlined />
      : <QuestionMarkCircleOutlined />
    return <StatusTooltip status={driftSetErrorStatus}>{resolvedIcon}</StatusTooltip>
  }
  return isActive ? <MinusSquareOutlined /> : <PlusSquareOutlined />
}

function StatusTooltip (props: React.PropsWithChildren<{ status: DriftSetErrorStatus }>) {
  const { status, children } = props
  const { $t } = useIntl()
  const title = status === 'unknown'
    ? $t({ defaultMessage: 'Drifts are not available' })
    : $t({ defaultMessage: 'Failed to handle drift content' })

  return <Tooltip title={title}>{children}</Tooltip>
}
