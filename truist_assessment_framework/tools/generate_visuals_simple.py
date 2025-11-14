#!/usr/bin/env python3
"""
Truist Bank Technology Assessment - Web Graphs and Visualizations
Cognizant Consulting - Technology Assessment Framework
"""

import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
import pandas as pd
from datetime import datetime

# Set style for professional visualizations
plt.style.use('seaborn-v0_8')
sns.set_palette("husl")

def create_all_visualizations():
    """Create all visualization charts for Truist Bank assessment"""
    
    print("🚀 Generating Truist Bank Technology Assessment Visualizations...")
    print("=" * 60)
    
    try:
        # 1. Technology Maturity Radar Chart
        print("1. Creating maturity radar chart...")
        create_maturity_radar_chart()
        print("   ✅ Maturity radar chart created successfully!")
        
        # 2. Technology Platform Comparison
        print("2. Creating technology comparison chart...")
        create_technology_comparison()
        print("   ✅ Technology comparison chart created successfully!")
        
        # 3. SOX Compliance Dashboard
        print("3. Creating SOX compliance dashboard...")
        create_sox_compliance_dashboard()
        print("   ✅ SOX compliance dashboard created successfully!")
        
        # 4. PII Protection Dashboard
        print("4. Creating PII protection dashboard...")
        create_pii_protection_dashboard()
        print("   ✅ PII protection dashboard created successfully!")
        
        # 5. Implementation Roadmap
        print("5. Creating implementation roadmap...")
        create_implementation_roadmap()
        print("   ✅ Implementation roadmap created successfully!")
        
        # 6. Executive Summary Dashboard
        print("6. Creating executive summary dashboard...")
        create_executive_summary_dashboard()
        print("   ✅ Executive summary dashboard created successfully!")
        
        print("\n" + "=" * 60)
        print("🎉 All visualizations created successfully!")
        print("\n📁 Files saved to: /workspace/final_framework/")
        print("\nGenerated visualization files:")
        print("  • maturity_radar_chart.png & .svg")
        print("  • technology_comparison.png & .svg")
        print("  • sox_compliance_dashboard.png & .svg")
        print("  • pii_protection_dashboard.png & .svg")
        print("  • implementation_roadmap.png & .svg")
        print("  • executive_summary_dashboard.png & .svg")
        print("\n📊 Interactive dashboard available in the comprehensive HTML file")
        
    except Exception as e:
        print(f"❌ Error generating visualizations: {str(e)}")
        return False
    
    return True

def create_maturity_radar_chart():
    """Create radar chart for technology maturity assessment"""
    
    # Truist Bank assessment data
    domains = ['Data Orchestration\n& Platform Observability', 'FinOps &\nData Management', 
               'Autonomous Capabilities\n(AI/ML)', 'Operations & Platform\nTeam Alignment']
    current_scores = [2.8, 2.3, 1.9, 3.1]  # Current state
    target_scores = [4.2, 4.0, 3.8, 4.0]   # Target state
    industry_benchmark = [3.2, 3.0, 2.8, 3.5]  # Industry average
    
    # Number of variables
    N = len(domains)
    
    # Compute angle for each axis
    angles = np.linspace(0, 2 * np.pi, N, endpoint=False).tolist()
    angles += angles[:1]  # Complete the circle
    
    # Add the first value at the end to close the circle
    current_scores += current_scores[:1]
    target_scores += target_scores[:1]
    industry_benchmark += industry_benchmark[:1]
    
    # Create the figure
    fig, ax = plt.subplots(figsize=(10, 10), subplot_kw=dict(projection='polar'))
    
    # Plot data
    ax.plot(angles, current_scores, 'o-', linewidth=3, label='Current State', color='#e74c3c')
    ax.fill(angles, current_scores, alpha=0.25, color='#e74c3c')
    ax.plot(angles, target_scores, 'o-', linewidth=3, label='Target State', color='#27ae60')
    ax.fill(angles, target_scores, alpha=0.25, color='#27ae60')
    ax.plot(angles, industry_benchmark, 'o-', linewidth=2, label='Industry Average', color='#3498db')
    
    # Add labels
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(domains, fontsize=11)
    ax.set_ylim(0, 5)
    ax.set_title('Truist Bank Technology Maturity Assessment\nCognizant Consulting Framework', 
                 size=16, color='black', y=1.08, weight='bold')
    ax.legend(loc='upper right', bbox_to_anchor=(1.3, 1.0), fontsize=12)
    ax.grid(True, alpha=0.3)
    
    # Add score labels
    for angle, score in zip(angles[:-1], current_scores[:-1]):
        ax.annotate(f'{score}', xy=(angle, score), xytext=(5, 5),
                   textcoords='offset points', fontsize=10, weight='bold')
    
    plt.tight_layout()
    
    # Save as high-quality PNG and SVG
    plt.savefig('/workspace/final_framework/maturity_radar_chart.png', dpi=300, bbox_inches='tight')
    plt.savefig('/workspace/final_framework/maturity_radar_chart.svg', format='svg', bbox_inches='tight')
    plt.close()
    
    return "Maturity radar chart created successfully!"

def create_technology_comparison():
    """Create comparison chart for technology platforms"""
    
    # Technology platform assessment data
    platforms = ['Snowflake', 'Talend', 'Current APM', 'ServiceNow', 'New Relic']
    capabilities = ['Performance', 'Security', 'Integration', 'Operations', 'Cost Effectiveness']
    
    # Capability scores (1-5 scale)
    snowflake_scores = [4.2, 3.8, 3.5, 3.2, 3.0]
    talend_scores = [3.9, 3.1, 3.7, 2.8, 3.2]
    current_apm_scores = [2.5, 2.8, 2.2, 2.0, 3.5]
    servicenow_scores = [3.0, 4.0, 3.5, 4.2, 2.8]
    new_relic_scores = [3.8, 3.5, 3.2, 3.0, 3.5]
    
    # Create comparison visualization
    fig, ax = plt.subplots(figsize=(12, 7))
    
    x = np.arange(len(capabilities))
    width = 0.15
    
    # Create bars
    bars1 = ax.bar(x - 2*width, snowflake_scores, width, label='Snowflake', color='#1f77b4', alpha=0.8)
    bars2 = ax.bar(x - width, talend_scores, width, label='Talend', color='#ff7f0e', alpha=0.8)
    bars3 = ax.bar(x, current_apm_scores, width, label='Current APM', color='#2ca02c', alpha=0.8)
    bars4 = ax.bar(x + width, servicenow_scores, width, label='ServiceNow', color='#d62728', alpha=0.8)
    bars5 = ax.bar(x + 2*width, new_relic_scores, width, label='New Relic', color='#9467bd', alpha=0.8)
    
    # Customize the chart
    ax.set_xlabel('Platform Capabilities', fontsize=12, weight='bold')
    ax.set_ylabel('Maturity Score (1-5)', fontsize=12, weight='bold')
    ax.set_title('Technology Platform Capability Comparison - Truist Bank', fontsize=14, weight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(capabilities, rotation=45)
    ax.legend(loc='upper right', fontsize=10)
    ax.grid(True, alpha=0.3)
    ax.set_ylim(0, 5)
    
    # Add value labels on bars
    def add_value_labels(bars):
        for bar in bars:
            height = bar.get_height()
            ax.annotate(f'{height}',
                        xy=(bar.get_x() + bar.get_width() / 2, height),
                        xytext=(0, 3),
                        textcoords="offset points",
                        ha='center', va='bottom',
                        fontsize=9, weight='bold')
    
    # Add value labels
    for container in ax.containers:
        add_value_labels(container)
    
    plt.tight_layout()
    
    # Save as high-quality PNG and SVG
    plt.savefig('/workspace/final_framework/technology_comparison.png', dpi=300, bbox_inches='tight')
    plt.savefig('/workspace/final_framework/technology_comparison.svg', format='svg', bbox_inches='tight')
    plt.close()
    
    return "Technology comparison chart created successfully!"

def create_sox_compliance_dashboard():
    """Create SOX compliance status dashboard"""
    
    # SOX compliance data
    control_categories = ['Access Controls', 'Change Management', 'Data Integrity', 'IT General Controls']
    current_compliance = [85, 92, 78, 88]  # Current compliance percentage
    target_compliance = [95, 98, 90, 95]   # Target compliance
    gaps = [10, 6, 12, 7]                  # Compliance gaps
    
    # Create the dashboard
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
    
    # Compliance status chart
    x = np.arange(len(control_categories))
    width = 0.35
    
    bars1 = ax1.bar(x - width/2, current_compliance, width, label='Current', color='lightcoral', alpha=0.8)
    bars2 = ax1.bar(x + width/2, target_compliance, width, label='Target', color='lightgreen', alpha=0.8)
    
    # Customize first chart
    ax1.set_xlabel('SOX Control Categories', fontsize=12, weight='bold')
    ax1.set_ylabel('Compliance Percentage', fontsize=12, weight='bold')
    ax1.set_title('SOX Compliance Status - Truist Bank', fontsize=14, weight='bold')
    ax1.set_xticks(x)
    ax1.set_xticklabels(control_categories, rotation=45)
    ax1.legend(fontsize=10)
    ax1.grid(True, alpha=0.3)
    ax1.set_ylim(0, 100)
    
    # Add percentage labels
    for bars in [bars1, bars2]:
        for bar in bars:
            height = bar.get_height()
            ax1.annotate(f'{height}%',
                        xy=(bar.get_x() + bar.get_width() / 2, height),
                        xytext=(0, 3),
                        textcoords="offset points",
                        ha='center', va='bottom',
                        fontsize=10, weight='bold')
    
    # Gap analysis chart
    bars3 = ax2.bar(x, gaps, color='orange', alpha=0.7)
    ax2.set_xlabel('SOX Control Categories', fontsize=12, weight='bold')
    ax2.set_ylabel('Compliance Gap (%)', fontsize=12, weight='bold')
    ax2.set_title('SOX Compliance Gaps - Action Required', fontsize=14, weight='bold')
    ax2.set_xticks(x)
    ax2.set_xticklabels(control_categories, rotation=45)
    ax2.grid(True, alpha=0.3)
    
    # Highlight high-risk gaps
    for i, bar in enumerate(bars3):
        height = bar.get_height()
        color = 'red' if height > 10 else 'black'
        weight = 'bold' if height > 10 else 'normal'
        ax2.annotate(f'{height}%',
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 3),
                    textcoords="offset points",
                    ha='center', va='bottom',
                    color=color, weight=weight, fontsize=10)
    
    plt.tight_layout()
    
    # Save as high-quality PNG and SVG
    plt.savefig('/workspace/final_framework/sox_compliance_dashboard.png', dpi=300, bbox_inches='tight')
    plt.savefig('/workspace/final_framework/sox_compliance_dashboard.svg', format='svg', bbox_inches='tight')
    plt.close()
    
    return "SOX compliance dashboard created successfully!"

def create_pii_protection_dashboard():
    """Create PII protection status dashboard"""
    
    # PII protection data
    pii_categories = ['Customer Data', 'Employee Data', 'Financial Data', 'Health Data']
    protection_levels = [92, 88, 95, 76]  # Current protection percentage
    risk_levels = [8, 12, 5, 24]         # Risk exposure percentage
    target_protection = [98, 95, 98, 90]
    
    # Create the dashboard
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
    
    # Protection levels
    x = np.arange(len(pii_categories))
    width = 0.35
    
    bars1 = ax1.bar(x - width/2, protection_levels, width, label='Current', color='lightblue', alpha=0.8)
    bars2 = ax1.bar(x + width/2, target_protection, width, label='Target', color='darkblue', alpha=0.8)
    
    # Customize first chart
    ax1.set_xlabel('PII Data Categories', fontsize=12, weight='bold')
    ax1.set_ylabel('Protection Percentage', fontsize=12, weight='bold')
    ax1.set_title('PII Protection Status - Truist Bank', fontsize=14, weight='bold')
    ax1.set_xticks(x)
    ax1.set_xticklabels(pii_categories, rotation=45)
    ax1.legend(fontsize=10)
    ax1.grid(True, alpha=0.3)
    ax1.set_ylim(0, 100)
    
    # Add percentage labels
    for bars in [bars1, bars2]:
        for bar in bars:
            height = bar.get_height()
            ax1.annotate(f'{height}%',
                        xy=(bar.get_x() + bar.get_width() / 2, height),
                        xytext=(0, 3),
                        textcoords="offset points",
                        ha='center', va='bottom',
                        fontsize=10, weight='bold')
    
    # Risk levels with critical highlighting
    bars3 = ax2.bar(x, risk_levels, color='orange', alpha=0.7)
    ax2.set_xlabel('PII Data Categories', fontsize=12, weight='bold')
    ax2.set_ylabel('Risk Exposure (%)', fontsize=12, weight='bold')
    ax2.set_title('PII Risk Exposure - Immediate Action Required', fontsize=14, weight='bold')
    ax2.set_xticks(x)
    ax2.set_xticklabels(pii_categories, rotation=45)
    ax2.grid(True, alpha=0.3)
    
    # Highlight critical risks
    for i, bar in enumerate(bars3):
        height = bar.get_height()
        if height > 15:  # Critical threshold
            ax2.annotate(f'{height}%\nHIGH RISK',
                        xy=(bar.get_x() + bar.get_width() / 2, height),
                        xytext=(0, 3),
                        textcoords="offset points",
                        ha='center', va='bottom',
                        color='red', weight='bold', fontsize=10)
        else:
            ax2.annotate(f'{height}%',
                        xy=(bar.get_x() + bar.get_width() / 2, height),
                        xytext=(0, 3),
                        textcoords="offset points",
                        ha='center', va='bottom',
                        fontsize=10)
    
    plt.tight_layout()
    
    # Save as high-quality PNG and SVG
    plt.savefig('/workspace/final_framework/pii_protection_dashboard.png', dpi=300, bbox_inches='tight')
    plt.savefig('/workspace/final_framework/pii_protection_dashboard.svg', format='svg', bbox_inches='tight')
    plt.close()
    
    return "PII protection dashboard created successfully!"

def create_implementation_roadmap():
    """Create technology implementation roadmap timeline"""
    
    # Implementation timeline data
    initiatives = ['Snowflake\nOptimization', 'Talend\nEnhancement', 'AI/ML\nPlatform', 
                   'Monitoring\nUnified', 'FinOps\nAnalytics', 'Security\nEnhanced']
    quarters = ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025', 'Q2 2025']
    
    # Implementation phases (quarters active)
    implementation_timeline = {
        'Snowflake Optimization': [1, 1, 0, 0, 0, 0],      # Q1-Q2 active
        'Talend Enhancement': [1, 1, 1, 0, 0, 0],          # Q1-Q3 active
        'AI/ML Platform': [0, 1, 1, 1, 0, 0],             # Q2-Q4 active
        'Monitoring Unified': [1, 1, 0, 0, 0, 0],         # Q1-Q2 active
        'FinOps Analytics': [0, 0, 1, 1, 0, 0],           # Q3-Q4 active
        'Security Enhanced': [0, 0, 0, 1, 1, 0]           # Q4-Q1'25 active
    }
    
    # Create the roadmap
    fig, ax = plt.subplots(figsize=(14, 8))
    
    # Color mapping
    colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b']
    
    y_pos = np.arange(len(initiatives))
    
    # Plot implementation phases
    for i, (initiative, timeline) in enumerate(implementation_timeline.items()):
        for j, active in enumerate(timeline):
            if active:
                ax.barh(i, 1, left=j, color=colors[i], alpha=0.8, edgecolor='black', linewidth=1)
            else:
                ax.barh(i, 1, left=j, color='lightgray', alpha=0.3, edgecolor='black', linewidth=1)
    
    # Customize the chart
    ax.set_yticks(y_pos)
    ax.set_yticklabels(initiatives, fontsize=11)
    ax.set_xlabel('Implementation Timeline (Quarters)', fontsize=12, weight='bold')
    ax.set_title('Technology Implementation Roadmap - Truist Bank (MAPS Aligned)', fontsize=14, weight='bold')
    ax.set_xticks(range(len(quarters)))
    ax.set_xticklabels(quarters, rotation=45)
    ax.grid(True, alpha=0.3, axis='x')
    
    # Add legend
    legend_elements = [plt.Rectangle((0,0),1,1, facecolor=colors[i], edgecolor='black', 
                                     label=initiatives[i].replace('\n', ' ')) for i in range(len(initiatives))]
    ax.legend(handles=legend_elements, loc='upper right', bbox_to_anchor=(1.15, 1.0), fontsize=10)
    
    plt.tight_layout()
    
    # Save as high-quality PNG and SVG
    plt.savefig('/workspace/final_framework/implementation_roadmap.png', dpi=300, bbox_inches='tight')
    plt.savefig('/workspace/final_framework/implementation_roadmap.svg', format='svg', bbox_inches='tight')
    plt.close()
    
    return "Implementation roadmap created successfully!"

def create_executive_summary_dashboard():
    """Create executive summary dashboard with key metrics"""
    
    # Key metrics data
    metrics = {
        'Overall Technology Maturity': {'current': 2.8, 'target': 4.0, 'industry': 3.2},
        'SOX Compliance Score': {'current': 85, 'target': 95, 'industry': 88},
        'PII Protection Level': {'current': 88, 'target': 95, 'industry': 85},
        'Cost Optimization': {'current': 15, 'target': 25, 'industry': 12},
        'Team Alignment': {'current': 3.1, 'target': 4.0, 'industry': 3.5}
    }
    
    # Create summary dashboard
    fig, axes = plt.subplots(2, 3, figsize=(16, 10))
    axes = axes.flatten()
    
    colors = ['#e74c3c', '#27ae60', '#3498db']
    labels = ['Current', 'Target', 'Industry Avg']
    
    for i, (metric, values) in enumerate(metrics.items()):
        ax = axes[i]
        
        # Create bar chart
        x_pos = np.arange(len(labels))
        bars = ax.bar(x_pos, [values['current'], values['target'], values['industry']], 
                     color=colors, alpha=0.7)
        
        # Customize chart
        ax.set_title(metric, fontsize=12, weight='bold')
        ax.set_xticks(x_pos)
        ax.set_xticklabels(labels, fontsize=10)
        ax.grid(True, alpha=0.3)
        
        # Add value labels
        for j, bar in enumerate(bars):
            height = bar.get_height()
            unit = "%" if "Score" in metric or "Level" in metric else ""
            ax.annotate(f'{height}{unit}',
                       xy=(bar.get_x() + bar.get_width() / 2, height),
                       xytext=(0, 3),
                       textcoords="offset points",
                       ha='center', va='bottom',
                       fontsize=10, weight='bold')
    
    # Remove empty subplot
    fig.delaxes(axes[5])
    
    # Add overall title
    fig.suptitle('Truist Bank Technology Assessment - Executive Summary Dashboard', 
                 fontsize=16, weight='bold', y=0.98)
    
    plt.tight_layout()
    
    # Save as high-quality PNG and SVG
    plt.savefig('/workspace/final_framework/executive_summary_dashboard.png', dpi=300, bbox_inches='tight')
    plt.savefig('/workspace/final_framework/executive_summary_dashboard.svg', format='svg', bbox_inches='tight')
    
    return "Executive summary dashboard created successfully!"

def main():
    """Main function to generate all visualizations"""
    
    print("🚀 Generating Truist Bank Technology Assessment Visualizations...")
    print("=" * 60)
    
    try:
        # Generate all visualizations
        print("1. Creating maturity radar chart...")
        result1 = create_maturity_radar_chart()
        print(f"   ✅ {result1}")
        
        print("2. Creating technology comparison chart...")
        result2 = create_technology_comparison()
        print(f"   ✅ {result2}")
        
        print("3. Creating SOX compliance dashboard...")
        result3 = create_sox_compliance_dashboard()
        print(f"   ✅ {result3}")
        
        print("4. Creating PII protection dashboard...")
        result4 = create_pii_protection_dashboard()
        print(f"   ✅ {result4}")
        
        print("5. Creating implementation roadmap...")
        result5 = create_implementation_roadmap()
        print(f"   ✅ {result5}")
        
        print("6. Creating executive summary dashboard...")
        result6 = create_executive_summary_dashboard()
        print(f"   ✅ {result6}")
        
        print("\n" + "=" * 60)
        print("🎉 All visualizations created successfully!")
        print("\n📁 Files saved to: /workspace/final_framework/")
        print("\nGenerated visualization files:")
        print("  • maturity_radar_chart.png & .svg")
        print("  • technology_comparison.png & .svg")
        print("  • sox_compliance_dashboard.png & .svg")
        print("  • pii_protection_dashboard.png & .svg")
        print("  • implementation_roadmap.png & .svg")
        print("  • executive_summary_dashboard.png & .svg")
        print("\n📊 Visualizations are ready for web presentation and executive reporting!")
        
    except Exception as e:
        print(f"❌ Error generating visualizations: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    if success:
        print("\n✨ Visualization generation complete! All charts are ready for presentation.")
    else:
        print("\n❌ Visualization generation failed. Please check the error messages above.")