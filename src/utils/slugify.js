// "Calendar of Events" -> "calendar-of-events"
// "CO – PO – PSO mapping & justification" -> "co-po-pso-mapping-justification"
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}