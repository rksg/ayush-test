import React, { useEffect, useRef, useState } from 'react'

import { Col, Row, Typography, Form } from 'antd'
import moment                         from 'moment-timezone'
import { useIntl }                    from 'react-intl'

import { Loader, PageHeader, showToast, StepsForm, StepsFormInstance } from '@acx-ui/components'
import {
  useAddMacRegListMutation,
  useGetMacRegListQuery,
  useMacRegListsQuery,
  useUpdateMacRegListMutation
} from '@acx-ui/rc/services'
import {
  MacRegistrationPoolFormFields, MacRegistrationPool, useMacRegListTableQuery
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { expirationTimeUnits, toTimeString } from '../MacRegistrationListUtils'

import MacRegistrationListFormContext     from './MacRegistrationListFormContext'
import { MacRegistrationListSettingForm } from './MacRegistrationListSetting/MacRegistrationListSettingForm'


export default function MacRegistrationListForm () {
  const intl = useIntl()
  const { action, macRegistrationListId } = useParams()
  const editMode = action === 'edit'
  const linkToList = useTenantLink('/policies/mac-registration-lists')
  const navigate = useNavigate()
  const formRef = useRef<StepsFormInstance<MacRegistrationPoolFormFields>>()
  const [poolSaveState, setPoolSaveState] = useState<MacRegistrationPool>({})

  const { data, isLoading } = useGetMacRegListQuery({ params: { macRegistrationListId } })
  const [addMacRegList] = useAddMacRegListMutation()
  const [updateMacRegList, { isLoading: isUpdating }] = useUpdateMacRegListMutation()
  const { Paragraph } = Typography

  const tableQuery = useMacRegListTableQuery({
    useQuery: useMacRegListsQuery,
    apiParams: { size: '10', page: '0' },
    defaultPayload: {}
  })

  useEffect(() => {
    if (data) {
      formRef.current?.setFieldsValue({
        name: data?.name,
        autoCleanup: data.autoCleanup,
        ...toListExpirationFieldsValue(data)
        // defaultAccess
        // policyId
      })
      setPoolSaveState({ ...data })
    }
  }, [data])

  const updatePoolSaveData = (data: MacRegistrationPoolFormFields) => {
    const saveData = {
      name: data.name,
      autoCleanup: data.autoCleanup,
      priority: (editMode ? undefined : tableQuery.data ? tableQuery.data.totalElements + 1 : 0),
      ...toListExpirationPayload(data)
      // defaultAccess
      // policyId
    }
    setPoolSaveState(saveData)
  }

  // eslint-disable-next-line max-len
  const toListExpirationPayload = (data: MacRegistrationPoolFormFields) => {
    if (data.listExpiration === 1) {
      return {
        expirationEnabled: false
      }
    } else if (data.listExpiration === 2) {
      return {
        expirationType: 'SPECIFIED_DATE',
        expirationDate: moment(data.expireDate).toISOString(),
        expirationEnabled: true
      }
    } else {
      return {
        expirationType: data.expireTimeUnit,
        expirationOffset: data.expireAfter,
        expirationEnabled: true
      }
    }
  }

  const toListExpirationFieldsValue = (data: MacRegistrationPool) => {
    if (!data.expirationEnabled) {
      return {
        listExpiration: 1
      }
    } else {
      if (data.expirationType === 'SPECIFIED_DATE') {
        return {
          listExpiration: 2,
          expireDate: moment(data.expirationDate)
        }
      } else {
        return {
          listExpiration: 3,
          expireAfter: data.expirationOffset,
          expireTimeUnit: data.expirationType
        }
      }
    }
  }

  const handleAddList = async () => {
    try {
      await addMacRegList({ payload: poolSaveState }).unwrap()
      navigate(linkToList, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: intl.$t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const handleEditList = async (data: MacRegistrationPoolFormFields) => {
    try {
      const saveData = {
        name: data.name,
        ...toListExpirationPayload(data),
        autoCleanup: data.autoCleanup
        // defaultAccess
        // policyId
      }
      await updateMacRegList({
        params: { macRegistrationListId },
        payload: saveData
      }).unwrap()
      navigate(linkToList, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: intl.$t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const editContent = () => {
    return (
      <StepsForm.StepForm>
        <Loader states={[{
          isLoading: isLoading,
          isFetching: isUpdating
        }]}>
          <Row>
            <Col span={14}>
              <MacRegistrationListSettingForm/>
            </Col>
          </Row>
        </Loader>
      </StepsForm.StepForm>
    )
  }

  const addContent = () => {
    return (
      <>
        <StepsForm.StepForm title='1. Settings'
          onFinish={async (data: MacRegistrationPoolFormFields) => {
            updatePoolSaveData(data)
            return true
          }}>
          <Row>
            <Col span={14}>
              <StepsForm.Title children='Settings'/>
              <MacRegistrationListSettingForm/>
            </Col>
          </Row>
        </StepsForm.StepForm>
        <StepsForm.StepForm title='2. Summary'>
          <Row>
            <Col span={16}>
              <StepsForm.Title children='Summary'/>
              <Row>
                <Col span={24}>
                  <h4 style={{ fontWeight: 'bold' }}>Settings</h4>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.$t({ defaultMessage: 'Policy Name' })}
                  >
                    <Paragraph>{poolSaveState.name}</Paragraph>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.$t({ defaultMessage: 'List Expiration' })}
                  >
                    <Paragraph>{!poolSaveState?.expirationEnabled ? 'Never expires' :
                      // eslint-disable-next-line max-len
                      poolSaveState.expirationType === 'SPECIFIED_DATE' ? toTimeString(poolSaveState.expirationDate) : `After ${poolSaveState.expirationOffset} ${expirationTimeUnits[poolSaveState.expirationType ?? '']}`}</Paragraph>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.$t({ defaultMessage: 'Automatically clean expired entries' })}
                  >
                    <Paragraph>{poolSaveState.autoCleanup ? 'Yes' : 'No'}</Paragraph>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.$t({ defaultMessage: 'Behavior' })}
                  >
                    <Paragraph>Always redirect to authenticate user</Paragraph>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.$t({ defaultMessage: 'Redirect URL' })}
                  >
                    <Paragraph>http://www.website.com</Paragraph>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.$t({ defaultMessage: 'Default Access' })}
                  >
                    <Paragraph>Accept</Paragraph>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.$t({ defaultMessage: 'Access Policy' })}
                  >
                    <Paragraph>{''}</Paragraph>
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
        </StepsForm.StepForm>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={editMode
          ? intl.$t({ defaultMessage: 'Configure' }) + ' ' + data?.name
          : intl.$t({ defaultMessage: 'Add MAC Registration List' })}
        breadcrumb={[
          {
            text: intl.$t({ defaultMessage: 'Policies & Profiles > MAC Registration Lists' }),
            link: '/policies/mac-registration-lists'
          }
        ]}
      />
      <MacRegistrationListFormContext.Provider value={{
        editMode,
        data: poolSaveState,
        setData: setPoolSaveState
      }}>
        <StepsForm
          editMode={editMode}
          formRef={formRef}
          onCancel={() => navigate(linkToList)}
          onFinish={editMode ? handleEditList : handleAddList}>
          {editMode ? editContent() : addContent()}
        </StepsForm>
      </MacRegistrationListFormContext.Provider>
    </>
  )
}
