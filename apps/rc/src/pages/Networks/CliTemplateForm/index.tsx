import {
  useState,
  useRef
} from 'react'

import { useIntl } from 'react-intl'

import {
  PageHeader,
  showToast,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import {
  useGetCliTemplateQuery,
  useAddCliTemplateMutation,
  useUpdateCliTemplateMutation
} from '@acx-ui/rc/services'
import {
  catchErrorResponse
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import { CliStepConfiguration } from './CliStepConfiguration'
import { CliStepNotice }        from './CliStepNotice'
import { CliStepSummary }       from './CliStepSummary'
import { CliStepSwitches }      from './CliStepSwitches'
import CliTemplateFormContext   from './CliTemplateFormContext'

export default function NetworkForm () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const linkToNetworks = useTenantLink('/networks')
  const editMode = params.action === 'edit'

  const formRef = useRef<StepsFormInstance>()
  const [addCliTemplate] = useAddCliTemplateMutation()
  const [updateCliTemplate] = useUpdateCliTemplateMutation()
  const { data: cliTemplate } = useGetCliTemplateQuery({ params }, { skip: !editMode })
  const [summaryData, setSummaryData] = useState({} as any)

  const handleEditCli = async (data: any) => {
    const switches = Object.entries(data.venueSwitches ?? {})
      .map(v => ({ venueId: v[0], switches: v[1] })) ////

    try {
      await updateCliTemplate({
        params, payload: {
          ...data,
          id: params.templateId,
          venueSwitches: switches
        }
      }).unwrap()
      navigate(linkToNetworks, { replace: true })
    } catch (error) {
      const errorRes = error as catchErrorResponse
      const message
        = errorRes?.data?.errors?.[0]?.message ?? $t({ defaultMessage: 'An error occurred' })
      showToast({
        type: 'error',
        content: $t({ defaultMessage: '{message}' }, { message })
      })
    }
  }

  const handleAddCli = async (data: any) => {
    const switches = Object.entries(data.venueSwitches ?? {})
      .map(v => ({ venueId: v[0], switches: v[1] })) ////

    try {
      await addCliTemplate({
        params, payload: {
          ...data,
          venueSwitches: switches
        }
      }).unwrap()
      navigate(linkToNetworks, { replace: true }) // TODO: change route
    } catch (error) {
      const errorRes = error as catchErrorResponse
      const message
        = errorRes?.data?.errors?.[0]?.message ?? $t({ defaultMessage: 'An error occurred' })
      showToast({
        type: 'error',
        content: $t({ defaultMessage: '{message}' }, { message })
      })
    }
  }

  return (
    <>
      <PageHeader
        title={editMode
          ? $t({ defaultMessage: 'Edit CLI Template' })
          : $t({ defaultMessage: 'Add CLI Template' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Networks' }), link: '/networks' }
        ]}
      />
      <CliTemplateFormContext.Provider value={{
        editMode,
        data: cliTemplate
      }}>
        <StepsForm
          formRef={formRef}
          editMode={editMode}
          onCancel={() => navigate(linkToNetworks)}
          onFinish={editMode ? handleEditCli : handleAddCli}
        >
          <StepsForm.StepForm
            name='notice'
            title={$t({ defaultMessage: 'Important Notice' })}
            layout='horizontal'
            onFinish={async () => {
              setSummaryData(cliTemplate)
              return true
            }}
          >
            <CliStepNotice />
          </StepsForm.StepForm>

          <StepsForm.StepForm
            name='settings'
            title={$t({ defaultMessage: 'CLI Configuration' })}
            onFinish={async (data) => {
              setSummaryData({ ...summaryData, ...data })
              if (!data?.cliValid?.valid) {
                showToast({
                  type: 'error',
                  duration: 2,
                  content: data?.cliValid?.tooltip
                })
              }
              return data?.cliValid?.valid ?? true
            }}
          >
            <CliStepConfiguration />
          </StepsForm.StepForm>

          <StepsForm.StepForm
            name='switches'
            title={$t({ defaultMessage: 'Switches' })}
            onFinish={async (data) => {
              setSummaryData({ ...summaryData, ...data })
              return true
            }}
          >
            <CliStepSwitches />
          </StepsForm.StepForm>

          {!editMode &&
            <StepsForm.StepForm
              name='summary'
              title={$t({ defaultMessage: 'Summary' })}
            >
              <CliStepSummary data={summaryData} />
            </StepsForm.StepForm>
          }
        </StepsForm>
      </CliTemplateFormContext.Provider>
    </>
  )
}
