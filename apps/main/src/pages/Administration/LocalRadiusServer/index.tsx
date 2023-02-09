import { useIntl } from 'react-intl'

import { Fieldset } from '@acx-ui/components'

import { RadiusServerForm } from './RadiusServerForm'

const LocalRadiusServer = () => {
  const { $t } = useIntl()
  return(
    // eslint-disable-next-line max-len
    <Fieldset style={{ border: 'none' }} checked={true} label={$t({ defaultMessage: 'Local RADIUS (AAA) Server' })}>
      <RadiusServerForm/>
    </Fieldset>
  )
}

export default LocalRadiusServer
