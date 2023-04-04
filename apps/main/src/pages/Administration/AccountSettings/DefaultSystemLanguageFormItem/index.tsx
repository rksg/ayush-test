import { Col, Select, Form, Row, Typography } from 'antd'
import { useIntl }                            from 'react-intl'

import { usePreference } from '@acx-ui/rc/components'

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

  const handlePreferredLangChange = (langCode: string) => {
    if (!langCode) return
    const payload = {
      global: { ...preferenceData?.global, preferredLanguage: langCode }
    }
    updatePreferences({ newData: payload })
  }

  const isLoadingPreference = getReqState.isLoading || getReqState.isFetching
  const isUpdatingPreference = updateReqState.isLoading

  const generateLangLabel = (val: string): string => {
    let languageNames, currLangDisplay
    languageNames = new Intl.DisplayNames([val], { type: 'language' })
    if (currentPreferredLang) {
      currLangDisplay = new Intl.DisplayNames([currentPreferredLang.substr(0, 2)],
        { type: 'language' })
      if (currentPreferredLang.substr(0, 2) !== val) {
        return `${currLangDisplay.of(val)} (${languageNames.of(val)})`
      } else return `${currLangDisplay.of(val)}`
    } else if ('en' !== val) {
      languageNames = new Intl.DisplayNames(['en'], { type: 'language' }) // default lang is en
      return `(${languageNames.of(val)})`
    } else return ''
  }

  const supportedLangs = [
    'en-US'
  ].map(val => ({
    label: `${generateLangLabel(val.substr(0, 2))}`,
    value: val
  }))

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
