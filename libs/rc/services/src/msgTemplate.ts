import {
  MsgTemplateUrls,
  createHttpRequest,
  TemplateScope,
  RequestPayload,
  Pageable,
  Template,
  Registration,
  TemplateSelectionContent
} from '@acx-ui/rc/utils'

import { baseMsgTemplateApi } from '@acx-ui/store'


export const msgTemplateApi = baseMsgTemplateApi.injectEndpoints({
  endpoints: build => ({
    // Template Scope /////////////////////////////////////
    getTemplateScopeById: build.query<TemplateScope, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MsgTemplateUrls.getTemplateScopeById, params)
        return {
          ...req
        }
      },
      providesTags: (result, error, arg) =>
        [{ type: 'TemplateScope', id: (arg.templateScopeId as string) }]
    }),

    // Templates ///////////////////////////////////////////
    getAllTemplatesByTemplateScopeId: build.query<Pageable<Template>, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MsgTemplateUrls.getAllTemplatesByTemplateScopeId, params)
        return {
          ...req
        }
      },
      providesTags: (result, error, arg) => result && result.content ?
        [...result.content.map(({ id }) => ({ type: 'Template' as const, id })),
          { type: 'Template', id: 'LIST' + arg.templateScopeId }] :
        [{ type: 'Template', id: 'LIST' + arg.templateScopeId }]
    }),

    // Registrations ///////////////////////////////////////
    getRegistrationById: build.query<Registration, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MsgTemplateUrls.getRegistrationById, params)
        return {
          ...req
        }
      },
      providesTags: (result, error, arg) =>
        [{ type: 'TemplateRegistration', id: (arg.registrationId as string) }]
    }),
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
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        
        // get templateScope //
        const templateScopeRequestInfo = {
            ...createHttpRequest(MsgTemplateUrls.getTemplateScopeById, arg.params),
            body: arg.payload
          }
        
        const templateScopeQuery = await fetchWithBQ(templateScopeRequestInfo)
        if(templateScopeQuery.error) {
          return {error: templateScopeQuery.error}
        }
        const templateScope = templateScopeQuery.data as TemplateScope
        let defaultTemplateId = templateScope.defaultTemplateId;

        // get templates //
        const templatesRequestInfo = {
          ...createHttpRequest(MsgTemplateUrls.getAllTemplatesByTemplateScopeId, arg.params),
          body: arg.payload
        }
      
        const templatesQuery = await fetchWithBQ(templatesRequestInfo)
        if(templatesQuery.error) {
          return {error: templatesQuery.error}
        }
        const pageableTemplates = templatesQuery.data as Pageable<Template>
        
        // get registration //
        const registrationRequestInfo = {
          ...createHttpRequest(MsgTemplateUrls.getRegistrationById, arg.params),
          body: arg.payload
        }

        const registrationQuery = await fetchWithBQ(registrationRequestInfo)
        if(registrationQuery.error && registrationQuery.error.status !== 404) {
          return {error: registrationQuery.error}
        } else if(!registrationQuery.error && (registrationQuery.data as Registration).templateId) {
          defaultTemplateId = (registrationQuery.data as Registration).templateId
        }

        // Build response data 
        return {data: 
          {templateScopeType: templateScope.messageType, 
            templateScopeNameKey: templateScope.nameLocalizationKey, 
            defaultTemplateId: defaultTemplateId, 
            templates: pageableTemplates.content 
          }}
      },
      providesTags: (result, error, arg) =>
        [{ type: 'TemplateSelection', id: (arg.templateScopeId as string) }]
    })
  })
})

export const {
  useGetTemplateSelectionContentQuery,
  useGetTemplateScopeByIdQuery,
  useGetAllTemplatesByTemplateScopeIdQuery,
  useGetRegistrationByIdQuery,
  usePutRegistrationByIdMutation
} = msgTemplateApi