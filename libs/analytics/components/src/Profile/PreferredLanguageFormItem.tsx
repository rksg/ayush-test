import { Form, Select } from 'antd'
import { useIntl }      from 'react-intl'

import { Features, useIsSplitOn }              from '@acx-ui/feature-toggle'
import { useUserProfileContext }               from '@acx-ui/user'
import { DEFAULT_SYS_LANG, useSupportedLangs } from '@acx-ui/utils'

const PreferredLanguageFormItem = () => {
  const { $t } = useIntl()
  const isSupportDeZh = useIsSplitOn(Features.I18N_DE_ZH_TOGGLE)
  const { data: userProfile } = useUserProfileContext() // api to get user preferences
  const supportedLangs = useSupportedLangs(isSupportDeZh, userProfile?.preferredLanguage)

  return (
    <Form.Item
      name='preferredLanguage'
      label={$t({ defaultMessage: 'Preferred Language' })}
      initialValue={userProfile?.preferredLanguage || 'en-US'}
    >
      <Select
        value={userProfile?.preferredLanguage || DEFAULT_SYS_LANG}
        optionFilterProp='children'
        style={{ textTransform: 'capitalize' }}
      >
        {supportedLangs.map(({ label, value }) =>
          (<Select.Option
            style={{ textTransform: 'capitalize' }}
            value={value}
            key={value}
            children={label}/>)
        )}
      </Select>
    </Form.Item>
  )
}

export { PreferredLanguageFormItem }
