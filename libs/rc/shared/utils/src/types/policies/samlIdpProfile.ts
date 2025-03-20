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
    metadata: string
    authnRequestSignedEnabled: boolean
}

export interface SamlIdpProfileFormType extends SamlIdpProfile {
    responseEncryptionEnabled: boolean
    encryptionCertificateId: string
}