# Truist Bank Technology Assessment Questions
## Cognizant Consulting - SOX Compliance & Technology-Specific Evaluation

### Domain 1: Data Orchestration & Platform Observability

#### Technology-Specific Questions: Snowflake Platform

**1.1 Snowflake Data Orchestration**
- What Snowflake features are used for data pipeline orchestration? (Tasks, Streams, Tasks with dependencies)
- How are Snowflake data pipelines monitored for failures?
- What is the average Snowflake query performance for ETL workloads?
- Are Snowflake auto-scaling features utilized for variable workloads?
- Score: ___/5

**1.2 Snowflake Observability & Monitoring**
- What Snowflake monitoring tools are deployed? (Snowsight, Account Usage views, Custom dashboards)
- How is Snowflake warehouse performance tracked and optimized?
- Are Snowflake resource monitors configured for cost control?
- What alerting exists for Snowflake query failures and timeouts?
- Score: ___/5

**1.3 Snowflake Integration Capabilities**
- What data integration tools connect to Snowflake? (Talend, Airflow, Fivetran, Custom)
- How are data loads optimized for Snowflake performance?
- Are Snowflake external tables used for data lake integration?
- What Snowflake connectors are utilized for real-time data?
- Score: ___/5

**1.4 Snowflake Data Quality & Integrity**
- How is data quality monitored within Snowflake pipelines?
- Are Snowflake data validation functions used for quality checks?
- What data lineage tracking exists for Snowflake transformations?
- How are Snowflake data inconsistencies detected and resolved?
- Score: ___/5

#### Technology-Specific Questions: Talend Integration

**1.5 Talend Data Integration Maturity**
- What Talend products are deployed? (Data Fabric, Big Data, Cloud)
- How many Talend data integration jobs are in production?
- What is the average Talend job execution time and success rate?
- Are Talend job dependencies and workflows automated?
- Score: ___/5

**1.6 Talend Performance & Scalability**
- How does Talend handle large data volumes? (Spark integration, parallel processing)
- Are Talend jobs optimized for performance? (partitioning, pushdown)
- What Talend clustering or cloud scaling features are used?
- How are Talend resource allocations managed?
- Score: ___/5

**1.7 Talend Data Quality Features**
- What Talend data quality tools are implemented? (Profiler, Cleansing)
- Are Talend data quality rules automated across pipelines?
- How is data quality metrics tracked in Talend jobs?
- What Talend data masking features are used for PII protection?
- Score: ___/5

**1.8 Talend Governance & Metadata**
- How is Talend metadata managed and cataloged?
- Are Talend data lineage capabilities fully utilized?
- What impact analysis is performed using Talend lineage?
- How are Talend job versions controlled and deployed?
- Score: ___/5

#### SOX Compliance & PII Protection

**1.9 SOX Controls for Data Orchestration**
- Are data pipeline changes documented and approved? (SOX 404 compliance)
- How are data transformation rules validated for accuracy?
- What controls ensure data integrity during orchestration?
- Are data pipeline failures investigated and documented?
- Score: ___/5

**1.10 PII Protection in Data Pipelines**
- How is PII data identified and classified in pipelines?
- Are data masking or tokenization applied to PII fields?
- What access controls restrict PII data in orchestration tools?
- How is PII data access audited and monitored?
- Score: ___/5

**1.11 Data Lineage for Compliance**
- Is complete data lineage maintained for SOX reporting?
- How are data transformations tracked for audit purposes?
- Can data be traced from source to target for compliance?
- Are data quality issues documented for regulatory review?
- Score: ___/5

**1.12 Platform Security & Access Controls**
- What authentication methods secure orchestration platforms?
- How are platform permissions reviewed and certified?
- Are platform activities logged for security monitoring?
- What encryption protects data in orchestration tools?
- Score: ___/5

### Domain 2: FinOps & Data Management

#### Technology-Specific Questions: Cloud Cost Management

**2.1 Cloud Cost Visibility (AWS/Azure/GCP)**
- What cloud cost management tools are used? (CloudHealth, CloudCheckr, Native tools)
- How is cloud spending tracked by business unit and project?
- Are cost anomalies automatically detected and alerted?
- What cost allocation tags and strategies are implemented?
- Score: ___/5

**2.2 Resource Optimization Technologies**
- Are automated resource rightsizing tools deployed?
- How are unused or idle resources identified and reclaimed?
- What reserved instance/savings plan optimization is used?
- Are spot instances utilized for appropriate workloads?
- Score: ___/5

**2.3 Budget Management & Forecasting**
- How are cloud budgets defined and tracked in tools?
- What budget alerting mechanisms prevent overruns?
- Are cost forecasts generated using ML/AI tools?
- How accurate are cost predictions (±percentage)?
- Score: ___/5

**2.4 Financial Governance Tools**
- What FinOps policy enforcement tools are implemented?
- How is cost accountability tracked across teams?
- Are cost optimization recommendations automated?
- What ROI measurement tools track cloud investments?
- Score: ___/5

#### SOX Compliance for Financial Data

**2.5 SOX Controls for Cloud Costs**
- Are cloud cost reports reviewed and approved? (SOX 404)
- How are cloud billing discrepancies investigated?
- What controls ensure accurate cost allocation?
- Are cloud vendor invoices validated against usage?
- Score: ___/5

**2.6 Financial Data Integrity**
- How is financial data accuracy ensured in cloud systems?
- Are cost calculations validated and reconciled?
- What prevents unauthorized cloud spending?
- How are cloud cost changes documented and approved?
- Score: ___/5

**2.7 Audit Trail for FinOps**
- Are all cloud cost management activities logged?
- Can cost report changes be traced to individuals?
- How long are FinOps audit trails retained?
- Are cost management logs regularly reviewed?
- Score: ___/5

**2.8 Compliance Monitoring**
- Are SOX-compliant reports generated from cloud tools?
- How often are FinOps processes tested for compliance?
- What exceptions are reported to management?
- Are compliance deficiencies promptly remediated?
- Score: ___/5

#### Data Management & PII Protection

**2.9 Data Classification Technologies**
- What tools classify data sensitivity levels?
- How is PII automatically identified and tagged?
- Are data retention policies enforced by technology?
- What data lineage tools track PII movement?
- Score: ___/5

**2.10 Data Access Governance**
- How are data access permissions managed and reviewed?
- Are data access requests logged and approved?
- What tools monitor privileged data access?
- How are data access violations detected?
- Score: ___/5

**2.11 Data Encryption & Masking**
- What encryption protects data at rest and in transit?
- Are data masking tools used for non-production?
- How are encryption keys managed and rotated?
- What tokenization is used for sensitive data?
- Score: ___/5

**2.12 Data Breach Prevention**
- How are data breaches detected in storage systems?
- What tools alert on unusual data access patterns?
- Are data loss prevention (DLP) tools deployed?
- How is PII exposure risk continuously assessed?
- Score: ___/5

### Domain 3: Autonomous Capabilities (AI/ML)

#### Technology Assessment: Available AI/ML Platforms

**3.1 Current AI/ML Platform Maturity**
- What AI/ML platforms are deployed? (AWS SageMaker, Azure ML, GCP AI Platform)
- How many ML models are in production across platforms?
- What is the average model accuracy and performance?
- Are MLOps practices implemented for model lifecycle?
- Score: ___/5

**3.2 Model Development & Training**
- What tools support model development? (Jupyter, RStudio, AutoML)
- How are model training pipelines automated?
- Are hyperparameter optimization tools utilized?
- What distributed training capabilities exist?
- Score: ___/5

**3.3 Model Deployment & Serving**
- How are models deployed to production? (Containers, Serverless, APIs)
- What model serving infrastructure is in place?
- Are A/B testing frameworks implemented for models?
- How is model versioning and rollback managed?
- Score: ___/5

**3.4 Model Monitoring & Observability**
- How are model performance metrics tracked?
- Is model drift automatically detected and alerted?
- What triggers model retraining pipelines?
- How are model predictions monitored for bias?
- Score: ___/5

#### Assessment for Unavailable/Planned AI Technologies

**3.5 AI/ML Platform Requirements**
- What AI/ML capabilities are needed but not available?
- Are there vendor evaluations or POCs in progress?
- What AI/ML use cases are prioritized for implementation?
- How is AI/ML vendor selection being conducted?
- Score: ___/5

**3.6 Future AI/ML Architecture**
- What AI/ML platform architecture is planned?
- How will new AI tools integrate with existing platforms?
- What is the timeline for AI/ML platform deployment?
- Are there budget approvals for AI/ML investments?
- Score: ___/5

**3.7 AI/ML Skill Assessment**
- What AI/ML skills exist within the organization?
- Are there training plans for AI/ML technologies?
- How will AI/ML expertise be developed or acquired?
- What external AI/ML partnerships are planned?
- Score: ___/5

**3.8 AI/ML Governance Planning**
- What AI governance policies are being developed?
- How will AI model risk be managed and monitored?
- Are AI ethics and bias mitigation procedures planned?
- What AI regulatory compliance measures are needed?
- Score: ___/5

#### SOX Compliance for AI/ML

**3.9 Model Risk Management (SOX)**
- Are AI model risks assessed and documented?
- How are AI model changes controlled and approved?
- What controls ensure AI model output accuracy?
- Are AI model failures investigated for SOX reporting?
- Score: ___/5

**3.10 AI Audit Trail Requirements**
- Are AI model decisions logged and explainable?
- Can AI model changes be traced to individuals?
- How long are AI audit trails retained?
- Are AI model performance reviews documented?
- Score: ___/5

**3.11 Automated Control Validation**
- How are AI-driven controls tested for effectiveness?
- What monitoring ensures AI controls operate correctly?
- Are AI control failures reported to management?
- How quickly are AI control issues remediated?
- Score: ___/5

**3.12 AI Regulatory Compliance**
- How will AI regulations be monitored and implemented?
- Are AI compliance training programs planned?
- What AI compliance reporting tools are needed?
- How will AI compliance be continuously assured?
- Score: ___/5

### Domain 4: Operations & Platform Team Alignment

#### Current Collaboration Technologies

**4.1 Team Communication Tools**
- What collaboration platforms are used? (Slack, Teams, WebEx, Zoom)
- How effectively do teams communicate across platforms?
- Are communication channels integrated and accessible?
- What communication gaps exist between teams?
- Score: ___/5

**4.2 Shared Documentation Platforms**
- What documentation tools are shared? (Confluence, SharePoint, Wiki)
- How is knowledge shared between operations and platform teams?
- Are documentation standards consistent across teams?
- How is tribal knowledge captured and transferred?
- Score: ___/5

**4.3 Joint Monitoring & Alerting**
- What monitoring tools are shared across teams? (DataDog, Splunk, New Relic)
- How are alerts routed to appropriate teams automatically?
- Are dashboards created collaboratively and shared?
- What monitoring gaps exist between team tools?
- Score: ___/5

**4.4 Integrated Workflow Tools**
- What workflow platforms integrate team processes? (Jira, ServiceNow, Remedy)
- How are change management processes coordinated?
- Are incident management workflows integrated?
- What workflow automation exists between teams?
- Score: ___/5

#### Technology Gap Assessment

**4.5 Missing Collaboration Technologies**
- What collaboration tools are needed but not available?
- Are there evaluations of new collaboration platforms?
- How will new tools integrate with existing platforms?
- What budget exists for collaboration technology?
- Score: ___/5

**4.6 Platform Standardization Needs**
- What platform standardization is required?
- Are platform evaluation criteria established?
- How will platform decisions be made and implemented?
- What platform migration challenges are anticipated?
- Score: ___/5

**4.7 Future Tool Integration**
- How will new tools integrate with current platforms?
- What API capabilities are needed for integration?
- Are data portability requirements defined?
- How will tool retirement be managed?
- Score: ___/5

**4.8 Technology Adoption Planning**
- How will new technologies be rolled out to teams?
- What training is planned for new tools?
- How will technology adoption be measured?
- What support will be provided during transitions?
- Score: ___/5

#### SOX Compliance for Team Operations

**4.9 Access Control Coordination**
- How are access controls coordinated between teams?
- Are cross-team access permissions regularly reviewed?
- What SOX controls apply to shared systems?
- How are privileged access requests documented?
- Score: ___/5

**4.10 Change Management Integration**
- How are changes coordinated across team boundaries?
- Are cross-team changes documented for SOX compliance?
- What approval processes exist for shared system changes?
- How are emergency changes handled across teams?
- Score: ___/5

**4.11 Shared System Monitoring**
- How are shared system activities logged for audit?
- Are cross-team system reviews conducted regularly?
- What controls monitor shared platform usage?
- How are shared system exceptions investigated?
- Score: ___/5

**4.12 Compliance Training Coordination**
- How is SOX compliance training coordinated across teams?
- Are team members trained on shared compliance responsibilities?
- What compliance documentation is shared between teams?
- How are compliance updates communicated across teams?
- Score: ___/5

## Technology-Specific Scoring Examples

### Snowflake Scoring Example (1-5 Scale)

**Score 1 (Basic)**: Basic Snowflake deployment, manual processes, limited monitoring
**Score 2 (Developing)**: Some automation, basic monitoring, standard security features
**Score 3 (Established)**: Automated pipelines, comprehensive monitoring, role-based access
**Score 4 (Advanced)**: Performance optimization, advanced security, cost optimization
**Score 5 (Leading)**: Autonomous operations, predictive analytics, industry best practices

### Talend Scoring Example (1-5 Scale)

**Score 1 (Basic)**: Basic ETL jobs, manual deployment, limited governance
**Score 2 (Developing)**: Some automation, version control, basic data quality
**Score 3 (Established)**: Automated workflows, metadata management, comprehensive monitoring
**Score 4 (Advanced)**: Performance optimization, advanced governance, cloud integration
**Score 5 (Leading)**: Autonomous data integration, AI-powered optimization, industry leadership

### Unavailable Technology Assessment

**For technologies not currently available:**

**Score Based on Readiness**:
- **Score 1**: No plans, no budget, no evaluation
- **Score 2**: Initial planning, budget requests, vendor research
- **Score 3**: Vendor evaluation, POC planning, requirements defined
- **Score 4**: POC completed, business case approved, implementation planned
- **Score 5**: Implementation ready, team trained, rollout scheduled