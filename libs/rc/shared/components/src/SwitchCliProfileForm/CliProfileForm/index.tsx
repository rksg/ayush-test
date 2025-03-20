import { useEffect, useState } from 'react'

import { Form }       from 'antd'
import _, { isArray } from 'lodash'
import { useIntl }    from 'react-intl'

import {
  Loader,
  PageHeader,
  showToast,
  StepsForm
} from '@acx-ui/components'
import { Features, useIsSplitOn }                  from '@acx-ui/feature-toggle'
import {
  useLazyGetProfilesQuery,
  useGetSwitchConfigProfileQuery,
  useGetSwitchListQuery,
  useAddSwitchConfigProfileMutation,
  useUpdateSwitchConfigProfileMutation,
  useBatchAssociateSwitchProfileMutation,
  useBatchDisassociateSwitchProfileMutation,
  useGetSwitchConfigProfileTemplateQuery,
  useAddSwitchConfigProfileTemplateMutation,
  useUpdateSwitchConfigProfileTemplateMutation,
  useBatchAssociateSwitchConfigProfileTemplateMutation,
  useBatchDisassociateSwitchConfigProfileTemplateMutation,
  useLazyGetSwitchConfigProfileTemplateListQuery
} from '@acx-ui/rc/services'
import {
  CliConfiguration,
  ConfigurationProfile,
  SwitchStatusEnum,
  SwitchViewModel,
  useConfigTemplatePageHeaderTitle,
  useConfigTemplateBreadcrumb,
  useConfigTemplateQueryFnSwitcher,
  useConfigTemplateMutationFnSwitcher,
  useConfigTemplate,
  useConfigTemplateLazyQueryFnSwitcher
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useParams
} from '@acx-ui/react-router-dom'

import { usePathBasedOnConfigTemplate } from '../../configTemplates'
import { CliStepConfiguration }         from '../../SwitchCli/CliStepConfiguration'
import { CliStepNotice }                from '../../SwitchCli/CliStepNotice'
import { getCustomizedSwitchVenues }    from '../../SwitchCli/CliVariableUtils'

import { CliStepModels }  from './CliStepModels'
import { CliStepSummary } from './CliStepSummary'
import { CliStepVenues }  from './CliStepVenues'

export const profilesPayload = {
  filterType: null,
  pageSize: 9999,
  sortField: 'name',
  sortOrder: 'DESC'
}

const switchListPayload = {
  fields: [
    'check-all', 'name', 'id', 'serialNumber', 'isStack', 'formStacking',
    'venueId', 'switchName', 'model', 'uptime', 'configReady',
    'syncedSwitchConfig', 'operationalWarning', 'venueName', 'deviceStatus'
  ],
  pageSize: 9999
}

export function CliProfileForm () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const linkToProfiles = usePathBasedOnConfigTemplate('/networks/wired/profiles', '')
  const editMode = params.action === 'edit'

  const { isTemplate: isConfigTemplate } = useConfigTemplate()
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const isSwitchLevelCliProfileEnabled = useIsSplitOn(Features.SWITCH_LEVEL_CLI_PROFILE)
  const isCustomizedVariableEnabled = !isConfigTemplate && isSwitchLevelCliProfileEnabled

  const rbacEnabled = isConfigTemplate ? isConfigTemplateRbacEnabled : isSwitchRbacEnabled
  const associateEnabled = isCustomizedVariableEnabled || rbacEnabled

  const [appliedModels, setAppliedModels] = useState({} as unknown as Record<string, string[]>)
  const [allowedSwitchList, setAllowedSwitchList] = useState([] as SwitchViewModel[])
  const [configuredSwitchList, setConfiguredSwitchList] = useState([] as SwitchViewModel[])

  const [form] = Form.useForm()
  const [getProfiles] = useConfigTemplateLazyQueryFnSwitcher({
    useLazyQueryFn: useLazyGetProfilesQuery,
    useLazyTemplateQueryFn: useLazyGetSwitchConfigProfileTemplateListQuery
  })
  const [batchAssociateSwitchConfigProfile] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useBatchAssociateSwitchProfileMutation,
    useTemplateMutationFn: useBatchAssociateSwitchConfigProfileTemplateMutation
  })

  const [batchDisassociateSwitchConfigProfile] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useBatchDisassociateSwitchProfileMutation,
    useTemplateMutationFn: useBatchDisassociateSwitchConfigProfileTemplateMutation
  })

  const [addSwitchConfigProfile] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useAddSwitchConfigProfileMutation,
    useTemplateMutationFn: useAddSwitchConfigProfileTemplateMutation
  })
  const [updateSwitchConfigProfile] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUpdateSwitchConfigProfileMutation,
    useTemplateMutationFn: useUpdateSwitchConfigProfileTemplateMutation
  })
  // eslint-disable-next-line max-len
  const { data: cliProfile, isLoading: isProfileLoading } = useConfigTemplateQueryFnSwitcher<ConfigurationProfile>({
    useQueryFn: useGetSwitchConfigProfileQuery,
    useTemplateQueryFn: useGetSwitchConfigProfileTemplateQuery,
    skip: !editMode,
    enableRbac: isSwitchRbacEnabled,
    extraQueryArgs: {
      enableSwitchLevelCliProfile: isCustomizedVariableEnabled
    }
  })

  const { data: switchList, isLoading: isSwitchLoading } = useGetSwitchListQuery({
    params,
    payload: switchListPayload,
    enableRbac: isSwitchRbacEnabled
  }, {
    skip: !isCustomizedVariableEnabled || isConfigTemplate
  })

  // Config Template related states
  const breadcrumb = useConfigTemplateBreadcrumb([
    { text: $t({ defaultMessage: 'Wired' }) },
    { text: $t({ defaultMessage: 'Wired Network Profiles' }) },
    { text: $t({ defaultMessage: 'Configuration Profiles' }), link: '/networks/wired/profiles' }
  ])
  const pageTitle = useConfigTemplatePageHeaderTitle({
    isEdit: editMode,
    instanceLabel: $t({ defaultMessage: 'CLI Configuration Profile' })
  })

  const transformSaveData = (data: CliConfiguration) => {
    const { name, cli, overwrite, variables } = data
    const customizedSwitchVenues = getCustomizedSwitchVenues(variables, allowedSwitchList)
    const transformedVariables = variables?.map(v => ({
      ...v,
      ...(v?.switchVariables ? {
        switchVariables: v?.switchVariables.map(s => ({
          ...s,
          serialNumbers: isArray(s.serialNumbers) ? s.serialNumbers : [s.serialNumbers]
        }))
      } : {})
    }))

    return {
      name,
      profileType: 'CLI',
      venueCliTemplate: {
        ...data.venueCliTemplate,
        switchModels: data?.models?.toString(),
        name,
        cli,
        overwrite,
        variables: transformedVariables
      },
      venues: _.uniq([
        ...( data?.venues || []),
        ...customizedSwitchVenues
      ])
    }
  }

  const handleEditCliProfile = async (data: CliConfiguration) => {
    try {
      const orinAppliedVenues = cliProfile?.venues as string[]
      const customizedSwitchVenues = getCustomizedSwitchVenues(data?.variables, allowedSwitchList)
      const appliedVenues = _.uniq([
        ...( data?.venues || []),
        ...customizedSwitchVenues
      ])
      const disassociateSwitch = _.difference(orinAppliedVenues, appliedVenues)
      const diffAssociatedSwitch = _.difference(appliedVenues, orinAppliedVenues)

      await disassociateWithCliProfile(disassociateSwitch)
      await updateSwitchConfigProfile({
        params, payload: {
          id: params.profileId,
          ...transformSaveData(data)
        },
        enableRbac: rbacEnabled,
        enableSwitchLevelCliProfile: isCustomizedVariableEnabled
      }).unwrap()
      await associateWithCliProfile(diffAssociatedSwitch)
      navigate(linkToProfiles, { replace: true })

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleAddCliProfile = async (data: CliConfiguration) => {
    try {
      const hasAssociatedVenues = (data?.venues ?? [])?.length > 0
      await addSwitchConfigProfile({
        params, payload: transformSaveData(data),
        enableRbac: rbacEnabled,
        enableSwitchLevelCliProfile: isCustomizedVariableEnabled
      }).unwrap()

      if (associateEnabled && hasAssociatedVenues) {
        const { data: cliProfiles } = await getProfiles({
          params, payload: profilesPayload, enableRbac: true
        }).unwrap()
        const profileId = cliProfiles?.filter(t => t.name === data.name)?.map(t => t.id)?.[0]
        await associateWithCliProfile(data?.venues ?? [], profileId)
      }
      navigate(linkToProfiles, { replace: true })

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const associateWithCliProfile = async (
    venues: string[],
    cliProfileId?: string,
    callBack?: () => void
  ) => {
    const profileId = params.profileId || cliProfileId
    const hasAssociatedVenues = venues.length > 0

    if (associateEnabled && hasAssociatedVenues && profileId) {
      const requests = venues.map((key: string)=> ({
        params: { venueId: key, profileId }
      }))

      await batchAssociateSwitchConfigProfile(requests).then(callBack)
    }
    return Promise.resolve()
  }

  const disassociateWithCliProfile = async (
    venues: string[],
    callBack?: () => void
  ) => {
    const hasDisassociatedVenues = venues.length > 0
    if (associateEnabled && hasDisassociatedVenues) {
      const requests = venues.map((key: string)=> ({
        params: { venueId: key, profileId: params.profileId }
      }))
      await batchDisassociateSwitchConfigProfile(requests).then(callBack)
    }
    return Promise.resolve()
  }

  useEffect(() => {
    if (!isProfileLoading && !isSwitchLoading) {
      const { allowedSwitches, configuredSwitches } = switchList?.data?.reduce((result, s) => {
        s.deviceStatus === SwitchStatusEnum.NEVER_CONTACTED_CLOUD
          ? result.allowedSwitches.push(s)
          : result.configuredSwitches.push(s)
        return result
      }, {
        allowedSwitches: [] as SwitchViewModel[],
        configuredSwitches: [] as SwitchViewModel[]
      }) || { allowedSwitches: [], configuredSwitches: [] }

      const allSwitchSerialNumbers = switchList?.data?.map(s => s.serialNumber)
      const variables = cliProfile?.venueCliTemplate?.variables?.map(v => {
        return {
          ...v,
          ...(v?.switchVariables ? {
            switchVariables: v?.switchVariables.map(s => {
              // remove non-existent exist switch from the settings
              const validSerialNumbers = _.intersection(s.serialNumbers, allSwitchSerialNumbers)
              const serialNumbers
                = v.hasOwnProperty('subMask') ? validSerialNumbers[0] : validSerialNumbers

              return !!validSerialNumbers?.length ? {
                ...s,
                serialNumbers
              } : false
            }).filter(s => s)
          } : {})
        }
      }) ?? []

      const data = {
        ...cliProfile,
        cli: cliProfile?.venueCliTemplate?.cli,
        overwrite: cliProfile?.venueCliTemplate?.overwrite,
        variables,
        models: cliProfile?.venueCliTemplate?.switchModels?.split(',')
      }

      const venueAppliedModels = cliProfile?.venues?.reduce((result, v) => ({
        ...result, [v]: data.models
      }), {}) || {}

      setAllowedSwitchList(allowedSwitches)
      setConfiguredSwitchList(configuredSwitches)
      setAppliedModels(venueAppliedModels)
      form?.setFieldsValue(data)
    }
  }, [cliProfile, isProfileLoading, switchList, isSwitchLoading])

  return (
    <>
      <PageHeader
        title={pageTitle}
        breadcrumb={breadcrumb}
      />

      <Loader states={[{ isLoading: editMode && isProfileLoading }]}>
        <StepsForm
          form={form}
          editMode={editMode}
          initialValues={{
            venues: cliProfile?.venues
          }}
          onCancel={() => navigate(linkToProfiles)}
          onFinish={editMode ? handleEditCliProfile : handleAddCliProfile}
        >
          <StepsForm.StepForm
            name='notice'
            title={$t({ defaultMessage: 'Important Notice' })}
            layout='horizontal'
          >
            <CliStepNotice />
          </StepsForm.StepForm>

          <StepsForm.StepForm
            name='models'
            title={$t({ defaultMessage: 'Models' })}
            onFinish={async (data: CliConfiguration) => {
              if (!data?.models?.length) {
                showToast({
                  type: 'error', duration: 2,
                  content: 'Please select at least one model'
                })
              }
              return true
            }}
          >
            <CliStepModels />
          </StepsForm.StepForm>

          <StepsForm.StepForm
            name='settings'
            title={$t({ defaultMessage: 'CLI Configuration' })}
            onFinish={async (data: CliConfiguration) => {
              if (!data?.cliValid?.valid) {
                showToast({ type: 'error', duration: 2, content: data?.cliValid?.tooltip })
              }
              return true
            }}
          >
            <CliStepConfiguration
              appliedModels={appliedModels}
              allowedSwitchList={allowedSwitchList}
              configuredSwitchList={configuredSwitchList}
            />
          </StepsForm.StepForm>

          <StepsForm.StepForm
            name='venues'
            title={$t({ defaultMessage: '<VenuePlural></VenuePlural>' })}
          >
            <CliStepVenues allSwitchList={[
              ...allowedSwitchList,
              ...configuredSwitchList
            ]} />
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
