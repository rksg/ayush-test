import { useEffect, useState } from 'react'

import { Form, Col, Row, Space } from 'antd'
import { useIntl }               from 'react-intl'


import { Button, Card, showActionModal, Tooltip } from '@acx-ui/components'
import { CsvSize }                                from '@acx-ui/rc/components'
import {
  useGetAdminListQuery,
  useDeleteTenantAuthenticationsMutation
} from '@acx-ui/rc/services'
import {  TenantAuthentications, TenantAuthenticationType } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink, useParams }            from '@acx-ui/react-router-dom'
// import { loadImageWithJWT }                                 from '@acx-ui/utils'

import { SetupAzureDrawer } from './SetupAzureDrawer'
import { ButtonWrapper }    from './styledComponents'
import { ViewXmlModal }     from './ViewXmlModal'

interface AuthServerFormItemProps {
  className?: string;
  tenantAuthenticationData?: TenantAuthentications[];
}

/* eslint-disable max-len */
const sampleXml= '<?xml version=\'1.0\' encoding=\'UTF-8\'?> <md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" validUntil="2026-11-11T08:54:12.552223" entityID="https://sso.rkusbu.com/idp/saml2/metadata"> <md:IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol"> <md:KeyDescriptor use="signing"> <ds:KeyInfo> <ds:X509Data> <ds:X509Certificate>MIIDKTCCAhGgAwIBAgIJAIypbYzOQmTIMA0GCSqGSIb3DQEBCwUAMCsxKTAnBgNV BAMMIHNzby5pbnQuY2xvdWQucnVja3Vzd2lyZWxlc3MuY29tMB4XDTE5MDExODE5 MDAxMFoXDTI0MDExNzE5MDAxMFowKzEpMCcGA1UEAwwgc3NvLmludC5jbG91ZC5y dWNrdXN3aXJlbGVzcy5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIB AQDRGfxbJ2dT8Z1cPugQQ1LYkszanluv97fsNUYIOWPEnlZ+jGJIi5A2aIeewamm Wa/10BmIBkW5vrV/iWKec4u+EaFfdtfpf8B/weFHZPel+BxKPXDmp/KgfSaYtw6L fdOGI8DLp6xpM8INrI2IZyvlIi75ewdAKCKoH17kmojzkBObSwiFTdv6HH3tGyMK BSa6PyGBOfjt04YhEBxY+fHjE4Ax1JdybYLdX5ozjWrp0jPPHgg52q6Yl0ti4XLa pGssaccIbNAx50c5BwmeOZfUZkmhcPo6nzRyVHsDY9inl+CkV5MaYSx9ghqdMfXx 8cM5Hh2ko5RHEBKZtlk8OapXAgMBAAGjUDBOMB0GA1UdDgQWBBTMuBJHn0RBemv8 XKQsJiDKvPP2mzAfBgNVHSMEGDAWgBTMuBJHn0RBemv8XKQsJiDKvPP2mzAMBgNV HRMEBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQCDPf9I4DL7sSO/MI0Pt8cx4Dp0 XiUzRTxcEn+IaAQ4TY5VPLWRSdSkVVf8/LF7pWUQIn14XU8oAkG/SpAg1vTjTTt3 v7BztNTBZBeKDA/uEWx1PHYT46F/Wnq8MzSlABQiIk1ekmCni03h6wUnOFtKmpzF 47zYnL5RVRzNtdo3IVmJaRXOciU0/xSputLSqGw1BAegZapH3NZcEA7fFpS4SSj/ cl9JrVnw4abttPaxZNs9mhEcv/6elKg88GA5lQTLa/ttKYrvfvQlrltRLHR4xivH lVPQ88zmqoOpe7rfEU4ewnPZI1s8YMXywYlaKZhSNun6Oyq9putdOLfQuNTN </ds:X509Certificate> </ds:X509Data> </ds:KeyInfo> </md:KeyDescriptor> <md:KeyDescriptor use="encryption"> <ds:KeyInfo> <ds:X509Data> <ds:X509Certificate>MIIDKTCCAhGgAwIBAgIJAIypbYzOQmTIMA0GCSqGSIb3DQEBCwUAMCsxKTAnBgNV BAMMIHNzby5pbnQuY2xvdWQucnVja3Vzd2lyZWxlc3MuY29tMB4XDTE5MDExODE5 MDAxMFoXDTI0MDExNzE5MDAxMFowKzEpMCcGA1UEAwwgc3NvLmludC5jbG91ZC5y dWNrdXN3aXJlbGVzcy5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIB AQDRGfxbJ2dT8Z1cPugQQ1LYkszanluv97fsNUYIOWPEnlZ+jGJIi5A2aIeewamm Wa/10BmIBkW5vrV/iWKec4u+EaFfdtfpf8B/weFHZPel+BxKPXDmp/KgfSaYtw6L fdOGI8DLp6xpM8INrI2IZyvlIi75ewdAKCKoH17kmojzkBObSwiFTdv6HH3tGyMK BSa6PyGBOfjt04YhEBxY+fHjE4Ax1JdybYLdX5ozjWrp0jPPHgg52q6Yl0ti4XLa pGssaccIbNAx50c5BwmeOZfUZkmhcPo6nzRyVHsDY9inl+CkV5MaYSx9ghqdMfXx 8cM5Hh2ko5RHEBKZtlk8OapXAgMBAAGjUDBOMB0GA1UdDgQWBBTMuBJHn0RBemv8 XKQsJiDKvPP2mzAfBgNVHSMEGDAWgBTMuBJHn0RBemv8XKQsJiDKvPP2mzAMBgNV HRMEBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQCDPf9I4DL7sSO/MI0Pt8cx4Dp0 XiUzRTxcEn+IaAQ4TY5VPLWRSdSkVVf8/LF7pWUQIn14XU8oAkG/SpAg1vTjTTt3 v7BztNTBZBeKDA/uEWx1PHYT46F/Wnq8MzSlABQiIk1ekmCni03h6wUnOFtKmpzF 47zYnL5RVRzNtdo3IVmJaRXOciU0/xSputLSqGw1BAegZapH3NZcEA7fFpS4SSj/ cl9JrVnw4abttPaxZNs9mhEcv/6elKg88GA5lQTLa/ttKYrvfvQlrltRLHR4xivH lVPQ88zmqoOpe7rfEU4ewnPZI1s8YMXywYlaKZhSNun6Oyq9putdOLfQuNTN </ds:X509Certificate> </ds:X509Data> </ds:KeyInfo> </md:KeyDescriptor> <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://sso.rkusbu.com/idp/saml2/SSO/POST"/> <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://sso.rkusbu.com/idp/saml2/SSO/Redirect"/> <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:SOAP" Location="https://sso.rkusbu.com/idp/saml2/SSO/SOAP"/> <md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://sso.rkusbu.com/idp/saml2/SLO/Redirect"/> <md:NameIDFormat>urn:oasis:names:tc:SAML:2.0:nameid-format:persistent</md:NameIDFormat> <md:NameIDFormat>urn:oasis:names:tc:SAML:2.0:nameid-format:transient</md:NameIDFormat> <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat> </md:IDPSSODescriptor> </md:EntityDescriptor>'

const AuthServerFormItem = (props: AuthServerFormItemProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const { tenantAuthenticationData } = props
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [isEditMode, setEditMode] = useState(false)
  const [xmlData, setXmlData] = useState('')
  const [hasSsoConfigured, setSsoConfigured] = useState(false)
  const [authenticationData, setAuthenticationData] = useState<TenantAuthentications>()
  const navigate = useNavigate()
  const linkToAdministrators = useTenantLink('/administration/administrators')

  const { data: adminList } = useGetAdminListQuery({ params })

  const [deleteTenantAuthentications]
  = useDeleteTenantAuthenticationsMutation()


  const onSetUpValue = () => {
    setEditMode(false)
    setDrawerVisible(true)
  }

  const ssoData = tenantAuthenticationData?.filter(n =>
    n.authenticationType === TenantAuthenticationType.saml)
  useEffect(() => {
    if (ssoData && ssoData.length > 0) {
      setSsoConfigured(true)
      setAuthenticationData(ssoData[0])
    }
  }, [ssoData])

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
                    const adminWithSso = adminList?.filter(n =>
                      n.authenticationId !== undefined)
                    if (adminWithSso?.length && adminWithSso.length > 0) {
                      // eslint-disable-next-line max-len
                      const msg = $t({ defaultMessage: 'You have {br} {numberOfAdmin} {admins} {br} set to authenticate through this 3rd party SSO service. Before you can delete the service, you will need to delete these admins or set them to authenticate through RUCKUS Identity Management.' }, {
                        br: <b/>,
                        numberOfAdmin: adminWithSso.length,
                        admins: adminWithSso.length > 1 ? 'administrators' : 'administrator'
                      })
                      showActionModal({
                        type: 'info',
                        title: $t({ defaultMessage: 'Action Required' }),
                        content: msg,
                        okText: $t({ defaultMessage: 'Ok, I understand' })
                      })
                    } else {
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
                          deleteTenantAuthentications({ params: { authenticationId: authenticationData?.id } })
                            .then() })
                    }
                  }}>
                  {$t({ defaultMessage: 'Delete' })}
                </Button>
              </ButtonWrapper>
            </Space>
          }
        />

        {hasSsoConfigured && <Col style={{ width: '190px' }}>
          <Card type='solid-bg' >
            <Form.Item
              colon={false}
              label={$t({ defaultMessage: 'IdP Metadata' })}
            />
            <div style={{ marginTop: '-10px' }}><Button type='link'
              key='viewxml'
              onClick={async () => {
                // const url = await loadImageWithJWT(authenticationData?.samlFileURL as string)
                // await fetch(url)
                //   .then((response) => response.text())
                //   .then((text) => {
                //     setXmlData(text)
                //   })
                setXmlData(sampleXml)
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
      setEditMode={setEditMode}
      editData={hasSsoConfigured ? authenticationData : {} as TenantAuthentications}
      setVisible={setDrawerVisible}
      maxSize={CsvSize['5MB']}
      maxEntries={512}
      acceptType={['xml']}
    />}
    {modalVisible && <ViewXmlModal
      visible={modalVisible}
      viewText={xmlData}
      setVisible={setModalVisible}
    />}
  </>
  )
}

export { AuthServerFormItem }