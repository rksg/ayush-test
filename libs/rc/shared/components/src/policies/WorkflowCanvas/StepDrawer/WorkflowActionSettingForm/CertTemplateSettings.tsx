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

  const [ identityGroupName, setIdentityGroupName ] = useState<string | undefined>(undefined)
  const [ identityGroupId, setIdentityGroupId ] = useState<string | undefined>(undefined)
  const [ certTemplateId, setCertTemplateId ] = useState<string | undefined>(undefined)
  const [ networks, setNetworks ] = useState<string[]>([])
  const [ fetchIdentities, identitiesResponse ] = useLazySearchPersonaListQuery()
  const [ getIdentityGroupById ] = useLazyGetPersonaGroupByIdQuery()

  const [ getNetworkList, networkListResponse ] = useLazyNetworkListQuery({
    selectFromResult: ({ data }) => {
      return data?.data.map(network => network.ssid) ?? []
    }
  })

  const { data: certTemplateList } = useGetCertificateTemplatesQuery({
    payload: {
      page: 1, pageSize: 10000, sortField: 'name', sortOrder: 'ASC'
    }
  })

  const loadIdentities = useCallback((identityGroupId: string) => {
    fetchIdentities({
      payload: { pageSize: '2147483647', groupId: identityGroupId }
    })
  }, [fetchIdentities])


  useEffect(() => {
    if (form.getFieldValue('certTemplateId')) {
      setCertTemplateId(form.getFieldValue('certTemplateId'))
    }
  })

  useEffect(() => {
    if (!identityGroupId) return
    form.setFieldValue('identityGroupId', identityGroupId)
    getIdentityGroupById({ params: { groupId: identityGroupId } })
      .then(result => {
        setIdentityGroupName(result.data?.name)
      })
    loadIdentities(identityGroupId)
    getNetworkList({
      payload: {
        fields: ['name', 'ssid'],
        filters: { id: networks }
      }
    })
  }, [identityGroupId])

  useEffect(() => {
    if (certTemplateId && certTemplateList) {
      const selectedCertTemplate =
        certTemplateList?.data.find((certTemplate) => certTemplate.id === certTemplateId)
      if (selectedCertTemplate) {
        setIdentityGroupId(selectedCertTemplate.identityGroupId)
        setCertTemplateId(selectedCertTemplate.id)
        setNetworks(selectedCertTemplate.networkIds ? selectedCertTemplate.networkIds : [])
      } else {
        form.setFieldValue('certTemplateId', undefined)
        form.setFieldValue('identityGroupId', undefined)
      }
    }
  }, [certTemplateId])

  const onCertTemplateChange = (certTemplateId: string) => {
    if (certTemplateId && certTemplateList) {
      const selectedCertTemplate =
        certTemplateList?.data.find((certTemplate) => certTemplate.id === certTemplateId)
      if (selectedCertTemplate) {
        setIdentityGroupId(selectedCertTemplate.identityGroupId)
        setCertTemplateId(selectedCertTemplate.id)
        setNetworks(selectedCertTemplate.networkIds ? selectedCertTemplate.networkIds : [])
      } else {
        form.setFieldValue('certTemplateId', undefined)
        form.setFieldValue('identityGroupId', undefined)
      }
    }
  }

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
      {certTemplateId ? (
        <>
          <Form.Item
            name={'identityGroupName'}
            label={$t({ defaultMessage: 'Identity Group' })}
            rules={[{ required: false }]}
          >
            <span>{identityGroupName}</span>
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
                label={$t({ defaultMessage: 'Linked Networks' }) + ' (' + networks.length + ')'}
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
      <Form.Item name={'identityGroupId'} hidden={true}>
        <input />
      </Form.Item>
    </>
  )
}
