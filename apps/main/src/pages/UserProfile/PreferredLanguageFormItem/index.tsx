import { Form, Select } from 'antd'
import { useIntl }      from 'react-intl'
import styled           from 'styled-components'

import { useUserProfileContext } from '@acx-ui/user'
import { DEFAULT_SYS_LANG }      from '@acx-ui/utils'

/* eslint-disable-next-line */
// export interface PreferredLanguageFormItemProps {}

const StyledIndex = styled.div`
  color: pink;
`

export function PreferredLanguageFormItem () {
  const { $t } = useIntl()
  // const { Option } = Select
  const { data: userProfile } = useUserProfileContext()

  const generateLangLabel = (val: string): string | undefined => {
    const lang = (userProfile?.preferredLanguage ?? DEFAULT_SYS_LANG).slice(0, 2)
    const languageNames = new Intl.DisplayNames([val], { type: 'language' })
    const currLangDisplay = new Intl.DisplayNames([lang], { type: 'language' })
    if (lang === val) return currLangDisplay.of(val)
    return $t({ defaultMessage: '{language} ({localLanguage})' }, {
      language: currLangDisplay.of(val),
      localLanguage: languageNames.of(val)
    })
  }

  const supportedLangs = [DEFAULT_SYS_LANG,
    'ja-JP', 'fr-FR', 'pt-BR', 'ko-KR', 'es-ES'].map(val => ({
    label: generateLangLabel(val.slice(0, 2)),
    value: val
  }))

  return (
    <StyledIndex>
      <Form.Item
        name='preferredLanguage'
        label={$t({ defaultMessage: 'Preferred Language' })}
        initialValue={userProfile?.preferredLanguage
        === DEFAULT_SYS_LANG ? 'English' : ''}
        children={
          <Select>
            {/*<Option>{$t({ defaultMessage: 'English' })}</Option>*/}
            {supportedLangs.map(({ label, value }) =>
              (<Select.Option value={value} key={value} children={label}/>)
            )}
          </Select>
        }
      />
    </StyledIndex>
  )
}

export default PreferredLanguageFormItem
