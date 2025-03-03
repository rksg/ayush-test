export interface SamlIdpProfileViewData {
    id: string
    name: string
    authnRequestSignedEnabled: boolean
    responseEncryptionEnabled: boolean
    encryptionCertificateId: string
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