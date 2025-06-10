import React from 'react'

import { useIntl } from 'react-intl'

import { PageHeader, TableColumn } from '@acx-ui/components'
import { ConfigTemplate }          from '@acx-ui/rc/utils'

import { ConfigTemplateList } from './Templates'

export * from './Wrappers'
export * from './constants'
export * from './Overrides'

export { useEcFilters }             from './Templates/templateUtils'
export * as ConfigTemplatePageUI from './Templates/styledComponents'

export interface CommonConfigTemplateDrawerProps {
  setVisible: (visible: boolean) => void
  selectedTemplate: ConfigTemplate
}

export interface ConfigTemplateViewProps {
  ApplyTemplateDrawer: (props: CommonConfigTemplateDrawerProps) => JSX.Element
  AppliedToDrawer: (props: CommonConfigTemplateDrawerProps) => JSX.Element
  ShowDriftsDrawer: (props: CommonConfigTemplateDrawerProps) => JSX.Element
  // eslint-disable-next-line max-len
  appliedToColumn: TableColumn<ConfigTemplate, 'text'> & { customRender: (row: ConfigTemplate, callback: () => void) => React.ReactNode }
}

export function ConfigTemplateView (props: ConfigTemplateViewProps) {
  const { $t } = useIntl()

  return (
    <>
      <PageHeader title={$t({ defaultMessage: 'Configuration Templates' })} />
      <ConfigTemplateList
        ApplyTemplateDrawer={props.ApplyTemplateDrawer}
        AppliedToDrawer={props.AppliedToDrawer}
        ShowDriftsDrawer={props.ShowDriftsDrawer}
        appliedToColumn={props.appliedToColumn}
      />
    </>
  )
}
