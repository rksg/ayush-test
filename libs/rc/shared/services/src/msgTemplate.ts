import {
  MsgTemplateUrls,
  TemplateScope,
  Pageable,
  Template,
  Registration,
  TemplateSelectionContent
} from '@acx-ui/rc/utils'
import { baseMsgTemplateApi } from '@acx-ui/store'
import { RequestPayload }     from '@acx-ui/types'
import { createHttpRequest }  from '@acx-ui/utils'


export const msgTemplateApi = baseMsgTemplateApi.injectEndpoints({
  endpoints: build => ({
    // Registrations ///////////////////////////////////////
    putRegistrationById: build.mutation<Registration, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MsgTemplateUrls.putRegistrationById, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: (result, error, arg) =>
        [{ type: 'TemplateRegistration', id: (arg.registrationId as string) }]
    }),

    // COMPOSITE REQUESTS ///////////////////////////////////
    getTemplateSelectionContent: build.query<TemplateSelectionContent, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {

        // get templateScope //
        const templateScopeRequestInfo = {
          ...createHttpRequest(MsgTemplateUrls.getTemplateScopeById, arg.params),
          body: arg.payload
        }

        const templateScopeQuery = await fetchWithBQ(templateScopeRequestInfo)
        if(templateScopeQuery.error) {
          return { error: templateScopeQuery.error }
        }
        const templateScope = templateScopeQuery.data as TemplateScope
        let defaultTemplateId = templateScope.defaultTemplateId
        // get templates //
        const templatesRequestInfo = {
          ...createHttpRequest(MsgTemplateUrls.getAllTemplatesByTemplateScopeId, arg.params),
          body: arg.payload
        }

        const templatesQuery = await fetchWithBQ(templatesRequestInfo)
        if(templatesQuery.error) {
          return { error: templatesQuery.error }
        }
        const pageableTemplates = templatesQuery.data as Pageable<Template>

        // get registration //
        const registrationRequestInfo = {
          ...createHttpRequest(MsgTemplateUrls.getRegistrationById, arg.params),
          body: arg.payload
        }

        const registrationQuery = await fetchWithBQ(registrationRequestInfo)
        if(registrationQuery.error && registrationQuery.error.status !== 404) {
          return { error: registrationQuery.error }
        } else if(!registrationQuery.error && (registrationQuery.data as Registration).templateId) {

          defaultTemplateId = (registrationQuery.data as Registration).templateId
        }

        // Build response data
        return { data:
          { templateScopeType: templateScope.messageType,
            templateScopeNameKey: templateScope.nameLocalizationKey,
            defaultTemplateId: defaultTemplateId,
            templates: pageableTemplates.content
          } }
      },
      providesTags: (result, error, arg) =>
        [{ type: 'TemplateSelection', id: (arg.templateScopeId as string) },
          { type: 'TemplateRegistration', id: (arg.registrationId as string) }]
    })
  })
})

export const {
  useGetTemplateSelectionContentQuery,
  usePutRegistrationByIdMutation
} = msgTemplateApi