// Patch for PDF Export to include dynamic compliance frameworks
// This extends the existing PDF export functionality

(function() {
    'use strict';

    // Store original exportToPDF function
    const originalExportToPDF = window.exportToPDF;

    // Override exportToPDF to include compliance frameworks
    window.exportToPDF = async function() {
        // Check if compliance frameworks are enabled
        let hasCompliance = false;
        if (window.complianceVisualization) {
            const enabledFrameworks = window.complianceVisualization.complianceManager.getEnabledFrameworks();
            hasCompliance = enabledFrameworks.length > 0;
        }

        // If no compliance frameworks, use original function
        if (!hasCompliance) {
            return originalExportToPDF();
        }

        // Otherwise, call original and then add compliance pages
        try {
            // Force update all charts before export
            if (window.updateCharts) {
                window.updateCharts();
            }
            if (window.complianceVisualization) {
                window.complianceVisualization.updateCharts();
            }

            // Wait for charts to render
            await new Promise(resolve => setTimeout(resolve, 500));

            // Call original export
            await originalExportToPDF();
        } catch (error) {
            console.error('Error exporting PDF with compliance:', error);
            alert('Error generating PDF. Please try again.');
        }
    };
})();