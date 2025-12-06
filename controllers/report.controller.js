import PDFDocument from 'pdfkit';
import ResearchSession from '../models/ResearchSession.model.js';

/**
 * Generate comprehensive PDF report for research session (Phases 1-6 only)
 */
export const generatePDFReport = async (req, res) => {
  try {
    const { chatId } = req.params;

    // Fetch session data
    const session = await ResearchSession.findOne({ chatId });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Research session not found'
      });
    }

    // Check if Phase 6 is completed
    if (session.phases.phase6.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Phase 6 must be completed before generating report'
      });
    }

    // Create PDF document
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4',
      bufferPages: true
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Research_Report_${chatId.slice(0, 8)}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // ========== COVER PAGE ==========
    doc.fontSize(28).font('Helvetica-Bold').fillColor('#1a365d')
       .text('Research Analysis Report', { align: 'center' });
    
    doc.moveDown();
    doc.fontSize(12).font('Helvetica').fillColor('#4a5568')
       .text(`Session ID: ${chatId.slice(0, 8)}`, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    
    doc.moveDown(3);
    doc.fontSize(14).fillColor('#2d3748')
       .text('Problem Statement:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#000000')
       .text(session.originalInput, { align: 'justify' });

    // ========== PHASE 1: PROMPT ENHANCEMENT ==========
    doc.addPage();
    addPhaseHeader(doc, 1, 'Prompt Enhancement & Topic Refinement');
    
    if (session.refinedProblem) {
      doc.fontSize(12).fillColor('#2d3748').text('Refined Problem Statement:', { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor('#000000').text(session.refinedProblem, { align: 'justify' });
      doc.moveDown();
    }

    if (session.subtopics && session.subtopics.length > 0) {
      doc.fontSize(12).fillColor('#2d3748').text(`Research Subtopics (${session.subtopics.length}):`, { underline: true });
      doc.moveDown(0.5);
      
      session.subtopics.forEach((subtopic, index) => {
        doc.fontSize(11).fillColor('#1a365d').text(`${index + 1}. ${subtopic.title}`, { continued: false });
        if (subtopic.description) {
          doc.fontSize(9).fillColor('#4a5568').text(`   ${subtopic.description}`, { align: 'justify' });
        }
        doc.moveDown(0.5);
      });
    }

    // ========== PHASE 2: RESEARCH DISCOVERY ==========
    if (doc.y > 650) doc.addPage();
    addPhaseHeader(doc, 2, 'Research Discovery - Academic Papers');
    
    if (session.papers && session.papers.length > 0) {
      doc.fontSize(12).fillColor('#2d3748').text(`Total Papers Found: ${session.papers.length}`, { underline: true });
      doc.moveDown();

      session.papers.slice(0, 15).forEach((paper, index) => {
        doc.fontSize(11).fillColor('#1a365d').font('Helvetica-Bold')
           .text(`${index + 1}. ${paper.title || 'Untitled'}`, { continued: false });
        
        doc.fontSize(9).fillColor('#4a5568').font('Helvetica');
        if (paper.authors && paper.authors.length > 0) {
          doc.text(`Authors: ${paper.authors.slice(0, 3).join(', ')}${paper.authors.length > 3 ? ' et al.' : ''}`, { indent: 20 });
        }
        
        if (paper.year) {
          doc.text(`Year: ${paper.year}`, { indent: 20 });
        }

        if (paper.semanticScorePercent) {
          doc.text(`Relevance Score: ${paper.semanticScorePercent}%`, { indent: 20 });
        }

        if (paper.abstract) {
          doc.fontSize(9).fillColor('#000000')
             .text(paper.abstract.substring(0, 300) + '...', { align: 'justify', indent: 20 });
        }

        doc.moveDown(0.8);

        // Add page break only if very close to bottom
        if (doc.y > 720 && index < session.papers.slice(0, 15).length - 1) {
          doc.addPage();
        }
      });
    } else {
      doc.fontSize(10).fillColor('#718096').text('No papers found in this phase.');
    }

    // ========== PHASE 3: ANALYSIS & SYNTHESIS ==========
    if (doc.y > 650) doc.addPage();
    addPhaseHeader(doc, 3, 'Deep Analysis & Synthesis');
    
    const analyzedPapers = session.papers.filter(p => p.summary || p.methodology);
    
    if (analyzedPapers.length > 0) {
      doc.fontSize(12).fillColor('#2d3748').text(`Papers Analyzed: ${analyzedPapers.length}`, { underline: true });
      doc.moveDown();

      analyzedPapers.slice(0, 10).forEach((paper, index) => {
        doc.fontSize(11).fillColor('#1a365d').font('Helvetica-Bold')
           .text(`${index + 1}. ${paper.title || 'Untitled'}`, { continued: false });
        
        doc.fontSize(9).fillColor('#4a5568').font('Helvetica');
        
        if (paper.summary) {
          doc.text('Summary:', { underline: true, indent: 20 });
          doc.fontSize(9).fillColor('#000000').text(paper.summary, { align: 'justify', indent: 20 });
          doc.moveDown(0.3);
        }

        if (paper.methodology) {
          doc.fontSize(9).fillColor('#4a5568').text('Methodology:', { underline: true, indent: 20 });
          doc.fontSize(9).fillColor('#000000').text(paper.methodology, { align: 'justify', indent: 20 });
          doc.moveDown(0.3);
        }

        if (paper.algorithmsUsed && paper.algorithmsUsed.length > 0) {
          doc.fontSize(9).fillColor('#4a5568').text(`Algorithms: ${paper.algorithmsUsed.join(', ')}`, { indent: 20 });
        }

        doc.moveDown(0.8);

        if (doc.y > 700 && index < analyzedPapers.slice(0, 10).length - 1) {
          doc.addPage();
        }
      });
    } else {
      doc.fontSize(10).fillColor('#718096').text('No analyzed papers available.');
    }

    // ========== PHASE 4: RESEARCH ANALYSIS ==========
    if (doc.y > 650) doc.addPage();
    addPhaseHeader(doc, 4, 'Methodology & Technology Analysis');
    
    if (session.phase4Analysis) {
      const analysis = session.phase4Analysis;

      if (analysis.mostCommonMethodologies && analysis.mostCommonMethodologies.length > 0) {
        doc.fontSize(12).fillColor('#2d3748').text('Most Common Methodologies:', { underline: true });
        doc.moveDown(0.5);
        analysis.mostCommonMethodologies.forEach((method, index) => {
          doc.fontSize(10).fillColor('#1a365d').text(`${index + 1}. ${method.title || method}`, { continued: false });
          if (method.description) {
            doc.fontSize(9).fillColor('#4a5568').text(`   ${method.description}`, { align: 'justify' });
          }
          doc.moveDown(0.4);
        });
        doc.moveDown();
      }

      if (analysis.technologyOrAlgorithms && analysis.technologyOrAlgorithms.length > 0) {
        doc.fontSize(12).fillColor('#2d3748').text('Technologies & Algorithms:', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#000000').list(analysis.technologyOrAlgorithms.slice(0, 20));
        doc.moveDown();
      }

      if (analysis.datasetsUsed && analysis.datasetsUsed.length > 0) {
        doc.fontSize(12).fillColor('#2d3748').text('Datasets Used:', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#000000').list(analysis.datasetsUsed.slice(0, 15));
        doc.moveDown();
      }

      if (analysis.uniqueOrLessCommonApproaches && analysis.uniqueOrLessCommonApproaches.length > 0) {
        doc.fontSize(12).fillColor('#2d3748').text('Unique & Innovative Approaches:', { underline: true });
        doc.moveDown(0.5);
        analysis.uniqueOrLessCommonApproaches.forEach((approach, index) => {
          doc.fontSize(10).fillColor('#1a365d').text(`${index + 1}. ${approach.title || approach}`, { continued: false });
          if (approach.description) {
            doc.fontSize(9).fillColor('#4a5568').text(`   ${approach.description}`, { align: 'justify' });
          }
          doc.moveDown(0.4);
        });
      }
    } else {
      doc.fontSize(10).fillColor('#718096').text('Analysis data not available.');
    }

    // ========== PHASE 5: EXISTING SOLUTIONS ==========
    if (doc.y > 650) doc.addPage();
    addPhaseHeader(doc, 5, 'Existing Solutions & Tools');
    
    if (session.phase5Solutions && session.phase5Solutions.length > 0) {
      doc.fontSize(12).fillColor('#2d3748').text(`Solutions Identified: ${session.phase5Solutions.length}`, { underline: true });
      doc.moveDown();

      session.phase5Solutions.forEach((solution, index) => {
        doc.fontSize(11).fillColor('#1a365d').font('Helvetica-Bold')
           .text(`${index + 1}. ${solution.title || 'Untitled Solution'}`, { continued: false });
        
        doc.fontSize(9).fillColor('#000000').font('Helvetica');
        
        if (solution.summary) {
          doc.text(solution.summary, { align: 'justify', indent: 20 });
          doc.moveDown(0.3);
        }

        if (solution.features && solution.features.length > 0) {
          doc.fontSize(9).fillColor('#4a5568').text('Key Features:', { indent: 20 });
          solution.features.slice(0, 5).forEach(feature => {
            doc.fontSize(8).fillColor('#000000').text(`• ${feature}`, { indent: 30 });
          });
          doc.moveDown(0.3);
        }

        if (solution.targetUsers) {
          doc.fontSize(9).fillColor('#4a5568').text(`Target Users: ${solution.targetUsers}`, { indent: 20 });
        }

        if (solution.platformType) {
          doc.fontSize(9).fillColor('#4a5568').text(`Platform: ${solution.platformType}`, { indent: 20 });
        }

        doc.moveDown(0.8);

        if (doc.y > 700 && index < session.phase5Solutions.length - 1) {
          doc.addPage();
        }
      });

      if (session.phase5Notes) {
        doc.moveDown();
        doc.fontSize(11).fillColor('#2d3748').text('Additional Notes:', { underline: true });
        doc.fontSize(9).fillColor('#000000').text(session.phase5Notes, { align: 'justify' });
      }
    } else {
      doc.fontSize(10).fillColor('#718096').text('No existing solutions identified.');
    }

    // ========== PHASE 6: BEST SOLUTION ==========
    if (doc.y > 650) doc.addPage();
    addPhaseHeader(doc, 6, 'Recommended Best Solution');
    
    if (session.phase6Solution) {
      const solution = session.phase6Solution;

      if (solution.proposedSolution) {
        doc.fontSize(12).fillColor('#2d3748').text('Proposed Solution:', { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(10).fillColor('#000000').text(solution.proposedSolution, { align: 'justify' });
        doc.moveDown();
      }

      if (solution.problemUnderstanding) {
        doc.fontSize(12).fillColor('#2d3748').text('Problem Understanding:', { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(10).fillColor('#000000').text(solution.problemUnderstanding, { align: 'justify' });
        doc.moveDown();
      }

      if (solution.solutionArchitecture && solution.solutionArchitecture.length > 0) {
        doc.fontSize(12).fillColor('#2d3748').text('Solution Architecture:', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#000000').list(solution.solutionArchitecture);
        doc.moveDown();
      }

      if (solution.implementationWorkflow && solution.implementationWorkflow.length > 0) {
        doc.fontSize(12).fillColor('#2d3748').text('Implementation Workflow:', { underline: true });
        doc.moveDown(0.5);
        solution.implementationWorkflow.forEach((phase, index) => {
          doc.fontSize(10).fillColor('#1a365d').text(`Phase ${index + 1}: ${phase.phaseTitle || 'Step'}`, { underline: true });
          if (phase.steps && phase.steps.length > 0) {
            doc.fontSize(9).fillColor('#000000').list(phase.steps);
          }
          doc.moveDown(0.5);
        });
      }

      if (doc.y > 700) doc.addPage();

      if (solution.recommendedTechStack && solution.recommendedTechStack.length > 0) {
        doc.fontSize(12).fillColor('#2d3748').text('Recommended Tech Stack:', { underline: true });
        doc.moveDown(0.5);
        solution.recommendedTechStack.forEach(stack => {
          doc.fontSize(10).fillColor('#1a365d').text(stack.title || 'Category', { underline: true });
          if (stack.items && stack.items.length > 0) {
            doc.fontSize(9).fillColor('#000000').list(stack.items);
          }
          doc.moveDown(0.5);
        });
      }

      if (solution.scoringByFactors && solution.scoringByFactors.length > 0) {
        doc.fontSize(12).fillColor('#2d3748').text('Scoring by Factors:', { underline: true });
        doc.moveDown(0.5);
        solution.scoringByFactors.forEach(score => {
          doc.fontSize(10).fillColor('#1a365d').text(`${score.title || 'Factor'}: ${score.rating || 'N/A'}/10`);
          if (score.description) {
            doc.fontSize(9).fillColor('#4a5568').text(`   ${score.description}`, { align: 'justify' });
          }
          doc.moveDown(0.3);
        });
        doc.moveDown();
      }

      if (solution.limitations && solution.limitations.length > 0) {
        doc.fontSize(12).fillColor('#2d3748').text('Limitations & Open Questions:', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(9).fillColor('#000000').list(solution.limitations);
        doc.moveDown();
      }

      if (solution.additionalInformation && solution.additionalInformation.length > 0) {
        doc.fontSize(12).fillColor('#2d3748').text('Additional Information:', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(9).fillColor('#000000').list(solution.additionalInformation);
      }
    } else {
      doc.fontSize(10).fillColor('#718096').text('Best solution not yet generated.');
    }

    // Add page numbers
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor('#718096')
         .text(`Page ${i + 1} of ${pages.count}`, 
           50, doc.page.height - 50, 
           { align: 'center' });
    }

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('❌ PDF generation error:', error);
    
    // If headers not sent yet, send error response
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate PDF report',
        details: error.message
      });
    }
  }
};

/**
 * Helper function to add phase headers
 */
function addPhaseHeader(doc, phaseNumber, phaseTitle) {
  doc.fontSize(18).font('Helvetica-Bold').fillColor('#1a365d')
     .text(`Phase ${phaseNumber}: ${phaseTitle}`, { underline: true });
  doc.moveDown();
  doc.fontSize(8).fillColor('#cbd5e0')
     .text('_'.repeat(100));
  doc.moveDown(0.5);
}
