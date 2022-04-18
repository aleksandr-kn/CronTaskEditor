//HTTP
const http = new EasyHTTP();

// Storage Controller
const StorageCtrl = (function () {
  return {
    storeItem: function (item) {
      return http.post("http://127.0.0.1:80/cron_create", JSON.stringify(item));
    },
    getItemsFromStorage() {
      return http.get("http://127.0.0.1:80/cron_list");
    },
    updateItemStorage: function (updatedItem) {
      return http.post(
        "http://127.0.0.1:80/cron_edit",
        JSON.stringify(updatedItem)
      );
    },
    deleteItemFromStorage: function (itemID) {
      return http.post(
        "http://127.0.0.1:80/cron_delete",
        JSON.stringify({ id: itemID })
      );
    },
  };
})();

// Item Controller

const ItemCtrl = (function () {
  // Item Constructor
  const Item = function (itemData) {
    if (itemData.id !== undefined) {
      this.id = itemData.id;
    }
    this.name = itemData.name;
    this.execute = itemData.execute;

    if (itemData.data.word !== undefined && itemData.data.word !== "") {
      this.data = {
        word: itemData.data.word,
      };
    } else {
      this.data = {
        minute: itemData.data.minute === "" ? "*" : itemData.data.minute,
        hour: itemData.data.hour === "" ? "*" : itemData.data.hour,
        day: itemData.data.day === "" ? "*" : itemData.data.day,
        month: itemData.data.month === "" ? "*" : itemData.data.month,
        week: itemData.data.week === "" ? "*" : itemData.data.week,
      };
    }
  };

  // Data Structure / State
  var data = {
    items: [],
    currentItem: null,
  };

  return {
    createItem: function (itemData) {
      return new Item(itemData);
    },
    getItems: async function () {
      try {
        const response = await StorageCtrl.getItemsFromStorage();
        if (response.status === true) {
          data.items = response.data;
        } else {
          throw new Error("Ответ сервера != 200-299");
        }
      } catch (error) {
        UICtrl.showAlert(
          "Не удалось получить список cron задач.",
          "rounded  red"
        );
      }
      return data.items;
    },

    getItemById: function (id) {
      let found = null;
      data.items.forEach(function (item) {
        if (item.id === id) {
          found = item;
        }
      });
      return found;
    },
    getCurrentItem: function () {
      return data.currentItem;
    },
    setCurrentItem: function (item) {
      data.currentItem = item;
      return data.currentItem;
    },
    logData: function () {
      return data;
    },
  };
})();

// UI Controller
const UICtrl = (function () {
  const UISelectors = {
    itemList: "#item-list",
    collectionItem: ".collection-item",
    addBtn: ".add-btn",
    updateBtn: ".update-btn",
    deleteBtn: ".delete-btn",
    backBtn: ".back-btn",
    itemNameInput: "#item-name",
    itemCaloriesInput: "#item-calories",
    totalCalories: ".total-calories",
    executeInput: "#command",
    timeType: ".date-type",

    minuteInput: "#minute",
    hourInput: "#hour",
    dayInput: "#day",
    monthInput: "#month",
    weekdayInput: "#weekday",
    minuteInputWrapper: ".minute-wrapper",
    hourInputWrapper: ".hour-wrapper",
    dayInputWrapper: ".day-wrapper",
    monthInputWrapper: ".month-wrapper",
    weekdayInputWrapper: ".weekday-wrapper",

    keywordInput: ".keyword-date",
    keywordInputWrapper: ".keyword-date-wrapper",

    itemTable: "#item-table",
    itemTableBody: ".item-table-body",
    tablePlaceholder: ".table-placeholder",

    searchInput: "#search",
    searchInputWrapper: ".search-input-wrapper",
    clearSearch: ".clear-search",

    btnUp: ".btn-up",
  };

  return {
    // Returns item html element
    createListItem: function (item) {
      let dateString;
      if (item.data.word) {
        dateString = item.data.word;
      } else {
        dateString =
          item.data.minute +
          " " +
          item.data.hour +
          " " +
          item.data.day +
          " " +
          item.data.month +
          " " +
          item.data.week;
      }

      trElement = `
        <tr class="collection-item" id='item-${item.id}'>
          <td>${item.name ? item.name : ""}</td>
          <td>${item.execute}</td>
          <td>${dateString}</td>
          <td>
            <a href="#" class="secondary-content">
              <i class="edit-item fa fa-pencil fa-lg"></i>
            </a>
          </td>
        </tr>
        `;
      return trElement;
    },
    populateItemList: function (items) {
      let html = "";

      if (Array.isArray(items)) {
        items.forEach(function (item) {
          html += UICtrl.createListItem(item);
        });
        // Insert list items
        document.querySelector(UISelectors.itemTableBody).innerHTML = html;
      }
    },
    getItemInput: function () {
      let timeType = document.querySelector(UISelectors.timeType).checked
        ? "keyword"
        : "datetime";

      return {
        name: document.querySelector(UISelectors.itemNameInput).value,
        execute: document.querySelector(UISelectors.executeInput).value,
        timeType: timeType,
        minute: document.querySelector(UISelectors.minuteInput).value,
        hour: document.querySelector(UISelectors.hourInput).value,
        day: document.querySelector(UISelectors.dayInput).value,
        month: document.querySelector(UISelectors.monthInput).value,
        week: document.querySelector(UISelectors.weekdayInput).value,
        word: document.querySelector(UISelectors.keywordInput).value,
      };
    },
    validateItemInput: function (input) {
      let result;
      if (input.execute === "") {
        result = "Поле 'Исполняемый файл' не должно быть пустым.";
        return result;
      }

      if (input.timeType === "datetime") {
        if (
          // * OR [0-59] OR [0-59] - [0-59] OR [0-59] , [0-59]
          !input.minute.match(
            /(^$)|(^\*(\/([0-9]|[1-5]?[0-9]))?$)|(^([0-9]|[1-5]?[0-9])$)|(^([0-9]|[1-5]?[0-9])-([0-9]|[1-5]?[0-9])(\/([0-9]|[1-5]?[0-9]))?$)|(^(([0-9]|[1-5]?[0-9])((-([0-9]|[1-5]?[0-9])))?)(,(([0-9]|[1-5]?[0-9])((-([0-9]|[1-5]?[0-9])))?))+(\/([0-9]|[1-5]?[0-9]))?$)/
          )
        ) {
          result = "Пожалуйста проверьте поле 'Минута'.";
        } else if (
          // * OR [0-23] OR [0-23] - [0-23] OR [0-23] , [0-23]
          !input.hour.match(
            /(^$)|(^\*(\/(2[0-3]|[1]?[0-9]))?$)|(^(2[0-3]|[1]?[0-9])$)|(^(2[0-3]|[1]?[0-9])-(2[0-3]|[1]?[0-9])(\/(2[0-3]|[1]?[0-9]))?$)|(^((2[0-3]|[1]?[0-9])((-(2[0-3]|[1]?[0-9])))?)(,((2[0-3]|[1]?[0-9])((-(2[0-3]|[1]?[0-9])))?))+(\/(2[0-3]|[1]?[0-9]))?$)/
          )
        ) {
          result = "Пожалуйста проверьте поле 'Час'.";
        } else if (
          // * OR number [1-31] OR [1-31] - [1-31] OR [1-31] , [1-31]
          !input.day.match(
            /(^$)|(^\*(\/(3[01]|[12][0-9]|[1-9]))?$)|(^(3[01]|[12][0-9]|[1-9])$)|(^(3[01]|[12][0-9]|[1-9])-(3[01]|[12][0-9]|[1-9])(\/(3[01]|[12][0-9]|[1-9]))?$)|(^((3[01]|[12][0-9]|[1-9])((-(3[01]|[12][0-9]|[1-9])))?)(,((3[01]|[12][0-9]|[1-9])((-(3[01]|[12][0-9]|[1-9])))?))+(\/(3[01]|[12][0-9]|[1-9]))?$)/
          )
        ) {
          result = "Пожалуйста проверьте поле 'День'.";
        } else if (
          // * OR number [1-12] OR [1-12] - [1-12] OR [1-12] , [1-12]
          !input.month.match(
            /(^$)|(^\*(\/(1[0-2]|[1-9]))?$)|(^(1[0-2]|[1-9])$)|(^(1[0-2]|[1-9])-(1[0-2]|[1-9])(\/(1[0-2]|[1-9]))?$)|(^((1[0-2]|[1-9])((-(1[0-2]|[1-9])))?)(,((1[0-2]|[1-9])((-(1[0-2]|[1-9])))?))+(\/(1[0-2]|[1-9]))?$)/
          )
        ) {
          result = "Пожалуйста проверьте поле 'Месяц'.";
        } else if (
          // * OR number [0-7] OR [0-7] - [0-7] OR [0-7] , [0-7]
          !input.week.match(
            /(^$)|(^\*(\/[0-6])?$)|(^[0-6]$)|(^[0-6]-[0-6](\/[0-6])?$)|(^([0-6]((-[0-6]))?)(,([0-6]((-[0-6]))?))+(\/[0-6])?$)/
          )
        ) {
          result = "Пожалуйста проверьте поле 'Неделя'.";
        }
      } else {
        if (input.word === "") {
          result = "Пожалуйста проверьте поле 'Ключевое слово'.";
        }
      }
      return result;
    },
    addListItem: function (item) {
      // Show the list
      UICtrl.showList();
      // To table
      // Create tr element
      const tr = document.createElement("tr");
      // Add class
      tr.className = "collection-item";
      // Add id
      tr.id = `item-${item.id}`;
      // Add html
      tr.innerHTML = `
        <td>${item.name}</td>
        <td>${item.execute}</td>
        <td>${
          item.timeType === "keyword"
            ? item.word
            : item.minute +
              " " +
              item.hour +
              " " +
              item.day +
              " " +
              item.month +
              " " +
              item.week
        }</td>
        <td><a href="#" class="secondary-content">
          <i class="edit-item fa fa-pencil fa-lg"></i>
        </a></td>
        `;
      // Insert item
      document
        .querySelector(UISelectors.itemTableBody)
        .insertAdjacentElement("beforeend", tr);
    },
    updateListItem: function (updatedItem) {
      let itemToUpdate = document.querySelector(`#item-${updatedItem.id}`);
      itemToUpdate.innerHTML = `
        <strong>${updatedItem.name}: </strong> 
        <a href="#" class="secondary-content">
          <i class="edit-item fa fa-pencil fa-lg"></i>
        </a>`;
    },
    deleteListItem: function (id) {
      const itemId = `#item-${id}`;
      const item = document.querySelector(itemId);
      item.remove();
    },
    clearInput: function () {
      document.querySelector(UISelectors.itemNameInput).value = "";
      // document.querySelector(UISelectors.itemCaloriesInput).value = "";
      document.querySelector(UISelectors.minuteInput).value = "";
      document.querySelector(UISelectors.hourInput).value = "";
      document.querySelector(UISelectors.dayInput).value = "";
      document.querySelector(UISelectors.monthInput).value = "";
      document.querySelector(UISelectors.weekdayInput).value = "";
      document.querySelector(UISelectors.executeInput).value = "";
      document.querySelector(UISelectors.keywordInput).value = "";
      document.querySelector(UISelectors.timeType).checked = false;
      document.querySelector(UISelectors.minuteInputWrapper).style.display =
        "block";
      document.querySelector(UISelectors.hourInputWrapper).style.display =
        "block";
      document.querySelector(UISelectors.dayInputWrapper).style.display =
        "block";
      document.querySelector(UISelectors.monthInputWrapper).style.display =
        "block";
      document.querySelector(UISelectors.weekdayInputWrapper).style.display =
        "block";
      document.querySelector(UISelectors.keywordInputWrapper).style.display =
        "none";
      document.querySelector(UISelectors.searchInput).value = "";
    },
    addItemToForm: function (itemToAdd) {
      itemToAdd.name
        ? (document.querySelector(UISelectors.itemNameInput).value =
            itemToAdd.name)
        : "";
      document.querySelector(UISelectors.executeInput).value =
        itemToAdd.execute;
      document.querySelector(UISelectors.minuteInput).value =
        itemToAdd.data.minute;
      document.querySelector(UISelectors.hourInput).value = itemToAdd.data.hour;
      document.querySelector(UISelectors.dayInput).value = itemToAdd.data.day;
      document.querySelector(UISelectors.monthInput).value =
        itemToAdd.data.month;
      document.querySelector(UISelectors.weekdayInput).value =
        itemToAdd.data.week;

      // Change switch to correct position
      if (itemToAdd.data.word) {
        document.querySelector(UISelectors.timeType).checked = true;
        UICtrl.changeDateInputType();
      }
      document.querySelector(UISelectors.keywordInput).value = "";
      // Find a way to change currently selected element in MaterialzeCSS select
      // document.querySelector(UISelectors.keywordInput).value =
      //   itemToAdd.data.word;
      UICtrl.showEditState();
    },
    removeItems: function () {
      let listItems = document.querySelectorAll(UISelectors.collectionItem);
      // Turn node list into array
      listItems = Array.from(listItems);
      listItems.forEach(function (item) {
        item.remove();
      });
    },
    hideList: function () {
      document.querySelector(UISelectors.itemTable).style.display = "none";
      document.querySelector(UISelectors.searchInputWrapper).style.display =
        "none";
      document.querySelector(UISelectors.tablePlaceholder).style.display =
        "block";
    },
    showList: function () {
      document.querySelector(UISelectors.itemTable).style.display = "table";
      document.querySelector(UISelectors.searchInputWrapper).style.display =
        "block";

      document.querySelector(UISelectors.tablePlaceholder).style.display =
        "none";
    },
    clearEditState: function () {
      UICtrl.clearInput();
      document.querySelector(UISelectors.updateBtn).style.display = "none";
      document.querySelector(UISelectors.deleteBtn).style.display = "none";
      document.querySelector(UISelectors.backBtn).style.display = "none";
      document.querySelector(UISelectors.addBtn).style.display = "inline";

      document.querySelector(UISelectors.keywordInputWrapper).style.display =
        "none";
    },
    showEditState: function () {
      document.querySelector(UISelectors.updateBtn).style.display = "inline";
      document.querySelector(UISelectors.deleteBtn).style.display = "inline";
      document.querySelector(UISelectors.backBtn).style.display = "inline";
      document.querySelector(UISelectors.addBtn).style.display = "none";
    },
    getSelectors: function () {
      return UISelectors;
    },
    changeDateInputType: function (e) {
      const timeTypeState = document.querySelector(
        UISelectors.timeType
      ).checked;

      if (timeTypeState) {
        document.querySelector(UISelectors.minuteInputWrapper).style.display =
          "none";
        document.querySelector(UISelectors.hourInputWrapper).style.display =
          "none";
        document.querySelector(UISelectors.dayInputWrapper).style.display =
          "none";
        document.querySelector(UISelectors.monthInputWrapper).style.display =
          "none";
        document.querySelector(UISelectors.weekdayInputWrapper).style.display =
          "none";
        document.querySelector(UISelectors.keywordInputWrapper).style.display =
          "block";
        M.FormSelect.init(document.querySelectorAll(UISelectors.keywordInput));
      } else {
        document.querySelector(UISelectors.minuteInputWrapper).style.display =
          "block";
        document.querySelector(UISelectors.hourInputWrapper).style.display =
          "block";
        document.querySelector(UISelectors.dayInputWrapper).style.display =
          "block";
        document.querySelector(UISelectors.monthInputWrapper).style.display =
          "block";
        document.querySelector(UISelectors.weekdayInputWrapper).style.display =
          "block";
        document.querySelector(UISelectors.keywordInputWrapper).style.display =
          "none";
      }
      document.querySelector(UISelectors.minuteInput).value = "";
      document.querySelector(UISelectors.hourInput).value = "";
      document.querySelector(UISelectors.dayInput).value = "";
      document.querySelector(UISelectors.monthInput).value = "";
      document.querySelector(UISelectors.weekdayInput).value = "";
      document.querySelector(UISelectors.keywordInput).value = "";
    },
    showAlert(message, classes) {
      M.toast({ html: message, classes: classes });
    },
    clearSearchBar: function () {
      document.querySelector(UISelectors.searchInput).value = "";
      UICtrl.showAllListItems();
    },
    scrollToTop: function () {
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    },
    hideAllListItems: function () {
      let listItems = document.querySelectorAll(UISelectors.collectionItem);
      // Turn node list into array
      listItems = Array.from(listItems);
      listItems.forEach(function (item) {
        item.style.display = "none";
      });
    },
    showAllListItems: function () {
      let listItems = document.querySelectorAll(UISelectors.collectionItem);
      // Turn node list into array
      listItems = Array.from(listItems);
      listItems.forEach(function (item) {
        item.style.display = "table-row";
      });
    },
    hideListItem: function (id) {
      let listItem = document.querySelector(`#item-${id}`);
      listItem.style.display = "none";
    },
    showListItem: function (id) {
      let listItem = document.querySelector(`#item-${id}`);
      listItem.style.display = "table-row";
    },
  };
})();

// App Controller
const App = (function (ItemCtrl, UICtrl, StorageCtrl) {
  //Get UI Selectors
  const UISelectors = UICtrl.getSelectors();
  //Load event listeners
  const loadEventListeners = function () {
    //Add Item Event
    document
      .querySelector(UISelectors.addBtn)
      .addEventListener("click", itemAddSubmit);

    // Disable submit on Enter
    document.addEventListener("keypress", function (e) {
      if (e.key === "Enter" || e.which === 13) {
        e.preventDefault();
        return false;
      }
    });

    // Edit icon click event
    document
      .querySelector(UISelectors.itemTable)
      .addEventListener("click", itemEditClick);

    // Update item event
    document
      .querySelector(UISelectors.updateBtn)
      .addEventListener("click", itemUpdateSubmit);

    // Delete button event
    document
      .querySelector(UISelectors.deleteBtn)
      .addEventListener("click", itemDeleteSubmit);

    // Back button event
    document
      .querySelector(UISelectors.backBtn)
      .addEventListener("click", (e) => {
        UICtrl.clearEditState();
        e.preventDefault();
      });

    // Change date input type event
    document
      .querySelector(UISelectors.timeType)
      .addEventListener("change", (e) => {
        UICtrl.changeDateInputType();
        e.preventDefault();
      });

    // Clear the search bar event
    document
      .querySelector(UISelectors.clearSearch)
      .addEventListener("click", UICtrl.clearSearchBar);

    // Scroll top event
    document
      .querySelector(UISelectors.searchInput)
      .addEventListener("keyup", searchKeyUp);

    // Scroll top event
    document.querySelector(UISelectors.btnUp).addEventListener("click", (e) => {
      UICtrl.scrollToTop();
      e.preventDefault();
    });
  };

  const itemAddSubmit = function (e) {
    e.preventDefault();
    //Get form input from UI controller
    const input = UICtrl.getItemInput();

    // Either keyword should not be empty or
    let validationError = UICtrl.validateItemInput(input);

    if (!validationError) {
      // Add item to data structure
      // Sending item to server

      let newItem = ItemCtrl.createItem({
        name: input.name,
        execute: input.execute,
        data: {
          word: input.word,
          minute: input.minute,
          hour: input.hour,
          day: input.day,
          month: input.month,
          week: input.week,
        },
      });

      StorageCtrl.storeItem(newItem)
        .then((response) => {
          if (response.status === true) {
            // Clear all the existing items in the list
            UICtrl.removeItems();
            // Get all items from the server
            ItemCtrl.getItems()
              .then((items) => {
                UICtrl.showList();
                UICtrl.populateItemList(items);
                // Clear fields
                UICtrl.clearInput();
                UICtrl.showAlert("Новая задача добавлена.", "rounded green");
              })
              .catch((error) => {
                UICtrl.showAlert(
                  "Не удалось получить список задач с сервера.",
                  "rounded red"
                );
              });
          } else {
            throw new Error("Не удалось добавить задачу.");
          }
        })
        .catch(() => {
          // For test
          UICtrl.showAlert("Не удалось добавить задачу.", "rounded red");
        });
    } else {
      // Show alert from UICtrl
      UICtrl.showAlert(validationError, "rounded red");
    }

    e.preventDefault();
  };

  // Click edit item
  const itemEditClick = function (e) {
    if (e.target.classList.contains("edit-item")) {
      // Scroll to top
      UICtrl.scrollToTop();

      // Get list item id (item-0, item-1)
      const itemIdAttribute = e.target.closest(UISelectors.collectionItem).id;

      // Split into an array and get the actual id
      const itemId = parseInt(itemIdAttribute.split("-").slice(-1));

      // Get item
      const itemToEdit = ItemCtrl.getItemById(itemId);

      //Set current item
      currentItem = ItemCtrl.setCurrentItem(itemToEdit);

      // Clear input before showing edit state
      UICtrl.clearInput();
      // Show item in the forms
      UICtrl.addItemToForm(currentItem);
    }
    e.preventDefault();
  };

  const itemUpdateSubmit = function (e) {
    // Get item input
    const input = UICtrl.getItemInput();

    // Either keyword should not be empty or
    let validationError = UICtrl.validateItemInput(input);
    if (!validationError) {
      // Add item to data structure
      // Sending item to server
      const currentItem = ItemCtrl.getCurrentItem();

      const itemToUpdate = ItemCtrl.createItem({
        id: currentItem.id,
        name: input.name,
        execute: input.execute,
        data: {
          minute: input.minute,
          hour: input.hour,
          day: input.day,
          month: input.month,
          week: input.week,
          word: input.word,
        },
      });

      // const updatedItem = ItemCtrl.updateItem(itemToUpdate);

      StorageCtrl.updateItemStorage(itemToUpdate)
        .then((response) => {
          if (response.status === true) {
            UICtrl.removeItems();
            ItemCtrl.getItems()
              .then((items) => {
                UICtrl.populateItemList(items);
                // Clear fields
                UICtrl.clearInput();
                UICtrl.clearEditState();
                UICtrl.showAlert("Задача успешно обновлена.", "rounded green");
              })
              .catch((error) => {
                UICtrl.showAlert(
                  "Не удалось получить список задач с сервера.",
                  "rounded green"
                );
              });
          }
        })
        .catch((error) => {
          // For test
          UICtrl.showAlert("Не удалось обновить задачу.", "rounded red");
        });
    } else {
      // Show alert from UICtrl
      UICtrl.showAlert(validationError, "rounded red");
    }

    e.preventDefault();
  };

  // Delete button event
  const itemDeleteSubmit = function (e) {
    const currentItem = ItemCtrl.getCurrentItem();

    StorageCtrl.deleteItemFromStorage(currentItem.id)
      .then((response) => {
        if (response.status === true) {
          UICtrl.removeItems();
          ItemCtrl.getItems()
            .then((items) => {
              // Check if there are any items
              if (items.length === 0) {
                UICtrl.hideList();
              } else {
                // Populate list with items
                UICtrl.populateItemList(items);
              }
              UICtrl.clearInput();
              UICtrl.clearEditState();
              UICtrl.showAlert("Задача успешно удалена.", "rounded green");
            })
            .catch((error) => {
              UICtrl.showAlert(
                "Не удалось получить список задач с сервера.",
                "rounded red"
              );
            });
        }
      })
      .catch((error) => {
        UICtrl.showAlert("Не удалось удалить задачу.", "rounded red");
      });

    e.preventDefault();
  };

  const searchKeyUp = function (e) {
    let input = document.querySelector(UISelectors.searchInput).value;

    if (input === " ") {
      UICtrl.showAllListItems();
      return;
    }

    // Set is used to avoid repetition
    let result = new Set();
    let data = ItemCtrl.logData(); // REMOVE IF POSSIBLE

    // Check if an property of item matches the search string
    if (data.items) {
      data.items.forEach((item) => {
        if (item.name?.startsWith(input)) {
          result.add(item.id);
        } else if (item.execute.startsWith(input)) {
          result.add(item.id);
        } else if (item.data.word?.startsWith(input)) {
          result.add(item.id);
        }
      });
    }

    if (result.size !== 0) {
      UICtrl.hideAllListItems();
      result.forEach((id) => {
        UICtrl.showListItem(id);
      });
    }
    e.preventDefault();
  };

  return {
    init: function () {
      // set initial state
      UICtrl.clearEditState();

      // Fetch items from data structure
      ItemCtrl.getItems()
        .then((items) => {
          // Check if there are any items
          if (items.length === 0) {
            UICtrl.hideList();
          } else {
            // Populate list with items
            UICtrl.populateItemList(items);
          }
        })
        .catch((error) => {
          UICtrl.showAlert(
            "Не удалось загрузить список задач с сервера.",
            "rounded red"
          );
        });
      // Load event listeners
      loadEventListeners();
    },
  };
})(ItemCtrl, UICtrl, StorageCtrl);

// Initialize App
App.init();
