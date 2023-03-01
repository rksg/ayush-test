export const mockedTemplateScope = {
    "id": "648269aa-23c7-41da-baa4-811e92d89ed1",
    "messageType": "EMAIL",
    "nameLocalizationKey": "unit.assigned.email",
    "defaultTemplateId": "746ac7b2-1ec5-412c-9354-e5ac274b7bd9"
}

export const mockedTemplateScopeNoDefault = {
    "id": "648269aa-23c7-41da-baa4-811e92d89ed1",
    "messageType": "EMAIL",
    "nameLocalizationKey": "unit.assigned.email"
}

export const mockedTemplates = {
    "paging": {
        "totalCount": 9,
        "page": 0,
        "pageSize": 10,
        "pageCount": 1
    },
    "content": [
        {
            "id": "746ac7b2-1ec5-412c-9354-e5ac274b7bd9",
            "userProvidedName": "User Created Template 1",
            "messageTemplate": "${owner_name},<br/><br/> A unit has been assigned to you at ${property_management_name}. You may find the access and other details below.<br/><br/>Resident Portal: <a href=\"${unit_portal_url}\">${unit_portal_url_abbreviated}</a><br/><br/> Manager : ${manager_name}.",
            "extraFieldOneTemplate": "Unit Assigned",
            "editable": true,
        },
        {
            "id": "44305c2c-9cb0-48cc-a967-c735e9a8cfbd",
            "userProvidedName": "User Created Template 2",
            "messageTemplate": "${owner_name},<br/><br/> A unit has been assigned to you at ${property_management_name}. You may find the access and other details below.<br/><br/>Resident Portal: <a href=\"${unit_portal_url}\">${unit_portal_url_abbreviated}</a><br/><br/> Manager : ${manager_name}.",
            "extraFieldOneTemplate": "Unit Assigned",
            "editable": true,
        }
    ]
}

export const mockedRegistration = {
    id: "selected-registration-id",
    templateId: "44305c2c-9cb0-48cc-a967-c735e9a8cfbd",
    usageLocalizationKey: "description.of.template.usage"
}

// export const mockedAps = {
//     fields: [
//       'serialNumber',
//       'apMac',
//       'venueId',
//       'name'
//     ],
//     totalCount: 1,
//     page: 1,
//     data: [
//       {
//         serialNumber: '121749001049',
//         name: 'Jacky-R610',
//         venueId: 'd6062edbdf57451facb33967c2160c72',
//         apMac: 'D8:38:FC:36:76:F0'
//       },
//       {
//         serialNumber: '121749001050',
//         name: 'Jacky-R610-2',
//         venueId: 'd6062edbdf57451facb33967c2160c72',
//         apMac: 'D8:38:FC:36:76:F1'
//       }
//     ]
//   }
