// JSON Data
var data = {
  "date": "2018-01-01",
  "serverName": "TestServer",
  "itemsNbr": 6,
  "items": [
    // Items remain unchanged
  ]
};

// Fetch Utility
const useFetch = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const fetchedData = await response.json();
    return { data: fetchedData, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};
// Optimize DOM rendering by batching updates
if (itemsContainer && data.items) {
  const htmlContent = data.items.map((item) => {
    return template
      .replace("{{product-title}}", item.title)
      .replace("{{image}}", item.img)
      .replace("{{price}}", `${item.cur}${item.price}`)
      .replace(/{{item-id}}/g, item.id)
      .replace("{{old-price-class}}", item.onSale ? "old-price" : "old-price hidden")
      .replace("{{old-price}}", item.onSale ? `${item.cur}${item.oldPrice}` : "");
  }).join('');
  itemsContainer.innerHTML = htmlContent;
}

// Event Delegation for buttons
itemsContainer.addEventListener("click", (event) => {
  const target = event.target;
  if (target.classList.contains("plus")) {
    const id = target.closest(".counter").querySelector(".count").dataset.id.split("-")[1];
    increase(id);
  } else if (target.classList.contains("minus")) {
    const id = target.closest(".counter").querySelector(".count").dataset.id.split("-")[1];
    decrease(id);
  } else if (target.closest(".add-basket")) {
    const id = target.closest("a").id;
    const type = target.closest("a").dataset.type;
    myclick(id, type);
  }
});

// Updated basket management functions remain unchanged


// Fetch Example
(async () => {
  const { data: fetchedData, error } = await useFetch("https://www.dbooks.org/api/recent");

  if (error) {
    console.error("Error fetching data:", error);
  } else if (fetchedData && fetchedData.books) {
    fetchedData.books.forEach((book) => console.log(book.title));
  }
})();

// Template and DOM Rendering
const template = `
<div class="col-lg-4 col-sm-6 col-xs-12 prod">
  <div class="product text-center">
    <img alt="" height="150px" src="{{image}}">
    <p class="product-title text-center">{{product-title}}</p>
    <span class="{{old-price-class}}">{{old-price}}</span>
    <span class="new-price">{{price}}</span>
    <div class="container-fluid">
      <div class="row">
        <div class="col-lg-6 col-sm-6 col-xs-6 product-details">
          <div class="counter">
            <a href="#/"><span class="minus" onclick="decrease({{item-id}})">-</span></a>
            <span data-id="counter-{{item-id}}" class="count">01</span>
            <a href="#/"><span class="plus" onclick="increase({{item-id}})">+</span></a>
          </div>
        </div>
        <div class="col-lg-6 col-sm-6 col-xs-6 product-details">
          <a id="{{item-id}}" href="#/" data-type="add" onclick="myclick(this.id, this.dataset.type)">
            <div class="add-basket">Add To Cart</div>
          </a>
        </div>
      </div>
    </div>
  </div>
</div>`;

const itemsContainer = document.querySelector(".product-list");
if (itemsContainer && data.items) {
  data.items.forEach((item) => {
    const filledTemplate = template
      .replace("{{product-title}}", item.title)
      .replace("{{image}}", item.img)
      .replace("{{price}}", `${item.cur}${item.price}`)
      .replace(/{{item-id}}/g, item.id)
      .replace("{{old-price-class}}", item.onSale ? "old-price" : "old-price hidden")
      .replace("{{old-price}}", item.onSale ? `${item.cur}${item.oldPrice}` : "");

    itemsContainer.insertAdjacentHTML("beforeend", filledTemplate);
  });
}

// Counter Functions
const updateCounter = (id, increment) => {
  const counter = document.querySelector(`[data-id="counter-${id}"]`);
  if (counter) {
    let counterValue = parseInt(counter.innerText, 10);
    counterValue = increment ? counterValue + 1 : Math.max(1, counterValue - 1);
    counter.innerText = counterValue.toString().padStart(2, "0");
  }
};

const increase = (id) => updateCounter(id, true);
const decrease = (id) => updateCounter(id, false);

// Basket Management
let myBasket = [];

const myclick = (id, opType) => {
  const counter = document.querySelector(`[data-id="counter-${id}"]`);
  if (!counter) return;

  const qty = parseInt(counter.innerText, 10);
  const itemIndex = myBasket.findIndex((item) => item.item_id === id);

  if (opType === "add") {
    if (itemIndex > -1) {
      myBasket[itemIndex].qty += qty;
    } else {
      myBasket.push({ item_id: id, qty });
    }
    toggleButtonState(id, "Remove", "remove");
  } else if (opType === "remove") {
    if (itemIndex > -1) {
      myBasket.splice(itemIndex, 1);
    }
    toggleButtonState(id, "Add To Cart", "add");
  }

  updateBasketStatus();
};

const toggleButtonState = (id, text, type) => {
  const button = document.querySelector(`[id="${id}"]`);
  if (button) {
    button.firstElementChild.innerText = text;
    button.dataset.type = type;
  }
};

const updateBasketStatus = () => {
  const basketBadge = document.querySelector(".basket-status");
  if (basketBadge) {
    basketBadge.innerText = myBasket.length;
  }
};
