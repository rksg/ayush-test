import React from 'react'

import { useIntl } from 'react-intl'

import { PageHeader, TableColumn } from '@acx-ui/components'
import { ConfigTemplate }          from '@acx-ui/rc/utils'
import { RbacOpsIds }              from '@acx-ui/types'

import { ConfigTemplateList } from './Templates'

export * from './Wrappers'
export * from './Overrides'

export { isTemplateTypeAllowed } from './Templates/templateUtils'
export * as ConfigTemplatePageUI from './Templates/styledComponents'
export { DriftInstance, DriftComparisonSet } from './Templates/driftDetails'
export { DetailsItemList } from './Templates/DetailsDrawer'

export interface CommonConfigTemplateDrawerProps {
  setVisible: (visible: boolean) => void
  selectedTemplate: ConfigTemplate
}

export interface ConfigTemplateViewProps {
  ApplyTemplateView: (props: CommonConfigTemplateDrawerProps) => JSX.Element
  canApplyTemplate?: (template: ConfigTemplate) => boolean
  AppliedToView?: (props: CommonConfigTemplateDrawerProps) => JSX.Element
  AppliedToListView?: (props: { selectedTemplate: ConfigTemplate }) => JSX.Element
  ShowDriftsView: (props: CommonConfigTemplateDrawerProps) => JSX.Element
  // eslint-disable-next-line max-len
  appliedToColumn: TableColumn<ConfigTemplate, 'text'> & { customRender: (row: ConfigTemplate, callback: () => void) => React.ReactNode }
  actionRbacOpsIds?: {
    apply?: RbacOpsIds
  }
}

export function ConfigTemplateView (props: ConfigTemplateViewProps) {
  const { $t } = useIntl()

  return (
    <>
      <PageHeader title={$t({ defaultMessage: 'Configuration Templates' })} />
      <ConfigTemplateList {...props} />
    </>
  )
}
