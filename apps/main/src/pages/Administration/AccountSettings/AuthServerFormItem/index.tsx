import { useState } from 'react'

import { Form, Col, Row, Space } from 'antd'
import { useIntl }               from 'react-intl'


import { Button, Card, showActionModal, Tooltip }           from '@acx-ui/components'
import { CsvSize }                                          from '@acx-ui/rc/components'
import {  TenantAuthentications, TenantAuthenticationType } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                       from '@acx-ui/react-router-dom'

import { SetupAzureDrawer } from './SetupAzureDrawer'
import { ButtonWrapper }    from './styledComponents'
import { ViewXmlModal }     from './ViewXmlModal'

interface AuthServerFormItemProps {
  className?: string;
  tenantAuthenticationData?: TenantAuthentications[];
}

const AuthServerFormItem = (props: AuthServerFormItemProps) => {
  const { $t } = useIntl()
  const { tenantAuthenticationData } = props
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [isEditMode, setEditMode] = useState(false)
  const navigate = useNavigate()
  const linkToAdministrators = useTenantLink('/administration/administrators')

  const onSetUpValue = () => {
    setEditMode(false)
    setDrawerVisible(true)
  }

  const ssoData = tenantAuthenticationData?.filter(n =>
    n.authenticationType === TenantAuthenticationType.saml)
  const hasSsoConfigured = ssoData && ssoData?.length > 0

  return ( <>
    <Row gutter={24}>
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
                      onOk: () => {}
                      // deleteMspEc({ params: { mspEcTenantId: id } })
                      //   .then(clearSelection)
                    })

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
      setVisible={setDrawerVisible}
      type='DPSK'
      maxSize={CsvSize['5MB']}
      maxEntries={512}
      acceptType={['xml']}
      templateLink='assets/templates/mac_registration_import_template.csv'
      // importRequest={async (formData) => {
      //   // try {
      //   //   await uploadCsv({ params: { policyId }, payload: formData }).unwrap()
      //   //   setUploadCsvDrawerVisible(false)
      //   //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
      //   // } catch (error) {
      //   //   console.log(error) // eslint-disable-line no-console
      //   // }
      // }}
    />}
    {modalVisible && <ViewXmlModal
      visible={modalVisible}
      setVisible={setModalVisible}
    />}

  </>
  )
}

export { AuthServerFormItem }