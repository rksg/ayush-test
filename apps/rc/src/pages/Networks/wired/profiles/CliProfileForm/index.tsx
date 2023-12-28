import { useEffect } from 'react'

import { Form }                   from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import {
  Loader,
  PageHeader,
  showToast,
  StepsForm
} from '@acx-ui/components'
import {
  useGetSwitchConfigProfileQuery,
  useAddSwitchConfigProfileMutation,
  useUpdateSwitchConfigProfileMutation
} from '@acx-ui/rc/services'
import {
  CliConfiguration
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import { CliStepConfiguration } from '../../onDemandCli/CliTemplateForm/CliStepConfiguration'
import { CliStepNotice }        from '../../onDemandCli/CliTemplateForm/CliStepNotice'

import { CliStepModels }  from './CliStepModels'
import { CliStepSummary } from './CliStepSummary'
import { CliStepVenues }  from './CliStepVenues'

/* eslint-disable max-len */
export const cliFormMessages = {
  OVERLAPPING_MODELS_TOOLTIP: defineMessage({ defaultMessage: 'A CLI configuration profile with overlapping switch models has been applied to this venue so it cannot be selected.' }),
  VENUE_STEP_DESP: defineMessage({ defaultMessage: 'The configuration will be applied to all switches of the selected models, as well as any switch that will be added to the venue in the future' })
}
/* eslint-enable max-len */

export default function CliProfileForm () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const linkToNetworks = useTenantLink('/networks/wired/profiles')
  const editMode = params.action === 'edit'

  const [form] = Form.useForm()
  const [addSwitchConfigProfile] = useAddSwitchConfigProfileMutation()
  const [updateSwitchConfigProfile] = useUpdateSwitchConfigProfileMutation()
  const { data: cliProfile, isLoading: isProfileLoading }
    = useGetSwitchConfigProfileQuery({ params }, { skip: !editMode })

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
      await updateSwitchConfigProfile({
        params, payload: {
          id: params.profileId,
          ...transformSaveData(data)
        }
      }).unwrap()
      navigate(linkToNetworks, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleAddCliProfile = async (data: CliConfiguration) => {
    try {
      await addSwitchConfigProfile({
        params, payload: transformSaveData(data)
      }).unwrap()
      navigate(linkToNetworks, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
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
            title={$t({ defaultMessage: 'Venues' })}
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
