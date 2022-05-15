import React from "react"

interface LineInformation<Meta> {
  success: boolean
  critical: boolean
  message: string
  meta: Meta
}

export interface ExpectationVisualiser<Meta extends Record<string, any> = {}> {
  Title?: React.FC<{ line: LineInformation<Meta> }>
  Body?: React.FC<{ line: LineInformation<Meta> }>
}
