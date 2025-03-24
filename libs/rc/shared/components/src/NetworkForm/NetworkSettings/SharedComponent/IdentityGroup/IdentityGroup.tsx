import React, { useState, useEffect, useContext } from 'react'

import { Form, Switch, Button, Space, Input, Col, Row } from 'antd'
import { useIntl }                                      from 'react-intl'


import { Modal, ModalType, Drawer } from '@acx-ui/components'
import {
  useGetEnhancedDpskListQuery,
  useLazySearchPersonaGroupListQuery,
  useLazySearchPersonaListQuery,
  useSearchMacRegListsQuery
} from '@acx-ui/rc/services'
import { NetworkTypeEnum, Persona } from '@acx-ui/rc/utils'

import {
  DpskPoolLink,
  IdentityGroupLink,
  MacRegistrationPoolLink,
  NetworkSegmentationLink,
  PersonaGroupDrawer,
  useIsEdgeFeatureReady,
  VenueLink,
  CertTemplateLink
} from '@acx-ui/rc/components'

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
  const [ detailDrawerVisible, setDetailDrawerVisible ] = useState<boolean>(false)
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

          <Space split='|'>
            <Button
              type='link'
              disabled={!selectedIdentityId}
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

interface IdentityGroupDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  persona :Persona
}

const macRegSearchDefaultPayload = {
  dataOption: 'all',
  searchCriteriaList: [
    {
      filterKey: 'name',
      operation: 'cn',
      value: ''
    }
  ],
  sortField: 'name',
  sortOrder: 'ASC',
  page: 1,
  pageSize: 10000
}

export function IdentityGroupDrawer (props: IdentityGroupDrawerProps) {

  const {
    visible,
    setVisible,
    persona
  } = props

  const { $t } = useIntl()

  const handleClose = () => {
    setVisible(false)
  }
  const { data: dpskPool } = useGetEnhancedDpskListQuery({
    payload: { sortField: 'name', sortOrder: 'ASC', page: 1, pageSize: 10000 }
  })
  const { data: macList } = useSearchMacRegListsQuery({ payload: macRegSearchDefaultPayload })


  return (
    <Drawer
      title={$t({ defaultMessage: 'Identity Group: {name}' }, { name: persona.name })}
      visible={visible}
      width={450}
      children={
        <Form layout='vertical'>
          <Row gutter={20}>
            <Col span={24}>
              <Form.Item
                label={$t({ defaultMessage: 'Description' })}
                children={
                  <Button
                    data-testid={'display-metadata-button'}
                    style={{ borderStyle: 'none' }}
                    type='link'
                    onClick={()=>{handleDisplayMetadata(policy.id)}}
                  >
                    {$t({ defaultMessage: 'View metadata' })}
                  </Button>
                }
              />
              <Form.Item
                label={$t({ defaultMessage: 'DPSK Service' })}
                children={
                  <DpskPoolLink
                    name={dpskPools.get(row.dpskPoolId ?? '')}
                    dpskPoolId={row.dpskPoolId}
                  />
                }
              />
              <Form.Item
                label={$t({ defaultMessage: 'MAC Registration' })}
                children={
                  <MacRegistrationPoolLink
                    name={macRegistrationPools.get(row.macRegistrationPoolId ?? '')}
                    macRegistrationPoolId={row.macRegistrationPoolId}
                  />
                }
              />
              <Form.Item
                label={$t({ defaultMessage: 'Adaptive Policy Set' })}
                children={
                  (policy.encryptionCertificateId ? '' :
                    <TenantLink
                      to={getPolicyRoutePath({
                        type: PolicyType.SERVER_CERTIFICATES,
                        oper: PolicyOperation.LIST
                      })}>
                      {
                        certificateNameMap.find(cert => {
                          return cert.key === policy.encryptionCertificateId
                        })?.value || ''
                      }
                    </TenantLink>
                  )
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
