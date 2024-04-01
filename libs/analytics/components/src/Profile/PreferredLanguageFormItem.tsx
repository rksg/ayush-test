import { Form, Select } from 'antd'
import { useIntl }      from 'react-intl'

import { getUserProfile }                      from '@acx-ui/analytics/utils'
import { Features, useIsSplitOn }              from '@acx-ui/feature-toggle'
import { DEFAULT_SYS_LANG, useSupportedLangs } from '@acx-ui/utils'

const PreferredLanguageFormItem = () => {
  const { $t } = useIntl()
  const isSupportDeZh = useIsSplitOn(Features.I18N_DE_ZH_TOGGLE)
  const { preferences } = getUserProfile()
  const supportedLangs = useSupportedLangs(isSupportDeZh, preferences?.preferredLanguage)

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
