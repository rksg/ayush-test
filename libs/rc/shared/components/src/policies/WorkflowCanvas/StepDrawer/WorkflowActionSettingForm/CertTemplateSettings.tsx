import { Fragment, useCallback, useEffect, useState } from 'react'

import { Form }        from 'antd'
import useFormInstance from 'antd/es/form/hooks/useFormInstance'
import { useIntl }     from 'react-intl'

import { Card, Select }             from '@acx-ui/components'
import {
  useGetCertificateTemplatesQuery,
  useLazyNetworkListQuery,
  useLazySearchPersonaListQuery,
  useLazyGetPersonaGroupByIdQuery
} from '@acx-ui/rc/services'
import { ActionType } from '@acx-ui/rc/utils'

import { CommonActionSettings } from './CommonActionSettings'


export function CertTemplateSettings () {
  const { $t } = useIntl()
  const form = useFormInstance()
  const identityGroupId = Form.useWatch('identityGroupId')
  const certTemplateId = Form.useWatch('certTemplateId')
  const [ networks, setNetworks ] = useState<string[]>([])
  const [getIdentityGroupById] = useLazyGetPersonaGroupByIdQuery()
  const [fetchIdentities, identitiesResponse] = useLazySearchPersonaListQuery()


  const { data: certTemplateList } = useGetCertificateTemplatesQuery({
    payload: {
      page: 1, pageSize: 10000, sortField: 'name', sortOrder: 'ASC'
    }
  })

  const [ getNetworkList, networkListResponse ] = useLazyNetworkListQuery({
    selectFromResult: ({ data }) => {
      return data?.data.map(network => network.ssid) ?? []
    }
  })

  const loadIdentities = useCallback((identityGroupId: string | undefined) => {
    fetchIdentities({
      payload: { pageSize: '2147483647', groupId: identityGroupId }
    })
  }, [fetchIdentities])

  useEffect(() => {
    if (certTemplateId) {
      onCertTemplateChange(certTemplateId)
    }
  }, [certTemplateId, certTemplateList])


  const onCertTemplateChange = (certTemplateId: String) => {
    if (certTemplateId && certTemplateList) {
      const selectedCertTemplate =
        certTemplateList?.data.find((certTemplate) => certTemplate.id === certTemplateId)
      if (selectedCertTemplate) {
        form.setFieldValue('identityGroupId', selectedCertTemplate.identityGroupId)
        setNetworks(selectedCertTemplate.networkIds ? selectedCertTemplate.networkIds : [])
      } else {
        form.setFieldValue('identityGroupId', undefined)
        setNetworks([])
      }
    }
  }

  useEffect(() => {
    if (!identityGroupId) return
    getIdentityGroupById({ params: { groupId: identityGroupId } })
      .then(result => {
        form.setFieldValue('identityGroupName', result.data?.name)
      })
    loadIdentities(identityGroupId)
  }, [identityGroupId])


  useEffect(() => {
    if (networks && networks.length > 0) {
      getNetworkList({
        payload: {
          fields: ['name', 'ssid'],
          filters: { id: networks }
        }
      })
    }
  }, [networks])

  useEffect(() => {
    const identityIdValue = form.getFieldValue('identityId')
    if(identityIdValue && identitiesResponse.data) {
      const selectedIdentity = identitiesResponse.data?.data
        .find((identity) => identity.id === identityIdValue)
      if(!selectedIdentity) {
        form.setFieldValue('identityId', null)
      }
    }
  }, [identitiesResponse])

  return (
    <>
      <CommonActionSettings actionType={ActionType.CERT_TEMPLATE} />
      <Form.Item
        name={'certTemplateId'}
        label={$t({ defaultMessage: 'Choose Certificate Template' })}
        rules={[{ required: true }]}
      >
        <Select
          placeholder={$t({ defaultMessage: 'Select...' })}
          options={certTemplateList?.data
            .filter(certTemplate => certTemplate.id)
            .map(certTemplate => ({
              label: certTemplate.name,
              value: certTemplate.id
            }))
          }
          onChange={onCertTemplateChange}
        />
      </Form.Item>
      {form.getFieldValue('certTemplateId') ? (
        <>
          <Form.Item
            name={'identityGroupName'}
            label={$t({ defaultMessage: 'Identity Group' })}
            rules={[{ required: false }]}
          >
            <Select disabled={true}
              options={[
                {
                  label: form.getFieldValue('identityGroupName'),
                  value: identityGroupId
                }]} />
          </Form.Item>
          {identityGroupId ? (
            <>
              <Form.Item
                name={'identityId'}
                label={$t({ defaultMessage: 'Assign to Identity' })}
              >
                <Select options={[
                  {
                    label: $t({ defaultMessage: "'<'None'>'" }),
                    value: null
                  },
                  ...(identitiesResponse.data?.data ?
                    identitiesResponse.data.data.map((identity) => ({
                      label: identity.name,
                      value: identity.id
                    })) : [])
                ]}/>
              </Form.Item>
              <Form.Item
                label={$t({ defaultMessage: 'Linked Networks ({length})' },
                  { length: networks.length })}
              >

                {networks.length > 0 ?
                  (<Form.Item>
                    {networkListResponse.map((network, index) => (
                      <Fragment key={index}>
                        <div style={{
                          borderRadius: 4, backgroundColor: '#e8e8e8',
                          padding: 2, marginBottom: 2
                        }}>
                          <p>{network}</p>
                        </div>
                      </Fragment>
                    ))}
                  </Form.Item>)
                  :
                  (<span>{$t({ defaultMessage: 'No linked networks' })}</span>)
                }
              </Form.Item>
            </>
          ) : (
            <Card>
              <p>
                {/* eslint-disable-next-line max-len */}
                {$t({ defaultMessage: 'Choose a certificate template to see the linked identity group and Wi-Fi networks' })}
              </p>
            </Card>
          )} </>
      ) : (
        <Card>
          <p>
            {/* eslint-disable-next-line max-len */}
            {$t({ defaultMessage: 'Choose a certificate template to see the linked identity group and Wi-Fi networks' })}
          </p>
        </Card>

      )}
      <Form.Item name={'identityGroupId'} hidden={true} initialValue={''}>
        <input />
      </Form.Item>
    </>
  )
}