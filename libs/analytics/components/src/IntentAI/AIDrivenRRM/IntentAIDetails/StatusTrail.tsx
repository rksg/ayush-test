import { useIntl } from 'react-intl'

import { Card }                      from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'

import { DetailsSection }  from '../../common/DetailsSection'
import { getIntentStatus } from '../../common/getIntentStatus'
import {
  StatusTrailDateLabel,
  StatusTrailItemWrapper,
  StatusTrailWrapper
} from '../../IntentAIDetails/styledComponents'
import { useIntentContext } from '../../IntentContext'

export const StatusTrail = () => {
  const { $t } = useIntl()
  const { intent } = useIntentContext()
  return <DetailsSection title={$t({ defaultMessage: 'Status Trail' })}>
    <Card>
      <StatusTrailWrapper>
        {intent.statusTrail.map(({ status, createdAt }, index) => (
          <StatusTrailItemWrapper key={index}>
            <StatusTrailDateLabel children={formatter(DateFormatEnum.DateTimeFormat)(createdAt)} />
            {getIntentStatus(status)}
          </StatusTrailItemWrapper>
        ))}
      </StatusTrailWrapper>
    </Card>
  </DetailsSection>
}
