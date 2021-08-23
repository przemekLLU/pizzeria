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
      });
    }

    

    processOrder()  {
      console.log('wywołano porces order!!');
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
      price = price * thisProduct.amountWidget.value;
      thisProduct.priceElem.innerHTML = price;
    }

    initAmountWidget()  {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct,this.amountWidget.value = settings.amountWidget.defaultValue;
      
      thisProduct.amountWidgetElem.addEventListener('updated', function(update)  {
        console.log('Wywołano zdażenie updated!');
        thisProduct.processOrder();
      });
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
      //console.log('Announce wywołane!!!!');
      const thisWidget = this;
      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
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
