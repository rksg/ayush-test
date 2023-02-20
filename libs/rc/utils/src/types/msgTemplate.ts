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