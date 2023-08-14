import { Form, Select } from 'antd'
import { useIntl }      from 'react-intl'

import { useUserProfileContext } from '@acx-ui/user'
import { DEFAULT_SYS_LANG }      from '@acx-ui/utils'

const PreferredLanguageFormItem = () => {
  const { $t } = useIntl()
  const { data: userProfile } = useUserProfileContext()
  const generateLangLabel = (val: string): string | undefined => {
    const lang = (userProfile?.preferredLanguage ?? DEFAULT_SYS_LANG).slice(0, 2)
    const languageNames = new Intl.DisplayNames([val], { type: 'language' })
    const currLangDisplay = new Intl.DisplayNames([lang], { type: 'language' })
    if (lang === val) return currLangDisplay.of(val)
    return languageNames.of(val)
  }

  const supportedLangs = [DEFAULT_SYS_LANG,
    'ja-JP', 'fr-FR', 'pt-BR', 'ko-KR', 'es-ES'].map(val => ({
    label: generateLangLabel(val.slice(0, 2)),
    value: val
  }))

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
