import { useState, useEffect, useCallback } from 'react';
import { complianceService } from '../services/complianceService';

export const useCompliance = (answers = {}) => {
  const [frameworks, setFrameworks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFrameworks();
  }, []);

  const loadFrameworks = async () => {
    try {
      setLoading(true);
      const saved = complianceService.loadSavedCompliance();
      const loaded = saved || await complianceService.loadCompliance();
      setFrameworks(loaded);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getEnabledFrameworks = useCallback(() => {
    return complianceService.getEnabledFrameworks(frameworks);
  }, [frameworks]);

  const getFrameworkScore = useCallback((frameworkId) => {
    const framework = frameworks[frameworkId];
    if (!framework) return 0;
    return complianceService.calculateFrameworkScore(framework, answers);
  }, [frameworks, answers]);

  const toggleFramework = useCallback((frameworkId) => {
    const updated = {
      ...frameworks,
      [frameworkId]: {
        ...frameworks[frameworkId],
        enabled: !frameworks[frameworkId].enabled
      }
    };
    setFrameworks(updated);
    complianceService.saveCompliance(updated);
  }, [frameworks]);

  const updateFramework = useCallback((frameworkId, updates) => {
    const updated = {
      ...frameworks,
      [frameworkId]: {
        ...frameworks[frameworkId],
        ...updates
      }
    };
    setFrameworks(updated);
    complianceService.saveCompliance(updated);
  }, [frameworks]);

  return {
    frameworks,
    loading,
    error,
    getEnabledFrameworks,
    getFrameworkScore,
    toggleFramework,
    updateFramework,
    reload: loadFrameworks
  };
};