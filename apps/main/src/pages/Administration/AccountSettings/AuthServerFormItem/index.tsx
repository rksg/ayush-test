import { useEffect, useState } from 'react'

import { Form, Col, Row, Space } from 'antd'
import { useIntl }               from 'react-intl'


import { Button, Card, showActionModal, Tooltip }                 from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed, TierFeatures } from '@acx-ui/feature-toggle'
import { CsvSize }                                                from '@acx-ui/rc/components'
import {
  useGetAdminListQuery,
  useDeleteTenantAuthenticationsMutation,
  useGetServerCertificatesQuery
} from '@acx-ui/rc/services'
import { AdministrationUrlsInfo, downloadFile, SamlFileType, TenantAuthentications, TenantAuthenticationType } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink, useParams }                                                               from '@acx-ui/react-router-dom'
import { getUserProfile, hasAllowedOperations }                                                                from '@acx-ui/user'
import { getOpsApi, getTenantId, loadImageWithJWT }                                                            from '@acx-ui/utils'

import { reloadAuthTable } from '../AppTokenFormItem/'

import { SetupAzureDrawer } from './SetupAzureDrawer'
import * as UI              from './styledComponents'
import { ButtonWrapper }    from './styledComponents'
import { ViewXmlModal }     from './ViewXmlModal'


interface AuthServerFormItemProps {
  className?: string;
  tenantAuthenticationData?: TenantAuthentications[];
}

const AuthServerFormItem = (props: AuthServerFormItemProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const { rbacOpsApiEnabled } = getUserProfile()
  const { tenantAuthenticationData } = props
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [isEditMode, setEditMode] = useState(false)
  const [xmlData, setXmlData] = useState('')
  const [hasSsoConfigured, setSsoConfigured] = useState(false)
  const [authenticationData, setAuthenticationData] = useState<TenantAuthentications>()
  const navigate = useNavigate()
  const isGroupBasedLoginEnabled = useIsSplitOn(Features.GROUP_BASED_LOGIN_TOGGLE)
  const isGoogleWorkspaceEnabled = useIsSplitOn(Features.GOOGLE_WORKSPACE_SSO_TOGGLE)
  const loginSsoSignatureEnabled = useIsSplitOn(Features.LOGIN_SSO_SIGNATURE_TOGGLE)
  const isRbacEarlyAccessEnable = useIsTierAllowed(TierFeatures.RBAC_IMPLICIT_P1)
  const isRbacEnabled = useIsSplitOn(Features.ABAC_POLICIES_TOGGLE) && isRbacEarlyAccessEnable
  const isSsoEncryptionEnabled = useIsSplitOn(Features.SSO_SAML_ENCRYPTION)

  const linkToAdministrators =
  useTenantLink(isRbacEnabled ? '/administration/userPrivileges/ssoGroups'
    : '/administration/administrators/adminGroups')

  const { data: adminList } = useGetAdminListQuery({ params })

  const [deleteTenantAuthentications]
  = useDeleteTenantAuthenticationsMutation()

  const { data: serverCertificates } = useGetServerCertificatesQuery(
    { payload: { pageSize: 20, page: 1 } },
    { skip: !authenticationData?.samlEncryptionCertificateId })
  const certificate = serverCertificates?.data.find(cert =>
    cert.id === authenticationData?.samlEncryptionCertificateId)

  const onSetUpValue = () => {
    setEditMode(false)
    setDrawerVisible(true)
  }

  const ssoData = tenantAuthenticationData?.filter(n =>
    n.authenticationType === TenantAuthenticationType.saml ||
    n.authenticationType === TenantAuthenticationType.google_workspace)
  useEffect(() => {
    if (ssoData && ssoData.length > 0) {
      setSsoConfigured(true)
      setAuthenticationData(ssoData[0])
    } else {
      setSsoConfigured(false)
    }
  }, [ssoData])

  const createPermission = rbacOpsApiEnabled ?
    hasAllowedOperations([
      getOpsApi(AdministrationUrlsInfo.addTenantAuthentications)
    ]) : true

  const deletePermission = rbacOpsApiEnabled ?
    hasAllowedOperations([
      getOpsApi(AdministrationUrlsInfo.deleteTenantAuthentications)
    ]) : true

  const editPermission = rbacOpsApiEnabled ?
    hasAllowedOperations([
      getOpsApi(AdministrationUrlsInfo.updateTenantAuthentications)
    ]) : true

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
                  disabled={!editPermission}
                  onClick={() => {
                    setEditMode(true)
                    setDrawerVisible(true)
                  }}>
                  {$t({ defaultMessage: 'Edit' })}
                </Button>
                <Button type='link'
                  key='deletesso'
                  disabled={!deletePermission}
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
                        onOk: () => {
                          deleteTenantAuthentications({
                            params: { authenticationId: authenticationData?.id } })
                            .then()
                          reloadAuthTable(2)
                        }
                      })
                    }
                  }}>
                  {$t({ defaultMessage: 'Delete' })}
                </Button>
              </ButtonWrapper>
            </Space>
          }
        />

        {hasSsoConfigured && <Col style={{ width: '400px', paddingLeft: 0 }}>
          <Card type='solid-bg' >
            <UI.FormItemWrapper direction='vertical' size={5}>
              {isGoogleWorkspaceEnabled && <div>
                <Form.Item
                  colon={false}
                  label={$t({ defaultMessage: 'Type' })} />
                <h3>
                  {authenticationData?.authenticationType === TenantAuthenticationType.saml
                    ? $t({ defaultMessage: 'SAML' })
                    : $t({ defaultMessage: 'Google Workspace' })
                  }</h3>
              </div>}
              {isGroupBasedLoginEnabled && <div>
                <Form.Item
                  colon={false}
                  label={$t({ defaultMessage: 'Allowed Domains' })} />
                <h3>{authenticationData?.domains?.toString()}</h3>
              </div>}
              <div>
                <Form.Item
                  colon={false}
                  label={$t({ defaultMessage: 'IdP Metadata' })}
                />
                <Button type='link'
                  key='viewxml'
                  onClick={async () => {
                    const isDirectUrl = authenticationData?.samlFileType === SamlFileType.direct_url
                    if (isDirectUrl) {
                      setXmlData(authenticationData?.samlFileURL || '')
                    } else {
                      const rbacUrl = `/tenants/${authenticationData?.samlFileURL}/urls`
                      const url = await loadImageWithJWT(authenticationData?.samlFileURL as string,
                        isRbacEnabled ? rbacUrl : undefined
                      )
                      await fetch(url)
                        .then((response) => response.text())
                        .then((text) => {
                          setXmlData(text)
                        })
                    }
                    setModalVisible(true)
                  }}>
                  {$t({ defaultMessage: 'View XML code' })}
                </Button>
              </div>
              {loginSsoSignatureEnabled && <div>
                <Form.Item
                  colon={false}
                  label={$t({ defaultMessage: 'Require SAML requests to be signed' })} />
                <h3>
                  {authenticationData?.samlSignatureEnabled
                    ? $t({ defaultMessage: 'YES' })
                    : $t({ defaultMessage: 'NO' })}
                </h3>
              </div>}
              {(isSsoEncryptionEnabled && authenticationData?.samlEncryptionCertificateId) &&
            <div>
              <Form.Item
                colon={false}
                label={$t({ defaultMessage: 'SSO SAML Decryption Certificate' })} />
              <h3>{certificate ? certificate.name : ''}</h3>
            </div>}
              <div style={{ marginTop: '5px' }}><Button type='link'
                key='manageusers'
                onClick={() => {
                  navigate(linkToAdministrators)
                }}>
                {$t({ defaultMessage: 'Manage SSO Users' })}
              </Button></div>
              {isSsoEncryptionEnabled && <div style={{ marginTop: '5px' }}><Button type='link'
                key='manageusers'
                onClick={async () => {
                  const tenantId = getTenantId()
                  const ssoUrl = `https://ruckus.cloud/saml2/service-provider-metadata/${tenantId}`
                  await fetch(ssoUrl).then(res => downloadFile(res, 'saml_metadata'))
                }}>
                {$t({ defaultMessage: 'Download SAML Metadata' })}
              </Button></div>}
            </UI.FormItemWrapper>
          </Card>
        </Col>
        }

        {!hasSsoConfigured &&
        <Button
          disabled={!createPermission}
          onClick={onSetUpValue}>{$t({ defaultMessage: 'Set Up' })}</Button>}
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
      isGroupBasedLoginEnabled={isGroupBasedLoginEnabled}
      isGoogleWorkspaceEnabled={isGoogleWorkspaceEnabled}
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