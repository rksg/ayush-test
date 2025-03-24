export interface SamlIdpProfileViewData {
    id: string
    name: string
    signingCertificateEnabled: boolean
    signingCertificateId?: string
    encryptionCertificateEnabled: boolean
    encryptionCertificateId?: string
    wifiNetworkIds: string[]
}

export interface SamlIdpProfile {
    id: string
    name: string
    metadata: string,
    metadataUrl: string
}

export interface SamlIdpProfileFormType extends SamlIdpProfile {
    encryptionCertificateEnabled: boolean
    encryptionCertificateId?: string
    signingCertificateEnabled: boolean
    signingCertificateId?: string
    metadataContent?: string // store The content converted from base64 format
    wifiNetworkIds: string[]
}