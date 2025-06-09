
import { useEffect, useState } from 'react'

import { Col, Row, Switch, Typography } from 'antd'
import { useIntl }                      from 'react-intl'
import { useParams }                    from 'react-router-dom'

import { showToast }                                                                              from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                 from '@acx-ui/feature-toggle'
import { useGetPrivacySettingsQuery, useGetTenantDetailsQuery, useUpdatePrivacySettingsMutation } from '@acx-ui/rc/services'
import { AdministrationUrlsInfo, PrivacyFeatureName }                                             from '@acx-ui/rc/utils'
import { hasAllowedOperations, useUserProfileContext }                                            from '@acx-ui/user'
import { AccountType, getOpsApi }                                                                 from '@acx-ui/utils'

import { MessageMapping } from './MessageMapping'


interface RequestPayload {
    privacyFeatures: {
        featureName: PrivacyFeatureName,
        status: 'enabled' | 'disabled'
    }[]
}

export default function Privacy () {
  const { $t } = useIntl()
  const params = useParams()
  const {
    isPrimeAdmin,
    rbacOpsApiEnabled
  } = useUserProfileContext()
  const isPrimeAdminUser = isPrimeAdmin()
  const [isPrivacyMonitoringSettingsEnabled, setIsPrivacyMonitoringSettingsEnabled]
    = useState<boolean>(false)
  const [isAppVisibilitySettingsEnabled, setIsAppVisibilitySettingsEnabled]
    = useState<boolean>(false)

  const { data: tenantDetails } = useGetTenantDetailsQuery({ params })

  const isAppVisibilityEnabled = useIsSplitOn(Features.MSP_APP_VISIBILITY)

  const tenantType = tenantDetails?.tenantType

  const isMsp = (tenantType === AccountType.MSP || tenantType === AccountType.MSP_NON_VAR)

  const { data } = useGetPrivacySettingsQuery({ params })

  const payload: RequestPayload = {
    privacyFeatures: [
      {
        featureName: PrivacyFeatureName.ARC,
        status: 'disabled'
      },
      ...(isMsp ? [{
        featureName: PrivacyFeatureName.APP_VISIBILITY,
        status: 'disabled'
      }] as { featureName: PrivacyFeatureName, status: 'enabled' | 'disabled' }[]: [])
    ]
  }

  useEffect(() => {
    if (data) {
      const privacyMonitoringSetting =
        data.filter(item => item.featureName === PrivacyFeatureName.ARC)[0]
      const privacyVisibilitySetting =
        data.filter(item => item.featureName === PrivacyFeatureName.APP_VISIBILITY)[0]
      setIsPrivacyMonitoringSettingsEnabled(privacyMonitoringSetting.isEnabled)
      setIsAppVisibilitySettingsEnabled(privacyVisibilitySetting.isEnabled)

      payload.privacyFeatures.forEach(item => {
        if (item.featureName === PrivacyFeatureName.ARC)
          item.status = privacyMonitoringSetting.isEnabled
            ? 'enabled' : 'disabled'

        if (item.featureName === PrivacyFeatureName.APP_VISIBILITY)
          item.status = privacyVisibilitySetting.isEnabled
            ? 'enabled' : 'disabled'
      })
    }
  }, [data])

  const [updatePrivacySettings] = useUpdatePrivacySettingsMutation()

  async function onPrivacySettingsToggle (privacyFeatureName: PrivacyFeatureName,
    isChecked: boolean) {
    let resultingPayload: RequestPayload = {} as RequestPayload

    if (privacyFeatureName === PrivacyFeatureName.ARC) {
      resultingPayload.privacyFeatures = payload.privacyFeatures
        .filter(_privacy => _privacy.featureName === PrivacyFeatureName.ARC)
      resultingPayload.privacyFeatures[0].status = isChecked ? 'enabled' : 'disabled'
      setIsPrivacyMonitoringSettingsEnabled(isChecked)
    }

    if (privacyFeatureName === PrivacyFeatureName.APP_VISIBILITY) {
      resultingPayload.privacyFeatures = payload.privacyFeatures
        .filter(_privacy => _privacy.featureName === PrivacyFeatureName.APP_VISIBILITY)
      resultingPayload.privacyFeatures[0].status = isChecked ? 'enabled' : 'disabled'
      setIsAppVisibilitySettingsEnabled(isChecked)
    }

    await updatePrivacySettings({
      params,
      payload: resultingPayload
    }).unwrap()
      .then(() => {
        showToast({
          type: 'success',
          content: $t({ defaultMessage: '{privacyFeature} is {enabled}' }, {
            enabled: isChecked ? 'enabled' : 'disabled',
            privacyFeature: privacyFeatureName === PrivacyFeatureName.ARC
              ? 'Application-recognition and control'
              : 'Application visibility'
          })
        })
      }).catch((error) => {
        showToast({
          type: 'error',
          content: error?.data?.message || error?.data?.error?.message
        })
      })
  }

  return (
    <>
      { isAppVisibilityEnabled
      && isMsp
      && <div>
        <Row gutter={24}
          style={{
            marginBottom: '6px'
          }}>
          { !!(rbacOpsApiEnabled
            ? hasAllowedOperations([getOpsApi(AdministrationUrlsInfo.updatePrivacySettings)])
            : isPrimeAdminUser) ? <Col span={9}>
              <Typography.Text>
                { $t(MessageMapping.app_visibility_privacy_settings_label) }
              </Typography.Text>
              <Switch
                style={{ marginLeft: '24px' }}
                checked={isAppVisibilitySettingsEnabled}
                onChange={(ev) => onPrivacySettingsToggle(PrivacyFeatureName.APP_VISIBILITY, ev)}/>
            </Col>
            : <Col span={8}>
              <Typography.Text>
                {
                  $t(MessageMapping.app_visibility_privacy_settings_label_non_prime_admin)
                }
                {
                  ` ${isAppVisibilitySettingsEnabled ? $t({
                    defaultMessage: 'Enabled'
                  }) : $t({
                    defaultMessage: 'Disabled'
                  })}`
                }
              </Typography.Text>
            </Col> }
        </Row>
        <Row gutter={24}>
          <Col span={10}>
            <Typography.Text style={{
              color: 'var(--acx-neutrals-50)'
            }}>
              {
                $t(MessageMapping.app_visibility_privacy_settings_description)
              }
            </Typography.Text>
          </Col>
        </Row>
      </div>
      }
      <div style={{
        marginTop: '20px'
      }}>
        <Row gutter={24}
          style={{
            marginBottom: '6px'
          }}>
          { !!(rbacOpsApiEnabled
            ? hasAllowedOperations([getOpsApi(AdministrationUrlsInfo.updatePrivacySettings)])
            : isPrimeAdminUser) ?
            <Col span={7}>
              <Typography.Text>
                { $t(MessageMapping.arc_privacy_settings_label) }
              </Typography.Text>
              <Switch
                style={{ marginLeft: '24px' }}
                checked={isPrivacyMonitoringSettingsEnabled}
                onChange={(ev) => onPrivacySettingsToggle(PrivacyFeatureName.ARC, ev)}/>
            </Col>
            : <Col span={7}>
              <Typography.Text>
                {
                  $t(MessageMapping.arc_privacy_settings_label_non_prime_admin)
                }
                {
                  ` ${isPrivacyMonitoringSettingsEnabled ? $t({
                    defaultMessage: 'Enabled'
                  }) : $t({
                    defaultMessage: 'Disabled'
                  })}`
                }
              </Typography.Text>
            </Col> }
        </Row>
        <Row gutter={24}>
          <Col span={10}>
            <Typography.Text style={{
              color: 'var(--acx-neutrals-50)'
            }}>
              {
                $t(MessageMapping.arc_privacy_settings_description)
              }
            </Typography.Text>
          </Col>
        </Row>
      </div>
    </>
  )
}
