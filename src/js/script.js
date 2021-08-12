/* eslint-disable no-unused-vars */
/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
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
      });
    }

    

    processOrder()  {
      console.log('*****BEGIN LOOP*****');
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      let price = thisProduct.data.price;
      let imageClass;
      for(let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];

        for(let optionId in param.options) {
          const option = param.options[optionId];
          //changing price
          if(formData[paramId] && formData[paramId].includes(optionId)) {
            if(!option.default == true)  {
              price += option.price;
              //console.log('Param Id', paramId);
              //console.log('Option Id', optionId);
              //console.log('Option', option);
              //console.log('formData[paramId]', formData[paramId]);

              //image: generating class name
            }
          }
          else {
            if(option.default == true)  {
              price -= option.price; 
            }
          }

          imageClass = paramId + '-' + optionId;
          if(formData[paramId].includes(optionId)) {
            console.log(imageClass,'Checked');
          }


          
        } //end of interior loop
      }
      thisProduct.priceElem.innerHTML = price;
    }
  }


  const app = {
    initMenu: function() {
      const thisApp = this;
      for (let productData in thisApp.data.products)  {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function()  {
      const thisApp = this;
      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
