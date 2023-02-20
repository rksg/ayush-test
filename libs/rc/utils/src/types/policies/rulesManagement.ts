export interface AdaptivePolicySet {
  id: string,
  name: string,
  description: string
}

export interface AdaptivePolicy {
  id: string,
  name: string,
  description: string,
  policyType: string,
  onMatchResponse: string
}

export interface RuleTemplate {
  id: string,
  name: string,
  description: string,
  ruleType: RuleType,
  returnType: TemplateReturnType
}

export interface RuleAttribute {
  id: string,
  name: string,
  attributeTextMatch: string,
  attributeType: string
}

export interface AccessCondition {
  id: string,
  name?: string,
  templateAttributeId: number | null,
  evaluationRule: EvaluationRule,
  policyId?: string
}

export interface EvaluationRule {
  criteriaType: string,
  regexStringCriteria: string
}

export enum RuleType {
  RADIUS = 'RADIUS',
  DPSK = 'DPSK'
}

export enum TemplateReturnType {
  NONE = 'NONE',
  RADIUS_ATTRIB_GROUP = 'RADIUS_ATTRIB_GROUP'
}

export enum CriteriaOption {
  BOOLEAN = 'BooleanCriteria',
  STRING = 'StringCriteria',
  NUMBER = 'NumberCriteria',
  DATE_RANGE = 'DateRangeCriteria'
}

