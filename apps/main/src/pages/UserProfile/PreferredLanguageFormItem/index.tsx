import { Form, Select } from 'antd'
import { useIntl }      from 'react-intl'

import { useUserProfileContext }               from '@acx-ui/user'
import { DEFAULT_SYS_LANG, useSupportedLangs } from '@acx-ui/utils'

const PreferredLanguageFormItem = () => {
  const { $t } = useIntl()
  const { data: userProfile } = useUserProfileContext()
  const supportedLangs = useSupportedLangs(userProfile?.preferredLanguage)

  return (
    <Form.Item
      name='preferredLanguage'
      label={$t({ defaultMessage: 'Preferred Language' })}
      initialValue={userProfile?.preferredLanguage}
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
