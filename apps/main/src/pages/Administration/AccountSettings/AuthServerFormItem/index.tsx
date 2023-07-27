import { useEffect, useState } from 'react'

import { Form, Col, Row, Space } from 'antd'
import { useIntl }               from 'react-intl'


import { Button, Card, showActionModal, Tooltip } from '@acx-ui/components'
import { CsvSize }                                from '@acx-ui/rc/components'
import {
  useGetAdminListQuery,
  useDeleteTenantAuthenticationsMutation
} from '@acx-ui/rc/services'
import {  SamlFileType, TenantAuthentications, TenantAuthenticationType } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink, useParams }                          from '@acx-ui/react-router-dom'
import { loadImageWithJWT }                                               from '@acx-ui/utils'

import { reloadAuthTable } from '../AppTokenFormItem/'

import { SetupAzureDrawer } from './SetupAzureDrawer'
import { ButtonWrapper }    from './styledComponents'
import { ViewXmlModal }     from './ViewXmlModal'

interface AuthServerFormItemProps {
  className?: string;
  tenantAuthenticationData?: TenantAuthentications[];
}

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
    } else {
      setSsoConfigured(false)
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

        {hasSsoConfigured && <Col style={{ width: '190px' }}>
          <Card type='solid-bg' >
            <Form.Item
              colon={false}
              label={$t({ defaultMessage: 'IdP Metadata' })}
            />
            <div style={{ marginTop: '-10px' }}><Button type='link'
              key='viewxml'
              onClick={async () => {
                const url = authenticationData?.samlFileType === SamlFileType.direct_url
                  ? authenticationData?.samlFileURL
                  : await loadImageWithJWT(authenticationData?.samlFileURL as string)
                await fetch(url)
                  .then((response) => response.text())
                  .then((text) => {
                    setXmlData(text)
                  })
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