import { useIntl } from 'react-intl'

import { PageHeader } from '@acx-ui/components'

import { ConfigTemplateList } from './Templates'

export enum ConfigTemplateTabKey {
  TEMPLATES = 'templates',
  BUNDLES = 'bundles'
}

export function ConfigTemplate () {
  const { $t } = useIntl()

  return (
    <>
      <PageHeader title={$t({ defaultMessage: 'Configuration Templates' })} />
      <ConfigTemplateList />
    </>
  )
}
