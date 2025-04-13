import React, { useState, useEffect, useContext, useReducer } from 'react'

import { Form, Switch, Button, Space, Input, Col, Row } from 'antd'
import { produce }                                      from 'immer'
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

export enum UserActions {
  onClickIdentityGroupInput,
  onClickIdentityGroupViewDetailButton,
  onClickIdentityGroupAddButton,
  turnOnAssociationIdentitySwitch,
  turnOffAssociationIdentitySwitch,
  onClickIdentitySelectorButton,
}

export enum ViewStateActions {
  Initialize,
  SetIdentityGroups,
  SetSelectedIdentity,
  SetSelectedIdentityGroup
}

type ViewAction =
  | { type: UserActions.onClickIdentityGroupInput; personaGroup: PersonaGroup }
  | { type: UserActions.onClickIdentityGroupViewDetailButton }
  | { type: UserActions.onClickIdentityGroupAddButton }
  | { type: UserActions.turnOnAssociationIdentitySwitch }
  | { type: UserActions.turnOffAssociationIdentitySwitch }
  | { type: UserActions.onClickIdentitySelectorButton }
  | { type: ViewStateActions.Initialize; payload: ViewState }
  | { type: ViewStateActions.SetIdentityGroups; payload: PersonaGroup[] }
  | { type: ViewStateActions.SetSelectedIdentity; payload: Persona }
  | { type: ViewStateActions.SetSelectedIdentityGroup; payload: PersonaGroup }

interface ViewState {
  associationBlockVisible: boolean,
  identityGroupDetailDrawerVisible: boolean,
  identityGroupAddDrawerVisible: boolean,
  identitySelectorDrawerVisible: boolean,
  selectedIdentityGroup?: PersonaGroup,
  selectedIdentity?: Persona
  identityGroups: PersonaGroup[]
}

const initialViewState: ViewState = {
  associationBlockVisible: false,
  identityGroupDetailDrawerVisible: false,
  identityGroupAddDrawerVisible: false,
  identitySelectorDrawerVisible: false,
  selectedIdentityGroup: undefined,
  selectedIdentity: undefined,
  identityGroups: []
}

function resetDrawers (draft: ViewState) {
  draft.identityGroupDetailDrawerVisible = false
  draft.identityGroupAddDrawerVisible = false
  draft.identitySelectorDrawerVisible = false
}

export function setIdentityGroups (groups: PersonaGroup[]) {
  return {
    type: ViewStateActions.SetIdentityGroups,
    payload: groups
  } as const
}

export function IdentityGroup () {

  const { editMode, cloneMode, data } = useContext(NetworkFormContext)
  const { $t } = useIntl()

  const form = Form.useFormInstance()
  const formFieldIdentityId = Form.useWatch('identityId', form)
  const formFieldIdentityGroupId = Form.useWatch('identityGroupId', form)
  const enableIdentityAssociation = Form.useWatch('enableIdentityAssociation', form)

  const reducer = produce((draft: ViewState, action: ViewAction) => {
    switch (action.type) {
      case UserActions.onClickIdentityGroupInput:
        resetDrawers(draft)
        draft.associationBlockVisible = false
        draft.selectedIdentity = undefined
        draft.selectedIdentityGroup = action.personaGroup
        break
      case UserActions.onClickIdentityGroupViewDetailButton:
        resetDrawers(draft)
        draft.identityGroupDetailDrawerVisible = true
        break
      case UserActions.onClickIdentityGroupAddButton:
        resetDrawers(draft)
        draft.identityGroupAddDrawerVisible = true
        break
      case UserActions.turnOnAssociationIdentitySwitch:
        resetDrawers(draft)
        break
      case UserActions.turnOffAssociationIdentitySwitch:
        resetDrawers(draft)
        break
      case UserActions.onClickIdentitySelectorButton:
        resetDrawers(draft)
        draft.identitySelectorDrawerVisible = true
        break
      case ViewStateActions.SetIdentityGroups:
        draft.identityGroups = action.payload
        break
    }
  })

  const [viewState, dispatch] = useReducer(reducer, initialViewState)
  const [detailDrawerVisible, setDetailDrawerVisible] = useState<boolean>(false)
  const [identitySelectorDrawerVisible, setIdentitySelectorDrawerVisible] = useState(false)
  const [identityGroupDrawerVisible, setidentityGroupDrawerVisible] = useState(false)
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
        identity: identity
      })
    }
  }
  useEffect(() => {
    const selected = viewState.identityGroups.find((ig) => ig.id === formFieldIdentityGroupId)
    if (selected) {
      setSelectedIdentityGroup(selected)
    }
    // Dont use useWatch hook here, it will get undefined
    // when user choose MAC Registration List, form.item will be removed.
    const identity = form.getFieldValue('identity')
    if(identity) {
      setSelectedIdentity(identity)
    }
    onAssociationChange(enableIdentityAssociation)
  }, [])

  useEffect(() => {
    const initializeUnderEditMode = async () => {
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
            form.setFieldValue('identity', persona)
            onAssociationChange(true)
            setSelectedIdentity(persona)
          }
        }
      }
    }
    initializeUnderEditMode()
  }, [])

  useEffect(() => {
    onAssociationChange(enableIdentityAssociation)
  }, [enableIdentityAssociation])

  const onAssociationChange = (value: boolean) => {
    if(value) {
      dispatch({ type: UserActions.turnOnAssociationIdentitySwitch })
    } else {
      dispatch({ type: UserActions.turnOffAssociationIdentitySwitch })
      setSelectedIdentity(undefined)
      if (form.getFieldValue('identity')) {
        form.setFieldValue('identity', undefined)
      }
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
              setIdentityGroups={setIdentityGroups}
              onChange={() => {
                const selected = viewState.identityGroups.find((ig) =>{
                  return ig.id === formFieldIdentityGroupId
                })
                if (selected) {
                  dispatch({
                    type: UserActions.onClickIdentityGroupInput,
                    personaGroup: selected
                  })
                }
                setSelectedIdentity(undefined)
                if (formFieldIdentityId) {
                  form.setFieldValue('identity', undefined)
                }
              }}
            />
          }
        />
        <Space>
          <Space split='|'>
            <Button
              type='link'
              disabled={!formFieldIdentityGroupId}
              onClick={() => {
                dispatch({ type: UserActions.onClickIdentityGroupViewDetailButton })
              }}
            >
              {$t({ defaultMessage: 'View Details' })}
            </Button>
            <Button type='link'
              onClick={() => {
                dispatch({ type: UserActions.onClickIdentityGroupAddButton })
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
          <div style={{
            marginBottom: '20px',
            ...(viewState.associationBlockVisible ? { display: 'none' } : { display: 'block' })
          }}>
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
                        dispatch({ type: UserActions.onClickIdentitySelectorButton })
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
                  dispatch({ type: UserActions.onClickIdentitySelectorButton })
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
        visible={viewState.identityGroupAddDrawerVisible}
        onClose={(result) => {
          if (result) {
            form.setFieldValue('identityGroupId', result?.id)
          }
          setidentityGroupDrawerVisible(false)
        }}
      />
      <IdentityGroupDrawer
        visible={viewState.identityGroupDetailDrawerVisible}
        setVisible={setDetailDrawerVisible}
        personaGroup={selectedIdentityGroup}
      />
      {viewState.identitySelectorDrawerVisible && (
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
