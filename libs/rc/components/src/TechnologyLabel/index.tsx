import { useIntl } from 'react-intl'

import { ServiceTechnology, serviceTechnologyLabelMapping } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

export interface TechnologyLabelProps {
  technology: ServiceTechnology
}

export function TechnologyLabel (props: TechnologyLabelProps) {
  const { $t } = useIntl()
  const { technology } = props

  return (
    <UI.TechnologyContainer>
      <UI.TechnologyItem $type={technology}>
        {$t(serviceTechnologyLabelMapping[technology])}
      </UI.TechnologyItem>
    </UI.TechnologyContainer>
  )
}
