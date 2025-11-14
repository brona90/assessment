// Configuration file for Technology Assessment Application
// Customize this file to brand the application for your organization

const CONFIG = {
    // Organization Branding
    organization: {
        name: "Your Organization",
        fullName: "Your Organization Technology Assessment",
        confidentialText: "Confidential - Technology Assessment"
    },
    
    // Color Scheme (CSS variables will use these)
    colors: {
        primary: "#6B46C1",      // Purple
        secondary: "#2563EB",    // Blue
        accent: "#10B981",       // Green
        warning: "#F59E0B",      // Orange
        danger: "#EF4444",       // Red
        text: "#1F2937",         // Dark gray
        background: "#F9FAFB"    // Light gray
    },
    
    // Assessment Configuration
    assessment: {
        title: "Technology Assessment",
        subtitle: "Interactive Dashboard",
        storageKey: "techAssessment",  // localStorage key
        pdfFileName: "Technology-Assessment-Report"
    },
    
    // Domain Weights (must sum to 100)
    domainWeights: {
        domain1: 30,  // Data Orchestration & Platform Observability
        domain2: 25,  // FinOps & Data Management
        domain3: 25,  // Autonomous Capabilities (AI/ML)
        domain4: 20   // Operations & Platform Team Alignment
    },
    
    // Industry Benchmarks
    benchmarks: {
        industry: 3.2,
        target: 4.0
    },
    
    // Report Configuration
    report: {
        includeCharts: true,
        includeDetailedAnalysis: true,
        includeRecommendations: true,
        pageSize: "letter"  // or "a4"
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}