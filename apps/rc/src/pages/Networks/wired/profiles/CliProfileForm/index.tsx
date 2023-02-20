import { useEffect, useState, useRef } from 'react'

import _                          from 'lodash'
import { defineMessage, useIntl } from 'react-intl'

import {
  Loader,
  PageHeader,
  showToast,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import {
  useGetSwitchConfigProfileQuery,
  useAddSwitchConfigProfileMutation,
  useUpdateSwitchConfigProfileMutation
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

import { CliStepConfiguration } from '../../onDemandCli/CliTemplateForm/CliStepConfiguration'
import { CliStepNotice }        from '../../onDemandCli/CliTemplateForm/CliStepNotice'
import CliTemplateFormContext   from '../../onDemandCli/CliTemplateForm/CliTemplateFormContext'

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

  const formRef = useRef<StepsFormInstance>()
  const [addSwitchConfigProfile] = useAddSwitchConfigProfileMutation()
  const [updateSwitchConfigProfile] = useUpdateSwitchConfigProfileMutation()
  const { data: cliProfile, isLoading: isProfileLoading }
    = useGetSwitchConfigProfileQuery({ params }, { skip: !editMode })

  const [data, setData] = useState(null as unknown as CliConfiguration | undefined)
  const [applyModels, setApplyModels] = useState([] as string[])
  const [cliValidation, setCliValidation] = useState({ valid: false, tooltip: '' })
  const [initCodeMirror, setInitCodeMirror] = useState(false)
  const [summaryData, setSummaryData] = useState({} as CliConfiguration)

  const transformSaveData = (data: CliConfiguration) => {
    const { name } = data
    return {
      name,
      profileType: 'CLI',
      venueCliTemplate: {
        ..._.omit(data, ['selectedFamily', 'venues']),
        switchModels: data?.models?.toString()
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

  const handleAddCliProfile = async (data: CliConfiguration) => {
    try {
      await addSwitchConfigProfile({
        params, payload: transformSaveData(data)
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
    if (!isProfileLoading) {
      setData({
        ...cliProfile,
        models: cliProfile?.venueCliTemplate?.switchModels?.split(',')
      })
    }
  }, [cliProfile])

  return (
    <>
      <PageHeader
        title={editMode
          ? $t({ defaultMessage: 'Edit CLI Configuration Profile' })
          : $t({ defaultMessage: 'Add CLI Configuration Profile' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Wired Networks' }), link: '/networks/wired/profiles' }
        ]}
      />

      <CliTemplateFormContext.Provider value={{
        data,
        editMode,
        cliValidation,
        setCliValidation,
        applyModels,
        setApplyModels,
        initCodeMirror
      }}>
        <Loader states={[{ isLoading: editMode && isProfileLoading }]}>
          <StepsForm
            formRef={formRef}
            editMode={editMode}
            onCurrentChange={(current) => {
              if (current === 2 && !initCodeMirror) {
                setInitCodeMirror(true)
              }
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
              onFinish={async (data) => {
                setSummaryData({ ...summaryData, ...data })
                if (!data?.models?.length) {
                  showToast({
                    type: 'error', duration: 2,
                    content: 'Please select at least one model'
                  })
                }
                return !!data?.models?.length ?? true
              }}
            >
              <CliStepModels />
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
              <CliStepConfiguration />
            </StepsForm.StepForm>

            <StepsForm.StepForm
              name='venues'
              title={$t({ defaultMessage: 'Venues' })}
              onFinish={async (data) => {
                setSummaryData({ ...summaryData, ...data })
                return true
              }}
            >
              <CliStepVenues />
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