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