// components/FilterPanel.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Platform, TouchableOpacity } from 'react-native';

interface Props {
  onApply: (filters: {
    searchTerm?: string;
    minWage?: string;
    maxWage?: string;
  }) => void;
}

const FilterPanel: React.FC<Props> = ({ onApply }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [minWage, setMinWage] = useState('');
  const [maxWage, setMaxWage] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Keyword</Text>
      <TextInput
        style={styles.input}
        placeholder="Search..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      <Text style={styles.label}>Wage Range</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 8 }]}
          placeholder="Min"
          value={minWage}
          onChangeText={setMinWage}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Max"
          value={maxWage}
          onChangeText={setMaxWage}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity
        style={styles.applyButton}
        onPress={() =>
          onApply({
            searchTerm: searchTerm.trim() || undefined,
            minWage: minWage || undefined,
            maxWage: maxWage || undefined,
          })
        }
      >
        <Text style={styles.applyText}>Apply Filters</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#FFF7DC',
    borderRadius: 8,
    borderColor: '#893030',
    borderWidth: 1,
  },
  label: {
    fontWeight: 'bold',
    color: '#893030',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
  },
  applyButton: {
    backgroundColor: '#893030',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  applyText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default FilterPanel;
