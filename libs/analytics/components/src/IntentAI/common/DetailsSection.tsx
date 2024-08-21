import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { useIntentContext }                  from '../IntentContext'
import { dataRetentionText, isDataRetained } from '../utils'

export const DetailsSection: React.FC<{
  title: React.ReactNode
  checkDataRetention?: boolean
} & React.HTMLAttributes<HTMLDivElement>> = ({ title, children, checkDataRetention, ...props }) => {
  const { $t } = useIntl()
  const { intent } = useIntentContext()
  // TODO: take dataEndTime from intent.metadata.dataEndTime
  if (checkDataRetention && !isDataRetained(intent.dataEndTime)) {
    children = $t(dataRetentionText)
  }
  return <div {...props} style={{ marginBlockEnd: 40 }}>
    <Typography.Title level={3} children={title} />
    <div children={children} />
  </div>
}
