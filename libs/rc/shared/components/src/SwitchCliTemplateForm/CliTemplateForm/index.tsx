import { useEffect, useState } from 'react'

import { Form }    from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Loader,
  PageHeader,
  showToast,
  StepsForm
} from '@acx-ui/components'
import { Features, useIsSplitOn }            from '@acx-ui/feature-toggle'
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

import { CliStepConfiguration } from '../../SwitchCli/CliStepConfiguration'
import { CliStepNotice }        from '../../SwitchCli/CliStepNotice'

import { CliStepSummary }  from './CliStepSummary'
import { CliStepSwitches } from './CliStepSwitches'

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

  const [orinVenueSwitches, setOrinVenueSwitches] = useState({} as unknown as VenueSwitches)

  const handleEditCli = async (data: CliConfiguration) => {
    try {
      const venueSwitches = data.venueSwitches as unknown as VenueSwitches
      const disassociateSwitch = getDiffAssociatedSwitch(venueSwitches, orinVenueSwitches)
      const diffAssociatedSwitch = getDiffAssociatedSwitch(orinVenueSwitches, venueSwitches)
      // should update in order:
      // disassociate -> update -> associate(exclude already associated)
      await disassociateWithCliTemplate(disassociateSwitch)

      await updateCliTemplate({
        params, payload: {
          ..._.omit(data, ['applyNow', 'cliValid', 'applySwitch']),
          id: params.templateId,
          applyLater: !data.applyNow,
          venueSwitches: transformVenueSwitches(venueSwitches)
        },
        enableRbac: isSwitchRbacEnabled
      }).unwrap()

      await associateWithCliTemplate(diffAssociatedSwitch)
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
          venueSwitches: transformVenueSwitches(venueSwitches)
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
      const venueSwitches = cliTemplate?.venueSwitches?.reduce((result, v) => ({
        ...result,
        [v.venueId as string]: v.switches ?? []
      }), {}) as VenueSwitches
      const data = {
        ...cliTemplate,
        applyNow: editMode && cliTemplate ? !cliTemplate?.applyLater : false,
        ...(cliTemplate?.venueSwitches && {
          venueSwitches: venueSwitches
        })
      }

      setOrinVenueSwitches(venueSwitches)
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

function getDiffAssociatedSwitch (
  sourceSwitches?: VenueSwitches,
  compareSwitches?: VenueSwitches
) {
  return Object.keys(compareSwitches ?? {}).reduce((result, key) => {
    const diff = compareSwitches?.[key]?.filter(
      item => !sourceSwitches?.[key]?.includes(item)
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
