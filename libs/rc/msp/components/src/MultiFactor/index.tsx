import { useEffect } from 'react'

import { Row, Col, Form } from 'antd'
import { useIntl }        from 'react-intl'

import { Subtitle }                 from '@acx-ui/components'
import { useGetTenantDetailsQuery } from '@acx-ui/rc/services'
import { useParams }                from '@acx-ui/react-router-dom'
import {
  MFAMethod,
  MFAStatus,
  useGetMfaAdminDetailsQuery,
  useGetMfaTenantDetailsQuery
} from '@acx-ui/user'
import { AccountType, isDelegationMode } from '@acx-ui/utils'

import { AuthenticationMethod }       from './AuthenticationMethod'
import { BackupAuthenticationMethod } from './BackupAuthenticationMethod'

export const MultiFactor = () => {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const [form] = Form.useForm()
  const { data } = useGetMfaTenantDetailsQuery({ params: { tenantId } })
  const tenantDetailsData = useGetTenantDetailsQuery({ params: { tenantId } })

  const mfaStatus = data?.enabled &&
    tenantDetailsData?.data?.tenantMFA?.mfaStatus === MFAStatus.ENABLED
  const { data: details } = useGetMfaAdminDetailsQuery({
    params: { userId: data?.userId } },
  { skip: !mfaStatus })
  const isMasqueraded = isDelegationMode()

  useEffect(() => {
    if (details) {
      const otpEnabled = details?.mfaMethods.includes(MFAMethod.SMS) ||
                    details?.mfaMethods.includes(MFAMethod.EMAIL)
      const mobileEnabled = details?.mfaMethods.includes(MFAMethod.MOBILEAPP)

      form.setFieldsValue({
        contactId: '',
        ...data,
        ...details,
        otpToggle: otpEnabled,
        authAppToggle: mobileEnabled
      })
    }
  }, [form, data, details])

  const configurable = mfaStatus && !isMasqueraded
  const tenantType = tenantDetailsData.data?.tenantType
  const hideRecoveryCode = tenantType === AccountType.MSP_EC ||
    tenantType === AccountType.MSP_INTEGRATOR || tenantType === AccountType.MSP_INSTALLER

  return (
    <Form
      form={form}
      layout='vertical'
    >
      <Row gutter={20}>
        <Col span={8}>
          <Subtitle level={4}>
            { $t({ defaultMessage: 'Multi-Factor Authentication' }) }
          </Subtitle>
          <Form.Item style={{ marginTop: '14px' }}
            label={$t({ defaultMessage: 'Multi-Factor Authentication' })}
            tooltip={$t({ defaultMessage:
                  'This option is controlled by the Prime-Administrator(s) of this account.' +
                  'If they turn it on, you will be able to manage here your authentication ' +
                  'settings' })}
          >
            <label>
              {mfaStatus ? $t({ defaultMessage: 'On' }) : $t({ defaultMessage: 'Off' })}
            </label>
          </Form.Item>
        </Col>
      </Row>
      {configurable && (
        <Row gutter={20}>
          <Col span={8}>
            <AuthenticationMethod formRef={form} />
          </Col>
        </Row>
      )}
      {configurable && !hideRecoveryCode && (
        <Row gutter={20}>
          <Col span={8}>
            <BackupAuthenticationMethod
              recoveryCodes={data?.recoveryCodes ? data.recoveryCodes : []}
            />
          </Col>
        </Row>
      )}
    </Form>
  )
}
