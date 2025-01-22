import React, { useEffect, useState } from 'react'

import { Form, Input, Typography } from 'antd'
import { useIntl }                 from 'react-intl'

import { Loader }                     from '@acx-ui/components'
import { useLazyGetPersonaByIdQuery } from '@acx-ui/rc/services'
import { Persona }                    from '@acx-ui/rc/utils'
import { noDataDisplay }              from '@acx-ui/utils'


import { SelectPersonaDrawer } from './SelectPersonaDrawer'

export const IdentitySelector = ({
  identityGroupId,
  readonly = false,
  isEdit = false,
  disableAddDevices
}: {
  identityGroupId?: string;
  readonly?: boolean;
  isEdit?: boolean;
  disableAddDevices?: boolean;
}) => {
  const formInstance = Form.useFormInstance()
  const selectedIdentityId = Form.useWatch('identityId', formInstance)
  const { $t } = useIntl()
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selectedIdentity, setSelectedIdentity] = useState<Persona>()
  const [getPersonaById, result] = useLazyGetPersonaByIdQuery()
  const { data, isLoading, isFetching, error } = result
  const renderIdentityMessage = (): string => {
    if (!selectedIdentityId) return noDataDisplay
    if (selectedIdentity) return selectedIdentity.name
    if (isLoading || isFetching || (data === undefined && error === undefined) ) {
      return $t({ defaultMessage: 'Loading identity...' })
    }
    return $t({ defaultMessage: 'Identity not found' })
  }
  const placeholder = $t({ defaultMessage: 'Select Identity' })

  useEffect(() => {
    if (selectedIdentityId && identityGroupId) {
      if (selectedIdentity?.id !== selectedIdentityId) {
        setSelectedIdentity(undefined)
      }
      getPersonaById({ params: {
        groupId: identityGroupId,
        id: selectedIdentityId
      } })
    }
  }, [selectedIdentityId, identityGroupId])

  useEffect(() => {
    if (data) {
      setSelectedIdentity(data)
      if (!isEdit) {
        // While creating, override 'username' and 'email' in the form with data from Identity.
        formInstance.setFieldsValue({
          username: data.name,
          email: data.email
        })
      }
    }
  }, [data])

  const handleOpen = () => {
    setDrawerVisible(true)
  }

  const handleClose = (identity?: Persona) => {
    setDrawerVisible(false)
    if (identity) {
      setSelectedIdentity(identity)
      formInstance.setFieldsValue({
        identityId: identity.id,
        identityName: identity.name,
        username: identity.name,
        email: identity.email
      })
    }
  }

  return <>
    <Form.Item noStyle name={'identityId'} hidden children={<Input hidden />}/>
    <Form.Item
      name='identityName'
      label={$t({ defaultMessage: 'Associated Identity' })}
      rules={[{
        required: !readonly,
        message: $t({ defaultMessage: 'Please select an identity' })
      }]}
    >
      {readonly
        ? <Loader states={[{ isLoading, isFetching }]} >
          <Typography>{ renderIdentityMessage() }</Typography>
        </Loader>
        : <Input
          onClick={handleOpen}
          placeholder={placeholder}
        />}
    </Form.Item>
    {
      drawerVisible && <SelectPersonaDrawer
        onSubmit={handleClose}
        onCancel={() => setDrawerVisible(false)}
        identityId={selectedIdentityId}
        identityGroupId={identityGroupId}
        disableAddDevices={disableAddDevices}
      />
    }
  </>
}
