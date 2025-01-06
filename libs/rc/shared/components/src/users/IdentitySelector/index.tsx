import React, { useEffect, useState } from 'react'

import { Form, Input, Typography } from 'antd'
import { useIntl }                 from 'react-intl'

import { useLazyGetPersonaByIdQuery } from '@acx-ui/rc/services'
import { Persona }                    from '@acx-ui/rc/utils'

import { SelectPersonaDrawer } from './SelectPersonaDrawer'

export const IdentitySelector = ({
  value,
  onChange,
  identityGroupId,
  readonly = false,
  defaultIdentityId
}: {
  value?: string;
  onChange?: (value: string) => void;
  identityGroupId?: string;
  readonly?: boolean;
  defaultIdentityId?: string;
}) => {
  const form = Form.useFormInstance()
  const { $t } = useIntl()
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selectedIdentity, setSelectedIdentity] = useState<Persona>()
  const [getPersonaById, result] = useLazyGetPersonaByIdQuery()
  const { data, isLoading } = result
  const renderIdentityMessage = (): string => {
    if (selectedIdentity) return selectedIdentity.name
    if (isLoading) return $t({ defaultMessage: 'Loading identity...' })
    return 'Identity not found'
  }
  const placeholder = $t({ defaultMessage: 'Select Identity' })

  useEffect(() => {
    if (value && identityGroupId && (!selectedIdentity || selectedIdentity.id !== value)) {
      getPersonaById({ params: { groupId: identityGroupId, id: value } })
    }
  }, [value, identityGroupId])

  useEffect(() => {
    if (data) {
      setSelectedIdentity(data)
      if (defaultIdentityId === data.id) {
        form.setFieldsValue({
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
      form.setFieldsValue({
        username: identity.name,
        email: identity.email
      })
      onChange?.(identity.id)
    }
  }

  return (readonly || defaultIdentityId) ? (
    <Typography>{ renderIdentityMessage() }</Typography>
  ) : (
    <>
      <Input
        onClick={handleOpen}
        value={selectedIdentity?.name || value}
        placeholder={placeholder}
      />
      {
        drawerVisible && <SelectPersonaDrawer
          onSubmit={handleClose}
          onCancel={() => setDrawerVisible(false)}
          identityId={value}
          identityGroupId={identityGroupId}
        />
      }
    </>
  )
}
