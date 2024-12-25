import App from "./app";
import AuthenticationController from "./authentication/authentication.controller";
import CategoryController from "./category/category.controller";
import OfferController from "./offer/offer.controller";
import OrderController from "./order/order.controller";
import ProductController from "./product/product.controller";
import UserController from "./user/user.controller";

const app = new App([
    new AuthenticationController(),
    new UserController(),
    new OrderController(),
    new OfferController(),
    new ProductController(),
    new CategoryController(),
]);

app.connectToTheDatabase()
    .then(msg => {
        console.log(msg);
    })
    .catch(err => {
        console.log(err);
    });
