import { Col, Select, Form, Row, Typography } from 'antd'
import { useIntl }                            from 'react-intl'

import { usePreference }           from '@acx-ui/rc/components'
import { AdministrationUrlsInfo }  from '@acx-ui/rc/utils'
import { TenantLink, useLocation } from '@acx-ui/react-router-dom'
import {
  getUserProfile,
  hasAllowedOperations,
  hasCrossVenuesPermission

}                       from '@acx-ui/user'
import {
  LangKey,
  useLocaleContext,
  DEFAULT_SYS_LANG,
  useSupportedLangs,
  getOpsApi
} from '@acx-ui/utils'


import { MessageMapping } from '../MessageMapping'

const DefaultSystemLanguageFormItem = () => {
  const { $t } = useIntl()
  const { rbacOpsApiEnabled } = getUserProfile()
  const location = useLocation()

  const userProfileLink = <TenantLink
    state={{ from: location.pathname }}
    to='/userprofile/'>{$t({ defaultMessage: 'User Profile' })}
  </TenantLink>

  const {
    currentDefaultLang,
    updatePartial: updatePreferences,
    getReqState,
    updateReqState
  } = usePreference()
  const supportedLangs = useSupportedLangs(currentDefaultLang)

  const locale = useLocaleContext()
  const handleDefaultLangChange = async (langCode: string) => {
    if (!langCode) return
    const payload = {
      global: {
        // pTenant service processes userProfile.preferredLanguage
        // by reference admin setting data - preferredLanguage which is not defaultLanguage
        // Hence needed both these two attributes
        defaultLanguage: langCode,
        preferredLanguage: langCode
      }
    }
    updatePreferences({ newData: payload, onSuccess: () => {
      const code = langCode as LangKey
      locale.setLang(code)
    } })
  }

  const isLoadingPreference = getReqState.isLoading || getReqState.isFetching
  const isUpdatingPreference = updateReqState.isLoading

  const hasPermission = rbacOpsApiEnabled ?
    hasAllowedOperations([
      getOpsApi(AdministrationUrlsInfo.updatePreferences)
    ]) : hasCrossVenuesPermission()

  return (
    <Row gutter={24}>
      <Col span={10}>
        <Form.Item
          label={$t({ defaultMessage: 'Default System Language' })}
        >
          <Select
            value={currentDefaultLang || DEFAULT_SYS_LANG}
            onChange={handleDefaultLangChange}
            showSearch
            optionFilterProp='children'
            disabled={!hasPermission || isUpdatingPreference || isLoadingPreference}
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
        <Typography.Paragraph className='greyText'
          style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>
          {
            $t(MessageMapping.default_system_language_description)
          } {userProfileLink}.
        </Typography.Paragraph>
      </Col>
    </Row>)
}

export { DefaultSystemLanguageFormItem }
