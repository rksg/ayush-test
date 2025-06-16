import React, { useCallback, useEffect, useState } from 'react'

import { Button, Form, Space } from 'antd'
import useFormInstance         from 'antd/es/form/hooks/useFormInstance'
import { useIntl }             from 'react-intl'

import { Card, Drawer, Select }      from '@acx-ui/components'
import {
  useGetSamlIdpProfileViewDataListQuery,
  useLazyGetSamlIdpProfileWithRelationsByIdQuery,
  useLazyGetServerCertificateQuery
} from '@acx-ui/rc/services'
import { ActionType, getPolicyRoutePath, PolicyOperation, PolicyType, SamlIdpProfileFormType } from '@acx-ui/rc/utils'
import { TenantLink }                                                                          from '@acx-ui/react-router-dom'

import { AddSamlIdp } from '../../../SamlIdp/AddSamlIdp'

import { CommonActionSettings } from './CommonActionSettings'


export function SamlAuthSettings () {
  const { $t } = useIntl()
  const form = useFormInstance()

  const samlIdpProfileId = Form.useWatch('samlIdpProfileId')

  const [ addDrawerVisible, setAddDrawerVisible ] = useState<boolean>(false)
  const [samlRequestSigned, setSamlRequestSigned] = useState<boolean>(false)
  const [samlResponseEncryption, setSamlResponseEncryption] = useState<boolean>(false)
  const [signedServerCertId, setSignedServerCertId] = useState('')
  const [encryptedServerCertId, setEncryptedServerCertId] = useState('')
  const [signedServerCertName, setSignedServerCertName] = useState<string | undefined>(undefined)
  // eslint-disable-next-line max-len
  const [encryptedServerCertName, setEncryptedServerCertName] = useState<string | undefined>(undefined)

  const [getSamlIdpProfile] = useLazyGetSamlIdpProfileWithRelationsByIdQuery()
  const [getServerCertificate] = useLazyGetServerCertificateQuery()
  const { data: samlProfileLists } = useGetSamlIdpProfileViewDataListQuery({
    payload: {
      page: 1, pageSize: 10000, sortOrder: 'ASC', sortField: 'name'
    }
  })

  const onSamlIdpProfileChange = useCallback((samlIdpProfileId: string) => {
    setSignedServerCertId('')
    setEncryptedServerCertId('')
    if (samlIdpProfileId) {
      getSamlIdpProfile({
        params: { id: samlIdpProfileId }
      }).then(response => {
        if (response.data) {
          const samlIdpData = response.data as SamlIdpProfileFormType
          form.setFieldValue('samlIdpProfileId', samlIdpProfileId)
          setSamlRequestSigned(samlIdpData.signingCertificateEnabled)
          setSamlResponseEncryption(samlIdpData.encryptionCertificateEnabled)
          setSignedServerCertId(samlIdpData.signingCertificateId ?? '')
          setEncryptedServerCertId(samlIdpData.encryptionCertificateId ?? '')
        }
      })
    }
  }, [form, getSamlIdpProfile])

  useEffect(() => {
    if (samlIdpProfileId && samlProfileLists) {
      if (samlProfileLists?.data.find(item => item.id === samlIdpProfileId)) {
        getSamlIdpProfile({
          params: { id: samlIdpProfileId }
        }).then(response => {
          if (response.data) {
            const samlIdpData = response.data as SamlIdpProfileFormType
            form.setFieldValue('samlIdpProfileId', samlIdpProfileId)
            setSamlRequestSigned(samlIdpData.signingCertificateEnabled)
            setSamlResponseEncryption(samlIdpData.encryptionCertificateEnabled)
            setSignedServerCertId(samlIdpData.signingCertificateId ?? '')
            setEncryptedServerCertId(samlIdpData.encryptionCertificateId ?? '')
          }
        })
      }
    }
  }, [form, samlProfileLists, samlIdpProfileId])

  useEffect(() => {
    setSignedServerCertName(undefined)
    if (signedServerCertId) {
      getServerCertificate({
        params: { certId: signedServerCertId }
      }).then(response => {
        if (response.data) {
          setSignedServerCertName(response.data.name)
        }
      })
    }
  }, [getServerCertificate, signedServerCertId])

  useEffect(() => {
    setEncryptedServerCertName(undefined)
    if (encryptedServerCertId) {
      getServerCertificate({
        params: { certId: encryptedServerCertId }
      }).then(response => {
        if (response.data) {
          setEncryptedServerCertName(response.data.name)
        }
      })
    }
  }, [getServerCertificate, encryptedServerCertId])

  return (
    <>
      <CommonActionSettings actionType={ActionType.SAML_AUTH} />
      <Space>
        <Form.Item
          label={$t({
            defaultMessage: 'Choose SAML IdP Profile'
          })}
          name={'samlIdpProfileId'}
          rules={[{ required: true }]}
          children={
            <Select
              data-testid={'saml-idp-profile-select'}
              style={{ width: '220px' }}
              options={samlProfileLists?.data?.map((item) => ({
                label: item.name,
                value: item.id
              })) ?? []}
              onChange={onSamlIdpProfileChange}
            />
          }
        />
        <Space split='|'>
          <Button
            type='link'
            data-testid={'saml-idp-profile-add-button'}
            onClick={() => {
              setAddDrawerVisible(true)
            }}>
            {$t({ defaultMessage: 'Add Profile' })}
          </Button>
        </Space>
      </Space>
      {samlIdpProfileId ? (
        // eslint-disable-next-line max-len
        <div style={{ borderRadius: 4, backgroundColor: 'rgba(51, 51, 51, 0.1)', padding: 8, marginBottom: 8 }}>
          <Form.Item
            name={'samlIdpProfileId'}
            label={$t({ defaultMessage: 'Require SAML requests to be signed' })}>
            <p>{samlRequestSigned ?
              $t({ defaultMessage: 'Yes' }) : $t({ defaultMessage: 'No' })}</p>
          </Form.Item>
          <Form.Item
            label={$t({ defaultMessage: 'SAML response encryption' })}>
            <p>{samlResponseEncryption ?
              $t({ defaultMessage: 'Yes' }) : $t({ defaultMessage: 'No' })}</p>
          </Form.Item>
          <Form.Item
            label={$t({ defaultMessage: 'Server Certificate' })}>
            <Space direction={'vertical'}>
              { signedServerCertName &&
              <TenantLink
                to={getPolicyRoutePath({
                  type: PolicyType.SERVER_CERTIFICATES,
                  oper: PolicyOperation.LIST
                })}>
                {signedServerCertName}
              </TenantLink>
              }
              { encryptedServerCertName &&
              <TenantLink
                to={getPolicyRoutePath({
                  type: PolicyType.SERVER_CERTIFICATES,
                  oper: PolicyOperation.LIST
                })}>
                {encryptedServerCertName}
              </TenantLink>
              }
            </Space>
          </Form.Item>
        </div>
      ) : (
        <Card>
          <p>
            {$t({ defaultMessage: 'Choose a SAML profile to see its details' })}
          </p>
        </Card>
      )}
      <Drawer
        title={$t({ defaultMessage: 'Add SAML Identity Provider' })}
        visible={addDrawerVisible}
        onClose={() => setAddDrawerVisible(false)}
        destroyOnClose={true}
        width={450}
        children={
          <AddSamlIdp
            isEmbedded={true}
            onClose={() => setAddDrawerVisible(false)}
            updateInstance={(createId: string) => {
              if(createId) {
                form.setFieldValue('samlIdpProfileId', createId)
                setAddDrawerVisible(false)
              }
            }}
          />
        }
        footer={
          // Workaround for add a footer to avoid drawer be hide when click outside
          <Button
            type='primary'
            style={{ display: 'none' }}
          >
            {$t({ defaultMessage: 'OK' })}
          </Button>
        }
      />
    </>
  )
}
