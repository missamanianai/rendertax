export type TranscriptType = "wage_income" | "record_account" | "account_transcript" | "unknown"

export type ProcessingStatus = "pending" | "processing" | "processed" | "error"

export type ValidationErrorType =
  | "ssn_mismatch"
  | "blank_document"
  | "file_corruption"
  | "redacted_document"
  | "unknown"

export type ValidationWarningType = "name_mismatch" | "unknown"

export interface ValidationError {
  type: ValidationErrorType
  message: string
}

export interface ValidationWarning {
  type: ValidationWarningType
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface TranscriptMetadata {
  transcriptType?: TranscriptType
  taxYear?: number
  lastFourSSN?: string
  taxpayerName?: string
}

export interface TranscriptFile {
  id: string
  fileName: string
  fileUrl: string
  fileSize: number
  transcriptType: TranscriptType
  taxYear: number | null
  processingStatus: ProcessingStatus
  validationErrors: ValidationError[]
  validationWarnings: ValidationWarning[]
}
