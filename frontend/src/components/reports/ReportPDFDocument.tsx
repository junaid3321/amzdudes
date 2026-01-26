import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Report, Client, PerformanceDataPoint } from '@/types';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #3b82f6',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
    borderBottom: '1 solid #e5e7eb',
    paddingBottom: 5,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  metricLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  metricChange: {
    fontSize: 10,
    marginTop: 4,
  },
  positive: {
    color: '#10b981',
  },
  negative: {
    color: '#ef4444',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e5e7eb',
    paddingVertical: 8,
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    color: '#374151',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#9ca3af',
    borderTop: '1 solid #e5e7eb',
    paddingTop: 10,
  },
  summaryText: {
    fontSize: 11,
    color: '#4b5563',
    lineHeight: 1.6,
  },
});

interface ReportPDFDocumentProps {
  report: Report;
  client: Client;
  performanceData: PerformanceDataPoint[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export function ReportPDFDocument({ report, client, performanceData }: ReportPDFDocumentProps) {
  const totalRevenue = performanceData.reduce((sum, d) => sum + d.revenue, 0);
  const totalAdSpend = performanceData.reduce((sum, d) => sum + d.adSpend, 0);
  const totalOrders = performanceData.reduce((sum, d) => sum + d.orders, 0);
  const avgRoas = totalAdSpend > 0 ? totalRevenue / totalAdSpend : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{report.name}</Text>
          <Text style={styles.subtitle}>
            {client.companyName} • Generated on {formatDate(report.createdAt)}
          </Text>
        </View>

        {/* Executive Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <Text style={styles.summaryText}>
            This report provides a comprehensive overview of {client.companyName}'s performance 
            for the reporting period. The client currently has a health score of {client.healthScore}/100 
            ({client.healthStatus}) with {client.alertsActive} active alerts requiring attention.
          </Text>
        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Performance Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total Revenue</Text>
              <Text style={styles.metricValue}>{formatCurrency(totalRevenue)}</Text>
              <Text style={[styles.metricChange, styles.positive]}>+12.5% vs prior period</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Ad Spend</Text>
              <Text style={styles.metricValue}>{formatCurrency(totalAdSpend)}</Text>
              <Text style={[styles.metricChange, styles.negative]}>+5.2% vs prior period</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>ROAS</Text>
              <Text style={styles.metricValue}>{avgRoas.toFixed(2)}x</Text>
              <Text style={[styles.metricChange, styles.positive]}>+0.3x vs prior period</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total Orders</Text>
              <Text style={styles.metricValue}>{totalOrders.toLocaleString()}</Text>
              <Text style={[styles.metricChange, styles.positive]}>+8.7% vs prior period</Text>
            </View>
          </View>
        </View>

        {/* Performance Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Performance Breakdown</Text>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Date</Text>
            <Text style={styles.tableCell}>Revenue</Text>
            <Text style={styles.tableCell}>Ad Spend</Text>
            <Text style={styles.tableCell}>Orders</Text>
            <Text style={styles.tableCell}>ROAS</Text>
          </View>
          {performanceData.slice(-7).map((data, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{data.date}</Text>
              <Text style={styles.tableCell}>{formatCurrency(data.revenue)}</Text>
              <Text style={styles.tableCell}>{formatCurrency(data.adSpend)}</Text>
              <Text style={styles.tableCell}>{data.orders}</Text>
              <Text style={styles.tableCell}>
                {data.adSpend > 0 ? (data.revenue / data.adSpend).toFixed(2) : '0.00'}x
              </Text>
            </View>
          ))}
        </View>

        {/* Client Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Information</Text>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Package: {client.package}</Text>
            <Text style={styles.tableCell}>MRR: {formatCurrency(client.mrr)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Account Manager: {client.assignedManager}</Text>
            <Text style={styles.tableCell}>Active Since: {formatDate(client.activeSince)}</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          ClientMax Pro • Confidential Report • Page 1 of 1
        </Text>
      </Page>
    </Document>
  );
}
