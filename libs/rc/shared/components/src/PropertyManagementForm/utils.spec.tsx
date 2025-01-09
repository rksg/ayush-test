/* eslint-disable max-len */
import { ReactNode } from 'react'

import { Form, FormInstance } from 'antd'
import { cloneDeep }          from 'lodash'
import { rest }               from 'msw'

import { AssociatedResource, MsgTemplateUrls, ResidentPortalType, VenueExtended } from '@acx-ui/rc/utils'
import { Provider }                                                               from '@acx-ui/store'
import { mockServer, renderHook }                                                 from '@acx-ui/test-utils'

import { mockEnabledNoPinPropertyConfig } from './__tests__/fixtures'
import {
  getInitialPropertyFormValues,
  defaultPropertyConfigs,
  toResidentPortalPayload,
  useRegisterMessageTemplates,
  msgCategoryIds
} from './utils'

describe('toResidentPortalPayload', () => {
  it('should return payload with residentPortalAllowed and residentApiAllowed set to false when type is NO_PORTAL', () => {
    const payload = toResidentPortalPayload(ResidentPortalType.NO_PORTAL)
    expect(payload.residentPortalAllowed).toBe(false)
    expect(payload.residentApiAllowed).toBe(false)
  })

  it('should return payload with residentPortalAllowed and residentApiAllowed set to true when type is RUCKUS_PORTAL', () => {
    const payload = toResidentPortalPayload(ResidentPortalType.RUCKUS_PORTAL)
    expect(payload.residentPortalAllowed).toBe(true)
    expect(payload.residentApiAllowed).toBe(true)
  })

  it('should return payload with residentApiAllowed set to true and residentPortalAllowed set to false when type is OWN_PORTAL', () => {
    const payload = toResidentPortalPayload(ResidentPortalType.OWN_PORTAL)
    expect(payload.residentPortalAllowed).toBe(false)
    expect(payload.residentApiAllowed).toBe(true)
  })
})

describe('getInitialPropertyFormValues', () => {
  it('should return defaultPropertyConfigs when propertyConfigs is undefined', () => {
    const result = getInitialPropertyFormValues(undefined)
    expect(result).toEqual(defaultPropertyConfigs)
  })

  it('should set residentPortalType to RUCKUS_PORTAL when residentPortalId is present', () => {
    const result = getInitialPropertyFormValues(mockEnabledNoPinPropertyConfig)
    expect(result.residentPortalType).toEqual(ResidentPortalType.RUCKUS_PORTAL)
  })

  it('should set residentPortalType to RUCKUS_PORTAL when residentApiAllowed is true and residentPortalAllowed is true', () => {
    const mockData = cloneDeep(mockEnabledNoPinPropertyConfig)
    mockData.unitConfig!.residentApiAllowed = true
    mockData.unitConfig!.residentPortalAllowed = true

    const result = getInitialPropertyFormValues(mockData)
    expect(result.residentPortalType).toEqual(ResidentPortalType.RUCKUS_PORTAL)
  })

  it('should set residentPortalType to NO_PORTAL when unitConfig is undefined', () => {
    const mockData = cloneDeep(mockEnabledNoPinPropertyConfig)
    mockData.unitConfig = undefined

    const result = getInitialPropertyFormValues(mockData)
    expect(result.residentPortalType).toEqual(ResidentPortalType.NO_PORTAL)
  })

  describe('residentPortalId is undefined', () => {
    const mockNoResidentPortal = cloneDeep(mockEnabledNoPinPropertyConfig)
    mockNoResidentPortal.residentPortalId = undefined

    it('should set residentPortalType to OWN_PORTAL when residentApiAllowed is true and residentPortalAllowed is false', () => {
      const mockData = cloneDeep(mockNoResidentPortal)
      mockData.unitConfig!.residentApiAllowed = true
      mockData.unitConfig!.residentPortalAllowed = false

      const result = getInitialPropertyFormValues(mockData)
      expect(result.residentPortalType).toEqual(ResidentPortalType.OWN_PORTAL)
    })

    it('should set residentPortalType to NO_PORTAL when residentApiAllowed is false', () => {
      const mockData = cloneDeep(mockNoResidentPortal)
      mockData.unitConfig!.residentApiAllowed = false

      const result = getInitialPropertyFormValues(mockData)
      expect(result.residentPortalType).toEqual(ResidentPortalType.NO_PORTAL)
    })
  })
})


describe('useRegisterMessageTemplates', () => {
  const mockVenueData = {
    name: 'Test Venue',
    id: 'test-venue-id'
  } as VenueExtended
  const mockVenueId = mockVenueData.id as string

  const getMockWrapper = (form: FormInstance) => ({ children }: { children: ReactNode }) => {
    return <Provider>
      <Form form={form}>
        {children}
      </Form>
    </Provider>
  }

  const mockUpdateRegistration = jest.fn()

  beforeEach(() => {
    mockUpdateRegistration.mockClear()

    mockServer.use(
      rest.put(
        MsgTemplateUrls.putRegistrationById.url,
        (req, res, ctx) => {
          mockUpdateRegistration(req.params, req.body)
          return res(ctx.status(202))
        }
      ))
  })

  it('should not call updateRegistration if form value is empty', async () => {
    const { result: { current: [mockForm] } } = renderHook(() => Form.useForm())
    const { result } = renderHook(() => useRegisterMessageTemplates(), {
      wrapper: getMockWrapper(mockForm)
    })
    // render(<MockComponent form={mockForm} />)

    await result.current.registerMessageTemplates(mockForm, mockVenueId, mockVenueData)

    expect(mockUpdateRegistration).not.toHaveBeenCalled()
  })

  it('should not call updateRegistration if form value is not in the correct format', async () => {
    const { result: { current: [mockForm] } } = renderHook(() => Form.useForm())
    jest.spyOn(mockForm, 'getFieldValue').mockReturnValue('invalid-value')

    const { result } = renderHook(() => useRegisterMessageTemplates(), {
      wrapper: getMockWrapper(mockForm)
    })
    await result.current.registerMessageTemplates(mockForm, mockVenueId, mockVenueData)

    expect(mockUpdateRegistration).not.toHaveBeenCalled()
  })

  it('should call updateRegistration with correct params and payload', async () => {
    const { result: { current: [mockForm] } } = renderHook(() => Form.useForm())
    const mockIdArray = ['mock_emailTemplateScopeId', 'mock_emailTemplateId', 'mock_smsTemplateScopeId', 'mock_smsTemplateId']
    jest.spyOn(mockForm, 'getFieldValue').mockReturnValue(mockIdArray.join(','))
    const { result } = renderHook(() => useRegisterMessageTemplates(), {
      wrapper: getMockWrapper(mockForm)
    })
    await result.current.registerMessageTemplates(mockForm, mockVenueId, mockVenueData)

    msgCategoryIds.forEach(msgCategoryId => {
      expect(mockForm.getFieldValue).toBeCalledWith(msgCategoryId)

      // email
      expect(mockUpdateRegistration).toHaveBeenCalledWith({
        templateScopeId: mockIdArray[0],
        associatedResource: AssociatedResource.VENUE,
        associatedResourceId: mockVenueId,
        registrationId: mockVenueId
      }, {
        id: mockVenueId,
        templateId: mockIdArray[1],
        usageLocalizationKey: 'venue.property.management',
        usageDescriptionFieldOne: mockVenueData.name,
        usageDescriptionFieldTwo: mockVenueId })
      // sms
      expect(mockUpdateRegistration).toHaveBeenCalledWith({
        templateScopeId: mockIdArray[2],
        associatedResource: AssociatedResource.VENUE,
        associatedResourceId: mockVenueId,
        registrationId: mockVenueId
      }, {
        id: mockVenueId,
        templateId: mockIdArray[3],
        usageLocalizationKey: 'venue.property.management',
        usageDescriptionFieldOne: mockVenueData.name,
        usageDescriptionFieldTwo: mockVenueId
      })
    })
  })
})