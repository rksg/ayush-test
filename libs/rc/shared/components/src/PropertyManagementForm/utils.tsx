import { FormInstance } from 'antd'

import { usePutRegistrationByIdMutation }                                                               from '@acx-ui/rc/services'
import { AssociatedResource, PropertyConfigs, PropertyConfigStatus, ResidentPortalType, VenueExtended } from '@acx-ui/rc/utils'
import { getIntl }                                                                                      from '@acx-ui/utils'

export const defaultPropertyConfigs: PropertyConfigs = {
  status: PropertyConfigStatus.DISABLED,
  residentPortalType: ResidentPortalType.NO_PORTAL,
  unitConfig: {
    type: 'unitConfig',
    maxUnitCount: 0,
    useMaxUnitCount: false,
    guestAllowed: false,
    residentPortalAllowed: false,
    residentApiAllowed: false
  },
  communicationConfig: {
    type: 'communicationConfig',
    sendEmail: false,
    sendSms: false
  }
}

export const msgCategoryIds = [
  // Unit assigned
  '96672ee0-86df-4819-bca4-3b39ef611e37',
  // Guest Passphrase Reset
  '8817c288-7e8e-4125-8a73-531c205a9e16',
  // Port Assigned
  '4bdc8eb0-864a-4c7d-b99c-157a59520796',
  // Access Reset
  '08c28d2d-5ceb-4b5d-adc4-2c0fb744517e'
]

export const toResidentPortalPayload = (type: ResidentPortalType) => {
  const payload = {
    residentPortalAllowed: false,
    residentApiAllowed: false
  }

  if (type === ResidentPortalType.RUCKUS_PORTAL) {
    payload.residentApiAllowed = true
    payload.residentPortalAllowed = true
  } else if (type === ResidentPortalType.OWN_PORTAL){
    payload.residentApiAllowed = true
  }

  return payload
}

export const getResidentPortalTypeOptions = () => {
  const { $t } = getIntl()
  return [
    {
      value: ResidentPortalType.NO_PORTAL,
      label: $t({ defaultMessage: 'No Resident Portal' })
    },
    {
      value: ResidentPortalType.RUCKUS_PORTAL,
      label: $t({ defaultMessage: 'Use RUCKUS Portal' })
    },
    {
      value: ResidentPortalType.OWN_PORTAL,
      label: $t({ defaultMessage: 'Use Your Own Portal' })
    }
  ]
}

export const getInitialPropertyFormValues = (propertyConfigs: PropertyConfigs | undefined) => {
  if (!propertyConfigs) return defaultPropertyConfigs

  let residentPortalType = ResidentPortalType.NO_PORTAL

  const { unitConfig, residentPortalId } = propertyConfigs

  if (unitConfig) {
    const { residentPortalAllowed = false, residentApiAllowed = false } = unitConfig
    if (residentPortalId) {
      residentPortalType = ResidentPortalType.RUCKUS_PORTAL
    } else {
      if (residentApiAllowed) {
        if (residentPortalAllowed) {
          residentPortalType = ResidentPortalType.RUCKUS_PORTAL
        } else {
          residentPortalType = ResidentPortalType.OWN_PORTAL
        }
      }
    }
  }

  return {
    ...defaultPropertyConfigs,
    ...propertyConfigs,
    residentPortalType
  }
}

export const useRegisterMessageTemplates = () => {
  const [updateRegistration, registrationResult] = usePutRegistrationByIdMutation()

  // eslint-disable-next-line max-len
  const registerMessageTemplates = async (form: FormInstance, venueId: string, venueData: VenueExtended | undefined) => {
    const registerPromises = [...msgCategoryIds]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .flatMap((msgCategoryId):Promise<any>[] => {
        let selectedOption = form.getFieldValue(msgCategoryId)

        if(!selectedOption || selectedOption === '') {
          return [Promise.resolve()]
        }

        // 1 - emailTemplateScopeId 2 - g.emailTemplateId 3 - smsTemplateScopeId 4- g.smsTemplateId,
        let idArray = selectedOption.split(',')

        if(idArray.length < 4) {
          return [Promise.resolve()]
        }

        return [
        // email
          updateRegistration({
            params: {
              templateScopeId: idArray[0],
              associatedResource: AssociatedResource.VENUE,
              associatedResourceId: venueId,
              registrationId: venueId
            },
            payload: {
              id: venueId,
              templateId: idArray[1],
              usageLocalizationKey: 'venue.property.management',
              usageDescriptionFieldOne: venueData?.name ?? venueId,
              usageDescriptionFieldTwo: venueId
            }
          }),
          // sms
          updateRegistration({
            params: {
              templateScopeId: idArray[2],
              associatedResource: AssociatedResource.VENUE,
              associatedResourceId: venueId,
              registrationId: venueId
            },
            payload: {
              id: venueId,
              templateId: idArray[3],
              usageLocalizationKey: 'venue.property.management',
              usageDescriptionFieldOne: venueData?.name ?? venueId,
              usageDescriptionFieldTwo: venueId
            }
          })]

      })

    await Promise.all(registerPromises)
  }

  return { registerMessageTemplates, registrationResult }
}