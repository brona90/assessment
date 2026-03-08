// Sentinel value stored in answers when a user marks a question as Not Applicable.
// Must be excluded from score averages but counts as "answered" in progress.
export const NA_VALUE = 0;

export const scoreCalculator = {
  calculateDomainScore(questions, answers) {
    if (!questions || questions.length === 0) return 0;

    let total = 0;
    let count = 0;

    questions.forEach(q => {
      const val = answers[q.id];
      if (val !== undefined && val !== NA_VALUE) {
        total += val;
        count++;
      }
    });

    return count > 0 ? (total / count) : 0;
  },

  calculateOverallScore(domains, answers) {
    let weightedSum = 0;
    let totalWeight = 0;
    
    Object.values(domains).forEach(domain => {
      const questions = this.getAllQuestionsFromDomain(domain);
      const domainScore = this.calculateDomainScore(questions, answers);
      
      if (domainScore > 0) {
        weightedSum += domainScore * domain.weight;
        totalWeight += domain.weight;
      }
    });
    
    return totalWeight > 0 ? (weightedSum / totalWeight) : 0;
  },

  getAllQuestionsFromDomain(domain) {
    const questions = [];
    Object.values(domain.categories || {}).forEach(category => {
      if (category.questions) {
        questions.push(...category.questions);
      }
    });
    return questions;
  },

  calculateProgress(domains, answers) {
    const allQuestions = [];
    Object.values(domains).forEach(domain => {
      allQuestions.push(...this.getAllQuestionsFromDomain(domain));
    });
    
    const answered = allQuestions.filter(q => answers[q.id] !== undefined).length;
    const total = allQuestions.length;
    
    return {
      answered,
      total,
      percentage: total > 0 ? Math.round((answered / total) * 100) : 0
    };
  },

  calculateComplianceScore(framework, questions, answers) {
    if (!framework.mappedQuestions || framework.mappedQuestions.length === 0) {
      return 0;
    }

    let total = 0;
    let count = 0;

    framework.mappedQuestions.forEach(qId => {
      const val = answers[qId];
      if (val !== undefined && val !== NA_VALUE) {
        total += (val / 5) * 100;
        count++;
      }
    });

    return count > 0 ? (total / count) : 0;
  },

  getMaturityLevel(score) {
    if (score >= 4.5) return 'Optimized';
    if (score >= 3.5) return 'Managed';
    if (score >= 2.5) return 'Defined';
    if (score >= 1.5) return 'Initial';
    return 'Not Implemented';
  },

  calculateProgressFromQuestions(questions, answers, evidence = {}) {
    const total = questions.length;
    const answered = questions.filter(q => answers[q.id] !== undefined).length;
    const withEvidence = questions.filter(
      q => answers[q.id] !== undefined && !!evidence[q.id]
    ).length;
    return {
      answered,
      total,
      percentage: total > 0 ? Math.round((answered / total) * 100) : 0,
      withEvidence
    };
  },

  calculatePriorityScore(score, domainWeight, target = 4.0) {
    if (score === undefined || score === NA_VALUE) return 0;
    const gap = Math.max(0, target - score);
    return gap * (domainWeight || 1);
  },

  getComplianceStatus(score, threshold) {
    if (score >= 90) return 'Excellent';
    if (score >= threshold) return 'Good';
    if (score >= threshold - 10) return 'Fair';
    if (score >= threshold - 20) return 'Needs Improvement';
    return 'Critical';
  }
};