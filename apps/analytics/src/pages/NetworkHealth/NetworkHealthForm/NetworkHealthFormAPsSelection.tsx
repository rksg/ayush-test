import { FormattedMessage, useIntl } from 'react-intl'

import { StepsForm, Tooltip } from '@acx-ui/components'

import * as contents from '../contents'

import * as FormItems from './FormItems'

const tooltip = <FormattedMessage
  {...contents.apsSelectionTooltip}
  values={contents.formatValues}
/>

export function NetworkHealthFormAPsSelection () {
  const { $t } = useIntl()
  return <>
    <StepsForm.Title>
      {$t(contents.steps.apsSelection)}
      <Tooltip.Question title={tooltip} />
    </StepsForm.Title>
    <FormItems.APsSelection />
  </>
}

