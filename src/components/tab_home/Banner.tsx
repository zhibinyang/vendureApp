import React from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@apollo/client";

import FeedSectionContainer from "../common/FeedSectionContainer";
import ProductPrice from "../product/ProductPrice";
import { Product } from "../../../utils/interface";
import { moderateScale } from "react-native-size-matters";

export interface BannerProps {
  navigation: any;
  query: any;
  title: string;
}

const Banner: React.FC<BannerProps> = ({ navigation, query, title }) => {
  const { data, loading, error } = useQuery(query);

  if (loading || error) {
    return null;
  }

  const products: Product[] =
    data?.collection?.productVariants?.items?.map((item) => item.product) || [];

  return (
    <FeedSectionContainer title={title}>
      <FlashList
        data={products}
        renderItem={({ item, index }) => {
          const items_ = data?.collection?.productVariants?.items[index];
          const categoryID = data?.collection?.id;

          return (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Products", {
                  products: data?.collection?.productVariants?.items,
                  selectedIndex: index,
                  productVariantId: items_.id,
                  price: item.variants[0].priceWithTax,
                  netPrice: item.variants[0].price,
                  currencyCode: item.variants[0].currencyCode,
                  categoryID: categoryID
                });
              }}
            >
              <View
                style={[styles.imageContainer, { width: Math.round(moderateScale(250, 0.1)) }]}
                key={items_.id}
              >
                <Image
                  source={{ uri: item.featuredAsset.source || "" }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>
              <View>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={styles.text}
                >
                  {items_.name}
                </Text>

                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>Price: </Text>
                  <ProductPrice price={item.variants[0].priceWithTax} currencyCode={item.variants[0].currencyCode} />
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        horizontal={true}
        estimatedItemSize={300}
        estimatedListSize={{ height: 170, width: 200 }}
        showsHorizontalScrollIndicator={false}
      />
    </FeedSectionContainer>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    height: Math.round(moderateScale(150, 0.1)),
    marginRight: Math.round(moderateScale(-95, 0.1)),
  },
  image: {
    width: "60%",
    height: "100%",
    borderRadius: Math.round(moderateScale(10, 0.1)),
  },
  text: {
    color: "#4d4d4d",
    maxWidth: Math.round(moderateScale(155, 0.1)),
    marginTop: Math.round(moderateScale(3, 0.1)),
    textAlign: "left",
  },
  priceText: {
    marginRight: Math.round(moderateScale(5, 0.1)),
    color: "#4d4d4d",
  },
  priceContainer: {
    marginTop: Math.round(moderateScale(-1, 0.1)),
    flexDirection: "row",
  },
});

export default Banner;
