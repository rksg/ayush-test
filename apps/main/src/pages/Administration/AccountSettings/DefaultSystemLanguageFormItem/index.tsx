import { useEffect, useState } from 'react'

import { Col, Select, Form, Row, Typography } from 'antd'
import { useIntl }                            from 'react-intl'

import { usePreference }                                              from '@acx-ui/rc/components'
import { loadLocale, LangKey, setUpIntl, useLocaleContext, Messages } from '@acx-ui/utils'

import { MessageMapping } from '../MessageMapping'

const DefaultSystemLanguageFormItem = () => {
  const { $t } = useIntl()
  const {
    data: preferenceData,
    currentPreferredLang,
    update: updatePreferences,
    getReqState,
    updateReqState
  } = usePreference()

  const locale = useLocaleContext()
  const [lang, setLang] = useState(locale?.lang ?? 'en-US')
  const [messages, setMessages] = useState<Messages>()

  const handlePreferredLangChange = (langCode: string) => {
    if (!langCode) return
    const payload = {
      global: { ...preferenceData?.global, preferredLanguage: langCode }
    }
    updatePreferences({ newData: payload })
    const code = langCode as LangKey
    locale.setLang(code)
  }

  const isLoadingPreference = getReqState.isLoading || getReqState.isFetching
  const isUpdatingPreference = updateReqState.isLoading

  const generateLangLabel = (val: string): string | undefined => {
    const lang = (currentPreferredLang ?? 'en-US').slice(0, 2)
    const languageNames = new Intl.DisplayNames([val], { type: 'language' })
    const currLangDisplay = new Intl.DisplayNames([lang], { type: 'language' })
    if (lang === val) return currLangDisplay.of(val)
    return $t({ defaultMessage: '{language} ({localLanguage})' }, {
      language: currLangDisplay.of(val),
      localLanguage: languageNames.of(val)
    })
  }

  const supportedLangs = [
    'en-US',
    'es-ES'
  ].map(val => ({
    label: generateLangLabel(val.slice(0, 2)),
    value: val
  }))

  useEffect(() => {
    loadLocale(lang).then((messages) => {
      setUpIntl({
        locale: lang,
        messages: messages
      })
      setLang(lang)
      setMessages(() => messages)
    })
  }, [lang])


  return (
    <Row gutter={24}>
      <Col span={10}>
        <Form.Item
          label={$t({ defaultMessage: 'Default System Language' })}
        >
          <Select
            value={currentPreferredLang}
            onChange={handlePreferredLangChange}
            showSearch
            allowClear
            optionFilterProp='children'
            disabled={isUpdatingPreference || isLoadingPreference}
          >
            {supportedLangs.map(({ label, value }) =>
              (<Select.Option value={value} key={value} children={label}/>)
            )}
          </Select>

        </Form.Item>
        <Typography.Paragraph className='description greyText'>
          {
            $t(MessageMapping.default_system_language_description)
          }
        </Typography.Paragraph>
      </Col>
    </Row>)
}

export { DefaultSystemLanguageFormItem }
