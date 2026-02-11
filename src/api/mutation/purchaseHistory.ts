import { gql } from "@apollo/client";

export const PURCHASE_HISTORY = gql`
  query GetCustomerHistory {
    activeCustomer {
      orders(options: { take: 10, sort: { createdAt: DESC } }) {
        items {
          id
          code
          createdAt
          state
          totalWithTax
          currencyCode
          lines {
            id
            featuredAsset {
              source
            }
            productVariant {
              name
              priceWithTax
            }
          }
        }
      }
    }
  }
`;
