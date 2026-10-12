/* Import templates (Phase 2, requirement 1). Every state has its own route,
 * `#/list/import/<preset>`. The import agent ports the rest of the original
 * `import-spec` (copy, parser, preset files) into this module. */

export const IMPORT_PRESETS = [
  'initial',
  'no-file',
  'selected',
  'invalid-format',
  'invalid-structure',
  'uploading',
  'failure',
  'success',
] as const
export type ImportPreset = (typeof IMPORT_PRESETS)[number]
