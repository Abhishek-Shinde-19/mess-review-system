const FairnessReport = require('../models/FairnessReport');

/**
 * Comparison Engine - Compares Metrics Engine and AI Engine results
 */
class ComparisonEngine {

  static statusMap = {
    'Valid': 'valid',
    'Suspicious': 'suspicious',
    'Likely Spam': 'spam'
  };

  /**
   * Compare metrics and AI results, generate fairness report
   */
  static async compare(reviewId, metricsResult, aiResult) {
    const metricsNormalized = this.statusMap[metricsResult.status] || 'valid';
    const aiNormalized = aiResult.prediction;

    // Calculate agreement score
    const agreementScore = this.calculateAgreement(metricsNormalized, aiNormalized);
    const isDisagreement = agreementScore < 0.7;

    // Generate combined explanation
    const combinedExplanation = this.generateCombinedExplanation(
      metricsResult, aiResult, agreementScore, isDisagreement
    );

    const report = await FairnessReport.create({
      reviewId,
      metricsResultId: metricsResult._id,
      aiResultId: aiResult._id || aiResult.aiResultId,
      metricsStatus: metricsResult.status,
      aiPrediction: aiResult.prediction,
      agreementScore,
      isDisagreement,
      combinedExplanation
    });

    return report;
  }

  /**
   * Calculate agreement score between two classifications
   */
  static calculateAgreement(metricsStatus, aiPrediction) {
    if (metricsStatus === aiPrediction) return 1.0;

    const levels = { 'valid': 0, 'suspicious': 1, 'spam': 2 };
    const diff = Math.abs((levels[metricsStatus] || 0) - (levels[aiPrediction] || 0));

    if (diff === 1) return 0.5;
    return 0.0;
  }

  /**
   * Generate combined natural language explanation
   */
  static generateCombinedExplanation(metricsResult, aiResult, agreementScore, isDisagreement) {
    let explanation = '';

    explanation += `Metrics Engine: "${metricsResult.status}" (credibility: ${metricsResult.credibilityScore}/100). `;
    explanation += `AI Engine: "${aiResult.prediction}" (confidence: ${(aiResult.confidence * 100).toFixed(0)}%). `;

    if (!isDisagreement) {
      explanation += `Both systems agree on the assessment (agreement: ${(agreementScore * 100).toFixed(0)}%).`;
    } else {
      explanation += `DISAGREEMENT DETECTED (agreement: ${(agreementScore * 100).toFixed(0)}%). `;
      explanation += `The metrics-based system classified this as "${metricsResult.status}" while the AI classified it as "${aiResult.prediction}". `;
      explanation += `Manual review may be required.`;
    }

    return explanation;
  }
}

module.exports = ComparisonEngine;
