// Truist Technology Assessment - Complete Question Set (48 Questions)

const assessmentQuestions = {
    domain1: {
        title: "Data Orchestration & Platform Observability",
        weight: 0.30,
        sections: [
            {
                sectionTitle: "Snowflake Platform",
                questions: [
                    {
                        id: "q1_1",
                        title: "Snowflake Data Orchestration",
                        description: "What Snowflake features are used for data pipeline orchestration? (Tasks, Streams, dependencies)"
                    },
                    {
                        id: "q1_2",
                        title: "Snowflake Observability & Monitoring",
                        description: "What Snowflake monitoring tools are deployed? (Snowsight, Account Usage views, dashboards)"
                    },
                    {
                        id: "q1_3",
                        title: "Snowflake Integration Capabilities",
                        description: "What data integration tools connect to Snowflake? (Talend, Airflow, Fivetran, Custom)"
                    },
                    {
                        id: "q1_4",
                        title: "Snowflake Data Quality & Integrity",
                        description: "How is data quality monitored within Snowflake pipelines?"
                    }
                ]
            },
            {
                sectionTitle: "Talend Integration",
                questions: [
                    {
                        id: "q1_5",
                        title: "Talend Data Integration Maturity",
                        description: "What Talend products are deployed? (Data Fabric, Big Data, Cloud)"
                    },
                    {
                        id: "q1_6",
                        title: "Talend Performance & Scalability",
                        description: "How does Talend handle large data volumes? (Spark integration, parallel processing)"
                    },
                    {
                        id: "q1_7",
                        title: "Talend Data Quality Features",
                        description: "What Talend data quality tools are implemented? (Profiler, Cleansing)"
                    },
                    {
                        id: "q1_8",
                        title: "Talend Governance & Metadata",
                        description: "How is Talend metadata managed and cataloged?"
                    }
                ]
            },
            {
                sectionTitle: "SOX Compliance & PII Protection",
                questions: [
                    {
                        id: "q1_9",
                        title: "SOX Controls for Data Orchestration",
                        description: "Are data pipeline changes documented and approved? (SOX 404 compliance)"
                    },
                    {
                        id: "q1_10",
                        title: "PII Protection in Data Pipelines",
                        description: "How is PII data identified and classified in pipelines?"
                    },
                    {
                        id: "q1_11",
                        title: "Data Lineage for Compliance",
                        description: "Is complete data lineage maintained for SOX reporting?"
                    },
                    {
                        id: "q1_12",
                        title: "Platform Security & Access Controls",
                        description: "What authentication methods secure orchestration platforms?"
                    }
                ]
            }
        ]
    },
    domain2: {
        title: "FinOps & Data Management",
        weight: 0.25,
        sections: [
            {
                sectionTitle: "Cloud Cost Management",
                questions: [
                    {
                        id: "q2_1",
                        title: "Cloud Cost Visibility",
                        description: "What cloud cost management tools are used? (CloudHealth, CloudCheckr, Native tools)"
                    },
                    {
                        id: "q2_2",
                        title: "Cost Optimization Automation",
                        description: "Are automated resource rightsizing tools deployed?"
                    },
                    {
                        id: "q2_3",
                        title: "Budget Management & Forecasting",
                        description: "How are cloud budgets defined and tracked in tools?"
                    },
                    {
                        id: "q2_4",
                        title: "FinOps Governance & Accountability",
                        description: "What FinOps policy enforcement tools are implemented?"
                    }
                ]
            },
            {
                sectionTitle: "SOX Compliance for FinOps",
                questions: [
                    {
                        id: "q2_5",
                        title: "Financial Reporting Controls",
                        description: "Are cloud cost reports reviewed and approved? (SOX 404)"
                    },
                    {
                        id: "q2_6",
                        title: "Data Integrity for Financial Systems",
                        description: "How is financial data accuracy ensured in cloud systems?"
                    },
                    {
                        id: "q2_7",
                        title: "Audit Trail & Change Management",
                        description: "Are all cloud cost management activities logged?"
                    },
                    {
                        id: "q2_8",
                        title: "Compliance Testing & Validation",
                        description: "Are SOX-compliant reports generated from cloud tools?"
                    }
                ]
            },
            {
                sectionTitle: "Data Management & PII Protection",
                questions: [
                    {
                        id: "q2_9",
                        title: "Data Classification & Cataloging",
                        description: "What tools classify data sensitivity levels?"
                    },
                    {
                        id: "q2_10",
                        title: "Access Control & Authorization",
                        description: "How are data access permissions managed and reviewed?"
                    },
                    {
                        id: "q2_11",
                        title: "Encryption & Data Protection",
                        description: "What encryption protects data at rest and in transit?"
                    },
                    {
                        id: "q2_12",
                        title: "Data Breach Detection & Response",
                        description: "How are data breaches detected in storage systems?"
                    }
                ]
            }
        ]
    },
    domain3: {
        title: "Autonomous Capabilities (AI/ML)",
        weight: 0.25,
        sections: [
            {
                sectionTitle: "AI/ML Platform Capabilities",
                questions: [
                    {
                        id: "q3_1",
                        title: "AI/ML Platform Deployment",
                        description: "What AI/ML platforms are deployed? (AWS SageMaker, Azure ML, GCP AI Platform)"
                    },
                    {
                        id: "q3_2",
                        title: "Model Development Tools",
                        description: "What tools support model development? (Jupyter, RStudio, AutoML)"
                    },
                    {
                        id: "q3_3",
                        title: "Model Deployment & Serving",
                        description: "How are models deployed to production? (Containers, Serverless, APIs)"
                    },
                    {
                        id: "q3_4",
                        title: "Model Monitoring & Governance",
                        description: "How are model performance metrics tracked?"
                    }
                ]
            },
            {
                sectionTitle: "Future AI/ML Capabilities",
                questions: [
                    {
                        id: "q3_5",
                        title: "Planned AI/ML Capabilities",
                        description: "What AI/ML capabilities are needed but not available?"
                    },
                    {
                        id: "q3_6",
                        title: "AI/ML Platform Roadmap",
                        description: "What AI/ML platform architecture is planned?"
                    },
                    {
                        id: "q3_7",
                        title: "AI/ML Skills & Training",
                        description: "What AI/ML skills exist within the organization?"
                    },
                    {
                        id: "q3_8",
                        title: "AI Governance Framework",
                        description: "What AI governance policies are being developed?"
                    }
                ]
            },
            {
                sectionTitle: "SOX Compliance for AI/ML",
                questions: [
                    {
                        id: "q3_9",
                        title: "AI Model Risk Management",
                        description: "Are AI model risks assessed and documented?"
                    },
                    {
                        id: "q3_10",
                        title: "AI Audit Trail & Explainability",
                        description: "Are AI model decisions logged and explainable?"
                    },
                    {
                        id: "q3_11",
                        title: "AI Model Validation & Testing",
                        description: "How are AI models validated before production?"
                    },
                    {
                        id: "q3_12",
                        title: "AI Regulatory Compliance",
                        description: "What AI regulatory requirements are tracked?"
                    }
                ]
            }
        ]
    },
    domain4: {
        title: "Operations & Platform Team Alignment",
        weight: 0.20,
        sections: [
            {
                sectionTitle: "Platform Operations",
                questions: [
                    {
                        id: "q4_1",
                        title: "Platform Monitoring & Observability",
                        description: "What platform monitoring tools are deployed? (New Relic, Datadog, Splunk)"
                    },
                    {
                        id: "q4_2",
                        title: "Incident Management & Response",
                        description: "What incident management platforms are used? (ServiceNow, PagerDuty)"
                    },
                    {
                        id: "q4_3",
                        title: "Platform Automation & Orchestration",
                        description: "What automation tools manage platform operations? (Ansible, Terraform)"
                    },
                    {
                        id: "q4_4",
                        title: "Platform Performance Optimization",
                        description: "How is platform performance continuously optimized?"
                    }
                ]
            },
            {
                sectionTitle: "Team Collaboration & MAPS Alignment",
                questions: [
                    {
                        id: "q4_5",
                        title: "Cross-Team Collaboration Tools",
                        description: "What collaboration platforms enable cross-team work? (Slack, Teams, Jira)"
                    },
                    {
                        id: "q4_6",
                        title: "Shared Tooling & Standards",
                        description: "How are platform standards enforced across teams?"
                    },
                    {
                        id: "q4_7",
                        title: "MAPS Initiative Integration",
                        description: "How are operations aligned with MAPS (Modernization, Agility, Platforms, Security)?"
                    },
                    {
                        id: "q4_8",
                        title: "DevOps & SRE Practices",
                        description: "What DevOps/SRE practices are implemented?"
                    }
                ]
            },
            {
                sectionTitle: "SOX Compliance for Operations",
                questions: [
                    {
                        id: "q4_9",
                        title: "Change Management Controls",
                        description: "Are platform changes documented and approved? (SOX 404)"
                    },
                    {
                        id: "q4_10",
                        title: "Access Control & Segregation of Duties",
                        description: "How are platform access controls managed?"
                    },
                    {
                        id: "q4_11",
                        title: "Operational Audit Trails",
                        description: "Are all platform operations logged and auditable?"
                    },
                    {
                        id: "q4_12",
                        title: "Compliance Monitoring & Reporting",
                        description: "How are operational compliance metrics tracked?"
                    }
                ]
            }
        ]
    }
};

// Maturity level definitions
const maturityLevels = [
    { value: 1, label: "Not Implemented", description: "Capability doesn't exist" },
    { value: 2, label: "Initial", description: "Ad-hoc, manual processes" },
    { value: 3, label: "Developing", description: "Defined processes, some automation" },
    { value: 4, label: "Mature", description: "Well-established, mostly automated" },
    { value: 5, label: "Optimized", description: "Fully automated, continuously improving" }
];