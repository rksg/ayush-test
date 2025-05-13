import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { EdgeHaSettingsForm, TypeForm } from '@acx-ui/rc/components'

export const HaSettingForm = () => {
  const { $t } = useIntl()

  const haSettingHeader = <Typography.Title level={2}>
    {$t({ defaultMessage: 'HA Settings' })}
  </Typography.Title>

  return <TypeForm
    header={haSettingHeader}
    content={<EdgeHaSettingsForm />}
  />
}