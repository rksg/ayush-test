import React, { useState, useEffect, useContext } from 'react'

import { Form, Switch, Button, Space, Input, Col, Row } from 'antd'
import { useIntl }                                      from 'react-intl'

import { Drawer }                 from '@acx-ui/components'
import {
  useLazyGetAdaptivePolicySetQuery,
  useLazyGetDpskQuery,
  useLazyGetMacRegListQuery,
  useLazySearchPersonaGroupListQuery,
  useLazySearchPersonaListQuery
} from '@acx-ui/rc/services'
import { NetworkTypeEnum, Persona, PersonaGroup } from '@acx-ui/rc/utils'

import {
  DpskPoolLink,
  MacRegistrationPoolLink,
  PolicySetLink
} from '../../../../CommonLinkHelper'
import { SelectPersonaDrawer } from '../../../../users/IdentitySelector/SelectPersonaDrawer'
import { PersonaGroupDrawer }  from '../../../../users/PersonaGroupDrawer'
import { PersonaGroupSelect }  from '../../../../users/PersonaGroupSelect'
import NetworkFormContext      from '../../../NetworkFormContext'
import * as UI                 from '../../../NetworkMoreSettings/styledComponents'

interface IdentityGroupProps {
  comboWidth?: string
}

export function IdentityGroup (props: IdentityGroupProps) {
  const { comboWidth = '280px' } = props

  const { editMode, cloneMode, data } = useContext(NetworkFormContext)
  const { $t } = useIntl()

  const form = Form.useFormInstance()
  const formFieldIdentity = Form.useWatch('identity', form)
  const formFieldIdentityGroupId = Form.useWatch('identityGroupId', form)
  const enableIdentityAssociation = Form.useWatch('enableIdentityAssociation', form)

  const [associationBlockVisible, setAssociationBlockVisible] = useState(false)
  const [detailDrawerVisible, setDetailDrawerVisible] = useState<boolean>(false)
  const [identitySelectorDrawerVisible, setIdentitySelectorDrawerVisible] = useState(false)
  const [identityGroupDrawerVisible, setIdentityGroupDrawerVisible] = useState(false)
  const [identityGroups, setIdentityGroups] = useState<PersonaGroup[]>([])
  const [selectedIdentityGroup, setSelectedIdentityGroup] = useState<PersonaGroup>()
  const [selectedIdentity, setSelectedIdentity] = useState<Persona>()

  const resetAllDrawer = () => {
    setDetailDrawerVisible(false)
    setIdentitySelectorDrawerVisible(false)
    setIdentityGroupDrawerVisible(false)
  }

  const [identityGroupListTrigger] = useLazySearchPersonaGroupListQuery()
  const [identityListTrigger] = useLazySearchPersonaListQuery()
  const noDisplayUnderSpecificNetwork =
    ![NetworkTypeEnum.AAA, NetworkTypeEnum.HOTSPOT20, NetworkTypeEnum.CAPTIVEPORTAL]
      .includes(data?.type ?? NetworkTypeEnum.PSK)
  const handleClose = (identity?: Persona) => {
    resetAllDrawer()
    if (identity) {
      setSelectedIdentity(identity)
      form.setFieldsValue({
        identity: identity
      })
    }
  }
  useEffect(() => {
    const selected = identityGroups.find((ig) => ig.id === formFieldIdentityGroupId)
    if (selected) {
      setSelectedIdentityGroup(selected)
    }
    // Dont use useWatch hook here, it will get undefined
    // when user choose MAC Registration List, form.item will be removed.
    const identity = form.getFieldValue('identity')
    if(identity) {
      setSelectedIdentity(identity)
    }
  }, [formFieldIdentityGroupId])

  useEffect(() => {
    const setData = async () => {
      if ((editMode || cloneMode) && data) {
        // These network can bind identity group
        if (
          (data.type === NetworkTypeEnum.PSK ||
          data.type === NetworkTypeEnum.AAA ||
          data.type === NetworkTypeEnum.HOTSPOT20 ||
          data.type === NetworkTypeEnum.CAPTIVEPORTAL ||
          data.type === NetworkTypeEnum.OPEN) && data.id
        ) {
          const retrievedIdentityGroupsData = await identityGroupListTrigger(
            { payload: { networkId: data.id } }
          )
          const boundIdentityGroups = retrievedIdentityGroupsData?.data
          if (boundIdentityGroups && boundIdentityGroups.totalCount > 0) {
            form.setFieldValue('identityGroupId', boundIdentityGroups.data[0].id)
            setSelectedIdentityGroup(boundIdentityGroups.data[0])
          }
        }
        // Only PSK and Open network can bind identity
        if (
          data.type === NetworkTypeEnum.PSK ||
          data.type === NetworkTypeEnum.OPEN
        ) {
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
            form.setFieldValue('identity', persona)
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
    resetAllDrawer()
    setAssociationBlockVisible(value)
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
              style={{ width: comboWidth }}
              placeholder={'Select...'}
              setIdentityGroups={setIdentityGroups}
              onChange={() => {
                resetAllDrawer()
                setAssociationBlockVisible(false)
                form.setFieldValue('enableIdentityAssociation', undefined)
                setSelectedIdentity(undefined)
                if (formFieldIdentity) {
                  form.setFieldValue('identity', undefined)
                }
              }}
            />
          }
        />
        <Space split='|'>
          <Button
            type='link'
            disabled={!formFieldIdentityGroupId}
            onClick={() => {
              resetAllDrawer()
              setDetailDrawerVisible(true)
            }}
          >
            {$t({ defaultMessage: 'View Details' })}
          </Button>
          <Button type='link'
            onClick={() => {
              resetAllDrawer()
              setIdentityGroupDrawerVisible(true)
            }}>
            {$t({ defaultMessage: 'Add' })}
          </Button>
        </Space>
      </Space>
      {formFieldIdentityGroupId && noDisplayUnderSpecificNetwork && (
        <>
          <UI.FieldLabelByFraction fraction={[9,1]}>
            <div>
              {$t({
                defaultMessage:
                'Use single identity association to all onboarded devices'
              })}
            </div>
            <Form.Item
              name={['enableIdentityAssociation']}
              data-testid={'identity-associate-switch'}
              valuePropName='checked'
              initialValue={false}
              children={<Switch onChange={onAssociationChange} />}
            />
          </UI.FieldLabelByFraction>
          <div style={{
            marginBottom: '20px',
            ...(associationBlockVisible? { display: 'block' } : { display: 'none' })
          }}>
            <UI.FieldLabelByFraction fraction={[10]}>
              <p style={{ marginBottom: '0px' }}>
                {$t({ defaultMessage: 'Identity' })}
              </p>
            </UI.FieldLabelByFraction>
            {selectedIdentity ? (
              <UI.FieldLabelByFraction fraction={[8.5,1.5]}>
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
                        resetAllDrawer()
                        setIdentitySelectorDrawerVisible(true)
                      }}
                    >
                      {$t({ defaultMessage: 'Change' })}
                    </Button>
                  }
                />
              </UI.FieldLabelByFraction>
            ) : (
              <Button
                type='link'
                style={{ fontSize: '12px' }}
                onClick={() => {
                  resetAllDrawer()
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
        name={'identity'}
        hidden
        children={<Input hidden />}
      />
      <PersonaGroupDrawer
        requiredDpsk
        isEdit={false}
        visible={identityGroupDrawerVisible}
        onClose={(result) => {
          if (result) {
            form.setFieldValue('identityGroupId', result?.id)
            form.setFieldValue('enableIdentityAssociation', undefined)
            form.setFieldValue('identity', undefined)
            setSelectedIdentity(undefined)
          }
          resetAllDrawer()
        }}
      />
      <IdentityGroupDrawer
        visible={detailDrawerVisible}
        setVisible={resetAllDrawer}
        personaGroup={selectedIdentityGroup}
      />
      {identitySelectorDrawerVisible && (
        <SelectPersonaDrawer
          onSubmit={handleClose}
          onCancel={() => setIdentitySelectorDrawerVisible(false)}
          identityId={formFieldIdentity?.id}
          identityGroupId={formFieldIdentityGroupId}
          disableAddDevices={true}
          useByIdentityGroup={true}
        />
      )}
    </>
  )}

interface IdentityGroupDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  personaGroup?: PersonaGroup
}

export function IdentityGroupDrawer (props: IdentityGroupDrawerProps) {

  const {
    visible,
    setVisible,
    personaGroup
  } = props

  const { $t } = useIntl()

  const [getDpskById] = useLazyGetDpskQuery()
  const [getMacRegistrationById] = useLazyGetMacRegListQuery()
  const [getPolicySetById] = useLazyGetAdaptivePolicySetQuery()


  const [DPSKName, setDPSKName] = useState('')
  const [macRegistrationName, setMacRegistrationName] = useState('')
  const [policySetName, setPolicySetName] = useState('')

  const handleClose = () => {
    setVisible(false)
  }


  useEffect(() => {

    if (personaGroup?.macRegistrationPoolId) {
      getMacRegistrationById({ params: { policyId: personaGroup?.macRegistrationPoolId } })
        .then(result => {
          if (result.data) setMacRegistrationName(result.data.name)
        })
    }

    if (personaGroup?.dpskPoolId) {
      getDpskById({ params: { serviceId: personaGroup?.dpskPoolId } })
        .then(result => {
          if (result.data) setDPSKName(result.data.name)
        })
    }

    if(personaGroup?.policySetId) {
      getPolicySetById({ params: { policySetId: personaGroup?.policySetId } })
        .then(result => {
          if(result?.data) setPolicySetName(result.data.name)
        })
    }

  }, [personaGroup])

  return (
    <Drawer
      title={$t({ defaultMessage: 'Identity Group: {name}' }, { name: personaGroup?.name })}
      visible={visible}
      width={450}
      children={
        <Form layout='vertical'>
          <Row gutter={20}>
            <Col span={24}>
              <Form.Item
                label={$t({ defaultMessage: 'Description' })}
                children={personaGroup?.description ?? '--'}
              />
              <Form.Item
                label={$t({ defaultMessage: 'DPSK Service' })}
                children={
                  <DpskPoolLink
                    name={DPSKName}
                    dpskPoolId={personaGroup?.dpskPoolId}
                    showNoData={true}
                  />
                }
              />
              <Form.Item
                label={$t({ defaultMessage: 'MAC Registration' })}
                children={
                  <MacRegistrationPoolLink
                    name={macRegistrationName}
                    macRegistrationPoolId={personaGroup?.macRegistrationPoolId}
                    showNoData={true}
                  />
                }
              />
              <Form.Item
                label={$t({ defaultMessage: 'Adaptive Policy Set' })}
                children={
                  <PolicySetLink
                    name={policySetName}
                    id={personaGroup?.policySetId}
                    showNoData={true}
                  />
                }
              />
            </Col>
          </Row>
        </Form>
      }
      onClose={handleClose}
      destroyOnClose={true}
    />
  )
}
