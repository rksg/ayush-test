import { Col, Select, Form, Row, Typography } from 'antd'
import { useIntl }                            from 'react-intl'

import { usePreference }             from '@acx-ui/rc/components'
import { LangKey, useLocaleContext } from '@acx-ui/utils'

import { MessageMapping } from '../MessageMapping'
const DefaultSystemLanguageFormItem = () => {
  const isDev = (window.location.hostname === 'localhost' ||
                  window.location.hostname === 'devalto.ruckuswireless.com')
  const { $t } = useIntl()
  const {
    data: preferenceData,
    currentDefaultLang,
    update: updatePreferences,
    getReqState,
    updateReqState
  } = usePreference()

  const locale = useLocaleContext()
  const handleDefaultLangChange = async (langCode: string) => {
    if (!langCode) return
    const payload = {
      global: { ...preferenceData?.global, defaultLanguage: langCode }
    }
    await updatePreferences({ newData: payload })
    const code = langCode as LangKey
    locale.setLang(code)
  }

  const isLoadingPreference = getReqState.isLoading || getReqState.isFetching
  const isUpdatingPreference = updateReqState.isLoading

  const generateLangLabel = (val: string): string | undefined => {
    const lang = (currentDefaultLang ?? 'en-US').slice(0, 2)
    const languageNames = new Intl.DisplayNames([val], { type: 'language' })
    const currLangDisplay = new Intl.DisplayNames([lang], { type: 'language' })
    if (lang === val) return currLangDisplay.of(val)
    return $t({ defaultMessage: '{language} ({localLanguage})' }, {
      language: currLangDisplay.of(val),
      localLanguage: languageNames.of(val)
    })
  }

  let supportedLangs = []
  if (isDev) {
    // This is temporary conditional check for Dev env for QA testing
    // Once we get actual translated language bundles we should clean this up
    supportedLangs = [ 'en-US', 'es-ES', 'ja-JP'].map(val => ({
      label: generateLangLabel(val.slice(0, 2)),
      value: val
    }))
  } else {
    supportedLangs = ['en-US'].map(val => ({
      label: generateLangLabel(val.slice(0, 2)),
      value: val
    }))
  }

  return (
    <Row gutter={24}>
      <Col span={10}>
        <Form.Item
          label={$t({ defaultMessage: 'Default System Language' })}
        >
          <Select
            value={currentDefaultLang}
            onChange={handleDefaultLangChange}
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
