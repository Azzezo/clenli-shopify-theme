class ProductForm extends HTMLElement {
    constructor() {
        super();   

        this.form = this.querySelector('form');
        this.cartNotification = document.querySelector('cart-notification');

        // Only register the Dawn-style submit handler if cart-notification exists.
        // Ella's theme uses its own AJAX add-to-cart system in theme.js
        // (halo.initAddToCart) which listens for click events on [data-btn-addtocart].
        // If we register a submit handler without cart-notification, it will crash
        // and cause a full page reload instead of AJAX add-to-cart.
        if (this.cartNotification) {
            this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        }
    }

    onSubmitHandler(evt) {
        evt.preventDefault();
        this.cartNotification.setActiveElement(document.activeElement);
    
        const submitButton = this.querySelector('[type="submit"]');

        submitButton.setAttribute('disabled', true);
        submitButton.classList.add('loading');

        const body = JSON.stringify({
            ...JSON.parse(serializeForm(this.form)),
            sections: this.cartNotification.getSectionsToRender().map((section) => section.id),
            sections_url: window.location.pathname
        });

        fetch(`${routes.cart_add_url}`, { ...fetchConfig('javascript'), body })
        .then((response) => response.json())
        .then((parsedState) => {
            this.cartNotification.renderContents(parsedState);
        })
        .catch((e) => {
            console.error(e);
        })
        .finally(() => {
            submitButton.classList.remove('loading');
            submitButton.removeAttribute('disabled');
        });
    }
}

customElements.define('product-form', ProductForm);
