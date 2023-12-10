import { defineMessage, IntlShape, useIntl } from 'react-intl'

import { Button, NoActiveData, NoActiveContent, NoDataIcon } from '@acx-ui/components'
import { useNavigate }                                       from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

const optimalConfigurationText = defineMessage({ defaultMessage:
  `Your network is already running in an optimal configuration
  and we don’t have any AI Operations to recommend currently.` })

export function OptimalConfiguration () {
  const { $t } = useIntl()
  return (
    <NoActiveData
      tickSize='large'
      text={$t(optimalConfigurationText)}
    />
  )
}

export function OptimalConfigurationWithData () {
  const { $t } = useIntl()
  return (
    <UI.OptimalConfigurationWrapper>
      <NoActiveContent
        tickSize='large'
        text={$t(optimalConfigurationText)}
      />
    </UI.OptimalConfigurationWrapper>
  )
}

export function NoAiOpsLicense () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  return (
    <UI.LicenseWrapper>
      <NoDataIcon
        text={$t({ defaultMessage:
          `RUCKUS AI cannot analyze your zone(s) due to inadequate licenses.
          Please ensure you have licenses fully applied for zone(s) for
          AI Operations optimizations.`
        })}
      />
      <Button
        size='small'
        block
        onClick={() => navigate('/analytics/admin/license')}
        children={$t({ defaultMessage: 'Update My Licenses' })}
      />
    </UI.LicenseWrapper>
  )
}

export const subtitle = ($t: IntlShape['$t']) => $t({
  defaultMessage: 'Say goodbye to manual guesswork and hello to intelligent recommendations.' })
