// Message Template Service Types

export interface TemplateScope {
    id: string,
    messageType: MessageType,
    nameLocalizationKey: string,
    defaultTemplateId: string
}

export enum MessageType {
    EMAIL = 'EMAIL',
    SMS = 'SMS',
    WEBPUSH = 'WEBPUSH'
}

export interface Registration {
    id: string,
    templateId: string,
    usageLocalizationKey: string,
    usageDescriptionFieldOne: string,
    usageDescriptionFieldTwo: string
}

export interface Template {
    id: string,
    nameLocalizationKey: string,
    userProvidedName: string,
    messageTemplate: string,
    extraFieldOneTemplate: string,
    editable: boolean
}

export interface Pageable<CONTENT> {
    paging: PageData,
    content: Array<CONTENT>
}

interface PageData {
    totalCount: Number,
    page: Number,
    pageSize: Number,
    pageCount: Number
}

export interface TemplateSelectionContent {
  templateScopeType: MessageType,
  templateScopeNameKey: string,
  defaultTemplateId: string,
  templates: Array<Template>
}