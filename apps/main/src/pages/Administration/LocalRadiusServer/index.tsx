import { useIntl } from 'react-intl'

import { Fieldset } from '@acx-ui/components'

import { RadiusServerForm } from './RadiusServerForm'

const LocalRadiusServer = () => {
  const { $t } = useIntl()
  return(
    <Fieldset checked={true} label={$t({ defaultMessage: 'Local RADIUS (AAA) Server' })}>
      <RadiusServerForm/>
    </Fieldset>
  )
}

export default LocalRadiusServer
