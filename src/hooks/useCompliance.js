import { useState, useEffect, useCallback } from 'react';
import { complianceService } from '../services/complianceService';
import { dataStore } from '../services/dataStore';

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
      
      // Initialize dataStore if not already initialized
      if (!dataStore.initialized) {
        await dataStore.initialize();
      }
      
      // Get only selected frameworks from dataStore
      const selectedFrameworks = dataStore.getSelectedFrameworks();
      
      // Convert array to object format expected by compliance service
      const frameworksObj = {};
      selectedFrameworks.forEach(fw => {
        frameworksObj[fw.id] = {
          ...fw,
          enabled: true
        };
      });
      
      setFrameworks(frameworksObj);
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