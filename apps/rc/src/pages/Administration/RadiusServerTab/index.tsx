import { useIntl } from 'react-intl'

import { Fieldset } from '@acx-ui/components'

import { RadiusServerForm } from './RadiusServerForm'

export function RadiusServerTab () {
  const { $t } = useIntl()

  return(
    <Fieldset label={$t({ defaultMessage: 'Local RADIUS (AAA) Server' })}>
      <RadiusServerForm/>
    </Fieldset>
  )
}
