export const mockedTemplates = {
  paging: {
    totalCount: 9,
    page: 0,
    pageSize: 10,
    pageCount: 1
  },
  content: [
    {
      id: '746ac7b2-1ec5-412c-9354-e5ac274b7bd9',
      userProvidedName: 'User Created Template 1',
      messageTemplate: '${owner_name},<br/><br/> A unit has been assigned to you at '
        + '${property_management_name}. You may find the access and other details below.<br/><br/>'
        +'Resident Portal: <a href="${unit_portal_url}">${unit_portal_url_abbreviated}</a>'+
        '<br/><br/> Manager : ${manager_name}.',
      extraFieldOneTemplate: 'Unit Assigned Template One',
      editable: true
    },
    {
      id: '44305c2c-9cb0-48cc-a967-c735e9a8cfbd',
      userProvidedName: 'User Created Template 2',
      messageTemplate: '${owner_name},<br/><br/> A unit has been assigned to you at '
        +'${property_management_name}. You may find the access and other details below.<br/><br/>'
        +'Resident Portal: <a href="${unit_portal_url}">${unit_portal_url_abbreviated}</a>'
        +'<br/><br/> Manager : ${manager_name}.',
      extraFieldOneTemplate: 'Unit Assigned Template Two',
      editable: true
    }
  ]
}

export const mockedRegistration = {
  id: 'selected-registration-id',
  templateId: '44305c2c-9cb0-48cc-a967-c735e9a8cfbd',
  usageLocalizationKey: 'description.of.template.usage'
}

export const mockedTemplateScope = {
  id: '648269aa-23c7-41da-baa4-811e92d89ed1',
  messageType: 'EMAIL',
  nameLocalizationKey: 'unit.assigned.email',
  defaultTemplateId: '746ac7b2-1ec5-412c-9354-e5ac274b7bd9'
}

export const mockedTemplateScopeWithRegistration = {
  id: '648269aa-23c7-41da-baa4-811e92d89ed1',
  messageType: 'EMAIL',
  nameLocalizationKey: 'unit.assigned.email',
  defaultTemplateId: '746ac7b2-1ec5-412c-9354-e5ac274b7bd9',
  registrations: [mockedRegistration]
}

export const mockedTemplateScopeNoDefault = {
  id: '648269aa-23c7-41da-baa4-811e92d89ed1',
  messageType: 'EMAIL',
  nameLocalizationKey: 'unit.assigned.email'
}

export const emailTemplate = {
  id: '746ac7b2-1ec5-412c-9354-e5ac274b7bd9',
  userProvidedName: 'E-Mail Template',
  messageTemplate: '<p>E-Mail Template ${with.variable}.</p>',
  extraFieldOneTemplate: 'Unit Assigned Template One',
  nameLocalizationKey: '',
  editable: true
}

export const smsTemplate = {
  id: '746ac7b2-1ec5-412c-9354-e5ac274b7bd9',
  userProvidedName: 'SMS Template',
  messageTemplate: 'Hi ${user.name}, welcome to Ruckus!',
  extraFieldOneTemplate: 'Unused for SMS templates',
  nameLocalizationKey: '',
  editable: true
}

export const mockedCategoryNoDefault = {
  id: '6341459f-595f-458b-a214-02d6544fa2fa',
  name: 'Mocked Category',
  emailTemplateScopeId: '0ac469cd-de25-4983-a59f-60cc26500597',
  smsTemplateScopeId: 'a15b8dcf-4bc1-4b7e-8715-749b3b38025a'
}

export const mockedCategory = {
  id: '6341459f-595f-458b-a214-02d6544fa2fa',
  name: 'Mocked Category',
  emailTemplateScopeId: '0ac469cd-de25-4983-a59f-60cc26500597',
  smsTemplateScopeId: 'a15b8dcf-4bc1-4b7e-8715-749b3b38025a',
  defaultTemplateGroupId: '5128ee1e-ea44-47fd-944a-78e30385566e'
}

export const mockedTemplateGroups = {
  paging: {
    totalCount: 9,
    page: 0,
    pageSize: 10,
    pageCount: 1
  },
  content: [
    {
      id: '5128ee1e-ea44-47fd-944a-78e30385566e',
      name: 'Template Group 1',
      emailTemplateId: 'f97a6168-fded-465d-803d-89bcc1b42498',
      smsTemplateId: 'ac52effa-2f4f-4774-9256-4c5a726c10ba',
      editable: true
    },
    {
      id: '8267f197-0669-4519-b587-d1dac984f221',
      name: 'Template Group 2',
      emailTemplateId: '44305c2c-9cb0-48cc-a967-c735e9a8cfbd',
      smsTemplateId: 'f62bf568-301f-49b9-8148-0e90c71a4552',
      editable: true
    }
  ]
}