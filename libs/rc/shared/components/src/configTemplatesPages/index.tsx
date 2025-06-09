import { useIntl } from 'react-intl'

import { PageHeader }     from '@acx-ui/components'
import { ConfigTemplate } from '@acx-ui/rc/utils'

import { ConfigTemplateList } from './Templates'

export * from './Wrappers'
export { MAX_APPLICABLE_EC_TENANTS }                        from './constants'
export *                                                    from './Overrides'

export { CustomerFirmwareReminder } from './Templates/CustomerFirmwareReminder'
export { useEcFilters }             from './Templates/templateUtils'

export interface CommonConfigTemplateDrawerProps {
  setVisible: (visible: boolean) => void
  selectedTemplate: ConfigTemplate
}

interface ConfigTemplateViewProps {
  ApplyTemplateDrawer: (props: CommonConfigTemplateDrawerProps) => JSX.Element
}

export function ConfigTemplateView (props: ConfigTemplateViewProps) {
  const { $t } = useIntl()

  return (
    <>
      <PageHeader title={$t({ defaultMessage: 'Configuration Templates' })} />
      <ConfigTemplateList
        ApplyTemplateDrawer={props.ApplyTemplateDrawer}
      />
    </>
  )
}
