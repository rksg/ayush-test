import { useEffect } from 'react'

import { Form }                   from 'antd'
import _                          from 'lodash'
import { defineMessage, useIntl } from 'react-intl'

import {
  Loader,
  PageHeader,
  showToast,
  StepsForm
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  useGetCliTemplateQuery,
  useAddCliTemplateMutation,
  useUpdateCliTemplateMutation
} from '@acx-ui/rc/services'
import {
  CliConfiguration
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
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

  const [form] = Form.useForm()
  const [addCliTemplate] = useAddCliTemplateMutation()
  const [updateCliTemplate] = useUpdateCliTemplateMutation()
  const { data: cliTemplate, isLoading: isCliTemplateLoading }
    = useGetCliTemplateQuery({ params }, { skip: !editMode })

  const handleEditCli = async (data: CliConfiguration) => {
    try {
      await updateCliTemplate({
        params, payload: {
          ..._.omit(data, ['applyNow', 'cliValid', 'applySwitch']),
          id: params.templateId,
          applyLater: !data.applyNow,
          venueSwitches: transformVenueSwitches(
            data.venueSwitches as unknown as Map<string, string[]>[]
          )
        }
      }).unwrap()
      navigate(linkToNetworks, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleAddCli = async (data: CliConfiguration) => {
    try {
      await addCliTemplate({
        params, payload: {
          ..._.omit(data, ['applyNow', 'cliValid', 'applySwitch']),
          applyLater: !data.applyNow,
          venueSwitches: transformVenueSwitches(
            data.venueSwitches as unknown as Map<string, string[]>[]
          )
        }
      }).unwrap()
      navigate(linkToNetworks, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  useEffect(() => {
    if (!isCliTemplateLoading) {
      const data = {
        ...cliTemplate,
        applyNow: editMode && cliTemplate ? !cliTemplate?.applyLater : false,
        ...(cliTemplate?.venueSwitches && {
          venueSwitches: cliTemplate?.venueSwitches?.reduce((result, v) => ({
            ...result,
            [v.venueId as string]: v.switches
          }), {})
        })
      }

      form?.setFieldsValue(data)
    }
  }, [cliTemplate])

  return (
    <>
      <PageHeader
        title={editMode
          ? $t({ defaultMessage: 'Edit CLI Template' })
          : $t({ defaultMessage: 'Add CLI Template' })}
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Wired' }) },
          { text: $t({ defaultMessage: 'Wired Network Profiles' }) },
          {
            text: $t({ defaultMessage: 'On-Demand CLI Configuration' }),
            link: '/networks/wired/onDemandCli'
          }
        ] : [
          { text: $t({ defaultMessage: 'Wired Networks' }), link: '/networks/wired/onDemandCli' }
        ]}
      />

      <Loader states={[{ isLoading: editMode && isCliTemplateLoading }]}>
        <StepsForm
          form={form}
          editMode={editMode}
          onCancel={() => navigate(linkToNetworks)}
          onFinish={editMode ? handleEditCli : handleAddCli}
        >
          <StepsForm.StepForm
            key='notice'
            name='notice'
            title={$t({ defaultMessage: 'Important Notice' })}
            layout='horizontal'
          >
            <CliStepNotice />
          </StepsForm.StepForm>

          <StepsForm.StepForm
            name='settings'
            key='settings'
            title={$t({ defaultMessage: 'CLI Configuration' })}
            onFinish={async (data: CliConfiguration) => {
              if (!data?.cliValid?.valid) {
                showToast({ type: 'error', duration: 2, content: data?.cliValid?.tooltip })
              }
              return true
            }}
          >
            <CliStepConfiguration />
          </StepsForm.StepForm>

          <StepsForm.StepForm
            name='switches'
            title={$t({ defaultMessage: 'Switches' })}
          >
            <CliStepSwitches />
          </StepsForm.StepForm>

          {!editMode &&
              <StepsForm.StepForm
                name='summary'
                title={$t({ defaultMessage: 'Summary' })}
              >
                <CliStepSummary />
              </StepsForm.StepForm>
          }
        </StepsForm>
      </Loader>
    </>
  )
}

function transformVenueSwitches (venueSwitches?: Map<string, string[]>[]) {
  return Object.entries(venueSwitches ?? {})
    .map(v => ({ venueId: v[0], switches: v[1] }))
}
