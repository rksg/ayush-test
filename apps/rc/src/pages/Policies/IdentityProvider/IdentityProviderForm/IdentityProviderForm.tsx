import { useEffect, useReducer } from 'react'

import { Form }                   from 'antd'
import { cloneDeep }              from 'lodash'
import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { PageHeader, StepsForm }      from '@acx-ui/components'
import {
  useAddIdentityProviderMutation,
  useGetIdentityProviderQuery,
  useUpdateIdentityProviderMutation
} from '@acx-ui/rc/services'
import {
  IdentityProvider,
  IdentityProviderActionType,
  PolicyOperation,
  PolicyType,
  generatePolicyPageHeaderTitle,
  getPolicyRoutePath,
  usePolicyListBreadcrumb
} from '@acx-ui/rc/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'

import { AddRowIdToIdenetityProvider, removeRowIds } from '../utils'

import AaaSettingsForm                              from './AaaSettingsForm'
import IdentityProviderFormContext, { mainReducer } from './IdentityProviderFormContext'
import NetworkIdentifierForm                        from './NetworkIdentifierForm'
import SummaryForm                                  from './SummaryForm'

type IdentityProviderFormProps = {
   editMode?: boolean,
   modalMode?: boolean,
   modalCallBack?: (id?: string) => void
}

const IdentityProviderForm = (props: IdentityProviderFormProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const tablePath = getPolicyRoutePath({
    type: PolicyType.IDENTITY_PROVIDER,
    oper: PolicyOperation.LIST
  })
  const linkToPolicies = useTenantLink(tablePath)

  const { editMode = false, modalMode, modalCallBack } = props


  const { data } = useGetIdentityProviderQuery({ params }, { skip: !editMode })
  const [ createIdentityProvider ] = useAddIdentityProviderMutation()
  const [ updateIdentityProvider ] = useUpdateIdentityProviderMutation()

  const breadcrumb = usePolicyListBreadcrumb(PolicyType.IDENTITY_PROVIDER)
  const pageTitle = generatePolicyPageHeaderTitle(editMode, false, PolicyType.IDENTITY_PROVIDER)

  const [form] = Form.useForm()

  const [state, dispatch] = useReducer(mainReducer, {
    name: '',
    naiRealms: [],
    authRadiusId: '',
    accountingRadiusEnabled: false
  })

  useEffect(() => {
    if (editMode && data) {
      // update state from API data
      if (state.name === '') {
        // add RowId
        const newData = AddRowIdToIdenetityProvider(data)

        dispatch({
          type: IdentityProviderActionType.UPDATE_STATE,
          payload: {
            state: {
              ...state,
              ...newData
            }
          }
        })
      }

      if (form) {
        form.setFieldsValue(data)
      }
    }

  }, [form, editMode, data])

  const transformPayload = (state: IdentityProvider) => {
    let newData = cloneDeep(state)
    const { naiRealms, plmns, roamConsortiumOIs, accountingRadiusEnabled } = newData
    // remove rowId
    const newRealms = naiRealms.map(realm => {
      const { eaps } = realm
      const newEap = eaps? removeRowIds(eaps) : undefined

      return {
        ...realm,
        ...(newEap && { eaps: newEap })
      }
    })

    if (!accountingRadiusEnabled) {
      delete newData.accountingRadiusId
    }

    return {
      ...newData,
      naiRealms: removeRowIds(newRealms),
      ...(plmns && { plmns: removeRowIds(plmns) }),
      ...(roamConsortiumOIs && { roamConsortiumOIs: removeRowIds(roamConsortiumOIs) })
    }
  }

  const handleAddIdentityProvider = async () => {
    try {
      const payload = transformPayload(state)
      const results = await createIdentityProvider({ params, payload }).unwrap()
      const response = results.response as { id: string }
      modalMode ? modalCallBack?.(response.id) : navigate(linkToPolicies, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleEditIdentityProvider = async () => {
    try {
      const payload = transformPayload(state)
      await updateIdentityProvider({ params, payload }).unwrap()

      modalMode ? modalCallBack?.() : navigate(linkToPolicies, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (<>
    {!modalMode &&
      <PageHeader
        title={pageTitle}
        breadcrumb={breadcrumb} />
    }
    <IdentityProviderFormContext.Provider value={{ state, dispatch }}>
      <StepsForm<IdentityProvider>
        form={form}
        editMode={editMode}
        onCancel={() => modalMode ? modalCallBack?.() : navigate(linkToPolicies, { replace: true })}
        onFinish={editMode? handleEditIdentityProvider : handleAddIdentityProvider}
      >
        <StepsForm.StepForm
          name={'identifier'}
          title={$t({ defaultMessage: 'Network Identifier' })}
        >
          <NetworkIdentifierForm />
        </StepsForm.StepForm>
        <StepsForm.StepForm
          name={'aaa'}
          title={$t({ defaultMessage: 'AAA Settings' })}
        >
          <AaaSettingsForm />
        </StepsForm.StepForm>
        { !editMode && <StepsForm.StepForm
          name={'summary'}
          title={$t({ defaultMessage: 'Summary' })}
        >
          <SummaryForm />
        </StepsForm.StepForm>}
      </StepsForm>
    </IdentityProviderFormContext.Provider>
  </>
  )
}

export default IdentityProviderForm