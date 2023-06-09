import { useState } from 'react'

import { Form, Col, Row, Space } from 'antd'
import { useIntl }               from 'react-intl'


import { Button, Card, showActionModal, Tooltip } from '@acx-ui/components'
import { CsvSize }                                from '@acx-ui/rc/components'
import {
  useDeleteTenantAuthenticationsMutation
} from '@acx-ui/rc/services'
import {  TenantAuthentications, TenantAuthenticationType } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                       from '@acx-ui/react-router-dom'

import { SetupAzureDrawer } from './SetupAzureDrawer'
import { ButtonWrapper }    from './styledComponents'
import { ViewXmlModal }     from './ViewXmlModal'

interface AuthServerFormItemProps {
  className?: string;
  tenantAuthenticationData?: TenantAuthentications[];
}

{/* eslint-disable max-len */}
const sampleXml= '<?xml version=\'1.0\' encoding=\'UTF-8\'?> <md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" validUntil="2026-11-11T08:54:12.552223" entityID="https://sso.rkusbu.com/idp/saml2/metadata"> <md:IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol"> <md:KeyDescriptor use="signing"> <ds:KeyInfo> <ds:X509Data> <ds:X509Certificate>MIIDKTCCAhGgAwIBAgIJAIypbYzOQmTIMA0GCSqGSIb3DQEBCwUAMCsxKTAnBgNV BAMMIHNzby5pbnQuY2xvdWQucnVja3Vzd2lyZWxlc3MuY29tMB4XDTE5MDExODE5 MDAxMFoXDTI0MDExNzE5MDAxMFowKzEpMCcGA1UEAwwgc3NvLmludC5jbG91ZC5y dWNrdXN3aXJlbGVzcy5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIB AQDRGfxbJ2dT8Z1cPugQQ1LYkszanluv97fsNUYIOWPEnlZ+jGJIi5A2aIeewamm Wa/10BmIBkW5vrV/iWKec4u+EaFfdtfpf8B/weFHZPel+BxKPXDmp/KgfSaYtw6L fdOGI8DLp6xpM8INrI2IZyvlIi75ewdAKCKoH17kmojzkBObSwiFTdv6HH3tGyMK BSa6PyGBOfjt04YhEBxY+fHjE4Ax1JdybYLdX5ozjWrp0jPPHgg52q6Yl0ti4XLa pGssaccIbNAx50c5BwmeOZfUZkmhcPo6nzRyVHsDY9inl+CkV5MaYSx9ghqdMfXx 8cM5Hh2ko5RHEBKZtlk8OapXAgMBAAGjUDBOMB0GA1UdDgQWBBTMuBJHn0RBemv8 XKQsJiDKvPP2mzAfBgNVHSMEGDAWgBTMuBJHn0RBemv8XKQsJiDKvPP2mzAMBgNV HRMEBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQCDPf9I4DL7sSO/MI0Pt8cx4Dp0 XiUzRTxcEn+IaAQ4TY5VPLWRSdSkVVf8/LF7pWUQIn14XU8oAkG/SpAg1vTjTTt3 v7BztNTBZBeKDA/uEWx1PHYT46F/Wnq8MzSlABQiIk1ekmCni03h6wUnOFtKmpzF 47zYnL5RVRzNtdo3IVmJaRXOciU0/xSputLSqGw1BAegZapH3NZcEA7fFpS4SSj/ cl9JrVnw4abttPaxZNs9mhEcv/6elKg88GA5lQTLa/ttKYrvfvQlrltRLHR4xivH lVPQ88zmqoOpe7rfEU4ewnPZI1s8YMXywYlaKZhSNun6Oyq9putdOLfQuNTN </ds:X509Certificate> </ds:X509Data> </ds:KeyInfo> </md:KeyDescriptor> <md:KeyDescriptor use="encryption"> <ds:KeyInfo> <ds:X509Data> <ds:X509Certificate>MIIDKTCCAhGgAwIBAgIJAIypbYzOQmTIMA0GCSqGSIb3DQEBCwUAMCsxKTAnBgNV BAMMIHNzby5pbnQuY2xvdWQucnVja3Vzd2lyZWxlc3MuY29tMB4XDTE5MDExODE5 MDAxMFoXDTI0MDExNzE5MDAxMFowKzEpMCcGA1UEAwwgc3NvLmludC5jbG91ZC5y dWNrdXN3aXJlbGVzcy5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIB AQDRGfxbJ2dT8Z1cPugQQ1LYkszanluv97fsNUYIOWPEnlZ+jGJIi5A2aIeewamm Wa/10BmIBkW5vrV/iWKec4u+EaFfdtfpf8B/weFHZPel+BxKPXDmp/KgfSaYtw6L fdOGI8DLp6xpM8INrI2IZyvlIi75ewdAKCKoH17kmojzkBObSwiFTdv6HH3tGyMK BSa6PyGBOfjt04YhEBxY+fHjE4Ax1JdybYLdX5ozjWrp0jPPHgg52q6Yl0ti4XLa pGssaccIbNAx50c5BwmeOZfUZkmhcPo6nzRyVHsDY9inl+CkV5MaYSx9ghqdMfXx 8cM5Hh2ko5RHEBKZtlk8OapXAgMBAAGjUDBOMB0GA1UdDgQWBBTMuBJHn0RBemv8 XKQsJiDKvPP2mzAfBgNVHSMEGDAWgBTMuBJHn0RBemv8XKQsJiDKvPP2mzAMBgNV HRMEBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQCDPf9I4DL7sSO/MI0Pt8cx4Dp0 XiUzRTxcEn+IaAQ4TY5VPLWRSdSkVVf8/LF7pWUQIn14XU8oAkG/SpAg1vTjTTt3 v7BztNTBZBeKDA/uEWx1PHYT46F/Wnq8MzSlABQiIk1ekmCni03h6wUnOFtKmpzF 47zYnL5RVRzNtdo3IVmJaRXOciU0/xSputLSqGw1BAegZapH3NZcEA7fFpS4SSj/ cl9JrVnw4abttPaxZNs9mhEcv/6elKg88GA5lQTLa/ttKYrvfvQlrltRLHR4xivH lVPQ88zmqoOpe7rfEU4ewnPZI1s8YMXywYlaKZhSNun6Oyq9putdOLfQuNTN </ds:X509Certificate> </ds:X509Data> </ds:KeyInfo> </md:KeyDescriptor> <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://sso.rkusbu.com/idp/saml2/SSO/POST"/> <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://sso.rkusbu.com/idp/saml2/SSO/Redirect"/> <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:SOAP" Location="https://sso.rkusbu.com/idp/saml2/SSO/SOAP"/> <md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://sso.rkusbu.com/idp/saml2/SLO/Redirect"/> <md:NameIDFormat>urn:oasis:names:tc:SAML:2.0:nameid-format:persistent</md:NameIDFormat> <md:NameIDFormat>urn:oasis:names:tc:SAML:2.0:nameid-format:transient</md:NameIDFormat> <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat> </md:IDPSSODescriptor> </md:EntityDescriptor>'

const AuthServerFormItem = (props: AuthServerFormItemProps) => {
  const { $t } = useIntl()
  const { tenantAuthenticationData } = props
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [isEditMode, setEditMode] = useState(false)
  const navigate = useNavigate()
  const linkToAdministrators = useTenantLink('/administration/administrators')

  const [deleteTenantAuthentications]
  = useDeleteTenantAuthenticationsMutation()


  const onSetUpValue = () => {
    setEditMode(false)
    setDrawerVisible(true)
  }

  const ssoData = tenantAuthenticationData?.filter(n =>
    n.authenticationType === TenantAuthenticationType.saml)
  const hasSsoConfigured = ssoData && ssoData?.length > 0
  const authenticationId = hasSsoConfigured ? ssoData[0].id : ''

  return ( <>
    <Row gutter={24} style={{ marginBottom: '25px' }}>
      <Col span={10}>
        <Form.Item
          colon={false}
          label={<>
            {$t({ defaultMessage: 'Enable SSO with 3rd Party provider' })}
            <Tooltip.Question
              title={$t({ defaultMessage: 'At this time, only Azure AD is officially supported' })}
              placement='right'
            />
          </>}
          children={hasSsoConfigured &&
            <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
              <ButtonWrapper
                style={{ marginLeft: '10px' }}
                size={20}
              >
                <Button type='link'
                  key='editsso'
                  onClick={() => {
                    setEditMode(true)
                    setDrawerVisible(true)
                  }}>
                  {$t({ defaultMessage: 'Edit' })}
                </Button>
                <Button type='link'
                  key='deletesso'
                  onClick={() => {
                    showActionModal({
                      title: $t({ defaultMessage: 'Delete Azure AD SSO Service' }),
                      type: 'confirm',
                      customContent: {
                        action: 'DELETE',
                        entityName: $t({ defaultMessage: 'sso' }),
                        // entityValue: name,
                        confirmationText: $t({ defaultMessage: 'Delete' })
                      },
                      onOk: () =>
                        deleteTenantAuthentications({ params: { authenticationId: authenticationId } })
                          .then() })

                  }}>
                  {$t({ defaultMessage: 'Delete' })}
                </Button>
              </ButtonWrapper>
            </Space>
          }
        />

        {hasSsoConfigured && <Col span={6}>
          <Card type='solid-bg'>
            <Form.Item
              colon={false}
              label={$t({ defaultMessage: 'IdP Metadata' })}
            />
            <div style={{ marginTop: '-10px' }}><Button type='link'
              key='viewxml'
              onClick={() => {
                setModalVisible(true)
              }}>
              {$t({ defaultMessage: 'View XML code' })}
            </Button></div>
            <div style={{ marginTop: '5px' }}><Button type='link'
              key='manageusers'
              onClick={() => {
                navigate(linkToAdministrators)
              }}>
              {$t({ defaultMessage: 'Manage SSO Users' })}
            </Button></div>
          </Card>
        </Col>
        }

        {!hasSsoConfigured &&
        <Button onClick={onSetUpValue}>{$t({ defaultMessage: 'Set Up' })}</Button>}
      </Col>
    </Row>

    {drawerVisible &&
    <SetupAzureDrawer
      title={isEditMode
        ? $t({ defaultMessage: 'Edit SSO with 3rd Party Provider' })
        : $t({ defaultMessage: 'Set Up SSO with 3rd Party Provider' })
      }
      visible={drawerVisible}
      isEditMode={isEditMode}
      editData={hasSsoConfigured ? ssoData[0] : {} as TenantAuthentications}
      setVisible={setDrawerVisible}
      maxSize={CsvSize['5MB']}
      maxEntries={512}
      acceptType={['xml']}
    />}
    {modalVisible && <ViewXmlModal
      visible={modalVisible}
      viewText={sampleXml}
      setVisible={setModalVisible}
    />}

  </>
  )
}

export { AuthServerFormItem }