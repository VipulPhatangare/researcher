/**
 * Clean LaTeX and mathematical notation from text
 * @param {string} text - Text containing LaTeX symbols
 * @returns {string} Cleaned text
 */
export const cleanLatexFromText = (text) => {
  if (!text) return '';
  
  let cleaned = text;
  
  // Replace common LaTeX math delimiters
  cleaned = cleaned.replace(/\$\$([^$]+)\$\$/g, '$1'); // Display math $$...$$
  cleaned = cleaned.replace(/\$([^$]+)\$/g, '$1');     // Inline math $...$
  
  // Replace common LaTeX commands
  cleaned = cleaned.replace(/\\leq/g, '≤');
  cleaned = cleaned.replace(/\\geq/g, '≥');
  cleaned = cleaned.replace(/\\neq/g, '≠');
  cleaned = cleaned.replace(/\\approx/g, '≈');
  cleaned = cleaned.replace(/\\times/g, '×');
  cleaned = cleaned.replace(/\\div/g, '÷');
  cleaned = cleaned.replace(/\\pm/g, '±');
  cleaned = cleaned.replace(/\\infty/g, '∞');
  cleaned = cleaned.replace(/\\alpha/g, 'α');
  cleaned = cleaned.replace(/\\beta/g, 'β');
  cleaned = cleaned.replace(/\\gamma/g, 'γ');
  cleaned = cleaned.replace(/\\delta/g, 'δ');
  cleaned = cleaned.replace(/\\epsilon/g, 'ε');
  cleaned = cleaned.replace(/\\theta/g, 'θ');
  cleaned = cleaned.replace(/\\lambda/g, 'λ');
  cleaned = cleaned.replace(/\\mu/g, 'μ');
  cleaned = cleaned.replace(/\\sigma/g, 'σ');
  cleaned = cleaned.replace(/\\pi/g, 'π');
  
  // Replace fractions \frac{a}{b} with a/b
  cleaned = cleaned.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1/$2)');
  
  // Replace floor function \lfloor x \rfloor with ⌊x⌋
  cleaned = cleaned.replace(/\\lfloor/g, '⌊');
  cleaned = cleaned.replace(/\\rfloor/g, '⌋');
  cleaned = cleaned.replace(/\\lceil/g, '⌈');
  cleaned = cleaned.replace(/\\rceil/g, '⌉');
  
  // Replace subscripts and superscripts (simple cases)
  cleaned = cleaned.replace(/\\text\{([^}]+)\}/g, '$1');
  cleaned = cleaned.replace(/\{\\em\s+([^}]+)\}/g, '$1'); // {\em text}
  
  // Remove remaining curly braces (for grouping)
  cleaned = cleaned.replace(/\{([^}]+)\}/g, '$1');
  
  // Remove backslashes before remaining commands
  cleaned = cleaned.replace(/\\([a-zA-Z]+)/g, '$1');
  
  // Clean up multiple spaces
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  // Trim whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
};

/**
 * Clean abstract specifically for display
 * @param {string} abstract - Abstract text with LaTeX
 * @returns {string} Cleaned abstract
 */
export const cleanAbstract = (abstract) => {
  return cleanLatexFromText(abstract);
};
