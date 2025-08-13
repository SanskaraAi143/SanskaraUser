import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DashboardOverviewCardsProps {
  daysUntilWedding: number | string;
  weddingDate?: string | null;
  confirmedGuests: number;
  invitedGuests: number;
  spentBudget: number;
  totalBudget: number;
  completedTasks: number;
  totalTasks: number;
}

const StatCard = ({ title, value }: { title: string; value: string | number }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardValue}>{value}</Text>
  </View>
);

const DashboardOverviewCards: React.FC<DashboardOverviewCardsProps> = ({
  daysUntilWedding,
  confirmedGuests,
  invitedGuests,
  spentBudget,
  totalBudget,
  completedTasks,
  totalTasks,
}) => {
  return (
    <View style={styles.container}>
      <StatCard title="Days Until Wedding" value={daysUntilWedding} />
      <StatCard title="Guests" value={`${confirmedGuests} / ${invitedGuests}`} />
      <StatCard title="Budget" value={`₹${spentBudget.toLocaleString()} / ₹${totalBudget.toLocaleString()}`} />
      <StatCard title="Tasks" value={`${completedTasks} / ${totalTasks}`} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default DashboardOverviewCards;
