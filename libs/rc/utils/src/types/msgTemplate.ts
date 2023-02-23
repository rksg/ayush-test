// Message Template Service Types

export interface TemplateScope {
    id: string,
    messageType: MessageType,
    nameLocalizationKey: string
}

enum MessageType {
    EMAIL = "EMAIL",
    SMS = "SMS",
    WEBPUSH = "WEBPUSH"
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