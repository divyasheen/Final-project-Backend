import { faker } from "@faker-js/faker";
import Product from "../models/products.js";
import { connect2DB } from "./db.js";
import dotenv from 'dotenv';
dotenv.config();
connect2DB();

const cat = ['men', 'women', 'kids']
export function createRandomProduct() {
  return {
    title: faker.commerce.productName(),
    price: faker.commerce.price(),
    category: faker.helpers.arrayElement(cat),
    description: faker.commerce.product.description
  };
}
export const products = faker.helpers.multiple(createRandomProduct, {
  count: 100,
});

await Product.insertMany(products);