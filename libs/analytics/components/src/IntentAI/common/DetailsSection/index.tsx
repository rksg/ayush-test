import { useIntl } from 'react-intl'

import { useIntentContext }                  from '../../IntentContext'
import { dataRetentionText, isDataRetained } from '../../utils'

import * as UI from './styledComponents'

export const DetailsSection: React.FC<{
  title: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>> = ({ title, children, ...props }) => {
  const { $t } = useIntl()
  const { intent } = useIntentContext()
  if (!isDataRetained(intent.metadata.dataEndTime)) {
    children = $t(dataRetentionText)
  }
  return <UI.Wrapper {...props}>
    <UI.Title children={title} />
    <div children={children} />
  </UI.Wrapper>
}
