import { Form, Select } from 'antd'
import { useIntl }      from 'react-intl'

import { getUserProfile }                      from '@acx-ui/analytics/utils'
import { DEFAULT_SYS_LANG, useSupportedLangs } from '@acx-ui/utils'

const PreferredLanguageFormItem = () => {
  const { $t } = useIntl()
  const { preferences } = getUserProfile()
  const supportedLangs = useSupportedLangs(preferences?.preferredLanguage)

  return (
    <Form.Item
      name='preferredLanguage'
      label={$t({ defaultMessage: 'Preferred Language' })}
      initialValue={preferences?.preferredLanguage || DEFAULT_SYS_LANG}
    >
      <Select
        value={preferences?.preferredLanguage || DEFAULT_SYS_LANG}
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
