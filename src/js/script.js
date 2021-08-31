/* eslint-disable no-unused-vars */
/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', 
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },  
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },  
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML), 
  };

  class Product { 
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
    }

    renderInMenu()  {
      const thisProduct = this;
      const generateHTML = templates.menuProduct(thisProduct.data);
      thisProduct.element = utils.createDOMFromHTML(generateHTML);
      const manuContainer = document.querySelector(select.containerOf.menu);
      manuContainer.appendChild(thisProduct.element);
    }
    
    getElements(){
      const thisProduct = this;
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper =  thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion() {
      const thisProduct = this;

      thisProduct.accordionTrigger.addEventListener('click', function(event) {
        event.preventDefault();
        let selectedItem = thisProduct.id;
        const articles = document.getElementsByClassName('product');    
        for (let article of articles)
        {
          if (selectedItem == article.id)
          {
            article.classList.toggle('active');
          }
        }

      });   
    }

    initOrderForm() {
      const thisProduct = this;
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder()  {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      let price = thisProduct.data.price;
      let imageClass;

      for(let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];

        for(let optionId in param.options) {
          const option = param.options[optionId];

          if(formData[paramId] && formData[paramId].includes(optionId)) {
            if(!option.default == true)  {
              price += option.price;
            }
          }
          else {
            if(option.default == true)  {
              price -= option.price; 
            }
          }

          imageClass = '.' + paramId + '-' + optionId;
          const isOptionSelected = formData[paramId].includes(optionId);
          const imageElement = thisProduct.element.querySelector(imageClass);
          if (!imageElement) {
            continue;
          }

          isOptionSelected
            ? imageElement.classList.add(classNames.menuProduct.imageVisible)
            : imageElement.classList.remove(classNames.menuProduct.imageVisible);    
        } 
      } 
      thisProduct.priceSingle = price;
      price = price * thisProduct.amountWidget.value;
      thisProduct.priceElem.innerHTML = price;
    }

    initAmountWidget()  {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct,this.amountWidget.value = settings.amountWidget.defaultValue;
      thisProduct.amountWidgetElem.addEventListener('updated', function(update)  {
        thisProduct.processOrder();
      });
    }

    prepareCartProduct()  {
      const thisProduct = this;      
      const productSummary = {
        id:     thisProduct.data.id,
        name:   thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle, 
        price: thisProduct.priceSingle * thisProduct.amountWidget.value,
        params: thisProduct.prepareCartProductParams(),
      };
      return(productSummary);
    }

    addToCart() {
      const thisProduct = this;
      app.cart.add(thisProduct.prepareCartProduct());
    }

    prepareCartProductParams()  {
      const thisProduct = this;

      const formData = utils.serializeFormToObject(thisProduct.form);
      const params = {};
    
      for(let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
        params[paramId] = { 
          label: param.label,
          options: {},
        };
    
        for(let optionId in param.options) {  
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          if(optionSelected) { 
            const optionLabel = option.label;
            params[paramId].options[optionId] = optionLabel;
          }
        }
      }
      return params;
    }
  }

  class AmountWidget  { 

    constructor(element)  {
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions(thisWidget.input.value);
    }

    getElements(element)  {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value) {
      const thisWidget = this;
      const newValue = parseInt(value);
      
      if (thisWidget.value != newValue && !isNaN(newValue)) {
        if(newValue>=settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax)  {
          thisWidget.value = newValue;
          this.announce();
        } else if (newValue < settings.amountWidget.defaultMin) {
          thisWidget.input.value = 1;
        } else if (newValue > settings.amountWidget.defaultMax)  {
          thisWidget.input.value = 9;
        }
      } else  {
        thisWidget.input.value = 1;
      }
    }

    initActions() {
      const thisWidget = this;
      
      thisWidget.input.addEventListener('change', function(change)  {
        thisWidget.setValue(thisWidget.input.value);        
      });

      thisWidget.linkDecrease.addEventListener('click', function(event)  {
        event.preventDefault();
        thisWidget.input.value  = parseInt(thisWidget.input.value) - 1;
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkIncrease.addEventListener('click', function(event)  {
        event.preventDefault();
        thisWidget.input.value  = parseInt(thisWidget.input.value) + 1;
        thisWidget.setValue(thisWidget.input.value);
      });
    }

    announce() {
      const thisWidget = this;
      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }

  //////////////////////////////////////////////////////CART START
  class cart  {
    constructor(element)  {
      const thisCart = this;
      thisCart.products =[];
      thisCart.getElements(element);
      thisCart.initAction();
    }

    getElements(element)  {
      const thisCart = this;

      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subTotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelector(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    }

    initAction()  {
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(event)  {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }

    add(menuProduct)  {
      const thisCart = this;
      const generateHTML = templates.cartProduct(menuProduct);
      const generateDOM = utils.createDOMFromHTML(generateHTML);
      thisCart.dom.productList.appendChild(generateDOM);
      thisCart.products.push(new cartProduct(menuProduct, generateDOM));
      thisCart.update();
    }

    update()  {
      const thisCart = this;
      const deliveryFee = settings.cart.defaultDeliveryFee;
      //console.log(deliveryFee);   //tu mam problem :)
      let totalNumber = 0;
      let subtotalPrice = 0;
      
      for (let cartProduct of thisCart.products)  {
        totalNumber += cartProduct.amount;
        subtotalPrice += cartProduct.price;
      }

      if (totalNumber == 0) {
        deliveryFee == 0;
      } else {
        const total = deliveryFee + subtotalPrice;

        thisCart.dom.subTotalPrice.innerHTML = subtotalPrice;
        thisCart.dom.subTotalPrice.innerHTML = subtotalPrice;
        thisCart.dom.subTotalPrice.innerHTML = subtotalPrice;
        
        for (const totalElement of thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice)) {
          totalElement.innerHTML = total;
        }
      }
    }
  }

  class cartAmountWidget  {     //similar function needed to change

    constructor(element)  {
      const thisCartWidget = this;
      thisCartWidget.getElements(element);
      thisCartWidget.initCartActions();
    }

    getElements(element)  {
      const thisCartWidget = this;
      thisCartWidget.input = element.dom.amountWidget.querySelector(select.widgets.amount.input);
      thisCartWidget.less = element.dom.amountWidget.querySelector('a[href=\'#less\']');
      thisCartWidget.more = element.dom.amountWidget.querySelector('a[href=\'#more\']');
    }

    setValue(value) {
      const thisCartWidget = this;
      const newValue = parseInt(value);
     
      if (!isNaN(newValue)) {
        if(newValue>=settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax)  {
          thisCartWidget.input.value = newValue;  //ta jebana linijka nie działa, nei zmienia wartości w Inpucie
          //this.announce();
        } else if (newValue < settings.amountWidget.defaultMin) {
          thisCartWidget.input.value = 1;
        } else if (newValue > settings.amountWidget.defaultMax)  {
          thisCartWidget.input.value = 9;
        }
      } else  {
        thisCartWidget.input.value = 1;
      }
    }

    initCartActions() {
      const thisCartWidget = this;
      thisCartWidget.more.addEventListener('click', function(event)  {
        event.preventDefault();
        thisCartWidget.input.value = parseInt(thisCartWidget.input.value) + 1;
        thisCartWidget.setValue(thisCartWidget.input.value);
      });

      thisCartWidget.less.addEventListener('click', function(event)  {
        event.preventDefault();
        thisCartWidget.input.value = parseInt(thisCartWidget.input.value) - 1;
        thisCartWidget.setValue(thisCartWidget.input.value);
      });
      /*
      thisCartWidget.input.addEventListener('change', function(change)  {
        console.log('Changed');
        thisCartWidget.setValue(thisCartWidget.input);        
      });
      */
    }
    
    
    /* do zrobienia w wolnej chwili XD
    announce() {
      const thisCartWidget = this;
      const event = new Event('updated');
      thisCartWidget.dispatchEvent(event);
    }
    */
  }

  class cartProduct  {
    constructor(menuProduct, element)  {
      const thisCartProduct = this;
      thisCartProduct.getElements(element);
      
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.params = menuProduct.params;   

      thisCartProduct.cartInitAmountButtons();
    }

    getElements(element)  {
      const thisCartProduct = this;
      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
        
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    cartInitAmountButtons() {
      const thisCartProduct = this;
      new cartAmountWidget(thisCartProduct);
      /*
      thisCartProduct.cartAmountWidget.addEventListener('updated', function(update)  {
        thisCartProduct.processOrder();
      });
      */
    }
  }

  const app = {
    initMenu: function() {
      const thisApp = this;
      for (let productData in thisApp.data.products)  {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initCart: function()  {
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new cart(cartElem);
    },

    initData: function()  {
      const thisApp = this;
      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}
