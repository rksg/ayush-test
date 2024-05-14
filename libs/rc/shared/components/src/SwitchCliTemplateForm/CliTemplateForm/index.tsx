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
import { Features, useIsSplitOn }           from '@acx-ui/feature-toggle'
import {
  useGetCliTemplateQuery,
  useLazyGetCliTemplatesQuery,
  useAddCliTemplateMutation,
  useUpdateCliTemplateMutation,
  useBatchAssociateCliTemplateMutation,
  useBatchDisassociateCliTemplateMutation
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
  noticeInfo: defineMessage({ defaultMessage: 'Once the CLI Configuration profile is applied to a <venueSingular></venueSingular>, you will not be able to apply a regular switch configuration profile to the same <venueSingular></venueSingular>' }),
  noticeDesp: defineMessage({ defaultMessage: 'It is the user\'s responsibility to ensure the validity and ordering of CLI commands are accurate. The recommendation is to get familiarized with {link} to avoid configuration failures' }),
  variableName: defineMessage({ defaultMessage: 'Variable name may include letters and numbers. It must start with a letter.' }),
  rangeStartValue: defineMessage({ defaultMessage: 'You may enter numbers between 0 and 65535. Start value must be lower than end value' }),
  rangeEndValue: defineMessage({ defaultMessage: 'You may enter numbers between 0 and 65535. End value must be higher than start value' }),
  stringValue: defineMessage({ defaultMessage: 'Special characters (other than space, $, -, . and _) are not allowed' })
}
/* eslint-enable max-len */

export enum VariableType {
  ADDRESS = 'ADDRESS',
  RANGE = 'RANGE',
  STRING = 'STRING'
}

export const cliTemplatesPayload = {
  fields: ['name', 'id', 'venueSwitches'],
  pageSize: 9999,
  sortField: 'name',
  sortOrder: 'DESC'
}

type VenueSwitches = { [key: string]: string[] }

export function CliTemplateForm () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const linkToNetworks = useTenantLink('/networks/wired/onDemandCli')
  const editMode = params.action === 'edit'
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const [form] = Form.useForm()
  const [addCliTemplate] = useAddCliTemplateMutation()
  const [updateCliTemplate] = useUpdateCliTemplateMutation()
  const [batchAssociateCliTemplate] = useBatchAssociateCliTemplateMutation()
  const [batchDisassociateCliTemplate] = useBatchDisassociateCliTemplateMutation()
  const [getCliTemplates] = useLazyGetCliTemplatesQuery()
  const { data: cliTemplate, isLoading: isCliTemplateLoading }
    = useGetCliTemplateQuery({
      params,
      enableRbac: isSwitchRbacEnabled
    }, { skip: !editMode })

  const handleEditCli = async (data: CliConfiguration) => {
    try {
      const venueSwitches = data.venueSwitches as unknown as VenueSwitches
      const disassociateSwitch = getDisassociatedSwitch(cliTemplate, venueSwitches)
      // update in order: disassociate -> update -> associate
      await disassociateWithCliTemplate(disassociateSwitch)

      await updateCliTemplate({
        params, payload: {
          ..._.omit(data, ['applyNow', 'cliValid', 'applySwitch']),
          id: params.templateId,
          applyLater: !data.applyNow,
          venueSwitches: transformVenueSwitches(venueSwitches),
          ...transformVariables(isSwitchRbacEnabled, data)
        },
        enableRbac: isSwitchRbacEnabled
      }).unwrap()

      await associateWithCliTemplate(venueSwitches)
      navigate(linkToNetworks, { replace: true })

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleAddCli = async (data: CliConfiguration) => {
    try {
      const venueSwitches = data.venueSwitches as unknown as VenueSwitches
      const hasAssociatedSwitches = hasVenueSwitches(venueSwitches)
      await addCliTemplate({
        params, payload: {
          ..._.omit(data, ['applyNow', 'cliValid', 'applySwitch']),
          applyLater: !data.applyNow,
          venueSwitches: transformVenueSwitches(venueSwitches),
          ...transformVariables(isSwitchRbacEnabled, data)
        },
        enableRbac: isSwitchRbacEnabled
      }).unwrap()

      if (isSwitchRbacEnabled && hasAssociatedSwitches) {
        const { data: cliTemplates } = await getCliTemplates({
          params,
          payload: cliTemplatesPayload,
          enableRbac: isSwitchRbacEnabled
        }).unwrap()
        const templateId = cliTemplates?.filter(t => t.name === data.name)?.map(t => t.id)?.[0]
        await associateWithCliTemplate(venueSwitches, templateId)
      }
      navigate(linkToNetworks, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const associateWithCliTemplate = async (
    venueSwitches: VenueSwitches,
    cliTemplateId?: string,
    callBack?: () => void
  ) => {
    const templateId = params.templateId || cliTemplateId
    const hasAssociatedSwitches = hasVenueSwitches(venueSwitches)

    if (isSwitchRbacEnabled && hasAssociatedSwitches && templateId) {
      const trimVenueSwitches = Object.keys(venueSwitches).reduce((result, index) => {
        const hasSwitches = venueSwitches[index]?.length > 0
        return {
          ...result,
          ...( hasSwitches ? { [index]: venueSwitches[index] } : {})
        }
      }, {})

      const requests = Object.keys(trimVenueSwitches).map((key: string)=> ({
        params: { venueId: key, templateId },
        payload: trimVenueSwitches?.[key as keyof typeof trimVenueSwitches]
      }))

      await batchAssociateCliTemplate(requests).then(callBack)
    }
    return Promise.resolve()
  }

  const disassociateWithCliTemplate = async (
    venueSwitches: VenueSwitches,
    callBack?: () => void
  ) => {
    const hasDisassociatedSwitches = hasVenueSwitches(venueSwitches)
    if (isSwitchRbacEnabled && hasDisassociatedSwitches) {
      const requests = Object.keys(venueSwitches).map((key: string)=> ({
        params: { venueId: key, templateId: params.templateId },
        payload: venueSwitches?.[key as keyof typeof venueSwitches]
      }))
      await batchDisassociateCliTemplate(requests).then(callBack)
    }
    return Promise.resolve()
  }

  useEffect(() => {
    if (!isCliTemplateLoading) {
      const data = {
        ...cliTemplate,
        applyNow: editMode && cliTemplate ? !cliTemplate?.applyLater : false,
        ...(cliTemplate?.venueSwitches && {
          venueSwitches: cliTemplate?.venueSwitches?.reduce((result, v) => ({
            ...result,
            [v.venueId as string]: v.switches ?? []
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
        breadcrumb={[
          { text: $t({ defaultMessage: 'Wired' }) },
          { text: $t({ defaultMessage: 'Wired Network Profiles' }) },
          {
            text: $t({ defaultMessage: 'On-Demand CLI Configuration' }),
            link: '/networks/wired/onDemandCli'
          }
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

function transformVenueSwitches (venueSwitches?: VenueSwitches) {
  return Object.entries(venueSwitches ?? {})
    .map(v => ({ venueId: v[0], switches: v[1] }))
}

function transformVariables (isSwitchRbacEnabled: boolean, data: CliConfiguration) {
  if (isSwitchRbacEnabled) {
    return {
      variables: data.variables?.map(variable => {
        const type = variable.type
        const separator = getVariableSeparator(type)
        const values = variable.value?.split(separator)
        return {
          ...variable,
          value: values?.[0]
        }
      })
    }
  }
  return {
    variables: data.variables
  }
}

function getDisassociatedSwitch (
  data?: CliConfiguration,
  venueSwitches?: VenueSwitches
) {
  const orinVenueSwitches = data?.venueSwitches?.reduce((result, v) => ({
    ...result,
    [v.venueId as string]: v.switches
  }), {}) as VenueSwitches

  return Object.keys(orinVenueSwitches ?? {}).reduce((result, key) => {
    const diff = orinVenueSwitches?.[key]?.filter(
      item => !venueSwitches?.[key]?.includes(item)
    )
    return {
      ...result,
      ...(diff?.length ? { [key]: diff } : {})
    }
  }, {})
}

function hasVenueSwitches (venueSwitches: VenueSwitches) {
  return Object.values(venueSwitches ?? {}).flat()?.length > 0
}

export function getVariableSeparator (type: string) {
  const t = type.toUpperCase()
  return t === VariableType.RANGE
    ? ':'
    : (t === VariableType.ADDRESS ? '_' : '*')
}
