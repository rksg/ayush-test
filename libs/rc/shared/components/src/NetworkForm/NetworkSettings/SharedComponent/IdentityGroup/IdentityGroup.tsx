import React, { useState, useEffect, useContext } from 'react'

import { Form, Switch, Button, Space, Input, Col, Row } from 'antd'
import { useIntl }                                      from 'react-intl'


import { Modal, ModalType, Drawer } from '@acx-ui/components'
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
import { IdentityGroupForm }   from '../../../../users/IdentityGroupForm'
import { SelectPersonaDrawer } from '../../../../users/IdentitySelector/SelectPersonaDrawer'
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
  const formFieldIdentityId = Form.useWatch('identityId', form)
  const formFieldIdentityGroupId = Form.useWatch('identityGroupId', form)
  const enableIdentityAssociation = Form.useWatch('enableIdentityAssociation', form)

  const [display, setDisplay] = useState({ display: 'none' })
  const [detailDrawerVisible, setDetailDrawerVisible] = useState<boolean>(false)
  const [identitySelectorDrawerVisible, setIdentitySelectorDrawerVisible] = useState(false)
  const [identityGroupModelVisible, setIdentityGroupModelVisible] = useState(false)
  const [identityGroups, setIdentityGroups] = useState<PersonaGroup[]>([])
  const [selectedIdentityGroup, setSelectedIdentityGroup] = useState<PersonaGroup>()
  const [selectedIdentity, setSelectedIdentity] = useState<Persona>()

  const [identityGroupListTrigger] = useLazySearchPersonaGroupListQuery()
  const [identityListTrigger] = useLazySearchPersonaListQuery()
  const noDisplayUnderSpecificNetwork =
    ![NetworkTypeEnum.AAA, NetworkTypeEnum.HOTSPOT20, NetworkTypeEnum.CAPTIVEPORTAL]
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
    if (formFieldIdentityId) {
      form.setFieldValue('identityId', '')
    }
    const selected = identityGroups.find((ig) => ig.id === formFieldIdentityGroupId)
    if (selected) {
      setSelectedIdentityGroup(selected)
    }
  }, [formFieldIdentityGroupId])

  useEffect(() => {
    const setData = async () => {
      if ((editMode || cloneMode) && data) {
        // These network can bind identity group
        if (
          data.type === NetworkTypeEnum.PSK ||
          data.type === NetworkTypeEnum.AAA ||
          data.type === NetworkTypeEnum.HOTSPOT20 ||
          data.type === NetworkTypeEnum.CAPTIVEPORTAL
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
              style={{ width: comboWidth }}
              placeholder={'Select...'}
              setIdentityGroups={setIdentityGroups}
            />
          }
        />
        <Space>
          <Space split='|'>
            <Button
              type='link'
              disabled={!formFieldIdentityGroupId}
              onClick={() => {
                setDetailDrawerVisible(true)
              }}
            >
              {$t({ defaultMessage: 'View Details' })}
            </Button>
            <Button type='link'
              onClick={() => {
                setIdentityGroupModelVisible(true)
              }}>
              {$t({ defaultMessage: 'Add' })}
            </Button>
          </Space>
        </Space>
      </Space>
      {formFieldIdentityGroupId && noDisplayUnderSpecificNetwork && (
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
            <UI.FieldLabel width={comboWidth}>
              <p style={{ marginBottom: '0px' }}>
                {$t({ defaultMessage: 'Identity' })}
              </p>
            </UI.FieldLabel>
            {selectedIdentity ? (
              <UI.FieldLabel width={comboWidth}>
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
      <IdentityGroupDrawer
        visible={detailDrawerVisible}
        setVisible={setDetailDrawerVisible}
        personaGroup={selectedIdentityGroup}
      />
      {identitySelectorDrawerVisible && (
        <SelectPersonaDrawer
          onSubmit={handleClose}
          onCancel={() => setIdentitySelectorDrawerVisible(false)}
          identityId={formFieldIdentityId}
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
