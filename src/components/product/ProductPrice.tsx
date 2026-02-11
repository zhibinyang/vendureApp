import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

import { formatCurrency } from '../../utils/currency';

interface ProductPriceProps {
  price: number;
  currencyCode?: string;
}

const ProductPrice: React.FC<ProductPriceProps> = ({ price, currencyCode = 'EUR' }) => {
  return (
    <View style={[styles.container && styles.columnReverse]}>
      <View style={styles.priceContainer}>
        <Text style={styles.priceText}>
          {formatCurrency(price, currencyCode)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  columnReverse: {
    flexDirection: 'column-reverse',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: moderateScale(15, 0.001),
    color: '#333'
  },
});

export default ProductPrice;

