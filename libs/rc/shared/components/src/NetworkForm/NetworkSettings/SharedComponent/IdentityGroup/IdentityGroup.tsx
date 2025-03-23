import React, { useState, useEffect, useContext } from 'react'

import { Form, Switch, Button, Space, Input } from 'antd'
import { useIntl }                            from 'react-intl'


import { Modal, ModalType }       from '@acx-ui/components'
import {
  useLazySearchPersonaGroupListQuery,
  useLazySearchPersonaListQuery
} from '@acx-ui/rc/services'
import { NetworkTypeEnum, Persona } from '@acx-ui/rc/utils'

import { IdentityGroupForm }   from '../../../../users/IdentityGroupForm'
import { SelectPersonaDrawer } from '../../../../users/IdentitySelector/SelectPersonaDrawer'
import { PersonaGroupSelect }  from '../../../../users/PersonaGroupSelect'
import NetworkFormContext      from '../../../NetworkFormContext'
import * as UI                 from '../../../NetworkMoreSettings/styledComponents'

export function IdentityGroup () {
  const { editMode, cloneMode, data } = useContext(NetworkFormContext)
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const selectedIdentityId = Form.useWatch('identityId', form)
  const selectedIdentityGroupId = Form.useWatch('identityGroupId', form)
  const enableIdentityAssociation = Form.useWatch('enableIdentityAssociation', form)
  const [display, setDisplay] = useState({ display: 'none' })
  const [identitySelectorDrawerVisible, setIdentitySelectorDrawerVisible] = useState(false)
  const [identityGroupModelVisible, setIdentityGroupModelVisible] = useState(false)
  const [selectedIdentity, setSelectedIdentity] = useState<Persona>()
  const [identityGroupListTrigger] = useLazySearchPersonaGroupListQuery()
  const [identityListTrigger] = useLazySearchPersonaListQuery()
  const noDisplayUnderSpecificNetwork = ![NetworkTypeEnum.AAA, NetworkTypeEnum.HOTSPOT20]
    .includes(data?.type ?? NetworkTypeEnum.PSK)
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

  useEffect(() => {
    const setData = async () => {
      if ((editMode || cloneMode) && data) {
        // These network can bind identity group
        if (
          data.type === NetworkTypeEnum.PSK ||
          data.type === NetworkTypeEnum.AAA ||
          data.type === NetworkTypeEnum.HOTSPOT20
        ) {
          const retrievedIdentityGroupsData = await identityGroupListTrigger(
            { payload: { networkId: data.id } }
          )
          const boundIdentityGroups = retrievedIdentityGroupsData?.data
          if (boundIdentityGroups && boundIdentityGroups.totalCount > 0) {
            form.setFieldValue('identityGroupId', boundIdentityGroups.data[0].id)
          }
        }
        // Only PSK can bind identity
        if (data.type === NetworkTypeEnum.PSK) {
          const retrievedIdentitiesData = await identityListTrigger({
            payload: {
              filter: {
                networkId: data.id
              }
            }
          })
          const boundIdentities = retrievedIdentitiesData?.data
          if (boundIdentities && boundIdentities.totalCount > 0){
            const persona = boundIdentities.data[0]
            form.setFieldValue('identityId', persona.groupId)
            form.setFieldValue('enableIdentityAssociation', true)
            setSelectedIdentity(persona)
          }
        }
      }
    }
    setData()
  }, [])

  useEffect(() => {
    onAssociationChange(enableIdentityAssociation)
  }, [enableIdentityAssociation])

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
              setIdentityGroupModelVisible(true)
            }}
          >
            {$t({ defaultMessage: 'Add' })}
          </Button>
        </Space>
      </Space>
      {selectedIdentityGroupId && noDisplayUnderSpecificNetwork && (
        <>
          <UI.FieldLabel width={'400px'}>
            {$t({
              defaultMessage:
                'Use single identity association to all onboarded devices'
            })}
            <Form.Item
              name={['enableIdentityAssociation']}
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
                {$t({ defaultMessage: 'Associate Identity' })}
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
      <Modal
        title={$t({ defaultMessage: 'Add Identity Group' })}
        visible={identityGroupModelVisible}
        type={ModalType.ModalStepsForm}
        children={<IdentityGroupForm
          modalMode={true}
          callback={(identityGroupId?: string) => {
            if (identityGroupId) {
              form.setFieldValue('identityGroupId', identityGroupId)
            }
            setIdentityGroupModelVisible(false)
          }}
        />}
        onCancel={() => setIdentityGroupModelVisible(false)}
        width={1200}
        destroyOnClose={true}
      />
      {identitySelectorDrawerVisible && (
        <SelectPersonaDrawer
          onSubmit={handleClose}
          onCancel={() => setIdentitySelectorDrawerVisible(false)}
          identityId={selectedIdentityId}
          identityGroupId={selectedIdentityGroupId}
          disableAddDevices={true}
          useByIdentityGroup={true}
        />
      )}
    </>
  )}
