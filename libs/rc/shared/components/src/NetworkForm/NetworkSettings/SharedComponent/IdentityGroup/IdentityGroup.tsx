import React, { useState, useEffect } from 'react'

import { Form, Switch, Button, Space, Input } from 'antd'
import { useIntl }                            from 'react-intl'

import { Persona } from '@acx-ui/rc/utils'

import { SelectPersonaDrawer } from '../../../../users/IdentitySelector/SelectPersonaDrawer'
import { PersonaGroupDrawer }  from '../../../../users/PersonaGroupDrawer'
import { PersonaGroupSelect }  from '../../../../users/PersonaGroupSelect'
import * as UI                 from '../../../NetworkMoreSettings/styledComponents'

export function IdentityGroup () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const selectedIdentityId = Form.useWatch('identityId', form)
  const selectedIdentityGroupId = Form.useWatch('identityGroupId', form)
  const [display, setDisplay] = useState({ display: 'none' })
  const [personaGroupVisible, setPersonaGroupVisible] = useState<boolean>(false)
  const [identitySelectorDrawerVisible, setIdentitySelectorDrawerVisible] = useState(false)
  const [selectedIdentity, setSelectedIdentity] = useState<Persona>()
  const handleClose = (identity?: Persona) => {
    setIdentitySelectorDrawerVisible(false)
    if (identity) {
      setSelectedIdentity(identity)
      form.setFieldsValue({
        identityId: identity.id
      })
    }
  }
  useEffect(() => {
    setSelectedIdentity(undefined)
    if (selectedIdentityId) {
      form.setFieldValue('identityId', '')
    }
  }, [selectedIdentityGroupId])

  const onAssociationChange = (value: boolean) => {
    if(value) {
      setDisplay({ display: 'block' })
    } else {
      setDisplay({ display: 'none' })
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
            <PersonaGroupSelect
              data-testid={'identity-group-select'}
              style={{ width: '400px' }}
              placeholder={'Select...'}
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
      {selectedIdentityGroupId && (
        <>
          <UI.FieldLabel width={'400px'}>
            {$t({
              defaultMessage:
                'Use single identity association to all onboarded devices'
            })}
            <Form.Item
              data-testid={'identity-associate-switch'}
              valuePropName='checked'
              initialValue={false}
              children={<Switch onChange={onAssociationChange} />}
            />
          </UI.FieldLabel>
          <div style={{ marginBottom: '20px', ...display }}>
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
                data-testid={'add-identity-button'}
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
          identityGroupId={selectedIdentityGroupId}
          disableAddDevices={true}
        />
      )}
    </>
  )}
