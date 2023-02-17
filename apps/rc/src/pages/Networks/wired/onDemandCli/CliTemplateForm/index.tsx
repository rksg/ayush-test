import { useEffect, useState, useRef } from 'react'

import { defineMessage, useIntl } from 'react-intl'

import {
  Loader,
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
  CatchErrorResponse,
  CliConfiguration
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import { CliStepConfiguration }                  from './CliStepConfiguration'
import { CliStepNotice }                         from './CliStepNotice'
import { CliStepSummary }                        from './CliStepSummary'
import { CliStepSwitches }                       from './CliStepSwitches'
import CliTemplateFormContext, { ApplySwitches } from './CliTemplateFormContext'

/* eslint-disable max-len */
export const tooltip = {
  cliEmpty: defineMessage({ defaultMessage: 'Please input CLI commands' }),
  cliVariableInvalid: defineMessage({ defaultMessage: 'Please define variable(s) in CLI commands' }),
  cliAttributeInvalid: defineMessage({ defaultMessage: 'Please define attribute(s) in CLI commands' }),
  cliCommands: defineMessage({ defaultMessage: 'You can use any combination of the following options: type the commands, copy/paste the configuration from another file, use the examples on the right pane.' }),
  cliVariablesReachMax: defineMessage({ defaultMessage: 'The variables had reach to the maximum total 200 entries.' }),
  noticeInfo: defineMessage({ defaultMessage: 'Once the CLI Configuration profile is applied to a venue, you will not be able to apply a regular switch configuration profile to the same venue' }),
  noticeDesp: defineMessage({ defaultMessage: 'It is the user\'s responsibility to ensure the validity and ordering of CLI commands are accurate. The recommendation is to get familiarized with {link} to avoid configuration failures' }),
  variableName: defineMessage({ defaultMessage: 'Variable name may include letters and numbers. It must start with a letter.' }),
  rangeStartValue: defineMessage({ defaultMessage: 'You may enter numbers between 0 and 65535. Start value must be lower than end value' }),
  rangeEndValue: defineMessage({ defaultMessage: 'You may enter numbers between 0 and 65535. End value must be higher than start value' }),
  stringValue: defineMessage({ defaultMessage: 'Special characters (other than space, $, -, . and _) are not allowed' })
}
/* eslint-enable max-len */

export default function CliTemplateForm () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const linkToNetworks = useTenantLink('/networks/wired/onDemandCli')
  const editMode = params.action === 'edit'

  const formRef = useRef<StepsFormInstance>()
  const [addCliTemplate] = useAddCliTemplateMutation()
  const [updateCliTemplate] = useUpdateCliTemplateMutation()
  const { data: cliTemplate, isLoading: isCliTemplateLoading }
    = useGetCliTemplateQuery({ params }, { skip: !editMode })

  const [data, setData] = useState(null as unknown as CliConfiguration | undefined)
  const [applySwitches, setApplySwitches] = useState({} as Record<string, ApplySwitches[]>)
  const [cliValidation, setCliValidation] = useState({ valid: false, tooltip: '' })
  const [initCodeMirror, setInitCodeMirror] = useState(false)
  const [summaryData, setSummaryData] = useState({} as CliConfiguration)

  const handleEditCli = async (data: CliConfiguration) => {
    try {
      await updateCliTemplate({
        params, payload: {
          ...data,
          id: params.templateId,
          venueSwitches: transformVenueSwitches(
            data.venueSwitches as unknown as Map<string, string[]>[]
          )
        }
      }).unwrap()
      navigate(linkToNetworks, { replace: true })
    } catch (error) {
      const errorRes = error as CatchErrorResponse
      const message
        = errorRes?.data?.errors?.[0]?.message ?? $t({ defaultMessage: 'An error occurred' })
      showToast({
        type: 'error',
        duration: 5,
        content: $t({ defaultMessage: '{message}' }, { message })
      })
    }
  }

  const handleAddCli = async (data: CliConfiguration) => {
    try {
      await addCliTemplate({
        params, payload: {
          ...data,
          venueSwitches: transformVenueSwitches(
            data.venueSwitches as unknown as Map<string, string[]>[]
          )
        }
      }).unwrap()
      navigate(linkToNetworks, { replace: true })
    } catch (error) {
      const errorRes = error as CatchErrorResponse
      const message
        = errorRes?.data?.errors?.[0]?.message ?? $t({ defaultMessage: 'An error occurred' })
      showToast({
        type: 'error',
        duration: 5,
        content: $t({ defaultMessage: '{message}' }, { message })
      })
    }
  }

  useEffect(() => {
    if (!isCliTemplateLoading) {
      setData(cliTemplate)
    }
  }, [cliTemplate])

  return (
    <>
      <PageHeader
        title={editMode
          ? $t({ defaultMessage: 'Edit CLI Template' })
          : $t({ defaultMessage: 'Add CLI Template' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Wired Networks' }), link: '/networks/wired/onDemandCli' }
        ]}
      />

      <CliTemplateFormContext.Provider value={{
        data,
        editMode,
        cliValidation,
        setCliValidation,
        applySwitches,
        setApplySwitches,
        initCodeMirror
      }}>
        <Loader states={[{ isLoading: editMode && isCliTemplateLoading }]}>
          <StepsForm
            formRef={formRef}
            editMode={editMode}
            onCurrentChange={(current) => {
              if (editMode && current === 1) {
                setInitCodeMirror(true)
              }
            }}
            onCancel={() => navigate(linkToNetworks)}
            onFinish={editMode ? handleEditCli : handleAddCli}
          >
            <StepsForm.StepForm
              name='notice'
              title={$t({ defaultMessage: 'Important Notice' })}
              layout='horizontal'
              onFinish={async () => {
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
                if (!cliValidation?.valid) {
                  showToast({ type: 'error', duration: 2, content: cliValidation?.tooltip })
                }
                return cliValidation?.valid ?? true
              }}
            >
              <CliStepConfiguration configType='Template' />
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
        </Loader>
      </CliTemplateFormContext.Provider>
    </>
  )
}

function transformVenueSwitches (venueSwitches?: Map<string, string[]>[]) {
  return Object.entries(venueSwitches ?? {})
    .map(v => ({ venueId: v[0], switches: v[1] }))
}