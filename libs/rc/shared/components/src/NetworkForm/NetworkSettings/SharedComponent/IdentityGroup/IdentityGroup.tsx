import React, { useContext, useEffect, useState } from 'react'

import { Form, Select, Switch, Button, Space, Input } from 'antd'
import { useIntl }                                    from 'react-intl'

import {
  useLazySearchPersonaGroupListQuery
} from '@acx-ui/rc/services'
import { Persona } from '@acx-ui/rc/utils'

import { SelectPersonaDrawer } from '../../../../users/IdentitySelector/SelectPersonaDrawer'
import { PersonaGroupDrawer }  from '../../../../users/PersonaGroupDrawer'
import NetworkFormContext      from '../../../NetworkFormContext'
import * as UI                 from '../../../NetworkMoreSettings/styledComponents'

export function IdentityGroup () {
  const { editMode } = useContext(NetworkFormContext)

  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const selectedIdentityId = Form.useWatch('identityId', form)
  const [identityGroupId, setIdentityGroupId] = useState<string>('')
  const [display, setDisplay] = useState('none')
  const [personaGroupVisible, setPersonaGroupVisible] = useState<boolean>(false)
  const [identitySelectorDrawerVisible, setIdentitySelectorDrawerVisible] = useState(false)
  const [selectedIdentity, setSelectedIdentity] = useState<Persona>()
  const [lazyPersonaGroupListTigger] = useLazySearchPersonaGroupListQuery()
  const [identityGroupOptions, setIdentityGroupOptions] = useState(
    [
      { label: 'Select...', value: '' }
    ]
  )
  const handleClose = (identity?: Persona) => {
    setIdentitySelectorDrawerVisible(false)
    if (identity) {
      setSelectedIdentity(identity)
      form.setFieldsValue({
        identityId: identity.id,
        identityName: identity.name,
        username: identity.name,
        email: identity.email
      })
    }
  }

  const setData = async () => {
    let groupOptions = []
    /*
     * TODO: When under edit mode, the 'Select...' option should be remove
     * if user had selected one identity group. It will be implemented once
     * API is done.
     */
    if (!editMode) {
      groupOptions.push({ label: 'Select...', value: '' })
    }
    const result = await lazyPersonaGroupListTigger({
      payload: {
        page: 1,
        pageSize: 10000,
        sortField: 'name',
        sortOrder: 'ASC'
      }
    }).unwrap()
    result.data.forEach((group) => {
      groupOptions.push({ label: group.name, value: group.id })
    })
    setIdentityGroupOptions(groupOptions)
  }

  useEffect(() => {
    setData()
  }, [])

  const onAssociationChange = (value: boolean) => {
    if(value) {
      setDisplay('block')
    } else {
      setDisplay('none')
    }
  }

  return (
    <>
      <Space>
        <Form.Item
          label={$t({ defaultMessage: 'Identity Group' })}
          name={['identityGroupId']}
          initialValue={''}
          children={
            <Select
              style={{ width: '400px' }}
              onChange={(value) => {
                setIdentityGroupId(value)
              }}
              options={identityGroupOptions}
            />
          }
        />

        <Space>
          <Button
            style={{ fontSize: '12px' }}
            type='link'
            onClick={() => {
              setPersonaGroupVisible(true)
            }}
          >
            {$t({ defaultMessage: 'Add' })}
          </Button>
        </Space>
      </Space>
      {identityGroupId && (
        <>
          <UI.FieldLabel width={'400px'}>
            {$t({
              defaultMessage:
                'Use single identity association to all onboarded devices'
            })}
            <Form.Item
              valuePropName='checked'
              initialValue={false}
              children={<Switch onChange={onAssociationChange} />}
            />
          </UI.FieldLabel>
          <div style={{ marginBottom: '20px', display: display }}>
            <UI.FieldLabel width={'400px'}>
              <p style={{ marginBottom: '0px' }}>
                {$t({ defaultMessage: 'Identity' })}
              </p>
            </UI.FieldLabel>
            {selectedIdentity ? (
              <UI.FieldLabel width={'400px'}>
                <p style={{ marginBottom: '0px' }}>{selectedIdentity.name}</p>
                <Form.Item
                  style={{ marginBottom: '0px' }}
                  valuePropName='checked'
                  initialValue={false}
                  children={
                    <Button
                      type='link'
                      style={{ fontSize: '12px' }}
                      onClick={() => {
                        setIdentitySelectorDrawerVisible(true)
                      }}
                    >
                      {$t({ defaultMessage: 'Change' })}
                    </Button>
                  }
                />
              </UI.FieldLabel>
            ) : (
              <Button
                type='link'
                style={{ fontSize: '12px' }}
                onClick={() => {
                  setIdentitySelectorDrawerVisible(true)
                }}
              >
                {$t({ defaultMessage: 'Add Identity' })}
              </Button>
            )}
          </div>
        </>
      )}
      <Form.Item
        noStyle
        name={'identityId'}
        hidden
        children={<Input hidden />}
      />
      <PersonaGroupDrawer
        requiredDpsk
        isEdit={false}
        visible={personaGroupVisible}
        onClose={(result) => {
          setData()
          if (result) {
            form.setFieldValue('identityGroupId', result?.id)
          }
          setPersonaGroupVisible(false)
        }}
      />

      {identitySelectorDrawerVisible && (
        <SelectPersonaDrawer
          onSubmit={handleClose}
          onCancel={() => setIdentitySelectorDrawerVisible(false)}
          identityId={selectedIdentityId}
          identityGroupId={identityGroupId}
          disableAddDevices={true}
        />
      )}
    </>
  )
}
