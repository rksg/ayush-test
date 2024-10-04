import { Fragment, useCallback, useEffect, useState } from 'react'

import { Checkbox, Form, Input } from 'antd'
import useFormInstance           from 'antd/es/form/hooks/useFormInstance'
import { useIntl }               from 'react-intl'

import { Card, Select }            from '@acx-ui/components'
import {
  useLazyGetDpskQuery,
  useLazyNetworkListQuery,
  useLazySearchPersonaListQuery,
  useSearchPersonaGroupListQuery
} from '@acx-ui/rc/services'
import { ActionType } from '@acx-ui/rc/utils'

import { CommonActionSettings } from './CommonActionSettings'

const notificationOptions = [
  { label: 'QR Code', field: 'qrCodeDisplay', initialValue: true }
  // { label: 'Email', field: 'emailNotification', initialValue: false },
  // { label: 'SMS', field: 'smsNotification', initialValue: false }
]

export function DpskSettings () {
  const { $t } = useIntl()
  const form = useFormInstance()
  const identityGroupId = form.getFieldValue('identityGroupId')
  const [dpskServiceName, setDpskServiceName] = useState('')
  const [networkList, setNetworkList] = useState<string[]>([])

  const { data: identityGroupList } = useSearchPersonaGroupListQuery({
    payload: {
      page: 1, pageSize: 10000, sortField: 'name', sortOrder: 'ASC'
    }
  })
  const [ fetchIdentities, identitiesResponse ] = useLazySearchPersonaListQuery()
  const [ getDpskPool, dpskPoolQueryResponse ] = useLazyGetDpskQuery()
  const [ getNetworkList, networkListResponse ] = useLazyNetworkListQuery({
    selectFromResult: ({ data }) => {
      return data?.data.map(network => network.ssid) ?? []
    }
  })

  const loadIdentities = useCallback((identityGroupId: string) => {
    fetchIdentities({
      params: { size: '2147483647', page: '0' },
      payload: { groupId: identityGroupId }
    })
  }, [fetchIdentities])

  const loadDpskNetworks = useCallback((identityGroupId: string) => {
    setDpskServiceName('')
    setNetworkList([])
    const selectedIdentityGroup = identityGroupList?.data
      .find((identityGroup) => identityGroup.id === identityGroupId)

    if (!selectedIdentityGroup?.dpskPoolId) {
      return
    }
    getDpskPool({
      params: { serviceId: selectedIdentityGroup.dpskPoolId }
    }).then(response => {
      if (response.data?.networkIds && response.data?.networkIds.length > 0) {
        getNetworkList({
          payload: {
            fields: ['name', 'ssid'],
            filters: { id: response.data.networkIds }
          }
        })
      }
    })
  }, [identityGroupList, getDpskPool, getNetworkList])

  const onIdentityGroupChange = useCallback((identityGroupId: string) => {
    form.setFieldValue('identityId', null)
    if (identityGroupId) {
      loadIdentities(identityGroupId)
      loadDpskNetworks(identityGroupId)
    }
  }, [form, loadIdentities, loadDpskNetworks])

  useEffect(() => {
    if (identityGroupId) {
      loadIdentities(identityGroupId)
    }
  }, [identityGroupId, loadIdentities])

  useEffect(() => {
    if (identityGroupId && identityGroupList) {
      loadDpskNetworks(identityGroupId)
    }
  }, [identityGroupId, identityGroupList, loadDpskNetworks])

  useEffect(() => {
    if (dpskPoolQueryResponse.data) {
      if (form.getFieldValue('dpskPoolId') !== dpskPoolQueryResponse.data.id) {
        form.setFieldValue('dpskPoolId', dpskPoolQueryResponse.data.id)
      }
      setDpskServiceName(dpskPoolQueryResponse.data.name)
    }
  }, [dpskPoolQueryResponse])

  useEffect(() => {
    if (networkListResponse.length) {
      setNetworkList(networkListResponse)
    }
  }, [networkListResponse])

  return (
    <>
      <CommonActionSettings actionType={ActionType.DPSK} />
      <Form.Item
        name={'identityGroupId'}
        label={$t({ defaultMessage: 'Choose Identity Group' })}
        rules={[{ required: true }]}
      >
        <Select
          placeholder={$t({ defaultMessage: 'Select...' })}
          options={identityGroupList?.data
            .filter(identityGroup => identityGroup.dpskPoolId)
            .map(identityGroup => ({
              label: identityGroup.name,
              value: identityGroup.id
            }))
          }
          onChange={onIdentityGroupChange}
        />
      </Form.Item>
      {identityGroupId ? (
        <>
          <Form.Item hidden={true} name={'dpskPoolId'}>
            <Input/>
          </Form.Item>
          <Form.Item
            name={'identityId'}
            label={$t({ defaultMessage: 'Choose Identity' })}
          >
            <Select options={[
              {
                label: $t({ defaultMessage: "'<'None'>'" }),
                value: null
              },
              ...(identitiesResponse.data?.data ? identitiesResponse.data.data.map((identity) => ({
                label: identity.name,
                value: identity.id
              })) : [])
            ]}/>
          </Form.Item>
          <div style={{ borderRadius: 4, backgroundColor: '#e8e8e8', padding: 8, marginBottom: 8 }}>
            <Form.Item
              label={$t({ defaultMessage: 'DPSK Service' })}
            >
              <b>{dpskServiceName}</b>
            </Form.Item>
            <Form.Item
              label={$t({ defaultMessage: 'Supported Networks' })}
            >
              {networkList.map((network, index) => (
                <Fragment key={index}>
                  <b>{network}</b><br/>
                </Fragment>
              ))}
            </Form.Item>
          </div>
          <Form.Item
            hidden={true}
            label={$t({ defaultMessage: 'Share Passphrase via…' })}
          >
            {notificationOptions.map(option => (
              <Form.Item
                name={option.field}
                initialValue={option.initialValue}
                key={option.field}
                valuePropName='checked'
              >
                <Checkbox>{option.label}</Checkbox>
              </Form.Item>
            ))}
          </Form.Item>
        </>
      ) : (
        <Card>
          <p>
            {/* eslint-disable-next-line max-len */}
            {$t({ defaultMessage: 'Choose an identity group to see the details of the DPSK service that is linked to it' })}
          </p>
        </Card>
      )}
    </>
  )
}
