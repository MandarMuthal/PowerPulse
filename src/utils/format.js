export const titleCase = (value) =>
  typeof value === 'string' && value ? value.replace(/\b\w/g, (c) => c.toUpperCase()) : '';

export const sentenceCase = (value) =>
  typeof value === 'string' && value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
