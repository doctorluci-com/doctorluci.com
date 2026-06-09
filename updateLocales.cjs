const fs = require('fs');

const cartEn = {
  addToCart: "Add to Cart",
  viewCart: "View Cart",
  continueShopping: "Continue Shopping",
  yourCart: "Your Cart",
  empty: "Your cart is empty.",
  total: "Total",
  checkout: "Proceed to Checkout",
  remove: "Remove",
  emailPlaceholder: "Email for digital delivery"
};

const cartRo = {
  addToCart: "Adaugă în coș",
  viewCart: "Vezi coșul",
  continueShopping: "Continuă cumpărăturile",
  yourCart: "Coșul tău",
  empty: "Coșul tău este gol.",
  total: "Total",
  checkout: "Finalizează comanda",
  remove: "Elimină",
  emailPlaceholder: "Email pentru livrarea digitală"
};

const cartRu = {
  addToCart: "В корзину",
  viewCart: "Просмотр корзины",
  continueShopping: "Продолжить покупки",
  yourCart: "Ваша корзина",
  empty: "Ваша корзина пуста.",
  total: "Итого",
  checkout: "Оформить заказ",
  remove: "Удалить",
  emailPlaceholder: "Email для доставки"
};

const cartEs = {
  addToCart: "Añadir al carrito",
  viewCart: "Ver carrito",
  continueShopping: "Seguir comprando",
  yourCart: "Tu carrito",
  empty: "Tu carrito está vacío.",
  total: "Total",
  checkout: "Finalizar compra",
  remove: "Eliminar",
  emailPlaceholder: "Correo electrónico"
};

const locales = [
  { file: './src/i18n/locales/en.json', data: cartEn },
  { file: './src/i18n/locales/ro.json', data: cartRo },
  { file: './src/i18n/locales/ru.json', data: cartRu },
  { file: './src/i18n/locales/es.json', data: cartEs }
];

for (const loc of locales) {
  let content = JSON.parse(fs.readFileSync(loc.file, 'utf8'));
  content.cart = loc.data;
  fs.writeFileSync(loc.file, JSON.stringify(content, null, 2) + '\n');
}
console.log("Updated locales");
