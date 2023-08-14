
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
  onMatchResponse: string,
  conditionsCount: number,
  policySetCount: number
}

export interface PrioritizedPolicy {
  policyId: string,
  priority: number
}

export interface RuleTemplate {
  id: string,
  name: string,
  description: string,
  ruleType: RuleType,
  returnType: TemplateReturnType
}

export interface RuleAttribute {
  id: number,
  name: string,
  attributeTextMatch: string,
  attributeType: string,
  description?: string
}

export interface AccessCondition {
  id: string,
  name?: string,
  templateAttributeId: number | null,
  evaluationRule: EvaluationRule,
  policyId?: string,
  templateAttribute?: RuleAttribute
}

export interface CriteriaFormData {
  attributeType: string,
  attributeValue: string,
  when: string,
  start: string,
  end: string
}

export interface EvaluationRule {
  criteriaType: CriteriaOption,
  regexStringCriteria?: string,
  booleanCriteria?: boolean,
  numberCriteria?: number,
  when?: string,
  startTime?: string,
  endTime?: string,
  zoneOffset?: string
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

