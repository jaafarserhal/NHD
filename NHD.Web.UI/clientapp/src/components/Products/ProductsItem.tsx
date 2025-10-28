import { Product } from "../../api/common/Types";


const ProductItem: React.FC<{ product: Product }> = ({ product }) => (
    <div className="col mb-50">
        <div className="product-item text-center">
            <div className={`product-item__badge ${!product.isHot ? 'd-none' : ''}`}>
                {product.isHot && 'Hot'}
            </div>
            <div className="product-item__image border w-100">
                <a href="single-product.html">
                    <img width="350" height="350" src={product.image} alt={product.name} />
                </a>
                <ul className="product-item__meta">
                    <li className="product-item__meta-action">
                        <a className="shadow-1 labtn-icon-quickview" href="#/" data-bs-tooltip="tooltip" title="Quick View" />
                    </li>
                    <li className="product-item__meta-action">
                        <a className="shadow-1 labtn-icon-cart" href="#/" data-bs-tooltip="tooltip" title="Add to Cart" />
                    </li>
                    <li className="product-item__meta-action">
                        <a className="shadow-1 labtn-icon-wishlist" href="#/" data-bs-tooltip="tooltip" title="Add to wishlist" />
                    </li>
                    <li className="product-item__meta-action">
                        <a className="shadow-1 labtn-icon-compare" href="#/" data-bs-tooltip="tooltip" title="Add to compare" />
                    </li>
                </ul>
            </div>
            <div className="product-item__content pt-5">
                <h5 className="product-item__title">
                    <a href="single-product.html">{product.name}</a>
                </h5>
                <span className="product-item__price">{product.price}</span>
            </div>
        </div>
    </div>
);

export default ProductItem;