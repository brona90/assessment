# MAPS Assessment Questions - Truist Bank
## Modernization, Agility, Platforms & Security Evaluation
### Data Orchestration, Observability & 90-Day Roadmap Focus

## Assessment Team Assignment Matrix

**Greg Foster** (Principal Architect - Data Ops/FinOps) - Domain 2 Lead
**Kiran Padiyar** (Solution Architect - Data & AI) - Domain 3 Lead  
**Vinayakrishnan Cherungotil** (Delivery Governance) - Quality Assurance & Compliance
**Chethan Prakash** (Assessment Lead / PM) - Project Manager & Coordinator
**Matthew Hill** (Data Analyst) - Data Collection & Analysis Lead

### Domain 1: Data Orchestration & Platform Observability

#### Key Area: Data Orchestration Maturity

**1.1 Data Pipeline Automation**
- What tools are currently used for data pipeline orchestration? (Airflow, Prefect, Dagster, Custom)
- How many data pipelines are manually triggered vs. automated?
- What is the average pipeline failure rate and recovery time?
- Are data dependencies automatically tracked and managed?
- Score: ___/5

**1.2 Workflow Orchestration**
- How are complex multi-step data workflows managed?
- What orchestration capabilities exist for cross-platform workflows?
- Are workflow failures automatically retried with exponential backoff?
- How is workflow performance monitored and optimized?
- Score: ___/5

**1.3 Data Movement & Integration**
- What tools handle data ingestion from source systems?
- How is data quality validated during movement?
- Are data lineage tracking capabilities implemented?
- What real-time data integration patterns are used?
- Score: ___/5

**1.4 Error Handling & Recovery**
- How are pipeline failures detected and escalated?
- What automated recovery mechanisms exist?
- How long does average pipeline recovery take?
- Are failure patterns analyzed for prevention?
- Score: ___/5

#### Key Area: Platform Observability

**1.5 Monitoring Coverage**
- What percentage of data platforms have monitoring coverage?
- Are both infrastructure and application metrics monitored?
- What tools are used for platform monitoring? (DataDog, New Relic, Prometheus, Grafana, Custom)
- How are monitoring gaps identified and addressed?
- Score: ___/5

**1.6 Alerting Effectiveness**
- How many alerts are generated daily across platforms?
- What is the false positive rate for alerts?
- Are alerts prioritized by business impact?
- How quickly are critical alerts responded to?
- Score: ___/5

**1.7 Distributed Tracing**
- Is distributed tracing implemented across data services?
- What tracing tools are used? (Jaeger, Zipkin, AWS X-Ray, Custom)
- How are trace data analyzed for performance issues?
- Are service dependencies automatically mapped?
- Score: ___/5

**1.8 Log Aggregation & Analysis**
- Are logs centrally collected and indexed?
- What log analysis tools are used? (ELK Stack, Splunk, CloudWatch, Custom)
- How are logs correlated across distributed systems?
- What automated log analysis capabilities exist?
- Score: ___/5

### Domain 2: FinOps & Data Management

#### Key Area: FinOps Practices

**2.1 Cloud Cost Visibility**
- What cloud cost monitoring tools are deployed? (CloudHealth, CloudCheckr, AWS Cost Explorer, Azure Cost Management)
- How is cloud spending tracked by team/project?
- Are cost anomalies automatically detected?
- What cost allocation methods are used?
- Score: ___/5

**2.2 Resource Optimization**
- Are unused resources automatically identified and reclaimed?
- How is resource rightsizing performed?
- What automated cost optimization exists?
- Are reserved instances/savings plans optimized?
- Score: ___/5

**2.3 Budget Management**
- How are cloud budgets defined and tracked?
- What budget alerting mechanisms exist?
- How are budget overruns investigated?
- Are cost forecasts accurate and actionable?
- Score: ___/5

**2.4 Financial Governance**
- What FinOps policies and procedures exist?
- How is cost accountability enforced?
- Are cost optimization recommendations tracked?
- What ROI measurement exists for cloud investments?
- Score: ___/5

#### Key Area: Data Quality & Governance (DQ/DG)

**2.5 Data Quality Monitoring**
- What data quality dimensions are monitored? (Accuracy, Completeness, Consistency, Timeliness)
- How are data quality issues detected and reported?
- Are data quality scores tracked over time?
- What automated data validation exists?
- Score: ___/5

**2.6 Data Governance Framework**
- What data governance policies are documented?
- How are data stewards assigned and trained?
- Are data governance processes automated?
- How is policy compliance monitored?
- Score: ___/5

**2.7 Data Lineage & Catalog**
- What tools track data lineage? (Apache Atlas, Collibra, Informatica, Custom)
- How complete is the data lineage coverage?
- Is a data catalog available and maintained?
- How are data assets discovered and registered?
- Score: ___/5

**2.8 Master Data Management**
- How are master data entities defined and managed?
- What MDM tools are used? (Informatica MDM, IBM MDM, Talend, Custom)
- Are data quality rules enforced at entry points?
- How are data conflicts resolved?
- Score: ___/5

### Domain 3: Autonomous Capabilities (AI/ML)

#### Key Area: Autonomous Operations

**3.1 Self-Healing Systems**
- What self-healing capabilities are implemented?
- How are system failures automatically detected and resolved?
- What automated recovery mechanisms exist?
- How is self-healing performance measured?
- Score: ___/5

**3.2 Predictive Maintenance**
- Are predictive models used for system maintenance?
- What failure prediction accuracy is achieved?
- How far in advance can failures be predicted?
- What systems have predictive maintenance?
- Score: ___/5

**3.3 Intelligent Alerting**
- Are ML models used for alert prioritization?
- How is alert noise reduced through intelligence?
- What false positive rates are achieved?
- Are alerts automatically correlated and grouped?
- Score: ___/5

**3.4 Automated Root Cause Analysis**
- Can system issues be automatically diagnosed?
- What RCA tools and methods are used?
- How accurate is automated fault isolation?
- Are RCA results automatically documented?
- Score: ___/5

#### Key Area: AI/ML Platform Development

**3.5 MLOps Implementation**
- What MLOps tools are used? (MLflow, Kubeflow, Azure ML, AWS SageMaker)
- How are ML models versioned and tracked?
- Are model deployments automated?
- What model monitoring exists in production?
- Score: ___/5

**3.6 Model Performance Monitoring**
- How are model performance metrics tracked?
- Is model drift automatically detected?
- What triggers model retraining?
- How is model fairness assessed?
- Score: ___/5

**3.7 Automated Model Training**
- Are model training pipelines automated?
- How is hyperparameter optimization performed?
- What automated feature engineering exists?
- Are training results automatically validated?
- Score: ___/5

**3.8 Model Governance & Compliance**
- What model governance policies exist?
- How are models validated before deployment?
- What bias detection mechanisms exist?
- Are model explanations provided?
- Score: ___/5

### Domain 4: Operations & Platform Team Alignment

#### Key Area: Team Collaboration

**4.1 Cross-Team Communication**
- How do operations and platform teams communicate?
- What collaboration tools are used? (Slack, Teams, Jira, Confluence)
- Are regular sync meetings conducted?
- How is knowledge shared between teams?
- Score: ___/5

**4.2 Shared Responsibilities**
- What responsibilities are shared between teams?
- How are handoffs managed between teams?
- Are SLAs defined for cross-team services?
- How is accountability tracked?
- Score: ___/5

**4.3 Joint Problem Solving**
- How are complex issues solved collaboratively?
- Are joint war rooms established for incidents?
- How are learnings shared post-incident?
- What collaborative tools support problem-solving?
- Score: ___/5

**4.4 Knowledge Management**
- How is team knowledge documented and shared?
- Are runbooks maintained collaboratively?
- How is tribal knowledge captured?
- What knowledge bases are used?
- Score: ___/5

#### Key Area: Shared Tooling & Platforms

**4.5 Common Monitoring Tools**
- What monitoring tools are shared across teams?
- How are monitoring dashboards standardized?
- Are alerts routed to appropriate teams?
- How is monitoring data shared?
- Score: ___/5

**4.6 Integrated Workflows**
- How are workflows integrated across teams?
- What workflow automation exists?
- Are change management processes aligned?
- How are approvals handled cross-team?
- Score: ___/5

**4.7 Shared Documentation**
- How is documentation shared and maintained?
- Are standards consistent across teams?
- How is documentation kept current?
- What documentation platforms are used?
- Score: ___/5

**4.8 Platform Standardization**
- How are platforms standardized across teams?
- What platform governance exists?
- Are platform choices aligned with MAPS?
- How are new platforms evaluated?
- Score: ___/5

#### Key Area: MAPS Initiative Alignment

**4.9 Modernization Goals Understanding**
- How well do teams understand MAPS objectives?
- Are team goals aligned with MAPS?
- How is MAPS progress communicated?
- What modernization metrics are tracked?
- Score: ___/5

**4.10 Agility Practices**
- What agile practices are used across teams?
- How are agile ceremonies coordinated?
- Are agile metrics shared between teams?
- How is continuous improvement implemented?
- Score: ___/5

**4.11 Platform Adoption**
- How are new platforms adopted across teams?
- What platform training is provided?
- How is platform migration managed?
- Are platform adoption metrics tracked?
- Score: ___/5

**4.12 Security Integration**
- How is security integrated into team processes?
- Are security practices consistent across teams?
- How are security incidents handled jointly?
- What shared security tools are used?
- Score: ___/5

## Tool Discovery Questions

### Current Tool Inventory (To be completed with Operations & Platform Teams)

**Monitoring & Observability Tools:**
- What APM tools are currently deployed?
- What infrastructure monitoring is in place?
- What log aggregation tools are used?
- What alerting platforms are deployed?
- What dashboard tools are available?

**Data Orchestration Tools:**
- What ETL/ELT tools are used?
- What workflow orchestration platforms exist?
- What data integration tools are deployed?
- What data quality tools are used?
- What data catalog tools are available?

**FinOps & Cost Management:**
- What cloud cost management tools are used?
- What resource optimization tools exist?
- What billing analysis tools are deployed?
- What budget tracking tools are used?

**AI/ML Platforms:**
- What ML platforms are available?
- What model serving infrastructure exists?
- What feature stores are deployed?
- What ML monitoring tools are used?

**Collaboration & Documentation:**
- What team collaboration tools are used?
- What documentation platforms exist?
- What knowledge sharing tools are deployed?
- What project management tools are used?

## Unknown Tool Discovery Process

### Week 1-2: Tool Inventory Workshops
**Format**: Collaborative sessions with Operations and Platform Teams
**Duration**: 2 hours per session
**Participants**: Domain leads, tool administrators, power users

**Session 1: Monitoring & Observability Discovery**
- Walk through current monitoring setup
- Identify shadow IT and unofficial tools
- Document integration points and dependencies
- Capture tool limitations and gaps

**Session 2: Data Platform Discovery**
- Review data architecture and tools
- Identify data movement and processing tools
- Document data quality and governance tools
- Capture analytics and reporting platforms

**Session 3: Operations & Collaboration Discovery**
- Review operational tools and workflows
- Identify automation and scripting tools
- Document collaboration and communication tools
- Capture incident management platforms

### Week 3: Tool Assessment Integration
- Add discovered tools to assessment questions
- Create tool-specific evaluation criteria
- Update scoring rubrics for new tools
- Validate assessment approach with teams

## 90-Day Backlog Integration

### Backlog Item Identification
Each assessment question should identify potential 90-day improvements:
- Quick wins (High impact, Low effort)
- Foundation building (High impact, High effort)
- Process improvements (Medium impact, Medium effort)
- Tool optimizations (Variable impact, Variable effort)

### Success Criteria Definition
For each domain, define what success looks like in 90 days:
- **Data Orchestration**: 80% pipeline automation, 50% faster incident response
- **Platform Observability**: Unified monitoring dashboard, 24-hour failure prediction
- **FinOps**: 15% cost reduction, real-time cost visibility
- **Data Quality**: 20 automated quality rules, 95% data accuracy
- **Autonomous Operations**: 30% incidents self-resolved, 24-hour prediction
- **Team Alignment**: Shared SLOs, integrated workflows, common tools

### Priority Matrix Application
Use the MAPS priority framework for each backlog item:
- **Modernization Impact**: How does this modernize operations?
- **Agility Improvement**: How does this increase operational agility?
- **Platform Enhancement**: How does this improve platform capabilities?
- **Security Strengthening**: How does this improve security posture?