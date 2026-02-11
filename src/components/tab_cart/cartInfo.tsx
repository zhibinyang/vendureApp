import React from "react";
import { Text, View } from "react-native";
import styles from "./style/styles.cart";

import { formatCurrency } from "../../utils/currency";

interface TaxSummary {
  description: string;
  taxRate: number;
  taxBase: number;
  taxTotal: number;
}

interface Order {
  taxSummary: TaxSummary[];
  currencyCode?: string;
}

const CartInfo: React.FC<Order> = ({ taxSummary, currencyCode = 'EUR' }) => {
  return (
    <View style={styles.container}>
      {taxSummary.map((summary, index) => (
        <View key={index}>
          <View style={styles.infoRow_CartInfo}>
            <Text>Description</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.label}>{summary.description}</Text>
            </View>
          </View>

          <View style={styles.infoRow_CartInfo}>
            <Text>Tax Rate</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.label}>{summary.taxRate}%</Text>
            </View>
          </View>

          <View style={styles.infoRow_CartInfo}>
            <Text>Taxe Base</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.label}>{formatCurrency(summary.taxBase, currencyCode)}</Text>
            </View>
          </View>

          <View style={[styles.infoRow_CartInfo, { borderBottomColor: '#fff' }]}>
            <Text style={styles.label}>Total Taxes</Text>
            <View style={styles.priceContainer}>
              <Text>{formatCurrency(summary.taxTotal, currencyCode)}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

export default CartInfo;
