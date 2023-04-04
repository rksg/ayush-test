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
  let languageNames
  if (currentPreferredLang) {
    languageNames = new Intl.DisplayNames([currentPreferredLang], { type: 'language' })
  } else {
    languageNames = new Intl.DisplayNames(['en'], { type: 'language' })
  }

  const supportedLangs = [
    { label: `English (${languageNames.of('en')})`, value: 'en-US' }
  ]

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
