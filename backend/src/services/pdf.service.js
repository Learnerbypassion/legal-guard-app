const PDFDocument = require('pdfkit');

/**
 * Sanitize and validate text to ensure proper encoding
 */
function sanitizeText(text) {
  if (!text) return '';
  
  // Convert to string
  let result = String(text);
  
  // Remove any problematic characters that might cause encoding issues
  result = result.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Replace multiple spaces with single space
  result = result.replace(/\s+/g, ' ');
  
  // Trim whitespace
  result = result.trim();
  
  return result;
}

/**
 * Validates and cleans the analysis data
 */
function validateAnalysisData(data) {
  if (!data) return null;
  
  // Helper to extract text from various object structures
  const extractText = (item) => {
    if (!item) return '';
    if (typeof item === 'string') return sanitizeText(item);
    
    if (typeof item === 'object') {
      // Try different property names that might contain the main text
      const textValue = 
        item.clause ||
        item.title ||
        item.advantage ||
        item.disadvantage ||
        item.point ||
        item.text ||
        item.content ||
        item.description ||
        '';
      
      const explanation = item.explanation || item.advice || '';
      
      if (textValue && explanation) {
        return sanitizeText(`${textValue}: ${explanation}`);
      } else if (textValue) {
        return sanitizeText(textValue);
      } else if (explanation) {
        return sanitizeText(explanation);
      }
    }
    
    return '';
  };
  
  return {
    meta: data.meta || {},
    contractType: sanitizeText(data.contractType),
    parties: Array.isArray(data.parties) 
      ? data.parties.map(p => sanitizeText(p)).filter(p => p)
      : [],
    keyDates: Array.isArray(data.keyDates)
      ? data.keyDates.map(d => {
          if (typeof d === 'string') return sanitizeText(d);
          return sanitizeText(`${d.label || d.title || ''}: ${d.date || d.importance || ''}`);
        }).filter(d => d)
      : [],
    summary: Array.isArray(data.summary)
      ? data.summary.map(s => sanitizeText(s)).filter(s => s)
      : (typeof data.summary === 'object' && data.summary
          ? Object.values(data.summary).map(s => sanitizeText(s)).filter(s => s)
          : sanitizeText(data.summary)),
    pros: Array.isArray(data.pros)
      ? data.pros.map(p => extractText(p)).filter(p => p)
      : [],
    cons: Array.isArray(data.cons)
      ? data.cons.map(c => extractText(c)).filter(c => c)
      : [],
    highlightedClauses: Array.isArray(data.highlightedClauses)
      ? data.highlightedClauses.map(c => {
          if (typeof c === 'string') return sanitizeText(c);
          return {
            title: sanitizeText(c.title || c.clause || c.name || ''),
            description: sanitizeText(`${c.text || c.explanation || ''} ${c.example ? `Example: ${c.example}` : ''}`)
          };
        }).filter(c => c.title || (typeof c === 'string' && c))
      : [],
    overallAdvice: sanitizeText(data.overallAdvice || data.advice || ''),
    riskScore: data.riskScore || {},
    filename: sanitizeText(data.meta?.filename || data.filename || 'contract.pdf')
  };
}

/**
 * Generates a formatted PDF report from analysis data
 * @param {Object} analysisData - The analysis result object
 * @param {Buffer} pdfBuffer - Optional original PDF buffer to attach
 * @returns {Promise<Buffer>} PDF file buffer
 */
async function generateAnalysisPDF(analysisData, pdfBuffer = null) {
  return new Promise((resolve, reject) => {
    try {
      // Validate and clean the data
      const cleanData = validateAnalysisData(analysisData);
      
      if (!cleanData) {
        return reject(new Error('Invalid analysis data provided'));
      }

      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true,
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Helper function to safely convert any value to string with proper encoding
      const toString = (val) => {
        return sanitizeText(val);
      };

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('Legal Guardian', { align: 'center' });
      doc.fontSize(14).font('Helvetica').text('Contract Analysis Report', { align: 'center' });
      doc.moveDown(0.5);

      // Horizontal line
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#1B2F4E');
      doc.moveDown(1);

      // Report Info
      const reportDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      doc.fontSize(10).font('Helvetica').text(`Report Generated: ${reportDate}`, { align: 'right' });
      doc.fontSize(10).text(`File: ${cleanData.filename}`, { align: 'right' });
      doc.moveDown(1);

      // Contract Type
      if (cleanData.contractType) {
        doc.fontSize(12).font('Helvetica-Bold').text('Contract Type');
        doc.fontSize(10).font('Helvetica').text(cleanData.contractType);
        doc.moveDown(0.8);
      }

      // Risk Score Section
      if (cleanData.riskScore && (cleanData.riskScore.score !== undefined || cleanData.riskScore.score > 0)) {
        doc.fontSize(12).font('Helvetica-Bold').text('Risk Assessment');
        let riskText = '';
        if (typeof cleanData.riskScore === 'object' && cleanData.riskScore.score !== undefined) {
          const score = cleanData.riskScore.score || 0;
          const label = cleanData.riskScore.label || (score > 70 ? 'HIGH' : score > 40 ? 'MEDIUM' : 'LOW');
          riskText = `Risk Score: ${score}/100 (${label})`;
        } else if (typeof cleanData.riskScore === 'number') {
          const riskLevel = cleanData.riskScore > 70 ? 'HIGH' : cleanData.riskScore > 40 ? 'MEDIUM' : 'LOW';
          riskText = `Risk Score: ${cleanData.riskScore}/100 (${riskLevel})`;
        }
        if (riskText) {
          doc.fontSize(10).font('Helvetica').text(riskText);
        }
        doc.moveDown(0.8);
      }

      // Parties Section
      if (cleanData.parties && cleanData.parties.length > 0) {
        doc.fontSize(12).font('Helvetica-Bold').text('Parties Involved');
        cleanData.parties.forEach((party) => {
          if (party) {
            doc.fontSize(10).font('Helvetica').text(`• ${party}`);
          }
        });
        doc.moveDown(0.8);
      }

      // Key Dates Section
      if (cleanData.keyDates && cleanData.keyDates.length > 0) {
        doc.fontSize(12).font('Helvetica-Bold').text('Key Dates');
        cleanData.keyDates.forEach((date) => {
          if (date) {
            doc.fontSize(10).font('Helvetica').text(`• ${date}`);
          }
        });
        doc.moveDown(0.8);
      }

      // Summary Section
      if (cleanData.summary) {
        doc.fontSize(12).font('Helvetica-Bold').text('Executive Summary');
        const summaryText = Array.isArray(cleanData.summary)
          ? cleanData.summary.join('\n\n')
          : cleanData.summary;
        
        if (summaryText) {
          doc.fontSize(10).font('Helvetica').text(summaryText, { 
            align: 'justify',
            width: 445
          });
        }
        doc.moveDown(0.8);
      }

      // Pros Section
      if (cleanData.pros && cleanData.pros.length > 0) {
        doc.fontSize(12).font('Helvetica-Bold').text('Advantages');
        cleanData.pros.forEach((pro, index) => {
          if (pro) {
            doc.fontSize(10).font('Helvetica').text(`${index + 1}. ${pro}`, {
              align: 'justify',
              indent: 15,
              width: 430
            });
          }
        });
        doc.moveDown(0.8);
      }

      // Cons Section
      if (cleanData.cons && cleanData.cons.length > 0) {
        doc.fontSize(12).font('Helvetica-Bold').text('Disadvantages');
        cleanData.cons.forEach((con, index) => {
          if (con) {
            doc.fontSize(10).font('Helvetica').text(`${index + 1}. ${con}`, {
              align: 'justify',
              indent: 15,
              width: 430
            });
          }
        });
        doc.moveDown(0.8);
      }

      // Highlighted Clauses Section
      if (cleanData.highlightedClauses && cleanData.highlightedClauses.length > 0) {
        doc.fontSize(12).font('Helvetica-Bold').text('Important Clauses to Review');
        cleanData.highlightedClauses.forEach((clause, index) => {
          const clauseTitle = typeof clause === 'string' ? clause : clause.title;
          const clauseDesc = typeof clause === 'object' ? clause.description : '';
          
          if (clauseTitle) {
            doc.fontSize(10).font('Helvetica-Bold').text(`${index + 1}. ${clauseTitle}`);
            if (clauseDesc) {
              doc.fontSize(9).font('Helvetica').text(clauseDesc, {
                align: 'justify',
                indent: 15,
                width: 430
              });
            }
          }
        });
        doc.moveDown(0.8);
      }

      // Overall Advice Section
      if (cleanData.overallAdvice) {
        doc.fontSize(12).font('Helvetica-Bold').text('Recommendations');
        doc.fontSize(10).font('Helvetica').text(cleanData.overallAdvice, { 
          align: 'justify',
          width: 445
        });
        doc.moveDown(0.8);
      }

      // Footer
      doc.fontSize(8).font('Helvetica').text(
        'This report is generated for informational purposes only. Please consult with a legal professional before making decisions.',
        {
          align: 'center',
          color: '#666666',
        }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateAnalysisPDF };
