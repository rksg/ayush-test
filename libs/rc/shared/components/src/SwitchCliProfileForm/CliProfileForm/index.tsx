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
import { Features, useIsSplitOn }             from '@acx-ui/feature-toggle'
import {
  useLazyGetProfilesQuery,
  useGetSwitchConfigProfileQuery,
  useAddSwitchConfigProfileMutation,
  useUpdateSwitchConfigProfileMutation,
  useBatchAssociateSwitchProfileMutation,
  useBatchDisassociateSwitchProfileMutation
} from '@acx-ui/rc/services'
import {
  CliConfiguration
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import { CliStepConfiguration } from '../../SwitchCliTemplateForm/CliTemplateForm/CliStepConfiguration'
import { CliStepNotice }        from '../../SwitchCliTemplateForm/CliTemplateForm/CliStepNotice'

import { CliStepModels }  from './CliStepModels'
import { CliStepSummary } from './CliStepSummary'
import { CliStepVenues }  from './CliStepVenues'

/* eslint-disable max-len */
export const cliFormMessages = {
  OVERLAPPING_MODELS_TOOLTIP: defineMessage({ defaultMessage: 'A CLI configuration profile with overlapping switch models has been applied to this <venueSingular></venueSingular> so it cannot be selected.' }),
  VENUE_STEP_DESP: defineMessage({ defaultMessage: 'The configuration will be applied to all switches of the selected models, as well as any switch that will be added to the <venueSingular></venueSingular> in the future' })
}
/* eslint-enable max-len */

export const profilesPayload = {
  filterType: null,
  pageSize: 9999,
  sortField: 'name',
  sortOrder: 'DESC'
}

export function CliProfileForm () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const linkToNetworks = useTenantLink('/networks/wired/profiles')
  const editMode = params.action === 'edit'
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const [form] = Form.useForm()
  const [getProfiles] = useLazyGetProfilesQuery()
  const [addSwitchConfigProfile] = useAddSwitchConfigProfileMutation()
  const [updateSwitchConfigProfile] = useUpdateSwitchConfigProfileMutation()
  const [batchAssociateSwitchProfile] = useBatchAssociateSwitchProfileMutation()
  const [batchDisassociateSwitchProfile] = useBatchDisassociateSwitchProfileMutation()

  const { data: cliProfile, isLoading: isProfileLoading }
    = useGetSwitchConfigProfileQuery({
      params, enableRbac: isSwitchRbacEnabled
    }, { skip: !editMode })

  const transformSaveData = (data: CliConfiguration) => {
    const { name, cli, overwrite, variables } = data
    return {
      name,
      profileType: 'CLI',
      venueCliTemplate: {
        ...data.venueCliTemplate,
        switchModels: data?.models?.toString(),
        name,
        cli,
        overwrite,
        variables
      },
      venues: data?.venues
    }
  }

  const handleEditCliProfile = async (data: CliConfiguration) => {
    try {
      const orinAppliedVenues = cliProfile?.venues as string[]
      const appliedVenues = data.venues as string[]
      const disassociateSwitch = _.difference(orinAppliedVenues, appliedVenues)
      const diffAssociatedSwitch = _.difference(appliedVenues, orinAppliedVenues)

      await disassociateWithCliProfile(disassociateSwitch)
      await updateSwitchConfigProfile({
        params, payload: {
          id: params.profileId,
          ...transformSaveData(data)
        },
        enableRbac: isSwitchRbacEnabled
      }).unwrap()
      await associateWithCliProfile(diffAssociatedSwitch)
      navigate(linkToNetworks, { replace: true })

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleAddCliProfile = async (data: CliConfiguration) => {
    try {
      const hasAssociatedVenues = (data?.venues ?? [])?.length > 0
      await addSwitchConfigProfile({
        params, payload: transformSaveData(data),
        enableRbac: isSwitchRbacEnabled
      }).unwrap()

      if (isSwitchRbacEnabled && hasAssociatedVenues) {
        const { data: cliProfiles } = await getProfiles({
          params, payload: profilesPayload, enableRbac: isSwitchRbacEnabled
        }).unwrap()
        const profileId = cliProfiles?.filter(t => t.name === data.name)?.map(t => t.id)?.[0]
        await associateWithCliProfile(data?.venues ?? [], profileId)
      }
      navigate(linkToNetworks, { replace: true })

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

    if (isSwitchRbacEnabled && hasAssociatedVenues && profileId) {
      const requests = venues.map((key: string)=> ({
        params: { venueId: key, profileId }
      }))

      await batchAssociateSwitchProfile(requests).then(callBack)
    }
    return Promise.resolve()
  }

  const disassociateWithCliProfile = async (
    venues: string[],
    callBack?: () => void
  ) => {
    const hasDisassociatedVenues = venues.length > 0
    if (isSwitchRbacEnabled && hasDisassociatedVenues) {
      const requests = venues.map((key: string)=> ({
        params: { venueId: key, profileId: params.profileId }
      }))
      await batchDisassociateSwitchProfile(requests).then(callBack)
    }
    return Promise.resolve()
  }

  useEffect(() => {
    if (!isProfileLoading) {
      const data = {
        ...cliProfile,
        cli: cliProfile?.venueCliTemplate?.cli,
        overwrite: cliProfile?.venueCliTemplate?.overwrite,
        variables: cliProfile?.venueCliTemplate?.variables || [],
        models: cliProfile?.venueCliTemplate?.switchModels?.split(',')
      }

      form?.setFieldsValue(data)
    }
  }, [cliProfile])

  return (
    <>
      <PageHeader
        title={editMode
          ? $t({ defaultMessage: 'Edit CLI Configuration Profile' })
          : $t({ defaultMessage: 'Add CLI Configuration Profile' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Wired' }) },
          { text: $t({ defaultMessage: 'Wired Network Profiles' }) },
          {
            text: $t({ defaultMessage: 'Configuration Profiles' }),
            link: '/networks/wired/profiles'
          }
        ]}
      />

      <Loader states={[{ isLoading: editMode && isProfileLoading }]}>
        <StepsForm
          form={form}
          editMode={editMode}
          initialValues={{
            venues: cliProfile?.venues
          }}
          onCancel={() => navigate(linkToNetworks)}
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
            <CliStepConfiguration />
          </StepsForm.StepForm>

          <StepsForm.StepForm
            name='venues'
            title={$t({ defaultMessage: '<VenuePlural></VenuePlural>' })}
          >
            <CliStepVenues />
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
