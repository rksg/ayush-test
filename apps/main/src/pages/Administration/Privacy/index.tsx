
import { useEffect, useState } from 'react'

import { Col, Row, Switch, Typography } from 'antd'
import { useIntl }                      from 'react-intl'
import { useParams }                    from 'react-router-dom'

import { showToast }                                                    from '@acx-ui/components'
import { useGetPrivacySettingsQuery, useUpdatePrivacySettingsMutation } from '@acx-ui/rc/services'
import { PrivacyFeatureName }                                           from '@acx-ui/rc/utils'
import { useUserProfileContext }                                        from '@acx-ui/user'

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
    isPrimeAdmin
  } = useUserProfileContext()
  const isPrimeAdminUser = isPrimeAdmin()
  const [isPrivacyMonitoringSettingsEnabled, setIsPrivacyMonitoringSettingsEnabled]
    = useState<boolean>(false)

  const { data } = useGetPrivacySettingsQuery({ params })

  const payload: RequestPayload = {
    privacyFeatures: [
      {
        featureName: PrivacyFeatureName.ARC,
        status: 'disabled'
      },
      {
        featureName: PrivacyFeatureName.APP_VISIBILITY,
        status: 'disabled'
      }
    ]
  }

  useEffect(() => {
    if (data) {
      const privacyMonitoringSetting =
        data.filter(item => item.featureName === PrivacyFeatureName.ARC)[0]
      const privacyVisibilitySetting =
        data.filter(item => item.featureName === PrivacyFeatureName.APP_VISIBILITY)[0]
      setIsPrivacyMonitoringSettingsEnabled(privacyMonitoringSetting.isEnabled)

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
    payload.privacyFeatures.map(item => {
      if (item.featureName === privacyFeatureName)
        item.status = isChecked ? 'enabled' : 'disabled'
      return item
    })

    if (privacyFeatureName === PrivacyFeatureName.ARC)
      setIsPrivacyMonitoringSettingsEnabled(isChecked)

    await updatePrivacySettings({
      params,
      payload
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
      <Row gutter={24}
        style={{
          marginBottom: '6px'
        }}>
        { isPrimeAdminUser ? <>
          <Col span={6}>
            <Typography.Text>
              { $t(MessageMapping.arc_privacy_settings_label) }
            </Typography.Text>
          </Col>
          <Col span={1}>
            <Switch
              checked={isPrivacyMonitoringSettingsEnabled}
              onChange={(ev) => onPrivacySettingsToggle(PrivacyFeatureName.ARC, ev)}/>
          </Col>
        </>
          : <Col span={6}>
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
    </>
  )
}
